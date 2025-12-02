import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import AddressSearch from '@components/AddressSearch';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import type BankInfoSubStepProps from '@pages/ReimbursementAccount/NonUSD/BankInfo/types';
import {getBankInfoStepValues} from '@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues';
import getInputForValueSet from '@pages/ReimbursementAccount/NonUSD/utils/getInputForValueSet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {CorpayFormField} from '@src/types/onyx';
import SafeString from '@src/utils/SafeString';

function getInputComponent(field: CorpayFormField) {
    if (CONST.CORPAY_FIELDS.SPECIAL_LIST_ADDRESS_KEYS.includes(field.id)) {
        return AddressSearch;
    }
    return TextInput;
}

function BankAccountDetails({onNext, isEditing, corpayFields}: BankInfoSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});

    const bankAccountDetailsFields = useMemo(() => {
        return corpayFields?.formFields?.filter((field) => !field.id.includes(CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX));
    }, [corpayFields]);

    const subStepKeys = bankAccountDetailsFields?.reduce(
        (acc, field) => {
            acc[field.id as keyof ReimbursementAccountForm] = field.id as keyof ReimbursementAccountForm;
            return acc;
        },
        {} as Record<keyof ReimbursementAccountForm, keyof ReimbursementAccountForm>,
    );

    const defaultValues = useMemo(
        () => getBankInfoStepValues(subStepKeys ?? {}, reimbursementAccountDraft, reimbursementAccount),
        [reimbursementAccount, reimbursementAccountDraft, subStepKeys],
    );

    const fieldIds = bankAccountDetailsFields?.map((field) => field.id);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> = {};

            // eslint-disable-next-line unicorn/no-array-for-each
            corpayFields?.formFields?.forEach((field) => {
                const fieldID = field.id as keyof FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>;

                if (field.isRequired && !values[fieldID]) {
                    errors[fieldID] = translate('common.error.fieldRequired');
                }

                // eslint-disable-next-line unicorn/no-array-for-each
                field.validationRules.forEach((rule) => {
                    if (!rule.regEx) {
                        return;
                    }

                    if (new RegExp(rule.regEx).test(SafeString(values[fieldID]))) {
                        return;
                    }

                    errors[fieldID] = rule.errorMessage;
                });
            });

            return errors;
        },
        [corpayFields, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: fieldIds as Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>>,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const inputs = useMemo(() => {
        return bankAccountDetailsFields?.map((field) => {
            if (field.valueSet !== undefined) {
                return getInputForValueSet(field, SafeString(defaultValues[field.id as keyof typeof defaultValues]), isEditing, styles);
            }

            return (
                <View
                    style={styles.mb6}
                    key={field.id}
                >
                    <InputWrapper
                        InputComponent={getInputComponent(field)}
                        inputID={field.id}
                        label={field.label}
                        aria-label={field.label}
                        role={CONST.ROLE.PRESENTATION}
                        shouldSaveDraft={!isEditing}
                        defaultValue={SafeString(defaultValues[field.id as keyof typeof defaultValues])}
                        limitSearchesToCountry={reimbursementAccountDraft?.country}
                        renamedInputKeys={{
                            street: 'bankAddressLine1',
                            city: 'bankCity',
                            country: '',
                        }}
                    />
                </View>
            );
        });
    }, [bankAccountDetailsFields, styles, isEditing, defaultValues, reimbursementAccountDraft?.country]);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
            isSubmitDisabled={!inputs}
            shouldHideFixErrorsAlert={(bankAccountDetailsFields?.length ?? 0) <= 1}
        >
            <>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankInfoStep.whatAreYour')}</Text>
                {corpayFields?.isLoading ? (
                    <View style={[styles.flexGrow4, styles.alignItemsCenter]}>
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={styles.flexGrow1}
                        />
                    </View>
                ) : (
                    inputs
                )}
            </>
        </FormProvider>
    );
}

BankAccountDetails.displayName = 'BankAccountDetails';

export default BankAccountDetails;
