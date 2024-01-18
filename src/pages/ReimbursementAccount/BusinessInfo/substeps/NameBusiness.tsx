import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type NameBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type NameBusinessProps = NameBusinessOnyxProps & SubStepProps;

const companyNameKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_NAME;

const validate = (values: FormValues): OnyxCommon.Errors => ValidationUtils.getFieldRequiredErrors(values, [companyNameKey]);

function NameBusiness({reimbursementAccount, onNext, isEditing}: NameBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultCompanyName = reimbursementAccount?.achData?.companyName ?? '';
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? 0;

    const shouldDisableCompanyName = !!(bankAccountID && defaultCompanyName && reimbursementAccount?.achData?.state !== 'SETUP');

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={styles.textHeadline}>{translate('businessInfoStep.enterTheNameOfYourBusiness')}</Text>
            <InputWrapper
                // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                InputComponent={TextInput}
                label={translate('businessInfoStep.businessName')}
                aria-label={translate('businessInfoStep.businessName')}
                role={CONST.ROLE.PRESENTATION}
                inputID={companyNameKey}
                containerStyles={[styles.mt4]}
                disabled={shouldDisableCompanyName}
                defaultValue={defaultCompanyName}
                shouldSaveDraft
                shouldUseDefaultValue={shouldDisableCompanyName}
            />
        </FormProvider>
    );
}

NameBusiness.displayName = 'NameBusiness';

export default withOnyx<NameBusinessProps, NameBusinessOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(NameBusiness);
