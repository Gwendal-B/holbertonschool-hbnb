/**
 * places-images.js
 * Associe des images locales aux places affichées dans l'interface.
 * Le mapping repose surtout sur le nom de la place
 * avec une image par défaut si aucun cas ne correspond.
 */
'use strict';

function getPhotosForPlace(place) {
  // Retourne un tableau de photos pour la galerie de la place.
  const name = (place.title || place.name || '').toLowerCase();
  const id = String(place.id || '');

  if (name.includes('cozy apartment in paris') || name.includes('cozy apartement in paris')) {
    return [
      'images/places/cozy-apartment-paris/1.jpg',
      'images/places/cozy-apartment-paris/2.jpg',
      'images/places/cozy-apartment-paris/3.jpg'
    ];
  }

  if (name.includes('cozy studio in the heart of paris')) {
    return [
      'images/places/studio-cosy-paris/1.jpg',
      'images/places/studio-cosy-paris/2.jpg',
      'images/places/studio-cosy-paris/3.jpg'
    ];
  }

  if (name.includes('villa with pool and sea view') || name.includes('nice')) {
    return [
      'images/places/villa-nice/1.jpg',
      'images/places/villa-nice/2.jpg',
      'images/places/villa-nice/3.jpg'
    ];
  }

  if (name.includes('haussmannian apartment')) {
    return [
      'images/places/bordeaux/1.jpg',
      'images/places/bordeaux/2.jpg',
      'images/places/bordeaux/3.jpg'
    ];
  }

  if (name.includes('Chalet at the foot of the slopes') || name.includes('chamonix')) {
    return [
      'images/places/chamonix/1.jpg',
      'images/places/chamonix/2.jpg',
      'images/places/chamonix/3.jpg'
    ];
  }

  if (name.includes('designer industrial loft') || name.includes('vieux lyon')) {
    return [
      'images/places/loft-lyon/1.jpg',
      'images/places/loft-lyon/2.jpg',
      'images/places/loft-lyon/3.jpg'
    ];
  }

  if (name.includes('breton house by the sea') && name.includes('quiberon')) {
    return id.endsWith('2')
      ? [
          'images/places/quiberon-2/1.jpg',
          'images/places/quiberon-2/2.jpg',
          'images/places/quiberon-2/3.jpg'
        ]
      : [
          'images/places/quiberon-1/1.jpg',
          'images/places/quiberon-1/2.jpg',
          'images/places/quiberon-1/3.jpg'
        ];
  }

  if (name.includes('groundskeeper') || name.includes('cabin')) {
    return [
      'images/places/woodland-cabin/1.jpg',
      'images/places/woodland-cabin/2.jpg',
      'images/places/woodland-cabin/3.jpg'
    ];
  }

  if (name.includes('cave') || name.includes('misty')) {
    return [
      'images/places/hidden-cave/1.jpg',
      'images/places/hidden-cave/2.jpg',
      'images/places/hidden-cave/3.jpg'
    ];
  }

  return [
    'images/places/default-place.jpg'
  ];
}

function getPhotoForPlace(place) {
  // Utilisé sur la home pour n'afficher que l'image principale.
  return getPhotosForPlace(place)[0];
}
