import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import {reimbursementAccountDefaultProps, reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultStateForField from '@pages/ReimbursementAccount/utils/getDefaultStateForField';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: reimbursementAccountDefaultProps,
};

const {FIRST_NAME, LAST_NAME} = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.INPUT_KEY;

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [FIRST_NAME, LAST_NAME]);

function LegalNameUBO({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultFirstName = getDefaultStateForField({reimbursementAccount, fieldName: FIRST_NAME, defaultValue: ''});
    const defaultLastName = getDefaultStateForField({reimbursementAccount, fieldName: LAST_NAME, defaultValue: ''});

    // const bankAccountID = getDefaultStateForField({reimbursementAccount, fieldName: 'bankAccountID', defaultValue: 0});

    // const shouldDisableCompanyName = Boolean(bankAccountID && defaultCompanyName);

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={styles.textHeadline}>{translate('beneficialOwnerInfoStep.enterLegalFirstAndLastName')}</Text>
            <TextInput
                label={translate('beneficialOwnerInfoStep.legalFirstName')}
                aria-label={translate('beneficialOwnerInfoStep.legalFirstName')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                inputID={FIRST_NAME}
                containerStyles={[styles.mt4]}
                // disabled={shouldDisableCompanyName}
                defaultValue={defaultFirstName}
                shouldSaveDraft
                // shouldUseDefaultValue={shouldDisableCompanyName}
            />
            <TextInput
                label={translate('beneficialOwnerInfoStep.legalLastName')}
                aria-label={translate('beneficialOwnerInfoStep.legalLastName')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                inputID={LAST_NAME}
                containerStyles={[styles.mt4]}
                // disabled={shouldDisableCompanyName}
                defaultValue={defaultLastName}
                shouldSaveDraft
                // shouldUseDefaultValue={shouldDisableCompanyName}
            />
        </Form>
    );
}

LegalNameUBO.propTypes = propTypes;
LegalNameUBO.defaultProps = defaultProps;
LegalNameUBO.displayName = 'LegalNameUBO';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(LegalNameUBO);
