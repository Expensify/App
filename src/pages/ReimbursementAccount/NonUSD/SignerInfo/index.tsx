import {Str} from 'expensify-common';
import type {ComponentType} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import Navigation from '@navigation/Navigation';
import getSignerDetailsAndSignerFilesForSignerInfo from '@pages/ReimbursementAccount/NonUSD/utils/getSignerDetailsAndSignerFilesForSignerInfo';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import DirectorsList from './DirectorsList';
import EnterEmail from './EnterEmail';
import HangTight from './HangTight';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import JobTitle from './substeps/JobTitle';
import Name from './substeps/Name';
import Occupation from './substeps/Occupation';
import UploadDocuments from './substeps/UploadDocuments';

type SignerInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;
};

type SignerDetailsFormProps = SubStepProps & {directorID?: string};
type DirectorDetailsFormProps = SubStepProps & {directorID?: string};

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
const SUBSTEP: Record<string, number> = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SUBSTEP;
const {OWNS_MORE_THAN_25_PERCENT, COMPANY_NAME} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const fullBodyContent: Array<ComponentType<SignerDetailsFormProps>> = [Name, JobTitle, Occupation, DateOfBirth, Address, UploadDocuments, Confirmation];
const userIsOwnerBodyContent: Array<ComponentType<SignerDetailsFormProps>> = [JobTitle, UploadDocuments, Confirmation];
const userIsOwnerCadBodyContent: Array<ComponentType<SignerDetailsFormProps>> = [UploadDocuments, Confirmation];
const directorDetailsBodyContent: Array<ComponentType<DirectorDetailsFormProps>> = [Name, JobTitle, Occupation];

