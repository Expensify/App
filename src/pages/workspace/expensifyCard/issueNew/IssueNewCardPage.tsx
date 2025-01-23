import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import {startIssueNewCardFlow} from '@libs/actions/Card';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import AssigneeStep from './AssigneeStep';
import CardNameStep from './CardNameStep';
import CardTypeStep from './CardTypeStep';
import ConfirmationStep from './ConfirmationStep';
import LimitStep from './LimitStep';
import LimitTypeStep from './LimitTypeStep';

type IssueNewCardPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW>;

function IssueNewCardPage({policy, route}: IssueNewCardPageProps) {
    const policyID = policy?.id ?? '-1';
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);
    const {currentStep} = issueNewCard ?? {};
    const backTo = route?.params?.backTo;

    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});

    useEffect(() => {
        startIssueNewCardFlow(policyID);
    }, [policyID]);

    const getCurrentStep = () => {
        switch (currentStep) {
            case CONST.EXPENSIFY_CARD.STEP.ASSIGNEE:
                return <AssigneeStep policy={policy} />;
            case CONST.EXPENSIFY_CARD.STEP.CARD_TYPE:
                return <CardTypeStep policyID={policyID} />;
            case CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE:
                return <LimitTypeStep policy={policy} />;
            case CONST.EXPENSIFY_CARD.STEP.LIMIT:
                return <LimitStep policyID={policyID} />;
            case CONST.EXPENSIFY_CARD.STEP.CARD_NAME:
                return <CardNameStep policyID={policyID} />;
            case CONST.EXPENSIFY_CARD.STEP.CONFIRMATION:
                return (
                    <ConfirmationStep
                        policyID={policyID}
                        backTo={backTo}
                    />
                );
            default:
                return <AssigneeStep policy={policy} />;
        }
    };

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={IssueNewCardPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
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
