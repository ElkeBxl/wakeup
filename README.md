# Ionic 3 with geofence

## Before you run the app
Run the following commands after cloning the repo (don't forget to cd into the repo):
```
npm install -g ionic cordova
npm i
```
## Run the app
For local development, run the following command:
```
ionic cordova run browser
```

After that it should be available on http://localhost:8000

To run it for Android:
```
ionic cordova run android -lc --address=localhost --verbose
```
## Notes

### Limitations

#### Background GPS tracking
Since Android 8 it is limited: https://developer.android.com/about/versions/oreo/background-location-limits To overcome this, we should add a foreground service to track the GPS in real time. A more complete explanation on the limitations: https://proximi.io/will-my-geofencing-function-in-the-background/

We have looked into the Cordova plugin that Ionic proposes to use but apparently it's not that stable if you look at the issues: https://github.com/mauron85/cordova-plugin-background-geolocation/issues 

#### Use of geofence plugin
The current code does not directly use the geofence plugin. Be careful when adding the plugin as you might have version conflicts in all the packages it relies on. Better to take v4.15.0 instead of the betas https://github.com/cowbell/cordova-plugin-geofence

### Use of Google Maps

#### No use of a plugin
Currently Google Maps is injected into the HTML. We could look into a Cordova plugin https://github.com/mapsplugin/cordova-plugin-googlemaps but this is currently not necessary. Has to be validated on a real device to see if the current way of working is enough.

#### API key
Currently we reuse the API key that was in the original repository. We should make our own one.

### Ionic 3 vs Ionic 4
Ionic 4 is at the moment still in beta. Usage of @ionic-native packages was troublesome as some still use rxjs 5 while Angular 7 (which is part of Ionic 4) requires rxjs 6. Other versions were also buggy. Be careful when trying to migrate to Ionic 4, best to revert some versions back to the previous ones. When starting migration, best also to completely rewrite the app from scratch: https://moduscreate.com/blog/upgrading-an-ionic-3-application-to-ionic-4/
Watch out for breaking changes: https://github.com/ionic-team/ionic/blob/master/angular/BREAKING.md

  

## Credits

Based on the https://github.com/kavithamadhavaraj/wakeup repo

## Other repositories we looked at

 - https://github.com/didinj/ionic3-angular5-cordova-geofence : gave errors when trying to launch with Cordova
 - https://github.com/HackAfro/ionic-geofence-app : makes use of Pusher, no idea if that is something to consider
 - https://github.com/tsubik/ionic2-geofence : made in Ionic 2, is it still interesting? Is the latest version of Cordova compatible?
 - https://github.com/transistorsoft/cordova-background-geolocation-lt : as an alternative for the Cordova plugin for the background GPS data

## Errors we faced

- "Cannot find module '../cordova/platform_metadata'": upgrade cordova-plugin-add-swift-support to 1.7.1 in package.json and run the following commands:
```
cordova plugin rm cordova-plugin-add-swift-support
cordova plugin add cordova-plugin-add-swift-support
```
- "Property 'create' does not exist on type 'typeof GoogleMaps'.": upgrade @ionic-native/google-maps to v4.15.1 https://github.com/ionic-team/ionic-native-google-maps/issues/105
- "ReferenceError: google is not defined": Add some code to the TS and make sure async and defer are in the script tags https://forum.ionicframework.com/t/solved-referenceerror-google-is-not-defined-ionic-v3-9-2-angular-v5-2-11/136839
```
declare var google;

<script async defer src="https://maps.googleapis.com/maps/api/js?key=API_KEY&callback=initMap">  </script>
```
