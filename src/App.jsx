import { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Gallery from './components/Gallery/Gallery';
import Build from './components/Build/Build';
import Footer from './components/Footer/Footer';
import Admin from './components/Admin/Admin';
import './App.css';

function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (hash === '#admin') {
    return <Admin />;
  }

  return (
    <>
      <Header />
      <Hero />
      <Gallery />
      <Build />
      <Footer />
    </>
  );
}

export default App;
