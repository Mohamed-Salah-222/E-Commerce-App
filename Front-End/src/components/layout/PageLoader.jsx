// Minimal loader for React.lazy Suspense fallback only.
// This shows during JS chunk downloads (milliseconds), not data fetching.
// Each page handles its own data-loading skeleton internally.

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );
}

export default PageLoader;
