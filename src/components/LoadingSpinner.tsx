export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-neutral-800 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
