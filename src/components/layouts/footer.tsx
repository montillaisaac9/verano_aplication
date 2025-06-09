// src/components/layouts/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-auto">
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Summer Courses App. All rights reserved.</p>
        <p className="mt-2">Designed with ❤️.</p>
      </div>
    </footer>
  );
};

export default Footer;