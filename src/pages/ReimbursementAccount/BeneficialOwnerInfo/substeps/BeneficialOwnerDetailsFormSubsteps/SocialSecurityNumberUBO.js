import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** ID of the beneficial owner that is being modified */
    beneficialOwnerBeingModifiedID: PropTypes.string.isRequired,

    ...subStepPropTypes,
};

const SSN_LAST_4 = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.SSN_LAST_4;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

const defaultProps = {
    reimbursementAccountDraft: {},
};

function SocialSecurityNumberUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const ssnLast4InputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${SSN_LAST_4}`;
    const defaultSsnLast4 = lodashGet(reimbursementAccountDraft, ssnLast4InputID, '');

    const validate = (values) => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, [ssnLast4InputID]);
        if (values[ssnLast4InputID] && !ValidationUtils.isValidSSNLastFour(values[ssnLast4InputID])) {
            errors[ssnLast4InputID] = 'bankAccount.error.ssnLast4';
        }
        return errors;
    };

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadline]}>{translate('beneficialOwnerInfoStep.enterTheLast4')}</Text>
                <Text style={[styles.mb3]}>{translate('beneficialOwnerInfoStep.dontWorry')}</Text>
                <View style={[styles.flex1]}>
                    <TextInput
                        inputID={ssnLast4InputID}
                        label={translate('beneficialOwnerInfoStep.last4SSN')}
                        aria-label={translate('beneficialOwnerInfoStep.last4SSN')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.mt4]}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        defaultValue={defaultSsnLast4}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
                        shouldSaveDraft
                    />
                </View>
            </View>
        </Form>
    );
}

SocialSecurityNumberUBO.propTypes = propTypes;
SocialSecurityNumberUBO.defaultProps = defaultProps;
SocialSecurityNumberUBO.displayName = 'SocialSecurityNumberUBO';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(SocialSecurityNumberUBO);
