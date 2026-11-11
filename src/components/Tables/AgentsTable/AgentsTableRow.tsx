import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import PolicyAvatar from '@components/Avatar/connected/PolicyAvatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {TableRow} from '@components/Table';
import Table from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import WorkspaceMemberRoleCell from '@components/Tables/WorkspaceMembersTable/WorkspaceMemberRoleCell';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import {View} from 'react-native';

import type {AgentRowData} from '.';

type AgentsTableRowProps = {
    /** Data about the agent (wrapped by the table, so it also carries row state such as `selected`) */
    item: TableRow<AgentRowData>;

    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;

    /** Whether to show the role column */
    shouldShowRoleColumn?: boolean;

    /** Whether to show the owner column */
    shouldShowOwnerColumn?: boolean;
};

function buildAgentSubtitle(
    item: TableRow<AgentRowData>,
    translate: LocalizedTranslate,
    shouldUseNarrowTableLayout: boolean,
    shouldShowRoleColumn?: boolean,
    shouldShowOwnerColumn?: boolean,
) {
    const role = item.role ? translate('workspace.common.roleName', item.role) : undefined;
    const owner = item.ownerDisplayName;
    const login = item.login;
    const parts: string[] = [];
    if (shouldUseNarrowTableLayout && shouldShowRoleColumn && role) {
        parts.push(role);
    }
    if (shouldUseNarrowTableLayout && shouldShowOwnerColumn && owner) {
        parts.push(`${translate('common.owner')}: ${owner}`);
    }
    parts.push(login);
    return parts.join(' • ');
}

export default function AgentsTableRow({item, rowIndex, shouldUseNarrowTableLayout, shouldShowRoleColumn = false, shouldShowOwnerColumn = false}: AgentsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'ChatBubble', 'Globe']);

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const isPendingDeletion = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const isPendingAddOrDelete = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || isPendingDeletion;
    const areActionsDisabled = !item.canManage || isPendingAddOrDelete || item.accountID <= 0 || !item.login;
    const isEditable = item.canManage && !isPendingDeletion;
    const accessibilityLabel = [item.displayName, item.login].filter(Boolean).join(', ');
    const selectedButtonInnerStyle = item.selected ? styles.buttonDefaultHovered : undefined;
    const agentSubtitle = buildAgentSubtitle(item, translate, shouldUseNarrowTableLayout, shouldShowRoleColumn, shouldShowOwnerColumn);

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
                        <AccountAvatar
                            size={avatarSize}
                            accountID={item.accountID}
                            fallbackDisplayName={item.displayName}
                        />
                        <View style={[shouldUseNarrowTableLayout && styles.gap1, styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.displayName}
                                style={[styles.optionDisplayName, styles.pre, isPendingDeletion && styles.offlineFeedbackDeleted]}
                            />
                            <TextWithTooltip
                                shouldShowTooltip
                                text={agentSubtitle}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre, isPendingDeletion && styles.offlineFeedbackDeleted]}
                            />
                        </View>
                    </View>

                    {!shouldUseNarrowTableLayout && shouldShowRoleColumn && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.editableCellColumn]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            <WorkspaceMemberRoleCell
                                role={item.role}
                                memberLogin={item.login}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowOwnerColumn && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            {item.ownerType === CONST.AGENTS.OWNER_TYPE.PERSON && !!item.ownerAccountID && (
                                <AccountAvatar
                                    size={CONST.AVATAR_SIZE.XXX_SMALL}
                                    accountID={item.ownerAccountID}
                                    fallbackDisplayName={item.ownerDisplayName}
                                    containerStyle={[styles.pr2, styles.alignSelfCenter]}
                                />
                            )}
                            {item.ownerType === CONST.AGENTS.OWNER_TYPE.WORKSPACE && !!item.ownerPolicyID && (
                                <PolicyAvatar
                                    size={CONST.AVATAR_SIZE.XXX_SMALL}
                                    policyID={item.ownerPolicyID}
                                    fallbackDisplayName={item.ownerDisplayName}
                                    containerStyle={[styles.pr2, styles.alignSelfCenter]}
                                />
                            )}
                            {item.ownerType === CONST.AGENTS.OWNER_TYPE.DOMAIN && (
                                <Icon
                                    src={icons.Globe}
                                    fill={theme.icon}
                                    additionalStyles={[styles.pr2, styles.alignSelfCenter]}
                                    size={CONST.ICON_SIZE.SMALL}
                                />
                            )}
                            {!!item.ownerDisplayName && (
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={item.ownerDisplayName}
                                    style={[styles.optionDisplayName, styles.pre]}
                                />
                            )}
                        </View>
                    )}

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
                                    innerStyles={selectedButtonInnerStyle}
                                    accessibilityLabel={translate('editAgentPage.chatWithAgent')}
                                    sentryLabel={CONST.SENTRY_LABEL.AGENTS.CHAT}
                                >
                                    <Button.Icon src={icons.ChatBubble} />
                                </Button>
                                <Button
                                    size={CONST.BUTTON_SIZE.SMALL}
                                    onPress={item.onCopilotPress}
                                    isDisabled={areActionsDisabled}
                                    innerStyles={selectedButtonInnerStyle}
                                    accessibilityLabel={translate('editAgentPage.copilotIntoAccount')}
                                    sentryLabel={CONST.SENTRY_LABEL.AGENTS.COPILOT}
                                >
                                    <Button.Text>{translate('delegate.copilot')}</Button.Text>
                                </Button>
                                <Button
                                    size={CONST.BUTTON_SIZE.SMALL}
                                    onPress={item.action}
                                    isDisabled={!isEditable}
                                    innerStyles={selectedButtonInnerStyle}
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
