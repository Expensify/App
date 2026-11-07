/**
 * Renders a Home task group. Heading above a set of prebuilt rows (urgent/error rows first),
 * with an expand/collapse toggle once past the visible limit. `children` is the slot for the loading
 * skeleton and empty state. Collapses again whenever the user leaves and returns to Home.
 */
import Text from '@components/Text';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';

import HomeSectionExpandToggle from './HomeSectionExpandToggle';

type HomeTaskGroupProps = {
    /** Heading rendered above the rows */
    title: string;

    /** Rows in the order they should render (urgent/error rows first) */
    rows: React.ReactNode[];

    /** Label for Sentry tracking of the expand toggle, from `CONST.SENTRY_LABEL` */
    expandToggleSentryLabel: SentryLabel;

    /** Rendered below the rows, for the loading skeleton and the empty state */
    children?: React.ReactNode;

    /** Tightens the gap above this group's title (used for the To-dos group, which follows Time sensitive) */
    reducedTopGap?: boolean;
};

function HomeTaskGroup({title, rows, expandToggleSentryLabel, children, reducedTopGap = false}: HomeTaskGroupProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    const [isExpanded, setIsExpanded] = useState(false);

    // Collapse again whenever the user leaves and returns to Home.
    useFocusEffect(useCallback(() => () => setIsExpanded(false), []));

    if (rows.length === 0 && !children) {
        return null;
    }

    const hiddenCount = Math.max(0, rows.length - CONST.HOME.SECTION_VISIBLE_LIMIT);
    const visibleRows = isExpanded ? rows : rows.slice(0, CONST.HOME.SECTION_VISIBLE_LIMIT);

    return (
        <>
            <View style={[cardPaddingHorizontal, reducedTopGap ? styles.mt2 : styles.mt4, styles.mb2]}>
                <Text style={styles.textLabelSupporting}>{title}</Text>
            </View>
            {rows.length > 0 && (
                <View style={styles.getWidgetRowGroupStyle(shouldUseNarrowLayout)}>
                    {visibleRows}
                    {hiddenCount > 0 && (
                        <HomeSectionExpandToggle
                            isExpanded={isExpanded}
                            onPress={() => setIsExpanded((prev) => !prev)}
                            collapsedLabel={translate('homePage.seeMore', {count: hiddenCount})}
                            sentryLabel={expandToggleSentryLabel}
                        />
                    )}
                </View>
            )}
            {children}
        </>
    );
}

export default HomeTaskGroup;
