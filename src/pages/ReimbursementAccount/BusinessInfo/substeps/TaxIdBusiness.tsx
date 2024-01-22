import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type TaxIdBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type TaxIdBusinessProps = TaxIdBusinessOnyxProps & SubStepProps;

const COMPANY_TAX_ID_KEY = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_TAX_ID;
const STEP_FIELDS = [COMPANY_TAX_ID_KEY];

const validate = (values: FormValues): OnyxCommon.Errors => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

    if (values.companyTaxID && !ValidationUtils.isValidTaxID(values.companyTaxID)) {
        errors.companyTaxID = 'bankAccount.error.taxID';
    }

    return errors;
};

function TaxIdBusiness({reimbursementAccount, onNext, isEditing}: TaxIdBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const defaultCompanyTaxId = reimbursementAccount?.achData?.companyTaxID ?? '';
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? 0;
    const shouldDisableCompanyTaxID = !!(bankAccountID && defaultCompanyTaxId && reimbursementAccount?.achData?.state !== 'SETUP');

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        isEditing,
        onNext,
    });

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={styles.textHeadline}>{translate('businessInfoStep.enterYourCompanysTaxIdNumber')}</Text>
            <InputWrapper
                // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
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
                containerStyles={[styles.mt4]}
                placeholder={translate('businessInfoStep.taxIDNumberPlaceholder')}
            />
        </FormProvider>
    );
}

TaxIdBusiness.displayName = 'TaxIdBusiness';

export default withOnyx<TaxIdBusinessProps, TaxIdBusinessOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(TaxIdBusiness);
