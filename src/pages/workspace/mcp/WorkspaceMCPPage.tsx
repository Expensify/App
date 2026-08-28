import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
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
    const theme = useTheme();
    const {shouldUseNarrowLayout, isLargeScreenWidth} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ChatGPTSquare', 'ClaudeSquare', 'CursorSquare', 'QuestionMark']);
    const policy = usePolicy(policyID);

    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.mcp');

    const connectors = [
        {icon: icons.ChatGPTSquare, title: translate('workspace.mcp.chatgpt.title'), description: translate('workspace.mcp.chatgpt.subtitle'), url: CONST.CHATGPT_CONNECT_URL},
        {icon: icons.ClaudeSquare, title: translate('workspace.mcp.claude.title'), description: translate('workspace.mcp.claude.subtitle'), url: CONST.CLAUDE_MCP_HELP_URL},
        {icon: icons.CursorSquare, title: translate('workspace.mcp.cursor.title'), description: translate('workspace.mcp.cursor.subtitle'), url: CONST.CURSOR_MCP_HELP_URL},
    ];

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
                        {connectors.map((connector) => (
                            <MenuItem
                                key={connector.title}
                                icon={connector.icon}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                title={connector.title}
                                description={connector.description}
                                interactive={false}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                shouldShowRightComponent
                                rightComponent={
                                    <Button
                                        onPress={() => openExternalLink(connector.url)}
                                        style={styles.justifyContentCenter}
                                        size={CONST.BUTTON_SIZE.SMALL}
                                    >
                                        <Button.Text>{translate('workspace.accounting.setup')}</Button.Text>
                                    </Button>
                                }
                            />
                        ))}
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt7]}>
                            <Icon
                                src={icons.QuestionMark}
                                width={20}
                                height={20}
                                fill={theme.icon}
                                additionalStyles={styles.mr3}
                            />
                            <View style={[!isLargeScreenWidth ? styles.flexColumn : styles.flexRow]}>
                                <Text style={styles.textSupporting}>{translate('workspace.mcp.helpPrompt')}</Text>
                                <TextLink onPress={() => openExternalLink(CONST.MCP_HELP_URL)}>{translate('workspace.mcp.helpLink')}</TextLink>
                            </View>
                        </View>
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WorkspaceMCPPage;
