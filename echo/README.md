# Echos Prototype

A location-anchored memory platform prototype. Upload a photo, add narration, generate an AI video, and view it on a map.

## Setup Instructions

### 1. Supabase Setup

#### Create the `echos` table

Run this SQL in your Supabase SQL editor:

```sql
-- Create echos table
CREATE TABLE IF NOT EXISTS echos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'erica',
    photo_url TEXT NOT NULL,
    video_url TEXT,
    narration TEXT NOT NULL,
    location_name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    year INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_echos_location ON echos USING GIST (point(lng, lat));

-- Create index for user queries
CREATE INDEX IF NOT EXISTS idx_echos_user ON echos(user_id);

-- Enable Row Level Security (for now, allow all - adjust later for family sharing)
ALTER TABLE echos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all reads and writes (for prototype)
CREATE POLICY "Allow all operations" ON echos
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

#### Create Storage Buckets

1. Go to **Storage** in the Supabase dashboard (left sidebar)
2. Click **"New bucket"** and create two buckets:
   - **`echo-photos`** 
     - Name: `echo-photos`
     - **Important:** Check the **"Public bucket"** checkbox (this allows public access to files)
     - Click **"Create bucket"**
   - **`echo-videos`**
     - Name: `echo-videos`
     - **Important:** Check the **"Public bucket"** checkbox
     - Click **"Create bucket"**

3. Set policies for each bucket. You have two options:

**Option A: Using the UI (Easiest for prototype)**
- Click on each bucket name (`echo-photos` or `echo-videos`)
- Go to the **"Policies"** tab
- Click **"New Policy"**
- Select **"For full customization"** → **"Create a policy from scratch"**
- Name it: `Allow all operations`
- Policy definition: 
  - Allowed operation: `SELECT` (for reads)
  - Policy definition: `true`
  - Click **"Review"** → **"Save policy"**
- Repeat for `INSERT` operation (for uploads)
- Or use the simpler approach below:

**Option B: Using SQL Editor (Faster)**
- Go to **SQL Editor** in the Supabase dashboard (left sidebar)
- Click **"New query"**
- Paste and run this SQL:

```sql
-- Policy for echo-photos bucket (allow all reads and writes)
CREATE POLICY "Allow all operations on echo-photos"
ON storage.objects FOR ALL
USING (bucket_id = 'echo-photos')
WITH CHECK (bucket_id = 'echo-photos');

-- Policy for echo-videos bucket (allow all reads and writes)
CREATE POLICY "Allow all operations on echo-videos"
ON storage.objects FOR ALL
USING (bucket_id = 'echo-videos')
WITH CHECK (bucket_id = 'echo-videos');
```

**Note:** For a family prototype, allowing all operations is fine. For production, you'd want to restrict based on user authentication.

### 2. AI Video Generation API

**Important:** Runway ML API has CORS restrictions and cannot be called directly from the browser. A proxy server is included to handle this.

#### Setup the Proxy Server

1. **Install dependencies:**
   ```bash
   cd echo
   npm install
   ```

2. **Set your Runway API key:**
   - Copy `.env.example` to `.env`
   - Edit `.env` and add your Runway API key:
     ```
     RUNWAY_API_KEY=your-actual-api-key-here
     ```

3. **Start the proxy server:**
   ```bash
   npm start
   ```
   
   The server will run on `http://localhost:3001`

4. **Keep the server running** while you use the app (open a separate terminal window)

#### Using the Proxy

The frontend is configured to use the proxy automatically. If your proxy is running on a different URL, set it in the browser console:
```javascript
window.PROXY_URL = 'http://localhost:3001'; // or your proxy URL
```

#### Alternative: Direct API (Not Recommended - Will Fail Due to CORS)

The app is configured to use Runway ML API for video generation. You have two options:

#### Option A: Use Proxy Server (Recommended)

Follow the "Setup the Proxy Server" instructions above. The proxy handles the API key securely on the server side.

#### Option B: Use Placeholder (For Testing Without API)

If the proxy server is not running or no API key is configured, the app will use a placeholder that returns the original photo. This allows you to test the upload and map functionality without API costs.

### 3. Local Development

1. Serve the files using a local server (required for ES6 modules):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

2. Open `http://localhost:8000/echo/` in your browser

### 4. Deployment

The `/echo` directory can be deployed alongside your existing site. If using GitHub Pages, ensure the files are included in the deployment.

## Usage

1. Click **"+ New Echo"** button
2. Upload a photo (drag & drop or click to select)
3. Add a story/narration about the photo
4. Enter the location (address search)
5. Enter the year
6. Click **"Generate Echo"**
7. Wait for AI video generation (may take 1-2 minutes)
8. View the Echo on the map
9. Click a pin to watch the video

## File Structure

```
/echo/
  ├── index.html      # Main HTML structure
  ├── styles.css      # All styling
  ├── app.js          # Main application logic
  ├── mapView.js      # Leaflet map integration
  ├── data.js         # Supabase client and data operations
  ├── server.js       # Proxy server for Runway API (handles CORS)
  ├── package.json    # Node.js dependencies for proxy server
  ├── .env.example    # Example environment variables
  └── README.md       # This file
```

## Current Limitations

- Single user (hardcoded as 'eric')
- No authentication
- AI video generation requires proxy server (included) and Runway API key
- No error recovery for failed video generations
- Basic styling (can be enhanced)

## Next Steps

- Add family member authentication
- Implement proper error handling and retries
- Add timeline view
- Style filters (Hollywood, Vintage, etc.)
- Batch photo uploads
- Export functionality
