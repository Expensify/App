import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressForm from '@pages/ReimbursementAccount/AddressForm';
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

const defaultProps = {
    reimbursementAccountDraft: {},
};

const BENEFICIAL_OWNER_INFO_KEY = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

function AddressUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const INPUT_KEYS = {
        street: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.STREET}`,
        city: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.CITY}`,
        state: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.STATE}`,
        zipCode: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.ZIP_CODE}`,
    };

    const REQUIRED_FIELDS = [INPUT_KEYS.street, INPUT_KEYS.city, INPUT_KEYS.state, INPUT_KEYS.zipCode];

    const defaultValues = {
        street: lodashGet(reimbursementAccountDraft, INPUT_KEYS.street, ''),
        city: lodashGet(reimbursementAccountDraft, INPUT_KEYS.city, ''),
        state: lodashGet(reimbursementAccountDraft, INPUT_KEYS.state, ''),
        zipCode: lodashGet(reimbursementAccountDraft, INPUT_KEYS.zipCode, ''),
    };

    const validate = (values) => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

        if (values[INPUT_KEYS.street] && !ValidationUtils.isValidAddress(values[INPUT_KEYS.street])) {
            errors[INPUT_KEYS.street] = 'bankAccount.error.addressStreet';
        }

        if (values[INPUT_KEYS.zipCode] && !ValidationUtils.isValidZipCode(values[INPUT_KEYS.zipCode])) {
            errors[INPUT_KEYS.zipCode] = 'bankAccount.error.zipCode';
        }

        return errors;
    };

    return (
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            submitButtonStyles={[styles.mb0, styles.pb5]}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadline]}>{translate('beneficialOwnerInfoStep.enterTheOwnersAddress')}</Text>
            <Text>{translate('common.noPO')}</Text>
            <AddressForm
                inputKeys={INPUT_KEYS}
                shouldSaveDraft
                translate={translate}
                defaultValues={defaultValues}
                streetTranslationKey="common.companyAddress"
            />
        </FormProvider>
    );
}

AddressUBO.propTypes = propTypes;
AddressUBO.defaultProps = defaultProps;
AddressUBO.displayName = 'AddressUBO';

export default withOnyx({
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(AddressUBO);
