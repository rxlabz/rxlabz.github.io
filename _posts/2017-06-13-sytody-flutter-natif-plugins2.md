---
layout: post
title:  "Flutter, API natives et plugins (2/3)"
date:   2017-06-15 01:00:00 +0100
categories: dart, flutter, iOS, Android
excerpt_separator: <!--more-->
---

> "Faut qu'on parle..."

![hello computer](https://media3.giphy.com/media/PxSFAnuubLkSA/200.gif)

<!--more-->

## Speech recognition

Dans Sytody, l'UI fontionne de la manière suivante : 

- une fois la reconnaisance vocale détectée, un bouton permet de lancer l'enregistrement
- quand l'enregistrement démarre, 
    - le bouton d'écoute se transforme en bouton 'Stop', permettant de finaliser l'écoute et la transcription.
    - le champ de trancription apparait, si il y a des stranscription intermédiaires, elles sont affichées, 
    et un bouton \[x\]permet d'annuler l'écoute et donc la transcription en cours.

<div style="position:relative;height:0;padding-bottom:75.0%"><iframe src="https://www.youtube.com/embed/7MGuNZfgGWw?ecver=2" width="480" height="360" frameborder="0" style="position:absolute;width:100%;height:100%;left:0" allowfullscreen></iframe></div>

*Fonctionnement de Sytody*

### API natives

Android(4.1+) et iOS(10+) proposent chacun une API de reconnaissance vocale :

- iOS : [Speech API](https://developer.apple.com/reference/speech)
- Android : [SpeechRecognizer](https://developer.android.com/reference/android/speech/SpeechRecognizer.html)

Pour les utiliser depuis l'application Flutter, nous allons donc définir un canal dédié aux fonctionnalités de reconnaissance : activer , démarrer et arrêter l'analyse, afficher la transcription.

Le schéma nous montre les différentes étapes nécessaires :

![sytody-screen]({{"/img/sytody_diagr.png" | prepend:site.baseurl }})

1. Notre application Flutter **demande l'activation ou la permission** d'utiliser la reconnaissances vocale. 
Si c'est le 1er lancement, sur iOS et Android 7.1+, l'utilisateur doit accepter la demande.

2. une fois la demande acceptée, l'hôte, appelle invoque une méthode côté Flutter pour confirmer l'activation de la reconnaissance pour l'application demandeuse.

3. A partir de là, Flutter peut lancer l'analyse en invoquant la méthode "listen" via le canal dédié.
 
4. Une fois l'écoute lancée, l'hôte invoque une méthode `onRecognitionStarted()`

5. Dès lors, sur iOS, l'application recevra
  - les transcriptions intermédiaires (sujettes à corrections/améliorations), 
  - puis, une fois que l'utilisateur arrête la reconnaissance ( `speech.stop()` ), la transcription finalisée ( sur mon device Android 6.0, l'application reçoit seulement la transcription finale ).

### 1ère implémentation

#### Flutter / Dart

Ici une class SpeechRecognizer qui gère les échanges Flutter/OS

```dart
const MethodChannel _speech_channel =
    const MethodChannel("bz.rxla.flutter/recorder");

class SpeechRecognizer {
  
  // gestion des appels effctués par l'hôte
  // dans cette 1ère implémentation on définit un handler globale
  // dans le plugin final dans la 3ème partie
  static void setMethodCallHandler(handler) {
    _speech_channel.setMethodCallHandler(handler);
  }

  // activation / permission
  static Future activate() {
    return _speech_channel.invokeMethod("activate");
  }

  // démarrage de l'écoute
  static Future start(String lang) {
    return _speech_channel.invokeMethod("start", lang);
  }

  // arrêt de l'écoute et annulation de la transcription
  static Future cancel() {
    return _speech_channel.invokeMethod("cancel");
  }

  // arrêt de l'écoute et finalisation de la transcription
  static Future stop() {
    return _speech_channel.invokeMethod("stop");
  }
}

```

Dans cette première implémentation, le handler des appels venant de l'OS est défini en dehors de la classe SpeechRecognizer

```dart
Future _platformCallHandler(MethodCall call) async {
    switch (call.method) {
      case "onSpeechAvailability":
        setState(() => isListening = call.arguments);
        break;
      case "onSpeech":
        print('_TranscriptorAppState._platformCallHandler '
            '=> onSpeech = ${call.arguments}');
        if (todos.isNotEmpty) {
          if (transcription != todos.last.label) {
            setState(() => transcription = call.arguments);
          }
        } else
          setState(() => transcription = call.arguments);
        break;
      case "onRecognitionStarted":
        print('_TranscriptorAppState._platformCallHandler '
            '=> started');
        setState(() => isListening = true);
        break;
      case "onRecognitionComplete":
        print('_TranscriptorAppState._platformCallHandler '
            '=> onRecognitionComplete = ${call.arguments}');
        setState(() {
          //isListening = false;
          if (todos.isEmpty) {
            transcription = call.arguments;
          } else if (call.arguments == todos.last?.label)
            // on ios user can have correct partial recognition
            // => if user add it before complete recognition just clear the transcription
            transcription = '';
          else
            transcription = call.arguments;
        });
        break;
      default:
        print('Unknowm method ${call.method} ');
    }
  }
```

#### iOS / Swift

Côté iOS, c'est dans l'appDelegate qu'on créé ici le canal `recorderChannel:FlutterMethodChannel`, et qu'on définit les handlers pour les différentes méthodes appelées.

```swift
override func application(
     _ application: UIApplication,
     didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {

    let controller: FlutterViewController = window?.rootViewController as! FlutterViewController

    recorderChannel = FlutterMethodChannel.init(name: "bz.rxla.flutter/recorder",
       binaryMessenger: controller)
    recorderChannel!.setMethodCallHandler({
      (call: FlutterMethodCall, result: @escaping FlutterResult) -> Void in
      if ("start" == call.method) {
        self.startRecognition(lang: call.arguments as! String, result: result)
      } else if ("stop" == call.method) {
        self.stopRecognition(result: result)
      } else if ("cancel" == call.method) {
        self.cancelRecognition(result: result)
      } else if ("activate" == call.method) {
        self.activateRecognition(result: result)
      } else {
        result(FlutterMethodNotImplemented)
      }
    })
    return true
  }
```

l'implémentation de ces méthodes ne concerne pas Flutter, donc je ne rentre pas plus dans le détails.
cf. [/Users/rxlabz/dev/projects/sytody_app/ios/Runner/AppDelegate.swift](https://github.com/rxlabz/sytody/blob/master/ios/Runner/AppDelegate.swift)


#### Android / Java

même API côté Android, même si l'implémentation suit ici les principes d'Android.

```dart
speechChannel = new MethodChannel(getFlutterView(), SPEECH_CHANNEL);
        speechChannel.setMethodCallHandler(
                new MethodChannel.MethodCallHandler() {
                    @Override
                    public void onMethodCall(MethodCall call, MethodChannel.Result result) {
                        if (call.method.equals("activate")) {
                            result.success(true);
                        } else if (call.method.equals("start")) {
                            recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, getLocale(call.arguments.toString()));
                            cancelled = false;
                            speech.startListening(recognizerIntent);
                            result.success(true);
                        } else if (call.method.equals("cancel")) {
                            speech.stopListening();
                            cancelled = true;
                            result.success(true);
                        } else if (call.method.equals("stop")) {
                            speech.stopListening();
                            cancelled = false;
                            result.success(true);
                        } else {
                            result.notImplemented();
                        }
                    }
                }
        );
```

cf. [sytody_app/android/app/src/main/java/bz/rxla/flutter/sytody/MainActivity.java](https://github.com/rxlabz/sytody/blob/master/android/app/src/main/java/bz/rxla/flutter/sytody/MainActivity.java)

Voilà pour une v0.1, et pour cette deuxième partie.

Dans la troisième et dernière partie, nous verrons comment modulariser ces fonctionnalités crossplatform, en créant un plugin dédié, facilement réutilisable.

[> Flutter, API natives et plugins (3/3) ]({{ site.baseurl }}{% post_url 2017-06-13-sytody-flutter-natif-plugins3 %})

![bistro](https://media.giphy.com/media/ig4sX0LKpeGly/200.gif)

## Ressources

- [Documentation](https://flutter.io/platform-plugins/)
- [l'appli Sytody](http://github.com/rxlabz/sytody)
- [speech_recognition plugin](http://github.com/rxlabz/speech_recognition)
- [les plugins et packages Flutter](https://pub.dartlang.org/flutter/packages/)