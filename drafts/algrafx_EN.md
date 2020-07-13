
A retrospective of a graphic experiment of almost 20 years in 15 stages.

____

<!--more-->

# 2002

Someday I started to draw arrows...

![origin](https://rxlabz.github.io/img/algrafx/fleche_origin.png)

a lot of arrows 😀 ... Volume, motion,...

![old_arrows](http://rxlabz.github.io/img/algrafx/old_arrows.png)

# 2004

I colorized them with Photoshop and Illustrator.

![arf](http://rxlabz.github.io/img/algrafx/prise_de_tete.jpg)

![La Fabrick](http://rxlabz.github.io/img/algrafx/fbck.png) ![breakz](http://rxlabz.github.io/img/algrafx/plo1.png)

![trajectoires](http://rxlabz.github.io/img/algrafx/trajectoires.jpg)

# 2008

I mostly code Actionscript, Flash then Flex applications. I discover Generative art; I attend to a [Joshua Davis](https://joshuadavis.com) talk at FITC 2008 - Amsterdam. I also discover [Erik Natzke](http://blog.natzke.com) , and [Mister Nicoptère's works](http://barradeau.com/blog/?p=621)... A lot of inspiration! 

If Flash was a perfectly fitted tool to generate graphics, I wasn't skilled enough to code my arrows. I tried a bit with shape tweens... Without success.  

![Flash interpolation](http://rxlabz.github.io/img/algrafx/interpol.gif)

# 2010

[Thoughts on Flash](https://en.wikipedia.org/wiki/Thoughts_on_Flash)... Flash begins its early retirement.

# 2015

2015, I'm still using Flex to develop most of my projects, I hadn't found a good enough replacement ( fast, mature ). But forced, constrained and realistic, I start to study other technologies. Javascript... but also Dart ! 🥰
Coming from Actionscript, one of the first interesting new concept I discovered from the JS world, was **observables** and **RXJS**, and naturally Dart [`streams`](https://dart.dev/tutorials/language/streams).

It was by trying to apply this concepts to html canvas, that I finally had an idea to generate my arrows.

The principle was finally very easy : I just needed to transform/map a stream of mouse position to a list of polygons : `cursor => points => polygons => arrows`
 
With it's native streams Dart was a perfect candidate for this playground. I had something like this in mind :

```dart
window
    ..onMouseMove.map(mouseToPoint).map(pointToPolygon).listen(onNewPolygon);
```

# 2016
 
  I published a first version of [Algraphr](https://github.com/rxlabz/algraphr), coded in Vanilla Dart 1.x .
 
[![algraphr](http://rxlabz.github.io/img/algrafx/algraphr.png   )](http://rxlabz.github.io/algraphr)


###### {% youtube 8ey0Q-6nFIo %}

4 years later, I'm more than happy of this choice. Dart 1 was already a very smooth web tool. I was surprised how fast I achieved : 
- dynamic svg drawing, 
- real time conversion of SVG to bitmap,
- display this bitmap in a html canvas
- export it as PNG file

Nothing that could have not be coded in JS, but the Dart experience was delightful. Simple and effective : no dependency, nothing to config 🦄.

Just a word about this vanilla (Dart) web implementation : 
- when the mouse move SVG shapes are drawn
- when the spacebar is pressed, the shapes are "freezed" => the SVG is converted to bitmap,
- and displayed in a canvas.

Before doing it, I could not even imagine that this kind of process could be so fast ( it helped me a lot for my Flash grieve :) ! )

The Algraphr experiment stopped there for a long time...

# 2017

I discover Flutter 💙. So many things to explore... In few weeks, I rebuild one of my Flex mobile app, and from then : 🤩 ! 

# 2019

Adobe leaves AIR, its integrated Runtime, and announce the final death of Flash browser plugin.

First generative creations from the Flutter community appears :

{% twitter 1168095910754160640 %}

then [Flutter web](https://flutter.dev/web) become a thing,
 
and finally Flutter create...

{% twitter 1204518995388485633 %}

with, I still don't know how/why, my face in it 🤯...

So it was more than time to play with my old polygonal friends, and to write [Algrafx](https://rxlabz.github.io/algrafx/), a Flutter implementation of my arrows generator.

Rewriting it with Flutter was way simpler, and allowed me to easily add more options. 

![algrafx](https://github.com/rxlabz/algrafx/blob/master/images/desktop.png?raw=true)

{% youtube Ne8uLjUq1nE %}

# 2020

Flutter appears [in Codepen](https://codepen.io/flutter), and we see a lot of Flutter demos showing Flutter web capabilities.

I started to play with an [algrafx in Codepen](https://codepen.io/rx-labz/pen/WNQoNem)... and some other [abstract animations](https://codepen.io/rx-labz/).

{% youtube iIP92WtsoMM %}

So here we are, summer 2020, and it's time to code more arrows !

____

We are going to learn how to draw and animate arrows in a Flutter canvas. In doing so we will see how to use the canvas, for basic drawing and more advanced techniques such as gradients or blurring.

{% youtube xzb3LZvQshg %}

## ➡ Pour commencer

We'll start by creating a Flutter application with a [`CustomPaint widget`](https://api.flutter.dev/flutter/widgets/CustomPaint-class.html).

[`CustomPaint`](https://api.flutter.dev/flutter/widgets/CustomPaint-class.html) gives us the access to the painting layer, et allows us to manipulate the [`Canvas`](https://api.flutter.dev/flutter/dart-ui/Canvas-class.html), and its basic drawing methods : `moveTo`, `lineTo`, `drawRect`, `drawCircle`...
 
 The control of the canvas is delegated to an instance of [`CustomPainter`](https://api.flutter.dev/flutter/rendering/CustomPainter-class.html), a class we must extend to paint our intructions. 
 
 ```dart
 import 'dart:ui';
  import 'package:flutter/material.dart';
 
 void main() {
   runApp(MaterialApp(
     home: Scaffold(body: Board()),
     debugShowCheckedModeBanner: false,
   ));
 }
 
 final size = window.physicalSize / window.devicePixelRatio;
 
 class Board extends StatelessWidget {
   @override
   Widget build(BuildContext context) => CustomPaint(
         size: size,
         painter: Painter(),
       );
 }
 
 class Painter extends CustomPainter {
   static final fill = Paint()..color = Colors.red;
 
   @override
   void paint(Canvas canvas, Size size) {
     // TODO
   }
 
   @override
   bool shouldRepaint(CustomPainter oldDelegate) => false;
 }

 ```
____
  
## Etape 0 : The origin
 
 >**in the beginning there was... a point**
 
 
The biggest trips start with a 1st step, here our lines will start with a 1st point, or more exactly a circle, placed in the center of the window.
  
The drawing on the canvas being fixed, `shouldRepaint` shoul returns` false`.
 
 
 ```dart
class Painter extends CustomPainter {
  static const radius = 10.0;

  static final fill = Paint()..color = Colors.red;

  @override
  void paint(Canvas canvas, Size size) {
      canvas.drawCircle(size.center(Offset.zero), radius, fill);
    }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
 ```
 👀 [codepen.io/rx-labz/pen/MWKXONp](https://codepen.io/rx-labz/pen/MWKXONp)

![step0b](http://rxlabz.github.io/img/algrafx/schm_canvas1.png)


____

## Etape 1 : Follow this mouse

We'll track the cursor position to provide a list of positions. To do that we use a [MouseRegion](https://api.flutter.dev/flutter/widgets/MouseRegion-class.html).

```dart
class Board extends StatefulWidget {
  @override
  _BoardState createState() => _BoardState();
}

class _BoardState extends State<Board> {
  Offset mouse = Offset.zero;

  @override
  Widget build(BuildContext context) => MouseRegion(
        // update the mouse position when mouse moves
        onHover: (details) => setState(() => mouse = details.localPosition),
        // build a CustomPaint to draw at mouse position 
        child: CustomPaint(size: size, painter: Painter(mouse)),
      );
}

```

The painter needs to know the position of the cursor, and repaint if the it changes.

```dart
class Painter extends CustomPainter {
  static const radius = 10.0;

  static final fill = Paint()..color = Colors.red;

  final Offset position;

  const Painter(this.position);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawCircle(position, radius, fill);
  }

  @override
  bool shouldRepaint(Painter oldDelegate) => position != oldDelegate.position;
}
```

![step1](http://rxlabz.github.io/img/algrafx/steps/step1.gif)

### Stream

The goal is to generate a graphic by transforming an input stream in geometric shapes, so we could use a `stream` and emit the positions of cursor. the `Painter` will be redrawn for each new value.

```dart
class _BoardState extends State<Board> {
  
  // a streamController for cursor positions
  final StreamController<Offset> _streamer = StreamController<Offset>();

  Stream<Offset> get point$ => _streamer.stream;

  @override
  Widget build(BuildContext context) => MouseRegion(
        // add positions to stream
        onHover: (details) => _streamer.add(details.localPosition),
        // rebuild the painter for each position
        child: StreamBuilder<Offset>(
          initialData: Offset.zero,
          stream: point$,
          builder: (context, snapshot) =>
              CustomPaint(size: size, painter: Painter(snapshot.data)),
        ),
      );

  @override
  void dispose() {
    _streamer.close();
    super.dispose();
  }
}
```
👀 [codepen.io/rx-labz/pen/VwedroV](https://codepen.io/rx-labz/pen/VwedroV)

____

## Etape 2 : Tom Thumb

![step2](http://rxlabz.github.io/img/algrafx/steps/step2.gif)

To draw we will draw all cumulated positions. To do that, we'll add, for all new positions, the `_points` list of all points to the stream.  

```dart
class _BoardState extends State<Board> {
  // all cursor positions
  final List<Offset> _points = [];
  
  final StreamController<List<Offset>> _streamer =
      StreamController<List<Offset>>();

  Stream<List<Offset>> get _point$ => _streamer.stream;

  @override
  Widget build(BuildContext context) => MouseRegion(
        // add new position to _points and add the new list to the stream
        onHover: (details) => _streamer.add(_points..add(details.localPosition)),
        child: StreamBuilder<List<Offset>>(
          initialData: _points,
          stream: _point$,
          builder: (context, snapshot) =>
              CustomPaint(size: size, painter: Painter(_points)),
        ),
      );
}
```

Then we can draw all the points.


```dart
class Painter extends CustomPainter {
  // ...

  final List<Offset> points;

  const Painter(this.points);

  @override
  void paint(Canvas canvas, Size size) {
    // draws a circle for each saved positions
    for (final point in points) canvas.drawCircle(point, 10, fill);
  }

  @override
  bool shouldRepaint(Painter oldDelegate) => true;
}
```
👀 [codepen.io/rx-labz/pen/NWxzXKG](https://codepen.io/rx-labz/pen/NWxzXKG)

____

## Etape 3 : The path

![step3](http://rxlabz.github.io/img/algrafx/steps/step3.gif)

Now that we have a list of points, we can connect them.

```dart
class Painter extends CustomPainter {
  static final fill = Paint()..color = Colors.red;

  static final stroke = Paint()
    ..color = Colors.grey
    ..style = PaintingStyle.stroke;

  final List<Offset> points;

  const Painter(this.points);

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;
    for (final point in points) canvas.drawCircle(point, 2, fill);

    // draw a line between each points
    for (int i = 0; i < points.length - 1; i++) {
      canvas.drawLine(points[i], points[i + 1], stroke);
    }
  }

  @override
  bool shouldRepaint(Painter oldDelegate) => true;
}
```
👀 [codepen.io/rx-labz/pen/BajVJNy](https://codepen.io/rx-labz/pen/BajVJNy)

____

## Etape 4 : Ephemeral lines

![step4](http://rxlabz.github.io/img/algrafx/steps/step4.gif)


In order not to overload the canvas, we will limit the number of visible points.

```dart
const maxPoints = 29;

// ..

class _BoardState extends State<Board> {
  // ..

  @override
    Widget build(BuildContext context) => MouseRegion(
      onHover: (details) =>
          _streamer.add(Board._points..add(details.position)),
      child: StreamBuilder<List<Offset>>(
        initialData: Board._points,
        stream: point$.map(
          // keeps only the 29 last points 
          (points) => points.skip(max(0, points.length - maxPoints)).toList(),
        ),
        builder: (context, snapshot) =>
            CustomPaint(size: size, painter: Painter(snapshot.data)),
      ),
    );

  // ..
}
```
👀 [codepen.io/rx-labz/pen/eYJKyNG](https://codepen.io/rx-labz/pen/eYJKyNG)

____

## Etape 5 : Moving points

![step5](http://rxlabz.github.io/img/algrafx/steps/step5.gif)

To animate lines, we'll apply a force to points.

For that, rather than handling `Offset`, we can create a` Point` entity, on which we will apply a displacement proportional to the applied force and undergoing a slight acceleration.

```dart
/// pseudo gravity (1px vertical)
const force = Offset(0, 1);

// gravity acceleration factor
const acceleration = 1.1;

class Point {
  
  // position
  final Offset offset;

  // gravity
  final Offset force;

  final bool active;

  const Point(this.offset, this.force, [this.active = true]);

  //apply the force to offset, and acceleration to force
  Point update() => active
      ? Point(offset + force, force * acceleration, offset.dy < size.height)
      : Point(Offset.zero, Offset.zero, false);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Point &&
          runtimeType == other.runtimeType &&
          offset == other.offset &&
          force == other.force &&
          active == other.active;

  @override
  int get hashCode => offset.hashCode ^ force.hashCode ^ active.hashCode;
}
```
We use a looped animationController to refresh the points positions within a regular time interval ( [`AnimationController.unbounded`](https://api.flutter.dev/flutter/animation/AnimationController-class.html) ).

To use an animationController, awe must add a mixin to our widget state : [`SingleTickerProviderStateMixin`](https://api.flutter.dev/flutter/widgets/SingleTickerProviderStateMixin-mixin.html). 

For each *tick*, we filter the visibles points, and apply their gravity to obtain their new positions.

```dart
class _BoardState extends State<Board> with SingleTickerProviderStateMixin {
  List<Point> _points = [];

  final StreamController<List<Point>> _streamer =
      StreamController<List<Point>>.broadcast()..add(<Point>[]);

  Stream<List<Point>> get _point$ => _streamer.stream;

  @override
  void initState() {
    // start a looped animation and add a listener : `_updatePoints`
    AnimationController.unbounded(vsync: this, duration: Duration(seconds: 1))
      ..repeat()
      ..addListener(_updatePoints);

    super.initState();
  }

  @override
  Widget build(BuildContext context) => MouseRegion(
        onHover: (details) =>
            _streamer.add(_points..add(Point(details.position, force))),
        child: StreamBuilder(
          initialData: _points,
          stream: _point$.map(
            (points) => points.skip(max(0, points.length - maxPoints)).toList(),
          ),
          builder: (_, stream) =>
              CustomPaint(size: size, painter: Painter(stream.data)),
        ),
      );
  
  // update the points and add them to the stream 
  void _updatePoints() {
    _points = _points
        .where((element) => element.active)
        // apply position and force 
        .map((element) => element.update())
        .toList();
    _streamer.add(_points);
  }
}
```
👀 [codepen.io/rx-labz/pen/ZEQRREq](https://codepen.io/rx-labz/pen/ZEQRREq)

____

## Etape 6 : Points => Segment => Polygon

Now that we have our list of points, we can transform it.

### Points to vertical segments

![points to vertical segment](http://rxlabz.github.io/img/algrafx/schm_canvas2.png)

First we draw a vertical line around each point. 


```dart
@override
void paint(Canvas canvas, Size size) {
  for (final point in points) {
    canvas.drawCircle(point.offset, 2, fill);
    
    // draw a vertical segment 
    canvas.drawLine(
      point.offset - Offset(0, -50),
      point.offset - Offset(0, 50),
      stroke,
    );
  }
}
```
👀 [codepen.io/rx-labz/pen/rNxKKxP](https://codepen.io/rx-labz/pen/rNxKKxP)

![step6](http://rxlabz.github.io/img/algrafx/steps/step6a.gif)

### Points to parallelogram

![step6b](http://rxlabz.github.io/img/algrafx/steps/step6b.gif)

Now let's draw a parallelogram connecting two successive points.

We are going to create a class `Segment`, which will contain two` Points`s. The segments will also have a fill and outline color. The parallelograms will be obtained by transformation of this segment.

```dart
class Segment {
  final Point point1;

  final Point point2;

  final Color strokeColor;

  final Color fillColor;

  Offset get offset1 => point1.offset;

  Offset get offset2 => point2.offset;

  bool get active => point1.active && point2.active;

  const Segment(this.point1, this.point2, {this.strokeColor, this.fillColor});

  Segment update() => Segment(
        point1.update(),
        point2.update(),
        strokeColor: strokeColor,
        fillColor: fillColor,
      );
}
```

So we go from a list of `Point`s to a list of` Segment`s.

```dart
  @override
  void initState() {
    _streamer = StreamController<List<Segment>>()..add(<Segment>[]);
    AnimationController.unbounded(vsync: this, duration: Duration(seconds: 1))
      ..repeat()
      ..addListener(_updateSegments);
    super.initState();
  }

  @override
  Widget build(BuildContext context) => MouseRegion(
        // adds a segment to each new cursor position
        onHover: (details) => _addSegment(details.position),
        child: StreamBuilder<List<Segment>>(
          initialData: <Segment>[],
          stream: _segment$,
          builder: (_, stream) =>
              CustomPaint(size: size, painter: Painter(stream.data)),
        ),
      );

  /// adds a segment between the last point of the previous segment and the new position
  void _addSegment(Offset offset) {
    _segments
      ..add(
        Segment(
          _segments.isEmpty ? Point(offset, force) : _segments.last.point2,
          Point(offset, force),
          strokeColor: strokeColor,
          fillColor: fillColor,
        ),
      );
  }
  
  // filters inactive segments, updates segments and adds them to the stream
  void _updateSegments() {
    _segments = _segments
        .where((element) => element.active)
        .map((element) => element.update())
        .toList();
    _streamer.add(_segments);
  }
```

Then in the Painter, we determine the edges of the parallelogram from the points of the segment and we connect them.

![points to vertical segment](http://rxlabz.github.io/img/algrafx/schm_canvas3.png)

```dart
class Painter extends CustomPainter {
  static const radius = 2.0;

  static const offsetTop = Offset(0, -50);

  static const offsetBottom = Offset(0, 50);

  static final fill = Paint()..color = fillColor;

  static final stroke = Paint()
    ..color = Colors.grey
    ..style = PaintingStyle.stroke;

  final List<Segment> segments;

  const Painter(this.segments);

  @override
  void paint(Canvas canvas, Size size) {
    if (segments.isEmpty) return;

    for (final segment in segments.where((element) => element.active)) {
      canvas.drawCircle(segment.point1.offset, radius, fill);

      canvas.drawLine(
        segment.point1.offset - offsetTop,
        segment.point1.offset - offsetBottom,
        stroke,
      );
      canvas.drawLine(
        segment.point1.offset - offsetTop,
        segment.point2.offset - offsetTop,
        stroke,
      );
      canvas.drawLine(
        segment.point1.offset - offsetBottom,
        segment.point2.offset - offsetBottom,
        stroke,
      );
      canvas.drawLine(
        segment.point2.offset - offsetTop,
        segment.point2.offset - offsetBottom,
        stroke,
      );
    }
    
    for (int i = 0; i < segments.length; i++) {
      canvas.drawLine( segments[i].offset1, segments[i].offset2, stroke );
    }
  }

  @override
  bool shouldRepaint(Painter oldDelegate) => true;
}

``` 

### A better API

The result is the one we are looking for, but let's simplify the API a bit.

**Point.up(double) & Point.down(double)**

```dart
class Point {
  final Offset offset;
  final Offset force;

  final bool active;

  static const zero = Point(Offset.zero, Offset.zero, false);

  const Point(this.offset, this.force, [this.active = true]);

  Point update() => active
      ? Point(offset + force, force * acceleration, offset.dy < size.height)
      : zero;

  Offset up(double value) => offset + Offset(0, -value);

  Offset down(double value) => offset + Offset(0, value);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Point &&
          runtimeType == other.runtimeType &&
          offset == other.offset &&
          force == other.force &&
          active == other.active;

  @override
  int get hashCode => offset.hashCode ^ force.hashCode ^ active.hashCode;
}
```

**Segment.corners**

```dart
class Segment {
  final Point point1;

  final Point point2;

  final Color strokeColor;

  final Color fillColor;

  Offset get offset1 => point1.offset;

  Offset get offset2 => point2.offset;

  bool get active => point1.active && point2.active;

  /// returns the corners of the parallelogram corresponding to the segment
  List<Offset> get corners => [
        point1.up(50),
        point2.up(50),
        point2.down(50),
        point1.down(50),
      ];

  const Segment(this.point1, this.point2, {this.strokeColor, this.fillColor});

  Segment update() {
    return Segment(
      point1.update(),
      point2.update(),
      strokeColor: strokeColor,
      fillColor: fillColor,
    );
  }
}
``` 

Finally, let's redraw the parallelograms using [Path](https://api.flutter.dev/flutter/dart-ui/Path-class.html).

```dart
class Painter extends CustomPainter {
  static const radius = 2.0;

  static final fill = Paint()..color = fillColor;

  static final stroke = Paint()
    ..color = Colors.grey
    ..style = PaintingStyle.stroke;

  final List<Segment> segments;

  const Painter(this.segments);

  @override
  void paint(Canvas canvas, Size size) {
    if (segments.isEmpty) return;

    for (final segment in segments) {
    
      // instanciate a path between edges
      final path = Path()
        ..moveTo(segment.corners[0].dx, segment.corners[0].dy)
        ..lineTo(segment.corners[1].dx, segment.corners[1].dy)
        ..lineTo(segment.corners[2].dx, segment.corners[2].dy)
        ..lineTo(segment.corners[3].dx, segment.corners[3].dy)
        ..close();
      
      // fill
      canvas.drawPath(path, Paint()..color = segment.fillColor);

      // stroke
      canvas.drawPath(
        path,
        Paint()
          ..color = segment.strokeColor
          ..style = PaintingStyle.stroke,
      );

      canvas.drawCircle(segment.offset1, radius, fill);
    }

    for (int i = 0; i < segments.length; i++) {
      canvas.drawLine( segments[i].offset1,segments[i].offset2,stroke );
    }
  }

  @override
  bool shouldRepaint(Painter oldDelegate) =>
      segments.isNotEmpty && !listEquals(segments, oldDelegate.segments);
}
```
👀 [codepen.io/rx-labz/pen/abdKKNg](https://codepen.io/rx-labz/pen/abdKKNg)
____

## Etape 7 : Colors

![step7b](http://rxlabz.github.io/img/algrafx/steps/step7b.gif)

To animate the color, we will gradually darken the colors applied to each segment. For this we can convert the color to `HSLColor` and lower the brightness. The use of an extension simplifies the writing of this operation.

```dart
extension on Color {
  /// returns the corresponding HSLColor
  HSLColor get hsl => HSLColor.fromColor(this);
  
  double get lightness => hsl.lightness;

  Color withLightness(double value) =>
      hsl.withLightness(value).toColor();
}

class Segment {
  //..

  Segment update() {
    // darkens the fill color
    final newFillColor = fillColor.lightness > 0
        ? fillColor.withLightness( fillColor.lightness * .98 )
        : fillColor;

    return Segment(
      point1.update(),
      point2.update(),
      strokeColor: strokeColor,
      fillColor: newFillColor,
    );
  }
}

```
👀 [codepen.io/rx-labz/pen/oNbyMYG](https://codepen.io/rx-labz/pen/oNbyMYG)

<p class="codepen" data-height="420" data-theme-id="light" data-default-tab="result" data-user="rx-labz" data-slug-hash="oNbyMYG" style="height: 301px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Algfx_7">
  <span>See the Pen <a href="https://codepen.io/rx-labz/pen/oNbyMYG">
  Algfx_7</a> by rxlabz (<a href="https://codepen.io/rx-labz">@rx-labz</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

____

## Etape 8 : Speed and width

The next step will be to vary the thickness of the strip according to the speed of movement of the cursor. The faster the cursor moves, the finer the line.

### a. Segment width

{% youtube XMJDPknYyxA %}

For this we will add a thickness `width` to the segments, and vary it according to the distance between the 2 points. The parallelogram will have the segment thickness.

```dart

const segmentMaxWidth = 100.0;

const segmentMinWidth = 2.0;

const segmentMaxLength = 200.0;

class Segment {
  final Point point1;

  final Point point2;

  final Color strokeColor;

  final Color fillColor;

  Offset get offset1 => point1.offset;

  Offset get offset2 => point2.offset;

  bool get active => point1.active && point2.active;

  List<Offset> get corners {
    final width = segmentWidth;
    return [
      point1.up(width),
      point2.up(width),
      point2.down(width),
      point1.down(width),
    ];
  }

  /// computes the thickness of the segment as a function of the distance between its points
  double get segmentWidth => max(
        segmentMinWidth,
        segmentMaxWidth -
            (Rect.fromPoints(point1.offset, point2.offset).longestSide /
                    segmentMaxLength) *
                (segmentMaxWidth - segmentMinWidth),
      );

  const Segment(this.point1, this.point2, {this.strokeColor, this.fillColor});

  Segment update() {
    final newFillColor = fillColor.lightness > 0
            ? fillColor.withLightness(min(1, fillColor.lightness * .98))
            : fillColor;

    return Segment(
      point1.update(),
      point2.update(),
      strokeColor: strokeColor,
      fillColor: newFillColor,
    );
  }
}
``` 
👀 [codepen.io/rx-labz/pen/zYraLoK](https://codepen.io/rx-labz/pen/zYraLoK)

### b. Chaining segments

To "harmonize" the line, we are going to transform the parallelograms into trapezoids. Each trapezoid will have an "inlet" thickness and an outlet thickness.

![points to vertical segment](http://rxlabz.github.io/img/algrafx/schm_canvas4.png)

```dart
class Segment {
  final Point point1;

  final Point point2;

  final Color strokeColor;

  final Color fillColor;

  Offset get offset1 => point1.offset;

  Offset get offset2 => point2.offset;

  final Segment previous;

  const Segment(
    this.point1,
    this.point2, {
    @required this.previous, // previous segment
    this.strokeColor,
    this.fillColor,
  });

  bool get active => point1.active && point2.active;

  /// returns the corners of the trapezoid based on the thickness 
  /// of the previous segment and that of the segment itself
  List<Offset> get corners {
    final previousWidth =
        previous != null ? previous.segmentWidth : segmentWidth;
    final width = segmentWidth;
    return [
      point1.up(previousWidth),
      point2.up(width),
      point2.down(width),
      point1.down(previousWidth),
    ];
  }

  double get segmentWidth => max(
        segmentMinWidth,
        segmentMaxWidth -
            (Rect.fromPoints(point1.offset, point2.offset).longestSide /
                    segmentMaxLength) *
                (segmentMaxWidth - segmentMinWidth),
      );

  Segment update() {
    final hslColor = HSLColor.fromColor(fillColor);
    final newFillColor = hslColor.lightness > 0
        ? hslColor.withLightness(min(1, hslColor.lightness * .98)).toColor()
        : fillColor;
    return Segment(
      point1.update(),
      point2.update(),
      previous: previous,
      strokeColor: strokeColor,
      fillColor: newFillColor,
    );
  }
}
```
👀 https://codepen.io/rx-labz/pen/mdVKjOK

{% youtube FjIleq9ZuRo %}

____

## Etape 9 : snapshot

{% youtube M7nGURfbWJo %}

For the moment all the polygons disappear, we are now going to "freeze" them.

It could be done manually ( by clic or space ), but it this example we'll freeze them automatically, within a regular time interval.

```dart

class Point {
  // ...

  /// point is freezed by cancelling it's force
  Point freeze() => Point(offset, Offset.zero, false);

  // ...
}

class Segment {
  // ...
  
  /// segments are freezable
  Segment freeze() => Segment(
    point1.freeze(),
    point2.freeze(),
    previous: previous,
    strokeColor: strokeColor,
    fillColor: fillColor,
  );
}

class _BoardState extends State<Board> with SingleTickerProviderStateMixin {
  // ...

  final List<List<Segment>> _freezedLines = [];
  StreamController<List<List<Segment>>> _freezedStreamer;
  Stream<List<List<Segment>>> get freezedShape$ => _freezedStreamer.stream;

  @override
  void initState() {
    //...

    // freeze the segments within a time interval
    Timer.periodic(Duration(seconds: 2), (timer) {
    final freezables = _segments
      .where((segment) => segment.active)
      .map((segment) => segment.freeze())
      .toList();
    _freezedLines.add([...freezables]);
    _freezedStreamer.add(_freezedLines);
    });
    
    //...
  }

  // ...
}
```

To avoid redrawing the frozen segments more than necessary, we will create a second CustomPaint, a kind of layer, which will be used to draw the frozen polygons, and which will only be refreshed when the list of segments changes.

```dart
class _BoardState extends State<Board> with SingleTickerProviderStateMixin {
  // ...
  @override
  Widget build(BuildContext context) => MouseRegion(
        onHover: (details) => _addSegment(details.position),
        child: Stack(
          children: [
            StreamBuilder<List<List<Segment>>>(
              stream: freezedShape$,
              builder: (context, snapshot) => CustomPaint(
                size: size,
                painter: BackgroundPainter(snapshot.data ?? []),
              ),
            ),
            RepaintBoundary(
              child: StreamBuilder<List<Segment>>(
                initialData: <Segment>[],
                stream: _segment$,
                builder: (_, stream) => CustomPaint(
                    size: size, painter: ForegroundPainter(stream.data)),
              ),
            ),
          ],
        ),
      );
  // ...
}
```

We now use 2 `CustomPainter`s :

- `ForegroundPainter` draws the moving segments

```dart
class ForegroundPainter extends CustomPainter {
  static final fill = Paint()..color = fillColor;
  static final stroke = Paint()
    ..color = Colors.grey
    ..style = PaintingStyle.stroke;

  final List<Segment> segments;

  const ForegroundPainter(this.segments);

  @override
  void paint(Canvas canvas, Size size) {
    if (segments.isEmpty) return;
    for (final segment in segments)
      drawSegment(canvas, segment);
  }

  @override
  bool shouldRepaint(ForegroundPainter oldDelegate) =>
      segments.isNotEmpty && !listEquals(segments, oldDelegate.segments);
}

```

- `BackgroundPainter` draws the freezed segments

```dart
class BackgroundPainter extends CustomPainter {
  final List<List<Segment>> lines;

  BackgroundPainter(this.lines);

  @override
  void paint(Canvas canvas, Size size) {
    for (final segments in lines) {
      for (final segment in segments) drawSegment(canvas, segment);
    }
  }

  @override
  bool shouldRepaint(BackgroundPainter oldDelegate) =>
      lines.isNotEmpty && !listEquals(lines, oldDelegate.lines);
}

```

Both painters use `drawSegment()`.

```dart
void drawSegment(Canvas canvas, Segment segment) {
  final path = Path()
    ..moveTo(segment.corners[0].dx, segment.corners[0].dy)
    ..lineTo(segment.corners[1].dx, segment.corners[1].dy)
    ..lineTo(segment.corners[2].dx, segment.corners[2].dy)
    ..lineTo(segment.corners[3].dx, segment.corners[3].dy)
    ..close();
  canvas.drawPath(path, Paint()..color = segment.fillColor);
  canvas.drawPath(
    path,
    Paint()
      ..color = segment.strokeColor
      ..style = PaintingStyle.stroke,
  );
}
```

👀 [codepen.io/rx-labz/pen/QWyxBGX](https://codepen.io/rx-labz/pen/QWyxBGX)

____

## Etape 10 : Autografx

{% youtube p8EeU3JxoRI %}

Finally, we can replace the cursor movement tracking by generating random positions.

```dart

// ...

const maxNumLines = 5;

class _BoardState extends State<Board> with SingleTickerProviderStateMixin {
  // ...

  Offset cursor;
    
  @override
  void initState() {
    cursor = size.bottomRight(Offset.zero) * random.nextDouble();

    _streamer = StreamController<List<Segment>>()..add(<Segment>[]);
    _freezedStreamer = StreamController<List<List<Segment>>>()..add([]);

    Timer.periodic(Duration(seconds: 2), (timer) {
      final freezables = _segments
          .where((element) => element.active)
          .map((element) => element.freeze())
          .toList();
      _freezedLines.add([...freezables]);
      _freezedStreamer.add(_freezedLines);
      if (_freezedLines.length == maxNumLines) _anim.reset();
    });

    _anim = AnimationController.unbounded(
        vsync: this, duration: Duration(seconds: 1))
      ..repeat()
      ..addListener(_onTick);
    super.initState();
  }

  void _onTick() {
    _moveCursor();
    _updateSegments();
  }
  
  // random moves 
  void _moveCursor() {
    double nextX = (random.nextDouble() * 300) - 150;
    if ((cursor.dx + nextX > size.width) || (cursor.dx + nextX < 0))
      nextX = nextX * -1;

    double nextY = (random.nextDouble() * 300) - 150;
    if (cursor.dy + nextY > size.height || cursor.dy + nextY < 0)
      nextY = nextY * -1;

    cursor = cursor + Offset(nextX, nextY);
    _addSegment(cursor);
  }
  
  // ...

}
```
👀 [codepen.io/rx-labz/pen/GRoGXQJ](https://codepen.io/rx-labz/pen/GRoGXQJ)

So much for the principle, but there are still a few finishes missing:
- add volume and light using ** gradients **
- add the arrowhead
- play with ** blur and opacity **
- interleave the arrows via a pseudo "** z-ordering **"

____

## Etape 11 : Gradients

{% youtube Q63my9MFPOI %}

To add a gradient to the trapezoids, let's decline the color of the segment: a lighter version, and a darker one.

```dart
extension on Color {
  // ...

  Color darker(double factor) {
    final hslColor = HSLColor.fromColor(this);
    return hslColor
        .withLightness(max(0, hslColor.lightness * (1 - factor)))
        .toColor();
  }

  Color lighter(double factor) {
    final hslColor = HSLColor.fromColor(this);
    return hslColor
        .withLightness(min(1, hslColor.lightness * (1 + factor)))
        .toColor();
  }
}

```
Next, let's add a gradient between the light color, the real color and the dark color.

To create a gradient in the canvas, add a [`shader`] (https://api.flutter.dev/flutter/dart-ui/Paint/shader.html) of type [` Gradient`] (https: / /api.flutter.dev/flutter/dart-ui/Gradient-class.html).

```dart

void drawSegment(Canvas canvas, Segment segment) {
  final path = Path()
    ..moveTo(segment.corners[0].dx, segment.corners[0].dy)
    ..lineTo(segment.corners[1].dx, segment.corners[1].dy)
    ..lineTo(segment.corners[2].dx, segment.corners[2].dy)
    ..lineTo(segment.corners[3].dx, segment.corners[3].dy)
    ..close();
  canvas.drawPath(
    path,
    Paint()
      ..shader = ui.Gradient.linear(
        segment.corners[0],
        segment.corners[2],
        [
          segment.fillColor.lighter(darkerFactor).withOpacity(globalOpacity),
          segment.fillColor.withOpacity(globalOpacity),
          segment.fillColor.darker(darkerFactor).withOpacity(globalOpacity),
        ],
        [.0, .3, .8],
      ),
  );
}
```
👀 [codepen.io/rx-labz/pen/zYraJRL](https://codepen.io/rx-labz/pen/zYraJRL)

____

## Etape 12 : Arrowheads

{% youtube DOWmG5Ete40 %}

It's time to draw the tip of our arrows. The simplest way will be to transform the last segment not into a parallelogram, but into a triangle.

![step0b](http://rxlabz.github.io/img/algrafx/schm_canvas5.png)

```dart
void drawSegment(Canvas canvas, Segment segment, {bool isLast = false}) {
  
  final path = isLast
      ? (Path()
        ..moveTo(segment.corners[0].dx, segment.corners[0].dy)
        ..lineTo(segment.corners[0].dx, segment.corners[0].dy - 25)
        ..lineTo(
          segment.offset2.dx,
          min(segment.corners[1].dy, segment.corners[3].dy) +
              max(segment.corners[1].dy, segment.corners[3].dy) -
              min(segment.corners[1].dy, segment.corners[3].dy),
        )
        ..lineTo(segment.corners[3].dx, segment.corners[3].dy + 25)
        ..lineTo(segment.corners[3].dx, segment.corners[3].dy)
        ..close())
      : (Path()
        ..moveTo(segment.corners[0].dx, segment.corners[0].dy)
        ..lineTo(segment.corners[1].dx, segment.corners[1].dy)
        ..lineTo(segment.corners[2].dx, segment.corners[2].dy)
        ..lineTo(segment.corners[3].dx, segment.corners[3].dy)
        ..close());

  canvas.drawPath(
    path,
    Paint()
      ..shader = ui.Gradient.linear(
        segment.corners[0],
        segment.corners[2],
        [
          segment.fillColor.lighter(darkerFactor).withOpacity(globalOpacity),
          segment.fillColor.withOpacity(globalOpacity),
          segment.fillColor.darker(darkerFactor).withOpacity(globalOpacity),
        ],
        [.0, .3, .8],
      ),
  );
}

```
👀 [codepen.io/rx-labz/pen/YzwvOem](https://codepen.io/rx-labz/pen/YzwvOem)
____

## Etape 13 : Flou et opacité

To soften the paths, we can overlay a blurred version of the polygons. This produces a "glow" effect which, combined with a variation in opacity, can produce an interesting graphic effect.

For this we will use a [`Paint.maskFilter`] (https://api.flutter.dev/flutter/dart-ui/Paint/maskFilter.html). The polygons will be gradually blurred.

```dart
void drawSegment(
  Canvas canvas,
  Segment segment, {
  bool isLast = false,
  int count,
  int total,
}) {
  final path = isLast
      ? (Path()
        ..moveTo(segment.corners[0].dx, segment.corners[0].dy)
        ..lineTo(segment.corners[0].dx, segment.corners[0].dy - 25)
        ..lineTo(
          segment.offset2.dx,
          min(segment.corners[1].dy, segment.corners[3].dy) +
              max(segment.corners[1].dy, segment.corners[3].dy) -
              min(segment.corners[1].dy, segment.corners[3].dy),
        )
        ..lineTo(segment.corners[3].dx, segment.corners[3].dy + 25)
        ..lineTo(segment.corners[3].dx, segment.corners[3].dy)
        ..close())
      : (Path()
        ..moveTo(segment.corners[0].dx, segment.corners[0].dy)
        ..lineTo(segment.corners[1].dx, segment.corners[1].dy)
        ..lineTo(segment.corners[2].dx, segment.corners[2].dy)
        ..lineTo(segment.corners[3].dx, segment.corners[3].dy)
        ..close());

  // normal shape
  canvas.drawPath(
    path,
    Paint()
      ..shader = ui.Gradient.linear(
        segment.corners[0],
        segment.corners[2],
        [
          segment.fillColor
              .lighter(darkerFactor) ,
          segment.fillColor ,
          segment.fillColor
              .darker(darkerFactor) ,
        ],
        [.0, .3, .8],
      ),
  );

  // blurred shape
  canvas.drawPath(
    path,
    Paint()
      ..shader = ui.Gradient.linear(
        segment.corners[0],
        segment.corners[2],
        [
          segment.fillColor.lighter(darkerFactor).withOpacity(globalOpacity),
          segment.fillColor.withOpacity(globalOpacity),
          segment.fillColor.darker(darkerFactor).withOpacity(globalOpacity),
        ],
        [.0, .2, .8],
      )
      // apply blur
      ..maskFilter = MaskFilter.blur(
          BlurStyle.normal, (total - count) / total * blurFactor),
  );
}

```

For the opacity, we change the fill color when updating the segments.

```dart
class Segment{
  // ...
  
  Segment update() {
    final newFillColor = fillColor
        .withLightness(max(0.05, fillColor.lightness * lightnessFactor))
        // apply a transparency factor
        .withOpacity(fillColor.opacity * opacityFactor);
    return Segment(
      point1.update(),
      point2.update(),
      previous: previous,
      strokeColor: strokeColor,
      fillColor: newFillColor,
    );
  }
}
``` 

👀 [codepen.io/rx-labz/pen/MWKXqVr](https://codepen.io/rx-labz/pen/MWKXqVr)

{% youtube cvp8ty6zzCQ %}

____

## Etape 14 : Pseudo Z order

For this last step, the goal is to intermingle the successive polygons.

For this we will reorder the frozen segments according to their opacity. 

```dart
class BackgroundPainter extends CustomPainter {
  final List<List<Segment>> lines;

  BackgroundPainter(this.lines);

  @override
  void paint(Canvas canvas, Size size) {
    final allSegments = <Segment>[];
    
    // all segments 
    for (final segments in lines) {
      for (final segment in segments) {
        allSegments.add(segment == segments.last ? segment.lastified : segment);
      }
    }

    // opacity sort
    allSegments.sort((s1, s2) {
      if (s1.opacity > s2.opacity) return 1;
      if (s1.opacity < s2.opacity) return -1;
      return 0;
    });

    int count = 0;
    for (final segment in allSegments) {
      drawSegment(
        canvas,
        segment,
        isLast: segment.isLast,
        count: count,
        total: allSegments.length,
      );
      count++;
    }
  }

  @override
  bool shouldRepaint(BackgroundPainter oldDelegate) => true;
}
```

👀 [codepen.io/rx-labz/pen/JjGZaLw](https://codepen.io/rx-labz/pen/JjGZaLw)

{% youtube 9-K3LKBJUXk %}

<p class="codepen" data-height="420" data-theme-id="light" data-default-tab="result" data-user="rx-labz" data-slug-hash="JjGZaLw" style="height: 301px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Algfx_14">
  <span>See the Pen <a href="https://codepen.io/rx-labz/pen/JjGZaLw">
  Algfx_14</a> by rxlabz (<a href="https://codepen.io/rx-labz">@rx-labz</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

____

And There you go ! We have relatively close arrows and have learned a lot about `CustomPaint`.

From there, it's up to you  !