import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import './assets/pizza-style.css';
import mommaJanesImg from './assets/images/momma-janes.svg';
import flammkuchenImg from './assets/images/flamenkuchen.svg';
import chicagoThinImg from './assets/images/chicago-thin.svg';
import detroitSquareImg from './assets/images/detroit-square-pizza.svg';
import quadCitiesImg from './assets/images/quad-cities.svg';
import tomatoPieImg from './assets/images/tomato-pie.svg';
import streetSliceImg from './assets/images/new-york-city-street-slice.svg';
import sfincioneImg from './assets/images/sicilian-scfincone.svg';
import crackerThinImg from './assets/images/craker-thin.svg';
import margheritaImg from './assets/images/margarhita-en-folio.svg';
import apizzaWhiteImg from './assets/images/new-haven-apizza.svg';
import deepDishImg from './assets/images/chicago-deep-dish.svg';

const pizzas = [
  {
    id: 'momma-janes',
    name: "Momma Jane's",
    location: 'Louisville',
    desc: "Our take on Louisville's most well known pizza. Vine ripe fresh sweet tomato sauce, whole milk mozz, large rimmed airy crust for dipping.",
    img: mommaJanesImg,
    portion: '8 SLICES',
    price: 'Make your own',
  },
  {
    id: 'flammkuchen',
    name: 'Flammkuchen',
    location: 'Germantown',
    desc: "Germantown's Alsatian pizza. Cracker thin crust with Hall's Beer Cheese and creme fraiche sauce, sauteed onions, country ham.",
    img: flammkuchenImg,
    portion: '12 SQUARES',
    price: 'Make your own',
  },
  {
    id: 'chicago-tavern-thin',
    name: 'Tavern Thin',
    location: 'South Chicago',
    desc: "Thin crust party cut is crisp but won't break with sauce and charred cheese at the edge. An homage to Vito & Nick's on Pulaski St in South Chicago.",
    img: chicagoThinImg,
    portion: '16 SQUARES',
    price: 'Make your own',
  },
  {
    id: 'detroit-style-square',
    name: 'Square',
    location: 'Detroit',
    desc: "A thick and crispy crust, caramelized edges of brick cheese with red racing stripes. Like Buddy's on 6 Mile in Detroit.",
    img: detroitSquareImg,
    portion: '4 SQUARES',
    price: 'Make your own',
  },
  {
    id: 'quad-cities',
    name: 'Quad Cities',
    location: 'Rock Island, IL',
    desc: "Sweet malted crust, spicy tomato sauce. Heaping topping on bottom cheese on top. Our hommage to Harris Pizza in Rock Island, IL.",
    img: quadCitiesImg,
    portion: '16 STRIPS',
    price: 'Make your own',
  },
  {
    id: 'tomato-pie',
    name: 'Tomato Pie',
    location: 'Robbinsville, NJ',
    desc: "Thin round pies with mozz on the bottom and hearty sauce on top. Like Delorenzo's in Robbinsville, NJ.",
    img: tomatoPieImg,
    portion: '8 SLICES',
    price: 'Make your own',
  },
  {
    id: 'street-slice',
    name: 'Street Slice',
    location: 'Manhattan, NY',
    desc: "Big crispy, chewy, foldable slice of tomato sauce and mozz. Like Joe's on Carmine St. on Manhattan Island, NY.",
    img: streetSliceImg,
    portion: '8 SLICES',
    price: 'Make your own',
  },
  {
    id: 'sfincione',
    name: 'Sfincione',
    location: 'Brooklyn, NYC',
    desc: '"Thick sponge" crust with a crisp bite. Hard toma cheese and thick tomato basil sauce on top. We shoot for L&B Spumoni Gardens in Bensenhurst, Brooklyn, NYC.',
    img: sfincioneImg,
    portion: '10X12 PAN',
    price: 'Make your own',
  },
  {
    id: 'cracker-thin',
    name: 'Cracker Thin',
    location: 'North County, MO',
    desc: "Crispy cracker thin crust, sweet tomato sauce and Provel cheese. Like you get in North County, MO.",
    img: crackerThinImg,
    portion: '24 SQUARES',
    price: 'Make your own',
  },
  {
    id: 'margherita',
    name: 'Margherita',
    location: 'Naples, Italy',
    desc: 'Napolentana traditional with hand crushed DOP tomato sauce and fresh basil. Topped with Fior di Latte. Served "a portafoglio" as an individual serving folded up like Lombardi\'s in 1905.',
    img: margheritaImg,
    portion: "CHRIS MAY'S OVEN",
    price: 'Make your own',
  },
  {
    id: 'apizza-white',
    name: 'Apizza - White',
    location: 'New Haven, CT',
    desc: "Thin and well done. Fresh Virginia littleneck clams, olive oil, oregano, Romano, fresh garlic. A White clam pie like Frank Pepe's in New Haven, CT.",
    img: apizzaWhiteImg,
    portion: 'NEED OVEN',
    price: 'Make your own',
  },
  {
    id: 'deep-dish',
    name: 'Deep Dish',
    location: 'Chicago, IL',
    desc: "Tall buttery crust, 2 LBS of cheese, hearty tomato sauce on top. We bow at the altar of Lou Malnati. This order requires a minimum of 45 minutes to prep, bake, set and serve.",
    img: deepDishImg,
    portion: '8 SLICES',
    price: 'Make your own',
  },
];

export default function PizzaGrid() {
  return (
    <>
      <Header />
      <main className="menu-contain">
        <div className="menu">
          {pizzas.map((pizza) => (
            <div className="menu-item" key={pizza.id}>
              <Link to={`/${pizza.id}`}>
                <img src={pizza.img} alt={pizza.name} />
                <div className="title-row">
                  <h1>{pizza.name}</h1>
                  <div className="location"><i className="fa-solid fa-location-dot"></i> {pizza.location}</div>
                </div>
                <p>{pizza.desc}</p>
                <div className="card-bar">
                  <button className="portion">{pizza.portion}</button>
                  <span className="price">{pizza.price}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
} 