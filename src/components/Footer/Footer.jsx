import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p>© 2025 Сладкая Мечта. Все права защищены.</p>
      <div className="footer__socials">
        <a href="#" aria-label="Instagram">
          📷
        </a>
        <a href="#" aria-label="Telegram">
          ✈️
        </a>
        <a href="#" aria-label="WhatsApp">
          💬
        </a>
      </div>
      <a href="#admin" className="footer__admin">
        🔐 Админка
      </a>
    </footer>
  );
}

export default Footer;
