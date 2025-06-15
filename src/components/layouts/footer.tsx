// src/components/layouts/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-auto">
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Web de Cursos de Verano. Todos los derechos reservados.</p>
        <p className="mt-2">Designed By miguel morales y alguarizaboy.</p>
      </div>
    </footer>
  );
};

export default Footer;