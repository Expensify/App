import {RouteProp} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import WaypointEditor from './WaypointEditor';

type NewDistanceRequestWaypointEditorPageOnyxProps = {
    transactionID: string | undefined;
};
type NewDistanceRequestWaypointEditorPageProps = StackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.EDIT_WAYPOINT> & NewDistanceRequestWaypointEditorPageOnyxProps;

// This component is responsible for grabbing the transactionID from the IOU key
// You can't use Onyx props in the withOnyx mapping, so we need to set up and access the transactionID here, and then pass it down so that WaypointEditor can subscribe to the transaction.
function NewDistanceRequestWaypointEditorPage({transactionID = '', route}: NewDistanceRequestWaypointEditorPageProps) {
    return (
        <WaypointEditor
            // Put the transactionID into the route params so that WaypointEdit behaves the same when creating a new waypoint
            // or editing an existing waypoint.
            route={
                {
                    params: {
                        ...route.params,
                        transactionID,
                    },
                } as RouteProp<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.EDIT_WAYPOINT>
            }
        />
    );
}

NewDistanceRequestWaypointEditorPage.displayName = 'NewDistanceRequestWaypointEditorPage';

export default withOnyx<NewDistanceRequestWaypointEditorPageProps, NewDistanceRequestWaypointEditorPageOnyxProps>({
    transactionID: {key: ONYXKEYS.IOU, selector: (iou) => iou?.transactionID},
})(NewDistanceRequestWaypointEditorPage);
