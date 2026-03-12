import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmationPage from '@components/ConfirmationPage';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompletedStepsForBankAccount} from '@libs/BankAccountUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import Navigation from '@navigation/Navigation';
import {clearPersonalBankAccount, clearPersonalBankAccountErrors, updatePersonalBankAccountInfo} from '@userActions/BankAccounts';
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

function AddressWithDraft({isEditing, onNext, onMove}: SubStepProps) {
    return (
        <Address
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            shouldSaveDraft
            shouldHideCountrySelector
        />
    );
}
AddressWithDraft.displayName = 'AddressWithDraft';

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
DelayedPhoneNumber.displayName = 'DelayedPhoneNumber';

const formPages = [
    {pageName: PAGE_NAME.LEGAL_NAME, component: LegalName},
    {pageName: PAGE_NAME.ADDRESS, component: AddressWithDraft},
    {pageName: PAGE_NAME.PHONE_NUMBER, component: DelayedPhoneNumber},
];

function getPageNamesForCompletedSteps(completedSteps: number[]): string[] {
    return completedSteps.map((step) => PAGE_NAMES.at(step - 1)).filter((name): name is string => !!name);
}

function getFirstPageName(bankAccountList?: OnyxEntry<BankAccountList>, bankAccountID?: number): string {
    const completedSteps = bankAccountID ? getCompletedStepsForBankAccount(bankAccountList, bankAccountID) : [];
    const skipPageNames = new Set(getPageNamesForCompletedSteps(completedSteps));
    const firstPage = PAGE_NAMES.find((name) => !skipPageNames.has(name));
    return firstPage ?? PAGE_NAME.LEGAL_NAME;
}

function UpdatePersonalBankAccountPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [personalBankAccountDraft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [homeAddressDraft] = useOnyx(ONYXKEYS.FORMS.HOME_ADDRESS_FORM_DRAFT);
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;
    const bankAccountID = personalBankAccount?.bankAccountID;
    const errorMessage = getLatestErrorMessage(personalBankAccount ?? {});

    const completedSteps = bankAccountID ? getCompletedStepsForBankAccount(bankAccountList, bankAccountID) : [];

    const exitFlow = () => {
        clearPersonalBankAccount();
        clearDraftValues(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
        clearDraftValues(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM);
        Navigation.goBack(ROUTES.SETTINGS_WALLET);
    };

    const submitPersonalInfo = () => {
        if (!personalBankAccount?.bankAccountID || personalBankAccount?.isLoading) {
            return;
        }

        const existingData = bankAccountList?.[String(personalBankAccount.bankAccountID)]?.accountData?.additionalData;
        const currentAddress = getCurrentAddress(privatePersonalDetails);
        const [street1, street2] = getStreetLines(currentAddress?.street);

        const legalFirstName = personalBankAccountDraft?.legalFirstName ?? privatePersonalDetails?.legalFirstName ?? existingData?.firstName ?? '';
        const legalLastName = personalBankAccountDraft?.legalLastName ?? privatePersonalDetails?.legalLastName ?? existingData?.lastName ?? '';

        const addressStreet = personalBankAccountDraft?.addressStreet ?? homeAddressDraft?.addressLine1 ?? street1 ?? existingData?.addressStreet ?? '';
        const addressStreet2 = personalBankAccountDraft?.addressStreet2 ?? homeAddressDraft?.addressLine2 ?? street2 ?? '';
        const addressCity = personalBankAccountDraft?.addressCity ?? homeAddressDraft?.city ?? currentAddress?.city ?? existingData?.addressCity ?? '';
        const addressState = personalBankAccountDraft?.addressState ?? homeAddressDraft?.state ?? currentAddress?.state ?? existingData?.addressState ?? '';
        const addressZipCode = personalBankAccountDraft?.addressZipCode ?? homeAddressDraft?.zipPostCode ?? currentAddress?.zip ?? existingData?.addressZipCode ?? '';

        const rawPhone = personalBankAccountDraft?.phoneNumber ?? privatePersonalDetails?.phoneNumber ?? existingData?.companyPhone ?? '';
        const parsed = parsePhoneNumber(rawPhone, {regionCode: CONST.COUNTRY.US});
        const phoneNumber = parsed.number?.significant ?? '';

        updatePersonalBankAccountInfo(personalBankAccount.bankAccountID, {
            legalFirstName,
            legalLastName,
            addressStreet,
            addressStreet2,
            addressCity,
            addressState,
            addressZipCode,
            phoneNumber,
        } as PersonalBankAccountForm);
    };
    const skipPageCandidates = getPageNamesForCompletedSteps(completedSteps);
    if (skipPageCandidates.length >= formPages.length) {
        Log.hmmm('[UpdatePersonalBankAccountPage] All steps already completed but user reached update flow', {bankAccountID});
    }
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
        clearPersonalBankAccountErrors();
        if (currentPageName === firstPageName) {
            exitFlow();
            return;
        }
        prevPage();
    };

    const handleNextPage = () => {
        clearPersonalBankAccountErrors();
        nextPage();
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
                onNext={handleNextPage}
                onMove={() => {}}
            />
            {!!errorMessage && (
                <FormHelpMessage
                    style={[styles.mh5, styles.mb5]}
                    isError
                    message={errorMessage}
                />
            )}
        </ScreenWrapper>
    );
}

UpdatePersonalBankAccountPage.displayName = 'UpdatePersonalBankAccountPage';

export default UpdatePersonalBankAccountPage;
export {getFirstPageName};
