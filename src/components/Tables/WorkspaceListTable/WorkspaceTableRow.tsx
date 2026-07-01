import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import Table from '@components/Table';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import Tooltip from '@components/Tooltip';
import WorkspacesListRowDisplayName from '@components/WorkspacesListRowDisplayName';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getUserFriendlyWorkspaceType} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {WorkspaceRowData} from '.';
import WorkspaceRowBrickRoadIndicator from './WorkspaceRowBrickRoadIndicator';
import WorkspaceRowThreeDotsMenu from './WorkspaceRowThreeDotsMenu';

type WorkspaceRowProps = {
    /** The workspace data */
    item: WorkspaceRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** Called when the user picks Delete in the row menu, so the page can mount the delete flow */
    onDeleteWorkspace: (policyID: string) => void;

    /** ID of the workspace with a deletion in progress, if any */
    pendingDeletePolicyID?: string;
};

export default function WorkspaceRow({item, shouldUseNarrowTableLayout, rowIndex, onDeleteWorkspace, pendingDeletePolicyID}: WorkspaceRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Building', 'FallbackWorkspaceAvatar', 'Hourglass']);

    const formattedOwnerName = item.ownerName ?? '';
    const formattedWorkspaceType = getUserFriendlyWorkspaceType(item.type, translate);
    const narrowWorkspaceLabel = `${translate('common.owner')}: ${formattedOwnerName} • ${formattedWorkspaceType}`;
    const itemDeletedStyles = item.isDeleted ? [styles.offlineFeedbackDeleted] : [{}];

    const accessibilityLabel = [
        `${translate('workspace.common.workspaceName')}: ${item.title}`,
        item.isDefault ? translate('common.default') : '',
        item.isJoinRequestPending ? translate('workspace.common.requested') : '',
        item.ownerName ? `${translate('workspace.common.workspaceOwner')}: ${item.ownerName}` : '',
        item.type ? `${translate('workspace.common.workspaceType')}: ${formattedWorkspaceType}` : '',
    ]
        .filter(Boolean)
        .join(', ');

    const JoinRequestPendingBadge = (
        <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Badge
                icon={icons.Hourglass}
                textStyles={styles.textStrong}
                text={translate('workspace.common.requested')}
                isCondensed={shouldUseNarrowTableLayout}
                badgeStyles={[styles.alignSelfCenter, styles.ml0]}
            />
        </View>
    );

    const DefaultWorkspaceBadge = (
        <Tooltip
            numberOfLines={4}
            maxWidth={variables.w184}
            text={translate('workspace.common.defaultNote')}
        >
            <View style={[styles.flexRow]}>
                <Badge
                    text={translate('common.default')}
                    textStyles={styles.textStrong}
                    isCondensed={shouldUseNarrowTableLayout}
                    badgeStyles={[styles.alignSelfCenter, styles.ml0]}
                />
            </View>
        </Tooltip>
    );

    const ThreeDotsMenuWithBrickRoadIndicator = (
        <View style={[styles.flexRow, styles.gap1]}>
            {item.role === CONST.POLICY.ROLE.ADMIN && <WorkspaceRowBrickRoadIndicator policyID={item.policyID} />}
            <WorkspaceRowThreeDotsMenu
                item={item}
                onDeleteWorkspace={onDeleteWorkspace}
                pendingDeletePolicyID={pendingDeletePolicyID}
            />
        </View>
    );

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.ROW}
            onPress={item.action}
            offlineWithFeedback={{
                errors: item.errors,
                shouldHideOnDelete: false,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
            }}
        >
            {({hovered}) => (
                <>
                    {shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                            <Avatar
                                name={item.title}
                                source={item.icon}
                                avatarID={item.policyID}
                                type={CONST.ICON_TYPE_WORKSPACE}
                                size={CONST.AVATAR_SIZE.DEFAULT}
                                imageStyles={styles.alignSelfCenter}
                                fallbackIcon={icons.FallbackWorkspaceAvatar}
                            />

                            <View style={[styles.flex1, styles.gap1]}>
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={item.title}
                                    style={itemDeletedStyles}
                                />

                                <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                                    {item.isDefault && DefaultWorkspaceBadge}
                                    {item.isJoinRequestPending && JoinRequestPendingBadge}
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.textLabelSupporting, styles.flex1]}
                                    >
                                        {narrowWorkspaceLabel}
                                    </Text>
                                </View>
                            </View>

                            {!item.isJoinRequestPending && ThreeDotsMenuWithBrickRoadIndicator}

                            <Icon
                                src={icons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <>
                            <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                                <Avatar
                                    name={item.title}
                                    source={item.icon}
                                    avatarID={item.policyID}
                                    type={CONST.ICON_TYPE_WORKSPACE}
                                    size={CONST.AVATAR_SIZE.SMALL}
                                    imageStyles={styles.alignSelfCenter}
                                    fallbackIcon={icons.FallbackWorkspaceAvatar}
                                />
                                <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, styles.flex1]}>
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        text={item.title}
                                        style={[itemDeletedStyles, styles.flexShrink1]}
                                    />
                                    {item.isDefault && DefaultWorkspaceBadge}
                                    {item.isJoinRequestPending && JoinRequestPendingBadge}
                                </View>
                            </View>

                            <View style={[styles.flex1, styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                                <Avatar
                                    source={item.ownerAvatar}
                                    avatarID={item.ownerAccountID}
                                    type={CONST.ICON_TYPE_AVATAR}
                                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                                />
                                <WorkspacesListRowDisplayName
                                    isDeleted={item.isDeleted}
                                    ownerName={formattedOwnerName}
                                />
                            </View>

                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                <Text
                                    numberOfLines={1}
                                    style={itemDeletedStyles}
                                >
                                    {formattedWorkspaceType}
                                </Text>
                            </View>

                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3, styles.wAuto]}>
                                {!item.isJoinRequestPending && ThreeDotsMenuWithBrickRoadIndicator}

                                <Icon
                                    src={icons.ArrowRight}
                                    fill={theme.icon}
                                    additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                />
                            </View>
                        </>
                    )}
                </>
            )}
        </Table.Row>
    );
}
