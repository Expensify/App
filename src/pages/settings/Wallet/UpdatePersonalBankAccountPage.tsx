import React, {useEffect} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatE164PhoneNumber} from '@libs/LoginUtils';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import {clearPersonalBankAccount, clearPersonalBankAccountErrors, updatePersonalBankAccountInfo} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import Address from './InternationalDepositAccount/PersonalInfo/substeps/AddressStep';
import LegalName from './InternationalDepositAccount/PersonalInfo/substeps/LegalNameStep';
import PhoneNumber from './InternationalDepositAccount/PersonalInfo/substeps/PhoneNumberStep';
import getSkippedStepsPersonalInfo from './InternationalDepositAccount/PersonalInfo/utils/getSkippedStepsPersonalInfo';

const PAGE_NAME = CONST.UPDATE_PERSONAL_BANK_ACCOUNT.PAGE_NAME;

const PAGE_NAMES: string[] = [PAGE_NAME.LEGAL_NAME, PAGE_NAME.ADDRESS, PAGE_NAME.PHONE_NUMBER];

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
    {pageName: PAGE_NAME.ADDRESS, component: Address},
    {pageName: PAGE_NAME.PHONE_NUMBER, component: DelayedPhoneNumber},
];

/**
 * Returns the first non-skipped page name for the update flow.
 */
function getFirstPageName(details?: Partial<PrivatePersonalDetails>): string {
    const skippedSteps = getSkippedStepsPersonalInfo(details);
    const skipPageNames = new Set(skippedSteps.map((step) => PAGE_NAMES.at(step - 1)).filter((name): name is string => !!name));
    const firstPage = PAGE_NAMES.find((name) => !skipPageNames.has(name));
    return firstPage ?? PAGE_NAME.LEGAL_NAME;
}

function UpdatePersonalBankAccountPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [personalBankAccountDraft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);

    useEffect(() => {
        clearPersonalBankAccountErrors();
        clearPersonalBankAccount();
        clearDraftValues(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
    }, []);

    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;
    const exitFlow = () => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET);
        clearPersonalBankAccount();
        clearDraftValues(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
    };

    const submitPersonalInfo = () => {
        const currentAddress = getCurrentAddress(privatePersonalDetails);
        const finalPhoneNumber = personalBankAccountDraft?.phoneNumber ?? privatePersonalDetails?.phoneNumber ?? '';
        const accountData = {
            legalFirstName: privatePersonalDetails?.legalFirstName,
            legalLastName: privatePersonalDetails?.legalLastName,
            addressStreet: currentAddress?.street,
            addressCity: currentAddress?.city,
            addressState: currentAddress?.state,
            addressZipCode: currentAddress?.zip,
            country: currentAddress?.country,
            ...personalBankAccountDraft,
            phoneNumber: formatE164PhoneNumber(finalPhoneNumber, countryCode),
        };
        updatePersonalBankAccountInfo(accountData);
    };

    const skippedSteps = getSkippedStepsPersonalInfo(privatePersonalDetails);
    const skipPages = skippedSteps.map((step) => PAGE_NAMES.at(step - 1)).filter((name): name is string => !!name);

    const firstPageName = getFirstPageName(privatePersonalDetails);
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
