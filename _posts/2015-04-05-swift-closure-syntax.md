---
layout: post
title:  "Swift : closures et saccharose"
date:   2015-12-05 00:29:08 +0100
categories: swift
---
Qui n'a jamais rêvé d'ajouter une petite fonction forEach aux tableaux Swift ?

> “Pourquoi faire ? j'aime bien les boucles...”

demanderont certains…

> “Mais pour s’amuser un peu, bordel !”

leur répondrai-je poliment.

Et ce ne sera pas long. J’en profiterais pour m’intéresser aux extensions de classes et à
quelques “sucres syntaxiques” proposés par Swift; efficaces,
mais un peu déroutants pour le noob distrait qui débarque.

Par exemple :

```swift
func add(a:Int, b:Int)->Int{
    return a + b
}
let r = apply( 3,5, add)
```

peut être écrit :

```swift
let r = apply( 3, 5 ){ $0 + $1 }
// voire même
let r = apply( 3, 5, + )
```
Mais ne trainons pas : pour commencer il nous faut créer une [extension](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Extensions.html) de Array,
et y déclarer une fonction forEach.

```swift
extension Array{
    func forEach(){

    }
}
```

Et que puis-je attendre d’une fonction forEach ?

+ de pouvoir lui passer une fonction qui acceptera un élément du tableau en paramètre, et qui ne renverra rien.
On peut noter `(Element)->Void` le type de la fonction attendue ( attend un paramètre *Element* [générique](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Generics.html)
 et renvoie Void ).

```swift
extension Array{
    func forEach( f:(Element)->Void ){

    }
}
```

... qu’elle “appliquera” la fonction à ses éléments du tableau,
ou plutôt elle appliquera chacun de ses élements à la fonction.

```swift
extension Array{
    func forEach( f:(Element)->Void ){
        for e in self{
            f(e)
        }
    }
}
```

Et voilà ! Voyons comment l’utiliser. Pour commencer la version bavarde :

```swift
let names = ["Luke", "Yoda", "Leila"]
func log(item:String)->Void{
    print(item)
}
names.forEach( log )
```
Mais on peut faire plus “swift”, avec une closure par exemple.
Pour faire court, une closure est une “fonction anonyme”,
passée comme argument à une fonction. Leur écriture dans Swift est un peu particulière
 ( en gros on remplace func par l’accolade d’ouverture qu’on remplace par in )

```swift
names.forEach( {(n:String)->Void in
    print(n)
})
```
Le type de la valeur renvoyée par la fonction étant déclaré dans l’extension ( ->Void ),
il est [inférable](https://fr.wiktionary.org/wiki/inférer), “déductible”, donc facultatif dans l’appel (Inferred return value type).

```swift
names.forEach( {(n:String) in
    print(n)
})
```
De même, le paramètre étant déclaré “de type [générique](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Generics.html)” (Element),
pas besoin de le préciser pour l’appel.

```swift
names.forEach( { (n) in print(n) })

//Au passage on peut aussi supprimer les parenthèses.
names.forEach( { n in print(n) })
```
Ensuite, Swift propose une syntaxe particulière lorsque le dernier paramètre
 d’une méthode est une closure ( trailing closure ),
 on peut sortir le bloc des paramètres et le chainer à la fonction
Par exemple une méthode déclarée :

```swift
func apply( a:Int, b:Int, op:(c,d)->Int ){
	...
}
```

peut être appelée

```swift
apply( 5,6,{ c,d in c + d });
// ou en chainant la closure
apply( 8,1 ){ c,d in c + d };
```
Pour notre forEach donc :

```swift
names.forEach(){ n in print(n) }
// On peut même omettre les parenthèses si il n'y pas d'autres arguments.
names.forEach{ n in print(n) }
```
Pour finir, on peut supprimer le nom d’argument n, et utiliser un “raccourci”
(shorthand arguments names) d’accès aux arguments transmis à la closure via $0, $1…

```swift
names.forEach{ print($0) }
```

Voilà qui est un peu plus concis !

cf. la [doc sur les closures](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Closures.html)