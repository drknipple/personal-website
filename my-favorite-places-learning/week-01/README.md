# Week 1: HTML/CSS Review & JavaScript Fundamentals

**Time**: 2-3 hours/day, 5 days

## Learning Goals

- Review HTML structure and CSS styling
- Learn JavaScript fundamentals
- Build interactive web pages with vanilla JavaScript

## What You'll Need for Week 1

**VS Code (Code Editor):**
- We'll install this first - it's the tool you'll use throughout the entire project!
- It has helpful features like color coding, auto-completion, and error detection

**Browser:**
- Chrome, Firefox, Edge, or Safari - any modern browser works!

## Step 1: Install VS Code

**For Windows:**

1. Go to [code.visualstudio.com](https://code.visualstudio.com/)
2. Click the big "Download for Windows" button
3. Run the installer (VSCodeUserSetup-x64-x.x.x.exe)
4. Installation options:
   - Accept the license
   - Keep default installation path
   - **Important**: Check these boxes:
     - ✅ "Add to PATH"
     - ✅ "Create a desktop icon"
     - ✅ "Register Code as an editor for supported file types"
   - Click "Next" and then "Install"
5. Wait for installation
6. Click "Finish"
7. VS Code should open automatically

**First Time Setup in VS Code:**

1. When VS Code opens, you might see a welcome screen
2. Close any welcome tabs
3. You should see a dark editor with a file explorer on the left

**Install VS Code Extensions:**

1. Click the Extensions icon on the left sidebar (looks like four squares, or press `Ctrl+Shift+X`)
2. Search for and install these extensions one by one:
   - **Live Server** (by Ritwick Dey) - automatically refreshes your browser when you save!
   - **Prettier - Code formatter** (by Prettier) - makes your code look nice
   - **ESLint** (by Microsoft) - helps find code errors (optional for Week 1)
3. For each extension:
   - Click "Install"
   - Wait for it to install
   - You may need to reload VS Code

**Open a Folder in VS Code:**

1. Click "File" → "Open Folder" (or press `Ctrl+K Ctrl+O`)
2. Navigate to where you want to save your projects (like `Documents` or `Desktop`)
3. Create a new folder called "my-favorite-places" (or any name you like)
4. Click "Select Folder"
5. Now VS Code is ready to use!

---

## Day 1: HTML Structure & Basic CSS

**Time**: 2-3 hours

### What You'll Learn Today
- HTML structure (head, body, divs, headings, paragraphs)
- Basic CSS styling (colors, fonts, spacing)
- How to create a simple card layout

### Hour 1: Understanding HTML Structure

**Step 1: Open the Starter File**
1. Copy `week-01/starter/day1-starter.html` to your project folder
2. Rename it to `my-favorite-places.html`
3. Open it in VS Code
4. Right-click → "Open with Live Server" to see it in your browser

**Step 2: Look at the HTML Structure**
The file has a basic structure. Let's understand each part:

```html
<!DOCTYPE html>  <!-- Tells browser this is HTML5 -->
<html lang="en">  <!-- The root element, "en" means English -->
<head>            <!-- Information about the page (not visible) -->
  <meta charset="UTF-8">  <!-- Character encoding -->
  <title>My Favorite Places</title>  <!-- Tab title -->
</head>
<body>            <!-- Everything visible goes here -->
  <!-- Your content -->
</body>
</html>
```

**Why we need this structure:**
- `<!DOCTYPE html>` tells the browser how to interpret the file
- `<head>` contains metadata (title, styles, scripts)
- `<body>` contains what users see

**Step 3: Add Your First Card**
Inside the `<body>`, find the comment `<!-- TODO: Add your first favorite place card here -->`

Replace it with:
```html
<div class="place-card">
  <h2>Central Park</h2>
  <span class="place-type">Park</span>
  <p class="place-address">New York, NY 10024</p>
</div>
```

**What each part does:**
- `<div class="place-card">` - A container with a class name (we'll style it with CSS)
- `<h2>` - A heading (smaller than h1)
- `<span>` - Inline element for the type badge
- `<p>` - Paragraph for the address

**Checkpoint:** Can you explain what a `<div>` is and why we use `class="place-card"`?

**Resources:**
- [MDN - HTML Elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)
- [MDN - div element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div)

### Hour 2: Basic CSS Styling

**Step 1: Understanding CSS**
CSS (Cascading Style Sheets) makes HTML look good. It's in the `<style>` tag.

**Step 2: Style the Card**
Find the `/* TODO: Add your own styles here! */` comment in the `<style>` section.

Add this CSS:
```css
.place-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

**What each property does:**
- `background: white;` - White background
- `border-radius: 8px;` - Rounded corners
- `padding: 20px;` - Space inside the card
- `width: 300px;` - Card width
- `box-shadow: 0 2px 4px rgba(0,0,0,0.1);` - Subtle shadow

**Step 3: Style the Text**
Add more CSS:
```css
.place-card h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.place-address {
  color: #666;
  margin-top: 10px;
}
```

**Why we use selectors:**
- `.place-card h2` targets h2 inside `.place-card`
- `.place-address` targets elements with that class

**Checkpoint:** Save and refresh. Does your card look styled? Can you explain what `padding` does?

**Resources:**
- [MDN - CSS Basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics)
- [CSS-Tricks - Box Model](https://css-tricks.com/the-css-box-model/)

### Hour 3: Add More Cards & Layout

**Step 1: Add Two More Cards**
Copy your first card and create two more with different places:
- Local Library
- Favorite Cafe

**Step 2: Make Cards Display Side-by-Side**
The `.places-grid` class uses Flexbox. The CSS is already there:
```css
.places-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}
```

**What this does:**
- `display: flex;` - Makes it a flex container
- `flex-wrap: wrap;` - Cards wrap to next line if needed
- `gap: 20px;` - Space between cards
- `justify-content: center;` - Centers the cards

**Checkpoint:** Do you have 3 cards showing? Can you explain what Flexbox does?

**Resources:**
- [CSS-Tricks - Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

### Day 1 Deliverable
By the end of Day 1, you should have:
- ✅ 3 location cards on the page
- ✅ Cards styled with CSS
- ✅ Cards displayed in a grid layout
- ✅ Understanding of HTML structure and basic CSS

---

## Day 2: CSS Styling & Preparing for JavaScript

**Time**: 2-3 hours

### What You'll Learn Today
- Color-coded type badges
- Hover effects
- Adding IDs (for JavaScript targeting)
- Creating a details section (hidden for now)

### Hour 1: Color-Coded Type Badges

**Step 1: Understand Why We Need This**
We want different colors for different types:
- Park = Green
- Restaurant = Red
- Library = Purple

**Step 2: Add Multiple Classes**
Update your HTML. Change:
```html
<span class="place-type">Park</span>
```

To:
```html
<span class="place-type park">Park</span>
```

Notice: Two classes! `place-type` (for general styling) and `park` (for specific color).

**Step 3: Add CSS for Each Type**
In your `<style>` section, add:
```css
.place-type.restaurant {
  background: #e74c3c;  /* Red */
}

.place-type.park {
  background: #27ae60;  /* Green */
}

.place-type.library {
  background: #9b59b6;  /* Purple */
}
```

**Why `.place-type.park`?**
- This targets elements that have BOTH classes
- It's more specific than just `.place-type`

**Checkpoint:** Do your type badges have different colors? Can you explain why we use two classes?

**Resources:**
- [MDN - CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)

### Hour 2: Hover Effects & Making Cards Interactive-Looking

**Step 1: Add Hover Effect**
When you move your mouse over a card, it should lift up slightly. Add this CSS:
```css
.place-card {
  cursor: pointer;  /* Changes cursor to hand */
  transition: transform 0.2s;  /* Smooth animation */
}

.place-card:hover {
  transform: translateY(-2px);  /* Moves up 2 pixels */
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);  /* Bigger shadow */
}
```

**What this does:**
- `cursor: pointer;` - Shows it's clickable
- `transition: transform 0.2s;` - Smooth animation
- `:hover` - Applies styles when mouse is over

**Why we're doing this:**
- Makes it clear cards are interactive
- Better user experience

**Checkpoint:** Hover over a card. Does it lift up? Can you explain what `:hover` does?

### Hour 3: Adding IDs and Details Section

**Step 1: Why We Need IDs**
IDs are unique names for elements. We'll use them in JavaScript to find specific cards.

**Step 2: Add IDs to Each Card**
Update your HTML. Change:
```html
<div class="place-card">
```

To:
```html
<div class="place-card" id="card1">
```

Do this for all three cards: `id="card1"`, `id="card2"`, `id="card3"`.

**Why IDs?**
- Each card needs a unique identifier
- JavaScript will use `getElementById('card1')` to find it

**Step 3: Add a Details Section**
Inside each card, after the address, add:
```html
<div class="place-details" id="details1">
  <p>A beautiful park in the heart of Manhattan!</p>
