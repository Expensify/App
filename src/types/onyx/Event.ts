export interface Event {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    isFavorite: boolean;
    thumbnail?: string;
}

export default Event;
