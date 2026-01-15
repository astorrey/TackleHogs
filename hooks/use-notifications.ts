import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuth } from './use-auth';
import { registerPushToken, removePushToken } from '@/lib/api/notifications';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermissionStatus(finalStatus);

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return null;
    }

    // Get Expo push token
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      // Configure channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6B7A4E',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }, []);

  // Register push token when user logs in
  useEffect(() => {
    if (user?.id) {
      registerForPushNotifications().then(async (token) => {
        if (token) {
          setExpoPushToken(token);
          try {
            await registerPushToken(
              user.id,
              token,
              Platform.OS as 'ios' | 'android' | 'web',
              Device.deviceName || undefined
            );
          } catch (error) {
            console.error('Error registering push token:', error);
          }
        }
      });
    }

    return () => {
      // Optionally remove token on logout
    };
  }, [user?.id, registerForPushNotifications]);

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listener for when user interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification type
      if (data?.type === 'friend_request') {
        // Navigate to friends screen
      } else if (data?.type === 'friend_catch') {
        // Navigate to catch detail
      } else if (data?.type === 'competition_update') {
        // Navigate to competition
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const unregisterPushToken = useCallback(async () => {
    if (expoPushToken) {
      try {
        await removePushToken(expoPushToken);
        setExpoPushToken(null);
      } catch (error) {
        console.error('Error removing push token:', error);
      }
    }
  }, [expoPushToken]);

  const requestPermissions = useCallback(async () => {
    const token = await registerForPushNotifications();
    if (token && user?.id) {
      setExpoPushToken(token);
      try {
        await registerPushToken(
          user.id,
          token,
          Platform.OS as 'ios' | 'android' | 'web',
          Device.deviceName || undefined
        );
      } catch (error) {
        console.error('Error registering push token:', error);
      }
    }
    return token;
  }, [registerForPushNotifications, user?.id]);

  return {
    expoPushToken,
    notification,
    permissionStatus,
    requestPermissions,
    unregisterPushToken,
  };
}
