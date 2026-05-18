import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import openWorkspaceRoomsPage from '@libs/actions/Policy/Room';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceRoomsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.ROOMS>;

function WorkspaceRoomsPage({route}: WorkspaceRoomsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const illustrations = useMemoizedLazyIllustrations(['Hashtag']);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const isAdmin = isPolicyAdmin(policy);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rooms');

    useFocusEffect(() => {
        openWorkspaceRoomsPage(policyID);
    });

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.WORKSPACE_ROOMS_PAGE)}
        >
            <ScreenWrapper
                testID={WorkspaceRoomsPage.displayName}
                style={[styles.defaultModalContainer]}
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.rooms')}
                    icon={illustrations.Hashtag}
                    shouldUseHeadlineHeader
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.goBack}
                    shouldDisplayHelpButton
                >
                    {isAdmin && (
                        <Button
                            success
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ROOM_CREATE.getRoute(policyID))}
                            icon={icons.Plus}
                            text={translate('common.create')}
                        />
                    )}
                </HeaderWithBackButton>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceRoomsPage.displayName = 'WorkspaceRoomsPage';

export default WorkspaceRoomsPage;