function SignerInfo({onBackButtonPress, onSubmit}: SignerInfoProps) {
    const {translate} = useLocalize();

    const [directorKeys, setDirectorKeys] = useState<string[]>([]);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';
    const isUserOwner = reimbursementAccount?.achData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const companyName = reimbursementAccount?.achData?.corpay?.[COMPANY_NAME] ?? reimbursementAccountDraft?.[COMPANY_NAME] ?? '';
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? 0;
    const [currentSubStep, setCurrentSubStep] = useState<number>(SUBSTEP.IS_DIRECTOR);
    const [isUserDirector, setIsUserDirector] = useState(false);
    const [isAnyoneElseDirector, setIsAnyoneElseDirector] = useState(false);
    const [isEditingExistingDirector, setIsEditingExistingDirector] = useState(false);
    const [directorBeingModifiedID, setDirectorBeingModifiedID] = useState<string>(CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY);

    const submit = useCallback(() => {
        const {signerDetails, signerFiles} = getSignerDetailsAndSignerFilesForSignerInfo(reimbursementAccountDraft, account?.primaryLogin ?? '', directorKeys);

        if (currency === CONST.CURRENCY.AUD) {
            setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            BankAccounts.saveCorpayOnboardingDirectorInformation({
                inputs: JSON.stringify(signerDetails),
                ...signerFiles,
                bankAccountID,
                directorIDs: `${directorKeys.toString()}`,
            });
            onSubmit();
        }
    }, [account?.primaryLogin, bankAccountID, currency, directorKeys, onSubmit, reimbursementAccountDraft]);

    const submitSignerDetailsForm = () => {
        setCurrentSubStep(SUBSTEP.ARE_YOU_DIRECTOR);
    };

    const submitDirectorDetailsForm = () => {
        setIsAnyoneElseDirector(false);
        setCurrentSubStep(SUBSTEP.DIRECTORS_LIST);
        if (isEditingExistingDirector) {
            setIsEditingExistingDirector(false);
        }
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
    } = useSubStep<SignerDetailsFormProps>({bodyContent, startFrom: 0, onFinished: submitSignerDetailsForm});

    const {
        componentToRender: DirectorDetailsForm,
        isEditing: directorsBeingEditing,
        screenIndex: directorsScreenIndex,
        nextScreen: directorsNextScreen,
        prevScreen: directorsPrevScreen,
        moveTo: directorsMoveTo,
        resetScreenIndex: directorsResetScreenIndex,
    } = useSubStep<DirectorDetailsFormProps>({bodyContent: directorDetailsBodyContent, startFrom: 0, onFinished: submitDirectorDetailsForm});

    const prepareDirectorDetailsForm = useCallback(() => {
        const directorID = Str.guid();
        setDirectorBeingModifiedID(directorID);
        setDirectorKeys((currentKeys) => [...currentKeys, directorID]);
        directorsResetScreenIndex();
        setCurrentSubStep(SUBSTEP.DIRECTOR_DETAILS_FORM);
    }, [directorsResetScreenIndex]);

    const handleNextSubStep = useCallback(
        (value: boolean) => {
            if (currentSubStep === SUBSTEP.IS_DIRECTOR) {
                // user is director so we gather their data
                if (value) {
                    setIsUserDirector(value);
                    setDirectorKeys([CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY]);
                    setCurrentSubStep(SUBSTEP.SIGNER_DETAILS_FORM);
                    return;
                }

                setIsUserDirector(value);
                setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
                return;
            }

            if (currentSubStep === SUBSTEP.ARE_YOU_DIRECTOR) {
                if (value) {
                    // user selected "Yes" no need to collect anything else -> we should just submit the step
                    submit();
                    return;
                }

                setIsAnyoneElseDirector(value);
                prepareDirectorDetailsForm();
                return;
            }

            setIsUserDirector(value);
            setCurrentSubStep(SUBSTEP.ENTER_EMAIL);
        },
        [currentSubStep, prepareDirectorDetailsForm, submit],
    );

    const handleBackButtonPress = useCallback(() => {
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
        } else if (currentSubStep === SUBSTEP.DIRECTOR_DETAILS_FORM && directorsScreenIndex > 0) {
            directorsPrevScreen();
        } else if (currentSubStep === SUBSTEP.DIRECTOR_DETAILS_FORM && directorsScreenIndex === 0) {
            setCurrentSubStep(SUBSTEP.SIGNER_DETAILS_FORM);
        } else if (currentSubStep === SUBSTEP.HANG_TIGHT) {
            Navigation.goBack();
        } else {
            setCurrentSubStep((subStep) => subStep - 1);
        }
    }, [currentSubStep, directorsPrevScreen, directorsScreenIndex, goToTheLastStep, isEditing, isUserDirector, onBackButtonPress, prevScreen, screenIndex]);

    const handleDirectorEdit = useCallback((directorID: string) => {
        setDirectorBeingModifiedID(directorID);
        setIsEditingExistingDirector(true);
        setCurrentSubStep(SUBSTEP.DIRECTOR_DETAILS_FORM);
    }, []);

    const handleEmailSubmit = useCallback(() => {
        // TODO: the message to the email provided in the previous step should be sent
        setCurrentSubStep(SUBSTEP.HANG_TIGHT);
    }, []);

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

            {currentSubStep === SUBSTEP.ARE_YOU_DIRECTOR && (
                <YesNoStep
                    title="Are you a director?"
                    description="If you are not director, we need to collect additional information about at least one director in the company"
                    defaultValue={isAnyoneElseDirector}
                    onSelectedValue={handleNextSubStep}
                />
            )}

            {currentSubStep === SUBSTEP.SIGNER_DETAILS_FORM && (
                <SignerDetailsForm
                    isEditing={isEditing}
                    onNext={nextScreen}
                    onMove={moveTo}
                    directorID={directorBeingModifiedID}
                />
            )}

            {currentSubStep === SUBSTEP.DIRECTOR_DETAILS_FORM && (
                <DirectorDetailsForm
                    isEditing={directorsBeingEditing}
                    onNext={directorsNextScreen}
                    onMove={directorsMoveTo}
                    directorID={directorBeingModifiedID}
                />
            )}

            {currentSubStep === SUBSTEP.DIRECTORS_LIST && (
                <DirectorsList
                    directorKeys={directorKeys}
                    onConfirm={submit}
                    onEdit={handleDirectorEdit}
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
