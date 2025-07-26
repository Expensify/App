import React, {useCallback} from 'react';
import { View } from 'react-native';
import FlatList from '@components/FlatList';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFavouriteEvent} from '@userActions/Event';
import BookEventListItem from './BookEventListItem';

const INITIAL_NUM_TO_RENDER = 20;

type Event = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    thumbnail: string;
}

type BookEventsListProps = {
    /** Type of available events */
    data: Event[],

    /** Ids of favourite events */
    favouriteEvents: string[],
}

function BookEventsList({data, favouriteEvents}: BookEventsListProps) {
    const styles = useThemeStyles();

    const renderItem = useCallback(
        (eventItem: { item: Event }) => {
            const {item} = eventItem;
            return (
               <BookEventListItem
                   isFavourite={isFavouriteEvent(item.id)}
                   id={item.id} name={item.name}
                   startDate={item.startDate}
                   endDate={item.endDate}
                   thumbnail={item.thumbnail}
               />
            );
        },
        [],
    );

    function keyExtractor(item: Event): string {
        return item.id;
    }
    return (
        <View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}>
            <FlatList
                extraData={favouriteEvents}
                initialNumToRender={INITIAL_NUM_TO_RENDER}
                testID={BookEventsList.name}
                style={styles.overscrollBehaviorContain}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => keyExtractor(item)}
                onEndReachedThreshold={0.75}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.pt2}
            />
        </View>)
}

export default BookEventsList;