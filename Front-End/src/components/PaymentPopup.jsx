import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card element styling with enhanced options to reduce browser warnings
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      letterSpacing: "0.025em",
      fontFamily: "Source Code Pro, monospace",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
  hidePostalCode: true, // This reduces some autofill warnings
  iconStyle: "solid",
};

// Payment Form Component (inside Elements wrapper)
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

  // Check if form is pre-filled with user address
  useEffect(() => {
    const isPreFilled = userAddress && (userAddress.street || userAddress.city || userAddress.postalCode || userAddress.country || userAddress.phone);
    if (isPreFilled) {
      setHasUserInteracted(true);
    }
  }, [userAddress]);

  // Debounced function to create payment intent
  const createPaymentIntent = useCallback(
    async (addressData) => {
      if (isCreatingIntent) return; // Prevent multiple calls

      setIsCreatingIntent(true);

      try {
        console.log("Creating payment intent with:", addressData);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-payment-intent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shippingAddress: addressData,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Payment intent error:", response.status, errorText);

          // Only show notification for actual server errors, not validation errors
          if (response.status >= 500) {
            showNotification("Failed to initialize payment", "error");
          }
          throw new Error(`Failed to create payment intent: ${response.status}`);
        }

        const data = await response.json();
        console.log("Payment intent created successfully:", data);
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (error) {
        console.error("Payment intent error:", error);

        // Only show error notification if it's not a network/validation issue
        if (!error.message.includes("400") && !error.message.includes("Failed to fetch")) {
          showNotification("Failed to initialize payment", "error");
        }

        // Clear any existing client secret on error
        setClientSecret("");
        setPaymentIntentId("");
        setLastCreatedAddress(null);
      } finally {
        setIsCreatingIntent(false);
      }
    },
    [token, showNotification, isCreatingIntent]
  );

  // Only create payment intent when user has interacted and form is complete
  useEffect(() => {
    // Don't run if user hasn't started filling the form
    if (!hasUserInteracted) {
      return;
    }

    const hasCompleteAddress = formData.street && formData.city && formData.postalCode && formData.country && formData.phone;

    if (!hasCompleteAddress) {
      // Clear payment intent if form becomes incomplete
      setClientSecret("");
      setPaymentIntentId("");
      setLastCreatedAddress(null);
      return;
    }

    // Only proceed if form has actual values (not just whitespace)
    const hasActualData = formData.street.trim() && formData.city.trim() && formData.postalCode.trim() && formData.country.trim() && formData.phone.trim();

    if (!hasActualData) {
      return;
    }

    // Check if we already created a payment intent for this exact address
    const addressString = JSON.stringify(formData);
    if (lastCreatedAddress === addressString && clientSecret) {
      return; // Don't recreate if address hasn't changed
    }

    // Debounce the API call - wait 1.5 seconds after user stops typing
    const timeoutId = setTimeout(() => {
      createPaymentIntent(formData);
      setLastCreatedAddress(addressString);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [formData, createPaymentIntent, hasUserInteracted, lastCreatedAddress, clientSecret]);

  const handleInputChange = (e) => {
    // Mark that user has started interacting with the form
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      showNotification("Payment system not ready", "error");
      return;
    }

    setProcessing(true);

    try {
      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        showNotification(result.error.message, "error");
        setProcessing(false);
        return;
      }

      // Payment successful, now create the order
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/confirm-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentIntentId,
          shippingAddress: formData,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();
      showNotification("Order placed successfully!", "success");
      onSuccess(orderData);
    } catch (error) {
      console.error("Payment error:", error);
      showNotification("Payment failed. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const isFormValid = formData.street && formData.city && formData.postalCode && formData.country && formData.phone;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Complete Payment</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
              ×
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              {cartTotal !== discountedTotal && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${(cartTotal - discountedTotal).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${discountedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input type="text" name="street" value={formData.street} onChange={handleInputChange} autoComplete="street-address" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} autoComplete="address-level2" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} autoComplete="postal-code" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange} autoComplete="country-name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} autoComplete="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
              </div>
            </div>

            {/* Payment Status Indicator */}
            {isFormValid && (
              <div>
                {isCreatingIntent && (
                  <div className="text-center text-blue-600 mb-4 flex items-center justify-center">
                    <div className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent rounded-full mr-2"></div>
                    <span>Preparing payment...</span>
                  </div>
                )}

                {clientSecret && !isCreatingIntent && (
                  <div className="text-center text-green-600 mb-4 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Payment ready</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment Details - Always show when form is valid */}
            {isFormValid && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                <div
                  className={`p-4 border border-gray-300 rounded-lg ${isCreatingIntent ? "bg-gray-100 opacity-50" : "bg-gray-50"}`}
                  style={{
                    /* Hide browser autofill warnings */
                    position: "relative",
                  }}
                >
                  <CardElement options={cardElementOptions} />
                </div>
                {isCreatingIntent && <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your payment...</p>}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" disabled={!stripe || processing || !isFormValid || !clientSecret || isCreatingIntent} className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {processing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isCreatingIntent ? (
                "Preparing..."
              ) : (
                `Pay $${discountedTotal.toFixed(2)}`
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your payment information is secure and encrypted
          </div>
        </div>
      </div>

      {/* CSS to hide browser autofill warnings */}
      <style jsx>{`
        /* Hide browser autofill warning tooltips */
        input:-webkit-autofill:hover::after,
        input[autocomplete]:hover::after {
          display: none !important;
          content: none !important;
        }

        /* Remove red validation tooltips */
        input:invalid {
          box-shadow: none;
        }

        /* Prevent browser validation bubbles */
        input:invalid:focus {
          outline: none;
        }

        /* Hide Stripe Elements autofill warnings */
        .StripeElement {
          position: relative;
        }

        .StripeElement::after {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

// Main Payment Popup Component
function PaymentPopup({ isOpen, onClose, onSuccess, cartTotal, discountedTotal, userAddress }) {
  if (!isOpen) return null;

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm onSuccess={onSuccess} onClose={onClose} cartTotal={cartTotal} discountedTotal={discountedTotal} userAddress={userAddress} />
    </Elements>
  );
}

export default PaymentPopup;
