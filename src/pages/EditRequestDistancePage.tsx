import lodashGet from 'lodash/get';
import React, {useEffect, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import DistanceRequest from '@components/DistanceRequest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import Navigation from '@libs/Navigation/Navigation';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Report, Transaction} from '@src/types/onyx';

type RouteParams = {
    iouType?: (typeof CONST.IOU.TYPE)[keyof typeof CONST.IOU.TYPE];
    reportID?: string;
};

type Route = {
    params: RouteParams;
};

type EditRequestDistancePageProps = {
    transactionID?: string;
    report?: Report;
    route?: Route;
    transaction?: Transaction;
    transactionBackup?: Transaction;
};

function EditRequestDistancePage({report, route, transaction, transactionBackup}: EditRequestDistancePageProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const hasWaypointError = useRef(false);
    const prevIsLoading = usePrevious(transaction?.isLoading);

    useEffect(() => {
        hasWaypointError.current = Boolean(lodashGet(transaction, 'errorFields.route') ?? lodashGet(transaction, 'errorFields.waypoints'));

        // When the loading goes from true to false, then we know the transaction has just been
        // saved to the server. Check for errors. If there are no errors, then the modal can be closed.
        if (prevIsLoading && !transaction?.isLoading && !hasWaypointError.current) {
            Navigation.dismissModal(report?.reportID);
        }
    }, [transaction, prevIsLoading, report]);

    /**
     * Save the changes to the original transaction object
     * @param {Object} waypoints
     */
    const saveTransaction = (waypoints) => {
        // If nothing was changed, simply go to transaction thread
        // We compare only addresses because numbers are rounded while backup
        const oldWaypoints = lodashGet(transactionBackup, 'comment.waypoints', {});
        const oldAddresses = _.mapObject(oldWaypoints, (waypoint) => _.pick(waypoint, 'address'));
        const addresses = _.mapObject(waypoints, (waypoint) => _.pick(waypoint, 'address'));
        if (_.isEqual(oldAddresses, addresses)) {
            Navigation.dismissModal(report?.reportID);
            return;
        }

        if (transaction && report) {
            IOU.editMoneyRequest(transaction, report.reportID, {waypoints});
        }

        // If the client is offline, then the modal can be closed as well (because there are no errors or other feedback to show them
        // until they come online again and sync with the server).
        if (isOffline) {
            Navigation.dismissModal(report?.reportID);
        }
    };

    return (
        // @ts-expect-error TODO: Remove once ScreenWrapper () is migrated
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestDistancePage.displayName}
        >
            <HeaderWithBackButton title={translate('common.distance')}>
                <DistanceRequest
                    // @ts-expect-error TODO: Remove once DistanceRequest () is migrated
                    report={report}
                    route={route}
                    transactionID={transaction?.transactionID}
                    onSubmit={saveTransaction}
                    isEditingRequest
                />
            </HeaderWithBackButton>
        </ScreenWrapper>
    );
}

EditRequestDistancePage.displayName = 'EditRequestDistancePage';
export default withOnyx({
    transaction: {
        key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION}${props.transactionID}`,
    },
    transactionBackup: {
        key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${props.transactionID}`,
    },
})(EditRequestDistancePage);
