import feastLogo from '../assets/feast_logo.png';
import openKitchenLogo from '../assets/open_kitchen_logo.png';
import gatherLogo from '../assets/gather_logo.png';

const sharedComments = [
  {
    id: 'comment-1',
    author: 'Anonymous Thunderbird',
    timestamp: '2 hours ago',
    body: 'Loved the seasoning today! Portion was generous too.'
  },
  {
    id: 'comment-2',
    author: 'Anonymous Wolf',
    timestamp: 'Yesterday',
    body: 'A bit salty for my taste but still enjoyable.'
  }
];

export const halls = {
  totem: {
    id: 'totem',
    name: 'Feast',
    heroImage: 'https://placehold.co/600x400/6B46C1/FFFFFF?text=Totem+Park',
    logo: feastLogo,
    stations: [
      {
        id: 'totem-grill',
        name: 'Grill Station',
        dishes: [
          {
            id: 'butter-chicken',
            name: 'Butter Chicken',
            rating: 8.7,
            description: 'Creamy tomato sauce with fragrant basmati rice.',
            tags: ['GF'],
            image: 'https://images.unsplash.com/photo-1608039829574-cd993f2c94da?auto=format&fit=crop&w=800&q=60',
            comments: sharedComments
          },
          {
            id: 'veggie-bowl',
            name: 'Veggie Bowl',
            rating: 7.4,
            description: 'Roasted squash, chickpeas, and tahini drizzle.',
            tags: ['VG'],
            image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=60',
            comments: sharedComments.slice(0, 1)
          }
        ]
      },
      {
        id: 'totem-comfort',
        name: 'Comfort Kitchen',
        dishes: [
          {
            id: 'mac-and-cheese',
            name: 'Smoky Mac and Cheese',
            rating: 8.1,
            description: 'Sharp cheddar blend baked with herb breadcrumbs.',
            tags: ['V'],
            image: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=800&q=60',
            comments: []
          },
          {
            id: 'roast-beef',
            name: 'Herb Roast Beef',
            rating: 8.4,
            description: 'Slow roasted with rosemary jus and crispy potatoes.',
            tags: ['GF', 'DF'],
            image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=60',
            comments: sharedComments
          }
        ]
      }
    ]
  },
  'place-vanier': {
    id: 'place-vanier',
    name: 'Gather',
    heroImage: 'https://placehold.co/600x400/F97316/FFFFFF?text=Place+Vanier',
    logo: gatherLogo,
    stations: [
      {
        id: 'vanier-global',
        name: 'Global Table',
        dishes: [
          {
            id: 'bibimbap',
            name: 'Veggie Bibimbap',
            rating: 8.9,
            description: 'Sizzling rice bowl with gochujang sauce.',
            tags: ['VG', 'GF'],
            image: 'https://images.unsplash.com/photo-1608039829574-cd993f2c94da?auto=format&fit=crop&w=800&q=60',
            comments: sharedComments
          },
          {
            id: 'pho-bowl',
            name: 'Ginger Pho Bowl',
            rating: 7.6,
            description: 'Clear broth, rice noodles, and fresh herbs.',
            tags: ['GF', 'DF'],
            image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=60',
            comments: []
          }
        ]
      },
      {
        id: 'vanier-pizza',
        name: 'Pizza + Pasta',
        dishes: [
          {
            id: 'pesto-pizza',
            name: 'Charred Pesto Pizza',
            rating: 9.3,
            description: 'Fresh basil pesto, house mozzarella, roasted tomatoes.',
            tags: ['V'],
            image: 'https://images.unsplash.com/photo-1548365328-9009f86eee54?auto=format&fit=crop&w=800&q=60',
            comments: sharedComments.slice(0, 1)
          },
          {
            id: 'baked-ziti',
            name: 'Baked Ziti',
            rating: 7.8,
            description: 'Slow simmered tomato sauce with ricotta and basil.',
            tags: [],
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60',
            comments: []
          }
        ]
      }
    ]
  },
  'orchard-commons': {
    id: 'orchard-commons',
    name: 'Open Kitchen',
    heroImage: 'https://placehold.co/600x400/14B8A6/FFFFFF?text=Orchard+Commons',
    logo: openKitchenLogo,
    stations: [
      {
        id: 'orchard-market',
        name: 'Market Kitchen',
        dishes: [
          {
            id: 'salmon-bowl',
            name: 'Miso Salmon Bowl',
            rating: 8.8,
            description: 'Seared salmon, sesame greens, and pickled veggies.',
            tags: ['GF'],
            image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=60',
            comments: sharedComments
          },
          {
            id: 'veggie-curry',
            name: 'Coconut Veggie Curry',
            rating: 8.5,
            description: 'Golden curry, roasted cauliflower, jasmine rice.',
            tags: ['VG', 'GF'],
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60',
            comments: []
          }
        ]
      },
      {
        id: 'orchard-garden',
        name: 'Garden Table',
        dishes: [
          {
            id: 'grain-bowl',
            name: 'Harvest Grain Bowl',
            rating: 7.9,
            description: 'Farro, roasted beets, citrus vinaigrette.',
            tags: ['V'],
            image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=60',
            comments: sharedComments.slice(0, 1)
          },
          {
            id: 'lentil-soup',
            name: 'Smoky Lentil Soup',
            rating: 7.2,
            description: 'Slow simmered lentils with charred tomatoes.',
            tags: ['VG'],
            image: 'https://images.unsplash.com/photo-1448043552756-e747b7a2b2b8?auto=format&fit=crop&w=800&q=60',
            comments: []
          }
        ]
      }
    ]
  }
};

export const hallList = Object.values(halls);

export function getHall(hallId) {
  return halls[hallId] ?? null;
}

export function getStation(hallId, stationId) {
  return getHall(hallId)?.stations.find((station) => station.id === stationId) ?? null;
}

export function getDish(hallId, stationId, dishId) {
  return getStation(hallId, stationId)?.dishes.find((dish) => dish.id === dishId) ?? null;
}

export function getAllDishesWithContext() {
  const dishes = [];
  Object.values(halls).forEach((hall) => {
    hall.stations.forEach((station) => {
      station.dishes.forEach((dish) => {
        dishes.push({
          hallId: hall.id,
          hallName: hall.name,
          stationId: station.id,
          stationName: station.name,
          dishId: dish.id,
          dishName: dish.name,
          rating: dish.rating,
          dish
        });
      });
    });
  });
  return dishes;
}

export function getTopDishes(limit = 5) {
  return getAllDishesWithContext()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
