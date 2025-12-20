# Week 2: Modern JavaScript & Development Setup

**Time**: 2-3 hours/day, 5 days

## Learning Goals

- Learn modern JavaScript (ES6+) features
- Set up a development environment
- Create your first React project

## Day 1-2: ES6+ JavaScript

### What You'll Learn
- Arrow functions
- Template literals
- Array methods (map, filter, forEach)
- Destructuring
- Spread operator

### Practice: Refactor Week 1 Project

Take your Week 1 project and refactor it using modern JavaScript.

### Key Modern JavaScript Features

```javascript
// Arrow Functions
const showDetails = () => {
  console.log("Details!");
};

// Template Literals
const name = "Central Park";
const message = `Welcome to ${name}!`;

// Array Methods
const locations = [
  { name: "Park", type: "park" },
  { name: "Cafe", type: "restaurant" }
];

// Map - transform array
const names = locations.map(loc => loc.name);

// Filter - find items
const parks = locations.filter(loc => loc.type === "park");

// Destructuring
const { name, type } = locations[0];

// Spread Operator
const newLocations = [...locations, { name: "Library", type: "library" }];
```

### Exercises

1. Refactor your Week 1 JavaScript to use arrow functions
2. Use template literals for all string concatenation
3. Use array methods instead of for loops
4. Practice destructuring objects and arrays

