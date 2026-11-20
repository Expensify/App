/** Protect a bank operation rather than its individual Next/Back transitions, including a direct-linked substep. */
import {normalizeCountryCode} from '@libs/CountryUtils';
import hasFormChanges from '@libs/hasFormChanges';
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {useState} from 'react';

import useFlowDiscardChangesConfirmation from './useFlowDiscardChangesConfirmation';
import useOnyx from './useOnyx';

const ADD_SCREENS = [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT, SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT];
const UPDATE_SCREENS = [SCREENS.SETTINGS.UPDATE_PERSONAL_BANK_ACCOUNT];

type PersonalBankAccountDiscardOptions = {
    isUpdating?: boolean;
    onDiscard: () => void | Promise<void>;
};

function usePersonalBankAccountDiscardConfirmation({isUpdating = false, onDiscard}: PersonalBankAccountDiscardOptions) {
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [privateDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
        selector: (details) => ({
            legalFirstName: details?.legalFirstName,
            legalLastName: details?.legalLastName,
            phoneNumber: details?.phoneNumber,
            address: getCurrentAddress(details),
        }),
    });
    const [bankState] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
        selector: (state) => ({bankAccountID: state?.bankAccountID, shouldShowSuccess: state?.shouldShowSuccess}),
    });
    const [draft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [addressDraft] = useOnyx(ONYXKEYS.FORMS.HOME_ADDRESS_FORM_DRAFT);
    const [existing] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {
        selector: (accounts) => {
            if (!isUpdating || !bankState?.bankAccountID) {
                return undefined;
            }
            const details = accounts?.[String(bankState.bankAccountID)]?.accountData?.additionalData;
            if (!details) {
                return undefined;
            }
            return {
                firstName: details.firstName,
                legalFirstName: details.legalFirstName,
                lastName: details.lastName,
                legalLastName: details.legalLastName,
                companyPhone: details.companyPhone,
                addressStreet: details.addressStreet,
                addressCity: details.addressCity,
                addressState: details.addressState,
                addressZipCode: details.addressZipCode,
            };
        },
    });
    const address = normalizeCountryCode(privateDetails?.address);
    const [street, street2] = getStreetLines(existing?.addressStreet ?? address?.street);
    const currentInitialValues = {
        routingNumber: '',
        accountNumber: '',
        legalFirstName: existing?.firstName ?? existing?.legalFirstName ?? privateDetails?.legalFirstName ?? '',
        legalLastName: existing?.lastName ?? existing?.legalLastName ?? privateDetails?.legalLastName ?? '',
        phoneNumber: existing?.companyPhone ?? privateDetails?.phoneNumber ?? '',
        addressStreet: street ?? '',
        addressStreet2: street2 ?? (existing ? '' : address?.street2) ?? '',
        addressCity: existing?.addressCity ?? address?.city ?? '',
        addressState: existing?.addressState ?? address?.state ?? '',
        addressZipCode: existing?.addressZipCode ?? address?.zip ?? '',
        country: isUpdating ? CONST.COUNTRY.US : (address?.country ?? ''),
    };
    const [initialValues, setInitialValues] = useState<typeof currentInitialValues>();
    if (!initialValues && !isLoadingApp && (!isUpdating || !!bankState?.bankAccountID)) {
        // The update action optimistically overwrites the saved account. Pending work must keep its pre-submit baseline.
        setInitialValues(currentInitialValues);
    }
    const initialAddress = {
        addressLine1: initialValues?.addressStreet,
        addressLine2: initialValues?.addressStreet2,
        city: initialValues?.addressCity,
        state: initialValues?.addressState,
        zipPostCode: initialValues?.addressZipCode,
        country: initialValues?.country,
    };

    return useFlowDiscardChangesConfirmation({
        screenNames: isUpdating ? UPDATE_SCREENS : ADD_SCREENS,
        // Failures arrive via Onyx rather than a returned rejecting promise. Pending submission never mutes protection.
        getHasUnsavedChanges: () => !!initialValues && !bankState?.shouldShowSuccess && (hasFormChanges(draft, initialValues) || hasFormChanges(addressDraft, initialAddress)),
        onDiscard,
    });
}

export default usePersonalBankAccountDiscardConfirmation;
