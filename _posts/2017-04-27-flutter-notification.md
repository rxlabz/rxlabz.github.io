---
layout: post
title:  "Flutter : Bubbling de notification"
date:   2017-04-27 00:00:00 +0100
categories: dart, flutter
---

Ce n'est pas encore bien documenté, mais Flutter propose une alternative au mécanisme de propogation d'évenements DOM : 
il s'agit des **[notifications](https://docs.flutter.io/flutter/widgets/Notification-class.html)**.

## dispatch de notification


## Implémenter une Notification

Le principe est d'étendre la classe Notification pour définir un signal, et y associer des données que l'on souhaite transmettre aux composants parents.

```dart
class ColorNotification extends Notification {
  final Color color;
  ColorNotification(this.color);
}
```

## Émettre une notification

Dans ce petit exemple, on crée un composant ColorBox, qui émet une ColorNotification à chaque clic.

```dart
class ColorBox extends StatelessWidget {
  final Color color;
  final ColorNotification notif;

  ColorBox(this.color) : notif = new ColorNotification(color);

  @override
  Widget build(BuildContext context) {
    return new Padding(
        padding: new EdgeInsets.symmetric(horizontal: 20.0),
        child: new InkWell(
            onTap: () => notif.dispatch(context),
            child: new Container(
              color: color,
              width: 100.0,
              height: 100.0,
            )));
  }
}
```

Après **dispatch()**, une notif est "délivrée" aux écouteurs de notifications,
 **[NotificationListener](https://docs.flutter.io/flutter/widgets/NotificationListener-class.html)**, 
 déclarés dans les widgets parents.

## Écoute de notifications

Pour déclarer un écouteur de Notification, on rajoute une "couche" **NotificationListener<T>**.

```dart
@override
  Widget build(BuildContext context) {
    return new NotificationListener<ColorNotification>(
        onNotification: onColorNotif, child: getColorBoxes());
  }

  bool onColorNotif(ColorNotification notification) {
    setState(() => selectedColor = notification.color);
    return false; // arrête le *bubbling* de la notification
  }
```

### Bubbling

Le callback *onColorNotif* doit renvoyer un booléen indiquant si la propagation doit être poursuivie.

## Communication widget <-> children : alternatives

En ce qui concernent la transmission de données entre composants,
il me semble que les exemples officiels utilisent principalement des VoidCallBack, 
des [ChangeNotifier](https://docs.flutter.io/flutter/foundation/ChangeNotifier-class.html) 
ou des [ValueNotifier](https://docs.flutter.io/flutter/foundation/ValueNotifier-class.html).

On peut retrouver quelques Notifications dans le code source du framework, en particulier autour de la gestion du scrolling
 ( [ScrollNotification](https://docs.flutter.io/flutter/widgets/ScrollNotification-class.html) )
 

=> [Sources complétes de l'exemple](https://github.com/rxlabz/flutter_examples/blob/master/lib/color_notif_app.dart)