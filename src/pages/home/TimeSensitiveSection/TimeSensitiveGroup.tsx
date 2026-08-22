import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import HomeSectionExpandToggle from '@pages/home/HomeSectionExpandToggle';

import CONST from '@src/CONST';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';

type TimeSensitiveGroupProps = {
    /** The prebuilt time-sensitive item rows (from useTimeSensitiveItems). */
    items: React.ReactNode[];
};

/**
 * Renders the "Time sensitive" heading and item rows as a group inside another card (the Home "For you" card).
 * Returns null when there are no items so the group leaves no trace. It's the card owner's job to keep the card
 * visible whenever this group has content.
 */
function TimeSensitiveGroup({items}: TimeSensitiveGroupProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isExpanded, setIsExpanded] = useState(false);

    // Collapse again whenever the user leaves and returns to Home.
    useFocusEffect(useCallback(() => () => setIsExpanded(false), []));

    if (items.length === 0) {
        return null;
    }

    const hiddenCount = Math.max(0, items.length - CONST.HOME.SECTION_VISIBLE_LIMIT);
    const visibleItems = isExpanded ? items : items.slice(0, CONST.HOME.SECTION_VISIBLE_LIMIT);

    return (
        <>
            <View style={[shouldUseNarrowLayout ? styles.ph5 : styles.ph8, styles.mt4, styles.mb2]}>
                <Text style={styles.getWidgetContainerTitleStyle(theme.text)}>{translate('homePage.timeSensitiveSection.title')}</Text>
            </View>
            <View style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}>
                {visibleItems}
                {hiddenCount > 0 && (
                    <HomeSectionExpandToggle
                        isExpanded={isExpanded}
                        onPress={() => setIsExpanded((prev) => !prev)}
                        collapsedLabel={translate('homePage.seeMore', {count: hiddenCount})}
                    />
                )}
            </View>
        </>
    );
}

export default TimeSensitiveGroup;
