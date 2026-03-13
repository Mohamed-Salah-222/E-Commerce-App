// Low-level skeleton primitive. Pages compose these into their own
// page-specific skeleton layouts that match their real content.
//
// Usage:
//   <Skeleton className="h-8 w-48" />           — a heading
//   <Skeleton className="h-4 w-full" />          — a line of text
//   <Skeleton className="h-64 rounded-2xl" />    — an image placeholder

function Skeleton({ className = "" }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />;
}

export default Skeleton;
