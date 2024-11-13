import type {ComponentType} from 'react';
import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import DirectorCheck from './DirectorCheck';
import EnterEmail from './EnterEmail';
import HangTight from './HangTight';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import JobTitle from './substeps/JobTitle';
import Name from './substeps/Name';
import UploadDocuments from './substeps/UploadDocuments';

type SignerInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;
};

type SignerDetailsFormProps = SubStepProps & {isSecondSigner: boolean};

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
const SUBSTEP: Record<string, number> = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SUBSTEP;
const {OWNS_MORE_THAN_25_PERCENT, COMPANY_NAME} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const bodyContent: Array<ComponentType<SignerDetailsFormProps>> = [Name, JobTitle, DateOfBirth, UploadDocuments, Confirmation];
const userIsOwnerBodyContent: Array<ComponentType<SignerDetailsFormProps>> = [JobTitle, UploadDocuments, Confirmation];

function SignerInfo({onBackButtonPress, onSubmit}: SignerInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const policyID = reimbursementAccount?.achData?.policyID ?? '-1';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';
    // TODO set this based on param from redirect or BE response
    const isSecondSigner = false;
    const isUserOwner = reimbursementAccount?.achData?.additionalData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const companyName = reimbursementAccount?.achData?.additionalData?.corpay?.[COMPANY_NAME] ?? reimbursementAccountDraft?.[COMPANY_NAME] ?? '';

    const [currentSubStep, setCurrentSubStep] = useState<number>(SUBSTEP.IS_DIRECTOR);
    const [isUserDirector, setIsUserDirector] = useState(false);

    const submit = () => {
        if (currency === CONST.CURRENCY.AUD) {
            setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
        } else {
            onSubmit();
        }
    };

    const handleNextSubStep = (value: boolean) => {
        if (currentSubStep !== SUBSTEP.IS_DIRECTOR) {
            return;
        }

        // user is director
        if (value) {
            setIsUserDirector(value);
            setCurrentSubStep(SUBSTEP.SIGNER_DETAILS_FORM);
            return;
        }

        setIsUserDirector(value);
        setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
    };

    const {
        componentToRender: SignerDetailsForm,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<SignerDetailsFormProps>({bodyContent: isUserOwner ? userIsOwnerBodyContent : bodyContent, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (currentSubStep === SUBSTEP.IS_DIRECTOR) {
            onBackButtonPress();
        } else if (currentSubStep === SUBSTEP.ENTER_EMAIL && isUserDirector) {
            setCurrentSubStep(SUBSTEP.SIGNER_DETAILS_FORM);
        } else if (currentSubStep === SUBSTEP.SIGNER_DETAILS_FORM && screenIndex > 0) {
            prevScreen();
        } else if (currentSubStep === SUBSTEP.SIGNER_DETAILS_FORM && screenIndex === 0) {
            setCurrentSubStep(SUBSTEP.IS_DIRECTOR);
        } else if (currentSubStep === SUBSTEP.HANG_TIGHT) {
            Navigation.goBack();
        } else {
            setCurrentSubStep((subStep) => subStep - 1);
        }
    };

    const handleEmailSubmit = () => {
        setCurrentSubStep(SUBSTEP.HANG_TIGHT);
    };

    return (
        <InteractiveStepWrapper
            wrapperID={SignerInfo.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('signerInfoStep.signerInfo')}
            stepNames={CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES}
            startStepIndex={4}
        >
            {currentSubStep === SUBSTEP.IS_DIRECTOR && (
                <DirectorCheck
                    title={translate('signerInfoStep.areYouDirector', {companyName})}
                    defaultValue={isUserDirector}
                    onSelectedValue={handleNextSubStep}
                />
            )}

            {currentSubStep === SUBSTEP.SIGNER_DETAILS_FORM && (
                <SignerDetailsForm
                    isEditing={isEditing}
                    onNext={nextScreen}
                    onMove={moveTo}
                    isSecondSigner={isSecondSigner}
                />
            )}

            {currentSubStep === SUBSTEP.ENTER_EMAIL && (
                <EnterEmail
                    onSubmit={handleEmailSubmit}
                    isUserDirector={isUserDirector}
                />
            )}

            {currentSubStep === SUBSTEP.HANG_TIGHT && <HangTight tempSubmit={onSubmit} />}
        </InteractiveStepWrapper>
    );
}

SignerInfo.displayName = 'SignerInfo';

export default SignerInfo;
