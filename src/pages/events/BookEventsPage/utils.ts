import type {Event} from '@src/types/onyx/Event';

export function sortEventsByFavorite(events: Event[]): Event[] {
    return events.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
}
