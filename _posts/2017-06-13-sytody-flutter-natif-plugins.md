---
layout: post
title:  "Flutter, API natives et plugins (1/3)"
date:   2017-06-15 00:00:00 +0100
categories: dart flutter
excerpt_separator: <!--more-->
---

Sytody est un POC de todo app crossplatform (iOS&Android), 
qui a la particularité d'utiliser la **reconnaissance vocale pour ajouter des tâches**;
c'est une petite expérimentation réalisée en quelques heures avec [Flutter](http://flutter.io), 
durant un week-end 🌦 de mai.

![spring](https://media.giphy.com/media/RrkNTIh8ymPPG/giphy.gif)

<!--more-->

Que ce récit débute au mois de mai n'est en rien anodin, bien au contraire... 
C'est bien connu : 

>**"En mai, fais ce qu'il te plait !"**.
 
Et pour ma part, depuis quelques mois, s'il y a un bien truc qui me plait : c'est [Flutter](http://flutter.io), 
un SDK de développement crossplatform développé par Google, basé sur leur langage [Dart](https://www.dartlang.org).
Cet outil a ensoleillé mon début d'année 2017 professionnelle, 
en accélérant radicalement ma productivité pour le développement mobile, ouvrant ainsi de nombreuses perspectives.

J'aurais, je pense, l'occasion de revenir plus en détail sur les raisons de ce ⚡️ coup de foudre,
et les particularités de cet outil, dont la version tout juste taggée *alpha*, 
a déjà recueilli plus de [5000⭐️ Github](https://githib.com/flutter/flutter)...

Aujourd'hui, je prends le prétexte de Sytody, pour m'intéresser à un aspect particulier de Flutter : 
sa gestion des échanges avec les plateformes "hôtes", 
càd les possiblités qu'il offre pour **utiliser les fonctions/API natives de iOS/Android**.

![sytody-screen]({{"/img/speech_reco_shots.png" | prepend:site.baseurl }})

Après avoir pratiqué, ± en profondeur, Air Mobile, Cordova via Meteor et Nativescript, 
cette dimension est devenue primordiale dans le choix (ou non) d'une techno crossplatform.

Je ne reviendrais pas sur la complexité ou les difficultés, souvent WTF, rencontrées dans mes précédentes explorations cross-plateformes.

![aïe](https://media0.giphy.com/media/YIE4cgmV6KxBS/200.gif)

Je vais plutôt m'étendre sur la joie et la béatitude que m'a apporté Flutter sur cette question (entre autres).

![spring joy](https://media2.giphy.com/media/wNipYAoZ3iaEE/200.gif)

## 1. Echanges Flutter <-> iOS & Flutter <-> Android
 
Comme les autres solutions, 
Flutter offre un moyen d'accéder à l'ensemble des fonctions de l'OS sur lequel l'appli est lancée.
Contrairement à d'autres solutions, ce moyen est simple, et le plus souvent sans aucune configuration capillotractée. 

L'équipe ayant (pour le moment?) abandonné la compilation d'application MacOS,
3 plateformes sont officiellement gérées : iOS, Android et [*Fuchsia*](https://github.com/fuchsia-mirror). 
Et ne m'étant pas encore aventuré dans les secrets (ouverts) de cette dernière, 
mon retour d'expérience concerne les deux principales plateformes mobiles à ce jour : **iOS et Android**.

L'accès aux fonctionnalités natives est basé sur l'ouverture et l'utilisation de *canaux*. 
Ces canaux permettent :

- soit d'**appeler des méthodes de Dart vers le natif**, ( et/ou inversement ) : 
cf. [MethodChannel](https://docs.flutter.io/flutter/services/MethodChannel-class.html)
- soit d'**envoyer des streams** de Dart vers le natif ( et/ou inversement ), 
pour **diffuser des flux de données** (venant d'un capteur par exemple) : 
cf. [BasicMessageChannel](https://docs.flutter.io/flutter/services/BasicMessageChannel-class.html) 

C'est très simple, et très efficace. Pour ceux qui ont connus l'[AMF](https://en.wikipedia.org/wiki/Action_Message_Format), on retrouve un peu le même principe d'appel de méthodes distantes, sauf que dans le cas présent, ce n'est pas une communication client->serveur mais DartVM<->OS hôte. Les canaux gérent automatiquement la [**sérialisation des types "basiques"**](https://flutter.io/platform-channels/#codec) : String, Map, List et les différents types numériques. 
 
Pour invoquer une méthode: 
- côté Dart/Flutter, on instancie un canal **MethodChannel**, en lui donnant un identifiant,
- et on instancie l'équivalent, **en ObjC ou Swift pour iOS**, 
- et/ou **en Java ou Kotlin pour Android**.
- on définit ensuite pour chaque canal, un *messageHandler*, en définissant son API, la liste des méthodes auxquelles le canal donne accès.

Ensuite, il ne reste qu'à invoquer des méthodes via les canaux, d'un côté vers l'autre, en transmettant, ou pas, des arguments. 

### Exemple

Prenons un exemple très basique : 
une simple méthode de récupération de la version de l'OS hôte.

#### Côté Flutter/Dart

- On instancie un canal nommé "plugin_demo"
- On invoque une méthode "getPlatformVersion" sur ce canal, sans passer d'arguments.

```dart
static const MethodChannel _channel = const MethodChannel('plugin_demo');
String platformVersion = await _channel.invokeMethod('getPlatformVersion');
```

La méthode *invokeMethod* renvoie un [Future](https://www.dartlang.org/tutorials/language/futures) ( aka promise ), 
qu'on peut traiter via un .then(...) ou via [async/await](https://www.dartlang.org/articles/language/await-async).

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

Maintenant qu'on a le principe, au prochain épisode nous regarderons un exemple concret/complet avec l'implémentation de la reconnaissance vocale. 

[> Flutter, API natives et plugins (2/3) ]({{ site.baseurl }}{% post_url 2017-06-13-sytody-flutter-natif-plugins2 %})

![speakToIt](https://media4.giphy.com/media/v4en5Vk01dV84/200.gif#13-grid1)

## Ressources

- [Documentation](https://flutter.io/platform-plugins/)
- [l'appli Sytody](http://github.com/rxlabz/sytody)
- [speech_recognition plugin](http://github.com/rxlabz/speech_recognition)
- [les plugins et packages Flutter](https://pub.dartlang.org/flutter/packages/)