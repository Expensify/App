import type {EventItem} from "@src/types/onyx";
import type {OnyxCollection} from "react-native-onyx";

function eventListSelector(eventItems: OnyxCollection<EventItem> | undefined): EventItem[] {
  if (!eventItems) {
      return [];
  }

  return Object.values(eventItems).filter((event): event is EventItem => !!event);
}

function sortEvents(eventList: EventItem[]): EventItem[] {
  return [...eventList].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
} 

export {eventListSelector, sortEvents};