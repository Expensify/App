/**
 *
 */
type Event = {
    /** ID of the event */
    id: string;

    /** Name of the event */
    name: string;

    /** Start of the event */
    startDate: string;

    /** End of the event */
    endDate: string;

    /** Thumbnail of the event */
    thumbnail: string;
}

export default Event;