</div>
```

**Why we're adding this now:**
- We'll show/hide this with JavaScript later
- It's hidden by default (we'll style it next)

**Step 4: Style the Details Section (Hidden by Default)**
Add this CSS:
```css
.place-details {
  display: none;  /* Hidden by default */
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;  /* Top border */
}
```

**Why `display: none;`?**
- Hides the details initially
- JavaScript will change this to `display: block;` when clicked

**Checkpoint:** 
- Do your cards have IDs?
- Do they have details sections?
- Are the details hidden? (You shouldn't see them yet)

**Resources:**
- [MDN - HTML id attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id)
- [MDN - CSS display property](https://developer.mozilla.org/en-US/docs/Web/CSS/display)

### Day 2 Deliverable
By the end of Day 2, you should have:
- ✅ Color-coded type badges
- ✅ Hover effects on cards
- ✅ IDs on each card
- ✅ Details sections (hidden) in each card
- ✅ Understanding of why we added IDs and details sections

---

## Day 3: Your First JavaScript Interaction

**Time**: 2-3 hours

### What You'll Learn Today
- What JavaScript does
- The `onclick` attribute
- Functions
- Making a button do something

### Hour 1: Understanding JavaScript

**Step 1: What is JavaScript?**
JavaScript makes web pages interactive. HTML = structure, CSS = styling, JavaScript = behavior.

**Step 2: Add a Script Tag**
At the bottom of your HTML, before `</body>`, add:
```html
<script>
  // JavaScript goes here!
