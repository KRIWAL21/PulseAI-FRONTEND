import { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import ChatWindow from '../components/dashboard/ChatWindow';

/**
 * DashboardPage — Main application layout
 *
 * LAYOUT:
 * - Desktop: Fixed sidebar (260px) + flex chat area (remaining width)
 * - Mobile: Full-width chat + hamburger menu to open sidebar overlay
 *
 * This is a standard "app shell" layout pattern used by most SaaS apps.
 */
const DashboardPage = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile hamburger header */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
        >
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'var(--gradient-accent)' }}
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-sm gradient-text">PulseAI</span>
          </div>
        </div>

        <ChatWindow />
      </main>
    </div>
  );
};

export default DashboardPage;