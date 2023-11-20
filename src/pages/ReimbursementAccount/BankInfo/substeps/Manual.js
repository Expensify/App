import React, {useCallback} from 'react';
import {Image, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import shouldDelayFocus from '@libs/shouldDelayFocus';
import * as ValidationUtils from '@libs/ValidationUtils';
import exampleCheckImage from '@pages/ReimbursementAccount/exampleCheckImage';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
};

const bankInfoStepKeys = CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY;

function Manual({reimbursementAccount, onNext}) {
    const {translate, preferredLocale} = useLocalize();

    const defaultValues = {
        [bankInfoStepKeys.ROUTING_NUMBER]: getDefaultValueForReimbursementAccountField(reimbursementAccount, bankInfoStepKeys.ROUTING_NUMBER),
        [bankInfoStepKeys.ACCOUNT_NUMBER]: getDefaultValueForReimbursementAccountField(reimbursementAccount, bankInfoStepKeys.ACCOUNT_NUMBER),
    };

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Object}
     */
    const validate = useCallback(
        (values) => {
            const requiredFields = [bankInfoStepKeys.ROUTING_NUMBER, bankInfoStepKeys.ACCOUNT_NUMBER];
            const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);
            const routingNumber = values.routingNumber && values.routingNumber.trim();

            if (
                values.accountNumber &&
                !CONST.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(values.accountNumber.trim()) &&
                !CONST.BANK_ACCOUNT.REGEX.MASKED_US_ACCOUNT_NUMBER.test(values.accountNumber.trim())
            ) {
                errors.accountNumber = 'bankAccount.error.accountNumber';
            } else if (values.accountNumber && values.accountNumber === routingNumber) {
                errors.accountNumber = translate('bankAccount.error.routingAndAccountNumberCannotBeSame');
            }
            if (routingNumber && (!CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(routingNumber) || !ValidationUtils.isValidRoutingNumber(routingNumber))) {
                errors.routingNumber = 'bankAccount.error.routingNumber';
            }

            return errors;
        },
        [translate],
    );

    const shouldDisableInputs = Boolean(getDefaultValueForReimbursementAccountField(reimbursementAccount, bankInfoStepKeys.BANK_ACCOUNT_ID));

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            onSubmit={onNext}
            validate={validate}
            submitButtonText={translate('common.next')}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadline, styles.mb3]}>{translate('bankAccount.manuallyAdd')}</Text>
            <Text style={[styles.mb5, styles.textLabel]}>{translate('bankAccount.checkHelpLine')}</Text>
            <Image
                resizeMode="contain"
                style={[styles.exampleCheckImage, styles.mb5]}
                source={exampleCheckImage(preferredLocale)}
            />
            <TextInput
                autoFocus
                shouldDelayFocus={shouldDelayFocus}
                inputID="routingNumber"
                label={translate('bankAccount.routingNumber')}
                aria-label={translate('bankAccount.routingNumber')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                defaultValue={defaultValues[bankInfoStepKeys.ROUTING_NUMBER]}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                disabled={shouldDisableInputs}
                shouldSaveDraft
                shouldUseDefaultValue={shouldDisableInputs}
            />
            <TextInput
                inputID="accountNumber"
                containerStyles={[styles.mt4]}
                label={translate('bankAccount.accountNumber')}
                aria-label={translate('bankAccount.accountNumber')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                defaultValue={defaultValues[bankInfoStepKeys.ACCOUNT_NUMBER]}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                disabled={shouldDisableInputs}
                shouldSaveDraft
                shouldUseDefaultValue={shouldDisableInputs}
            />
        </Form>
    );
}

Manual.propTypes = propTypes;
Manual.defaultProps = defaultProps;
Manual.displayName = 'Manual';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(Manual);
