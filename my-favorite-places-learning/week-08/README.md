# Week 8: Polish & Deployment

**Time**: 2-3 hours/day, 5 days

## Learning Goals

- Make the app look great on mobile
- Add icons and polish the UI
- Build the app for production
- Deploy to the internet
- Share with friends and family!

## Day 1-2: Styling & Mobile Design

### What You'll Learn
- Mobile-first CSS
- Responsive design
- Touch-friendly buttons
- Using react-icons
- Making it look professional

### Mobile-First Design

Design for mobile first, then enhance for larger screens:

```css
/* Mobile styles (default) */
.container {
  padding: 10px;
}

.button {
  padding: 12px 24px;
  font-size: 16px; /* Minimum for touch targets */
  min-height: 44px; /* Touch-friendly size */
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Touch-Friendly Buttons

```css
.button {
  min-height: 44px; /* Apple's recommended minimum */
  min-width: 44px;
  padding: 12px 24px;
  font-size: 16px; /* Prevents zoom on iOS */
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.button:active {
  transform: scale(0.95);
}
```

### Using React Icons

```bash
npm install react-icons
```

```jsx
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

function LocationCard({ location, onEdit, onDelete }) {
  return (
    <div className="location-card">
      <FaMapMarkerAlt className="icon" />
      <h3>{location.name}</h3>
      <button onClick={() => onEdit(location)}>
        <FaEdit /> Edit
      </button>
      <button onClick={() => onDelete(location.id)}>
        <FaTrash /> Delete
      </button>
    </div>
  );
}
```

### Complete Styling Example

```css
/* App.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: #f5f5f5;
}

.app-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 10px;
}

.header {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  font-size: 24px;
  color: #333;
}

.location-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.button {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  min-height: 44px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.button:hover {
  background: #2980b9;
}

.button:active {
  transform: scale(0.95);
}

.fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #27ae60;
  color: white;
  border: none;
  font-size: 24px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  cursor: pointer;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

@media (min-width: 768px) {
  .app-container {
    padding: 20px;
    max-width: 1200px;
  }

  .map-container {
    height: 500px;
  }
}
```

### Exercises

1. Add react-icons to your app
2. Style all buttons to be touch-friendly
3. Make the layout responsive
4. Add colors and visual hierarchy
5. Test on a real phone

### Resources
- [React Icons](https://react-icons.github.io/react-icons/)
- [CSS-Tricks Responsive Design](https://css-tricks.com/guides/responsive-design/)

## Day 3-5: Deployment

### What You'll Learn
- Setting up GitHub account
- Creating a GitHub repository
- Building the app for production
- Deploying to GitHub Pages
- Deploying to Netlify
- Testing on real devices

### Step 1: Set Up GitHub Account (if needed)

**For Windows:**

1. Go to [github.com](https://github.com/)
2. Click "Sign up" in the top right
3. Enter your information:
   - Username (choose something you like - this will be in your website URL)
   - Email address
   - Password (make it strong!)
4. Verify your email address (check your email and click the link)
5. Complete any setup questions
6. You're ready to use GitHub!

**Note**: If you're under 13, you may need a parent's help to create an account.

### Step 2: Create a GitHub Repository

1. After logging into GitHub, click the "+" icon in the top right
2. Click "New repository"
3. Fill in the form:
   - **Repository name**: `my-favorite-places` (or any name you like)
   - **Description**: "My first map-based web app"
   - **Visibility**: Choose "Public" (so you can use free GitHub Pages)
   - **Important**: Do NOT check "Initialize this repository with a README" (we already have code)
4. Click "Create repository"

### Step 3: Connect Your Local Project to GitHub

**In VS Code Terminal:**

1. Make sure you're in your project folder:
   ```bash
   cd my-favorite-places
   ```

2. Initialize Git (if not already done):
   ```bash
   git init
   ```

3. Add all your files:
   ```bash
   git add .
   ```

4. Make your first commit:
   ```bash
   git commit -m "Initial commit - my favorite places app"
   ```

5. Connect to GitHub (replace YOUR_USERNAME with your GitHub username):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/my-favorite-places.git
   ```

6. Push your code to GitHub:
   ```bash
   git branch -M main
   git push -u origin main
   ```

7. You'll be asked to log in - use your GitHub username and a Personal Access Token (see below)

**Creating a Personal Access Token:**

1. Go to GitHub.com → Click your profile picture → "Settings"
2. Scroll down to "Developer settings" (left sidebar)
3. Click "Personal access tokens" → "Tokens (classic)"
4. Click "Generate new token" → "Generate new token (classic)"
5. Give it a name like "My Favorite Places App"
6. Check the box for "repo" (this allows pushing code)
7. Scroll down and click "Generate token"
8. **IMPORTANT**: Copy the token immediately (you won't see it again!)
9. When Git asks for a password, paste this token instead

**Troubleshooting:**
- If you get errors, make sure Git is installed (`git --version`)
- Make sure you're logged into GitHub in your browser
- Try the steps again - Git can be tricky the first time!

### Building for Production

```bash
# Build the app
npm run build

# This creates a 'dist' folder with optimized files
```

The `dist` folder contains:
- Optimized JavaScript (minified)
- Optimized CSS
- Static assets
- `index.html` ready for deployment

### Deploying to GitHub Pages

#### Option 1: Manual Deployment

1. Build your app:
   ```bash
   npm run build
   ```

2. In your `vite.config.js`, set the base path:
   ```js
   export default defineConfig({
     base: '/my-favorite-places/',
     // ... rest of config
   });
   ```

3. Copy the `dist` folder contents to a `gh-pages` branch

4. Enable GitHub Pages in repository settings

#### Option 2: GitHub Actions (Automatic)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Deploying to Netlify (Easier Option - No Git Required!)

**Option A: Manual Deployment (Easiest - No Git Needed!)**

1. Build your app first:
   ```bash
   npm run build
   ```

2. Go to [netlify.com](https://www.netlify.com/)
3. Sign up/login (free - you can use your email or GitHub account)
4. Click "Add new site" → "Deploy manually"
5. Drag and drop your `dist` folder (the entire folder)
6. Wait a few seconds...
7. Your site is live! 🎉
   - You'll get a URL like `random-name-123.netlify.app`
   - You can change this name in settings

**Option B: Connect to GitHub (Automatic Updates)**

If you set up GitHub (Step 1-3 above), you can connect it:

1. Go to Netlify
2. Click "Add new site" → "Import an existing project"
3. Click "GitHub" and authorize Netlify
4. Select your `my-favorite-places` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"
7. Now every time you push code to GitHub, Netlify will automatically update your site!

**Which Should You Choose?**
- **Manual (Option A)**: Easier, no Git needed, but you have to manually deploy each time
- **GitHub (Option B)**: Slightly more setup, but automatic updates when you push code

### Updating vite.config.js for Deployment

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' 
    ? '/my-favorite-places/'  // GitHub Pages subdirectory
    : '/'  // Local development
});
```

### Testing on Real Devices

1. Get your deployed URL
2. Open on your phone's browser
3. Test all features:
   - Adding locations
   - Map interaction
   - Geolocation
   - Sharing
   - Edit/delete

### Common Issues

**White screen after deployment?**
- Check browser console for errors
- Verify `base` path in `vite.config.js` matches your deployment path
- Make sure all assets are loading correctly

**Map not showing?**
- Check that Leaflet CSS is imported
- Verify map container has a defined height
- Check for CORS errors in console

**Geolocation not working?**
- Must be on HTTPS (or localhost)
- User must grant permission
- Check browser console for errors

### Final Checklist

Before sharing your app:
- ✅ App works on mobile
- ✅ All features tested
- ✅ No console errors
- ✅ Looks good on phone and desktop
- ✅ Deployed and accessible online
- ✅ Shareable links work

### Exercises

1. Build your app for production
2. Deploy to Netlify or GitHub Pages
3. Test on your phone
4. Share with friends and family!
5. Get feedback and make improvements

### Resources
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages Guide](https://pages.github.com/)
- [Netlify Documentation](https://docs.netlify.com/)

### Complete Example

See `examples/README.md` for guidance on what your final app should look like. Week 8 is about polish and deployment, so review the Week 7 examples and add mobile-responsive styling and icons.

## Deliverable

By the end of Week 8, you should have:
- ✅ Beautiful, mobile-friendly design
- ✅ Icons and polished UI
- ✅ App built for production
- ✅ Deployed online and accessible
- ✅ Working on real devices
- ✅ Ready to share with the world!

## Congratulations! 🎉

You've built a complete, functional web application! You now know:
- React and modern JavaScript
- Maps and geocoding
- Data persistence
- User interfaces
- Deployment

Keep learning and building! 🚀

