import {isDelegateAccessRestrictedSelector} from '@selectors/Account';
import React, {useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import {startIssueNewCardFlow} from '@libs/actions/Card';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {IssueNewCard, IssueNewCardStep} from '@src/types/onyx/Card';
import AssigneeStep from './AssigneeStep';
import CardNameStep from './CardNameStep';
import CardTypeStep from './CardTypeStep';
import ConfirmationStep from './ConfirmationStep';
import InviteNewMemberStep from './InviteNewMemberStep';
import LimitStep from './LimitStep';
import LimitTypeStep from './LimitTypeStep';

type IssueNewCardPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW>;

function getStartStepIndex(issueNewCard: OnyxEntry<IssueNewCard>): number {
    if (!issueNewCard) {
        return 0;
    }

    const STEP_INDEXES: Record<IssueNewCardStep, number> = {
        [CONST.EXPENSIFY_CARD.STEP.ASSIGNEE]: 0,
        [CONST.EXPENSIFY_CARD.STEP.INVITE_NEW_MEMBER]: 0,
        [CONST.EXPENSIFY_CARD.STEP.CARD_TYPE]: 1,
        [CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE]: 2,
        [CONST.EXPENSIFY_CARD.STEP.LIMIT]: 3,
        [CONST.EXPENSIFY_CARD.STEP.CARD_NAME]: 4,
        [CONST.EXPENSIFY_CARD.STEP.CONFIRMATION]: 5,
    };

    const stepIndex = STEP_INDEXES[issueNewCard.currentStep];
    return issueNewCard.isChangeAssigneeDisabled ? stepIndex - 1 : stepIndex;
}

function IssueNewCardPage({policy, route}: IssueNewCardPageProps) {
    const policyID = policy?.id;
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true, initWithStoredValues: false});
    const {currentStep} = issueNewCard ?? {};
    const backTo = route?.params?.backTo;
    const [isDelegateAccessRestricted] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isDelegateAccessRestrictedSelector, canBeMissing: true});
    const stepNames = issueNewCard?.isChangeAssigneeDisabled ? CONST.EXPENSIFY_CARD.ASSIGNEE_EXCLUDED_STEP_NAMES : CONST.EXPENSIFY_CARD.STEP_NAMES;
    const startStepIndex = useMemo(() => getStartStepIndex(issueNewCard), [issueNewCard]);

    useEffect(() => {
        startIssueNewCardFlow(policyID);
    }, [policyID]);

    const getCurrentStep = () => {
        switch (currentStep) {
            case CONST.EXPENSIFY_CARD.STEP.ASSIGNEE:
                return (
                    <AssigneeStep
                        policy={policy}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                        route={route}
                    />
                );
            case CONST.EXPENSIFY_CARD.STEP.CARD_TYPE:
                return (
                    <CardTypeStep
                        policyID={policyID}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                    />
                );
            case CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE:
                return (
                    <LimitTypeStep
                        policy={policy}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                    />
                );
            case CONST.EXPENSIFY_CARD.STEP.LIMIT:
                return (
                    <LimitStep
                        policyID={policyID}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                    />
                );
            case CONST.EXPENSIFY_CARD.STEP.CARD_NAME:
                return (
                    <CardNameStep
                        policyID={policyID}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                    />
                );
            case CONST.EXPENSIFY_CARD.STEP.CONFIRMATION:
                return (
                    <ConfirmationStep
                        policyID={policyID}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                        backTo={backTo}
                    />
                );
            case CONST.EXPENSIFY_CARD.STEP.INVITE_NEW_MEMBER:
                return <InviteNewMemberStep route={route} />;
            default:
                return (
                    <AssigneeStep
                        policy={policy}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                        route={route}
                    />
                );
        }
    };

    if (isDelegateAccessRestricted) {
        return (
            <ScreenWrapper
                testID="IssueNewCardPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper
                    accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.SUBMITTER]}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
            </ScreenWrapper>
        );
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            {getCurrentStep()}
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(IssueNewCardPage);
