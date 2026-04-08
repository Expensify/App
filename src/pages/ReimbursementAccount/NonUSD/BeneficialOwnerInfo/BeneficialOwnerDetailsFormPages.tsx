import React, {useCallback, useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';
import Navigation from '@libs/Navigation/Navigation';
import {clearErrors, setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

const {PAGE_NAME, BENEFICIAL_OWNER_INFO_STEP} = CONST.NON_USD_BANK_ACCOUNT;
const SUB_PAGE_NAMES = BENEFICIAL_OWNER_INFO_STEP.SUB_PAGE_NAMES;
const {OWNERSHIP_PERCENTAGE, NATIONALITY, PREFIX} = BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

type BeneficialOwnerSubPageProps = SubPageProps & {
    ownerBeingModifiedID: string;
    isUserEnteringHisOwnData: boolean;
    totalOwnedPercentage: Record<string, number>;
};

const pages = [
    {pageName: SUB_PAGE_NAMES.NAME, component: Name},
    {pageName: SUB_PAGE_NAMES.NATIONALITY, component: Nationality},
    {pageName: SUB_PAGE_NAMES.OWNERSHIP_PERCENTAGE, component: OwnershipPercentage},
    {pageName: SUB_PAGE_NAMES.DATE_OF_BIRTH, component: DateOfBirth},
    {pageName: SUB_PAGE_NAMES.ADDRESS, component: Address},
    {pageName: SUB_PAGE_NAMES.LAST_4_SSN, component: Last4SSN},
    {pageName: SUB_PAGE_NAMES.DOCUMENTS, component: Documents},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: Confirmation},
];

type BeneficialOwnerDetailsFormPagesProps = {
    /** Array of step names for the progress indicator */
    stepNames?: readonly string[];

    /** ID of current policy */
    policyID?: string;

    /** Callback triggered after the last form page is completed */
    onFinished: () => void;

    /** Optional route name to navigate back to after flow completion - will be removed after https://github.com/Expensify/App/issues/73825 is done */
    backTo?: string;
};

function BeneficialOwnerDetailsFormPages({stepNames, policyID, onFinished, backTo}: BeneficialOwnerDetailsFormPagesProps) {
    const {translate} = useLocalize();
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const ownerBeingModifiedID = reimbursementAccountDraft?.ownerBeingModifiedID ?? CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY;
    const isUserEnteringHisOwnData = ownerBeingModifiedID === CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY;
    const isEditingCreatedOwner = reimbursementAccountDraft?.isEditingCreatedOwner ?? false;
    const ownerKeys = reimbursementAccountDraft?.beneficialOwnerKeys ?? [];

    const beneficialOwnerNationalityInputID = `${PREFIX}_${ownerBeingModifiedID}_${NATIONALITY}` as const;
    const beneficialOwnerNationality = SafeString(reimbursementAccountDraft?.[beneficialOwnerNationalityInputID]);
    const countryStepCountryValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';

    const totalOwnedPercentage = Object.fromEntries(
        ownerKeys.map((key) => {
            const percentageKey = `${PREFIX}_${key}_${OWNERSHIP_PERCENTAGE}` as const;
            return [key, Number(SafeString(reimbursementAccountDraft?.[percentageKey])) || 0];
        }),
    );

    const skipPages = useMemo(() => {
        const pagesToSkip: string[] = [];
        if (beneficialOwnerNationality !== CONST.COUNTRY.US) {
            pagesToSkip.push(SUB_PAGE_NAMES.LAST_4_SSN);
        }
        if (countryStepCountryValue === CONST.COUNTRY.GB && beneficialOwnerNationality === CONST.COUNTRY.GB) {
            pagesToSkip.push(SUB_PAGE_NAMES.DOCUMENTS);
        }
        return pagesToSkip;
    }, [beneficialOwnerNationality, countryStepCountryValue]);

    const buildRoute = useCallback(
        (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: pageName, action, backTo}),
        [policyID, backTo],
    );

    const {CurrentPage, isEditing, currentPageName, pageIndex, prevPage, nextPage, moveTo, isRedirecting} = useSubPage<BeneficialOwnerSubPageProps>({
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

        let prevIndex = pageIndex - 1;
        while (prevIndex >= 0 && skipPages.includes(pages.at(prevIndex)?.pageName ?? '')) {
            prevIndex -= 1;
        }

        if (prevIndex < 0) {
            if (isEditingCreatedOwner) {
                setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {isEditingCreatedOwner: false});
                Navigation.goBack(buildRoute(SUB_PAGE_NAMES.BENEFICIAL_OWNERS_LIST));
            } else {
                Navigation.goBack(buildRoute(SUB_PAGE_NAMES.IS_USER_BENEFICIAL_OWNER));
            }
        } else {
            prevPage();
        }
    }, [buildRoute, isEditing, isEditingCreatedOwner, pageIndex, prevPage, skipPages]);

    if (isRedirecting) {
        return <FullScreenLoadingIndicator reasonAttributes={{context: 'BeneficialOwnerDetailsFormPages', isRedirecting}} />;
    }

    return (
        <InteractiveStepWrapper
            wrapperID="BeneficialOwnerInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('ownershipInfoStep.ownerInfo')}
            stepNames={stepNames}
            startStepIndex={3}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
                ownerBeingModifiedID={ownerBeingModifiedID}
                isUserEnteringHisOwnData={isUserEnteringHisOwnData}
                totalOwnedPercentage={totalOwnedPercentage}
            />
        </InteractiveStepWrapper>
    );
}

export default BeneficialOwnerDetailsFormPages;
