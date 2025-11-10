import {isActingAsDelegateSelector} from '@selectors/Account';
import React, {useEffect} from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearAddNewCardFlow, openPolicyAddCardFeedPage} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {useAddNewCardNavigation} from '@pages/workspace/companyCards/utils';

type AddNewCardPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW> & WithPolicyAndFullscreenLoadingProps;

function AddNewCardPage({policy, route}: AddNewCardPageProps) {
    const policyID = policy?.id;
    const backTo = route.params?.backTo;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector, canBeMissing: false});

    useEffect(() => {
        return () => {
            clearAddNewCardFlow();
        };
    }, []);

    useEffect(() => {
        // If the user only has a domain feed, a workspace account may not have been created yet.
        // However, adding a workspace feed requires a workspace account.
        // Calling openPolicyAddCardFeedPage will trigger the creation of a workspace account.
        if (workspaceAccountID) {
            return;
        }
        openPolicyAddCardFeedPage(policyID);
    }, [workspaceAccountID, policyID]);

    useAddNewCardNavigation(policyID, backTo, true);

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={AddNewCardPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID={AddNewCardPage.displayName}
        >
            <FullScreenLoadingIndicator />
        </ScreenWrapper>
    );
}

AddNewCardPage.displayName = 'AddNewCardPage';
export default withPolicyAndFullscreenLoading(AddNewCardPage);
