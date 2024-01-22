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
import type {ReimbursementAccount, ReimbursementAccountDraft} from '@src/types/onyx';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import FullName from './substeps/FullName';
import SocialSecurityNumber from './substeps/SocialSecurityNumber';

type PersonalInfoOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>;
};

type PersonalInfoProps = PersonalInfoOnyxProps & {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Exits flow and goes back to the workspace initial page */
    onCloseButtonPress: () => void;
};

const PERSONAL_INFO_STEP_KEYS = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;
const bodyContent: Array<React.ComponentType<SubStepProps>> = [FullName, DateOfBirth, SocialSecurityNumber, Address, Confirmation];

function PersonalInfo({reimbursementAccount, reimbursementAccountDraft, onBackButtonPress, onCloseButtonPress}: PersonalInfoProps, ref: React.ForwardedRef<View>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const values = useMemo(() => getSubstepValues(PERSONAL_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
    const submit = useCallback(() => {
        BankAccounts.updatePersonalInformationForBankAccount(bankAccountID, {...values});
    }, [values, bankAccountID]);
    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo, goToTheLastStep} = useSubStep({bodyContent, startFrom, onFinished: submit});

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
                onCloseButtonPress={onCloseButtonPress}
                shouldShowCloseButton
            />
            <View style={[styles.ph5, styles.mv3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={2}
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

export default withOnyx<PersonalInfoProps, PersonalInfoOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(forwardRef(PersonalInfo));
