import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type AddressProps = SubStepProps;

const {COMPANY_STREET, COMPANY_ZIP_CODE, COMPANY_STATE, COMPANY_CITY, COMPANY_COUNTRY} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const INPUT_KEYS = {
    street: COMPANY_STREET,
    city: COMPANY_CITY,
    state: COMPANY_STATE,
    zipCode: COMPANY_ZIP_CODE,
    country: COMPANY_COUNTRY,
};
const STEP_FIELDS = [COMPANY_STREET, COMPANY_CITY, COMPANY_STATE, COMPANY_ZIP_CODE, COMPANY_COUNTRY];
const STEP_FIELDS_WITHOUT_STATE = [COMPANY_STREET, COMPANY_CITY, COMPANY_ZIP_CODE, COMPANY_COUNTRY];

function Address({onNext, isEditing}: AddressProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const onyxValues = useMemo(() => getSubstepValues(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    // TODO look into default country
    const businessStepCountryDraftValue = onyxValues[COMPANY_COUNTRY];
    const countryStepCountryDraftValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const countryInitialValue =
        businessStepCountryDraftValue !== '' && businessStepCountryDraftValue !== countryStepCountryDraftValue ? businessStepCountryDraftValue : countryStepCountryDraftValue;

    const defaultValues = {
        street: onyxValues[COMPANY_STREET] ?? '',
        city: onyxValues[COMPANY_CITY] ?? '',
        state: onyxValues[COMPANY_STATE] ?? '',
        zipCode: onyxValues[COMPANY_ZIP_CODE] ?? '',
        country: onyxValues[COMPANY_COUNTRY] ?? countryInitialValue,
    };

    const shouldDisplayStateSelector = defaultValues.country === CONST.COUNTRY.US || defaultValues.country === CONST.COUNTRY.CA || defaultValues.country === '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, shouldDisplayStateSelector ? STEP_FIELDS : STEP_FIELDS_WITHOUT_STATE);

            if (values[COMPANY_STREET] && !ValidationUtils.isValidAddress(values[COMPANY_STREET])) {
                errors[COMPANY_STREET] = translate('bankAccount.error.addressStreet');
            }

            if (values[COMPANY_ZIP_CODE] && !ValidationUtils.isValidZipCode(values[COMPANY_ZIP_CODE])) {
                errors[COMPANY_ZIP_CODE] = translate('bankAccount.error.zipCode');
            }

            return errors;
        },
        [shouldDisplayStateSelector, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: shouldDisplayStateSelector ? STEP_FIELDS : STEP_FIELDS_WITHOUT_STATE,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.mh5]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mh5]}>{translate('businessInfoStep.enterTheNameOfYourBusiness')}</Text>
            <AddressFormFields
                inputKeys={INPUT_KEYS}
                shouldSaveDraft={!isEditing}
                streetTranslationKey="common.companyAddress"
                containerStyles={[styles.mh5]}
                defaultValues={defaultValues}
                shouldDisplayCountrySelector
                shouldDisplayStateSelector={shouldDisplayStateSelector}
            />
        </FormProvider>
    );
}

Address.displayName = 'Address';

export default Address;
