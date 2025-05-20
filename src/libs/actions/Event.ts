import ONYXKEYS from "@src/ONYXKEYS";
import type {EventItem} from "@src/types/onyx";
import Onyx from "react-native-onyx";
import getAllEvents from '@libs/__mocks__/Events';

function setEventIsFavorite({id, isFavorite}: Partial<EventItem>) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.EVENTS}${id}`, {id, isFavorite});
}

function getEvents() {
  // TODO: implement API.read
  const eventsData = getAllEvents()
  eventsData.forEach((item) => {
    Onyx.set(`${ONYXKEYS.COLLECTION.EVENTS}${item.id}`, item);
  });
}

export {getEvents, setEventIsFavorite};
