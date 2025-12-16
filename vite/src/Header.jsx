import React from 'react';
import logo from './assets/images/12-Pizzas-Logo.svg';
import './assets/pizza-style.css';

export default function Header() {
  return (
    <div className="header">
      <img className="logo" src={logo} alt="12 Pizzas Logo" />
      <div className="header-text">
        <div className="header-address">12983 Street St | Louisville</div>
        <div className="header-days">TUESDAY | WEDNESDAY | THURSDAY</div>
        <div className="header-phone"><b>PHONE: 10 am – til it's gone</b></div>
        <div className="header-doors"><b>DOORS: 11 am – til it's gone</b></div>
        <div className="header-curbside">CURBSIDE PICK and CARRYOUT ONLY</div>
      </div>
    </div>
  );
} 