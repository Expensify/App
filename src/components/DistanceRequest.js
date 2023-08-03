import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import * as Transaction from '../libs/actions/Transaction';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import * as Expensicons from './Icon/Expensicons';
import theme from '../styles/themes/default';
import Button from './Button';
import styles from '../styles/styles';
import LinearGradient from './LinearGradient';

const MAX_WAYPOINTS = 25;
const MAX_WAYPOINTS_TO_DISPLAY = 4;
const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,

    /** The optimistic transaction for this request */
    transaction: PropTypes.shape({
        transactionID: PropTypes.string,
        comment: PropTypes.shape({
            waypoints: PropTypes.shape({
                lat: PropTypes.number,
                lng: PropTypes.number,
                address: PropTypes.string,
            }),
        }),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    transactionID: '',
    transaction: {},
};

function DistanceRequest({transactionID, transaction, translate}) {
    const [shouldShowGradient, setShouldShowGradient] = useState(false);
    const [menuItemHeight, setMenuItemHeight] = useState(0);
    const firstMenuItem = useRef(null);

    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
    const numberOfWaypoints = _.size(waypoints);
    const lastWaypointIndex = numberOfWaypoints - 1;

    useEffect(() => {
        if (!transaction.transactionID || !_.isEmpty(waypoints)) {
            return;
        }
        // Create the initial start and stop waypoints
        Transaction.createInitialWaypoints(transaction.transactionID);
    }, [transaction.transactionID, waypoints]);

    // Measure the first waypoint to calculate how high the scroll view should be
    const measureMenuItemHeight = () => {
        if (!firstMenuItem.current) {
            return;
        }
        firstMenuItem.current.measure((x, y, width, height) => {
            setMenuItemHeight(height);
        });
    };

    // The scroll container should be as small as possible and grow as waypoints are added
    let scrollContainerHeight = menuItemHeight * numberOfWaypoints;
    const halfMenuItemHeight = Math.floor(menuItemHeight / 2);

    // When there are more than we want to display, show the proper number of waypoints plus 1/2 of one to hint at scrolling
    if (numberOfWaypoints > MAX_WAYPOINTS_TO_DISPLAY) {
        scrollContainerHeight = menuItemHeight * MAX_WAYPOINTS_TO_DISPLAY + halfMenuItemHeight;
    }

    const updateGradientVisibility = (event = {}) => {
        // If a waypoint extends past the bottom of the scroll container then show the gradient, else hide it.
        const waypointEnd = numberOfWaypoints * menuItemHeight;
        const visibleAreaEnd = lodashGet(event, 'nativeEvent.contentOffset.y', 0) + scrollContainerHeight;
        setShouldShowGradient(waypointEnd > visibleAreaEnd);
    };

    useEffect(updateGradientVisibility, [waypoints, numberOfWaypoints, menuItemHeight, scrollContainerHeight]);

    return (
        <>
            <View style={{height: scrollContainerHeight}}>
                <ScrollView
                    onScroll={updateGradientVisibility}
                    scrollEventThrottle={16}
                >
                    {_.map(waypoints, (waypoint, key) => {
                        // key is of the form waypoint0, waypoint1, ...
                        const index = Number(key.replace('waypoint', ''));
                        let descriptionKey = 'distance.waypointDescription.';
                        if (index === 0) {
                            descriptionKey += 'start';
                        } else if (index === lastWaypointIndex) {
                            descriptionKey += 'finish';
                        } else {
                            descriptionKey += 'stop';
                        }

                        return (
                            <View
                                onLayout={index === 0 ? measureMenuItemHeight : null}
                                ref={index === 0 ? firstMenuItem : null}
                                key={key}
                            >
                                <MenuItemWithTopDescription
                                    description={translate(descriptionKey)}
                                    icon={Expensicons.Menu}
                                    secondaryIcon={Expensicons.DotIndicator}
                                    secondaryIconFill={theme.icon}
                                    shouldShowRightIcon
                                />
                            </View>
                        );
                    })}
                </ScrollView>
                {shouldShowGradient && (
                    <LinearGradient
                        style={[styles.pAbsolute, styles.b0, styles.l0, styles.r0, {height: halfMenuItemHeight}]}
                        colors={[theme.transparent, theme.shadow]}
                    />
                )}
            </View>
            <View style={[styles.flexRow, styles.justifyContentCenter, styles.pt1]}>
                <Button
                    small
                    icon={Expensicons.Plus}
                    onPress={() => Transaction.addStop(transactionID, lastWaypointIndex + 1)}
                    text={translate('distance.addStop')}
                    isDisabled={numberOfWaypoints === MAX_WAYPOINTS}
                    innerStyles={[styles.ph10]}
                />
            </View>
        </>
    );
}

DistanceRequest.displayName = 'DistanceRequest';
DistanceRequest.propTypes = propTypes;
DistanceRequest.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        transaction: {
            key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION}${props.transactionID}`,
            selector: (transaction) => ({transactionID: transaction.transactionID, comment: {waypoints: lodashGet(transaction, 'comment.waypoints')}}),
        },
    }),
)(DistanceRequest);
