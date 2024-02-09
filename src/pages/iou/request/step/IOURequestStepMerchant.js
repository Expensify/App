import React, {useCallback} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import transactionPropTypes from '@components/transactionPropTypes';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/MoneyRequestMerchantForm';
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

function IOURequestStepMerchant({
    route: {
        params: {transactionID, backTo},
    },
    transaction: {merchant, participants},
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const isEmptyMerchant = merchant === '' || merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;

    const isMerchantRequired = _.some(participants, (participant) => Boolean(participant.isPolicyExpenseChat));

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestMerchant
     */
    const validate = useCallback(
        (value) => {
            const errors = {};

            if (isMerchantRequired && _.isEmpty(value.moneyRequestMerchant)) {
                errors.moneyRequestMerchant = 'common.error.fieldRequired';
            }

            return errors;
        },
        [isMerchantRequired],
    );

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestMerchant
     */
    const updateMerchant = (value) => {
        IOU.setMoneyRequestMerchant_temporaryForRefactor(transactionID, value.moneyRequestMerchant);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.merchant')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepMerchant.displayName}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM}
                onSubmit={updateMerchant}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.MONEY_REQUEST_MERCHANT}
                        name={INPUT_IDS.MONEY_REQUEST_MERCHANT}
                        defaultValue={isEmptyMerchant ? '' : merchant}
                        maxLength={CONST.MERCHANT_NAME_MAX_LENGTH}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={inputCallbackRef}
                    />
                </View>
            </FormProvider>
        </StepScreenWrapper>
    );
}

IOURequestStepMerchant.propTypes = propTypes;
IOURequestStepMerchant.defaultProps = defaultProps;
IOURequestStepMerchant.displayName = 'IOURequestStepMerchant';

export default compose(withWritableReportOrNotFound, withFullTransactionOrNotFound)(IOURequestStepMerchant);
