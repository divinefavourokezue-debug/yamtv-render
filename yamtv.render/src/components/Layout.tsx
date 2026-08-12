import React from 'react';
import { Outlet } from 'react-router';
import Navbar from './Navbar';
import Footer from './Footer';
import Ticker from './Ticker';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Ticker />
      <main className="flex-grow pt-[96px] md:pt-[120px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
