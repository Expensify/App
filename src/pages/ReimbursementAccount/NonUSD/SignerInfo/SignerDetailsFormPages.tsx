import React, {useCallback} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import Navigation from '@libs/Navigation/Navigation';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Address from './subSteps/Address';
import Confirmation from './subSteps/Confirmation';
import DateOfBirth from './subSteps/DateOfBirth';
import JobTitle from './subSteps/JobTitle';
import Name from './subSteps/Name';
import UploadDocuments from './subSteps/UploadDocuments';

const {PAGE_NAME, SIGNER_INFO_STEP} = CONST.NON_USD_BANK_ACCOUNT;
const SUB_PAGE_NAMES = SIGNER_INFO_STEP.SUB_PAGE_NAMES;
const {OWNS_MORE_THAN_25_PERCENT} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const pages = [
    {pageName: SUB_PAGE_NAMES.NAME, component: Name},
    {pageName: SUB_PAGE_NAMES.JOB_TITLE, component: JobTitle},
    {pageName: SUB_PAGE_NAMES.DATE_OF_BIRTH, component: DateOfBirth},
    {pageName: SUB_PAGE_NAMES.ADDRESS, component: Address},
    {pageName: SUB_PAGE_NAMES.UPLOAD_DOCUMENTS, component: UploadDocuments},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: Confirmation},
];

type SignerDetailsFormPagesProps = {
    /** Callback to navigate back to IS_DIRECTOR step */
    onBackToIsDirector: () => void;

    /** Array of step names for the progress indicator */
    stepNames?: readonly string[];

    /** ID of current policy */
    policyID?: string;

    /** Callback triggered after the last form page is completed */
    onFinished: () => void;
};

function SignerDetailsFormPages({onBackToIsDirector, stepNames, policyID, onFinished}: SignerDetailsFormPagesProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const isUserOwner = reimbursementAccount?.achData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const skipPages: string[] = isUserOwner ? [SUB_PAGE_NAMES.NAME, SUB_PAGE_NAMES.DATE_OF_BIRTH, SUB_PAGE_NAMES.ADDRESS] : [];

    const buildRoute = useCallback(
        (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.SIGNER_INFO, subPage: pageName, action}),
        [policyID],
    );

    const {CurrentPage, isEditing, currentPageName, pageIndex, nextPage, prevPage, moveTo, isRedirecting} = useSubPage({
        pages,
        startFrom: 0,
        onFinished,
        buildRoute,
        skipPages,
    });

    const handleBackButtonPress = useCallback(() => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        if (isEditing) {
            Navigation.goBack(buildRoute(SUB_PAGE_NAMES.CONFIRMATION));
            return;
        }

        // Check if there is a visible (non-skipped) page before the current one
        let prevIndex = pageIndex - 1;
        while (prevIndex >= 0 && skipPages.includes(pages.at(prevIndex)?.pageName ?? '')) {
            prevIndex -= 1;
        }

        if (prevIndex < 0) {
            onBackToIsDirector();
        } else {
            prevPage();
        }
    }, [buildRoute, isEditing, onBackToIsDirector, pageIndex, prevPage, skipPages]);

    if (isRedirecting) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <InteractiveStepWrapper
            wrapperID="SignerInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('signerInfoStep.signerInfo')}
            stepNames={stepNames}
            startStepIndex={4}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
            />
        </InteractiveStepWrapper>
    );
}

export default SignerDetailsFormPages;
