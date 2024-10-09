import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type TaxIdBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type TaxIdBusinessProps = TaxIdBusinessOnyxProps & SubStepProps;

const COMPANY_TAX_ID_KEY = INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_TAX_ID;
const STEP_FIELDS = [COMPANY_TAX_ID_KEY];
function TaxIdBusiness({reimbursementAccount, onNext, isEditing}: TaxIdBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const defaultCompanyTaxId = reimbursementAccount?.achData?.companyTaxID;
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? 0;
    const shouldDisableCompanyTaxID = !!(bankAccountID && defaultCompanyTaxId && reimbursementAccount?.achData?.state !== 'SETUP');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.companyTaxID && !ValidationUtils.isValidTaxID(values.companyTaxID)) {
                errors.companyTaxID = translate('bankAccount.error.taxID');
            }

            return errors;
        },
        [translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.enterYourCompanysTaxIdNumber')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                inputID={COMPANY_TAX_ID_KEY}
                label={translate('businessInfoStep.taxIDNumber')}
                aria-label={translate('businessInfoStep.taxIDNumber')}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={defaultCompanyTaxId}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                disabled={shouldDisableCompanyTaxID}
                shouldSaveDraft={!isEditing}
                shouldUseDefaultValue={shouldDisableCompanyTaxID}
                containerStyles={[styles.mt6]}
                placeholder={translate('businessInfoStep.taxIDNumberPlaceholder')}
            />
        </FormProvider>
    );
}

TaxIdBusiness.displayName = 'TaxIdBusiness';

export default withOnyx<TaxIdBusinessProps, TaxIdBusinessOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(TaxIdBusiness);
