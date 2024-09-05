import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import * as BankAccounts from '@userActions/BankAccounts';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalBankAccountForm} from '@src/types/form';
import type {PersonalBankAccount, PlaidData} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SetupMethod from './SetupMethod';
import Confirmation from './substeps/ConfirmationStep';
import Plaid from './substeps/PlaidStep';

type AddPersonalBankAccountPageWithOnyxProps = {
    /** Contains plaid data */
    plaidData: OnyxEntry<PlaidData>;

    /** The details about the Personal bank account we are adding saved in Onyx */
    personalBankAccount: OnyxEntry<PersonalBankAccount>;

    /** The draft values of the bank account being setup */
    personalBankAccountDraft: OnyxEntry<PersonalBankAccountForm>;
};

const plaidSubsteps: Array<React.ComponentType<SubStepProps>> = [Plaid, Confirmation];

function AddBankAccount({personalBankAccount, plaidData, personalBankAccountDraft}: AddPersonalBankAccountPageWithOnyxProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const submit = useCallback(() => {
        const bankAccounts = plaidData?.bankAccounts ?? [];
        const selectedPlaidBankAccount = bankAccounts.find((bankAccount) => bankAccount.plaidAccountID === personalBankAccountDraft?.plaidAccountID);

        if (selectedPlaidBankAccount) {
            BankAccounts.addPersonalBankAccount(selectedPlaidBankAccount);
        }
    }, [personalBankAccountDraft?.plaidAccountID, plaidData?.bankAccounts]);

    const isSetupTypeChosen = personalBankAccountDraft?.setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent: plaidSubsteps, startFrom: 0, onFinished: submit});

    const exitFlow = (shouldContinue = false) => {
        const exitReportID = personalBankAccount?.exitReportID;
        const onSuccessFallbackRoute = personalBankAccount?.onSuccessFallbackRoute ?? '';

        if (exitReportID) {
            Navigation.dismissModal(exitReportID);
            return;
        }
        if (shouldContinue && onSuccessFallbackRoute) {
            PaymentMethods.continueSetup(onSuccessFallbackRoute);
            return;
        }
        Navigation.goBack();
    };

    const handleBackButtonPress = () => {
        if (!isSetupTypeChosen) {
            exitFlow();
            return;
        }
        if (screenIndex === 0) {
            BankAccounts.clearPersonalBankAccount();
            Wallet.updateCurrentStep(null);
            Navigation.goBack(ROUTES.SETTINGS_WALLET);
            return;
        }
        prevScreen();
    };

    return (
        <ScreenWrapper
            testID={AddBankAccount.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator
        >
            <HeaderWithBackButton
                shouldShowBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('bankAccount.addBankAccount')}
            />
            <View style={styles.flex1}>
                {isSetupTypeChosen ? (
                    <>
                        <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                            <InteractiveStepSubHeader
                                startStepIndex={0}
                                stepNames={CONST.WALLET.STEP_NAMES}
                            />
                        </View>
                        <SubStep
                            isEditing={isEditing}
                            onNext={nextScreen}
                            onMove={moveTo}
                        />
                    </>
                ) : (
                    <SetupMethod />
                )}
            </View>
        </ScreenWrapper>
    );
}

AddBankAccount.displayName = 'AddBankAccountPage';

export default function AddBankAccountOnyx(props: Omit<AddPersonalBankAccountPageWithOnyxProps, keyof AddPersonalBankAccountPageWithOnyxProps>) {
    const [plaidData, plaidDataMetadata] = useOnyx(ONYXKEYS.PLAID_DATA);
    const [personalBankAccount, personalBankAccountMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const [personalBankAccountDraft, personalBankAccountDraftMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);

    if (isLoadingOnyxValue(plaidDataMetadata, personalBankAccountMetadata, personalBankAccountDraftMetadata)) {
        return null;
    }

    return (
        <AddBankAccount
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            plaidData={plaidData}
            personalBankAccount={personalBankAccount}
            personalBankAccountDraft={personalBankAccountDraft}
        />
    );
}
