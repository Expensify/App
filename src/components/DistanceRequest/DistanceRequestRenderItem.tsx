import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import {isWaypointNullIsland} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
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
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Location', 'DotIndicatorUnfilled', 'DotIndicator', 'DragHandles']);
    const {translate} = useLocalize();
    const numberOfWaypoints = Object.keys(waypoints ?? {}).length;
    const lastWaypointIndex = numberOfWaypoints - 1;

    const index = getIndex?.() ?? -1;
    let descriptionKey = 'distance.waypointDescription.';
    let waypointIcon;
    if (index === 0) {
        descriptionKey += 'start';
        waypointIcon = expensifyIcons.DotIndicatorUnfilled;
    } else if (index === lastWaypointIndex) {
        descriptionKey += 'stop';
        waypointIcon = expensifyIcons.Location;
    } else {
        descriptionKey += 'stop';
        waypointIcon = expensifyIcons.DotIndicator;
    }

    const waypoint = waypoints?.[`waypoint${index}`] ?? {};
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const title = waypoint.name || waypoint.address;
    const errorText = isWaypointNullIsland(waypoint) ? translate('violations.noRoute') : undefined;

    return (
        <MenuItemWithTopDescription
            description={translate(descriptionKey as TranslationPaths)}
            title={title}
            icon={expensifyIcons.DragHandles}
            iconFill={theme.icon}
            secondaryIcon={waypointIcon}
            secondaryIconFill={theme.icon}
            shouldShowRightIcon
            onPress={() => onPress(index)}
            onSecondaryInteraction={onSecondaryInteraction}
            focused={isActive}
            key={item}
            disabled={disabled}
            errorText={errorText}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
        />
    );
}

export default DistanceRequestRenderItem;
