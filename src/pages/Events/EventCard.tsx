import React, {useCallback} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Image from '@components/Image';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Event} from '@src/types/onyx';
import getEventDateLabel from './getEventDateLabel';

type EventCardProps = {
    /** Event data to display in the card row */
    event: Event;

    /** Whether the event is currently favorited */
    isFavorite: boolean;

    /** Called when the user toggles the favorite state */
    onToggleFavorite: (eventID: string, isFavorite: boolean) => void;
};

function EventCard({event, isFavorite, onToggleFavorite}: EventCardProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Star']);

    const handleToggleFavorite = useCallback(() => {
        onToggleFavorite(event.id, isFavorite);
    }, [event.id, isFavorite, onToggleFavorite]);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.ph5, styles.pv3, styles.gap3]}>
            <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
            >
                {/* eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- Custom Image wrapper does not support this prop. */}
                <Image
                    source={{uri: event.thumbnailUrl}}
                    style={styles.eventThumbnail}
                    cachePolicy="memory-disk"
                />
            </View>
            <View style={styles.flex1}>
                <Text
                    style={styles.textStrong}
                    numberOfLines={1}
                >
                    {event.name}
                </Text>
                <Text style={styles.colorMuted}>{getEventDateLabel(event, translate)}</Text>
            </View>
            <PressableWithFeedback
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate(isFavorite ? 'events.unfavorite' : 'events.favorite')}
                sentryLabel={CONST.SENTRY_LABEL.EVENTS.TOGGLE_FAVORITE}
                onPress={handleToggleFavorite}
                shouldUseAutoHitSlop
            >
                <Icon
                    src={icons.Star}
                    fill={isFavorite ? theme.success : theme.icon}
                />
            </PressableWithFeedback>
        </View>
    );
}

export default EventCard;
