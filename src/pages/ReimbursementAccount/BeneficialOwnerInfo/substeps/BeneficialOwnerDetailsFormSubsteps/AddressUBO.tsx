import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';

const BENEFICIAL_OWNER_INFO_KEY = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type AddressUBOOnyxProps = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};
type AddressUBOProps = SubStepProps & AddressUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};

function AddressUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}: AddressUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const inputKeys = {
        street: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.STREET}`,
        city: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.CITY}`,
        state: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.STATE}`,
        zipCode: `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${BENEFICIAL_OWNER_INFO_KEY.ZIP_CODE}`,
    } as const;

    const stepFields = [inputKeys.street, inputKeys.city, inputKeys.state, inputKeys.zipCode];

    const defaultValues = {
        street: reimbursementAccountDraft?.[inputKeys.street] ?? '',
        city: reimbursementAccountDraft?.[inputKeys.city] ?? '',
        state: reimbursementAccountDraft?.[inputKeys.state] ?? '',
        zipCode: reimbursementAccountDraft?.[inputKeys.zipCode] ?? '',
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, stepFields);

        if (values[inputKeys.street] && !ValidationUtils.isValidAddress(values[inputKeys.street])) {
            errors[inputKeys.street] = translate('bankAccount.error.addressStreet');
        }

        if (values[inputKeys.zipCode] && !ValidationUtils.isValidZipCode(values[inputKeys.zipCode])) {
            errors[inputKeys.zipCode] = translate('bankAccount.error.zipCode');
        }

        return errors;
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: stepFields,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            submitButtonStyles={[styles.mb0]}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('beneficialOwnerInfoStep.enterTheOwnersAddress')}</Text>
            <Text style={[styles.textSupporting]}>{translate('common.noPO')}</Text>
            <AddressFormFields
                inputKeys={inputKeys}
                shouldSaveDraft={!isEditing}
                defaultValues={defaultValues}
                streetTranslationKey="common.streetAddress"
            />
        </FormProvider>
    );
}

AddressUBO.displayName = 'AddressUBO';

export default withOnyx<AddressUBOProps, AddressUBOOnyxProps>({
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(AddressUBO);
