import type {ForwardedRef} from 'react';
import React, {useCallback, useMemo} from 'react';
import type {View} from 'react-native';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getInitialSubStepForPersonalInfo from '@pages/ReimbursementAccount/USD/utils/getInitialSubStepForPersonalInfo';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {updatePersonalInformationForBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Address from './subSteps/Address';
import Confirmation from './subSteps/Confirmation';
import DateOfBirth from './subSteps/DateOfBirth';
import FullName from './subSteps/FullName';
import SocialSecurityNumber from './subSteps/SocialSecurityNumber';

type PersonalInfoProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
};

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const bodyContent: Array<React.ComponentType<SubStepProps>> = [FullName, DateOfBirth, SocialSecurityNumber, Address, Confirmation];

function PersonalInfo({onBackButtonPress, ref}: PersonalInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});

    const policyID = reimbursementAccount?.achData?.policyID;
    const values = useMemo(() => getSubStepValues(PERSONAL_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID);
    const submit = useCallback(
        (isConfirmPage: boolean) => {
            updatePersonalInformationForBankAccount(bankAccountID, {...values}, policyID, isConfirmPage);
        },
        [values, bankAccountID, policyID],
    );
    const isBankAccountVerifying = reimbursementAccount?.achData?.state === CONST.BANK_ACCOUNT.STATE.VERIFYING;
    const startFrom = useMemo(() => (isBankAccountVerifying ? 0 : getInitialSubStepForPersonalInfo(values)), [values, isBankAccountVerifying]);

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
        <InteractiveStepWrapper
            ref={ref}
            wrapperID="PersonalInfo"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('personalInfoStep.personalInfo')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={2}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

export default PersonalInfo;
