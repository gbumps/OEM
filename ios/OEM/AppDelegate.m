#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <ReactNativeNavigation/ReactNativeNavigation.h>
#import <Firebase.h>
#import <RNFirebaseMessaging.h>
#import <RNFirebaseNotifications.h>
#import <GoogleMaps/GoogleMaps.h>


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  [ReactNativeNavigation bootstrap:jsCodeLocation launchOptions:launchOptions];
  [FIRApp configure];
  //[[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];
  [RNFirebaseNotifications configure];
    [GMSServices provideAPIKey:@"AIzaSyBzi6k4xf4dNTVRofgFajZKQbApQ_hbzzc"];
  return YES;
}

@end
