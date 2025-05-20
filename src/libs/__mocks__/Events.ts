import type {EventItem} from "@src/types/onyx"

const getAllEvents = (): EventItem[] => {
  return [
  {
    id: '1',
    name: 'Sunset Yoga in the Park',
    thumbnail: 'https://picsum.photos/seed/event1/200/120',
    startDate: '2025-06-10',
    endDate: '2025-06-10',
  },
  {
    id: '2',
    name: 'Midnight Astronomy Walk',
    thumbnail: 'https://picsum.photos/seed/event2/200/120',
    startDate: '2025-06-12',
    endDate: '2025-06-12',
  },
  {
    id: '3',
    name: 'Indie Music Festival',
    thumbnail: 'https://picsum.photos/seed/event3/200/120',
    startDate: '2025-06-14',
    endDate: '2025-06-15',
  },
  {
    id: '4',
    name: 'Food Truck Fiesta',
    thumbnail: 'https://picsum.photos/seed/event4/200/120',
    startDate: '2025-06-17',
    endDate: '2025-06-17',
  },
  {
    id: '5',
    name: 'Digital Nomad Networking',
    thumbnail: 'https://picsum.photos/seed/event5/200/120',
    startDate: '2025-06-18',
    endDate: '2025-06-18',
  },
  {
    id: '6',
    name: 'Weekend Coding Bootcamp',
    thumbnail: 'https://picsum.photos/seed/event6/200/120',
    startDate: '2025-06-20',
    endDate: '2025-06-22',
  },
  {
    id: '7',
    name: 'Sustainable Living Fair',
    thumbnail: 'https://picsum.photos/seed/event7/200/120',
    startDate: '2025-06-24',
    endDate: '2025-06-25',
  },
  {
    id: '8',
    name: 'Vintage Market Pop-Up',
    thumbnail: 'https://picsum.photos/seed/event8/200/120',
    startDate: '2025-06-27',
    endDate: '2025-06-27',
  },
  {
    id: '9',
    name: 'Creative Writing Workshop',
    thumbnail: 'https://picsum.photos/seed/event9/200/120',
    startDate: '2025-06-29',
    endDate: '2025-06-30',
  },
];
}

export default getAllEvents;