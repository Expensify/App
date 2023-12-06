import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountDefaultProps, reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** Array of beneficial owners */
    beneficialOwners: PropTypes.any,

    /** ID of the beneficial owner that is being modified */
    beneficialOwnerBeingModifiedID: PropTypes.string.isRequired,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: reimbursementAccountDefaultProps,
};

const {FIRST_NAME, LAST_NAME} = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

function LegalNameUBO({reimbursementAccount, reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID, beneficialOwners}) {
    const {translate} = useLocalize();

    const FIRST_NAME_INPUT_ID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${FIRST_NAME}`;
    const LAST_NAME_INPUT_ID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${LAST_NAME}`;

    const defaultFirstName = lodashGet(reimbursementAccountDraft, FIRST_NAME_INPUT_ID, '');
    const defaultLastName = lodashGet(reimbursementAccountDraft, LAST_NAME_INPUT_ID, '');

    const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [FIRST_NAME_INPUT_ID, LAST_NAME_INPUT_ID]);

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
                inputID={FIRST_NAME_INPUT_ID}
                containerStyles={[styles.mt4]}
                defaultValue={defaultFirstName}
                shouldSaveDraft
            />
            <TextInput
                label={translate('beneficialOwnerInfoStep.legalLastName')}
                aria-label={translate('beneficialOwnerInfoStep.legalLastName')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                inputID={LAST_NAME_INPUT_ID}
                containerStyles={[styles.mt4]}
                defaultValue={defaultLastName}
                shouldSaveDraft
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
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(LegalNameUBO);
