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

Voyons maintenant comment complexifier un peu ce 1er proto, en définissant des "zones de dépôt". 

Pour cela il est possible d'utiliser les 

- onWillAccept
- onAccept




## Exemples

- drag_drop_test.dart
- material_arc.dart