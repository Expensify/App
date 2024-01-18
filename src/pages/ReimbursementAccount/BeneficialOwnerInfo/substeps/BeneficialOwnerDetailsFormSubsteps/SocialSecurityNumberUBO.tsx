import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
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
import type {ReimbursementAccountDraft} from '@src/types/onyx';
import type {BeneficialOwnerDraftData} from '@src/types/onyx/ReimbursementAccountDraft';

const SSN_LAST_4 = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.SSN_LAST_4;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type SocialSecurityNumberUBOOnyxProps = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>;
};
type SocialSecurityNumberUBOProps = SubStepProps & SocialSecurityNumberUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};
type FormValues = BeneficialOwnerDraftData;

function SocialSecurityNumberUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}: SocialSecurityNumberUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const ssnLast4InputID: keyof FormValues = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${SSN_LAST_4}`;
    const defaultSsnLast4 = reimbursementAccountDraft?.[ssnLast4InputID] ?? '';

    const validate = (values: FormValues) => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, [ssnLast4InputID]);
        if (values[ssnLast4InputID] && !ValidationUtils.isValidSSNLastFour(values[ssnLast4InputID])) {
            errors[ssnLast4InputID] = 'bankAccount.error.ssnLast4';
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
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadline]}>{translate('beneficialOwnerInfoStep.enterTheLast4')}</Text>
                <Text style={[styles.mb3]}>{translate('beneficialOwnerInfoStep.dontWorry')}</Text>
                <View style={[styles.flex1]}>
                    <InputWrapper
                        // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
                        InputComponent={TextInput}
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
        </FormProvider>
    );
}

SocialSecurityNumberUBO.displayName = 'SocialSecurityNumberUBO';

export default withOnyx<SocialSecurityNumberUBOProps, SocialSecurityNumberUBOOnyxProps>({
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(SocialSecurityNumberUBO);
