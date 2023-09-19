import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../CONST';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import DistanceRequest from '../components/DistanceRequest';
import reportPropTypes from './reportPropTypes';
import * as IOU from '../libs/actions/IOU';
import * as Transaction from '../libs/actions/Transaction';
import {init} from 'onfido-sdk-ui';

const propTypes = {
    /** The transactionID we're currently editing */
    transactionID: PropTypes.string.isRequired,

    /** The report to with which the distance request is associated */
    report: reportPropTypes.isRequired,

    /** Passed from the navigator */
    route: PropTypes.shape({
        /** Parameters the route gets */
        params: PropTypes.shape({
            /** Type of IOU */
            iouType: PropTypes.oneOf(_.values(CONST.IOU.MONEY_REQUEST_TYPE)),
            /** Id of the report on which the distance request is being created */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

function EditRequestDistancePage({transactionID, report, route}) {
    let initialWaypoints;
    useEffect(() => {
        IOU.setDistanceRequestTransactionID(transactionID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const {translate} = useLocalize();

    /**
     * When the back button is pressed, the waypoints need to be reset on the transaction back to what they
     * were when the component first mounted.
     */
    const removeUnsavedWaypointsAndGoBack = () => {
        Transaction.resetWaypoints(transactionID, initialWaypoints);
        Navigation.goBack();
    };

    /**
     * When waypoints are initially loaded from Onyx inside of DistanceRequest
     * they are sent here so they can be remembered. That way if the user presses the back button
     * after having edited the waypoints, then all of their changes can be reset on the transaction.
     * If the data is not reset when going back, it can cause problems when the user edits another field like amount
     * and the updated waypoints get sent in the request to update the distance without the user
     * ever clicking the "save" button for waypoints. It's very unexpected for the user.
     * @param {Object} waypoints
     * @returns
     */
    const saveInitialWaypoints = (waypoints) => {
        // Ignore any subsequent updates to the waypoints so that the initial waypoints are only updated once and
        // never again.
        if (initialWaypoints) {
            return;
        }
        initialWaypoints = waypoints;
    };
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.distance')}
                onBackButtonPress={removeUnsavedWaypointsAndGoBack}
            />
            <DistanceRequest
                report={report}
                route={route}
                transactionID={transactionID}
                onSubmit={(waypoints) => IOU.updateDistanceRequest(transactionID, report.reportID, {waypoints})}
                onWaypointsLoaded={saveInitialWaypoints}
                isEditingRequest
            />
        </ScreenWrapper>
    );
}

EditRequestDistancePage.propTypes = propTypes;
EditRequestDistancePage.displayName = 'EditRequestDistancePage';
export default EditRequestDistancePage;
