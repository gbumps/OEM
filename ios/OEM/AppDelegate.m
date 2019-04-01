/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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

//- (void) application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
//fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
//  [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
//}
//
//- (void) application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
//  [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
//}
//
//- (void) userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
//
//  [[RNFirebaseMessaging instance] didReceiveRemoteNotification:response.notification.request.content.userInfo];
//  completionHandler();
//}

