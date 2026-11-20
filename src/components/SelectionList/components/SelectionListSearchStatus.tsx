/** Announces the query and count for the displayed results, independently of the input. */
import Text from '@components/Text';

import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type SelectionListSearchStatusProps = {
    /** The query for the rows currently displayed. */
    query: string;
    itemCount: number;
    message?: string;
    isLoading?: boolean;
    shouldAnnounceSuggestions?: boolean;
    style?: StyleProp<ViewStyle>;
};

function SelectionListSearchStatus({query, itemCount, message, isLoading = false, shouldAnnounceSuggestions = true, style}: SelectionListSearchStatusProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const suggestionsAnnouncement = !isLoading && shouldAnnounceSuggestions && itemCount > 0 ? translate('search.suggestionsAvailable', {count: itemCount}, query.trim()) : '';

    useDebouncedAccessibilityAnnouncement(message ?? '', !!message, query);
    useDebouncedAccessibilityAnnouncement(suggestionsAnnouncement, !!suggestionsAnnouncement, query);

    if (!message) {
        return null;
    }

    return (
        <View style={[styles.ph5, styles.pb5, style]}>
            <Text
                style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}
                aria-hidden
            >
                {message}
            </Text>
        </View>
    );
}

export default SelectionListSearchStatus;
