import Logo from './Logo';

export type NavView = 'home' | 'docs';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
}

function Navbar({ currentView, onNavigate }: NavbarProps) {
  const navItems = [
    { label: '首页', view: 'home' as const },
    { label: 'API 文档', view: 'docs' as const },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="flex items-center gap-8">
          <Logo />
          <ul className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => onNavigate(item.view)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition duration-150 ${
                    currentView === item.view
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="btn-ghost hidden sm:inline-flex"
            onClick={() => onNavigate('docs')}
          >
            帮助
          </button>
          <button className="btn-primary">登录</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
