import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountEnterSignerInfoNavigatorParamList} from '@navigation/types';

import {clearEnterSignerInformationFormSave, saveCorpayOnboardingDirectorInformation} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useCallback, useEffect} from 'react';

import Address from './subSteps/Address';
import Confirmation from './subSteps/Confirmation';
import DateOfBirth from './subSteps/DateOfBirth';
import JobTitle from './subSteps/JobTitle';
import Name from './subSteps/Name';
import UploadDocuments from './subSteps/UploadDocuments';
import getSignerDetailsAndSignerFiles from './utils/getSignerDetailsAndSignerFiles';

type EnterSignerInfoProps = PlatformStackScreenProps<ReimbursementAccountEnterSignerInfoNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_ENTER_SIGNER_INFO>;

type EnterSignerInfoFormSubPageProps = SubPageProps & {policyID: string};

const SUB_PAGE_NAMES = CONST.ENTER_SIGNER_INFO.SUB_PAGE_NAMES;

const pages = [
    {pageName: SUB_PAGE_NAMES.NAME, component: Name},
    {pageName: SUB_PAGE_NAMES.JOB_TITLE, component: JobTitle},
    {pageName: SUB_PAGE_NAMES.DATE_OF_BIRTH, component: DateOfBirth},
    {pageName: SUB_PAGE_NAMES.ADDRESS, component: Address},
    {pageName: SUB_PAGE_NAMES.UPLOAD_DOCUMENTS, component: UploadDocuments},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: Confirmation},
];

const confirmationIndex = pages.findIndex((page) => page.pageName === SUB_PAGE_NAMES.CONFIRMATION);

function EnterSignerInfo({route}: EnterSignerInfoProps) {
    const {translate} = useLocalize();
    const bankAccountID = Number(route.params.bankAccountID);
    const policyID = route.params.policyID;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [enterSignerInfoForm] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM);
    const [enterSignerInfoFormDraft] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM_DRAFT);

    const submit = useCallback(() => {
        const {signerDetails, signerFiles} = getSignerDetailsAndSignerFiles(enterSignerInfoFormDraft, account?.primaryLogin ?? '');

        saveCorpayOnboardingDirectorInformation({
            inputs: JSON.stringify(signerDetails),
            ...signerFiles,
            bankAccountID,
        });
    }, [account?.primaryLogin, bankAccountID, enterSignerInfoFormDraft]);

    const buildRoute = (pageName: string, action?: 'edit') =>
        ROUTES.BANK_ACCOUNT_ENTER_SIGNER_INFO.getRoute(policyID, route.params.bankAccountID, route.params.isCompleted === 'true', pageName, action);

    const {
        CurrentPage: EnterSignerInfoForm,
        isEditing,
        pageIndex,
        nextPage,
        prevPage,
        moveTo,
        isRedirecting,
    } = useSubPage<EnterSignerInfoFormSubPageProps>({pages, startFrom: 0, onFinished: submit, buildRoute});

    useEffect(() => {
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
            moveTo(confirmationIndex, false);
            return;
        }

        if (pageIndex > 0) {
            prevPage();
        } else {
            Navigation.goBack();
        }
    }, [isEditing, moveTo, pageIndex, prevPage]);

    if (isRedirecting) {
        return (
            <FullScreenLoadingIndicator
                shouldUseGoBackButton
                reasonAttributes={{context: 'EnterSignerInfo', isRedirecting}}
            />
        );
    }

    return (
        <InteractiveStepWrapper
            wrapperID="EnterSignerInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('signerInfoStep.signerInfo')}
        >
            <EnterSignerInfoForm
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                policyID={policyID}
            />
        </InteractiveStepWrapper>
    );
}

export default EnterSignerInfo;
