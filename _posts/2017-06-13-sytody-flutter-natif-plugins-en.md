---
layout: post
title:  "Flutter, API natives et plugins (1/3) - En"
date:   2017-06-15 04:00:00 +0100
categories: dart flutter
excerpt_separator: <!--more-->
---

Sytody is a POC of todo app crossplatform (iOS & Android), which has the distinction of using voice recognition to add tasks.
It's a small experiment made in few hours with Flutter, during a rainy weekend 🌦 of May.

![spring](https://media.giphy.com/media/RrkNTIh8ymPPG/giphy.gif)

<!--more-->

That this story begins in May is in no way innocuous, quite the contrary ... It is well known, in french we say : 

>**"En mai, fais ce qu'il te plait !"**.

*(In may, do what you like)*
 
And for my part, for a few months, if there is something I like since few months : it's [Flutter](http://flutter.io) ,
a crossplatform development SDK developed by Google, based on their [Dart](http://darlang.org) language.
This tool has sunny my early professional 2017, by dramatically accelerating my productivity for mobile development,
opening up many prospects.

I think I'll have the opportunity to go into more detail about the reasons for this ⚡️, and the peculiarities of this tool,
whose version just tagged alpha has already collected more than [5000⭐️ on Github](http://github.com/flutter/flutter).

Today, I take the pretext of Sytody, to take an interest in a particular aspect of Flutter : 
its management of exchanges with the "host" platforms, the possibilities it offers to use the functions / API native of iOS / Android .

![sytody-screen]({{"/img/speech_reco_shots.png" | prepend:site.baseurl }})

After practicing, in depth, Air Mobile, Cordova via Meteor and Nativescript, this aspect has become central in the choice (or not) of a crossplatform SDK.

I would not go back on the complexity or difficulties, often WTF, encountered in my previous cross-platform explorations.

![aïe](https://media0.giphy.com/media/YIE4cgmV6KxBS/200.gif)

Rather, I will focus on the joy and bliss Flutter brought me on this issue (among others).

![spring joy](https://media2.giphy.com/media/wNipYAoZ3iaEE/200.gif)

## 1. Flutter-to-iOS & Flutter-to-Android
 
Like other solutions, Flutter offers a way to access all the functions of the OS on which the application is launched. Unlike other solutions, this means is simple, and most often without any capillotract configuration.

The team having (for the moment?) Abandoned the export of MacOS application, 3 platforms are officially managed: iOS, Android and [*Fuchsia*](https://github.com/fuchsia-mirror). 
And having not yet ventured into the (open) secrets of this last, my experience feedback concerns the two main mobile platforms to date: iOS and Android .

The principle of access to native functionality is based on the opening and use of channels . These channels allow :

- to call methods from Dart to native , (and / or vice versa): cf. [MethodChannel](https://docs.flutter.io/flutter/services/MethodChannel-class.html)
- Or send streams from Dart to the native (and / or vice versa), to broadcast data flows (coming from a sensor for example): cf. [BasicMessageChannel](https://docs.flutter.io/flutter/services/BasicMessageChannel-class.html) 

It's very simple, and very effective. For those who have known the [Action Message Format - AMF](https://en.wikipedia.org/wiki/Action_Message_Format) , we find the same principle of calling remote methods, except that in this case, it is not a communication client-> server but DartVM <-> OS host. The channels automatically manage the [**sérialisation des types "basiques"**](https://flutter.io/platform-channels/#codec) : String, Map, List and the various numeric types. 
 
For calling "remote" methods : 
- on the Flutter/Dart side, we instantiate a **MethodChannel**, givint it an identifier,
- and we instantiate **in ObjC or Swift for iOS**, 
- and/or **in Java or Kotlin for Android**.

The next step wil be to invoke methods via the channel, from one side to the other, by transmitting, or note, arguments. 

### Example

Let's take a very basic example : a simple method to retrive the version of the host. 

#### Côté Flutter/Dart

- we instantiate a channel named "plugin_demo"
- we invoke a method "getPlatformVersion" on this channel, without passing arguments

```dart
static const MethodChannel _channel = const MethodChannel('plugin_demo');
String platformVersion = await _channel.invokeMethod('getPlatformVersion');
```

*invokeMethod(String name, dynamic args)* returns a [Future](https://www.dartlang.org/tutorials/language/futures) ( aka promise ), which can be processed with .then(...) or [async/await](https://www.dartlang.org/articles/language/await-async).

#### iOS - Swift

- On crée là aussi un canal `FlutterMethodChannel` nommé "plugin_demo"
- on définit une fonction chargée de gérer les appels venant de Flutter.

```swift
let controller : FlutterViewController = window?.rootViewController as! FlutterViewController;
let flutterChannel = FlutterMethodChannel.init(name: "plugin_demo", binaryMessenger: controller);
  
flutterChannel.setMethodCallHandler({
  (call: FlutterMethodCall, result: FlutterResult) -> Void in
  if ("getPlatformVersion" == call.method) {
      result("iOS " + UIDevice.current.systemVersion);
    } else {
      result(FlutterMethodNotImplemented);
    }
});
```

#### Android - Java

- mêmes principes que pour iOS

```dart
new MethodChannel(getFlutterView(), "plugin_demo").setMethodCallHandler(
    new MethodCallHandler() {
        @Override
        public void onMethodCall(MethodCall call, Result result) {
            if (call.method.equals("getPlatformVersion")) {
              result.success("Android " + android.os.Build.VERSION.RELEASE);
            } else {
              result.notImplemented();
            }
        }
});
```

### Natif vers Dart

Même principe, mais cette fois **`invokeMethod`** est appelé côté "hôte", pour une exécution côté Dart.

Maintenant qu'on a le principe, au prochain épisode nous regarderons un exemple concret/complet avec l'implementation de la reconnaissance vocale. 

[> Flutter, API natives et plugins (2/3) ]({{ site.baseurl }}{% post_url 2017-06-13-sytody-flutter-natif-plugins2 %})

## Ressources

- [Documentation](https://flutter.io/platform-plugins/)
- [l'appli Sytody](http://github.com/rxlabz/sytody)
- [speech_recognition plugin](http://github.com/rxlabz/speech_recognition)
- [les plugins et packages Flutter](https://pub.dartlang.org/flutter/packages/)