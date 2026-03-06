import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompletedStepsForBankAccount, PERSONAL_INFO_STEP} from '@libs/BankAccountUtils';
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import Navigation from '@navigation/Navigation';
import {clearPersonalBankAccount, updatePersonalBankAccountInfo} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalBankAccountForm} from '@src/types/form/PersonalBankAccountForm';
import type {BankAccountList} from '@src/types/onyx';
import Address from './InternationalDepositAccount/PersonalInfo/substeps/AddressStep';
import LegalName from './InternationalDepositAccount/PersonalInfo/substeps/LegalNameStep';
import PhoneNumber from './InternationalDepositAccount/PersonalInfo/substeps/PhoneNumberStep';

const PAGE_NAME = CONST.UPDATE_PERSONAL_BANK_ACCOUNT.PAGE_NAME;

const PAGE_NAMES: string[] = [PAGE_NAME.LEGAL_NAME, PAGE_NAME.ADDRESS, PAGE_NAME.PHONE_NUMBER];

/**
 * Wrapper that enables draft saving on the address form to preserve values across navigation.
 */
function AddressWithDraft({isEditing, onNext, onMove}: SubStepProps) {
    return (
        <Address
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            shouldSaveDraft
        />
    );
}

/**
 * Wrapper that delays auto-focus to avoid validation errors during URL-based navigation transitions.
 */
function DelayedPhoneNumber({isEditing, onNext, onMove}: SubStepProps) {
    return (
        <PhoneNumber
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            shouldDelayAutoFocus
        />
    );
}

const formPages = [
    {pageName: PAGE_NAME.LEGAL_NAME, component: LegalName},
    {pageName: PAGE_NAME.ADDRESS, component: AddressWithDraft},
    {pageName: PAGE_NAME.PHONE_NUMBER, component: DelayedPhoneNumber},
];

/**
 * Returns the first non-skipped page name for the update flow based on the bank account's existing data.
 */
function getFirstPageName(bankAccountList?: OnyxEntry<BankAccountList>, bankAccountID?: number): string {
    const completedSteps = bankAccountID ? getCompletedStepsForBankAccount(bankAccountList, bankAccountID) : [];
    const skipPageNames = new Set(completedSteps.map((step) => PAGE_NAMES.at(step - 1)).filter((name): name is string => !!name));
    const firstPage = PAGE_NAMES.find((name) => !skipPageNames.has(name));
    return firstPage ?? PAGE_NAME.LEGAL_NAME;
}

function UpdatePersonalBankAccountPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [personalBankAccountDraft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;
    const bankAccountID = personalBankAccount?.bankAccountID;

    useEffect(() => {
        if (!bankAccountID && !shouldShowSuccess) {
            Navigation.goBack(ROUTES.SETTINGS_WALLET);
        }
    }, [bankAccountID, shouldShowSuccess]);

    const completedSteps = bankAccountID ? getCompletedStepsForBankAccount(bankAccountList, bankAccountID) : [];

    const exitFlow = () => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET);
        clearPersonalBankAccount();
        clearDraftValues(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
        clearDraftValues(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM);
    };

    const submitPersonalInfo = () => {
        const accountData: Partial<PersonalBankAccountForm> = {};

        if (!completedSteps.includes(PERSONAL_INFO_STEP.NAME)) {
            accountData.legalFirstName = personalBankAccountDraft?.legalFirstName ?? privatePersonalDetails?.legalFirstName;
            accountData.legalLastName = personalBankAccountDraft?.legalLastName ?? privatePersonalDetails?.legalLastName;
        }
        if (!completedSteps.includes(PERSONAL_INFO_STEP.ADDRESS)) {
            const currentAddress = getCurrentAddress(privatePersonalDetails);
            const [street1, street2] = getStreetLines(currentAddress?.street);
            accountData.addressStreet = personalBankAccountDraft?.addressStreet ?? street1;
            accountData.addressStreet2 = personalBankAccountDraft?.addressStreet2 ?? street2;
            accountData.addressCity = personalBankAccountDraft?.addressCity ?? currentAddress?.city;
            accountData.addressState = personalBankAccountDraft?.addressState ?? currentAddress?.state;
            accountData.addressZipCode = personalBankAccountDraft?.addressZipCode ?? currentAddress?.zip;
            accountData.country = personalBankAccountDraft?.country ?? currentAddress?.country;
        }
        if (!completedSteps.includes(PERSONAL_INFO_STEP.PHONE)) {
            const finalPhoneNumber = personalBankAccountDraft?.phoneNumber ?? privatePersonalDetails?.phoneNumber ?? '';
            const parsed = parsePhoneNumber(finalPhoneNumber, {regionCode: CONST.COUNTRY.US});
            accountData.phoneNumber = parsed.number?.significant ?? '';
        }

        if (personalBankAccount?.bankAccountID) {
            updatePersonalBankAccountInfo(personalBankAccount.bankAccountID, accountData);
        }
    };
    const skipPageCandidates = completedSteps.map((step) => PAGE_NAMES.at(step - 1)).filter((name): name is string => !!name);
    const skipPages = skipPageCandidates.length >= formPages.length ? [] : skipPageCandidates;

    const firstPageName = getFirstPageName(bankAccountList, personalBankAccount?.bankAccountID);
    const firstNonSkippedIndex = formPages.findIndex((p) => p.pageName === firstPageName);

    const {CurrentPage, currentPageName, prevPage, nextPage} = useSubPage({
        pages: formPages,
        onFinished: submitPersonalInfo,
        skipPages,
        startFrom: firstNonSkippedIndex >= 0 ? firstNonSkippedIndex : 0,
        buildRoute: (pageName) => ROUTES.SETTINGS_UPDATE_PERSONAL_BANK_ACCOUNT.getRoute(pageName),
    });

    const handleBackButtonPress = () => {
        if (currentPageName === firstPageName) {
            Navigation.goBack();
            return;
        }
        prevPage();
    };

    if (shouldShowSuccess) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                shouldEnablePickerAvoiding={false}
                shouldShowOfflineIndicator={false}
                testID={UpdatePersonalBankAccountPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('addPersonalBankAccount.updateSuccessHeader')}
                    onBackButtonPress={exitFlow}
                />
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <ConfirmationPage
                        heading={translate('addPersonalBankAccount.updateSuccessTitle')}
                        description={translate('addPersonalBankAccount.updateSuccessMessage')}
                        shouldShowButton
                        buttonText={translate('common.continue')}
                        onButtonPress={exitFlow}
                        containerStyle={styles.h100}
                    />
                </ScrollView>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={UpdatePersonalBankAccountPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('addPersonalBankAccount.updatePersonalInfo')}
                onBackButtonPress={handleBackButtonPress}
            />
            <CurrentPage
                isEditing={false}
                onNext={nextPage}
                onMove={() => {}}
            />
        </ScreenWrapper>
    );
}

UpdatePersonalBankAccountPage.displayName = 'UpdatePersonalBankAccountPage';

export default UpdatePersonalBankAccountPage;
export {getFirstPageName};
