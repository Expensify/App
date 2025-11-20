import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import AddressSearch from '@components/AddressSearch';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import PushRowWithModal from '@components/PushRowWithModal';
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
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {CorpayFormField} from '@src/types/onyx';
import SafeString from '@src/utils/SafeString';

const {ACCOUNT_HOLDER_COUNTRY} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const {COUNTRY, ACCOUNT_HOLDER_NAME} = INPUT_IDS.ADDITIONAL_DATA;

function getInputComponent(field: CorpayFormField) {
    if (CONST.CORPAY_FIELDS.SPECIAL_LIST_ADDRESS_KEYS.includes(field.id)) {
        return AddressSearch;
    }
    return TextInput;
}

function AccountHolderDetails({onNext, isEditing, corpayFields}: BankInfoSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const accountHolderDetailsFields = useMemo(() => {
        return corpayFields?.formFields?.filter((field) => field.id.includes(CONST.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX));
    }, [corpayFields]);
    const fieldIds = accountHolderDetailsFields?.map((field) => field.id);

    const subStepKeys = accountHolderDetailsFields?.reduce(
        (acc, field) => {
            acc[field.id as keyof ReimbursementAccountForm] = field.id as keyof ReimbursementAccountForm;
            return acc;
        },
        {} as Record<keyof ReimbursementAccountForm, keyof ReimbursementAccountForm>,
    );

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const defaultValues = useMemo(
        () => getBankInfoStepValues(subStepKeys ?? {}, reimbursementAccountDraft, reimbursementAccount),
        [subStepKeys, reimbursementAccount, reimbursementAccountDraft],
    );
    const defaultBankAccountCountry = reimbursementAccount?.achData?.[COUNTRY] ?? reimbursementAccountDraft?.[COUNTRY] ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: fieldIds as Array<FormOnyxKeys<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>>,
        onNext,
        shouldSaveDraft: true,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> = {};

            if (accountHolderDetailsFields) {
                for (const field of accountHolderDetailsFields) {
                    const fieldID = field.id as keyof FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>;

                    if (field.isRequired && !values[fieldID]) {
                        errors[fieldID] = translate('common.error.fieldRequired');
                    }

                    for (const rule of field.validationRules) {
                        if (!rule.regEx) {
                            continue;
                        }

                        if (new RegExp(rule.regEx).test(values[fieldID] ? SafeString(values[fieldID]) : '')) {
                            continue;
                        }

                        errors[fieldID] = rule.errorMessage;
                    }
                }
            }

            return errors;
        },
        [accountHolderDetailsFields, translate],
    );

    const inputs = useMemo(() => {
        return accountHolderDetailsFields?.map((field) => {
            if (field.valueSet !== undefined) {
                return getInputForValueSet(field, SafeString(defaultValues[field.id as keyof typeof defaultValues]), isEditing, styles);
            }

            if (field.id === ACCOUNT_HOLDER_COUNTRY) {
                return (
                    <View
                        style={[styles.mb6, styles.mhn5]}
                        key={field.id}
                    >
                        <InputWrapper
                            InputComponent={PushRowWithModal}
                            optionsList={CONST.ALL_COUNTRIES}
                            description={field.label}
                            shouldSaveDraft={!isEditing}
                            defaultValue={String(defaultValues[field.id] !== '' ? defaultValues[field.id] : defaultBankAccountCountry)}
                            modalHeaderTitle={translate('countryStep.selectCountry')}
                            searchInputTitle={translate('countryStep.findCountry')}
                            inputID={field.id}
                        />
                    </View>
                );
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
                        defaultValue={SafeString(defaultValues[field.id as keyof typeof defaultValues])}
                        shouldSaveDraft={!isEditing}
                        limitSearchesToCountry={defaultValues.accountHolderCountry || defaultBankAccountCountry}
                        renamedInputKeys={{
                            street: 'accountHolderAddress1',
                            city: 'accountHolderCity',
                        }}
                        hint={field.id === ACCOUNT_HOLDER_NAME ? translate('bankInfoStep.accountHolderNameDescription') : undefined}
                    />
                </View>
            );
        });
    }, [accountHolderDetailsFields, styles, defaultValues, isEditing, defaultBankAccountCountry, translate]);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            shouldHideFixErrorsAlert={(accountHolderDetailsFields?.length ?? 0) <= 1}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankInfoStep.whatAreYour')}</Text>
                {inputs}
            </View>
        </FormProvider>
    );
}

AccountHolderDetails.displayName = 'AccountHolderDetails';

export default AccountHolderDetails;
