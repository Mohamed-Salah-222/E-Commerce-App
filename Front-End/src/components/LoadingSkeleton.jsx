function LoadingSkeleton({ variant = "page" }) {
  const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent";

  if (variant === "card") {
    return (
      <div className="rounded-2xl bg-gray-100 p-4 space-y-3">
        <div className={`h-48 rounded-xl bg-gray-200 ${shimmer}`} />
        <div className={`h-4 w-3/4 rounded bg-gray-200 ${shimmer}`} />
        <div className={`h-4 w-1/2 rounded bg-gray-200 ${shimmer}`} />
        <div className={`h-8 w-1/3 rounded-lg bg-gray-200 ${shimmer}`} />
      </div>
    );
  }

  if (variant === "product-grid") {
    return (
      <div className="space-y-8">
        {/* Search/filter bar skeleton */}
        <div className="flex gap-4">
          <div className={`h-11 flex-1 max-w-md rounded-xl bg-gray-200 ${shimmer}`} />
          <div className={`h-11 w-32 rounded-xl bg-gray-200 ${shimmer}`} />
        </div>
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "product-detail") {
    return (
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className={`aspect-square rounded-2xl bg-gray-200 ${shimmer}`} />
        <div className="space-y-4 py-4">
          <div className={`h-8 w-3/4 rounded bg-gray-200 ${shimmer}`} />
          <div className={`h-6 w-1/4 rounded bg-gray-200 ${shimmer}`} />
          <div className="space-y-2 pt-4">
            <div className={`h-4 w-full rounded bg-gray-200 ${shimmer}`} />
            <div className={`h-4 w-full rounded bg-gray-200 ${shimmer}`} />
            <div className={`h-4 w-2/3 rounded bg-gray-200 ${shimmer}`} />
          </div>
          <div className={`h-12 w-40 rounded-xl bg-gray-200 mt-6 ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-3">
        <div className={`h-12 rounded-xl bg-gray-200 ${shimmer}`} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-16 rounded-xl bg-gray-100 ${shimmer}`} />
        ))}
      </div>
    );
  }

  // Default: full page skeleton
  return (
    <div className="space-y-6 animate-pulse">
      <div className={`h-8 w-64 rounded-lg bg-gray-200 ${shimmer}`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-100 p-4 space-y-3">
            <div className={`h-40 rounded-xl bg-gray-200 ${shimmer}`} />
            <div className={`h-4 w-3/4 rounded bg-gray-200 ${shimmer}`} />
            <div className={`h-4 w-1/2 rounded bg-gray-200 ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;
