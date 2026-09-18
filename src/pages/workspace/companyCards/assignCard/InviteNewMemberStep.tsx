import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';

import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';

import {setDraftInviteAccountID} from '@libs/actions/Card';
import {getCardAssignmentDateOption, getCardAssignmentStartDate, getDefaultCardName, getFilteredCardList, hasOnlyOneCardToAssign} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspaceInviteMessageComponent from '@pages/workspace/members/WorkspaceInviteMessageComponent';

import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import {clearInviteDraft} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {AssignCardData} from '@src/types/onyx/AssignCard';

import {Str} from 'expensify-common';
import React, {useEffect} from 'react';

type InviteeNewMemberStepProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER> &
    WithCurrentUserPersonalDetailsProps;

function InviteNewMemberStep({route, currentUserPersonalDetails}: InviteeNewMemberStepProps) {
    const {translate} = useLocalize();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const policyID = route.params.policyID;
    const feed = route.params.feed;
    const cardID = route.params.cardID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [list] = useCardsList(feed);
    const [cardFeeds] = useCardFeeds(policy?.id);
    const invitingMemberDetails = usePersonalDetailByLogin(assignCard?.cardToAssign?.invitingMemberEmail ?? '');
    const filteredCardList = getFilteredCardList(list, cardFeeds?.[feed]?.accountList, workspaceCardFeeds, feed);

    const handleBackButtonPress = () => {
        clearInviteDraft(policyID);
        setAssignCardStepAndData({
            currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            cardToAssign: {
                ...assignCard?.cardToAssign,
                invitingMemberEmail: undefined,
                invitingMemberAccountID: undefined,
            },
            // Don't force isEditing:false here. When the user reached the invite step while editing the cardholder from
            // Confirmation, backing out must keep isEditing:true so the assignee step's own back returns to Confirmation
            // instead of dismissing the whole RHP (regression #97410). Omitting the field leaves the Onyx.merge value
            // untouched. A fresh (non-edit) assign flow already has isEditing:false throughout, so it's unaffected.
        });
        Navigation.goBack();
    };

    const goToNextStep = () => {
        const invitingMemberEmail = assignCard?.cardToAssign?.invitingMemberEmail ?? '';
        const memberName = invitingMemberDetails?.firstName ? invitingMemberDetails.firstName : Str.removeSMSDomain(invitingMemberDetails?.login ?? invitingMemberEmail);
        const defaultCardName = getDefaultCardName(memberName);
        // Keep the name the user manually typed in CardNameStep. Otherwise always recompute it from the inviting member.
        const customCardName = assignCard?.cardToAssign?.isCustomCardNameEdited ? (assignCard?.cardToAssign?.customCardName ?? defaultCardName) : defaultCardName;
        const cardToAssign: Partial<AssignCardData> = {
            email: assignCard?.cardToAssign?.invitingMemberEmail,
            customCardName,
            invitingMemberEmail: '',
        };

        const routeParams = {policyID, feed, cardID};

        if (assignCard?.cardToAssign?.encryptedCardNumber) {
            cardToAssign.encryptedCardNumber = assignCard.cardToAssign.encryptedCardNumber;
            cardToAssign.cardName = assignCard.cardToAssign.cardName;
            cardToAssign.startDate = getCardAssignmentStartDate(true, assignCard?.cardToAssign?.startDate);
            cardToAssign.dateOption = getCardAssignmentDateOption(true, assignCard?.cardToAssign?.dateOption);
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                cardToAssign,
                isEditing: false,
            });
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.path), {forceReplace: true});
        } else if (hasOnlyOneCardToAssign(filteredCardList)) {
            const onlyCard = filteredCardList.at(0);
            cardToAssign.cardName = onlyCard?.cardName;
            cardToAssign.encryptedCardNumber = onlyCard?.cardID;
            cardToAssign.startDate = getCardAssignmentStartDate(true, assignCard?.cardToAssign?.startDate);
            cardToAssign.dateOption = getCardAssignmentDateOption(true, assignCard?.cardToAssign?.dateOption);
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                cardToAssign,
                isEditing: false,
            });
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.path), {forceReplace: true});
        } else {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CARD,
                cardToAssign,
                isEditing: false,
            });
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION.getRoute(routeParams), {forceReplace: true});
        }
    };

    // If the currently inviting member is already a member of the policy then we should just call goToNextStep
    // See https://github.com/Expensify/App/issues/74256 for more details
    useEffect(() => {
        setDraftInviteAccountID(assignCard?.cardToAssign?.invitingMemberEmail ?? '', assignCard?.cardToAssign?.invitingMemberAccountID ?? undefined, policyID);
        if (!policy?.employeeList?.[assignCard?.cardToAssign?.invitingMemberEmail ?? '']) {
            return;
        }
        goToNextStep();
    }, [assignCard?.cardToAssign?.invitingMemberEmail, policy?.employeeList, goToNextStep, assignCard?.cardToAssign?.invitingMemberAccountID, policyID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <InteractiveStepWrapper
                wrapperID="InviteNewMemberStep"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                headerTitle={translate('workspace.companyCards.assignCard')}
                handleBackButtonPress={handleBackButtonPress}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <WorkspaceInviteMessageComponent
                    policy={policy}
                    policyID={policyID}
                    backTo={undefined}
                    currentUserPersonalDetails={currentUserPersonalDetails}
                    shouldShowBackButton={false}
                    isInviteNewMemberStep
                    goToNextStep={goToNextStep}
                    shouldShowTooltip={false}
                    shouldShowMemberNames={false}
                />
            </InteractiveStepWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withCurrentUserPersonalDetails(InviteNewMemberStep);
