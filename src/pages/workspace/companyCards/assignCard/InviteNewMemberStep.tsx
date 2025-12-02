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
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import WorkspaceInviteMessageComponent from '@pages/workspace/members/WorkspaceInviteMessageComponent';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';

type InviteeNewMemberStepProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    WithCurrentUserPersonalDetailsProps & {
        route: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD>;
        /** Selected feed */
        feed: CompanyCardFeedWithDomainID;
    };

function InviteNewMemberStep({policy, route, currentUserPersonalDetails, feed}: InviteeNewMemberStepProps) {
    const {translate} = useLocalize();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const isEditing = assignCard?.isEditing;
    const policyID = route.params.policyID;
    const [list] = useCardsList(feed);
    const [cardFeeds] = useCardFeeds(policy?.id);
    const filteredCardList = getFilteredCardList(list, cardFeeds?.[feed]?.accountList, workspaceCardFeeds);

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                data: {
                    ...assignCard?.data,
                    invitingMemberEmail: undefined,
                },
            });
        } else {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                data: {
                    ...assignCard?.data,
                    invitingMemberEmail: undefined,
                },
                isEditing: false,
            });
        }
    };

    const goToNextStep = useCallback(() => {
        let nextStep: AssignCardStep = CONST.COMPANY_CARD.STEP.CARD;
        const data: Partial<AssignCardData> = {
            email: assignCard?.data?.invitingMemberEmail,
            cardName: getDefaultCardName(assignCard?.data?.invitingMemberEmail),
            invitingMemberEmail: '',
        };

        if (hasOnlyOneCardToAssign(filteredCardList)) {
            nextStep = CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
            data.cardNumber = Object.keys(filteredCardList).at(0);
            data.encryptedCardNumber = Object.values(filteredCardList).at(0);
        }

        setAssignCardStepAndData({
            currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : nextStep,
            data,
            isEditing: false,
        });
    }, [isEditing, assignCard?.data, filteredCardList]);

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
            wrapperID={InviteNewMemberStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={0}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
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

InviteNewMemberStep.displayName = 'InviteNewMemberStep';

export default withPolicyAndFullscreenLoading(withCurrentUserPersonalDetails(InviteNewMemberStep));
