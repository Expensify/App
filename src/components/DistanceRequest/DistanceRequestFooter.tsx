import React, {} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

const MAX_WAYPOINTS = 25;

type DistanceRequestFooterProps = {
    /** The waypoints for the distance expense */
    waypoints?: WaypointCollection;

    /** Function to call when the user wants to add a new waypoint */
    navigateToWaypointEditPage: (index: number) => void;

    /** The transaction being interacted with */
    transaction: OnyxEntry<Transaction>;

};

function DistanceRequestFooter({waypoints, transaction, navigateToWaypointEditPage}: DistanceRequestFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const numberOfWaypoints = Object.keys(waypoints ?? {}).length;
    const numberOfFilledWaypoints = Object.values(waypoints ?? {}).filter((waypoint) => waypoint?.address).length;


    return (
            numberOfFilledWaypoints >= 2 ? (
                <View style={[styles.flexRow, styles.justifyContentCenter, styles.pt1]}>
                    <Button
                        small
                        icon={Expensicons.Plus}
                        onPress={() => navigateToWaypointEditPage(Object.keys(transaction?.comment?.waypoints ?? {}).length)}
                        text={translate('distance.addStop')}
                        isDisabled={numberOfWaypoints === MAX_WAYPOINTS}
                        innerStyles={[styles.pl10, styles.pr10]}
                    />
                </View>
            ) : null);
}

DistanceRequestFooter.displayName = 'DistanceRequestFooter';

export default DistanceRequestFooter;
