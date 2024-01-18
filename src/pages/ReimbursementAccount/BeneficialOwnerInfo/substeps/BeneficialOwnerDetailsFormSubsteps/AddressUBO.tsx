import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressForm from '@pages/ReimbursementAccount/AddressForm';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountDraft} from '@src/types/onyx';
import type {BeneficialOwnerDraftData} from '@src/types/onyx/ReimbursementAccountDraft';

const BENEFICIAL_OWNER_INFO_KEY = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type AddressUBOOnyxProps = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>;
};
type AddressUBOProps = SubStepProps & AddressUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};
type FormValues = BeneficialOwnerDraftData;

function AddressUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}: AddressUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const INPUT_KEYS: Record<string, keyof FormValues> = {
        street: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.STREET}`,
        city: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.CITY}`,
        state: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.STATE}`,
        zipCode: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.ZIP_CODE}`,
    };

    const REQUIRED_FIELDS = [INPUT_KEYS.street, INPUT_KEYS.city, INPUT_KEYS.state, INPUT_KEYS.zipCode];

    const defaultValues = {
        street: reimbursementAccountDraft?.[INPUT_KEYS.street] ?? '',
        city: reimbursementAccountDraft?.[INPUT_KEYS.city] ?? '',
        state: reimbursementAccountDraft?.[INPUT_KEYS.state] ?? '',
        zipCode: reimbursementAccountDraft?.[INPUT_KEYS.zipCode] ?? '',
    };

    const validate = (values: FormValues) => {
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
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
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
                streetTranslationKey="common.streetAddress"
            />
        </FormProvider>
    );
}

AddressUBO.displayName = 'AddressUBO';

export default withOnyx<AddressUBOProps, AddressUBOOnyxProps>({
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(AddressUBO);
