# Week 3: React Basics - Components & State

**Time**: 2-3 hours/day, 5 days

## Learning Goals

- Understand React components and JSX
- Learn about props
- Master the useState hook
- Build interactive components

## Day 1-2: React Fundamentals

### What You'll Learn
- What React is and why we use it
- JSX syntax
- Functional components
- Props (passing data to components)

### What is React?

React is a JavaScript library for building user interfaces. It makes it easier to:
- Create reusable UI components
- Update the UI when data changes
- Build complex applications

### JSX Basics

JSX lets you write HTML-like code in JavaScript:

```jsx
// This is JSX
const element = <h1>Hello, World!</h1>;

// It gets converted to JavaScript
const element = React.createElement('h1', null, 'Hello, World!');
```

### Components

Components are reusable pieces of UI:

```jsx
// A simple component
function Greeting() {
  return <h1>Hello!</h1>;
}

// Using the component
function App() {
  return <Greeting />;
}
```

### Props

Props let you pass data to components:

```jsx
// Component that accepts props
function LocationCard({ name, address, type }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{address}</p>
      <span>{type}</span>
    </div>
  );
}

// Using the component with props
function App() {
  return (
    <LocationCard 
      name="Central Park"
      address="New York, NY"
      type="Park"
    />
  );
}
```

### Practice: Build a LocationCard Component

Create a component that displays location data:

```jsx
// src/components/LocationCard.jsx
function LocationCard({ name, address, type }) {
  return (
    <div className="location-card">
      <h2>{name}</h2>
      <p className="address">{address}</p>
      <span className="type">{type}</span>
    </div>
  );
}

export default LocationCard;
```

Then use it in `App.jsx`:

```jsx
import LocationCard from './components/LocationCard';

function App() {
  const place = {
    name: "Central Park",
    address: "New York, NY",
    type: "Park"
  };

  return <LocationCard {...place} />;
}
```

### Exercises

1. Create a `LocationCard` component
2. Display 3 different places using the component
3. Add CSS styling to make cards look nice
4. Try passing different props to see how it changes

### Resources
- [React.dev - Components](https://react.dev/learn/your-first-component)
- [React.dev - Props](https://react.dev/learn/passing-props-to-a-component)

### Complete Example

See `examples/App.jsx` and `examples/App.css` for a complete example of what your app should look like at the end of Week 3.

## Day 3-5: State Management

### What You'll Learn
- The `useState` hook
- Event handling in React
- Conditional rendering
- Lists and keys

### useState Hook

State lets components "remember" things and update when data changes:

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Add 1
      </button>
    </div>
  );
}
```

### Event Handling

```jsx
function Button() {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### Conditional Rendering

Show different content based on state:

```jsx
function LocationCard({ name, showDetails }) {
  return (
    <div>
      <h2>{name}</h2>
      {showDetails && <p>This is a great place!</p>}
    </div>
  );
}
```

### Lists and Keys

Render arrays of data:

```jsx
function LocationList() {
  const locations = [
    { id: 1, name: "Park" },
    { id: 2, name: "Cafe" },
    { id: 3, name: "Library" }
  ];

  return (
    <ul>
      {locations.map(location => (
        <li key={location.id}>{location.name}</li>
      ))}
    </ul>
  );
}
```

**Important**: Always use a `key` prop when rendering lists!

### Mini Project: Interactive Location List

Build a component that:
- Displays an array of locations
- Has a button to add a new location (hardcoded for now)
- Can toggle location details on/off

```jsx
import { useState } from 'react';

function LocationList() {
  const [locations, setLocations] = useState([
    { id: 1, name: "Central Park", address: "NYC", showDetails: false },
    { id: 2, name: "Local Library", address: "Main St", showDetails: false }
  ]);

  const toggleDetails = (id) => {
    setLocations(locations.map(loc => 
      loc.id === id 
        ? { ...loc, showDetails: !loc.showDetails }
        : loc
    ));
  };

  const addLocation = () => {
    const newLocation = {
      id: locations.length + 1,
      name: "New Place",
      address: "New Address",
      showDetails: false
    };
    setLocations([...locations, newLocation]);
  };

  return (
    <div>
      <button onClick={addLocation}>Add Location</button>
      {locations.map(location => (
        <div key={location.id}>
          <h3>{location.name}</h3>
          <button onClick={() => toggleDetails(location.id)}>
            {location.showDetails ? 'Hide' : 'Show'} Details
          </button>
          {location.showDetails && <p>{location.address}</p>}
        </div>
      ))}
    </div>
  );
}
```

### Exercises

1. Add a "Remove" button for each location
2. Add a counter showing total locations
3. Style the list to look nice
4. Add more fields to each location (type, description)

### Resources
- [React.dev - State](https://react.dev/learn/state-a-components-memory)
- [React.dev - Rendering Lists](https://react.dev/learn/rendering-lists)
- [React Hooks Documentation](https://react.dev/reference/react)

## Deliverable

By the end of Week 3, you should have:
- ✅ Created reusable React components
- ✅ Used props to pass data
- ✅ Used useState to manage state
- ✅ Built an interactive location list
- ✅ Can toggle details and add new locations

## Next Week

Next week, you'll learn about forms and user input!

