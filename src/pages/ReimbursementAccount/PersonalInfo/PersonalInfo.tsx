import type {RefAttributes} from 'react';
import React, {forwardRef, useCallback, useMemo} from 'react';
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
import getInitialSubstepForPersonalInfo from '@pages/ReimbursementAccount/utils/getInitialSubstepForPersonalInfo';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import FullName from './substeps/FullName';
import SocialSecurityNumber from './substeps/SocialSecurityNumber';

type PersonalInfoOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};

type PersonalInfoProps = PersonalInfoOnyxProps & {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const bodyContent: Array<React.ComponentType<SubStepProps>> = [FullName, DateOfBirth, SocialSecurityNumber, Address, Confirmation];

function PersonalInfo({reimbursementAccount, reimbursementAccountDraft, onBackButtonPress}: PersonalInfoProps, ref: React.ForwardedRef<View>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = reimbursementAccount?.achData?.policyID;
    const values = useMemo(() => getSubstepValues(PERSONAL_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID);
    const submit = useCallback(
        (isConfirmPage: boolean) => {
            BankAccounts.updatePersonalInformationForBankAccount(bankAccountID, {...values}, policyID, isConfirmPage);
        },
        [values, bankAccountID, policyID],
    );
    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep({bodyContent, startFrom, onFinished: () => submit(true), onNextSubStep: () => submit(false)});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (screenIndex === 0) {
            onBackButtonPress();
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper
            ref={ref}
            testID={PersonalInfo.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('personalInfoStep.personalInfo')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={1}
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

PersonalInfo.displayName = 'PersonalInfo';

export default withOnyx<RefAttributes<View> & PersonalInfoProps, PersonalInfoOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(forwardRef(PersonalInfo));
