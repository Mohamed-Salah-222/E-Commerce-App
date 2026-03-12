import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex items-center justify-center -m-4 md:-m-8 px-4" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gray-50">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gray-200/50 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Footer (links below card) */}
        {footer && <p className="text-center text-sm text-gray-500 mt-6">{footer}</p>}
      </div>
    </div>
  );
}

// Reusable link for footer
AuthLayout.FooterLink = function FooterLink({ to, label, linkText }) {
  return (
    <>
      {label}{" "}
      <Link to={to} className="font-semibold text-gray-900 hover:underline">
        {linkText}
      </Link>
    </>
  );
};

export default AuthLayout;
