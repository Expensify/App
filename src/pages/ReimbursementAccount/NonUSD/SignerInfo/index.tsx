import type {ComponentType} from 'react';
import React, {useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import Navigation from '@navigation/Navigation';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
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

const fullBodyContent: Array<ComponentType<SignerDetailsFormProps>> = [Name, JobTitle, DateOfBirth, UploadDocuments, Confirmation];
const userIsOwnerBodyContent: Array<ComponentType<SignerDetailsFormProps>> = [JobTitle, UploadDocuments, Confirmation];
const userIsOwnerCadBodyContent: Array<ComponentType<SignerDetailsFormProps>> = [UploadDocuments, Confirmation];

const INPUT_KEYS = {
    SIGNER_FULL_NAME: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_FULL_NAME,
    SIGNER_DATE_OF_BIRTH: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_DATE_OF_BIRTH,
    SIGNER_JOB_TITLE: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_JOB_TITLE,
    SIGNER_EMAIL: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_EMAIL,
    SIGNER_COMPLETE_RESIDENTIAL_ADDRESS: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_COMPLETE_RESIDENTIAL_ADDRESS,
    SECOND_SIGNER_FULL_NAME: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_FULL_NAME,
    SECOND_SIGNER_DATE_OF_BIRTH: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_DATE_OF_BIRTH,
    SECOND_SIGNER_JOB_TITLE: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_JOB_TITLE,
    SECOND_SIGNER_EMAIL: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_EMAIL,
    SECOND_SIGNER_COMPLETE_RESIDENTIAL_ADDRESS: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SECOND_SIGNER_COMPLETE_RESIDENTIAL_ADDRESS,
    SIGNER_COPY_OF_ID: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_COPY_OF_ID,
    SIGNER_ADDRESS_PROOF: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_ADDRESS_PROOF,
    // SIGNER_CODICE_PROOF: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_CODICE_PROOF,
    SIGNER_PDS_AND_FSG: INPUT_IDS.ADDITIONAL_DATA.CORPAY.SIGNER_PDS_AND_FSG,
};

function SignerInfo({onBackButtonPress, onSubmit}: SignerInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const policyID = reimbursementAccount?.achData?.policyID ?? '-1';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';
    const onyxValues = useMemo(() => getSubstepValues(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? 0;

    // TODO set this based on param from redirect or BE response
    const isSecondSigner = false;
    const isUserOwner = reimbursementAccount?.achData?.additionalData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const companyName = reimbursementAccount?.achData?.additionalData?.corpay?.[COMPANY_NAME] ?? reimbursementAccountDraft?.[COMPANY_NAME] ?? '';

    const [currentSubStep, setCurrentSubStep] = useState<number>(SUBSTEP.IS_DIRECTOR);
    const [isUserDirector, setIsUserDirector] = useState(false);

    const country = reimbursementAccount?.achData?.additionalData?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';

    useEffect(() => {
        if (!country) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        BankAccounts.getCorpayOnboardingFields(country);
    }, [country]);

    const submit = () => {
        if (currency === CONST.CURRENCY.AUD) {
            setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            BankAccounts.saveCorpayOnboardingDirectorInformation(
                {
                    companyDirectors: [
                        {
                            signerFullName: onyxValues[INPUT_KEYS.SIGNER_FULL_NAME],
                            signerDateOfBirth: onyxValues[INPUT_KEYS.SIGNER_DATE_OF_BIRTH],
                            signerJobTitle: onyxValues[INPUT_KEYS.SIGNER_JOB_TITLE],
                            signerEmail: account?.primaryLogin ?? '',
                            signerCompleteResidentialAddress: onyxValues[INPUT_KEYS.SIGNER_COMPLETE_RESIDENTIAL_ADDRESS],
                        },
                    ],
                    copyOfID: onyxValues[INPUT_KEYS.SIGNER_COPY_OF_ID],
                    addressProof: onyxValues[INPUT_KEYS.SIGNER_ADDRESS_PROOF],
                    // TODO: uncomment when codiceProof is added to the form
                    // codiceProof: onyxValues[INPUT_KEYS.SIGNER_CODICE_PROOF],
                    pdsAndFSG: onyxValues[INPUT_KEYS.SIGNER_PDS_AND_FSG],
                },
                bankAccountID,
            );
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

    const bodyContent = useMemo(() => {
        if (isUserOwner) {
            if (currency === CONST.CURRENCY.CAD) {
                return userIsOwnerCadBodyContent;
            }

            return userIsOwnerBodyContent;
        }

        return fullBodyContent;
    }, [currency, isUserOwner]);

    const {
        componentToRender: SignerDetailsForm,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<SignerDetailsFormProps>({bodyContent, startFrom: 0, onFinished: submit});

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
        // TODO: the message to the email provided in the previous step should be sent
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
                <YesNoStep
                    title={translate('signerInfoStep.areYouDirector', {companyName})}
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
