import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Table from '@components/Table';
import {useIsInTableGrid} from '@components/Table/TableSemantics';
import Text from '@components/Text';
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

import type {WorkspaceMemberRowData} from '.';

type WorkspaceMembersTableRowProps = {
    /** The member item for the row */
    item: WorkspaceMemberRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;

    /** Whether the custom field 1 column is visible on web screens or not */
    shouldShowCustomField1Column: boolean;

    /** Whether the custom field 2 column is visible on web screens or not */
    shouldShowCustomField2Column: boolean;
};

export default function WorkspaceMembersTableRow({item, rowIndex, shouldShowCustomField1Column, shouldShowCustomField2Column, shouldUseNarrowTableLayout}: WorkspaceMembersTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const cellRole = useIsInTableGrid() ? CONST.ROLE.CELL : undefined;

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const roleLabel = translate('workspace.common.roleName', item.role);
    const accessibilityLabel = `${item.name}, ${item.email}, ${roleLabel}`;
    const memberSubtitle = !shouldUseNarrowTableLayout ? item.email : `${roleLabel} • ${item.email}`;

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
            selectionLabel={`${item.name}, ${item.email}`}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.LIST_ROW}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
            }}
            route={item.route}
            onPress={item.action}
        >
            {(hovered) => {
                const memberName = (
                    <TextWithTooltip
                        shouldShowTooltip
                        text={item.name}
                        style={[styles.optionDisplayName, styles.pre]}
                        numberOfLines={1}
                    />
                );

                return (
                    <>
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            role={cellRole}
                        >
                            <View aria-hidden>
                                <ReportActionAvatars
                                    size={avatarSize}
                                    accountIDs={[item.accountID]}
                                    fallbackDisplayName={item.name ?? item.email}
                                    secondaryAvatarContainerStyle={getSecondaryAvatarContainerStyle(!!hovered)}
                                />
                            </View>

                            <View style={[shouldUseNarrowTableLayout && styles.gap1, styles.flex1]}>
                                <Table.RowLink
                                    accessibilityLabel={item.name}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.LIST_ROW}
                                >
                                    {memberName}
                                </Table.RowLink>
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={memberSubtitle}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                    numberOfLines={1}
                                />
                            </View>
                        </View>

                        {!shouldUseNarrowTableLayout && shouldShowCustomField1Column && (
                            <View
                                style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                                role={cellRole}
                            >
                                {!!item.employeeUserID && (
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        numberOfLines={1}
                                        text={item.employeeUserID}
                                        style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    />
                                )}
                            </View>
                        )}

                        {!shouldUseNarrowTableLayout && shouldShowCustomField2Column && (
                            <View
                                style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                                role={cellRole}
                            >
                                {!!item.employeePayrollID && (
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        numberOfLines={1}
                                        text={item.employeePayrollID}
                                        style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    />
                                )}
                            </View>
                        )}

                        {!shouldUseNarrowTableLayout && (
                            <View
                                style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                                role={cellRole}
                            >
                                <Text numberOfLines={1}>{roleLabel}</Text>
                            </View>
                        )}

                        <View aria-hidden>
                            <Icon
                                src={icons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, !hovered && styles.opacitySemiTransparent]}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </View>
                    </>
                );
            }}
        </Table.Row>
    );
}
