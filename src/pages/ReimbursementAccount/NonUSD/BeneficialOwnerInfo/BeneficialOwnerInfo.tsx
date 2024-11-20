import {Str} from 'expensify-common';
import type {ComponentType} from 'react';
import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Address from './BeneficialOwnerDetailsFormSubSteps/Address';
import Confirmation from './BeneficialOwnerDetailsFormSubSteps/Confirmation';
import DateOfBirth from './BeneficialOwnerDetailsFormSubSteps/DateOfBirth';
import Last4SSN from './BeneficialOwnerDetailsFormSubSteps/Last4SSN';
import Name from './BeneficialOwnerDetailsFormSubSteps/Name';
import OwnershipPercentage from './BeneficialOwnerDetailsFormSubSteps/OwnershipPercentage';
import BeneficialOwnersList from './BeneficialOwnersList';
import UploadOwnershipChart from './UploadOwnershipChart';

type BeneficialOwnerInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;
};

const {OWNS_MORE_THAN_25_PERCENT, ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE, BENEFICIAL_OWNERS, COMPANY_NAME, ENTITY_CHART} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const {FIRST_NAME, LAST_NAME, OWNERSHIP_PERCENTAGE, DOB, SSN_LAST_4, STREET, CITY, STATE, ZIP_CODE, COUNTRY, PREFIX} =
    CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const SUBSTEP = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.SUBSTEP;

type BeneficialOwnerDetailsFormProps = SubStepProps & {
    ownerBeingModifiedID: string;
    setOwnerBeingModifiedID?: (id: string) => void;
    isUserEnteringHisOwnData: boolean;
    totalOwnedPercentage: Record<string, number>;
    setTotalOwnedPercentage: (ownedPercentage: Record<string, number>) => void;
};

const bodyContent: Array<ComponentType<BeneficialOwnerDetailsFormProps>> = [Name, OwnershipPercentage, DateOfBirth, Address, Last4SSN, Confirmation];

