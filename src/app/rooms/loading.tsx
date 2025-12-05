/**
 * Loading skeleton for /rooms page.
 * Uses CSS variables (via Tailwind) inherited from root layout to guarantee
 * theme consistency during streaming - no direct theme detection needed.
 */
export default function RoomsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl animate-pulse bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-32 rounded animate-pulse bg-muted" />
              <div className="h-4 w-24 rounded animate-pulse bg-muted" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-28 rounded-lg animate-pulse bg-muted" />
            <div className="h-10 w-10 rounded-full animate-pulse bg-muted" />
          </div>
        </div>

        {/* Room cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg p-6 bg-card border border-border"
            >
              <div className="space-y-4">
                {/* Title */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-3/4 rounded animate-pulse bg-muted" />
                    <div className="h-4 w-1/2 rounded animate-pulse bg-muted" />
                  </div>
                </div>

                {/* Members */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2].map((j) => (
                      <div
                        key={j}
                        className="h-8 w-8 rounded-full animate-pulse bg-muted"
                      />
                    ))}
                  </div>
                  <div className="h-4 w-16 rounded animate-pulse bg-muted" />
                </div>

                {/* Activity */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="h-3 w-24 rounded animate-pulse bg-muted" />
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full animate-pulse bg-muted" />
                      <div className="h-4 flex-1 rounded animate-pulse bg-muted" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
