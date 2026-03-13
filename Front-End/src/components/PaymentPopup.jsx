import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      letterSpacing: "0.025em",
      fontFamily: "system-ui, sans-serif",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#dc2626" },
  },
  hidePostalCode: true,
};

function PaymentForm({ onSuccess, onClose, cartTotal, discountedTotal, userAddress }) {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [lastCreatedAddress, setLastCreatedAddress] = useState(null);
  const [formData, setFormData] = useState({
    street: userAddress?.street || "",
    city: userAddress?.city || "",
    postalCode: userAddress?.postalCode || "",
    country: userAddress?.country || "",
    phone: userAddress?.phone || "",
  });

  useEffect(() => {
    if (userAddress && (userAddress.street || userAddress.city || userAddress.postalCode || userAddress.country || userAddress.phone)) {
      setHasUserInteracted(true);
    }
  }, [userAddress]);

  const createPaymentIntent = useCallback(
    async (addressData) => {
      if (isCreatingIntent) return;
      setIsCreatingIntent(true);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ shippingAddress: addressData }),
        });
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const data = await response.json();
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (err) {
        if (!err.message.includes("400")) {
          showNotification("Failed to initialize payment", "error");
        }
        setClientSecret("");
        setPaymentIntentId("");
        setLastCreatedAddress(null);
      } finally {
        setIsCreatingIntent(false);
      }
    },
    [token, showNotification, isCreatingIntent],
  );

  useEffect(() => {
    if (!hasUserInteracted) return;
    const { street, city, postalCode, country, phone } = formData;
    const hasComplete = street?.trim() && city?.trim() && postalCode?.trim() && country?.trim() && phone?.trim();

    if (!hasComplete) {
      setClientSecret("");
      setPaymentIntentId("");
      setLastCreatedAddress(null);
      return;
    }

    const addressString = JSON.stringify(formData);
    if (lastCreatedAddress === addressString && clientSecret) return;

    const timeoutId = setTimeout(() => {
      createPaymentIntent(formData);
      setLastCreatedAddress(addressString);
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [formData, createPaymentIntent, hasUserInteracted, lastCreatedAddress, clientSecret]);

  const handleInputChange = (e) => {
    if (!hasUserInteracted) setHasUserInteracted(true);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      showNotification("Payment system not ready", "error");
      return;
    }

    setProcessing(true);
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) {
        showNotification(result.error.message, "error");
        setProcessing(false);
        return;
      }

      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentIntentId, shippingAddress: formData }),
      });
      if (!orderResponse.ok) throw new Error("Failed to create order");

      const orderData = await orderResponse.json();
      showNotification("Order placed successfully!", "success");
      onSuccess(orderData);
    } catch {
      showNotification("Payment failed. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const isFormValid = formData.street && formData.city && formData.postalCode && formData.country && formData.phone;

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-colors";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            {cartTotal !== discountedTotal && (
              <div className="flex justify-between text-green-600 mb-1">
                <span>Discount</span>
                <span>-${(cartTotal - discountedTotal).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>${discountedTotal.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Shipping Address</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Street *</label>
                  <input type="text" name="street" value={formData.street} onChange={handleInputChange} autoComplete="street-address" className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} autoComplete="address-level2" className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Postal Code *</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} autoComplete="postal-code" className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Country *</label>
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange} autoComplete="country-name" className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} autoComplete="tel" className={inputClass} required />
                </div>
              </div>
            </div>

            {isFormValid && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Payment Details</p>
                {isCreatingIntent && (
                  <p className="text-xs text-blue-600 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Preparing payment...
                  </p>
                )}
                {clientSecret && !isCreatingIntent && <p className="text-xs text-green-600 mb-2">Payment ready</p>}
                <div className={`p-4 border border-gray-200 rounded-xl bg-gray-50 ${isCreatingIntent ? "opacity-50" : ""}`}>
                  <CardElement options={cardElementOptions} />
                </div>
              </div>
            )}

            <button type="submit" disabled={!stripe || processing || !isFormValid || !clientSecret || isCreatingIntent} className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {processing ? "Processing..." : isCreatingIntent ? "Preparing..." : `Pay $${discountedTotal.toFixed(2)}`}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
}

function PaymentPopup({ isOpen, onClose, onSuccess, cartTotal, discountedTotal, userAddress }) {
  if (!isOpen) return null;
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm onSuccess={onSuccess} onClose={onClose} cartTotal={cartTotal} discountedTotal={discountedTotal} userAddress={userAddress} />
    </Elements>
  );
}

export default PaymentPopup;
