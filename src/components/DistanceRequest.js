import React, {useEffect, useState} from 'react';
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
import variables from '../styles/variables';
import LinearGradient from './LinearGradient';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

const MAX_WAYPOINTS = 25;
const MAX_WAYPOINTS_TO_DISPLAY = 4;

const propTypes = {
    /** The transactionID of this request */
    transactionID: PropTypes.string,

    /** The optimistic transaction for this request */
    transaction: PropTypes.shape({
        /** The transactionID of this request */
        transactionID: PropTypes.string,

        /** The comment object on the transaction */
        comment: PropTypes.shape({
            /** The waypoints defining the distance request */
            waypoints: PropTypes.shape({
                /** The latitude of the waypoint */
                lat: PropTypes.number,

                /** The longitude of the waypoint */
                lng: PropTypes.number,

                /** The address of the waypoint */
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
    const [scrollContainerHeight, setScrollContainerHeight] = useState(0);
    const [scrollContentHeight, setScrollContentHeight] = useState(0);

    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
    const numberOfWaypoints = _.size(waypoints);
    const lastWaypointIndex = numberOfWaypoints - 1;

    // Show up to the max number of waypoints plus 1/2 of one to hint at scrolling
    const halfMenuItemHeight = Math.floor(variables.baseMenuItemHeight / 2);
    const scrollContainerMaxHeight = variables.baseMenuItemHeight * MAX_WAYPOINTS_TO_DISPLAY + halfMenuItemHeight;

    useEffect(() => {
        if (!transactionID || !_.isEmpty(waypoints)) {
            return;
        }
        // Create the initial start and stop waypoints
        Transaction.createInitialWaypoints(transactionID);
    }, [transactionID, waypoints]);

    const updateGradientVisibility = (event = {}) => {
        // If a waypoint extends past the bottom of the visible area show the gradient, else hide it.
        const visibleAreaEnd = lodashGet(event, 'nativeEvent.contentOffset.y', 0) + scrollContainerHeight;
        setShouldShowGradient(visibleAreaEnd < scrollContentHeight);
    };

    useEffect(updateGradientVisibility, [scrollContainerHeight, scrollContentHeight]);

    return (
        <>
            <View
                style={{maxHeight: scrollContainerMaxHeight}}
                onLayout={(event = {}) => setScrollContainerHeight(lodashGet(event, 'nativeEvent.layout.height', 0))}
            >
                <ScrollView
                    onContentSizeChange={(width, height) => setScrollContentHeight(height)}
                    onScroll={updateGradientVisibility}
                    scrollEventThrottle={16}
                >
                    {_.map(waypoints, (waypoint, key) => {
                        // key is of the form waypoint0, waypoint1, ...
                        const index = Number(key.replace('waypoint', ''));
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

                        return (
                            <MenuItemWithTopDescription
                                description={translate(descriptionKey)}
                                title={lodashGet(waypoints, [`waypoint${index}`, 'address'], '')}
                                icon={Expensicons.DragHandles}
                                iconFill={theme.icon}
                                secondaryIcon={waypointIcon}
                                secondaryIconFill={theme.icon}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.getMoneyRequestWaypointRoute('request', index))}
                                key={key}
                            />
                        );
                    })}
                </ScrollView>
                {shouldShowGradient && (
                    <LinearGradient
                        style={[styles.pAbsolute, styles.b0, styles.l0, styles.r0, {height: halfMenuItemHeight}]}
                        colors={[theme.transparent, theme.modalBackground]}
                    />
                )}
            </View>
            <View style={[styles.flexRow, styles.justifyContentCenter, styles.pt1]}>
                <Button
                    small
                    icon={Expensicons.Plus}
                    onPress={() => Transaction.addStop(transactionID)}
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
            selector: (transaction) => (transaction ? {transactionID: transaction.transactionID, comment: {waypoints: lodashGet(transaction, 'comment.waypoints')}} : null),
        },
    }),
)(DistanceRequest);
