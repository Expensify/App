import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import DistanceRequest from '../components/DistanceRequest';
import reportPropTypes from './reportPropTypes';
import * as IOU from '../libs/actions/IOU';
import transactionPropTypes from '../components/transactionPropTypes';
import * as TransactionEdit from '../libs/actions/TransactionEdit';

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

    /* Onyx props */
    /** The original transaction that is being edited */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function EditRequestDistancePage({report, route, transaction}) {
    const {translate} = useLocalize();
    const transactionWasSaved = useRef(false);
    const transactionErrorFields = transaction.errorFields;

    useEffect(() => {
        // When the component is mounted, make a backup copy of the original transaction that is stored in onyx
        TransactionEdit.createBackupTransaction(transaction);

        return () => {
            // When the component is unmounted
            // Then remove the backup transaction because it is no longer needed
            if (transactionWasSaved.current) {
                TransactionEdit.removeBackupOrRestoreOriginalIfErrors(transaction.transactionID);
                return;
            }

            // If the transaction wasn't saved, then the original transaction
            // needs to be restored or else errors and edited fields will remain in the UI
            TransactionEdit.restoreOriginalTransactionFromBackup(transaction.transactionID);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Save the changes to the original transaction object
     * @param {Object} waypoints
     */
    const saveTransaction = (waypoints) => {
        transactionWasSaved.current = true;
        IOU.updateDistanceRequest(transaction.transactionID, report.reportID, {waypoints}, transaction.transactionID);
    };

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
                route={route}
                // Pass the ID of the cloned transaction so that the original transaction is not being changed
                transactionID={transaction.transactionID}
                onSubmit={saveTransaction}
                isEditingRequest
            />
        </ScreenWrapper>
    );
}

EditRequestDistancePage.propTypes = propTypes;
EditRequestDistancePage.defaultProps = defaultProps;
EditRequestDistancePage.displayName = 'EditRequestDistancePage';
export default withOnyx({
    transaction: {
        key: (props) => `${ONYXKEYS.COLLECTION.TRANSACTION}${props.transactionID}`,
    },
})(EditRequestDistancePage);
