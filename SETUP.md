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
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
EXPO_PUBLIC_APP_URL=tacklehogs://
```

## Step 4: Set Up Authentication Providers

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Google OAuth:
   - Add your Google OAuth credentials
   - Set redirect URL: `tacklehogs://`
3. Enable Apple OAuth (iOS only):
   - Configure Apple Sign In
   - Set redirect URL: `tacklehogs://`

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

### Authentication Issues
- Make sure OAuth redirect URLs are configured correctly
- Check that `EXPO_PUBLIC_APP_URL` matches your app scheme

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
