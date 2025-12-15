import {isActingAsDelegateSelector} from '@selectors/Account';
import React, {useEffect} from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import useInitial from '@hooks/useInitial';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import PlaidConnectionStep from '@pages/workspace/companyCards/addNew/PlaidConnectionStep';
import BankConnection from '@pages/workspace/companyCards/BankConnection';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import AssigneeStep from './AssigneeStep';
import CardNameStep from './CardNameStep';
import CardSelectionStep from './CardSelectionStep';
import ConfirmationStep from './ConfirmationStep';
import InviteNewMemberStep from './InviteNewMemberStep';
import TransactionStartDateStep from './TransactionStartDateStep';

type AssignCardFeedPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD> & WithPolicyAndFullscreenLoadingProps;

function AssignCardFeedPage({route, policy}: AssignCardFeedPageProps) {
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const currentStep = assignCard?.currentStep;

    const feed = decodeURIComponent(route.params?.feed) as CompanyCardFeedWithDomainID;
    const backTo = route.params?.backTo;
    const policyID = policy?.id;
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector, canBeMissing: true});
    const firstAssigneeEmail = useInitial(assignCard?.data?.email);
    const shouldUseBackToParam = !firstAssigneeEmail || firstAssigneeEmail === assignCard?.data?.email;

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={AssignCardFeedPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
            return (
                <BankConnection
                    policyID={policyID}
                    feed={feed}
                />
            );
        case CONST.COMPANY_CARD.STEP.PLAID_CONNECTION:
            return (
                <PlaidConnectionStep
                    feed={feed}
                    policyID={policyID}
                />
            );
        case CONST.COMPANY_CARD.STEP.ASSIGNEE:
            return (
                <AssigneeStep
                    policy={policy}
                    feed={feed}
                    route={route}
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
                    feed={feed}
                    backTo={shouldUseBackToParam ? backTo : undefined}
                />
            );
        case CONST.COMPANY_CARD.STEP.INVITE_NEW_MEMBER:
            return (
                <InviteNewMemberStep
                    route={route}
                    feed={feed}
                />
            );
        default:
            return (
                <AssigneeStep
                    policy={policy}
                    feed={feed}
                    route={route}
                />
            );
    }
}

AssignCardFeedPage.displayName = 'AssignCardFeedPage';
export default withPolicyAndFullscreenLoading(AssignCardFeedPage);
