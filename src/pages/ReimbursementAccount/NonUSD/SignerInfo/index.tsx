import {Str} from 'expensify-common';
import type {ComponentType} from 'react';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import Navigation from '@navigation/Navigation';
import getInitialSubStepForSignerInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForSignerInfoStep';
import getSignerDetailsAndSignerFilesForSignerInfo from '@pages/ReimbursementAccount/NonUSD/utils/getSignerDetailsAndSignerFilesForSignerInfo';
import {askForCorpaySignerInformation, clearReimbursementAccountSaveCorpayOnboardingDirectorInformation, saveCorpayOnboardingDirectorInformation} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import EnterEmail from './EnterEmail';
import HangTight from './HangTight';
import Address from './subSteps/Address';
import Confirmation from './subSteps/Confirmation';
import DateOfBirth from './subSteps/DateOfBirth';
import JobTitle from './subSteps/JobTitle';
import Name from './subSteps/Name';
import UploadDocuments from './subSteps/UploadDocuments';

type SignerInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Array of step names */
    stepNames?: readonly string[];
};

type EmailSubmitParams = {
    /** Signer email to send the reminder to */
    signerEmail: string;

    /** Optional second signer email to send the reminder to (only for AUD) */
    secondSignerEmail?: string;
};

type SignerDetailsFormProps = SubStepProps;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
const SUBSTEP: Record<string, number> = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SUBSTEP;
const {OWNS_MORE_THAN_25_PERCENT, COMPANY_NAME, SIGNER_EMAIL, SIGNER_FULL_NAME, SECOND_SIGNER_EMAIL} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const fullBodyContent: Array<ComponentType<SignerDetailsFormProps>> = [Name, JobTitle, DateOfBirth, Address, UploadDocuments, Confirmation];
const userIsOwnerBodyContent: Array<ComponentType<SignerDetailsFormProps>> = [JobTitle, UploadDocuments, Confirmation];

