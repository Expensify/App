import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import AssigneeStep from './AssigneeStep';
import CardNameStep from './CardNameStep';
import CardSelectionStep from './CardSelectionStep';
import ConfirmationStep from './ConfirmationStep';
import TransactionStartDateStep from './TransactionStartDateStep';

type AssignCardFeedPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD> & WithPolicyAndFullscreenLoadingProps;

function AssignCardFeedPage({route, policy}: AssignCardFeedPageProps) {
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const currentStep = assignCard?.currentStep;

    const feed = route.params?.feed;
    const backTo = route.params?.backTo;
    const policyID = policy?.id ?? '-1';
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});

    useEffect(() => {
        return () => {
            CompanyCards.clearAssignCardStepAndData();
        };
    }, []);

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={AssignCardFeedPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.ASSIGNEE:
            return (
                <AssigneeStep
                    policy={policy}
                    feed={feed}
                />
            );
        case CONST.COMPANY_CARD.STEP.CARD:
            return (
                <CardSelectionStep
                    feed={feed}
                    policyID={policyID}
                />
            );
        case CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE:
            return <TransactionStartDateStep />;
        case CONST.COMPANY_CARD.STEP.CARD_NAME:
            return <CardNameStep policyID={policyID} />;
        case CONST.COMPANY_CARD.STEP.CONFIRMATION:
            return (
                <ConfirmationStep
                    policyID={policyID}
                    backTo={backTo}
                />
            );
        default:
            return (
                <AssigneeStep
                    policy={policy}
                    feed={feed}
                />
            );
    }
}

AssignCardFeedPage.displayName = 'AssignCardFeedPage';
export default withPolicyAndFullscreenLoading(AssignCardFeedPage);
