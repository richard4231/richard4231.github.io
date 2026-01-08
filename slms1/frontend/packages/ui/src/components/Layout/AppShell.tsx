import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export function AppShell({ children, sidebar, header }: AppShellProps) {
  return (
    <div className="app-shell">
      {header && <header className="app-header">{header}</header>}
      <div className="app-content">
        {sidebar && <aside className="app-sidebar">{sidebar}</aside>}
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
