import {Str} from 'expensify-common';
import type {ComponentType} from 'react';
import React, {useEffect, useRef, useState} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getOwnerDetailsAndOwnerFilesForBeneficialOwners from '@pages/ReimbursementAccount/NonUSD/utils/getOwnerDetailsAndOwnerFilesForBeneficialOwners';
import {clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners, saveCorpayOnboardingBeneficialOwners} from '@userActions/BankAccounts';
import {clearErrors, setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import SafeString from '@src/utils/SafeString';
import Address from './BeneficialOwnerDetailsFormSubSteps/Address';
import Confirmation from './BeneficialOwnerDetailsFormSubSteps/Confirmation';
import DateOfBirth from './BeneficialOwnerDetailsFormSubSteps/DateOfBirth';
import Documents from './BeneficialOwnerDetailsFormSubSteps/Documents';
import Last4SSN from './BeneficialOwnerDetailsFormSubSteps/Last4SSN';
import Name from './BeneficialOwnerDetailsFormSubSteps/Name';
import Nationality from './BeneficialOwnerDetailsFormSubSteps/Nationality';
import OwnershipPercentage from './BeneficialOwnerDetailsFormSubSteps/OwnershipPercentage';
import BeneficialOwnersList from './BeneficialOwnersList';

type BeneficialOwnerInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Array of step names */
    stepNames?: readonly string[];
};

const {OWNS_MORE_THAN_25_PERCENT, ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE, BENEFICIAL_OWNERS, COMPANY_NAME} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const {NATIONALITY, PREFIX} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const SUBSTEP = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.SUBSTEP;

type BeneficialOwnerDetailsFormProps = SubStepProps & {
    ownerBeingModifiedID: string;
    setOwnerBeingModifiedID?: (id: string) => void;
    isUserEnteringHisOwnData: boolean;
    totalOwnedPercentage: Record<string, number>;
    setTotalOwnedPercentage: (ownedPercentage: Record<string, number>) => void;
};

const bodyContent: Array<ComponentType<BeneficialOwnerDetailsFormProps>> = [Name, Nationality, OwnershipPercentage, DateOfBirth, Address, Last4SSN, Documents, Confirmation];

