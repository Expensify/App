import {isActingAsDelegateSelector} from '@selectors/Account';
import React, {useEffect} from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {useAssignCardNavigation} from '@pages/workspace/companyCards/utils';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';


type AssignCardFeedPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD> & WithPolicyAndFullscreenLoadingProps;

function AssignCardFeedPage({route, policy}: AssignCardFeedPageProps) {
    const feed = decodeURIComponent(route.params?.feed) as CompanyCardFeed;
    const policyID = policy?.id;
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector, canBeMissing: true});

    useEffect(() => {
        return () => {
            clearAssignCardStepAndData();
        };
    }, []);

    useAssignCardNavigation(policyID, feed, true);

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

    return (
        <ScreenWrapper testID={AssignCardFeedPage.displayName}>
            <FullScreenLoadingIndicator testID="assign-card-loading-indicator" />
        </ScreenWrapper>
    );
}

AssignCardFeedPage.displayName = 'AssignCardFeedPage';
export default withPolicyAndFullscreenLoading(AssignCardFeedPage);
