# Plein Écran iPad

Extension SillyTavern pour que l’interface occupe **tout l’écran** sur iPad (10e génération et tablettes similaires), en portrait comme en paysage.

## Pourquoi

SillyTavern passe en mise en page bureau au-delà de **1000 px** de large. Un iPad 10e génération en paysage fait **1180 × 820** CSS pixels : le chat reste alors limité à `--sheldWidth` (50 % de la largeur par défaut) et des bandes vides apparaissent de chaque côté.

Cette extension détecte une tablette tactile et force :

- la colonne de chat (`#sheld`) et la barre du haut sur **toute la largeur**
- une hauteur calée sur le viewport visible (Safari iPadOS)
- les marges de sécurité iOS (`safe-area-inset`)
- les panneaux / tiroirs en overlay pleine largeur

Sur iPhone, la barre d’icônes du haut reste **sous l’encoche** (plus floue ni inaccessible).

## Installation

Depuis SillyTavern → Extensions → Installer une extension :

```
https://github.com/hydravnss/plein-ecran-ipad
```

Ou clone dans `data/<user>/extensions/plein-ecran-ipad`.

Puis recharge la page (sur iPad : ferme l’onglet et rouvre-le).

## Réglages

Extensions → **Plein Écran iPad** → case **Activer** (activé par défaut).

Pour masquer aussi la barre de Safari, ajoute le site à l’écran d’accueil (partage → Sur l’écran d’accueil).

## 1.0.1

La barre du haut ne passe plus derrière l’heure / l’encoche sur iPhone : les icônes redeviennent visibles et cliquables.

## Licence

MIT © 2026 hydravnss