### Resources
- [MDN Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [MDN Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- [JavaScript.info - Modern JavaScript](https://javascript.info/)

## Day 3-5: Development Environment

### What You'll Learn
- Node.js and npm
- Git (version control)
- Package managers
- Vite and React
- Project structure

**Note:** You already have VS Code installed from Week 1! Now we'll add the other tools you need.

### Step 1: Install Node.js (includes npm)

**For Windows:**

1. Go to [nodejs.org](https://nodejs.org/)
2. You'll see two buttons - click the **LTS** (Long Term Support) version button
   - It will say something like "Recommended For Most Users"
   - The version number will be something like "20.x.x LTS"
3. Download the Windows Installer (.msi file)
4. Run the installer:
   - Click "Next" through the welcome screen
   - Accept the license agreement
   - Keep the default installation path (usually `C:\Program Files\nodejs\`)
   - **Important**: Make sure "Add to PATH" is checked (it should be by default)
   - Click "Install"
   - You may need to allow administrator permissions
5. Wait for installation to complete
6. Click "Finish"

**Verify Installation:**

1. Open **Command Prompt** (search for "cmd" in Windows Start menu)
2. Type these commands and press Enter after each:
   ```bash
   node --version
   npm --version
   ```
3. You should see version numbers (like `v20.11.0` and `10.2.4`)
4. If you see "command not found" or an error, try:
   - Restart your computer
   - Make sure you installed the LTS version
   - Check that Node.js was added to PATH during installation

**Troubleshooting:**
- If commands don't work, you may need to restart your computer
- If still not working, reinstall Node.js and make sure "Add to PATH" is checked

### Step 2: Install Git

**For Windows:**

1. Go to [git-scm.com/download/win](https://git-scm.com/download/win)
2. The download should start automatically
3. Run the installer (Git-x.x.x-64-bit.exe)
4. Installation options (use these defaults):
   - Click "Next" through the license
   - Keep default installation path
   - **Important**: Select "Git from the command line and also from 3rd-party software" (default)
   - Keep default editor (or choose VS Code if you've already installed it)
   - Choose "Let Git decide" for line ending conversions
   - Keep other defaults
   - Click "Install"
5. Wait for installation
6. Click "Finish"

**Verify Installation:**

1. Open a **new** Command Prompt window
2. Type:
   ```bash
   git --version
   ```
3. You should see something like `git version 2.43.0`

**Note:** Git is used for saving your code and sharing it online. We'll use it more in Week 8 for deployment.

### Step 3: Create Your First React Project

**Note:** You already have VS Code installed from Week 1! Now we'll use it to create a React project.

**Using VS Code Terminal:**

1. Open VS Code (you should already have it from Week 1!)
2. Open the terminal in VS Code: Click "Terminal" → "New Terminal" (or press `` Ctrl+` ``)
3. The terminal will open at the bottom of VS Code

**Create the Project:**

1. In the terminal, navigate to where you want your project:
   ```bash
   cd Documents
   ```
   (Or use `cd Desktop` if you prefer)

2. Create a new React project:
   ```bash
   npm create vite@latest my-favorite-places -- --template react
   ```
   - This will ask you a question - just press Enter to confirm
   - Wait for it to finish (this might take a minute)

3. Navigate into your new project:
   ```bash
   cd my-favorite-places
   ```

4. Install the project dependencies:
   ```bash
   npm install
   ```
   - This downloads all the code libraries your project needs
   - Wait for it to finish (this might take 2-3 minutes the first time)
   - You'll see a progress bar

5. Start the development server:
   ```bash
   npm run dev
   ```
   - You should see a message like: "Local: http://localhost:5173"
   - Your browser should automatically open, or you can copy that URL and paste it in your browser
   - You should see a React logo and "Vite + React" page - success! 🎉

**Important Notes:**
- Keep the terminal open while the dev server is running
- To stop the server, press `Ctrl+C` in the terminal
- The page will automatically update when you save changes to your code!

**If Something Goes Wrong:**
- Make sure you're in the project folder (`my-favorite-places`)
- Try closing and reopening VS Code
- Make sure Node.js is installed correctly (run `node --version` in terminal)

### Understanding the Project Structure

```
my-favorite-places/
├── node_modules/     # Dependencies (don't edit)
├── public/          # Static files
├── src/
│   ├── App.jsx      # Main app component
│   ├── main.jsx     # Entry point
│   └── index.css    # Global styles
├── index.html       # HTML template
├── package.json     # Project config
└── vite.config.js   # Vite config
```

### Mini Project: Hello World React App

1. Open `src/App.jsx`
2. Replace the content with:

```jsx
function App() {
  const places = [
    { name: "Central Park", type: "Park" },
    { name: "Local Library", type: "Library" },
    { name: "Favorite Cafe", type: "Restaurant" }
  ];

  return (
    <div>
      <h1>My Favorite Places</h1>
      <ul>
        {places.map((place, index) => (
          <li key={index}>
            {place.name} - {place.type}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

3. Save and see it update in the browser!

### Key Concepts

- **JSX**: JavaScript that looks like HTML
- **Components**: Reusable pieces of UI
- **Props**: Data passed to components
- **npm**: Package manager for JavaScript
- **Vite**: Fast build tool and dev server

### Exercises

1. Add more places to the array
2. Add styling to make it look nice
3. Create a separate component for a place card
4. Experiment with different JSX elements

### Resources
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Quick Start](https://react.dev/learn)
- [npm Documentation](https://docs.npmjs.com/)

### Complete Example

See `examples/App.jsx` for a complete example of what your app should look like at the end of Week 2.

## Installation Checklist

Before moving on, make sure you have:

- ✅ Node.js installed (check with `node --version`)
- ✅ npm installed (check with `npm --version`)
- ✅ Git installed (check with `git --version`)
- ✅ VS Code already installed from Week 1
- ✅ VS Code extensions installed (ESLint, Prettier - add these if you haven't)
- ✅ Terminal working in VS Code
- ✅ Created your first React project
- ✅ Dev server running (`npm run dev`)

## Deliverable

By the end of Week 2, you should have:
- ✅ Refactored Week 1 code using modern JavaScript
- ✅ Node.js, npm, and Git installed
- ✅ VS Code already set up from Week 1
- ✅ A working Vite + React project
- ✅ A simple React app displaying a list of places
- ✅ Dev server running and showing in browser

## Next Week

Next week, you'll dive deeper into React components and state management!