function SignerInfo({onBackButtonPress, onSubmit, stepNames}: SignerInfoProps) {
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const currency = policy?.outputCurrency ?? '';
    const isUserOwner = reimbursementAccount?.achData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const companyName = reimbursementAccount?.achData?.corpay?.[COMPANY_NAME] ?? reimbursementAccountDraft?.[COMPANY_NAME] ?? '';
    const savedSignerEmail = reimbursementAccount?.achData?.corpay?.[SIGNER_EMAIL];
    const savedSignerFullName = reimbursementAccount?.achData?.corpay?.[SIGNER_FULL_NAME];
    const savedSecondSignerEmail = reimbursementAccount?.achData?.corpay?.[SECOND_SIGNER_EMAIL];
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const initialSubStep = getInitialSubStepForSignerInfoStep(savedSignerEmail, savedSignerFullName, savedSecondSignerEmail, currency);
    const [currentSubStep, setCurrentSubStep] = useState<number>(initialSubStep);
    const [isUserDirector, setIsUserDirector] = useState(false);
    const primaryLogin = account?.primaryLogin ?? '';
    // Corpay does not accept emails with a "+" character and will not let us connect account at the end of whole flow
    const signerEmail = !isProduction ? Str.replaceAll(primaryLogin, '+', '') : primaryLogin;

    const submit = useCallback(() => {
        const {signerDetails, signerFiles} = getSignerDetailsAndSignerFilesForSignerInfo(reimbursementAccountDraft, signerEmail, isUserOwner);

        saveCorpayOnboardingDirectorInformation({
            inputs: JSON.stringify(signerDetails),
            ...signerFiles,
            bankAccountID,
        });
    }, [bankAccountID, isUserOwner, reimbursementAccountDraft, signerEmail]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isSavingCorpayOnboardingDirectorInformation || !reimbursementAccount?.isSuccess) {
            return;
        }

        if (reimbursementAccount?.isSuccess && currentSubStep !== SUBSTEP.HANG_TIGHT) {
            if (currency === CONST.CURRENCY.AUD) {
                setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
                clearReimbursementAccountSaveCorpayOnboardingDirectorInformation();
                return;
            }
            onSubmit();
            clearReimbursementAccountSaveCorpayOnboardingDirectorInformation();
        }

        return () => {
            clearReimbursementAccountSaveCorpayOnboardingDirectorInformation();
        };
    }, [reimbursementAccount?.errors, reimbursementAccount?.isSavingCorpayOnboardingDirectorInformation, reimbursementAccount?.isSuccess, onSubmit, currency, currentSubStep]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isAskingForCorpaySignerInformation || !reimbursementAccount?.isAskingForCorpaySignerInformationSuccess) {
            return;
        }

        if (reimbursementAccount?.isAskingForCorpaySignerInformationSuccess) {
            setCurrentSubStep(SUBSTEP.HANG_TIGHT);
        }
    }, [reimbursementAccount?.errors, reimbursementAccount?.isAskingForCorpaySignerInformation, reimbursementAccount?.isAskingForCorpaySignerInformationSuccess]);

    const bodyContent = useMemo(() => {
        if (isUserOwner) {
            return userIsOwnerBodyContent;
        }

        return fullBodyContent;
    }, [isUserOwner]);

    const {
        componentToRender: SignerDetailsForm,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<SignerDetailsFormProps>({bodyContent, startFrom: 0, onFinished: submit});

    const handleNextSubStep = useCallback(
        (value: boolean) => {
            if (currentSubStep === SUBSTEP.IS_DIRECTOR) {
                // user is director so we gather their data
                if (value) {
                    setIsUserDirector(value);
                    setCurrentSubStep(SUBSTEP.SIGNER_DETAILS_FORM);
                    return;
                }

                setIsUserDirector(value);
                setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
                return;
            }

            setIsUserDirector(value);
            setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
        },
        [currentSubStep],
    );

    const handleBackButtonPress = useCallback(() => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
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
        } else if (currentSubStep === SUBSTEP.ARE_YOU_DIRECTOR) {
            setCurrentSubStep(SUBSTEP.SIGNER_DETAILS_FORM);
        } else {
            setCurrentSubStep((subStep) => subStep - 1);
        }
    }, [currentSubStep, goToTheLastStep, isEditing, isUserDirector, onBackButtonPress, prevScreen, screenIndex]);

    const shouldSendOnlySecondSignerEmail = currency === CONST.CURRENCY.AUD && isUserDirector;

    const handleEmailSubmit = useCallback(
        (values: EmailSubmitParams) => {
            const params = shouldSendOnlySecondSignerEmail
                ? {
                      secondSignerEmail: values.secondSignerEmail,
                      policyID: String(policyID),
                      bankAccountID,
                  }
                : {
                      signerEmail: values.signerEmail,
                      secondSignerEmail: values.secondSignerEmail,
                      policyID: String(policyID),
                      bankAccountID,
                  };

            askForCorpaySignerInformation(params);
        },
        [bankAccountID, policyID, shouldSendOnlySecondSignerEmail],
    );

    return (
        <InteractiveStepWrapper
            wrapperID="SignerInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('signerInfoStep.signerInfo')}
            stepNames={stepNames}
            startStepIndex={4}
        >
            {currentSubStep === SUBSTEP.IS_DIRECTOR && (
                <YesNoStep
                    title={translate('signerInfoStep.areYouDirector', companyName)}
                    description={translate('signerInfoStep.regulationRequiresUs')}
                    defaultValue={isUserDirector}
                    onSelectedValue={handleNextSubStep}
                />
            )}

            {currentSubStep === SUBSTEP.SIGNER_DETAILS_FORM && (
                <SignerDetailsForm
                    isEditing={isEditing}
                    onNext={nextScreen}
                    onMove={moveTo}
                />
            )}

            {currentSubStep === SUBSTEP.ENTER_EMAIL && (
                <EnterEmail
                    onSubmit={handleEmailSubmit}
                    isUserDirector={isUserDirector}
                    isLoading={reimbursementAccount?.isAskingForCorpaySignerInformation}
                />
            )}

            {currentSubStep === SUBSTEP.HANG_TIGHT && (
                <HangTight
                    policyID={policyID}
                    bankAccountID={bankAccountID}
                />
            )}
        </InteractiveStepWrapper>
    );
}

export default SignerInfo;
