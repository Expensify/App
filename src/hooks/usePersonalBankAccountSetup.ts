import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalBankAccountForm} from '@src/types/form';
import type {PersonalBankAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

const personalBankAccountSourceSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.source;
const personalBankAccountShouldShowSuccessSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.shouldShowSuccess;
const personalBankAccountCurrentPageSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.currentPage;
const personalBankAccountCurrentPageActionSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.currentPageAction;
const personalBankAccountEditDraftSnapshotSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.editDraftSnapshot;
const personalDraftSetupTypeSelector = (personalDraft: OnyxEntry<PersonalBankAccountForm>) => personalDraft?.setupType;

/** Reads the hydrated state needed to decide whether a personal bank-account setup can be resumed. */
function usePersonalBankAccountSetup() {
    const [source, personalBankAccountMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: personalBankAccountSourceSelector});
    const [shouldShowSuccess] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
        selector: personalBankAccountShouldShowSuccessSelector,
    });
    const [currentPage] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
        selector: personalBankAccountCurrentPageSelector,
    });
    const [currentPageAction] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
        selector: personalBankAccountCurrentPageActionSelector,
    });
    const [editDraftSnapshot] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
        selector: personalBankAccountEditDraftSnapshotSelector,
    });
    const [setupType, personalDraftMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {selector: personalDraftSetupTypeSelector});

    const isLoading = isLoadingOnyxValue(personalBankAccountMetadata, personalDraftMetadata);
    const personalBankAccount = {
        source,
        shouldShowSuccess,
        currentPage,
        currentPageAction,
        editDraftSnapshot,
    };
    const personalDraft = {setupType};

    return {personalBankAccount, personalDraft, isLoading};
}

export default usePersonalBankAccountSetup;
