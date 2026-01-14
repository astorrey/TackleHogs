# TackleHogs Setup Guide

This guide will help you set up the TackleHogs application.

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- OpenWeatherMap API key (optional, for weather features)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings > API to get your:
   - Project URL
   - Anon (public) key
3. Run the database migration:
   ```bash
   # Install Supabase CLI if you haven't
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```
4. Set up Storage buckets:
   - Go to Storage in Supabase dashboard
   - Create buckets: `tackle-images` and `catch-photos`
   - Set them to public or configure RLS policies

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase (Required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (Required for Google Sign-In)
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-android-client-id.apps.googleusercontent.com

# Optional
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
EXPO_PUBLIC_APP_URL=tacklehogs://
```

## Step 4: Set Up Google OAuth

### 4.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or People API) for your project

### 4.2 Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Select **External** user type (or Internal for Google Workspace)
3. Fill in the required fields:
   - App name: `TackleHogs`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users if in testing mode

### 4.3 Create OAuth Client IDs

Go to **APIs & Services > Credentials > Create Credentials > OAuth Client ID**

#### Web Application (Required for Web + Supabase)
- Application type: **Web application**
- Name: `TackleHogs Web`
- Authorized JavaScript origins:
  - `http://localhost:8081` (development)
  - `https://your-domain.com` (production, if applicable)
- Authorized redirect URIs:
  - `https://zaqlrabgivfczuecioih.supabase.co/auth/v1/callback`
- Copy the **Client ID** → use as `EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB`

#### iOS Application
- Application type: **iOS**
- Name: `TackleHogs iOS`
- Bundle ID: `com.tacklehogs.app`
- Copy the **Client ID** → use as `EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS`

#### Android Application
- Application type: **Android**
- Name: `TackleHogs Android`
- Package name: `com.tacklehogs.app`
- SHA-1 certificate fingerprint:
  ```bash
  # For debug keystore (development)
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android
  
  # On Windows
  keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android
  ```
- Copy the **Client ID** → use as `EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID`

### 4.4 Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/zaqlrabgivfczuecioih/auth/providers)
2. Navigate to **Authentication > Providers > Google**
3. Enable the Google provider
4. Enter your **Web Client ID** and **Client Secret** (from the Web OAuth Client)
5. Save the configuration

### 4.5 Configure Redirect URLs in Supabase

1. Go to **Authentication > URL Configuration**
2. Set **Site URL**: `tacklehogs://`
3. Add **Redirect URLs**:
   - `tacklehogs://auth/callback`
   - `http://localhost:8081` (for web development)
   - `exp://localhost:8081` (for Expo Go development)

## Step 5: Deploy Edge Functions

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy scrape-tackle
supabase functions deploy get-suggestions
supabase functions deploy calculate-points
supabase functions deploy generate-year-review

# Set environment variables for functions
supabase secrets set OPENWEATHER_API_KEY=your_key
```

## Step 6: Run the Application

```bash
# Start Expo development server
npm start

# Or run on specific platform
npm run ios
npm run android
npm run web
```

## Step 7: Initial Data Setup

You'll need to seed some initial data:

1. **Fish Species**: Add common fish species to the `fish_species` table
2. **Locations**: Users can add locations, or you can pre-populate popular fishing spots

## Troubleshooting

### Google OAuth Issues

**"redirect_uri_mismatch" error:**
- Ensure the redirect URI in Google Cloud Console exactly matches: `https://zaqlrabgivfczuecioih.supabase.co/auth/v1/callback`
- Check that your Web Client ID is configured in Supabase

**"access_denied" error:**
- Verify OAuth consent screen is configured and published (or user is added as test user)
- Check that required scopes are added: `email`, `profile`, `openid`

**Mobile sign-in not working:**
- Verify the correct Client ID is used for each platform (iOS/Android)
- For Android: Ensure SHA-1 fingerprint matches your debug/release keystore
- For iOS: Ensure Bundle ID matches `com.tacklehogs.app`

**"Google Client ID not configured" error:**
- Add the required environment variables to your `.env` file
- Restart the Expo development server after changing environment variables

### General Authentication Issues
- Make sure OAuth redirect URLs are configured correctly in Supabase
- Check that `EXPO_PUBLIC_APP_URL` matches your app scheme (`tacklehogs://`)
- Verify Supabase URL and anon key are correct

### Storage Issues
- Ensure storage buckets are created and have proper RLS policies
- Check that images are being uploaded with correct content types

### Edge Function Issues
- Verify functions are deployed: `supabase functions list`
- Check function logs: `supabase functions logs function-name`

### Database Issues
- Verify migrations ran successfully
- Check RLS policies are set up correctly
- Ensure all foreign key relationships are valid

## Next Steps

- Customize the UI to match your brand
- Add more fish species to the database
- Configure leaderboard metrics
- Set up analytics (optional)
- Configure push notifications (optional)