</script>
```

**Why at the bottom?**
- Ensures HTML loads first
- Then JavaScript runs

**Step 3: Your First JavaScript**
Add this inside the `<script>` tag:
```javascript
console.log("Hello, JavaScript!");
```

**What this does:**
- `console.log()` prints to the browser console
- Open browser DevTools (F12) → Console tab to see it

**Checkpoint:** Open the console. Do you see "Hello, JavaScript!"? Can you explain what `console.log()` does?

**Resources:**
- [MDN - JavaScript Basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics)
- [MDN - console.log](https://developer.mozilla.org/en-US/docs/Web/API/Console/log)

### Hour 2: Understanding Functions

**Step 1: What is a Function?**
A function is a reusable block of code. Like a recipe you can use over and over.

**Step 2: Create Your First Function**
In your `<script>` tag, add:
```javascript
function sayHello() {
  alert("Hello!");
}
```

**What this does:**
- `function` - Keyword to create a function
- `sayHello` - Function name
- `()` - Parameters (empty for now)
- `{ }` - Code inside runs when function is called

**Step 3: Call the Function**
Add this after the function:
```javascript
sayHello();  // Calls the function
```

**Checkpoint:** Refresh the page. Do you see an alert? Can you explain what a function is?

**Resources:**
- [MDN - Functions](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics#functions)

### Hour 3: Using onclick with a Button

**Step 1: Add a Button**
In one of your cards, inside the details section, add:
```html
<button onclick="sayHello()">Click Me!</button>
```

**What `onclick` does:**
- Runs JavaScript when button is clicked
- `onclick="sayHello()"` calls the `sayHello()` function

**Step 2: Style the Button**
Add CSS:
```css
button {
  background: #27ae60;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background: #229954;
}
```

**Step 3: Make the Button Do Something Useful**
Change your function:
```javascript
function toggleDetails() {
  alert("Details clicked!");
}
```

And update the button:
```html
<button onclick="toggleDetails()">Show Details</button>
```

**Checkpoint:** Click the button. Does the alert appear? Can you explain what `onclick` does?

**Resources:**
- [MDN - onclick event](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onclick)

### Day 3 Deliverable
By the end of Day 3, you should have:
- ✅ A script tag with JavaScript
- ✅ A function that shows an alert
- ✅ A button with onclick that calls the function
- ✅ Understanding of functions and onclick

---

## Day 4: DOM Manipulation - Making Cards Interactive

**Time**: 2-3 hours

### What You'll Learn Today
- What the DOM is
- `getElementById` - Finding elements
- `classList` - Adding/removing CSS classes
- Making cards show/hide details when clicked

### Hour 1: Understanding the DOM

**Step 1: What is the DOM?**
DOM = Document Object Model. It's how JavaScript sees your HTML.

**Think of it like this:**
- HTML = Blueprint
- DOM = The actual house JavaScript can interact with

**Step 2: Finding Elements with getElementById**
Remember we added `id="card1"`? Now we can find it!

In your script, add:
```javascript
const card1 = document.getElementById('card1');
console.log(card1);
```

**What this does:**
- `document` - The entire HTML page
- `getElementById('card1')` - Finds element with id="card1"
- `const card1` - Saves it in a variable

**Checkpoint:** Check the console. Do you see the card element? Can you explain what `getElementById` does?

**Resources:**
- [MDN - getElementById](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById)
- [MDN - DOM Introduction](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction)

### Hour 2: Using classList to Show/Hide Details

**Step 1: Understanding classList**
We can add/remove CSS classes with JavaScript!

**Step 2: Find the Details Element**
```javascript
const details1 = document.getElementById('details1');
```

**Step 3: Show the Details**
Add a CSS class for showing:
```css
.place-details.show {
  display: block;
}
```

Now toggle it with JavaScript:
```javascript
function showDetails1() {
  const details1 = document.getElementById('details1');
  details1.classList.toggle('show');
}
```

**What `classList.toggle()` does:**
- If class exists, removes it
- If class doesn't exist, adds it
- Perfect for show/hide!

**Step 4: Connect to Button**
Update your button:
```html
<button onclick="showDetails1()">Show Details</button>
```

**Checkpoint:** Click the button. Do the details show/hide? Can you explain what `classList.toggle()` does?

**Resources:**
- [MDN - classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)

### Hour 3: Making the Whole Card Clickable

**Step 1: Using addEventListener**
Instead of `onclick` in HTML, we can add listeners in JavaScript (better practice).

**Step 2: Add Event Listener to Card**
```javascript
const card1 = document.getElementById('card1');
card1.addEventListener('click', function() {
  const details1 = document.getElementById('details1');
  details1.classList.toggle('show');
});
```

**What this does:**
- Finds card1
- Listens for 'click' events
- When clicked, toggles details1

**Step 3: Do This for All Cards**
```javascript
// Card 1
const card1 = document.getElementById('card1');
const details1 = document.getElementById('details1');
card1.addEventListener('click', function() {
  details1.classList.toggle('show');
});

