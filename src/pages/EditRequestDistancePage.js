import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import DistanceRequest from '../components/DistanceRequest';
import reportPropTypes from './reportPropTypes';
import * as IOU from '../libs/actions/IOU';
import * as TransactionUtils from '../libs/TransactionUtils';
import * as ReportUtils from '../libs/ReportUtils';
import usePrevious from '../hooks/usePrevious';

const propTypes = {
    /** The transactionID we're currently editing */
    transactionID: PropTypes.string.isRequired,

    /** The report to with which the distance request is associated */
    report: reportPropTypes.isRequired,
};

function EditRequestDistancePage({transactionID, report}) {
    useEffect(() => {
        IOU.setDistanceRequestTransactionID(transactionID);
    }, []);

    const transaction = TransactionUtils.getTransaction(transactionID);

    const isTransactionLoading = transaction.isLoading;
    const previousIsTransactionLoading = usePrevious(isTransactionLoading);
    const {amount} = ReportUtils.getTransactionDetails(transaction);
    const previousAmount = usePrevious(amount);
    useEffect(() => {
        // If the transaction went from loading => not loading and the amount changed, 
        // we finished successfully updating the transaction and can close out the modal.
        if (previousIsTransactionLoading && !isTransactionLoading && amount !== previousAmount) {
            Navigation.dismissModal();
        }
    }, [isTransactionLoading, amount]);

    
    


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
                isEditingRequest
                onSubmit={(waypoints) => IOU.updateDistanceRequest(transactionID, report.reportID, {waypoints})}
            />
        </ScreenWrapper>
    );
}

EditRequestDistancePage.propTypes = propTypes;
EditRequestDistancePage.displayName = 'EditRequestDistancePage';
export default EditRequestDistancePage;
