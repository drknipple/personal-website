# Week 4: Forms & User Input

**Time**: 2-3 hours/day, 5 days

## Learning Goals

- Build forms in React
- Handle user input
- Validate form data
- Update state from forms

## Day 1-2: Controlled Components

### What You'll Learn
- Form inputs in React
- Handling form submission
- Preventing default behavior
- Controlled vs uncontrolled components

### Controlled Components

In React, form inputs should be "controlled" - their value comes from state:

```jsx
import { useState } from 'react';

function NameInput() {
  const [name, setName] = useState('');

  return (
    <input 
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter your name"
    />
  );
}
```

### Form Submission

```jsx
function AddLocationForm() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh
    console.log('Name:', name);
    console.log('Address:', address);
    // Clear form
    setName('');
    setAddress('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Location name"
      />
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
      />
      <button type="submit">Add Location</button>
    </form>
  );
}
```

### Practice: Simple Add Location Form

Build a form with:
- Name field
- Address field
- Submit button
- Form clears after submission

### Different Input Types

```jsx
// Text input
<input type="text" value={text} onChange={...} />

// Textarea
<textarea value={text} onChange={...} />

// Select dropdown
<select value={selected} onChange={...}>
  <option value="park">Park</option>
  <option value="restaurant">Restaurant</option>
</select>

// Checkbox
<input type="checkbox" checked={checked} onChange={...} />
```

### Exercises

1. Create a form with name and address fields
2. Add a dropdown for location type
3. Add a textarea for notes
4. Make the form submit and log the data

### Resources
- [React.dev - Forms](https://react.dev/learn/sharing-state-between-components)
- [MDN HTML Forms](https://developer.mozilla.org/en-US/docs/Learn/Forms)

## Day 3-5: Form Validation & State Updates

### What You'll Learn
- Basic validation (required fields)
- Updating parent state from child components
- Adding new items to arrays
- Error messages

### Form Validation

```jsx
function AddLocationForm({ onAddLocation }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!address.trim()) {
      setError('Address is required');
      return;
    }

    // Clear error and add location
    setError('');
    onAddLocation({ name, address });
    
    // Clear form
    setName('');
    setAddress('');
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Location name *"
        required
      />
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address *"
        required
      />
      <button type="submit">Add Location</button>
    </form>
  );
}
```

### Updating Parent State

Pass a function from parent to child:

```jsx
// Parent Component
function App() {
  const [locations, setLocations] = useState([]);

  const handleAddLocation = (newLocation) => {
    const locationWithId = {
      ...newLocation,
      id: Date.now() // Simple ID generation
    };
    setLocations([...locations, locationWithId]);
  };

  return (
    <div>
      <AddLocationForm onAddLocation={handleAddLocation} />
      <LocationList locations={locations} />
    </div>
  );
}
```

### Complete Mini Project

Build a complete "Add Location" feature:

```jsx
// App.jsx
import { useState } from 'react';
import AddLocationForm from './components/AddLocationForm';
import LocationList from './components/LocationList';

function App() {
  const [locations, setLocations] = useState([]);

  const handleAddLocation = (locationData) => {
    const newLocation = {
      ...locationData,
      id: Date.now()
    };
    setLocations([...locations, newLocation]);
  };

  return (
    <div>
      <h1>My Favorite Places</h1>
      <AddLocationForm onAddLocation={handleAddLocation} />
      <LocationList locations={locations} />
    </div>
  );
}
```

```jsx
// components/AddLocationForm.jsx
import { useState } from 'react';

function AddLocationForm({ onAddLocation }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    type: 'restaurant'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim()) {
      setError('Name and address are required');
      return;
    }

    setError('');
    onAddLocation(formData);
    
    // Reset form
    setFormData({
      name: '',
      address: '',
      city: '',
      type: 'restaurant'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Location name *"
      />
      
      <input
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address *"
      />
      
      <input
        name="city"
        value={formData.city}
        onChange={handleChange}
        placeholder="City"
      />
      
      <select
        name="type"
        value={formData.type}
        onChange={handleChange}
      >
        <option value="restaurant">Restaurant</option>
        <option value="park">Park</option>
        <option value="library">Library</option>
        <option value="other">Other</option>
      </select>
      
      <button type="submit">Add Location</button>
    </form>
  );
}

export default AddLocationForm;
```

### Exercises

1. Add more fields to the form (phone, hours, notes)
2. Add better validation (email format, phone format)
3. Show success message after adding
4. Style the form to look nice
5. Add a "Cancel" button that clears the form

### Resources
- [React.dev - Forms](https://react.dev/learn/responding-to-events)
- [Form Validation Best Practices](https://web.dev/sign-up-form-best-practices/)

### Complete Example

See `examples/` folder for complete examples:
- `App.jsx` - Complete app with form integration
- `AddLocationForm.jsx` - Full form component with validation
- `LocationList.jsx` - List component displaying locations
- `AddLocationForm.css` - Form styling

## Deliverable

By the end of Week 4, you should have:
- ✅ A working form with multiple input types
- ✅ Form validation for required fields
- ✅ Ability to add locations to the list
- ✅ Form clears after successful submission
- ✅ Error messages for invalid input

## Next Week

Next week, you'll add an interactive map to display your locations!

