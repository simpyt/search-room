import { getTheme } from '@/lib/theme';

export default function RoomLoading() {
  const hg = getTheme() === 'homegate';

  return (
    <div className={`min-h-screen flex flex-col ${hg ? 'bg-gray-50' : 'bg-slate-950'}`}>
      {/* Header skeleton */}
      <header
        className={`border-b sticky top-0 z-40 ${
          hg
            ? 'border-gray-200 bg-white/95 backdrop-blur-sm'
            : 'border-slate-800 bg-slate-900/50 backdrop-blur-xl'
        }`}
      >
        <div className="px-4 h-16 flex items-center gap-3">
          {/* Back + Room info */}
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded animate-pulse ${
                hg ? 'bg-gray-200' : 'bg-slate-700'
              }`}
            />
            <div
              className={`h-10 w-10 rounded-xl animate-pulse ${
                hg ? 'bg-gray-200' : 'bg-slate-700'
              }`}
            />
            <div className="space-y-1.5">
              <div
                className={`h-5 w-32 rounded animate-pulse ${
                  hg ? 'bg-gray-200' : 'bg-slate-700'
                }`}
              />
              <div
                className={`h-3 w-24 rounded animate-pulse ${
                  hg ? 'bg-gray-200' : 'bg-slate-700'
                }`}
              />
            </div>
          </div>

          <div className="flex-1" />

          {/* Members skeleton */}
          <div className="flex items-center gap-2">
            <div
              className={`h-7 w-7 rounded-full animate-pulse ${
                hg ? 'bg-gray-200' : 'bg-slate-700'
              }`}
            />
            <div
              className={`h-7 w-7 rounded-full animate-pulse ${
                hg ? 'bg-gray-200' : 'bg-slate-700'
              }`}
            />
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
              <div
                className={`h-12 w-72 rounded-2xl animate-pulse ${
                  hg ? 'bg-gray-100' : 'bg-slate-800/80'
                }`}
              />
            </div>

            {/* Content cards skeleton */}
            <div className="space-y-6">
              {/* Compatibility card */}
              <div
                className={`rounded-lg p-6 ${
                  hg ? 'bg-white border border-gray-200' : 'bg-slate-900/50 border border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`h-6 w-40 rounded animate-pulse ${
                      hg ? 'bg-gray-200' : 'bg-slate-700'
                    }`}
                  />
                  <div
                    className={`h-8 w-8 rounded animate-pulse ${
                      hg ? 'bg-gray-200' : 'bg-slate-700'
                    }`}
                  />
                </div>
                <div
                  className={`h-4 w-64 rounded animate-pulse ${
                    hg ? 'bg-gray-200' : 'bg-slate-700'
                  }`}
                />
              </div>

              {/* Criteria card */}
              <div
                className={`rounded-lg p-6 ${
                  hg ? 'bg-white border border-gray-200' : 'bg-slate-900/50 border border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2">
                    <div
                      className={`h-6 w-32 rounded animate-pulse ${
                        hg ? 'bg-gray-200' : 'bg-slate-700'
                      }`}
                    />
                    <div
                      className={`h-4 w-48 rounded animate-pulse ${
                        hg ? 'bg-gray-200' : 'bg-slate-700'
                      }`}
                    />
                  </div>
                  <div
                    className={`h-8 w-8 rounded animate-pulse ${
                      hg ? 'bg-gray-200' : 'bg-slate-700'
                    }`}
                  />
                </div>
              </div>

              {/* Favorites card */}
              <div
                className={`rounded-lg p-6 ${
                  hg ? 'bg-white border border-gray-200' : 'bg-slate-900/50 border border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2">
                    <div
                      className={`h-6 w-24 rounded animate-pulse ${
                        hg ? 'bg-gray-200' : 'bg-slate-700'
                      }`}
                    />
                    <div
                      className={`h-4 w-32 rounded animate-pulse ${
                        hg ? 'bg-gray-200' : 'bg-slate-700'
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-16 rounded animate-pulse ${
                        hg ? 'bg-gray-100' : 'bg-slate-800/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar skeleton (desktop) */}
        <aside
          className={`hidden md:flex w-[400px] border-l flex-col h-[calc(100vh-4rem)] sticky top-16 ${
            hg ? 'border-gray-200 bg-white' : 'border-slate-800 bg-slate-900/30'
          }`}
        >
          <div className={`px-4 py-3 border-b ${hg ? 'border-gray-200' : 'border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div
                  className={`h-5 w-28 rounded animate-pulse ${
                    hg ? 'bg-gray-200' : 'bg-slate-700'
                  }`}
                />
                <div
                  className={`h-3 w-20 rounded animate-pulse ${
                    hg ? 'bg-gray-200' : 'bg-slate-700'
                  }`}
                />
              </div>
              <div
                className={`h-8 w-24 rounded-full animate-pulse ${
                  hg ? 'bg-gray-200' : 'bg-slate-700'
                }`}
              />
            </div>
          </div>

          <div className="flex-1 px-4 py-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-16 rounded-lg animate-pulse ${
                  hg ? 'bg-gray-100' : 'bg-slate-800/50'
                }`}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
