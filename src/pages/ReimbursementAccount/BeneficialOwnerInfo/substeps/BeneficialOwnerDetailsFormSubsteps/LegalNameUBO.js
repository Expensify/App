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
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** ID of the beneficial owner that is being modified */
    beneficialOwnerBeingModifiedID: PropTypes.string.isRequired,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccountDraft: {},
};

const {FIRST_NAME, LAST_NAME} = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

function LegalNameUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}) {
    const {translate} = useLocalize();

    const firstNameInputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${FIRST_NAME}`;
    const lastNameInputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${LAST_NAME}`;

    const defaultFirstName = lodashGet(reimbursementAccountDraft, firstNameInputID, '');
    const defaultLastName = lodashGet(reimbursementAccountDraft, lastNameInputID, '');

    const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [firstNameInputID, lastNameInputID]);

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
                inputID={firstNameInputID}
                containerStyles={[styles.mt4]}
                defaultValue={defaultFirstName}
                shouldSaveDraft
            />
            <TextInput
                label={translate('beneficialOwnerInfoStep.legalLastName')}
                aria-label={translate('beneficialOwnerInfoStep.legalLastName')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                inputID={lastNameInputID}
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
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(LegalNameUBO);
