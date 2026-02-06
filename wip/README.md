# Portfolio Website - Storytelling Scroll Template

A modern, narrative-driven portfolio website with scroll-triggered animations and progressive content reveals.

## Features

- **Storytelling Scroll Design**: Content reveals progressively as you scroll
- **Smooth Animations**: Intersection Observer API for performant scroll animations
- **Responsive Design**: Works beautifully on all devices
- **Modern UI**: Clean, elegant design with smooth transitions
- **Performance Optimized**: Throttled scroll events and efficient animations

## Structure

- `index.html` - Main HTML structure with semantic sections
- `style.css` - All styling with animations and responsive breakpoints
- `script.js` - JavaScript for scroll animations and interactions

## Sections

1. **Hero** - Introduction with animated text
2. **About** - Personal introduction and philosophy
3. **Philosophy** - Design approach and values
4. **Work** - Portfolio projects with reveal animations
5. **Contact** - Contact information and links
6. **Footer** - Simple footer

## Customization

### Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary-color: #43AB92;
    --secondary-color: #2892CF;
    --accent-color: #6a67be;
    /* ... */
}
```

### Content
- Update project information in the HTML
- Replace placeholder images with actual project screenshots
- Modify text content in each section

### Animations
- Adjust animation timing in CSS transitions
- Modify Intersection Observer thresholds in `script.js`
- Customize reveal delays for staggered effects

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires CSS Grid and Intersection Observer support

## Next Steps

1. Replace placeholder images with actual project visuals
2. Add your real project content and descriptions
3. Update contact links with your actual social profiles
4. Customize colors to match your brand
5. Add more projects as needed
