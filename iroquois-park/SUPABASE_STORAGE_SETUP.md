# Supabase Storage Setup for Image Uploads

This document explains how to set up Supabase Storage for location image uploads.

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `location-images`
   - **Public bucket**: ✅ **Enable** (so images can be accessed via public URLs)
   - Click **"Create bucket"**

## Step 2: Set Bucket Policies (RLS)

Since the bucket is public, you can set policies to allow uploads. For now (single user), you can use:

1. Go to **Storage** → **Policies** → `location-images`
2. Click **"New Policy"**
3. Create an **"Allow INSERT"** policy:
   - Policy name: `Allow public uploads`
   - Allowed operation: `INSERT`
   - Policy definition: In the text field, **delete** the existing text (`bucket_id = 'location-images'`) and type: `true`
     - This allows anyone to upload (fine for now since you're the only user)
4. Create an **"Allow DELETE"** policy:
   - Policy name: `Allow public deletes`
   - Allowed operation: `DELETE`
   - Policy definition: In the text field, **delete** the existing text and type: `true`

**Note**: Once you remove the add/edit buttons and make the site public, you should restrict these policies or remove them entirely.

## Step 3: Verify Setup

The app will automatically use the `location-images` bucket once it's created. No code changes needed.

## Image Upload Features

- **File size limit**: 5MB per image
- **Allowed types**: JPEG, PNG, WebP
- **Automatic optimization**: Images are resized to max 1920x1920px and compressed before upload
- **Multiple images**: Users can upload multiple images per location
- **Image management**: Users can add/remove images when editing locations

## Storage Usage

- Free tier: 1GB storage, 2GB bandwidth/month
- Monitor usage in Supabase dashboard under **Storage** → **Usage**
