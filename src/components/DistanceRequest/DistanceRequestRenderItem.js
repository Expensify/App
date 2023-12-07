import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@styles/themes/useTheme';

const propTypes = {
    /** The waypoints for the distance request */
    waypoints: PropTypes.objectOf(
        PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
            address: PropTypes.string,
            name: PropTypes.string,
        }),
    ),

    /** The index of the item */
    item: PropTypes.string,

    /** Function to call when the secondary interaction is triggered */
    onSecondaryInteraction: PropTypes.func,

    /** Function to get the index of the item */
    getIndex: PropTypes.func,

    /** Whether the item is active */
    isActive: PropTypes.bool,

    /** Function to call when the user clicks the item */
    onPress: PropTypes.func,

    /** Whether the item is disabled */
    disabled: PropTypes.bool,
};

const defaultProps = {
    waypoints: {},
    item: '',
    onSecondaryInteraction: () => {},
    getIndex: () => {},
    isActive: false,
    onPress: () => {},
    disabled: false,
};

function DistanceRequestRenderItem({waypoints, item, onSecondaryInteraction, getIndex, isActive, onPress, disabled}) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const numberOfWaypoints = _.size(waypoints);
    const lastWaypointIndex = numberOfWaypoints - 1;

    const index = getIndex();
    let descriptionKey = 'distance.waypointDescription.';
    let waypointIcon;
    if (index === 0) {
        descriptionKey += 'start';
        waypointIcon = Expensicons.DotIndicatorUnfilled;
    } else if (index === lastWaypointIndex) {
        descriptionKey += 'finish';
        waypointIcon = Expensicons.Location;
    } else {
        descriptionKey += 'stop';
        waypointIcon = Expensicons.DotIndicator;
    }

    const waypoint = lodashGet(waypoints, [`waypoint${index}`], {});
    const title = waypoint.name || waypoint.address;

    return (
        <MenuItemWithTopDescription
            description={translate(descriptionKey)}
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
DistanceRequestRenderItem.propTypes = propTypes;
DistanceRequestRenderItem.defaultProps = defaultProps;

export default DistanceRequestRenderItem;
