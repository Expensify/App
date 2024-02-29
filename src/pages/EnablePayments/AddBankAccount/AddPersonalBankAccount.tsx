// import React, {useCallback, useEffect, useMemo, useState} from 'react';
// import {View} from 'react-native';
// import type {OnyxEntry} from 'react-native-onyx';
// import {withOnyx} from 'react-native-onyx';
// import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
// import FormProvider from '@components/Form/FormProvider';
// import HeaderWithBackButton from '@components/HeaderWithBackButton';
// import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
// import ScreenWrapper from '@components/ScreenWrapper';
// import useLocalize from '@hooks/useLocalize';
// import useSubStep from '@hooks/useSubStep';
// import type {SubStepProps} from '@hooks/useSubStep/types';
// import useThemeStyles from '@hooks/useThemeStyles';
// import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
// import Navigation from '@navigation/Navigation';
// import ChooseMethod from '@pages/EnablePayments/AddBankAccount/substeps/ChooseMethod';
// import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
// import * as BankAccounts from '@userActions/BankAccounts';
// import * as ReimbursementAccountUtils from '@userActions/ReimbursementAccount';
// import CONST from '@src/CONST';
// import ONYXKEYS from '@src/ONYXKEYS';
// import type {ReimbursementAccountForm} from '@src/types/form';
// import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
// import type {ReimbursementAccount} from '@src/types/onyx';
// import Confirmation from './substeps/Confirmation';
// import Manual from './substeps/Manual';
// import Plaid from './substeps/Plaid';
//
// type BankInfoOnyxProps = {
//     /** Plaid SDK token to use to initialize the widget */
//     plaidLinkToken: OnyxEntry<string>;
//
//     /** Reimbursement account from ONYX */
//     reimbursementAccount: OnyxEntry<ReimbursementAccount>;
//
//     /** The draft values of the bank account being setup */
//     reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
//
//     policyID: string;
// };
//
// type BankInfoProps = BankInfoOnyxProps & {
//     /** Goes to the previous step */
//     onBackButtonPress: () => void;
// };
//
// const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
// const plaidSubsteps: Array<React.ComponentType<SubStepProps>> = [Plaid, Confirmation];
// const receivedRedirectURI = getPlaidOAuthReceivedRedirectURI();
//
// function AddPersonalBankAccount({onBackButtonPress, plaidData}) {
//     const {translate} = useLocalize();
//     const styles = useThemeStyles();
//
//     const [selectedPlaidAccountId, setSelectedPlaidAccountId] = useState('');
//     const [isMethodChosen, setIsMethodChosen] = useState(false);
//
//     const validateBankAccountForm = () => ({});
//
//     const submitBankAccountForm = useCallback(() => {
//         const bankAccounts = plaidData?.bankAccounts ?? [];
//         const selectedPlaidBankAccount = bankAccounts.find((bankAccount) => bankAccount.plaidAccountID === selectedPlaidAccountId);
//
//         if (selectedPlaidBankAccount) {
//             BankAccounts.addPersonalBankAccount(selectedPlaidBankAccount);
//         }
//     }, [plaidData, selectedPlaidAccountId]);
//
//     return (
//         <ScreenWrapper
//             testID={AddPersonalBankAccount.displayName}
//             includeSafeAreaPaddingBottom={false}
//             shouldEnablePickerAvoiding={false}
//         >
//             <HeaderWithBackButton
//                 shouldShowBackButton
//                 onBackButtonPress={onBackButtonPress}
//                 title={translate('bankAccount.addBankAccount')}
//             />
//             <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
//                 <InteractiveStepSubHeader
//                     startStepIndex={0}
//                     stepNames={CONST.BANK_ACCOUNT.STEP_NAMES.slice(0, 4)}
//                 />
//             </View>
//             {isMethodChosen ? (
//                 <ChooseMethod onNext={() => setIsMethodChosen(true)} />
//             ) : (
//                 <FormProvider
//                     formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT}
//                     isSubmitButtonVisible={Boolean(selectedPlaidAccountId)}
//                     submitButtonText={translate('common.saveAndContinue')}
//                     scrollContextEnabled
//                     onSubmit={submitBankAccountForm}
//                     validate={() => {}}
//                     style={[styles.mh5, styles.flex1]}
//                 >
//                     <AddPlaidBankAccount
//                         onSelect={setSelectedPlaidAccountId}
//                         plaidData={plaidData}
//                         onExitPlaid={() => Navigation.goBack()}
//                         receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
//                         selectedPlaidAccountID={selectedPlaidAccountId}
//                         isDisplayedInNewVBBA
//                     />
//                 </FormProvider>
//             )}
//         </ScreenWrapper>
//     );
// }
//
// AddPersonalBankAccount.displayName = 'AddPersonalBankAccount';
//
// export default withOnyx<BankInfoProps, BankInfoOnyxProps>({
//     // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
//     reimbursementAccount: {
//         key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
//     },
//     reimbursementAccountDraft: {
//         key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
//     },
//     plaidLinkToken: {
//         key: ONYXKEYS.PLAID_LINK_TOKEN,
//     },
//     plaidData: {
//         key: ONYXKEYS.PLAID_DATA,
//     }
// })(AddPersonalBankAccount);

import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';
import Confirmation from './substeps/Confirmation';
import Plaid from './substeps/Plaid';
import ChooseMethod from "@pages/EnablePayments/AddBankAccount/substeps/ChooseMethod";

type BankInfoOnyxProps = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: OnyxEntry<string>;

    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;

    policyID: string;
};

type BankInfoProps = BankInfoOnyxProps & {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const plaidSubsteps: Array<React.ComponentType<SubStepProps>> = [ChooseMethod, Plaid, Confirmation];

function AddPersonalBankAccount({reimbursementAccount, reimbursementAccountDraft, plaidLinkToken, onBackButtonPress, policyID}: BankInfoProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
    const submit = useCallback(() => {
    }, [ bankAccountID, policyID]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent: plaidSubsteps, startFrom: 0, onFinished: submit});


    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            if (bankAccountID) {
                onBackButtonPress();
            } else {
            }
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper
            testID={AddPersonalBankAccount.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('bankAccount.bankInfo')}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={0}
                    stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

AddPersonalBankAccount.displayName = 'AddPersonalBankAccount';

export default withOnyx<BankInfoProps, BankInfoOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
    plaidLinkToken: {
        key: ONYXKEYS.PLAID_LINK_TOKEN,
    },
    personalBankAccount: {
        key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
    },
    plaidData: {
        key: ONYXKEYS.PLAID_DATA,
    },
})(AddPersonalBankAccount);

