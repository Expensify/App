import React, {useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import LoadingPage from '@pages/LoadingPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import PlaidConnectionStep from './addNew/PlaidConnectionStep';
import BankConnection from './BankConnection';

type BrokenCardFeedConnectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION> &
    WithPolicyAndFullscreenLoadingProps;

function BrokenCardFeedConnectionPage({route, policy}: BrokenCardFeedConnectionPageProps) {
    const feed = route.params?.feed;
    const policyID = policy?.id;

    const {translate} = useLocalize();

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const currentStep = assignCard?.currentStep;

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    let content: React.ReactNode;
    switch (currentStep) {
        case CONST.COMPANY_CARD.STEP.BANK_CONNECTION:
            content = (
                <BankConnection
                    policyID={policyID}
                    feed={feed}
                />
            );
            break;
        case CONST.COMPANY_CARD.STEP.PLAID_CONNECTION:
            content = (
                <PlaidConnectionStep
                    feed={feed}
                    policyID={policyID}
                />
            );
            break;
        default:
            content = <LoadingPage title={translate('workspace.companyCards.assignCard')} />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            {content}
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(BrokenCardFeedConnectionPage);