// Card 2
const card2 = document.getElementById('card2');
const details2 = document.getElementById('details2');
card2.addEventListener('click', function() {
  details2.classList.toggle('show');
});

// Card 3
const card3 = document.getElementById('card3');
const details3 = document.getElementById('details3');
card3.addEventListener('click', function() {
  details3.classList.toggle('show');
});
```

**Why this is better:**
- All JavaScript in one place
- Easier to maintain
- More flexible

**Checkpoint:** Click any card. Do the details show/hide? Can you explain what `addEventListener` does?

**Resources:**
- [MDN - addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [MDN - Events Guide](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events)

### Day 4 Deliverable
By the end of Day 4, you should have:
- ✅ Cards that show/hide details when clicked
- ✅ Understanding of getElementById
- ✅ Understanding of addEventListener
- ✅ Understanding of classList.toggle

---

## Day 5: Complete Interactive Features

**Time**: 2-3 hours

### What You'll Learn Today
- Variables and state
- Building a favorite toggle function
- Adding a counter
- Polishing your app

### Hour 1: Understanding Variables and State

**Step 1: What is State?**
State = remembering if something is true or false. Like: "Is this favorited?"

**Step 2: Create Variables to Track State**
```javascript
let favoriteCount = 0;  // How many are favorited
const favoritedCards = new Set();  // Which cards are favorited
```

**What this does:**
- `let favoriteCount = 0;` - Counter starting at 0
- `new Set()` - Stores unique values (which cards are favorited)

**Step 3: Update Button Text Based on State**
Add buttons to each card's details:
```html
<button id="fav1" onclick="toggleFavorite('card1', 'fav1')">Add to Favorites</button>
```

**Checkpoint:** Can you explain what a variable is? What does `let` mean?

**Resources:**
- [MDN - Variables](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics#variables)
- [MDN - let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)

### Hour 2: Building the Toggle Favorite Function

**Step 1: Create the Function**
```javascript
function toggleFavorite(cardId, buttonId) {
  const button = document.getElementById(buttonId);
  const card = document.getElementById(cardId);
  
  if (favoritedCards.has(cardId)) {
    // Already favorited - unfavorite it
    favoritedCards.delete(cardId);
    button.textContent = 'Add to Favorites';
    button.classList.remove('favorited');
    favoriteCount--;
  } else {
    // Not favorited - favorite it
    favoritedCards.add(cardId);
    button.textContent = 'Unfavorite';
    button.classList.add('favorited');
    favoriteCount++;
  }
  
  // Update counter display
  updateFavoriteCounter();
}
```

**What this does:**
- Checks if card is already favorited
- If yes: removes it, changes button text
- If no: adds it, changes button text
- Updates the counter

**Step 2: Add Counter Display**
Add this HTML at the top:
```html
<div class="favorite-counter">
  Favorites: <span id="favoriteCount">0</span>
