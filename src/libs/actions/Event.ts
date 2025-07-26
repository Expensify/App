import type {OnyxSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const favouriteEvents = new Set();

Onyx.connect({
    key: ONYXKEYS.FAVOURITE_EVENTS,
    callback: (events) => {
        if (!Array.isArray(events)) {
            Onyx.set(ONYXKEYS.FAVOURITE_EVENTS, [] as unknown as OnyxSetInput<"favourite_events">);
        } else {
            events.forEach(event => favouriteEvents.add(event));
        }
    },
});

function handleClickOnEvent(eventId: string) {
    if (isFavouriteEvent(eventId)) {
        deleteEventFromFavourites(eventId);
    } else {
        addEventToFavourites(eventId);
    }
}

function addEventToFavourites(eventId: string) {
    favouriteEvents.add(eventId);
    Onyx.set(ONYXKEYS.FAVOURITE_EVENTS, Array.from(favouriteEvents) as string[])
}

function deleteEventFromFavourites(eventId: string) {
    favouriteEvents.delete(eventId);
    Onyx.set(ONYXKEYS.FAVOURITE_EVENTS, Array.from(favouriteEvents) as string[]);
}

function isFavouriteEvent(eventId: string) {
    return favouriteEvents.has(eventId);
}

export {addEventToFavourites, deleteEventFromFavourites, handleClickOnEvent, isFavouriteEvent};