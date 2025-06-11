import React, {useMemo} from 'react';
import {FlatList} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Events from '@libs/actions/Events';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Event} from '@src/types/onyx/Event';
import EventCard from './EventCard';
import {sortEventsByFavorite} from './utils';

function EventsList() {
    const styles = useThemeStyles();
    const [allEvents] = useOnyx(ONYXKEYS.COLLECTION.EVENTS, {canBeMissing: true});
    const eventsList = useMemo(() => Object.values(allEvents ?? {}).filter((event) => !!event), [allEvents]);
    const sortedEventsList = useMemo(() => sortEventsByFavorite(eventsList), [eventsList]);

    const renderItem = ({item}: {item: Event}) => (
        <EventCard
            event={item}
            onFavoritePress={() => Events.markEventAsFavorite(item.id, !item.isFavorite)}
            isFavorite={!!item.isFavorite}
        />
    );

    return (
        <FlatList
            data={sortedEventsList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.p4}
        />
    );
}

export default EventsList;
