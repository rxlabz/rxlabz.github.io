---
layout: post
title:  "Drag'n'Drop avec Flutter - part1"
date:   2017-04-16 00:00:00 +0100
categories: dart, flutter
---

Flutter propose plusieurs solutions pour gérer le drag'n'drop.

Dans ce 1er article nous nous intéressons à la plus simple :  

## Draggable

Le composant draggable permet d'encapsuler un widget et de le rendre... draggable.

Un Dragable doit évidement contenir un élément enfant *child* et définir un "avatar de déplacement" *feedback*.
Le feedback représente le widget pendant qu'il est déplacé.
 
```dart
var draggable = new Draggable(
  feedback:new Container(wid),
  child:new Container(width:100.0, height:100.0, color:Colors.cyan,
  child:new Center(child:new Text('Madrid')))
);
```

On peut a présent déplacer l'élement,... enfin presque. Pour le moment l'objet retourne à sa position initiale au moment où on le relâche.

Pour le déplacer, on peut surveiller le lâcher via un callback *onDraggableCanceled*.
 
```dart
@override
Widget build(BuildContext context) {
    final item = new LabelBox(size: new Size.square(200.0), label: 'Madrid');
    final avatar = new LabelBox(
        size: new Size.square(150.0), label: 'Madrid', opacity: 0.4);
    final draggable = new Draggable(
        feedback: avatar,
        child: item,
        onDraggableCanceled: (velocity, offset) {
          print('_DragBoxState.build -> offset ${offset}');
          setState(() => position = offset);
        });
    return new Positioned(
        left: position.dx, top: position.dy, child: draggable);
}
```

Dans cet exemple, l'objet est réellement déplacé, on pourrait, par conséquent, souhaiter mieux donner cette illusion, 
en masquant l'objet original pendant le déplacement. Pour cela on peut ici utiliser la propriété *childWhenDragging*.
Cette dernière permet de définir l'apparence de l'objet déplacé, pendant son déplacement.

```dart
@override
Widget build(BuildContext context) {
    final item = new LabelBox(size: new Size.square(200.0), label: 'Madrid');
    final avatar = new LabelBox(
        size: new Size.square(150.0), label: 'Madrid', opacity: 0.4);
    final draggable = new Draggable(
        feedback: avatar,
        child: item,
      childWhenDragging: new Opacity(opacity: 0.0, child: item),
        onDraggableCanceled: (velocity, offset) {
          print('_DragBoxState.build -> offset ${offset}');
          setState(() => position = offset);
        });
    return new Positioned(
        left: position.dx, top: position.dy, child: draggable);
}
```

## DragTarget

Voyons maintenant comment complexifier un peu ce 1er proto, en définissant une "zone de dépôt". 

Pour cela il est possible d'utiliser un widget *DragTarget*.

Cette container va nous permettre de définir trois callbacks pour gérer le dépot :

- un *builder* : ce callback recevra le context, la liste des élements en cours de survol de la zone, et les éléments rejetés.
- *onWillAccept* : permet de déterminer les conditions d'acceptation du dépot
- *onAccept* : permet de définir une "réaction" au dépot 

```dart
new DragTarget(
  builder: (BuildContext context, List<dynamic> accepted,
      List<dynamic> rejected) {
    final hovered = accepted.length > 0;
    return new Container(
        width: 200.0,
        height: 200.0,
        decoration: new BoxDecoration(
            backgroundColor: hovered
                ? Colors.cyan.shade100
                : Colors.grey.shade200,
            border: new Border.all(
                width: 2.0,
                color: hovered ? Colors.cyan : Colors.grey)),
        child: new Center(child: new Text(selection ?? 'Drop here' )));
  },
  onWillAccept: (value) => selection == null,
  onAccept: (value) => setState(() {
        selection = value;
}))
```

Dans cet exemple, on accepte qu'un seul dépot : une fois que la zone a une *selection*, les dépots sont refusés.

## Examples

- [code complet de cet exemple](https://github.com/rxlabz/flutter_dropcity/blob/master/lib/drag_drop_basics.dart)
- [petit jeu de capitale](https://github.com/rxlabz/flutter_dropcity/blob/master/lib/main.dart)

![dropcity]({{"/img/dropcity1.png" | prepend:site.baseurl }})

**repo officiel**

- [basics](https://github.com/flutter/flutter/blob/master/dev/manual_tests/drag_and_drop.dart)  
- [advanced](https://github.com/flutter/flutter/blob/master/dev/manual_tests/material_arc.dart)
arc.dart