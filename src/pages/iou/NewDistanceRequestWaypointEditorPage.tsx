import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
<<<<<<<< HEAD:src/pages/iou/NewDistanceRequestWaypointEditorPage.tsx
import type SCREENS from '@src/SCREENS';
import WaypointEditor from './WaypointEditor';
========
import IOURequestStepWaypoint from './request/step/IOURequestStepWaypoint';
>>>>>>>> f268c39c331305c49dbb80a0d0e59984289ecb25:src/pages/iou/MoneyRequestWaypointPage.js

type NewDistanceRequestWaypointEditorPageOnyxProps = {
    transactionID: string | undefined;
};
type NewDistanceRequestWaypointEditorPageProps = StackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.EDIT_WAYPOINT> & NewDistanceRequestWaypointEditorPageOnyxProps;

// This component is responsible for grabbing the transactionID from the IOU key
// You can't use Onyx props in the withOnyx mapping, so we need to set up and access the transactionID here, and then pass it down so that WaypointEditor can subscribe to the transaction.
<<<<<<<< HEAD:src/pages/iou/NewDistanceRequestWaypointEditorPage.tsx
function NewDistanceRequestWaypointEditorPage({transactionID = '', route}: NewDistanceRequestWaypointEditorPageProps) {
========
function MoneyRequestWaypointPage({transactionID, route}) {
>>>>>>>> f268c39c331305c49dbb80a0d0e59984289ecb25:src/pages/iou/MoneyRequestWaypointPage.js
    return (
        <IOURequestStepWaypoint
            // Put the transactionID into the route params so that WaypointEdit behaves the same when creating a new waypoint
            // or editing an existing waypoint.
            route={{
                params: {
                    ...route.params,
                    transactionID,
                },
            }}
        />
    );
}

<<<<<<<< HEAD:src/pages/iou/NewDistanceRequestWaypointEditorPage.tsx
NewDistanceRequestWaypointEditorPage.displayName = 'NewDistanceRequestWaypointEditorPage';

export default withOnyx<NewDistanceRequestWaypointEditorPageProps, NewDistanceRequestWaypointEditorPageOnyxProps>({
    transactionID: {key: ONYXKEYS.IOU, selector: (iou) => iou?.transactionID},
})(NewDistanceRequestWaypointEditorPage);
========
MoneyRequestWaypointPage.displayName = 'MoneyRequestWaypointPage';
MoneyRequestWaypointPage.propTypes = propTypes;
MoneyRequestWaypointPage.defaultProps = defaultProps;
export default withOnyx({
    transactionID: {key: ONYXKEYS.IOU, selector: (iou) => iou && iou.transactionID},
})(MoneyRequestWaypointPage);
>>>>>>>> f268c39c331305c49dbb80a0d0e59984289ecb25:src/pages/iou/MoneyRequestWaypointPage.js
