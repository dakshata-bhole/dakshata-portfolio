import React from 'react';
import { createRoot } from 'react-dom/client';
import { HeroGlobe } from './HeroGlobe.jsx';

const mount = document.getElementById('hero-globe');
if (mount) {
  createRoot(mount).render(<HeroGlobe />);
}
