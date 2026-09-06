import './Hero.css';

function Hero() {
  const handleClick = (e) => {
    e.preventDefault();
    const target = document.querySelector('#builder');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero">
      <div className="hero__content">
        <h1 className="hero__title">Сладкая Мечта</h1>
        <p className="hero__subtitle">
          Авторские торты ручной работы с любовью к каждой детали
        </p>
        <a href="#builder" className="btn btn--primary" onClick={handleClick}>
          Собери свой торт
        </a>
      </div>
    </section>
  );
}

export default Hero;
