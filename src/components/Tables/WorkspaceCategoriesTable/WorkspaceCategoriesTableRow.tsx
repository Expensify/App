import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Table from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {WorkspaceCategoryTableRowData} from '.';

type WorkspaceCategoriesTableRowProps = {
    /** Data about the category */
    item: WorkspaceCategoryTableRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** Whether the GL Code column is visible on web screens or not */
    shouldShowGLCodeColumn: boolean;

    /** Whether the approver column is visible on web screens or not */
    shouldShowApproverColumn: boolean;
};

export default function WorkspaceCategoriesTableRow({rowIndex, shouldUseNarrowTableLayout, shouldShowGLCodeColumn, shouldShowApproverColumn, item}: WorkspaceCategoriesTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const accessibilityLabel = [
        item.name,
        item.enabled ? translate('common.enabled') : translate('common.disabled'),
        shouldShowGLCodeColumn && item.glCode ? `${translate('workspace.categories.glCode')}: ${item.glCode}` : null,
        shouldShowApproverColumn && item.approverDisplayName ? `${translate('common.approver')}: ${item.approverDisplayName}` : null,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CATEGORIES.ROW}
            onPress={item.action}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                shouldHideOnDelete: false,
                onClose: item.dismissError,
            }}
        >
            {({hovered}) => (
                <>
                    <View
                        style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                    >
                        <TextWithTooltip
                            shouldShowTooltip
                            numberOfLines={1}
                            text={item.name}
                        />
                    </View>

                    {!shouldUseNarrowTableLayout && shouldShowGLCodeColumn && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.glCode ?? ''}
                            />
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowApproverColumn && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.gap2, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            {!!item.approverDisplayName && !!item.approverAccountID && (
                                <>
                                    <Avatar
                                        name={item.approverDisplayName}
                                        source={item.approverAvatar}
                                        type={CONST.ICON_TYPE_AVATAR}
                                        size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                                    />
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        numberOfLines={1}
                                        text={item.approverDisplayName ?? ''}
                                    />
                                </>
                            )}
                        </View>
                    )}

                    <View
                        style={[styles.justifyContentCenter, styles.alignItemsEnd]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                    >
                        <Switch
                            isOn={item.enabled}
                            showLockIcon={item.isLocked}
                            disabled={item.disabled}
                            accessibilityLabel={`${translate('workspace.categories.enableCategory')}: ${item.name}`}
                            onToggle={item.onToggleEnabled}
                        />
                    </View>

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
