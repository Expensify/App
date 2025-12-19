import {isActingAsDelegateSelector} from '@selectors/Account';
import React, {useEffect} from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import {getCompanyCardFeed} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearAssignCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

type AssignCardFeedPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD> & WithPolicyAndFullscreenLoadingProps;

function AssignCardFeedPage({route, policy}: AssignCardFeedPageProps) {
    const feed = decodeURIComponent(route.params?.feed) as CompanyCardFeedWithDomainID;
    const cardID = route.params?.cardID ? decodeURIComponent(route.params?.cardID) : '';

    const backTo = route.params?.backTo;
    const policyID = policy?.id;
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector, canBeMissing: true});

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    useEffect(() => {
        if (!cardID || currentStep) {
            return;
        }
        const companyCardFeed = getCompanyCardFeed(feed);

        setAssignCardStepAndData({
            currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
            data: {
                bankName: companyCardFeed,
                encryptedCardNumber: cardID,
            },
        });
    }, [cardID, currentStep, feed]);

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID="AssignCardFeedPage"
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
            return <TransactionStartDateStep route={route} />;
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
                    route={route}
                />
            );
    }
}

export default withPolicyAndFullscreenLoading(AssignCardFeedPage);
