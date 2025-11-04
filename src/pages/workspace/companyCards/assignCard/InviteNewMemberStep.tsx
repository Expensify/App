import React from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getDefaultCardName, getFilteredCardList, hasOnlyOneCardToAssign} from '@libs/CardUtils';
import WorkspaceInviteMessageComponent from '@pages/workspace/members/WorkspaceInviteMessageComponent';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';
import type {CompanyCardFeed} from '@src/types/onyx/CardFeeds';

type InviteeNewMemberStepProps = WithPolicyAndFullscreenLoadingProps &
    WithCurrentUserPersonalDetailsProps & {
        /** Selected feed */
        feed: CompanyCardFeed;
    };

function InviteNewMemberStep({policy, route, currentUserPersonalDetails, feed}: InviteeNewMemberStepProps) {
    const {translate} = useLocalize();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const isEditing = assignCard?.isEditing;
    const [list] = useCardsList(policy?.id, feed);
    const [cardFeeds] = useCardFeeds(policy?.id);
    const filteredCardList = getFilteredCardList(list, cardFeeds?.settings?.oAuthAccountDetails?.[feed], workspaceCardFeeds);

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION, isEditing: false});
        } else {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                data: {
                    ...assignCard?.data,
                    assigneeAccountID: undefined,
                    email: undefined,
                },
                isEditing: false,
            });
        }
    };

    const goToNextStep = () => {
        let nextStep: AssignCardStep = CONST.COMPANY_CARD.STEP.CARD;
        const data: Partial<AssignCardData> = {
            email: assignCard?.data?.email,
            cardName: getDefaultCardName(assignCard?.data?.email),
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
    };

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
                policyID={route.params.policyID}
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
