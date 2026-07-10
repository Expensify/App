import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Table from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {AgentRowData} from '.';

type AgentsTableRowProps = {
    /** Data about the agent */
    item: AgentRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

export default function AgentsTableRow({item, rowIndex, shouldUseNarrowTableLayout}: AgentsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'ChatBubble']);

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const isPendingDeletion = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const isPendingAddOrDelete = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || isPendingDeletion;
    const areActionsDisabled = isPendingAddOrDelete || item.accountID <= 0 || !item.login;
    const accessibilityLabel = [item.displayName, item.login].filter(Boolean).join(', ');

    const getSecondaryAvatarContainerStyle = (hovered: boolean) => [
        styleUtils.getBackgroundAndBorderStyle(theme.sidebar),
        hovered ? styleUtils.getBackgroundAndBorderStyle(styles.sidebarLinkHover?.backgroundColor ?? theme.sidebar) : undefined,
    ];

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.AGENTS.TABLE_ROW}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
                shouldHideOnDelete: false,
            }}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    <View
                        style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                    >
                        <ReportActionAvatars
                            size={avatarSize}
                            accountIDs={[item.accountID]}
                            fallbackDisplayName={item.displayName}
                            shouldShowTooltip
                            secondaryAvatarContainerStyle={getSecondaryAvatarContainerStyle(!!hovered)}
                        />
                        <View style={[shouldUseNarrowTableLayout && styles.gap1, styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.displayName}
                                style={[styles.optionDisplayName, styles.pre, isPendingDeletion && styles.offlineFeedbackDeleted]}
                            />
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.login}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre, isPendingDeletion && styles.offlineFeedbackDeleted]}
                            />
                        </View>
                    </View>

                    <View
                        style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap2]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                    >
                        {!shouldUseNarrowTableLayout && (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                <Button
                                    size={CONST.BUTTON_SIZE.SMALL}
                                    onPress={item.onChatPress}
                                    isDisabled={areActionsDisabled}
                                    accessibilityLabel={translate('editAgentPage.chatWithAgent')}
                                    sentryLabel={CONST.SENTRY_LABEL.AGENTS.CHAT}
                                >
                                    <Button.Icon src={icons.ChatBubble} />
                                </Button>
                                <Button
                                    size={CONST.BUTTON_SIZE.SMALL}
                                    onPress={item.onCopilotPress}
                                    isDisabled={areActionsDisabled}
                                    accessibilityLabel={translate('editAgentPage.copilotIntoAccount')}
                                    sentryLabel={CONST.SENTRY_LABEL.AGENTS.COPILOT}
                                >
                                    <Button.Text>{translate('delegate.copilot')}</Button.Text>
                                </Button>
                                <Button
                                    size={CONST.BUTTON_SIZE.SMALL}
                                    onPress={item.action}
                                    isDisabled={isPendingDeletion}
                                    sentryLabel={CONST.SENTRY_LABEL.AGENTS.EDIT}
                                >
                                    <Button.Text>{translate('common.edit')}</Button.Text>
                                </Button>
                            </View>
                        )}
                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.alignSelfCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </Table.Row>
    );
}
