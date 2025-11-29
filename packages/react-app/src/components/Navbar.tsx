import Logo from './Logo';

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { label: '首页', href: '#', active: true },
  { label: '文件管理', href: '#files' },
  { label: '设置', href: '#settings' },
];

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="flex items-center gap-8">
          <Logo />
          <ul className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition duration-150 ${
                    item.active
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-ghost hidden sm:inline-flex">帮助</button>
          <button className="btn-primary">登录</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
