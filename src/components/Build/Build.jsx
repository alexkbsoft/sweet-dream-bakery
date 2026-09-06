import { useState, useMemo } from 'react';
import './Build.css';
import {
  bases,
  fillings,
  creams,
  decors,
  prices,
  names,
  colors,
} from '../../data/cakes';

function OptionCard({ inputProps, children }) {
  return (
    <label className="option-card">
      <input {...inputProps} />
      <span className="option-card__emoji">{children[0]}</span>
      <span className="option-card__label">{children[1]}</span>
    </label>
  );
}

function Build() {
  const [base, setBase] = useState('vanilla');
  const [cream, setCream] = useState('butter');
  const [fillings, setFillings] = useState([]);
  const [decors, setDecors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const toggleFilling = (value) => {
    setFillings((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  const toggleDecor = (value) => {
    setDecors((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const totalPrice = useMemo(() => {
    let total = prices.base[base] + prices.cream[cream];
    fillings.forEach((f) => (total += prices.filling[f]));
    decors.forEach((d) => (total += prices.decor[d]));
    return total;
  }, [base, cream, fillings, decors]);

  const handleOrder = () => {
    setShowModal(true);
    setSubmitStatus(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', phone: '' });
    setSubmitStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          base,
          cream,
          fillings,
          decors,
          price: totalPrice,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Спасибо за сообщение! Мы свяжемся с вами в ближайшее время.');
    e.target.reset();
  };

  return (
    <div className="build-page">
      <section id="builder" className="section builder">
        <h2 className="section__title">Собери свой торт</h2>
        <p className="section__subtitle">
          Выбирай ингредиенты и создай торт своей мечты!
        </p>

        <div className="builder__container">
          <div className="builder__ingredients">
            <div className="builder__category">
              <h3>1. Основа</h3>
              <div className="builder__options">
                {bases.map((item) => (
                  <OptionCard
                    key={item.value}
                    inputProps={{
                      type: 'radio',
                      name: 'base',
                      value: item.value,
                      checked: base === item.value,
                      onChange: () => setBase(item.value),
                    }}
                  >
                    {item.emoji}
                    {item.label}
                  </OptionCard>
                ))}
              </div>
            </div>

            <div className="builder__category">
              <h3>2. Начинка</h3>
              <div className="builder__options">
                {fillings.map((item) => (
                  <OptionCard
                    key={item.value}
                    inputProps={{
                      type: 'checkbox',
                      name: 'filling',
                      value: item.value,
                      checked: fillings.includes(item.value),
                      onChange: () => toggleFilling(item.value),
                    }}
                  >
                    {item.emoji}
                    {item.label}
                  </OptionCard>
                ))}
              </div>
            </div>

            <div className="builder__category">
              <h3>3. Крем</h3>
              <div className="builder__options">
                {creams.map((item) => (
                  <OptionCard
                    key={item.value}
                    inputProps={{
                      type: 'radio',
                      name: 'cream',
                      value: item.value,
                      checked: cream === item.value,
                      onChange: () => setCream(item.value),
                    }}
                  >
                    {item.emoji}
                    {item.label}
                  </OptionCard>
                ))}
              </div>
            </div>

            <div className="builder__category">
              <h3>4. Декор</h3>
              <div className="builder__options">
                {decors.map((item) => (
                  <OptionCard
                    key={item.value}
                    inputProps={{
                      type: 'checkbox',
                      name: 'decor',
                      value: item.value,
                      checked: decors.includes(item.value),
                      onChange: () => toggleDecor(item.value),
                    }}
                  >
                    {item.emoji}
                    {item.label}
                  </OptionCard>
                ))}
              </div>
            </div>
          </div>

          <div className="builder__preview">
            <div className="cake-preview">
              <div
                className="cake-preview__base"
                style={{ background: colors.base[base] }}
              />
              <div
                className="cake-preview__cream"
                style={{ background: colors.cream[cream] }}
              />
              <div
                className="cake-preview__filling"
                style={{
                  display: fillings.length > 0 ? 'block' : 'none',
                  background: fillings.length > 0 ? colors.filling[fillings[0]] : 'transparent',
                }}
              />
              <div
                className="cake-preview__decor"
                style={{ display: decors.length > 0 ? 'block' : 'none' }}
              >
                {decors.map((d) => colors.decorEmojis[d]).join(' ')}
              </div>
            </div>

            <div className="cake-preview__info">
              <h3>Ваш торт:</h3>
              <ul className="cake-preview__list">
                <li>{names.base[base]}</li>
                <li>{names.cream[cream]}</li>
                {fillings.map((f) => (
                  <li key={f}>{names.filling[f]}</li>
                ))}
                {decors.map((d) => (
                  <li key={d}>{names.decor[d]}</li>
                ))}
              </ul>
              <div className="cake-preview__price">
                Итого: <span>{totalPrice}</span> ₽
              </div>
              <button className="btn btn--primary btn--large" onClick={handleOrder}>
                Заказать торт
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section about">
        <h2 className="section__title">О нашей кондитерской</h2>
        <div className="about__content">
          <div className="about__text">
            <p>
              «Сладкая Мечта» — это семейная кондитерская, где каждый торт
              создаётся с душой и вниманием к деталям. Мы используем только
              натуральные ингредиенты: настоящее сливочное масло, свежие ягоды,
              бельгийский шоколад и фермерские сливки.
            </p>
            <p>
              Наша команда из 5 кондитеров с опытом более 15 лет создаёт не
              просто десерты — мы создаём праздники. Каждый торт — это маленькое
              произведение искусства, которое станет украшением вашего
              торжества.
            </p>
          </div>
          <div className="about__stats">
            <div className="stat-card">
              <span className="stat-card__number">10+</span>
              <span className="stat-card__label">Лет опыта</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__number">5000+</span>
              <span className="stat-card__label">Тортов создано</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__number">100%</span>
              <span className="stat-card__label">Натуральные ингредиенты</span>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="section contact">
        <h2 className="section__title">Свяжитесь с нами</h2>
        <div className="contact__content">
          <div className="contact__info">
            <div className="contact__item">
              <span className="contact__icon">📍</span>
              <div>
                <h4>Адрес</h4>
                <p>ул. Сладкая, 42, Москва</p>
              </div>
            </div>
            <div className="contact__item">
              <span className="contact__icon">📞</span>
              <div>
                <h4>Телефон</h4>
                <p>+7 (999) 123-45-67</p>
              </div>
            </div>
            <div className="contact__item">
              <span className="contact__icon">🕐</span>
              <div>
                <h4>Часы работы</h4>
                <p>Пн-Вс: 9:00 — 21:00</p>
              </div>
            </div>
          </div>
          <form className="contact__form" onSubmit={handleContactSubmit}>
            <input type="text" placeholder="Ваше имя" required />
            <input type="tel" placeholder="Телефон" required />
            <textarea
              placeholder="Ваше сообщение или пожелания к торту"
              rows="5"
            />
            <button type="submit" className="btn btn--primary">
              Отправить
            </button>
          </form>
        </div>
      </section>

      {/* Order Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={closeModal}>
              ✕
            </button>
            <h3 className="modal__title">Оформление заказа</h3>
            <p className="modal__subtitle">
              Торт: {names.base[base]} + {names.cream[cream]}
              {fillings.length > 0 && ` + ${fillings.map((f) => names.filling[f]).join(', ')}`}
              {decors.length > 0 && ` + ${decors.map((d) => names.decor[d]).join(', ')}`}
            </p>
            <p className="modal__price">Итого: {totalPrice} ₽</p>

            {submitStatus === 'success' ? (
              <div className="modal__success">
                <span className="modal__success-icon">✅</span>
                <p>Заказ #{Date.now().toString().slice(-6)} успешно отправлен!</p>
                <p className="modal__success-note">Мы свяжемся с вами в ближайшее время.</p>
              </div>
            ) : (
              <form className="modal__form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Телефон"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <button
                  type="submit"
                  className="btn btn--primary btn--large"
                  disabled={submitting}
                >
                  {submitting ? 'Отправка...' : 'Подтвердить заказ'}
                </button>
              </form>
            )}

            {submitStatus === 'error' && (
              <p className="modal__error">Ошибка при отправке. Попробуйте ещё раз.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Build;
