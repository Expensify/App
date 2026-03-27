import React, {useCallback} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import AddressUBO from './subSteps/BeneficialOwnerDetailsFormSubSteps/AddressUBO';
import ConfirmationUBO from './subSteps/BeneficialOwnerDetailsFormSubSteps/ConfirmationUBO';
import DateOfBirthUBO from './subSteps/BeneficialOwnerDetailsFormSubSteps/DateOfBirthUBO';
import LegalNameUBO from './subSteps/BeneficialOwnerDetailsFormSubSteps/LegalNameUBO';
import SocialSecurityNumberUBO from './subSteps/BeneficialOwnerDetailsFormSubSteps/SocialSecurityNumberUBO';

const PAGE_NAMES = CONST.BANK_ACCOUNT.PAGE_NAMES;
const SUB_PAGE_NAMES = CONST.BANK_ACCOUNT.BENEFICIAL_OWNERS_STEP.SUB_PAGE_NAMES;

type BeneficialOwnerSubPageProps = SubPageProps & {
    beneficialOwnerBeingModifiedID: string;
    setBeneficialOwnerBeingModifiedID?: (id: string) => void;
};

const pages = [
    {pageName: SUB_PAGE_NAMES.LEGAL_NAME, component: LegalNameUBO},
    {pageName: SUB_PAGE_NAMES.DATE_OF_BIRTH, component: DateOfBirthUBO},
    {pageName: SUB_PAGE_NAMES.SSN, component: SocialSecurityNumberUBO},
    {pageName: SUB_PAGE_NAMES.ADDRESS, component: AddressUBO},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: ConfirmationUBO},
];

type BeneficialOwnerDetailsFormPagesProps = {
    /** ID of current policy */
    policyID?: string;

    /** ID of the beneficial owner being modified */
    beneficialOwnerBeingModifiedID: string;

    /** Setter for the beneficial owner being modified */
    setBeneficialOwnerBeingModifiedID: (id: string) => void;

    /** Whether user is editing an already-created beneficial owner */
    isEditingCreatedBeneficialOwner: boolean;

    /** Callback triggered after the last form page is completed */
    onFinished: () => void;

    /** Back to URL for preserving navigation context */
    backTo?: string;
};

function BeneficialOwnerDetailsFormPages({
    policyID,
    beneficialOwnerBeingModifiedID,
    setBeneficialOwnerBeingModifiedID,
    isEditingCreatedBeneficialOwner,
    onFinished,
    backTo,
}: BeneficialOwnerDetailsFormPagesProps) {
    const {translate} = useLocalize();

    const buildRoute = useCallback(
        (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: PAGE_NAMES.BENEFICIAL_OWNERS, subPage: pageName, action, backTo}),
        [policyID, backTo],
    );

    const {CurrentPage, isEditing, currentPageName, pageIndex, prevPage, nextPage, moveTo, isRedirecting} = useSubPage<BeneficialOwnerSubPageProps>({
        pages,
        startFrom: 0,
        onFinished,
        buildRoute,
    });

    const handleBackButtonPress = useCallback(() => {
        if (isEditing) {
            Navigation.goBack(buildRoute(SUB_PAGE_NAMES.CONFIRMATION));
            return;
        }

        if (pageIndex === 0) {
            if (isEditingCreatedBeneficialOwner) {
                Navigation.goBack(buildRoute(SUB_PAGE_NAMES.UBOS_LIST));
            } else {
                Navigation.goBack(buildRoute(SUB_PAGE_NAMES.IS_USER_UBO));
            }
        } else {
            prevPage();
        }
    }, [buildRoute, isEditing, isEditingCreatedBeneficialOwner, pageIndex, prevPage]);

    if (isRedirecting) {
        return <FullScreenLoadingIndicator reasonAttributes={{context: 'BeneficialOwnerDetailsFormPages', isRedirecting}} />;
    }

    return (
        <InteractiveStepWrapper
            wrapperID="BeneficialOwnersStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('beneficialOwnerInfoStep.companyOwner')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={5}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
                beneficialOwnerBeingModifiedID={beneficialOwnerBeingModifiedID}
                setBeneficialOwnerBeingModifiedID={setBeneficialOwnerBeingModifiedID}
            />
        </InteractiveStepWrapper>
    );
}

export default BeneficialOwnerDetailsFormPages;
