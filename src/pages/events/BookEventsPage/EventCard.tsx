import React from 'react';
import {Image, View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {GenericPressable as Pressable} from '@components/Pressable';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Event} from '@src/types/onyx';
import {formatDate} from './utils';

type EventCardProps = {
    event: Event;
    onFavoritePress: (eventId: string) => void;
    isFavorite: boolean;
};

function EventCard({event, onFavoritePress, isFavorite}: EventCardProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const handleFavoritePress = () => {
        onFavoritePress(event.id);
    };

    return (
        <View style={styles.eventCard}>
            <Image
                source={{uri: event.thumbnail}}
                style={styles.eventCardImage}
                resizeMode="cover"
            />
            <View style={styles.p4}>
                <Text style={[styles.textStrong, {color: theme.text}]}>{event.name}</Text>
                <Text style={[styles.textLabel, {color: theme.textSupporting}]}>
                    {formatDate(event.startDate)}
                    {event.endDate ? ` - ${formatDate(event.endDate)}` : ''}
                </Text>
                <Pressable
                    onPress={handleFavoritePress}
                    style={styles.eventCardFavoriteButton}
                    accessible={false}
                >
                    <Icon
                        src={Expensicons.Star}
                        fill={isFavorite ? theme.iconSuccessFill : theme.icon}
                    />
                </Pressable>
            </View>
        </View>
    );
}

export default EventCard;
