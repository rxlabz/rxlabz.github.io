---
layout: post
title:  "Flutter, API natives et plugins (3/3)"
date:   2017-06-15 02:00:00 +0100
categories: dart flutter
excerpt_separator: <!--more-->
---

C'est également en mai, qu'a éclos le système de plugin, un magnifique mécanisme permettant d'utiliser de manière 
quasi transparente des fonctionnalités natives depuis Flutter/Dart.

![lighter](https://media2.giphy.com/media/fyiWlpMCHjWGk/200.gif)

<!--more-->

1. Dans la [première partie]({{ site.baseurl }}{% post_url 2017-06-13-sytody-flutter-natif-plugins %}) nous avons vu les bases de l'utilisation des *MethodChannels*.
2. Dans la [seconde partie]({{ site.baseurl }}{% post_url 2017-06-13-sytody-flutter-natif-plugins2 %}) nous avons vu comment créer un canal dédié à la *speech recognition*.

Nous allons maintenant voir comment modulariser ce code en créant un plugin Flutter pour iOS & Android.

## Le système de plugin 😍  

Les plugins Flutter sont gérés comme de simples packages (dépendances), via `pub` le gestionnaire de packages de Dart.
Il suffit de déclarer la dépendance, de `pub get`, et Flutter se charge de metre à jour le projet XCode et Android.
C'est tellement efficace et transparent, 
que pour le moment je n'ai même pas encore eu à comprendre ce qu'était Graddle,
ni comment marche un podfile. Tout est géré par Flutter 😎🍹! ça laisse plus de temps pour développer l'appli :)

Même si le [catalogue de plugins Flutter](https://pub.dartlang.org/flutter/plugins/) est encore embryonnaire, 
il propose déjà quelques outils utiles, voire nécessaires.

### Utilisation 

Pour utiliser un plugin :

1. on déclare la dépendance dans le pubspec.yaml du projet

    ```yaml
    dependencies:
      speech_recognition: "^0.2.0+1"
    ```

2. on importe le package

    ```shell
    flutter packages get
    flutter build ios
    flutter build apk
    ```

3. on importe le package

    ```dart
    import 'package:speech_recognition/speech_recognition.dart';
    ```

4. 

Et c'est tout !

![happy](https://media.giphy.com/media/vOJ2QFIAZtyU0/200.gif)

En fait c'est tout, sauf si le plugin ne nécessite des permissions particulières, c'est tou; mais dans le cas 

Ensuite au moment ou on lance l'application, selon l'OS visé, Flutter installera et gérera les dépendances iOS/Android, de manière à ce que le code natif soit correctement mis à disposition.

L'équipe a pour cela mis en place un système d'auto-enregistrement des plugins qui marche à merveille, et permet, dans la plupart des cas, de ne pas avoir à toucher à xCode ou Android Studio. 🥂🍾

### Création

Mais ça va encore plus loin ! :) Et là où ça tombe encore + de la machoire, c'est dans l'outillage pour la création de plugin.
Je l'ai trouvé tellement efficace que j'en suis à 4 plugins publiés, alors qu'à la base, 
le moins que je puisse dire, c'est que ce n'était pas du tout ma spécialité, les plugins crossplatform :).

Flutter CLI propose une commande de génération de dossier de plugin, contenant un projet d'exemple préconfiguré pour l'utilisation du plugin créé :

```bash
flutter create -i swift --org bz.rxla --plugin mon_plugin
```

- `-i swift` : on souhaite utiliser Swift pour le code iOS, et pas ObjC défini par défaut
- `-a kotlin` : si on souhaite utiliser Kotlin à la place du Java par défaut côté Android
- `--org mon.domaine` : namespace du plugin 
- `--plugin mon_plugin` : le nom du plugin

On peut noter que la même commande avec `un_projet` à la place de `--plugin mon_plugin` générera un projet Flutter Swift/Java.  

Côté Dart, le code généré est très simple, il contient uniquement la création d'un canal "dédié". 
L'aspect le plus intéressant de ce système est l'auto-détection / installation des plugins "natifs" côté iOS et Android.

#### Flutter / Dart

Voici le code généré pour la partie Dart d'un plugin :

```dart
// plugin_demo/lib/plugin_demo.dart

class PluginDemo {
  static const MethodChannel _channel =
      const MethodChannel('plugin_demo');

  static Future<String> get platformVersion =>
      _channel.invokeMethod('getPlatformVersion');
}
```

#### iOS / Swift


L'utilisation de Swift ajoute une petite couche, avec la génération à la fois de fichiers ObjC PluginDemoPlugin.h & .m, et la class SwiftPluginDemoPlugin.

Le fichier `SwiftPluginDemoPlugin.swift` contient le mécanisme qui permet l'auto-détection du plugin par une application :
 il s'agit ici de la méthode statique `register`, appelée par l'application au lancement
 pour transmettre un `FlutterPluginRegistrar`. Le rôle est du registrar est d'ajouter le canal créé par le plugin 
 à la liste des "récepteurs" des appels sur la MethodChannel, de manière à lui permettre de recevoir les appels qui lui sont destinés, 
 via sa méthode `handle`.

```swift
// plugin_demo/ios/classes/SwiftPluginDemoPlugin.swift

public class SwiftPluginDemoPlugin: NSObject, FlutterPlugin {
  public static func register(with registrar: FlutterPluginRegistrar) {
    let channel = FlutterMethodChannel(name: "plugin_demo", binaryMessenger: registrar.messenger());
    let instance = SwiftPluginDemoPlugin();
    registrar.addMethodCallDelegate(instance, channel: channel);
  }

  public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    result("iOS " + UIDevice.current.systemVersion);
  }
}
```

#### Android / Java


On retrouve le même principe de `registrar` côté Java pour Android.

```dart
// plugin_demo/android/src/main/java/mon/domaine/plugin_demo/PluginDemoPlugin.java

public class PluginDemoPlugin implements MethodCallHandler {
  /**
   * Plugin registration.
   */
  public static void registerWith(Registrar registrar) {
    final MethodChannel channel = new MethodChannel(registrar.messenger(), "plugin_demo");
    channel.setMethodCallHandler(new PluginDemoPlugin());
  }

  @Override
  public void onMethodCall(MethodCall call, Result result) {
    if (call.method.equals("getPlatformVersion")) {
      result.success("Android " + android.os.Build.VERSION.RELEASE);
    } else {
      result.notImplemented();
    }
  }
}
```

### Implementation 

A partir de là, il ne reste plus qu'à "bouger" l'implementation de classe SpeechRecognition vers le projet plugin, ainsi que le code Swift et Java associé.
cf. [speech_recognition plugin](http://github.com/rxlabz/speech_recognition)

Pour la publication sur pub.dartlang.com: 

```shell
pub publish
```

![hooray](https://media4.giphy.com/media/y70XSpwyBC6LC/200.gif)

## Ressources

- [Documentation Flutter](https://flutter.io/platform-plugins/)
- [l'appli Sytody](http://github.com/rxlabz/sytody)
- [speech_recognition plugin](http://github.com/rxlabz/speech_recognition)
- [les plugins et packages Flutter](https://pub.dartlang.org/flutter/packages/)
