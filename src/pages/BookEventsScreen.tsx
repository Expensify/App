import {format} from 'date-fns';
import React, {useCallback, useState} from 'react';
import {FlatList, Image, View} from 'react-native';
import type {ListRenderItem} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {translateLocal} from '@libs/Localize';
import variables from '@styles/variables';

type IEvent = {
    id: string;
    name: string;
    startDate: string;
    endDate: string | null;
    thumbnail: string;
    isFavorite?: boolean;
};

const mockEvents: IEvent[] = [
    {
        id: '1',
        name: 'App.js Conf 2025',
        startDate: '2025-05-28',
        endDate: '2025-05-30',
        thumbnail: 'https://fastly.picsum.photos/id/42/200/200.jpg?hmac=jc_eDuYgXmIOC_4gl2wEY0jgxC2rMPJbDF6QJdynR7Q',
    },
    {
        id: '2',
        name: 'Music Festival',
        startDate: '2023-10-05',
        endDate: '2023-10-07',
        thumbnail: 'https://fastly.picsum.photos/id/42/200/200.jpg?hmac=jc_eDuYgXmIOC_4gl2wEY0jgxC2rMPJbDF6QJdynR7Q',
    },
    {
        id: '3',
        name: 'Workshop on AI',
        startDate: '2023-09-25',
        endDate: null,
        thumbnail: 'https://fastly.picsum.photos/id/42/200/200.jpg?hmac=jc_eDuYgXmIOC_4gl2wEY0jgxC2rMPJbDF6QJdynR7Q',
    },
    {
        id: '4',
        name: 'Book Fair',
        startDate: '2023-11-10',
        endDate: '2023-11-15',
        thumbnail: 'https://fastly.picsum.photos/id/42/200/200.jpg?hmac=jc_eDuYgXmIOC_4gl2wEY0jgxC2rMPJbDF6QJdynR7Q',
    },
    {
        id: '5',
        name: 'Art Exhibition',
        startDate: '2023-12-01',
        endDate: '2023-12-10',
        thumbnail: 'https://fastly.picsum.photos/id/42/200/200.jpg?hmac=jc_eDuYgXmIOC_4gl2wEY0jgxC2rMPJbDF6QJdynR7Q',
    },
    {
        id: '6',
        name: 'DJ Party',
        startDate: '2023-12-02',
        endDate: null,
        thumbnail: 'https://fastly.picsum.photos/id/42/200/200.jpg?hmac=jc_eDuYgXmIOC_4gl2wEY0jgxC2rMPJbDF6QJdynR7Q',
    },
];

const keyExtractor = (item: IEvent) => item.id;

const DATE_FORMAT = 'dd/MM/yyyy';

const formatDateRange = (startDate: string, endDate: string | null) => {
    return `${format(new Date(startDate), DATE_FORMAT)}${endDate && `- ${format(new Date(endDate), DATE_FORMAT)}`}`;
};

function BookEventsScreen() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [eventsList, setEventsList] = useState<IEvent[]>(mockEvents);

    const toggleFavorite = useCallback(
        (eventId: string) => {
            setEventsList((prevEvents: IEvent[]) => {
                const newEvents = [...prevEvents];
                const eventIndex = newEvents.findIndex((event) => event.id === eventId);
                const event = newEvents.at(eventIndex);
                if (event) {
                    event.isFavorite = !event.isFavorite;
                }
                return newEvents.sort((a, b) => {
                    const aIsFavorite = a.isFavorite ?? false;
                    const bIsFavorite = b.isFavorite ?? false;
                    return aIsFavorite > bIsFavorite ? -1 : 1;
                });
            });
        },
        [setEventsList],
    );

    const renderEventItem = useCallback<ListRenderItem<IEvent>>(
        ({item}) => {
            const isFavorite = eventsList.find((event) => event.id === item.id)?.isFavorite;
            return (
                <View style={[styles.flexRow, styles.appBG, styles.borderRadiusComponentNormal, styles.p2, styles.mb4, styles.border, styles.mh2]}>
                    <Image
                        source={{uri: item.thumbnail}}
                        style={[styles.avatarXLarge, styles.borderRadiusComponentNormal, styles.highlightBG]}
                    />
                    <View style={[styles.flex1, styles.ml3, styles.justifyContentCenter]}>
                        <Text style={[styles.textStrong, styles.textNormal, styles.mb1]}>{item.name}</Text>
                        <Text style={styles.textNormal}>{formatDateRange(item.startDate, item.endDate)}</Text>
                    </View>
                    <PressableWithFeedback
                        style={[styles.justifyContentCenter, styles.p2]}
                        onPress={() => toggleFavorite(item.id)}
                        accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        accessibilityRole="button"
                    >
                        <Icon
                            fill={isFavorite ? theme.success : theme.icon}
                            src={Expensicons.Heart}
                            height={variables.iconSizeSmall}
                            width={variables.iconSizeSmall}
                        />
                    </PressableWithFeedback>
                </View>
            );
        },
        [eventsList, theme, styles, toggleFavorite],
    );

    return (
        <ScreenWrapper
            style={[styles.flex1]}
            testID="book-events-screen"
        >
            <HeaderWithBackButton title={translateLocal('sidebarScreen.bookEvents')} />
            <FlatList
                data={eventsList}
                renderItem={renderEventItem}
                keyExtractor={keyExtractor}
            />
        </ScreenWrapper>
    );
}

export default BookEventsScreen;
