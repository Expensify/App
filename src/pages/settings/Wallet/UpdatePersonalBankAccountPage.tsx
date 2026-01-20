import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatE164PhoneNumber} from '@libs/LoginUtils';
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

const bodyContent: Array<React.ComponentType<SubStepProps>> = [LegalName, Address, PhoneNumber, UpdatePersonalInfoConfirmation];

function UpdatePersonalBankAccountPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [personalBankAccountDraft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;

    const exitFlow = () => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET);
        clearPersonalBankAccount();
    };

    const submitPersonalInfo = () => {
        const finalPhoneNumber = personalBankAccountDraft?.phoneNumber ?? privatePersonalDetails?.phoneNumber ?? '';
        const accountData = {
            ...privatePersonalDetails,
            ...personalBankAccountDraft,
            phoneNumber: formatE164PhoneNumber(finalPhoneNumber, countryCode),
        };
        updatePersonalBankAccountInfo(accountData);
    };

    // getSkippedStepsPersonalInfo returns indices 1, 2, 3 (for a flow with an extra leading step)
    // Our flow is 0-indexed: 0=LegalName, 1=Address, 2=PhoneNumber, 3=Confirmation
    // Adjust by subtracting 1 from each returned index
    const skipSteps = getSkippedStepsPersonalInfo(privatePersonalDetails).map((step) => step - 1);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        moveTo,
        screenIndex,
        goToTheLastStep,
    } = useSubStep({
        bodyContent,
        skipSteps,
        onFinished: submitPersonalInfo,
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }
        if (screenIndex === 0) {
            Navigation.goBack();
            return;
        }
        prevScreen();
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
        <InteractiveStepWrapper
            wrapperID={UpdatePersonalBankAccountPage.displayName}
            headerTitle={translate('addPersonalBankAccount.updatePersonalInfo')}
            handleBackButtonPress={handleBackButtonPress}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

UpdatePersonalBankAccountPage.displayName = 'UpdatePersonalBankAccountPage';

export default UpdatePersonalBankAccountPage;
