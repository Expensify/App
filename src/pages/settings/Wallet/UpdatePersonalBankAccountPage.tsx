import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmationPage from '@components/ConfirmationPage';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompletedStepsForBankAccount} from '@libs/BankAccountUtils';
import Log from '@libs/Log';
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import Navigation from '@navigation/Navigation';
import {clearPersonalBankAccount, clearPersonalBankAccountErrors, updatePersonalBankAccountInfo} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList} from '@src/types/onyx';
import Address from './InternationalDepositAccount/PersonalInfo/substeps/AddressStep';
import LegalName from './InternationalDepositAccount/PersonalInfo/substeps/LegalNameStep';
import PhoneNumber from './InternationalDepositAccount/PersonalInfo/substeps/PhoneNumberStep';

const PAGE_NAME = CONST.UPDATE_PERSONAL_BANK_ACCOUNT.PAGE_NAME;

const PAGE_NAMES: string[] = [PAGE_NAME.LEGAL_NAME, PAGE_NAME.ADDRESS, PAGE_NAME.PHONE_NUMBER];

type SubmittedAddress = {
    addressStreet: string;
    addressStreet2: string;
    addressCity: string;
    addressState: string;
    addressZipCode: string;
    country: string | undefined;
};

function UpdateLegalName({isEditing, onNext, onMove}: SubStepProps) {
    return (
        <LegalName
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            enabledWhenOffline={false}
        />
    );
}
UpdateLegalName.displayName = 'UpdateLegalName';

function AddressWithDraft({isEditing, onNext, onMove}: SubStepProps) {
    return (
        <Address
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            shouldSaveDraft
            shouldHideCountrySelector
            enabledWhenOffline={false}
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
            enabledWhenOffline={false}
        />
    );
}
DelayedPhoneNumber.displayName = 'DelayedPhoneNumber';

const formPages = [
    {pageName: PAGE_NAME.LEGAL_NAME, component: UpdateLegalName},
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
    const [personalBankAccount, personalBankAccountResult] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;
    const bankAccountID = personalBankAccount?.bankAccountID;
    const isPersonalBankAccountLoaded = personalBankAccountResult.status === 'loaded';

    // Clear PERSONAL_BANK_ACCOUNT (bankAccountID, shouldShowSuccess, updateError) when the page unmounts.
    useEffect(
        () => () => {
            clearPersonalBankAccount();
        },
        [],
    );

    useEffect(() => {
        if (!isPersonalBankAccountLoaded || bankAccountID) {
            return;
        }

        Navigation.goBack(ROUTES.SETTINGS_WALLET);
    }, [isPersonalBankAccountLoaded, bankAccountID]);

    const completedSteps = bankAccountID ? getCompletedStepsForBankAccount(bankAccountList, bankAccountID) : [];

    const exitFlow = () => {
        clearPersonalBankAccount();
        clearDraftValues(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
        clearDraftValues(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM);
        Navigation.goBack(ROUTES.SETTINGS_WALLET);
    };

    const submitPersonalInfo = (finishData?: unknown) => {
        if (!personalBankAccount?.bankAccountID || personalBankAccount?.isLoading) {
            return;
        }

        // AddressStep forwards its form values via finishData so prefilled fields (e.g. auto-filled zip) aren't lost.
        const submittedAddress = finishData as SubmittedAddress | undefined;

        const existingData = bankAccountList?.[String(personalBankAccount.bankAccountID)]?.accountData?.additionalData;
        const currentAddress = getCurrentAddress(privatePersonalDetails);

        const legalFirstName = personalBankAccountDraft?.legalFirstName ?? privatePersonalDetails?.legalFirstName ?? existingData?.firstName ?? existingData?.legalFirstName ?? '';
        const legalLastName = personalBankAccountDraft?.legalLastName ?? privatePersonalDetails?.legalLastName ?? existingData?.lastName ?? existingData?.legalLastName ?? '';

        // Use a single complete source to avoid mixing partial data across sources.
        let addressStreet: string;
        let addressStreet2: string;
        let addressCity: string;
        let addressState: string;
        let addressZipCode: string;

        if (submittedAddress?.addressStreet) {
            addressStreet = submittedAddress.addressStreet;
            addressStreet2 = submittedAddress.addressStreet2;
            addressCity = submittedAddress.addressCity;
            addressState = submittedAddress.addressState;
            addressZipCode = submittedAddress.addressZipCode;
        } else if (homeAddressDraft?.addressLine1) {
            addressStreet = homeAddressDraft.addressLine1;
            addressStreet2 = homeAddressDraft.addressLine2 ?? '';
            addressCity = homeAddressDraft.city ?? '';
            addressState = homeAddressDraft.state ?? '';
            addressZipCode = homeAddressDraft.zipPostCode ?? '';
        } else if (existingData?.addressStreet && existingData?.addressCity && existingData?.addressState && existingData?.addressZipCode) {
            const [street1, street2] = getStreetLines(existingData.addressStreet);
            addressStreet = street1 ?? '';
            addressStreet2 = street2 ?? '';
            addressCity = existingData.addressCity;
            addressState = existingData.addressState;
            addressZipCode = existingData.addressZipCode;
        } else if (currentAddress) {
            const [street1, street2] = getStreetLines(currentAddress.street ?? currentAddress.addressLine1);
            addressStreet = street1 ?? '';
            addressStreet2 = street2 ?? currentAddress.street2 ?? currentAddress.addressLine2 ?? '';
            addressCity = currentAddress.city ?? '';
            addressState = currentAddress.state ?? '';
            addressZipCode = currentAddress.zip ?? currentAddress.zipPostCode ?? '';
        } else {
            addressStreet = '';
            addressStreet2 = '';
            addressCity = '';
            addressState = '';
            addressZipCode = '';
        }

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
        });
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

    const handleNextPage = (data?: unknown) => {
        clearPersonalBankAccountErrors();
        nextPage(data);
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
            {!!personalBankAccount?.updateError && (
                <DotIndicatorMessage
                    style={[styles.mh5, styles.mb3]}
                    messages={{error: translate(personalBankAccount.updateError)}}
                    type="error"
                />
            )}
        </ScreenWrapper>
    );
}

UpdatePersonalBankAccountPage.displayName = 'UpdatePersonalBankAccountPage';

export default UpdatePersonalBankAccountPage;
export {getFirstPageName};
