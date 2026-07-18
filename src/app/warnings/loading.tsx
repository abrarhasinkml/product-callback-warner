export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-8 bg-surface-800 rounded w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-800 rounded-xl h-24" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-surface-800 rounded-xl h-96" />
        <div className="bg-surface-800 rounded-xl h-96" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-800 rounded-xl h-32" />
        ))}
      </div>
    </div>
  );
}
