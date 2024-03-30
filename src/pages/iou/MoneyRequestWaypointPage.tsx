import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import IOURequestStepWaypoint from './request/step/IOURequestStepWaypoint';

type MoneyRequestWaypointPageOnyxProps = {
    transactionID: string | undefined;
};
type MoneyRequestWaypointPageProps = StackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_WAYPOINT> & MoneyRequestWaypointPageOnyxProps;

// This component is responsible for grabbing the transactionID from the IOU key
// You can't use Onyx props in the withOnyx mapping, so we need to set up and access the transactionID here, and then pass it down so that WaypointEditor can subscribe to the transaction.
function MoneyRequestWaypointPage({transactionID = '', route}: MoneyRequestWaypointPageProps) {
    return (
        // @ts-expect-error TODO: Remove this once withFullTransactionOrNotFound(https://github.com/Expensify/App/issues/36123) is migrated to TypeScript.
        <IOURequestStepWaypoint
            // Put the transactionID into the route params so that WaypointEdit behaves the same when creating a new waypoint
            // or editing an existing waypoint.
            route={{
                ...route,
                params: {
                    ...route.params,
                    transactionID,
                },
            }}
        />
    );
}

MoneyRequestWaypointPage.displayName = 'MoneyRequestWaypointPage';

export default withOnyx<MoneyRequestWaypointPageProps, MoneyRequestWaypointPageOnyxProps>({
    transactionID: {key: ONYXKEYS.IOU, selector: (iou) => iou?.transactionID},
})(MoneyRequestWaypointPage);
