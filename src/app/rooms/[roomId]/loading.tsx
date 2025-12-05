/**
 * Loading skeleton for /rooms/[roomId] page.
 * Uses CSS variables (via Tailwind) inherited from root layout to guarantee
 * theme consistency during streaming - no direct theme detection needed.
 */
export default function RoomLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header skeleton */}
      <header className="border-b border-border sticky top-0 z-40 bg-card/95 backdrop-blur-sm">
        <div className="px-4 h-16 flex items-center gap-3">
          {/* Back + Room info */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded animate-pulse bg-muted" />
            <div className="h-10 w-10 rounded-xl animate-pulse bg-muted" />
            <div className="space-y-1.5">
              <div className="h-5 w-32 rounded animate-pulse bg-muted" />
              <div className="h-3 w-24 rounded animate-pulse bg-muted" />
            </div>
          </div>

          <div className="flex-1" />

          {/* Members skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full animate-pulse bg-muted" />
            <div className="h-7 w-7 rounded-full animate-pulse bg-muted" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Main area */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {/* Tab switcher skeleton */}
            <div className="flex justify-center mb-8">
              <div className="h-12 w-72 rounded-2xl animate-pulse bg-muted" />
            </div>

            {/* Content cards skeleton */}
            <div className="space-y-6">
              {/* Compatibility card */}
              <div className="rounded-lg p-6 bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-40 rounded animate-pulse bg-muted" />
                  <div className="h-8 w-8 rounded animate-pulse bg-muted" />
                </div>
                <div className="h-4 w-64 rounded animate-pulse bg-muted" />
              </div>

              {/* Criteria card */}
              <div className="rounded-lg p-6 bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2">
                    <div className="h-6 w-32 rounded animate-pulse bg-muted" />
                    <div className="h-4 w-48 rounded animate-pulse bg-muted" />
                  </div>
                  <div className="h-8 w-8 rounded animate-pulse bg-muted" />
                </div>
              </div>

              {/* Favorites card */}
              <div className="rounded-lg p-6 bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2">
                    <div className="h-6 w-24 rounded animate-pulse bg-muted" />
                    <div className="h-4 w-32 rounded animate-pulse bg-muted" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded animate-pulse bg-muted" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar skeleton (desktop) */}
        <aside className="hidden md:flex w-[400px] border-l border-border flex-col h-[calc(100vh-4rem)] sticky top-16 bg-card">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-5 w-28 rounded animate-pulse bg-muted" />
                <div className="h-3 w-20 rounded animate-pulse bg-muted" />
              </div>
              <div className="h-8 w-24 rounded-full animate-pulse bg-muted" />
            </div>
          </div>

          <div className="flex-1 px-4 py-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg animate-pulse bg-muted" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