function BeneficialOwnerInfo({onBackButtonPress, onSubmit, stepNames}: BeneficialOwnerInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: false});

    const [ownerKeys, setOwnerKeys] = useState<string[]>([]);
    const [ownerBeingModifiedID, setOwnerBeingModifiedID] = useState<string>(CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY);
    const [isEditingCreatedOwner, setIsEditingCreatedOwner] = useState(false);
    const [isUserEnteringHisOwnData, setIsUserEnteringHisOwnData] = useState(false);
    const [isUserOwner, setIsUserOwner] = useState(false);
    const [isAnyoneElseOwner, setIsAnyoneElseOwner] = useState(false);
    const [currentSubStep, setCurrentSubStep] = useState<number>(SUBSTEP.IS_USER_BENEFICIAL_OWNER);
    const previousSubStep = usePrevious(currentSubStep);
    const [totalOwnedPercentage, setTotalOwnedPercentage] = useState<Record<string, number>>({});
    const companyName = reimbursementAccount?.achData?.corpay?.[COMPANY_NAME] ?? reimbursementAccountDraft?.[COMPANY_NAME] ?? '';
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const isSubmittingRef = useRef(false);

    const totalOwnedPercentageSum = Object.values(totalOwnedPercentage).reduce((acc, value) => acc + value, 0);
    const canAddMoreOwners = totalOwnedPercentageSum <= 75;

    const submit = ({anyIndividualOwn25PercentOrMore}: {anyIndividualOwn25PercentOrMore?: boolean}) => {
        const {ownerDetails, ownerFiles} = getOwnerDetailsAndOwnerFilesForBeneficialOwners(ownerKeys, reimbursementAccountDraft);

        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {
            [OWNS_MORE_THAN_25_PERCENT]: isUserOwner,
            [ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE]: isAnyoneElseOwner,
            [BENEFICIAL_OWNERS]: JSON.stringify(ownerDetails),
        });

        isSubmittingRef.current = true;
        saveCorpayOnboardingBeneficialOwners({
            inputs: JSON.stringify({...ownerDetails, anyIndividualOwn25PercentOrMore}),
            ...ownerFiles,
            beneficialOwnerIDs: ownerKeys.length > 0 ? ownerKeys.join(',') : undefined,
            bankAccountID,
        });
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields || !reimbursementAccount?.isSuccess) {
            return;
        }

        if (reimbursementAccount?.isSuccess && isSubmittingRef.current) {
            isSubmittingRef.current = false;
            onSubmit();
            clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners();
        }

        return () => {
            clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners();
        };
    }, [reimbursementAccount?.errors, reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields, reimbursementAccount?.isSuccess, onSubmit]);

    const addOwner = (ownerID: string) => {
        const newOwners = [...ownerKeys, ownerID];

        setOwnerKeys(newOwners);
    };

    const handleOwnerDetailsFormSubmit = () => {
        const isFreshOwner = ownerKeys.find((ownerID) => ownerID === ownerBeingModifiedID) === undefined;

        if (isFreshOwner) {
            addOwner(ownerBeingModifiedID);
        }

        let nextSubStep;
        if (isEditingCreatedOwner || !canAddMoreOwners) {
            nextSubStep = SUBSTEP.BENEFICIAL_OWNERS_LIST;
        } else {
            nextSubStep = isUserEnteringHisOwnData ? SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER : SUBSTEP.ARE_THERE_MORE_BENEFICIAL_OWNERS;
        }

        setCurrentSubStep(nextSubStep);
        setIsEditingCreatedOwner(false);
    };

    const {
        componentToRender: BeneficialOwnerDetailsForm,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        resetScreenIndex,
        goToTheLastStep,
    } = useSubStep<BeneficialOwnerDetailsFormProps>({bodyContent, startFrom: 0, onFinished: handleOwnerDetailsFormSubmit});

    const prepareOwnerDetailsForm = () => {
        const ownerID = Str.guid();
        setOwnerBeingModifiedID(ownerID);
        resetScreenIndex();
        setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM);
    };

    const handleOwnerEdit = (ownerID: string) => {
        setOwnerBeingModifiedID(ownerID);
        setIsEditingCreatedOwner(true);
        setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM);
    };

    const countryStepCountryValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const beneficialOwnerNationalityInputID = `${PREFIX}_${ownerBeingModifiedID}_${NATIONALITY}` as const;
    const beneficialOwnerNationality = SafeString(reimbursementAccountDraft?.[beneficialOwnerNationalityInputID]);

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (currentSubStep === SUBSTEP.IS_USER_BENEFICIAL_OWNER) {
            onBackButtonPress();
        } else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && !canAddMoreOwners) {
            setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM);
        } else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && isAnyoneElseOwner) {
            setCurrentSubStep(SUBSTEP.ARE_THERE_MORE_BENEFICIAL_OWNERS);
        } else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && isUserOwner && !isAnyoneElseOwner) {
            setCurrentSubStep(SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER);
        } else if (currentSubStep === SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER) {
            setCurrentSubStep(SUBSTEP.IS_USER_BENEFICIAL_OWNER);
        } else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && screenIndex > 0) {
            if (screenIndex === 6) {
                // User is on documents sub step and is not from US (no SSN needed)
                if (beneficialOwnerNationality !== CONST.COUNTRY.US) {
                    moveTo(4, false);
                    return;
                }
            }

            if (screenIndex === 7) {
                // User is on confirmation screen and is GB (no SSN or documents needed)
                if (countryStepCountryValue === CONST.COUNTRY.GB && beneficialOwnerNationality === CONST.COUNTRY.GB) {
                    moveTo(4, false);
                    return;
                }
            }

            prevScreen();
        } else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && previousSubStep === SUBSTEP.IS_USER_BENEFICIAL_OWNER) {
            setCurrentSubStep(SUBSTEP.IS_USER_BENEFICIAL_OWNER);
        } else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && previousSubStep === SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER) {
            setCurrentSubStep(SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER);
        } else {
            setCurrentSubStep((subStep) => subStep - 1);
        }
    };

    const handleNextSubStep = (value: boolean) => {
        if (currentSubStep === SUBSTEP.IS_USER_BENEFICIAL_OWNER) {
            // User is owner so we gather his data
            if (value) {
                setIsUserOwner(value);
                setIsUserEnteringHisOwnData(value);
                setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM);
                return;
            }

            setIsUserOwner(value);
            setIsUserEnteringHisOwnData(value);
            setOwnerKeys((currentOwnersKeys) => currentOwnersKeys.filter((key) => key !== CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY));

            // User is an owner but there are 4 other owners already added, so we remove last one
            if (value && ownerKeys.length === 4) {
                setOwnerKeys((previousBeneficialOwners) => previousBeneficialOwners.slice(0, 3));
            }

            setCurrentSubStep(SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER);
            return;
        }

        if (currentSubStep === SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER) {
            setIsAnyoneElseOwner(value);
            setIsUserEnteringHisOwnData(false);

            // Someone else is an owner so we gather his data
            if (canAddMoreOwners && value) {
                prepareOwnerDetailsForm();
                return;
            }

            // User went back in the flow, but he cannot add more owners, so we send him back to owners list
            if (!canAddMoreOwners && value) {
                setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
                return;
            }

            // User is not an owner and no one else is an owner
            if (!isUserOwner && !value) {
                setOwnerKeys([]);
                submit({anyIndividualOwn25PercentOrMore: false});
                return;
            }

            // User is an owner and no one else is an owner
            if (isUserOwner && !value) {
                setOwnerKeys([CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY]);
                setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
                return;
            }
        }

        // Are there more UBOs
        if (currentSubStep === SUBSTEP.ARE_THERE_MORE_BENEFICIAL_OWNERS) {
            setIsUserEnteringHisOwnData(false);

            // User went back in the flow, but he cannot add more owners, so we send him back to owners list
            if (!canAddMoreOwners && value) {
                setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
                return;
            }

            // Gather data of another owner
            if (value) {
                setIsAnyoneElseOwner(true);
                prepareOwnerDetailsForm();
                return;
            }

            // No more owners and no need to gather entity chart, so we send user to owners list
            setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
            return;
        }

        // User reached the limit of UBOs
        if (currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && !canAddMoreOwners) {
            setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
        }
    };

    return (
        <InteractiveStepWrapper
            wrapperID="BeneficialOwnerInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('ownershipInfoStep.ownerInfo')}
            stepNames={stepNames}
            shouldShowOfflineIndicatorInWideScreen={currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST}
            startStepIndex={3}
        >
            {currentSubStep === SUBSTEP.IS_USER_BENEFICIAL_OWNER && (
                <YesNoStep
                    title={translate('ownershipInfoStep.doYouOwn', companyName)}
                    description={translate('ownershipInfoStep.regulationsRequire')}
                    defaultValue={isUserOwner}
                    onSelectedValue={handleNextSubStep}
                    isLoading={reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields}
                />
            )}

            {currentSubStep === SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER && (
                <YesNoStep
                    title={translate('ownershipInfoStep.doesAnyoneOwn', companyName)}
                    description={translate('ownershipInfoStep.regulationsRequire')}
                    defaultValue={isAnyoneElseOwner}
                    onSelectedValue={handleNextSubStep}
                    isLoading={reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields}
                />
            )}

            {currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && (
                <BeneficialOwnerDetailsForm
                    isEditing={isEditing}
                    onNext={nextScreen}
                    onMove={moveTo}
                    ownerBeingModifiedID={ownerBeingModifiedID}
                    setOwnerBeingModifiedID={setOwnerBeingModifiedID}
                    isUserEnteringHisOwnData={isUserEnteringHisOwnData}
                    totalOwnedPercentage={totalOwnedPercentage}
                    setTotalOwnedPercentage={setTotalOwnedPercentage}
                />
            )}

            {currentSubStep === SUBSTEP.ARE_THERE_MORE_BENEFICIAL_OWNERS && (
                <YesNoStep
                    title={translate('ownershipInfoStep.areThereOther', companyName)}
                    description={translate('ownershipInfoStep.regulationsRequire')}
                    defaultValue={false}
                    onSelectedValue={handleNextSubStep}
                    isLoading={reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields}
                />
            )}

            {currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && (
                <BeneficialOwnersList
                    handleConfirmation={submit}
                    handleOwnerEdit={handleOwnerEdit}
                    ownerKeys={ownerKeys}
                />
            )}
        </InteractiveStepWrapper>
    );
}

export default BeneficialOwnerInfo;
