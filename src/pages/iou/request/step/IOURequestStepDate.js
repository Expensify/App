import React from 'react';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
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
};

const defaultProps = {
    transaction: {},
};

function IOURequestStepDate({
    route: {
        params: {iouType, backTo, transactionID},
    },
    transaction,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestCreated
     */
    const updateDate = (value) => {
        IOU.setMoneyRequestCreated_temporaryForRefactor(transactionID, value.moneyRequestCreated);
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
                    defaultValue={transaction.created}
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

export default compose(withWritableReportOrNotFound, withFullTransactionOrNotFound)(IOURequestStepDate);
