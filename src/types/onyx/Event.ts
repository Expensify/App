/** Model of Event */
type EventItem = {
    /** id for the event */
    id: string;

    /** Name of the event */
    name: string;

    /** thumbnail of the event */
    thumbnail: string;

    /** start date of the event */
    startDate: string;

    /** end date of the event */
    endDate: string;

    /** is event saved to favorite */
    isFavorite?: boolean;
};

export default EventItem;
