import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Table from '@components/Table';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {WorkspaceTagTableRowData} from '.';

type WorkspaceTagsTableRowProps = {
    /** Data about the tag or tag list */
    item: WorkspaceTagTableRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** Whether the GL Code column is visible on web screens or not */
    shouldShowGLCodeColumn: boolean;

    /** Whether the approver column is visible on web screens or not */
    shouldShowApproverColumn: boolean;

    /** Whether the tag count column is visible on web screens or not */
    shouldShowTagCountColumn: boolean;
};

export default function WorkspaceTagsTableRow({
    item,
    rowIndex,
    shouldUseNarrowTableLayout,
    shouldShowGLCodeColumn,
    shouldShowApproverColumn,
    shouldShowTagCountColumn,
}: WorkspaceTagsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const tagCountSubtitle = item.tagCount !== undefined ? translate('workspace.tags.tagCount', {count: item.tagCount}) : '';

    let enabledStatusLabel = null;
    if (item.showEnabledSwitch) {
        enabledStatusLabel = item.enabled ? translate('common.enabled') : translate('common.disabled');
    }

    const accessibilityLabel = [
        item.name,
        tagCountSubtitle,
        enabledStatusLabel,
        item.showRequiredSwitch && item.required ? translate('common.required') : null,
        shouldShowGLCodeColumn && item.glCode ? `${translate('workspace.tags.glCode')}: ${item.glCode}` : null,
        shouldShowApproverColumn && item.approverDisplayName ? `${translate('common.approver')}: ${item.approverDisplayName}` : null,
    ]
        .filter(Boolean)
        .join(', ');

    const switchValue = item.showRequiredSwitch ? !!item.required : item.enabled;
    const switchAccessibilityLabel = item.showRequiredSwitch ? translate('workspace.tags.requiresTag') : translate('workspace.tags.enableTag');
    const handleSwitchToggle = item.showRequiredSwitch ? item.onToggleRequired : item.onToggleEnabled;
    const isSwitchControlDisabled = !!item.disabled || !!item.isSwitchDisabled;

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TAGS.ROW}
            onPress={item.action}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.onClose,
            }}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, shouldUseNarrowTableLayout && styles.gap1]}>
                        <TextWithTooltip
                            shouldShowTooltip
                            numberOfLines={1}
                            text={item.name}
                            style={styles.optionDisplayName}
                        />
                        {shouldUseNarrowTableLayout && !!tagCountSubtitle && (
                            <Text
                                numberOfLines={1}
                                style={styles.textLabelSupporting}
                            >
                                {tagCountSubtitle}
                            </Text>
                        )}
                    </View>

                    {!shouldUseNarrowTableLayout && shouldShowGLCodeColumn && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.glCode ?? ''}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowApproverColumn && (
                        <View style={[styles.flex1, styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                            {!!item.approverDisplayName && (
                                <>
                                    {!!item.approverAccountID && (
                                        <Avatar
                                            name={item.approverDisplayName}
                                            source={item.approverAvatar}
                                            type={CONST.ICON_TYPE_AVATAR}
                                            size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                                        />
                                    )}
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        numberOfLines={1}
                                        text={item.approverDisplayName}
                                    />
                                </>
                            )}
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowTagCountColumn && (
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <Text numberOfLines={1}>{tagCountSubtitle}</Text>
                        </View>
                    )}

                    {(item.showEnabledSwitch || item.showRequiredSwitch) && !!handleSwitchToggle && (
                        <View style={[styles.justifyContentCenter, styles.alignItemsEnd]}>
                            <Switch
                                isOn={switchValue}
                                showLockIcon={item.isLocked}
                                disabled={isSwitchControlDisabled}
                                accessibilityLabel={`${switchAccessibilityLabel}: ${item.name}`}
                                onToggle={handleSwitchToggle}
                            />
                        </View>
                    )}

                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </Table.Row>
    );
}
