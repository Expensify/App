import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import openWorkspaceRoomsPage from '@libs/actions/Policy/Room';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type SCREENS from '@src/SCREENS';

type WorkspaceRoomsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.ROOMS>;

function WorkspaceRoomsPage({route}: WorkspaceRoomsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Hashtag', 'Plus']);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rooms');

    useFocusEffect(
        useCallback(() => {
            openWorkspaceRoomsPage(policyID);
        }, [policyID]),
    );

    return (
        <AccessOrNotFoundWrapper policyID={policyID}>
            <ScreenWrapper
                testID={WorkspaceRoomsPage.displayName}
                style={[styles.defaultModalContainer]}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.rooms')}
                    icon={icons.Hashtag}
                    shouldUseHeadlineHeader
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.goBack}
                    shouldDisplayHelpButton
                >
                    <Button
                        success
                        onPress={() => {}}
                        icon={icons.Plus}
                        text={translate('common.create')}
                    />
                </HeaderWithBackButton>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceRoomsPage.displayName = 'WorkspaceRoomsPage';

export default WorkspaceRoomsPage;
