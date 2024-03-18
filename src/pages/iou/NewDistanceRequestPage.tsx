import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import DistanceRequest from '@components/DistanceRequest';
import Navigation from '@libs/Navigation/Navigation';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import * as IOU from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {IOU as IOUType, Report} from '@src/types/onyx';

type NewDistanceRequestPageOnyxProps = {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: OnyxEntry<IOUType>;

    /** The report on which the request is initiated on */
    report: OnyxEntry<Report>;
};

type NewDistanceRequestPageProps = NewDistanceRequestPageOnyxProps & StackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DISTANCE>;

// This component is responsible for getting the transactionID from the IOU key, or creating the transaction if it doesn't exist yet, and then passing the transactionID.
// You can't use Onyx props in the withOnyx mapping, so we need to set up and access the transactionID here, and then pass it down so that DistanceRequest can subscribe to the transaction.
function NewDistanceRequestPage({iou, report, route}: NewDistanceRequestPageProps) {
    const iouType = route.params.iouType ?? 'request';
    const isEditingNewRequest = Navigation.getActiveRoute().includes('address');

    useEffect(() => {
        if (iou?.transactionID) {
            return;
        }
        IOU.setUpDistanceTransaction();
    }, [iou?.transactionID]);

    const onSubmit = useCallback(() => {
        if (isEditingNewRequest) {
            Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, report?.reportID));
            return;
        }
        IOU.navigateToNextPage(iou, iouType, report);
    }, [iou, iouType, isEditingNewRequest, report]);

    return (
        <DistanceRequest
            report={report}
            route={route}
            isEditingNewRequest={isEditingNewRequest}
            transactionID={iou?.transactionID}
            onSubmit={onSubmit}
        />
    );
}

NewDistanceRequestPage.displayName = 'NewDistanceRequestPage';

export default withOnyx<NewDistanceRequestPageProps, NewDistanceRequestPageOnyxProps>({
    iou: {key: ONYXKEYS.IOU},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
})(NewDistanceRequestPage);
