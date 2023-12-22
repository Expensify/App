import React from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {ReimbursementAccount} from '@src/types/onyx';
import * as OnyxCommon from '@src/types/onyx/OnyxCommon';

const companyTaxIdKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_TAX_ID;

const validate = (values: OnyxCommon.Errors) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [companyTaxIdKey]);

    if (values.companyTaxID && !ValidationUtils.isValidTaxID(values.companyTaxID)) {
        errors.companyTaxID = 'bankAccount.error.taxID';
    }

    return errors;
};

type TaxIdBusinessOnyxProps = {
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type TaxIdBusinessProps = {
    reimbursementAccount: ReimbursementAccount;
} & SubStepProps;

function TaxIdBusiness({reimbursementAccount, onNext, isEditing}: TaxIdBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultCompanyTaxId = getDefaultValueForReimbursementAccountField(reimbursementAccount, companyTaxIdKey, '');

    const bankAccountID = getDefaultValueForReimbursementAccountField(reimbursementAccount, 'bankAccountID', 0);

    const shouldDisableCompanyTaxID = Boolean(bankAccountID && defaultCompanyTaxId);

    return (
        // @ts-expect-error TODO: Remove this once Form (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={styles.textHeadline}>{translate('businessInfoStep.enterYourCompanysTaxIdNumber')}</Text>
            <InputWrapper
                // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                InputComponent={TextInput}
                inputID={companyTaxIdKey}
                label={translate('businessInfoStep.taxIDNumber')}
                aria-label={translate('businessInfoStep.taxIDNumber')}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={defaultCompanyTaxId}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                disabled={shouldDisableCompanyTaxID}
                shouldSaveDraft
                shouldUseDefaultValue={shouldDisableCompanyTaxID}
                containerStyles={[styles.mt4]}
                placeholder={translate('businessInfoStep.taxIDNumberPlaceholder')}
            />
        </Form>
    );
}

TaxIdBusiness.displayName = 'TaxIdBusiness';

export default withOnyx<TaxIdBusinessProps, TaxIdBusinessOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(TaxIdBusiness);
