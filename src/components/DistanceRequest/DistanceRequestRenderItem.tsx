import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import {useMenuItemSecondaryInteraction} from '@components/MenuItem/MenuItemSecondaryInteractionContext';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import {useSession} from '@components/OnyxListItemProvider';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isWaypointNullIsland} from '@libs/TransactionUtils';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';
import {View} from 'react-native';

type DistanceRequestDragHandleProps = {
    onDrag?: () => void;
    sentryLabel: SentryLabel;
};

function DistanceRequestDragHandle({onDrag, sentryLabel}: DistanceRequestDragHandleProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DragHandles']);
    const theme = useTheme();
    const styles = useThemeStyles();
    useMenuItemSecondaryInteraction(onDrag, sentryLabel);

    return (
        <View style={styles.popoverMenuIcon}>
            <Icon
                src={icons.DragHandles}
                fill={theme.icon}
            />
        </View>
    );
}

type DistanceRequestProps = {
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

function DistanceRequestRenderItem({waypoints, item = '', onSecondaryInteraction, getIndex, isActive = false, onPress = () => {}, disabled = false}: DistanceRequestProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const session = useSession();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Location', 'DotIndicatorUnfilled', 'DotIndicator']);
    const {translate} = useLocalize();
    const numberOfWaypoints = Object.keys(waypoints ?? {}).length;
    const lastWaypointIndex = numberOfWaypoints - 1;

    const index = getIndex?.() ?? -1;
    let descriptionKey: 'distance.waypointDescription.start' | 'distance.waypointDescription.stop';
    let waypointIcon;
    let sentryLabel: SentryLabel = CONST.SENTRY_LABEL.IOU_REQUEST_STEP.WAYPOINT_STOP_MENU_ITEM;
    if (index === 0) {
        descriptionKey = 'distance.waypointDescription.start';
        sentryLabel = CONST.SENTRY_LABEL.IOU_REQUEST_STEP.WAYPOINT_START_MENU_ITEM;
        waypointIcon = expensifyIcons.DotIndicatorUnfilled;
    } else if (index === lastWaypointIndex) {
        descriptionKey = 'distance.waypointDescription.stop';
        waypointIcon = expensifyIcons.Location;
    } else {
        descriptionKey = 'distance.waypointDescription.stop';
        waypointIcon = expensifyIcons.DotIndicator;
    }

    const waypoint = waypoints?.[`waypoint${index}`] ?? {};
    const title = waypoint.name || waypoint.address;
    const errorText = isWaypointNullIsland(waypoint) ? translate('violations.noRoute') : undefined;

    return (
        <MenuItem.Root
            onPress={callIfAuthenticated(() => onPress(index), session)}
            isFocused={isActive}
            key={item}
            isDisabled={disabled}
            sentryLabel={sentryLabel}
        >
            <View style={[styles.flexRow, StyleUtils.getMenuItemTextContainerStyle(false), disabled && styles.cursorDisabled]}>
                <MenuItem.Leading>
                    <View style={[styles.flexRow, styles.mr3]}>
                        <DistanceRequestDragHandle
                            onDrag={disabled ? undefined : onSecondaryInteraction}
                            sentryLabel={sentryLabel}
                        />
                        <View style={styles.popoverMenuIcon}>
                            <Icon
                                src={waypointIcon}
                                fill={theme.icon}
                            />
                        </View>
                    </View>
                </MenuItem.Leading>
                <MenuItemField.Content name={translate(descriptionKey)}>{!!title && <MenuItem.FieldValue>{title}</MenuItem.FieldValue>}</MenuItemField.Content>
                <MenuItem.Trailing>
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    <MenuItem.Chevron />
                </MenuItem.Trailing>
            </View>
            {!!errorText && (
                <MenuItem.HelpText
                    isError
                    message={errorText}
                />
            )}
        </MenuItem.Root>
    );
}

export default DistanceRequestRenderItem;
