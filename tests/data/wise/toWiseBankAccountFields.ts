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
    schema: DynamicFormSchema;

    /** Single-option selects Wise asks for, answered by the server on create instead of shown */
    answeredByServer: Record<string, string>;
};

const SWIFT_PAYOUT_TYPE = 'swift_code';
const DOMESTIC_WIRE_PAYOUT_TYPE = 'fedwire_local';
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

function acceptsPersonalAccounts(requirement: WiseAccountRequirement): boolean {
    const legalType = requirement.fields.flatMap((group) => group.group).find((descriptor) => descriptor.key === LEGAL_TYPE_KEY);
    return !legalType || (legalType.valuesAllowed ?? []).some((value) => value.key === PERSONAL_LEGAL_TYPE);
}

/** Every local rail a personal account can use for a domestic account, in Wise's order; SWIFT alone when no local rail reaches the account */
function pickPayoutTypes(requirements: WiseAccountRequirement[], isDomestic: boolean): WiseAccountRequirement[] {
    const localRails = requirements.filter((requirement) => requirement.type !== SWIFT_PAYOUT_TYPE && requirement.type !== DOMESTIC_WIRE_PAYOUT_TYPE && acceptsPersonalAccounts(requirement));
    if (isDomestic && localRails.length > 0) {
        return localRails;
    }
    const swift = requirements.find((requirement) => requirement.type === SWIFT_PAYOUT_TYPE);
    return swift ? [swift] : [];
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

function toPayoutTypeField(payoutTypes: WiseAccountRequirement[]): DynamicFormField {
    return {
        key: 'payoutType',
        type: 'select',
        label: 'Payment method',
        required: true,
        refreshOnChange: true,
        values: payoutTypes.map((payoutType) => ({key: payoutType.type, label: payoutType.title})),
    };
}

/** Builds what the server writes to `wiseBankAccountFields`: the chosen rail's form, with a rail select under the currency when more than one local rail fits */
function toWiseBankAccountFields(country: string, currency: string, requirements: WiseAccountRequirement[], isDomestic = true, chosenPayoutType = ''): WiseBankAccountFields | undefined {
    const payoutTypes = pickPayoutTypes(requirements, isDomestic);
    const requirement = payoutTypes.find((payoutType) => payoutType.type === chosenPayoutType) ?? payoutTypes.at(0);
    if (!requirement) {
        return undefined;
    }
    const descriptors = requirement.fields.flatMap((group) => group.group);
    const answeredByServer: Record<string, string> = {};
    const accountFields: DynamicFormField[] = [{key: 'currency', type: 'currency', labelKey: 'common.currency', required: true, refreshOnChange: true}];
    if (payoutTypes.length > 1) {
        accountFields.push(toPayoutTypeField(payoutTypes));
    }
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
            labelKey: 'common.personalAddress',
            required: addressParts.some((part) => part.required),
            refreshOnChange: addressParts.some((part) => part.refreshRequirementsOnChange) || undefined,
        });
    }

    const allPages: DynamicFormPage[] = [
        {key: 'accountDetails', titleKey: 'addPersonalBankAccount.accountDetailsStepHeader', content: accountFields},
        {key: 'accountHolderDetails', titleKey: 'addPersonalBankAccount.accountHolderInformationStepHeader', content: holderFields},
    ];
    const pages = allPages.filter((page) => page.content.length > 0);

    return {country, currency, payoutType: requirement.type, schema: {pages}, answeredByServer};
}

export default toWiseBankAccountFields;
export type {WiseAccountRequirement};
