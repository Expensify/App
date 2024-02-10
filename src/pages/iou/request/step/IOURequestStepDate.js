import lodashGet from 'lodash/get';
import lodashIsEmpty from 'lodash/isEmpty';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: transactionPropTypes,

    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
    splitDraftTransaction: {},
};

function IOURequestStepDate({
    route: {
        params: {action, iouType, reportID, backTo},
    },
    transaction,
    splitDraftTransaction,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && action === CONST.IOU.ACTION.EDIT;
    const currentCreated = isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? TransactionUtils.getCreated(splitDraftTransaction) : TransactionUtils.getCreated(transaction);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestCreated
     */
    const updateDate = (value) => {
        const newCreated = value.moneyRequestCreated;

        // Only update created if it has changed
        if (newCreated === currentCreated) {
            navigateBack();
            return;
        }

        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplitBill) {
            IOU.setDraftSplitTransaction(transaction.transactionID, {created: newCreated});
            navigateBack();
            return;
        }

        IOU.setMoneyRequestCreated(transaction.transactionID, newCreated, action === CONST.IOU.ACTION.CREATE);

        if (action === CONST.IOU.ACTION.EDIT) {
            IOU.updateMoneyRequestDate(transaction.transactionID, reportID, newCreated);
        }

        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.date')}
            onBackButtonPress={navigateBack}
            shouldShowNotFound={!IOUUtils.isValidMoneyRequestType(iouType)}
            shouldShowWrapper
            testID={IOURequestStepDate.displayName}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM}
                onSubmit={updateDate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID="moneyRequestCreated"
                    label={translate('common.date')}
                    defaultValue={currentCreated}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                />
            </FormProvider>
        </StepScreenWrapper>
    );
}

IOURequestStepDate.propTypes = propTypes;
IOURequestStepDate.defaultProps = defaultProps;
IOURequestStepDate.displayName = 'IOURequestStepDate';

export default compose(
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        splitDraftTransaction: {
            key: ({route}) => {
                const transactionID = lodashGet(route, 'params.transactionID', 0);
                return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
            },
        },
    }),
)(IOURequestStepDate);
