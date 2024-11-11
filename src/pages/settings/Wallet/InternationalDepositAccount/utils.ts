import lodashSortBy from 'lodash/sortBy';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {InternationalBankAccountForm} from '@src/types/form';
import type {BankAccount, BankAccountList, CorpayFields, PrivatePersonalDetails} from '@src/types/onyx';
import type {CorpayFieldsMap} from '@src/types/onyx/CorpayFields';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function getFieldsMap(corpayFields: OnyxEntry<CorpayFields>): Record<ValueOf<typeof CONST.CORPAY_FIELDS.STEPS_NAME>, CorpayFieldsMap> {
    return (corpayFields?.formFields ?? []).reduce((acc, field) => {
        if (!field.id) {
            return acc;
        }
        if (field.id === CONST.CORPAY_FIELDS.ACCOUNT_TYPE_KEY) {
            acc[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE] = {[field.id]: field};
        } else if (CONST.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.includes(field.id)) {
            acc[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION] = acc[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION] ?? {};
            acc[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION][field.id] = field;
        } else if (CONST.CORPAY_FIELDS.BANK_INFORMATION_FIELDS.includes(field.id)) {
            acc[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION] = acc[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION] ?? {};
            acc[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION][field.id] = field;
        } else {
            acc[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS] = acc[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS] ?? {};
            acc[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS][field.id] = field;
        }
        return acc;
    }, {} as Record<ValueOf<typeof CONST.CORPAY_FIELDS.STEPS_NAME>, CorpayFieldsMap>);
}

function getLatestCreatedBankAccount(bankAccountList: OnyxEntry<BankAccountList>): BankAccount | undefined {
    return lodashSortBy(Object.values(bankAccountList ?? {}), 'accountData.created').pop();
}

function getSubstepValues(
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>,
    corpayFields: OnyxEntry<CorpayFields>,
    bankAccountList: OnyxEntry<BankAccountList>,
    internationalBankAccountDraft: OnyxEntry<InternationalBankAccountForm>,
    country: OnyxEntry<string>,
): InternationalBankAccountForm {
    const address = PersonalDetailsUtils.getCurrentAddress(privatePersonalDetails);
    const {street} = address ?? {};
    const [street1, street2] = street ? street.split('\n') : [undefined, undefined];
    const firstName = privatePersonalDetails?.legalFirstName ?? '';
    const lastName = privatePersonalDetails?.legalLastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    const latestBankAccount = getLatestCreatedBankAccount(bankAccountList);
    return {
        ...internationalBankAccountDraft,
        bankCountry: internationalBankAccountDraft?.bankCountry ?? corpayFields?.bankCountry ?? address?.country ?? latestBankAccount?.bankCountry ?? country ?? '',
        bankCurrency: internationalBankAccountDraft?.bankCurrency ?? corpayFields?.bankCurrency,
        accountHolderName: internationalBankAccountDraft?.accountHolderName ?? fullName,
        accountHolderAddress1: internationalBankAccountDraft?.accountHolderAddress1 ?? street1 ?? '',
        accountHolderAddress2: internationalBankAccountDraft?.accountHolderAddress2 ?? street2 ?? '',
        accountHolderCity: internationalBankAccountDraft?.accountHolderCity ?? address?.city ?? '',
        accountHolderCountry: internationalBankAccountDraft?.accountHolderCountry ?? address?.country ?? '',
        accountHolderPostal: internationalBankAccountDraft?.accountHolderPostal ?? address?.zip ?? '',
        accountHolderPhoneNumber: internationalBankAccountDraft?.accountHolderPhoneNumber ?? privatePersonalDetails?.phoneNumber ?? '',
    } as unknown as InternationalBankAccountForm;
}

function testValidation(values: InternationalBankAccountForm, fieldsMap: CorpayFieldsMap = {}) {
    for (const fieldName in fieldsMap) {
        if (!fieldName) {
            // eslint-disable-next-line no-continue
            continue;
        }
        if (fieldsMap[fieldName].isRequired && values[fieldName] === '') {
            return false;
        }
        if (!values[fieldName]) {
            fieldsMap[fieldName].validationRules.forEach((rule) => {
                const regExpCheck = new RegExp(rule.regEx);
                if (!regExpCheck.test(values[fieldName])) {
                    return false;
                }
            });
        }
    }
    return true;
}

function getInitialSubstep(values: InternationalBankAccountForm, fieldsMap: Record<ValueOf<typeof CONST.CORPAY_FIELDS.STEPS_NAME>, CorpayFieldsMap>) {
    if (values.bankCountry === '' || isEmptyObject(fieldsMap)) {
        return CONST.CORPAY_FIELDS.INDEXES.MAPPING.COUNTRY_SELECTOR;
    }
    if (values.bankCurrency === '' || !testValidation(values, fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS])) {
        return CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS;
    }
    if (!testValidation(values, fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE])) {
        return CONST.CORPAY_FIELDS.INDEXES.MAPPING.ACCOUNT_TYPE;
    }
    if (!testValidation(values, fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION])) {
        return CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_INFORMATION;
    }
    if (!testValidation(values, fieldsMap[CONST.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION])) {
        return CONST.CORPAY_FIELDS.INDEXES.MAPPING.ACCOUNT_HOLDER_INFORMATION;
    }
    return CONST.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION;
}

export {getFieldsMap, getSubstepValues, getInitialSubstep, testValidation};
