import React from 'react';
import TabSelectorItem from '@components/TabSelector/TabSelectorItem';
import type {TabSelectorItemProps} from '@components/TabSelector/types';
import {useSavedSearchTitleData} from './SavedSearchTitleContext';

/**
 * Wraps TabSelectorItem for saved searches whose display name is the raw query.
 * Consumes SavedSearchTitleContext so only this subtree re-renders when resolution data changes.
 */
function SavedSearchTabSelectorItem({
    tabKey,
    icon,
    title: rawTitle,
    onPress,
    onLongPress,
    backgroundColor,
    activeOpacity,
    inactiveOpacity,
    isActive,
    shouldShowLabelWhenInactive,
    testID,
    sentryLabel,
    shouldShowProductTrainingTooltip,
    renderProductTrainingTooltip,
    equalWidth,
    badgeText,
    isDisabled,
    pendingAction,
}: TabSelectorItemProps) {
    const {resolveTitle} = useSavedSearchTitleData();
    const title = resolveTitle(rawTitle ?? '');

    return (
        <TabSelectorItem
            tabKey={tabKey}
            icon={icon}
            title={title}
            onPress={onPress}
            onLongPress={onLongPress}
            backgroundColor={backgroundColor}
            activeOpacity={activeOpacity}
            inactiveOpacity={inactiveOpacity}
            isActive={isActive}
            shouldShowLabelWhenInactive={shouldShowLabelWhenInactive}
            testID={testID}
            sentryLabel={sentryLabel}
            shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
            renderProductTrainingTooltip={renderProductTrainingTooltip}
            equalWidth={equalWidth}
            badgeText={badgeText}
            isDisabled={isDisabled}
            pendingAction={pendingAction}
        />
    );
}

export default SavedSearchTabSelectorItem;