function BeneficialOwnerInfo({onBackButtonPress, onSubmit}: BeneficialOwnerInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const [ownerKeys, setOwnerKeys] = useState<string[]>([]);
    const [ownerBeingModifiedID, setOwnerBeingModifiedID] = useState<string>(CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.CURRENT_USER_KEY);
    const [isEditingCreatedOwner, setIsEditingCreatedOwner] = useState(false);
    const [isUserEnteringHisOwnData, setIsUserEnteringHisOwnData] = useState(false);
    const [isUserOwner, setIsUserOwner] = useState(false);
    const [isAnyoneElseOwner, setIsAnyoneElseOwner] = useState(false);
    const [currentSubStep, setCurrentSubStep] = useState<number>(SUBSTEP.IS_USER_BENEFICIAL_OWNER);
    const [totalOwnedPercentage, setTotalOwnedPercentage] = useState<Record<string, number>>({});
    const companyName = reimbursementAccount?.achData?.additionalData?.corpay?.[COMPANY_NAME] ?? reimbursementAccountDraft?.[COMPANY_NAME] ?? '';
    const entityChart = reimbursementAccount?.achData?.additionalData?.corpay?.[ENTITY_CHART] ?? reimbursementAccountDraft?.[ENTITY_CHART] ?? [];

    const policyID = reimbursementAccount?.achData?.policyID ?? '-1';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';
    const shouldAskForEntityChart = currency === CONST.CURRENCY.AUD;

    const totalOwnedPercentageSum = Object.values(totalOwnedPercentage).reduce((acc, value) => acc + value, 0);
    const canAddMoreOwners = totalOwnedPercentageSum <= 75;

    const submit = () => {
        const ownerFields = [FIRST_NAME, LAST_NAME, OWNERSHIP_PERCENTAGE, DOB, SSN_LAST_4, STREET, CITY, STATE, ZIP_CODE, COUNTRY];
        const owners = ownerKeys.map((ownerKey) =>
            ownerFields.reduce((acc, fieldName) => {
                acc[fieldName] = reimbursementAccountDraft ? reimbursementAccountDraft?.[`${PREFIX}_${ownerKey}_${fieldName}`] : undefined;
                return acc;
            }, {} as Record<string, string | undefined>),
        );

        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {
            [OWNS_MORE_THAN_25_PERCENT]: isUserOwner,
            [ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE]: isAnyoneElseOwner,
            [BENEFICIAL_OWNERS]: JSON.stringify(owners),
        });
        onSubmit();
    };

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
            nextSubStep = shouldAskForEntityChart && entityChart.length === 0 ? SUBSTEP.OWNERSHIP_CHART : SUBSTEP.BENEFICIAL_OWNERS_LIST;
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

    const handleOwnershipChartSubmit = () => {
        // TODO upload chart here in https://github.com/Expensify/App/issues/50906
        setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
    };

    const handleOwnershipChartEdit = () => {
        setCurrentSubStep(SUBSTEP.OWNERSHIP_CHART);
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (currentSubStep === SUBSTEP.IS_USER_BENEFICIAL_OWNER) {
            onBackButtonPress();
        } else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && !canAddMoreOwners) {
            if (shouldAskForEntityChart) {
                setCurrentSubStep(SUBSTEP.OWNERSHIP_CHART);
                return;
            }
            setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM);
        } else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && isAnyoneElseOwner) {
            setCurrentSubStep(SUBSTEP.ARE_THERE_MORE_BENEFICIAL_OWNERS);
        } else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && isUserOwner && !isAnyoneElseOwner) {
            if (shouldAskForEntityChart) {
                setCurrentSubStep(SUBSTEP.OWNERSHIP_CHART);
                return;
            }
            setCurrentSubStep(SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER);
        } else if (currentSubStep === SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER) {
            setCurrentSubStep(SUBSTEP.IS_USER_BENEFICIAL_OWNER);
        } else if (currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && screenIndex > 0) {
            prevScreen();
        } else if (currentSubStep === SUBSTEP.OWNERSHIP_CHART && canAddMoreOwners) {
            if (ownerKeys.length === 0) {
                setCurrentSubStep(SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER);
                return;
            }
            setCurrentSubStep(SUBSTEP.ARE_THERE_MORE_BENEFICIAL_OWNERS);
        } else if (currentSubStep === SUBSTEP.OWNERSHIP_CHART && !canAddMoreOwners) {
            setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM);
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
            setOwnerKeys((currentOwnersKeys) => currentOwnersKeys.filter((key) => key !== CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.CURRENT_USER_KEY));

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

                // Gather ownership chart if AUD account
                if (shouldAskForEntityChart) {
                    setCurrentSubStep(SUBSTEP.OWNERSHIP_CHART);
                    return;
                }

                // Otherwise submit whole form and go to Signer Info
                submit();
                return;
            }

            // User is an owner and no one else is an owner
            if (isUserOwner && !value) {
                setOwnerKeys([CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.CURRENT_USER_KEY]);
                // Gather ownership chart if AUD account
                if (shouldAskForEntityChart) {
                    setCurrentSubStep(SUBSTEP.OWNERSHIP_CHART);
                    return;
                }

                // Otherwise send to the list of owners
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

            // No more owners but we should gather entity chart
            if (shouldAskForEntityChart) {
                setCurrentSubStep(SUBSTEP.OWNERSHIP_CHART);
                return;
            }

            // No more owners and no need to gather entity chart, so we send user to owners list
            setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
            return;
        }

        // User reached the limit of UBOs
        if (currentSubStep === SUBSTEP.BENEFICIAL_OWNER_DETAILS_FORM && !canAddMoreOwners) {
            // Gather ownership chart if AUD account
            if (shouldAskForEntityChart) {
                setCurrentSubStep(SUBSTEP.OWNERSHIP_CHART);
                return;
            }

            // Otherwise go to the list of owners
            setCurrentSubStep(SUBSTEP.BENEFICIAL_OWNERS_LIST);
        }
    };

    return (
        <InteractiveStepWrapper
            wrapperID={BeneficialOwnerInfo.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('ownershipInfoStep.ownerInfo')}
            stepNames={CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES}
            startStepIndex={3}
        >
            {currentSubStep === SUBSTEP.IS_USER_BENEFICIAL_OWNER && (
                <YesNoStep
                    title={translate('ownershipInfoStep.doYouOwn', {companyName})}
                    description={translate('ownershipInfoStep.regulationsRequire')}
                    defaultValue={isUserOwner}
                    onSelectedValue={handleNextSubStep}
                />
            )}

            {currentSubStep === SUBSTEP.IS_ANYONE_ELSE_BENEFICIAL_OWNER && (
                <YesNoStep
                    title={translate('ownershipInfoStep.doesAnyoneOwn', {companyName})}
                    description={translate('ownershipInfoStep.regulationsRequire')}
                    defaultValue={isAnyoneElseOwner}
                    onSelectedValue={handleNextSubStep}
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
                    title={translate('ownershipInfoStep.areThereOther', {companyName})}
                    description={translate('ownershipInfoStep.regulationsRequire')}
                    defaultValue={false}
                    onSelectedValue={handleNextSubStep}
                />
            )}

            {currentSubStep === SUBSTEP.OWNERSHIP_CHART && <UploadOwnershipChart onSubmit={handleOwnershipChartSubmit} />}

            {currentSubStep === SUBSTEP.BENEFICIAL_OWNERS_LIST && (
                <BeneficialOwnersList
                    handleConfirmation={submit}
                    handleOwnerEdit={handleOwnerEdit}
                    handleOwnershipChartEdit={handleOwnershipChartEdit}
                    ownerKeys={ownerKeys}
                />
            )}
        </InteractiveStepWrapper>
    );
}

BeneficialOwnerInfo.displayName = 'BeneficialOwnerInfo';

export default BeneficialOwnerInfo;
