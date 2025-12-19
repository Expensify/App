import React, {useCallback, useEffect} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {CompanyCardFeedWithDomainID} from '@hooks/useCardFeeds';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {setDraftInviteAccountID} from '@libs/actions/Card';
import {getDefaultCardName, getFilteredCardList, hasOnlyOneCardToAssign} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import WorkspaceInviteMessageComponent from '@pages/workspace/members/WorkspaceInviteMessageComponent';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import {clearInviteDraft} from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {AssignCardData} from '@src/types/onyx/AssignCard';

type InviteeNewMemberStepProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER> &
    WithCurrentUserPersonalDetailsProps;

function InviteNewMemberStep({route, currentUserPersonalDetails}: InviteeNewMemberStepProps) {
    const {translate} = useLocalize();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const policyID = route.params.policyID;
    const feed = route.params.feed as CompanyCardFeedWithDomainID;
    const cardID = route.params.cardID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [list] = useCardsList(feed);
    const [cardFeeds] = useCardFeeds(policy?.id);
    const filteredCardList = getFilteredCardList(list, cardFeeds?.[feed]?.accountList, workspaceCardFeeds);

    const handleBackButtonPress = () => {
        clearInviteDraft(policyID);
        setAssignCardStepAndData({
            currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            data: {
                ...assignCard?.data,
                invitingMemberEmail: undefined,
                invitingMemberAccountID: undefined,
            },
            isEditing: false,
        });
        Navigation.goBack();
    };

    const goToNextStep = useCallback(() => {
        const data: Partial<AssignCardData> = {
            email: assignCard?.data?.invitingMemberEmail,
            cardName: getDefaultCardName(assignCard?.data?.invitingMemberEmail),
            invitingMemberEmail: '',
        };

        const routeParams = {policyID, feed, cardID};

        if (assignCard?.data?.encryptedCardNumber) {
            data.encryptedCardNumber = assignCard.data.encryptedCardNumber;
            data.cardNumber = assignCard.data.cardNumber;
            data.startDate = assignCard?.data?.startDate ?? new Date().toISOString().split('T').at(0);
            data.dateOption = assignCard?.data?.dateOption ?? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM;
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                data,
                isEditing: false,
            });
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.getRoute(routeParams));
        } else if (hasOnlyOneCardToAssign(filteredCardList)) {
            data.cardNumber = Object.keys(filteredCardList).at(0);
            data.encryptedCardNumber = Object.values(filteredCardList).at(0);
            data.startDate = assignCard?.data?.startDate ?? new Date().toISOString().split('T').at(0);
            data.dateOption = assignCard?.data?.dateOption ?? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM;
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                data,
                isEditing: false,
            });
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.getRoute(routeParams));
        } else {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CARD,
                data,
                isEditing: false,
            });
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION.getRoute(routeParams));
        }
    }, [assignCard?.data, filteredCardList, policyID, feed, cardID]);

    // If the currently inviting member is already a member of the policy then we should just call goToNextStep
    // See https://github.com/Expensify/App/issues/74256 for more details
    useEffect(() => {
        setDraftInviteAccountID(assignCard?.data?.invitingMemberEmail ?? '', assignCard?.data?.invitingMemberAccountID ?? undefined, policyID);
        if (!policy?.employeeList?.[assignCard?.data?.invitingMemberEmail ?? '']) {
            return;
        }
        goToNextStep();
    }, [assignCard?.data?.invitingMemberEmail, policy?.employeeList, goToNextStep, assignCard?.data?.invitingMemberAccountID, policyID]);

    return (
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
    );
}

export default withCurrentUserPersonalDetails(InviteNewMemberStep);
