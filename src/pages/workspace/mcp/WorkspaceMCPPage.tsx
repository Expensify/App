import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import {openExternalLink} from '@userActions/Link';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type WorkspaceMCPPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.MCP>;

function WorkspaceMCPPage({route}: WorkspaceMCPPageProps) {
    const policyID = route.params.policyID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ChatGPTSquare']);
    const policy = usePolicy(policyID);

    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.mcp');

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            style={styles.defaultModalContainer}
            testID="WorkspaceMCPPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.common.mcp')}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldUseHeadlineHeader
                shouldDisplayHelpButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView
                contentContainerStyle={styles.pt3}
                addBottomSafeAreaPadding
            >
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('workspace.mcp.connectors')}
                        subtitle={translate('workspace.mcp.connectorsSubtitle')}
                        isCentralPane
                        subtitleMuted
                        titleStyles={styles.accountSettingsSectionTitle}
                        childrenStyles={styles.pt5}
                    >
                        <MenuItem
                            icon={icons.ChatGPTSquare}
                            iconType={CONST.ICON_TYPE_AVATAR}
                            title={translate('workspace.mcp.chatgpt.title')}
                            description={translate('workspace.mcp.chatgpt.subtitle')}
                            interactive={false}
                            wrapperStyle={styles.sectionMenuItemTopDescription}
                            shouldShowRightComponent
                            rightComponent={
                                <Button
                                    onPress={() => openExternalLink(CONST.CHATGPT_CONNECT_URL)}
                                    style={styles.justifyContentCenter}
                                    size={CONST.BUTTON_SIZE.SMALL}
                                >
                                    <Button.Text>{translate('workspace.accounting.setup')}</Button.Text>
                                </Button>
                            }
                        />
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WorkspaceMCPPage;
