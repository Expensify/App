/** Nested navigation under a row of the flat navigation bar. It only knows groups and items, so any row that expands into a list of searches can use it. */
import Accordion from '@components/Accordion';
import Text from '@components/Text';

import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import {getFlatNavSubnavMarkerTop} from '@libs/Navigation/FlatNav/FlatNavUtils';
import type {ActiveFlatNavItem, FlatNavItem, FlatNavSubnavGroup} from '@libs/Navigation/FlatNav/types';
import {getSearchTypeMenuItemSentryLabel} from '@libs/SearchUIUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import FlatNavSavedSearchSubnavItem from './FlatNavSavedSearchSubnavItem';
import FlatNavSubnavItem from './FlatNavSubnavItem';
import FlatNavSubnavMarker from './FlatNavSubnavMarker';

const ROW_HEIGHTS = {
    header: variables.flatNavigationBarSubnavHeaderHeight,
    item: variables.flatNavigationBarSubnavItemHeight,
    marker: variables.flatNavigationBarSubnavMarkerHeight,
};

type FlatNavSubnavProps = {
    /** The headers to list, each with its searches, in render order */
    groups: FlatNavSubnavGroup[];

    /** Which row is selected. Undefined when none of the groups holds the current search. */
    activeItem: ActiveFlatNavItem | undefined;

    /** Whether the subnav is open. It closes without unmounting, which lets it animate. */
    isVisible: boolean;

    onItemPress: (item: FlatNavItem) => void;
};

function FlatNavSubnav({groups, activeItem, isVisible, onItemPress}: FlatNavSubnavProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(isVisible);

    const activeItemKey = activeItem?.itemKey;

    return (
        <Accordion
            isExpanded={isAccordionExpanded}
            isToggleTriggered={shouldAnimateAccordionSection}
        >
            <View
                testID="FlatNavSubnav"
                pointerEvents={isVisible ? 'auto' : 'none'}
                accessibilityElementsHidden={!isVisible}
                aria-hidden={!isVisible}
                importantForAccessibility={isVisible ? 'auto' : 'no-hide-descendants'}
            >
                {groups.map((group) => (
                    <View key={group.id}>
                        <View style={styles.flatNavigationBarSubnavHeader}>
                            <Text
                                variant="micro"
                                color={theme.textSupporting}
                                accessibilityRole={CONST.ROLE.HEADER}
                                numberOfLines={1}
                            >
                                {translate(group.translationPath)}
                            </Text>
                        </View>
                        {group.items.map((item) => {
                            const isSelected = item.key === activeItemKey;
                            if (item.type === FLAT_NAV.ITEM_TYPE.SAVED_SEARCH) {
                                return (
                                    <FlatNavSavedSearchSubnavItem
                                        key={item.key}
                                        item={item}
                                        isSelected={isSelected}
                                        onPress={onItemPress}
                                    />
                                );
                            }
                            return (
                                <FlatNavSubnavItem key={item.key}>
                                    <FlatNavSubnavItem.Link
                                        label={translate(item.translationPath)}
                                        isSelected={isSelected}
                                        sentryLabel={getSearchTypeMenuItemSentryLabel(item.key)}
                                        onPress={() => onItemPress(item)}
                                    >
                                        {!!item.badgeText && <FlatNavSubnavItem.Badge text={item.badgeText} />}
                                    </FlatNavSubnavItem.Link>
                                </FlatNavSubnavItem>
                            );
                        })}
                    </View>
                ))}
                <View
                    style={styles.flatNavigationBarSubnavRule}
                    pointerEvents="none"
                />
                <FlatNavSubnavMarker top={getFlatNavSubnavMarkerTop(groups, activeItemKey, ROW_HEIGHTS)} />
            </View>
        </Accordion>
    );
}

export default FlatNavSubnav;
