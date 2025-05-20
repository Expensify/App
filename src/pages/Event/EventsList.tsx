import useThemeStyles from "@hooks/useThemeStyles";
import {useEffect, useMemo, useCallback} from "react";
import {View, FlatList} from "react-native";
import {useOnyx} from "react-native-onyx";
import ONYXKEYS from "@src/ONYXKEYS";
import type {EventItem} from "@src/types/onyx";
import {setEventIsFavorite, getEvents} from "@libs/actions/Event";
import {eventListSelector, sortEvents} from "@libs/EventUtils";

import EventCard from "./EventCard";

function EventsList() {
  const styles = useThemeStyles();
  const [events] = useOnyx(ONYXKEYS.COLLECTION.EVENTS, {
      selector: (_eventItems) => eventListSelector(_eventItems),
  });
  
  useEffect(() => {
    getEvents();
  }, []);

  const toggleFavorite = useCallback((id: string, isFavoritePrev: boolean) => {
    setEventIsFavorite({ id, isFavorite: !isFavoritePrev });
  }, []);

  const sortedEvents = useMemo(() => {
    return sortEvents(events ?? []);
  }, [events]);

  const renderEventItem = ({ item }: { item: EventItem}) => {
    return <EventCard item={item} onToggleFavorite={toggleFavorite} />;
  };

  return (
      <View style={[styles.flex1]}>
        <FlatList
          data={sortedEvents}
          renderItem={renderEventItem}
        />
      </View>
  );
}

EventsList.displayName = 'ManageTrips';

export default EventsList;