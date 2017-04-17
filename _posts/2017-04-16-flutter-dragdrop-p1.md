---
layout: post
title:  "Drag'n'Drop avec Flutter - part1"
date:   2017-04-16 00:00:00 +0100
categories: dart, flutter
---

Flutter propose plusieurs options pour gérer des interactions de drag'n'drop.

Nous nous intéressons ici à la plus simple : à l'aide des [Draggable\<T\>](https://docs.flutter.io/flutter/widgets/Draggable-class.html) et [DragTarget\<T\>](https://docs.flutter.io/flutter/widgets/DragTarget-class.html). 

Flutter privilégie très souvent la composition à l'héritage. 
De nombreuses fonctionnalités du framework fonctionnent par superpositions de couches de fonctionnalités. 
C'est le cas pour les composants de Drag'n'drop. 

### Draggable<T> : élement déplacable

Le composant **Draggable** permet d'encapsuler un widget et de le rendre... draggable.

Un *Draggable* doit évidement avoir un contenu **child** et définir un "avatar de déplacement", son **feedback**.
Le feedback représente le widget pendant qu'il est déplacé.
 
```dart
var draggable = new Draggable(
  feedback:new Container(wid),
  child:new Container(
    width:100.0, height:100.0, color:Colors.cyan,
    child:new Center(child:new Text('Madrid')
   ))
);
```

L'élement est maintenant déplaçable,... enfin presque.

Pour le moment l'objet retourne à sa position initiale au moment où on le relâche. Pour le déplacer, on peut surveiller le lâcher via un callback **onDraggableCanceled**.
On peut ainsi récupérer la position du lâcher, et même sa vélocité.
 
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
en masquant l'objet original pendant le déplacement. Pour cela on peut ici utiliser la propriété **childWhenDragging**.

Cette dernière permet de définir l'apparence de l'objet déplacé, pendant son déplacement.

```dart
@override
Widget build(BuildContext context) {
    final item = new LabelBox(size: new Size.square(200.0), label: 'Madrid');
    final avatar = new LabelBox(
        size: new Size.square(150.0), label: 'Madrid', opacity: 0.4);
    final draggable = new Draggable<String>(
      data: widget.text,
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

En général, une interaction de drag'n'drop n'a pas pour but de déplacer un composant graphique, mais plutôt une donnée qui lui est associée.
Pour définir les données à associer à un *Draggable*, on utilise sa propriété **data**.

### DragTarget<T> : zone de dépôt

Voyons maintenant comment définir une "zone de dépôt".

Pour définir une zone de dépot, on peut utiliser un widget **DragTarget**. 

Ce container va nous permettre de définir les callbacks gérant les opérations de survol et de dépot :

- un **builder** : ce callback recevra le context, la liste des élements en cours de survol de la zone, et les éléments rejetés.
- **onWillAccept** : permet de déterminer les conditions d'acceptation du dépot.
- **onAccept** : permet de définir une "réaction" au dépot 

```dart
new DragTarget<String>(
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

Dans cet exemple, on accepte un seul dépot par zone : une fois qu'une objet est déposé,
La zone récupère la donnée de l'objet déposé, et aux prochains survols, les dépots sont refusés.

Dans [Dropcity](https://github.com/rxlabz/flutter_dropcity/blob/master/lib/main.dart), le second exemple,
les élements ne peuvent être déplacés que sur les cibles, et peuvent être "ressortis" après dépot.

![dropcity]({{"/img/dropcity1.png" | prepend:site.baseurl }})

## Examples

- [code complet de cet exemple](https://github.com/rxlabz/flutter_dropcity/blob/master/lib/drag_drop_basics.dart)
- [petit jeu de capitale](https://github.com/rxlabz/flutter_dropcity/blob/master/lib/main.dart)

**repo officiel**

- [basics](https://github.com/flutter/flutter/blob/master/dev/manual_tests/drag_and_drop.dart)  
- [advanced](https://github.com/flutter/flutter/blob/master/dev/manual_tests/material_arc.dart)
