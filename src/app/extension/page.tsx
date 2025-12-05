'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { isHomegateTheme } from '@/lib/theme';

export default function ExtensionPage() {
  const router = useRouter();
  const hg = isHomegateTheme();

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

      <div className="relative container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/rooms')}
            className={hg ? 'text-gray-600 hover:text-gray-900' : 'text-slate-400 hover:text-white'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 mr-2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Rooms
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-lg ${
              hg
                ? 'bg-[#e5007d] shadow-[#e5007d]/25'
                : 'bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sky-500/25'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-white"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${hg ? 'text-gray-900' : 'text-white'}`}>
              Browser Extension
            </h1>
            <p className={hg ? 'text-gray-500' : 'text-slate-400'}>
              Save listings from any real estate website
            </p>
          </div>
        </div>

        {/* Download Section */}
        <Card
          className={`mb-8 ${
            hg
              ? 'border-gray-200 bg-white'
              : 'border-slate-700/50 bg-slate-900/50'
          }`}
        >
          <CardHeader>
            <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>
              Download & Install
            </CardTitle>
            <CardDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
              Chrome extension for saving property listings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button
                asChild
                size="lg"
                className={
                  hg
                    ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
                    : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white'
                }
              >
                <a href="/downloads/search-room-extension.zip" download>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 mr-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  Download Extension
                </a>
              </Button>
              <span className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                Requires Chrome 116+
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Installation Steps */}
        <Card
          className={`mb-8 ${
            hg
              ? 'border-gray-200 bg-white'
              : 'border-slate-700/50 bg-slate-900/50'
          }`}
        >
          <CardHeader>
            <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>
              Installation Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className={`space-y-6 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
              <li className="flex gap-4">
                <span
                  className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    hg ? 'bg-[#e5007d]/10 text-[#e5007d]' : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  1
                </span>
                <div>
                  <h3 className={`font-semibold mb-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
                    Extract the ZIP
                  </h3>
                  <p className={hg ? 'text-gray-600' : 'text-slate-400'}>
                    Unzip the downloaded file to a folder on your computer. Remember where you extracted it.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span
                  className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    hg ? 'bg-[#e5007d]/10 text-[#e5007d]' : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  2
                </span>
                <div>
                  <h3 className={`font-semibold mb-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
                    Open Chrome Extensions
                  </h3>
                  <p className={hg ? 'text-gray-600' : 'text-slate-400'}>
                    Type{' '}
                    <code
                      className={`px-1.5 py-0.5 rounded text-sm ${
                        hg ? 'bg-gray-100 text-gray-800' : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      chrome://extensions
                    </code>{' '}
                    in your address bar and press Enter.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span
                  className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    hg ? 'bg-[#e5007d]/10 text-[#e5007d]' : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  3
                </span>
                <div>
                  <h3 className={`font-semibold mb-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
                    Enable Developer Mode
                  </h3>
                  <p className={hg ? 'text-gray-600' : 'text-slate-400'}>
                    Toggle <strong>Developer mode</strong> ON in the top right corner of the extensions page.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span
                  className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    hg ? 'bg-[#e5007d]/10 text-[#e5007d]' : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  4
                </span>
                <div>
                  <h3 className={`font-semibold mb-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
                    Load the Extension
                  </h3>
                  <p className={hg ? 'text-gray-600' : 'text-slate-400'}>
                    Click <strong>Load unpacked</strong>, navigate to the extracted folder, and select it.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span
                  className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    hg ? 'bg-[#e5007d]/10 text-[#e5007d]' : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  5
                </span>
                <div>
                  <h3 className={`font-semibold mb-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
                    Pin the Extension
                  </h3>
                  <p className={hg ? 'text-gray-600' : 'text-slate-400'}>
                    Click the puzzle piece icon in Chrome toolbar, find &quot;Search Room&quot;, and click the pin icon.
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card
          className={`mb-8 ${
            hg
              ? 'border-gray-200 bg-white'
              : 'border-slate-700/50 bg-slate-900/50'
          }`}
        >
          <CardHeader>
            <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className={`space-y-4 ${hg ? 'text-gray-700' : 'text-slate-300'}`}>
              <li className="flex items-start gap-3">
                <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>1.</span>
                <span>
                  <strong className={hg ? 'text-gray-900' : 'text-white'}>Log in</strong> to Search Room first
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>2.</span>
                <span>
                  <strong className={hg ? 'text-gray-900' : 'text-white'}>Browse</strong> any property listing (Homegate, ImmoScout24, etc.)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>3.</span>
                <span>
                  <strong className={hg ? 'text-gray-900' : 'text-white'}>Click</strong> the Search Room extension icon
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>4.</span>
                <span>
                  <strong className={hg ? 'text-gray-900' : 'text-white'}>Wait</strong> for AI to parse the listing (~2-3 seconds)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className={hg ? 'text-[#e5007d]' : 'text-sky-400'}>5.</span>
                <span>
                  <strong className={hg ? 'text-gray-900' : 'text-white'}>Select</strong> a room and click <strong>Add Listing</strong>
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Supported Sites */}
        <Card
          className={`mb-8 ${
            hg
              ? 'border-gray-200 bg-white'
              : 'border-slate-700/50 bg-slate-900/50'
          }`}
        >
          <CardHeader>
            <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>
              Supported Websites
            </CardTitle>
            <CardDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
              Works on any real estate website. Tested with:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                'Homegate.ch',
                'ImmoScout24.ch',
                'Anibis.ch',
                'Facebook Marketplace',
                'Ricardo.ch',
                'Comparis.ch',
              ].map((site) => (
                <div
                  key={site}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    hg ? 'bg-gray-50' : 'bg-slate-800/50'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 ${hg ? 'text-green-600' : 'text-green-400'}`}
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className={hg ? 'text-gray-700' : 'text-slate-300'}>{site}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card
          className={`${
            hg
              ? 'border-gray-200 bg-white'
              : 'border-slate-700/50 bg-slate-900/50'
          }`}
        >
          <CardHeader>
            <CardTitle className={hg ? 'text-gray-900' : 'text-white'}>
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                q: '"Please log in to Search Room first"',
                a: 'You\'re not logged in. Open Search Room and sign in, then try again.',
              },
              {
                q: '"No rooms found"',
                a: 'Create a room in Search Room first before saving listings.',
              },
              {
                q: '"Couldn\'t extract listing data"',
                a: 'Make sure you\'re on a specific listing page, not a search results page.',
              },
              {
                q: 'Extension not appearing in toolbar',
                a: 'Go to chrome://extensions, make sure it\'s enabled, then pin it via the puzzle piece icon.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg ${
                  hg ? 'bg-gray-50' : 'bg-slate-800/50'
                }`}
              >
                <h4 className={`font-medium mb-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
                  {item.q}
                </h4>
                <p className={`text-sm ${hg ? 'text-gray-600' : 'text-slate-400'}`}>
                  {item.a}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
