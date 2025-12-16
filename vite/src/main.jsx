import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import PizzaGrid from './PizzaGrid';
import PizzaDetail from './PizzaDetail';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/pizza">
      <Routes>
        <Route path="/" element={<PizzaGrid />} />
        <Route path=":pizzaId" element={<PizzaDetail />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
