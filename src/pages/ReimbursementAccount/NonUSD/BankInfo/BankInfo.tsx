import type {ComponentType} from 'react';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AccountHolderDetails from './substeps/AccountHolderDetails';
import BankAccountDetails from './substeps/BankAccountDetails';
import Confirmation from './substeps/Confirmation';
import UploadStatement from './substeps/UploadStatement';
import type {BankInfoSubStepProps} from './types';

type BankInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;
};

function BankInfo({onBackButtonPress, onSubmit}: BankInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [corpayFields] = useOnyx(ONYXKEYS.CORPAY_FIELDS);
    const policyID = reimbursementAccount?.achData?.policyID ?? '-1';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';

    const submit = () => {
        onSubmit();
    };

    const bodyContent: Array<ComponentType<BankInfoSubStepProps>> =
        currency !== CONST.CURRENCY.AUD ? [BankAccountDetails, AccountHolderDetails, Confirmation] : [BankAccountDetails, AccountHolderDetails, UploadStatement, Confirmation];

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<BankInfoSubStepProps>({bodyContent, startFrom: 0, onFinished: submit});

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
            wrapperID={BankInfo.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('bankAccount.bankInfo')}
            stepNames={CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES}
            startStepIndex={1}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                corpayFields={corpayFields?.formFields}
            />
        </InteractiveStepWrapper>
    );
}

BankInfo.displayName = 'BankInfo';

export default BankInfo;
