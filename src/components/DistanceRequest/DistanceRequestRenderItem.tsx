import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import type {TranslationPaths} from '@src/languages/types';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

type DistanceRequestProps = {
    /** The waypoints for the distance expense */
    waypoints?: WaypointCollection;

    /** The index of the item */
    item?: string;

    /** Function to call when the secondary interaction is triggered */
    onSecondaryInteraction?: () => void;

    /** Function to get the index of the item */
    getIndex?: () => number | undefined;

    /** Whether the item is active */
    isActive?: boolean;

    /** Function to call when the user clicks the item */
    onPress?: (index: number) => void;

    /** Whether the item is disabled */
    disabled?: boolean;
};

function DistanceRequestRenderItem({waypoints, item = '', onSecondaryInteraction, getIndex, isActive = false, onPress = () => {}, disabled = false}: DistanceRequestProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const numberOfWaypoints = Object.keys(waypoints ?? {}).length;
    const lastWaypointIndex = numberOfWaypoints - 1;

    const index = getIndex?.();
    let descriptionKey = 'distance.waypointDescription.';
    let waypointIcon;
    if (index === 0) {
        descriptionKey += 'start';
        waypointIcon = Expensicons.DotIndicatorUnfilled;
    } else if (index === lastWaypointIndex) {
        descriptionKey += 'stop';
        waypointIcon = Expensicons.Location;
    } else {
        descriptionKey += 'stop';
        waypointIcon = Expensicons.DotIndicator;
    }

    const waypoint = waypoints?.[`waypoint${index}`] ?? {};
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const title = waypoint.name || waypoint.address;

    return (
        <MenuItemWithTopDescription
            description={translate(descriptionKey as TranslationPaths)}
            title={title}
            icon={Expensicons.DragHandles}
            iconFill={theme.icon}
            secondaryIcon={waypointIcon}
            secondaryIconFill={theme.icon}
            shouldShowRightIcon
            onPress={() => onPress(index)}
            onSecondaryInteraction={onSecondaryInteraction}
            focused={isActive}
            key={item}
            disabled={disabled}
        />
    );
}

DistanceRequestRenderItem.displayName = 'DistanceRequestRenderItem';

export default DistanceRequestRenderItem;
