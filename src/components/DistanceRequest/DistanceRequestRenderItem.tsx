import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isWaypointNullIsland} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import React from 'react';

type DistanceRequestProps = WithSentryLabel & {
    /** The waypoints for the distance expense */
    waypoints?: WaypointCollection;

    /** The index of the item */
    item?: string;

    onSecondaryInteraction?: () => void;
    getIndex?: () => number | undefined;
    isActive?: boolean;
    onPress?: (index: number) => void;
    disabled?: boolean;
};

function DistanceRequestRenderItem({waypoints, item = '', onSecondaryInteraction, getIndex, isActive = false, onPress = () => {}, disabled = false, sentryLabel}: DistanceRequestProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
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
            // MenuItem merges wrapperStyle into the pressable's own style, after the cursor the pressable sets for itself,
            // so this wins while the row is being dragged.
            wrapperStyle={isActive && styles.cursorGrabbing}
            key={item}
            disabled={disabled}
            errorText={errorText}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            sentryLabel={sentryLabel}
        />
    );
}

export default DistanceRequestRenderItem;
