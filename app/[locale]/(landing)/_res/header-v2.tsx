import React, { useState } from 'react';
import Logo from '@/components/logo';
import LocaleSwitcher2 from '@/components/ui/locale-switcher_v2';
import LoginButton from '@/components/ui/seConnecter';
import PartenariatButton from '@/components/ui/partenariat';
import { HiMenu } from 'react-icons/hi'; 

const Header2: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="px-4 py-2 fixed top-0 inset-x-0 bg-background bg-muted/40 backdrop-blur z-40 shadow-sm w-full">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto px-9">
        <Logo />

        <div className="hidden md:flex items-center gap-4">
          <PartenariatButton />
          <LoginButton />
          <LocaleSwitcher2 />
        </div>

        <div className="flex md:hidden items-center">
          <button onClick={toggleMenu} aria-label="Open menu" className="text-gray-700">
            <HiMenu size={24} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-2 bg-white shadow-md rounded-lg py-2">
          <div className="flex flex-col items-center justify-center gap-2">
            <PartenariatButton />
            <LoginButton />
            <LocaleSwitcher2 />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header2;
