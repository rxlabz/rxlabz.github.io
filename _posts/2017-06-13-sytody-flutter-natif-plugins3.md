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
2. Dans la [seconde partie]({{ site.baseurl }}{% post_url 2017-06-13-sytody-flutter-natif-plugins2 %}) nous avons vu comment utiliser les API de *speech recognition*.

Nous allons maintenant voir comment modulariser ce code en créant un plugin.

## Le système de plugin 😍  

Les plugins sont gérés comme de simples packages (dépendances), via `pub` le gestionnaire de packages de Dart.
Il suffit de déclarer la dépendance, de `pub get`, et Flutter se charge de metre à jour le projet XCode et Android.
C'est tellement efficace et transparent, 
que pour le moment je n'ai même pas encore eu à comprendre ce qu'était Graddle,
ni comment marche un podfile. Tout est géré par Flutter 😎🍹!

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
    ```

3. on importe le package

    ```dart
    import 'package:speech_recognition/speech_recognition.dart';
    ```

Et c'est tout !

![happy](https://media.giphy.com/media/vOJ2QFIAZtyU0/200.gif)

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

A partir de là, il ne reste plus qu'à bouger la classe SpeechRecognition vers le projet plugin, ainsi que le code Swift et Java associé.
cf. [speech_recognition plugin](http://github.com/rxlabz/speech_recognition)

Pour la publication sur pub.dartlang.com: 

```shell
pub publish
```

![hooray](https://media4.giphy.com/media/y70XSpwyBC6LC/200.gif)

## Ressources

- [Documentation](https://flutter.io/platform-plugins/)
- [l'appli Sytody](http://github.com/rxlabz/sytody)
- [speech_recognition plugin](http://github.com/rxlabz/speech_recognition)
- [les plugins et packages Flutter](https://pub.dartlang.org/flutter/packages/)
