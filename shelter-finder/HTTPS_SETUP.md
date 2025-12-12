# HTTPS Setup for Local Development

This guide explains how to set up HTTPS for local development, which is required for geolocation to work on iOS Safari.

## Why HTTPS?

iOS Safari requires HTTPS for geolocation API access (except for localhost). To test geolocation features on your iPhone, you'll need to serve the app over HTTPS.

## Option 1: Using mkcert (Recommended)

1. **Install mkcert:**
   ```bash
   brew install mkcert
   ```

2. **Install the local CA:**
   ```bash
   mkcert -install
   ```

3. **Generate certificates:**
   ```bash
   cd shelter-finder
   mkcert localhost 127.0.0.1 ::1 YOUR_LOCAL_IP
   ```
   Replace `YOUR_LOCAL_IP` with your computer's local IP address (e.g., `192.168.1.171`).

4. **Rename the certificates (optional):**
   The certificates will be named something like `localhost+3.pem` and `localhost+3-key.pem`. The vite config will automatically detect these common names.

## Option 2: Using Environment Variables

You can also specify custom certificate paths using environment variables:

1. **Create a `.env.local` file:**
   ```bash
   VITE_HTTPS_CERT=/path/to/your/cert.pem
   VITE_HTTPS_KEY=/path/to/your/key.pem
   ```

2. **The server will automatically use these certificates when starting.**

## Certificate File Names

The vite config will automatically look for certificates with these names:
- `localhost+3.pem` / `localhost+3-key.pem`
- `localhost.pem` / `localhost-key.pem`
- `cert.pem` / `key.pem`

## Security Note

**Never commit certificate files to the repository!** They are already in `.gitignore`. Each developer should generate their own certificates for local development.

## Accessing on iPhone

Once HTTPS is set up:

1. Find your computer's local IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. On your iPhone, open Safari and go to:
   ```
   https://YOUR_IP:5173
   ```

3. You'll see a security warning (expected for self-signed certificates). Tap "Advanced" → "Proceed to [your IP]"

4. Geolocation should now work!