</div>
```

**Step 3: Create Update Function**
```javascript
function updateFavoriteCounter() {
  const counter = document.getElementById('favoriteCount');
  counter.textContent = favoriteCount;
}
```

**Checkpoint:** Click the favorite button. Does it toggle? Does the counter update?

**Resources:**
- [MDN - if...else](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else)
- [MDN - Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

### Hour 3: Polishing and Testing

**Step 1: Add Styling for Favorited State**
```css
button.favorited {
  background: #e74c3c;
}

button.favorited:hover {
  background: #c0392b;
}

.favorite-counter {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
  color: #666;
}
```

**Step 2: Add Buttons to All Cards**
Make sure each card has a favorite button with the correct IDs.

**Step 3: Test Everything**
- Click cards to show/hide details
- Click favorite buttons to toggle
- Check that counter updates
- Test on different screen sizes

**Step 4: Clean Up Your Code**
- Remove any `console.log()` you added for testing
- Make sure code is organized
- Add comments explaining complex parts

**Checkpoint:** Does everything work? Can you explain how the favorite toggle works?

### Day 5 Deliverable
By the end of Day 5, you should have:
- ✅ Fully interactive cards
- ✅ Favorite toggle working
- ✅ Counter displaying correctly
- ✅ Polished, working app

---

## Week 1 Complete!

By the end of Week 1, you should have:
- ✅ A working HTML page with 3 location cards
- ✅ CSS styling with colors and hover effects
- ✅ JavaScript that makes cards interactive
- ✅ Cards that show/hide details when clicked
- ✅ Favorite buttons that work
- ✅ A counter showing favorites
- ✅ Understanding of HTML, CSS, and JavaScript basics

## Next Week

Next week, you'll learn modern JavaScript and set up your development environment with React!
