import React, {useEffect} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatE164PhoneNumber} from '@libs/LoginUtils';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import {clearPersonalBankAccount, updatePersonalBankAccountInfo} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Address from './InternationalDepositAccount/PersonalInfo/substeps/AddressStep';
import LegalName from './InternationalDepositAccount/PersonalInfo/substeps/LegalNameStep';
import PhoneNumber from './InternationalDepositAccount/PersonalInfo/substeps/PhoneNumberStep';
import getSkippedStepsPersonalInfo from './InternationalDepositAccount/PersonalInfo/utils/getSkippedStepsPersonalInfo';
import UpdatePersonalInfoConfirmation from './UpdatePersonalInfoConfirmation';

const PAGE_NAME = CONST.UPDATE_PERSONAL_BANK_ACCOUNT.PAGE_NAME;

const STEP_INDEX_TO_PAGE_NAME: string[] = [PAGE_NAME.LEGAL_NAME, PAGE_NAME.ADDRESS, PAGE_NAME.PHONE_NUMBER];

const formPages = [
    {pageName: PAGE_NAME.LEGAL_NAME, component: LegalName},
    {pageName: PAGE_NAME.ADDRESS, component: Address},
    {pageName: PAGE_NAME.PHONE_NUMBER, component: PhoneNumber},
    {pageName: PAGE_NAME.CONFIRM, component: UpdatePersonalInfoConfirmation},
];

function UpdatePersonalBankAccountPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [personalBankAccountDraft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);

    useEffect(() => clearPersonalBankAccount, []);

    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;

    const exitFlow = () => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET);
        clearPersonalBankAccount();
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

    const skipPages = getSkippedStepsPersonalInfo(privatePersonalDetails)
        .map((step) => STEP_INDEX_TO_PAGE_NAME.at(step - 1))
        .filter((name): name is string => !!name);

    const firstNonSkippedIndex = formPages.findIndex((p) => !skipPages.includes(p.pageName));

    const {CurrentPage, isEditing, currentPageName, prevPage, nextPage, moveTo, isRedirecting} = useSubPage({
        pages: formPages,
        onFinished: submitPersonalInfo,
        skipPages,
        startFrom: firstNonSkippedIndex >= 0 ? firstNonSkippedIndex : 0,
        buildRoute: (pageName, action) => ROUTES.SETTINGS_UPDATE_PERSONAL_BANK_ACCOUNT.getRoute(pageName, action),
    });

    if (isRedirecting) {
        return <FullScreenLoadingIndicator />;
    }

    const firstVisiblePage = formPages.at(firstNonSkippedIndex >= 0 ? firstNonSkippedIndex : 0);

    const handleBackButtonPress = () => {
        if (isEditing) {
            Navigation.goBack(ROUTES.SETTINGS_UPDATE_PERSONAL_BANK_ACCOUNT.getRoute(PAGE_NAME.CONFIRM));
            return;
        }
        if (currentPageName === firstVisiblePage?.pageName) {
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
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

UpdatePersonalBankAccountPage.displayName = 'UpdatePersonalBankAccountPage';

export default UpdatePersonalBankAccountPage;
