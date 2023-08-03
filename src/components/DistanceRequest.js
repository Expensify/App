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
    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
    const lastWaypointIndex = _.size(waypoints) - 1;

    useEffect(() => {
        if (!transaction.transactionID || !_.isEmpty(waypoints)) {
            return;
        }
        // Create the initial start and stop waypoints
        Transaction.createInitialWaypoints(transaction.transactionID);
    }, [transaction.transactionID, waypoints]);

    const firstMenuItem = useRef(null);
    const [menuItemHeight, setMenuItemHeight] = useState(0);
    const measureMenuItemHeight = () => {
        if (!firstMenuItem.current) {
            return;
        }
        firstMenuItem.current.measure((x, y, width, height) => {
            setMenuItemHeight(height);
        });
    };

    // Show 4 waypoints plus 1/2 of one
    const halfMenuItemHeight = Math.floor(menuItemHeight / 2);
    const scrollContainerHeight = menuItemHeight * 4 + halfMenuItemHeight;
    return (
        <>
            <View style={{height: scrollContainerHeight}}>
                <ScrollView>
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
                <LinearGradient
                    style={[styles.pAbsolute, styles.b0, styles.l0, styles.r0, {height: halfMenuItemHeight}]}
                    colors={[theme.transparent, theme.shadow]}
                />
            </View>
            <View style={[styles.flexRow, styles.justifyContentCenter, styles.pt1]}>
                <Button
                    small
                    icon={Expensicons.Plus}
                    onPress={() => Transaction.addStop(transactionID, lastWaypointIndex + 1)}
                    text={translate('distance.addStop')}
                    isDisabled={_.size(waypoints) === MAX_WAYPOINTS}
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
