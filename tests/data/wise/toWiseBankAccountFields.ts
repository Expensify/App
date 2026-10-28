import type {DynamicFormField, DynamicFormFieldOption, DynamicFormPage, DynamicFormSchema} from '@src/types/onyx';

type WiseAllowedValue = {
    key: string;
    name: string;
};

type WiseFieldDescriptor = {
    key: string;
    name: string;
    type: string;
    refreshRequirementsOnChange: boolean;
    required: boolean;
    displayFormat?: string | null;
    example?: string | null;
    minLength?: number | null;
    maxLength?: number | null;
    validationRegexp?: string | null;
    validationAsync?: unknown;
    valuesAllowed?: WiseAllowedValue[] | null;
};

type WiseAccountRequirement = {
    type: string;
    title: string;
    usageInfo?: string | null;
    fields: Array<{
        name: string;
        group: WiseFieldDescriptor[];
    }>;
};

type WiseBankAccountFields = {
    country: string;
    currency: string;
    payoutType: string;
    fields: DynamicFormSchema;

    /** Single-option selects Wise asks for, answered by the server on create instead of shown */
    answeredByServer: Record<string, string>;
};

const SWIFT_PAYOUT_TYPE = 'swift_code';
const ADDRESS_KEY_PREFIX = 'address.';
const ADDRESS_FIELD_KEY = 'address';

const LEGAL_TYPE_KEY = 'legalType';
const PERSONAL_LEGAL_TYPE = 'PRIVATE';

const HOLDER_KEYS = new Set([
    'accountHolderName',
    'legalType',
    'email',
    'dateOfBirth',
    'nationality',
    'phoneNumber',
    'cpf',
    'taxId',
    'idDocumentType',
    'idDocumentNumber',
    'idDocumentCountry',
]);

const KNOWN_LABEL_KEYS: Record<string, DynamicFormField['labelKey']> = {
    accountNumber: 'bankAccount.accountNumber',
};

/** The domestic rail when the account sits in the currency's own country, else SWIFT when Wise offers it. Wise lists the domestic rail first. */
function pickPayoutType(requirements: WiseAccountRequirement[], isDomestic: boolean): WiseAccountRequirement | undefined {
    if (!isDomestic) {
        return requirements.find((requirement) => requirement.type === SWIFT_PAYOUT_TYPE) ?? requirements.at(0);
    }
    return requirements.find((requirement) => requirement.type !== SWIFT_PAYOUT_TYPE) ?? requirements.at(0);
}

function isHolderField(descriptor: WiseFieldDescriptor): boolean {
    return HOLDER_KEYS.has(descriptor.key) || descriptor.key.startsWith(ADDRESS_KEY_PREFIX);
}

function toOptions(descriptor: WiseFieldDescriptor): DynamicFormFieldOption[] {
    return (descriptor.valuesAllowed ?? []).filter((value) => value.key !== '').map((value) => ({key: value.key, label: value.name}));
}

function toField(descriptor: WiseFieldDescriptor): DynamicFormField {
    const base = {
        key: descriptor.key,
        label: descriptor.name,
        labelKey: KNOWN_LABEL_KEYS[descriptor.key],
        required: descriptor.required,
        refreshOnChange: descriptor.refreshRequirementsOnChange || undefined,
    };
    switch (descriptor.type) {
        case 'select':
        case 'radio':
            return {...base, type: descriptor.type, values: toOptions(descriptor)};
        case 'date':
            return {...base, type: 'date'};
        default:
            return {
                ...base,
                type: 'text',
                regex: descriptor.validationRegexp ?? undefined,
                minLength: descriptor.minLength ?? undefined,
                maxLength: descriptor.maxLength ?? undefined,
                example: descriptor.example || undefined,
                keyboard: descriptor.key === 'email' ? 'email' : undefined,
            };
    }
}

/** Builds the schema the server writes to `wiseBankAccountFields` from Wise's account requirements for one country and currency */
function toWiseBankAccountFields(country: string, currency: string, requirements: WiseAccountRequirement[], isDomestic = true): WiseBankAccountFields | undefined {
    const requirement = pickPayoutType(requirements, isDomestic);
    if (!requirement) {
        return undefined;
    }
    const descriptors = requirement.fields.flatMap((group) => group.group);
    const answeredByServer: Record<string, string> = {};
    const accountFields: DynamicFormField[] = [{key: 'currency', type: 'currency', labelKey: 'common.currency', required: true, refreshOnChange: true}];
    const holderFields: DynamicFormField[] = [];
    const addressParts = descriptors.filter((descriptor) => descriptor.key.startsWith(ADDRESS_KEY_PREFIX));

    for (const descriptor of descriptors) {
        if (descriptor.key.startsWith(ADDRESS_KEY_PREFIX) || !descriptor.required) {
            continue;
        }
        const options = toOptions(descriptor);
        if (descriptor.key === LEGAL_TYPE_KEY) {
            answeredByServer[descriptor.key] = PERSONAL_LEGAL_TYPE;
            continue;
        }
        if ((descriptor.type === 'select' || descriptor.type === 'radio') && options.length === 1) {
            answeredByServer[descriptor.key] = options.at(0)?.key ?? '';
            continue;
        }
        const field = toField(descriptor);
        if ('values' in field && field.values?.length === 0) {
            continue;
        }
        (isHolderField(descriptor) ? holderFields : accountFields).push(field);
    }

    if (addressParts.length > 0) {
        holderFields.push({
            key: ADDRESS_FIELD_KEY,
            type: 'address',
            label: 'Account holder address',
            required: addressParts.some((part) => part.required),
            refreshOnChange: addressParts.some((part) => part.refreshRequirementsOnChange) || undefined,
        });
    }

    const allPages: DynamicFormPage[] = [
        {key: 'accountDetails', titleKey: 'addPersonalBankAccount.accountDetailsStepHeader', content: accountFields},
        {key: 'accountHolderDetails', titleKey: 'addPersonalBankAccount.accountHolderInformationStepHeader', content: holderFields},
    ];
    const pages = allPages.filter((page) => page.content.length > 0);

    return {country, currency, payoutType: requirement.type, fields: {pages}, answeredByServer};
}

export default toWiseBankAccountFields;
export {pickPayoutType};
export type {WiseAccountRequirement, WiseBankAccountFields, WiseFieldDescriptor};
