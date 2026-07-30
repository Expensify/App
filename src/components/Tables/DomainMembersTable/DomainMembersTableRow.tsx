import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Table from '@components/Table';
import {getCellAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import TextWithTooltip from '@components/TextWithTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {DomainMemberRowData} from '.';

type DomainMembersTableRowProps = {
    /** Data about the domain member */
    item: DomainMemberRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** Whether the group column should be shown */
    shouldShowGroupColumn: boolean;
};

export default function DomainMembersTableRow({item, rowIndex, shouldUseNarrowTableLayout, shouldShowGroupColumn}: DomainMembersTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const shouldShowGroupInColumn = shouldShowGroupColumn && !shouldUseNarrowTableLayout;
    let memberSubtitle = item.email;
    if (shouldUseNarrowTableLayout && shouldShowGroupColumn) {
        memberSubtitle = `${item.groupName} • ${item.email}`;
    }
    const accessibilityLabel = [item.name, shouldShowGroupColumn ? item.groupName : null, item.email].filter(Boolean).join(', ');

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
            sentryLabel={CONST.SENTRY_LABEL.DOMAIN.MEMBERS.ROW}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
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
                            fallbackDisplayName={item.name}
                            shouldShowTooltip
                            secondaryAvatarContainerStyle={getSecondaryAvatarContainerStyle(!!hovered)}
                        />
                        <View style={[shouldUseNarrowTableLayout && styles.gap1, styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.name}
                                style={[styles.optionDisplayName, styles.pre]}
                                numberOfLines={1}
                            />
                            <TextWithTooltip
                                shouldShowTooltip
                                text={memberSubtitle}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                numberOfLines={1}
                            />
                        </View>
                    </View>

                    {shouldShowGroupInColumn && (
                        <View
                            style={[styles.justifyContentCenter, styles.flex1]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            <TextWithTooltip
                                shouldShowTooltip
                                numberOfLines={1}
                                text={item.groupName}
                                style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                            />
                        </View>
                    )}

                    <View {...getCellAccessibilityProps(isTableSemanticsEnabled)}>
                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, (!hovered || item.disabled) && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </Table.Row>
    );
}
