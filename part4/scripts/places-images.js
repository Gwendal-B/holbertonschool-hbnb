'use strict';

function getPhotosForPlace(place) {
  const name = (place.title || place.name || '').toLowerCase();
  const id = String(place.id || '');

  if (name.includes('cozy apartment in paris') || name.includes('cozy apartement in paris')) {
    return [
      'images/places/cozy-apartment-paris/1.jpg',
      'images/places/cozy-apartment-paris/2.jpg',
      'images/places/cozy-apartment-paris/3.jpg'
    ];
  }

  if (name.includes('studio cosy au coeur de paris')) {
    return [
      'images/places/studio-cosy-paris/1.jpg',
      'images/places/studio-cosy-paris/2.jpg',
      'images/places/studio-cosy-paris/3.jpg'
    ];
  }

  if (name.includes('villa avec piscine vue mer') || name.includes('nice')) {
    return [
      'images/places/villa-nice/1.jpg',
      'images/places/villa-nice/2.jpg',
      'images/places/villa-nice/3.jpg'
    ];
  }

  if (name.includes('appartement haussmannien bordeaux')) {
    return [
      'images/places/bordeaux/1.jpg',
      'images/places/bordeaux/2.jpg',
      'images/places/bordeaux/3.jpg'
    ];
  }

  if (name.includes('chalet au pied des pistes') || name.includes('chamonix')) {
    return [
      'images/places/chamonix/1.jpg',
      'images/places/chamonix/2.jpg',
      'images/places/chamonix/3.jpg'
    ];
  }

  if (name.includes('loft industriel design') || name.includes('vieux lyon')) {
    return [
      'images/places/loft-lyon/1.jpg',
      'images/places/loft-lyon/2.jpg',
      'images/places/loft-lyon/3.jpg'
    ];
  }

  if (name.includes('maison bretonne bord de mer') && name.includes('quiberon')) {
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

  return [
    'images/places/default-place.jpg',
    'images/places/default-place.jpg',
    'images/places/default-place.jpg'
  ];
}

function getPhotoForPlace(place) {
  return getPhotosForPlace(place)[0];
}