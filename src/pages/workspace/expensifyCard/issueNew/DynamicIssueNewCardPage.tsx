import {useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import {startIssueNewCardFlow} from '@libs/actions/Card';
import {getIssueNewCardShippingStepCount, getIssueNewCardStartStepIndex} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';

import AssigneeStep from './AssigneeStep';
import CardNameStep from './CardNameStep';
import CardTypeStep from './CardTypeStep';
import ConfirmationStep from './ConfirmationStep';
import InviteNewMemberStep from './InviteNewMemberStep';
import LimitTypeStep from './LimitTypeStep';
import PhoneNumberStep from './PhoneNumberStep';
import ShippingAddressStep from './ShippingAddressStep';
import SetSpendRulesStep from './spendRules/SetSpendRulesStep';

type IssueNewCardPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW>;

function DynamicIssueNewCardPage({policy, route}: IssueNewCardPageProps) {
    const policyID = route.params.policyID;
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);
    const {currentStep} = issueNewCard ?? {};
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.path);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();

    const baseStepNames = issueNewCard?.isChangeAssigneeDisabled ? CONST.EXPENSIFY_CARD.ASSIGNEE_EXCLUDED_STEP_NAMES : CONST.EXPENSIFY_CARD.STEP_NAMES;
    const shippingStepNames = Array.from({length: getIssueNewCardShippingStepCount(issueNewCard)}, (_, index) => String(baseStepNames.length + index + 1));
    const stepNames = [...baseStepNames, ...shippingStepNames];
    const startStepIndex = getIssueNewCardStartStepIndex(issueNewCard);

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
                        policy={policy}
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
            case CONST.EXPENSIFY_CARD.STEP.CARD_NAME:
                return (
                    <CardNameStep
                        policyID={policyID}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                    />
                );
            case CONST.EXPENSIFY_CARD.STEP.SPEND_RULES:
                return (
                    <SetSpendRulesStep
                        policyID={policyID}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                    />
                );
            case CONST.EXPENSIFY_CARD.STEP.SHIPPING_ADDRESS:
                return (
                    <ShippingAddressStep
                        policyID={policyID}
                        stepNames={stepNames}
                        startStepIndex={startStepIndex}
                    />
                );
            case CONST.EXPENSIFY_CARD.STEP.PHONE_NUMBER:
                return (
                    <PhoneNumberStep
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
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
            </ScreenWrapper>
        );
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            {getCurrentStep()}
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(DynamicIssueNewCardPage);
