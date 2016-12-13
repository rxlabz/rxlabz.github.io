---
layout: post
title:  "Intellij & autres IDE Jetbrains... : File et live templates"
date:   2016-03-28 13:29:08 +0100
categories: tools
---

Petite note sur l'utilisation des templates dans Intellij, WebStorm, PHPStorm...

## Templates de fichiers

Les variables de templates ${NOM_VARIABLE} ( ou $NOM_VARIABLE ) permettent de définir des placeholders "dynamiques",
que l'on pourra renseigner au moment de la création du fichier.

### Syntaxe variables

```javascript
class ${NOM_VARIABLE}{
    $END$
}
```

Il est à noter que si un template contient plusieurs placeholders, Tab permet de "passer" au placeholder suivant.

### Variables pré-définies

- ${NAME}
- ${PACKAGE_NAME}
- ... cf [doc](https://www.jetbrains.com/help/idea/2016.1/file-template-variables.html)

Les valeurs des variables de _file templates_ sont saisies via la popup de création du fichier.

Une option permet d'activer les live templates au sein du file template, de manière à éditer les variables injectées "dans leur contexte".

Dans cet exemple, on définit un placeholder pour inclure une doc pour la classe crée, il sera bien plus pratique de le remplir dans l'éditeur, plutôt que dans une popup.

```javascript
/**
* #[[ DOC ]]#
*/
class ${FILENAME}{
    $END$
}
```

## Live templates

Les live templates permettent d'insérer des fragments de codes paramètrables à l'aide de raccourci textuel.
Par exemple un raccourci _lg_ qui afficherait automatiquement _console.log("")_ et qui placerait le curseur entre les guillemets après insertion.

```javascript
console.log("$NOM_VARIABLES$");
```

Intellij intégre deux variables prédéfinies :
- $END$ : permet d'indiquer où le curseur doit être placé après insertion du template et saisies de ses variables.
- *SELECTION$ permet de faire référence au code sélectionné au moment de l'insertion du live-template.

Il est également possible de définir ses propres variables, renseignées dans la continuité de l'insertion du live template.

```javascript
console.log('$NOM_VARIABLES$');
$END$
```

### Injecter un live template autour d'une sélection

Ce template permet d'injecter une boucle for...of autour de la sélection active.

```javascript
for( let p of $SELECTION$ ){
  $END$
}
```

### utilisation des fonctions de live templates

Il est possible d'utiliser quelques fonctions dans les _live templates_ :
- capitalize()
- arrayVariable()
- camelCase()
- capitalize()
- clipboard()
- ... cf [doc](https://www.jetbrains.com/help/idea/2016.1/live-template-variables.html)

```dart
print('$METHOD$... $END$');
```

ici la variable `$METHOD$` sera remplacer à l'insertion par le nom de la méthode dans laquelle le code est inséré.

![tpl methods]({{ "/img/intellij_tpl_methods.jpg" | prepend: site.baseurl }})

Et voilà comment gagner 7mn30 par an !!!