import React from 'react';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  currentPath?: string;
}

export function Sidebar({ items, currentPath }: SidebarProps) {
  return (
    <nav className="sidebar">
      <ul className="sidebar-nav">
        {items.map((item) => (
          <li key={item.href} className={currentPath === item.href ? 'active' : ''}>
            <a href={item.href}>
              {item.icon && <span className="nav-icon">{item.icon}</span>}
              <span className="nav-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
