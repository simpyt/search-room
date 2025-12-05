import { getTheme } from '@/lib/theme';

export default function RoomsLoading() {
  const hg = getTheme() === 'homegate';

  return (
    <div
      className={`min-h-screen ${
        hg
          ? 'bg-gradient-to-br from-[#ffe6f4] via-white to-[#ffe6f4]'
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      }`}
    >
      {!hg && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />
      )}

      <div className="relative container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`h-12 w-12 rounded-xl animate-pulse ${
                hg ? 'bg-gray-200' : 'bg-slate-700'
              }`}
            />
            <div className="space-y-2">
              <div
                className={`h-6 w-32 rounded animate-pulse ${
                  hg ? 'bg-gray-200' : 'bg-slate-700'
                }`}
              />
              <div
                className={`h-4 w-24 rounded animate-pulse ${
                  hg ? 'bg-gray-200' : 'bg-slate-700'
                }`}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-28 rounded-lg animate-pulse ${
                hg ? 'bg-gray-200' : 'bg-slate-700'
              }`}
            />
            <div
              className={`h-10 w-10 rounded-full animate-pulse ${
                hg ? 'bg-gray-200' : 'bg-slate-700'
              }`}
            />
          </div>
        </div>

        {/* Room cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-lg p-6 ${
                hg ? 'bg-white border border-gray-200' : 'bg-slate-900/50 border border-slate-700/50'
              }`}
            >
              <div className="space-y-4">
                {/* Title */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div
                      className={`h-5 w-3/4 rounded animate-pulse ${
                        hg ? 'bg-gray-200' : 'bg-slate-700'
                      }`}
                    />
                    <div
                      className={`h-4 w-1/2 rounded animate-pulse ${
                        hg ? 'bg-gray-200' : 'bg-slate-700'
                      }`}
                    />
                  </div>
                </div>

                {/* Members */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2].map((j) => (
                      <div
                        key={j}
                        className={`h-8 w-8 rounded-full animate-pulse ${
                          hg ? 'bg-gray-200' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div
                    className={`h-4 w-16 rounded animate-pulse ${
                      hg ? 'bg-gray-200' : 'bg-slate-700'
                    }`}
                  />
                </div>

                {/* Activity */}
                <div
                  className={`pt-3 border-t space-y-2 ${
                    hg ? 'border-gray-100' : 'border-slate-800'
                  }`}
                >
                  <div
                    className={`h-3 w-24 rounded animate-pulse ${
                      hg ? 'bg-gray-200' : 'bg-slate-700'
                    }`}
                  />
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div
                        className={`h-5 w-5 rounded-full animate-pulse ${
                          hg ? 'bg-gray-200' : 'bg-slate-700'
                        }`}
                      />
                      <div
                        className={`h-4 flex-1 rounded animate-pulse ${
                          hg ? 'bg-gray-200' : 'bg-slate-700'
                        }`}
                      />
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
