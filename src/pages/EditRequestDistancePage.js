import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import DistanceRequest from '../components/DistanceRequest';
import reportPropTypes from './reportPropTypes';
import * as IOU from '../libs/actions/IOU';

const propTypes = {
    /** The transactionID we're currently editing */
    transactionID: PropTypes.string.isRequired,

    /** The report to with which the distance request is associated */
    report: reportPropTypes.isRequired,
};

function EditRequestDistancePage({transactionID, report}) {
    useEffect(() => {
        IOU.setDistanceRequestTransactionID(transactionID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const {translate} = useLocalize();
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.distance')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <DistanceRequest
                report={report}
                transactionID={transactionID}
                onSubmit={(waypoints) => IOU.updateDistanceRequest(transactionID, report.reportID, {waypoints})}
                isEditingRequest
            />
        </ScreenWrapper>
    );
}

EditRequestDistancePage.propTypes = propTypes;
EditRequestDistancePage.displayName = 'EditRequestDistancePage';
export default EditRequestDistancePage;
