import React, {useCallback, useEffect} from 'react';
import type {ComponentType} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountEnterSignerInfoNavigatorParamList} from '@navigation/types';
import {clearEnterSignerInformationFormSave, saveCorpayOnboardingDirectorInformation} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import Address from './subSteps/Address';
import Confirmation from './subSteps/Confirmation';
import DateOfBirth from './subSteps/DateOfBirth';
import JobTitle from './subSteps/JobTitle';
import Name from './subSteps/Name';
import UploadDocuments from './subSteps/UploadDocuments';
import getSignerDetailsAndSignerFiles from './utils/getSignerDetailsAndSignerFiles';

type EnterSignerInfoProps = PlatformStackScreenProps<ReimbursementAccountEnterSignerInfoNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_ENTER_SIGNER_INFO>;

type EnterSignerInfoFormSubStepProps = SubStepProps & {policyID: string};

const bodyContent: Array<ComponentType<EnterSignerInfoFormSubStepProps>> = [Name, JobTitle, DateOfBirth, Address, UploadDocuments, Confirmation];

function EnterSignerInfo({route}: EnterSignerInfoProps) {
    const {translate} = useLocalize();
    const bankAccountID = Number(route.params.bankAccountID);
    const policyID = route.params.policyID;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [enterSignerInfoForm] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM, {canBeMissing: true});
    const [enterSignerInfoFormDraft] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM_DRAFT, {canBeMissing: true});

    const submit = useCallback(() => {
        const {signerDetails, signerFiles} = getSignerDetailsAndSignerFiles(enterSignerInfoFormDraft, account?.primaryLogin ?? '');

        saveCorpayOnboardingDirectorInformation({
            inputs: JSON.stringify(signerDetails),
            ...signerFiles,
            bankAccountID,
        });
    }, [account?.primaryLogin, bankAccountID, enterSignerInfoFormDraft]);

    const {
        componentToRender: EnterSignerInfoForm,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<EnterSignerInfoFormSubStepProps>({bodyContent, startFrom: 0, onFinished: submit});

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (enterSignerInfoForm?.errors || enterSignerInfoForm?.isSavingSignerInformation || !enterSignerInfoForm?.isSuccess) {
            return;
        }

        if (enterSignerInfoForm?.isSuccess) {
            clearEnterSignerInformationFormSave();
            Navigation.closeRHPFlow();
        }

        return () => {
            clearEnterSignerInformationFormSave();
        };
    }, [enterSignerInfoForm?.errors, enterSignerInfoForm?.isSavingSignerInformation, enterSignerInfoForm?.isSuccess]);

    useEffect(() => {
        return clearErrors(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM);
    }, []);

    const handleBackButtonPress = useCallback(() => {
        clearErrors(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM);
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (screenIndex > 0) {
            prevScreen();
        } else {
            Navigation.goBack();
        }
    }, [goToTheLastStep, isEditing, prevScreen, screenIndex]);

    return (
        <InteractiveStepWrapper
            wrapperID={EnterSignerInfo.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('signerInfoStep.signerInfo')}
        >
            <EnterSignerInfoForm
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                policyID={policyID}
            />
        </InteractiveStepWrapper>
    );
}

EnterSignerInfo.displayName = 'EnterSignerInfo';

export default EnterSignerInfo;
