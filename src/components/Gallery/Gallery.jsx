import './Gallery.css';
import { galleryItems } from '../../data/cakes';

function Gallery() {
  return (
    <section id="gallery" className="section gallery">
      <h2 className="section__title">Наши шедевры</h2>
      <div className="gallery__grid">
        {galleryItems.map((item, index) => (
          <div className="gallery__card" key={index}>
            <div
              className="gallery__image"
              style={{ background: item.gradient }}
            >
              <span className="gallery__emoji">{item.emoji}</span>
            </div>
            <h3 className="gallery__name">{item.name}</h3>
            <p className="gallery__desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Gallery;
