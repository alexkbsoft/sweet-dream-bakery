import './Header.css';

const navLinks = [
  { href: '#hero', label: 'Главная' },
  { href: '#gallery', label: 'Галерея' },
  { href: '#builder', label: 'Собери свой торт' },
  { href: '#about', label: 'О нас' },
  { href: '#contact', label: 'Контакты' },
];

function Header() {
  const handleNavClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav__logo">🎂 Сладкая Мечта</div>
        <ul className="nav__menu">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={(e) => handleNavClick(e, link.href)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button className="nav__burger" aria-label="Меню">☰</button>
      </nav>
    </header>
  );
}

export default Header;
