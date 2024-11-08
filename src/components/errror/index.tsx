interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
      <div className="rounded-lg p-4 max-w-md">
        <h2 className="text-red-400 font-semibold mb-2">Error</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    </div>
  );
}
