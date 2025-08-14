import React, {useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import useInitial from '@hooks/useInitial';
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
import LimitStep from './LimitStep';
import LimitTypeStep from './LimitTypeStep';

type IssueNewCardPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW>;

function getStartStepIndex(issueNewCard: OnyxEntry<IssueNewCard>): number {
    if (!issueNewCard) {
        return 0;
    }

    const STEP_INDEXES: Record<IssueNewCardStep, number> = {
        [CONST.EXPENSIFY_CARD.STEP.ASSIGNEE]: 0,
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
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});
    const {currentStep} = issueNewCard ?? {};
    const backTo = route?.params?.backTo;
    const firstAssigneeEmail = useInitial(issueNewCard?.data?.assigneeEmail);
    const shouldUseBackToParam = !firstAssigneeEmail || firstAssigneeEmail === issueNewCard?.data?.assigneeEmail;
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate, canBeMissing: true});
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
                        backTo={shouldUseBackToParam ? backTo : undefined}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                    />
                );
            default:
                return (
                    <AssigneeStep
                        policy={policy}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                    />
                );
        }
    };

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={IssueNewCardPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper
                    accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}
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

IssueNewCardPage.displayName = 'IssueNewCardPage';
export default withPolicyAndFullscreenLoading(IssueNewCardPage);
