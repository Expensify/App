import React, {useCallback, useEffect} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {setIssueNewCardStepAndData} from '@libs/actions/Card';
import WorkspaceInviteMessageComponent from '@pages/workspace/members/WorkspaceInviteMessageComponent';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type InviteeNewMemberStepProps = WithPolicyAndFullscreenLoadingProps & WithCurrentUserPersonalDetailsProps;

function InviteNewMemberStep({policy, route, currentUserPersonalDetails}: InviteeNewMemberStepProps) {
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});

    const isEditing = issueNewCard?.isEditing;
    const handleBackButtonPress = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.ASSIGNEE,
                policyID,
                data: {...issueNewCard?.data, invitingMemberEmail: undefined},
            });
            return;
        }

        setIssueNewCardStepAndData({
            step: CONST.EXPENSIFY_CARD.STEP.ASSIGNEE,
            data: {...issueNewCard?.data, invitingMemberEmail: undefined},
            isEditing: false,
            policyID,
        });
    };

    const goToNextStep = useCallback(() => {
        if (isEditing) {
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION,
                isEditing: false,
                policyID,
                data: {...issueNewCard?.data, assigneeEmail: issueNewCard?.data?.invitingMemberEmail ?? '', invitingMemberEmail: undefined},
            });
        } else {
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.CARD_TYPE,
                isEditing: false,
                policyID,
                data: {...issueNewCard?.data, assigneeEmail: issueNewCard?.data?.invitingMemberEmail ?? '', invitingMemberEmail: undefined},
            });
        }
    }, [isEditing, issueNewCard?.data, policyID]);

    // If the currently inviting member is already a member of the policy then we should just call goToNextStep
    // See https://github.com/Expensify/App/issues/74256 for more details
    useEffect(() => {
        if (!policy?.employeeList?.[issueNewCard?.data?.invitingMemberEmail ?? '']) {
            return;
        }
        goToNextStep();
    }, [issueNewCard?.data?.invitingMemberEmail, policy?.employeeList, goToNextStep]);

    return (
        <InteractiveStepWrapper
            wrapperID={InviteNewMemberStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={0}
            stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
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
