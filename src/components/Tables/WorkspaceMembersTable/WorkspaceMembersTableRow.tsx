import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
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
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import type {WorkspaceMemberRowData} from '.';

import WorkspaceMemberRoleCell from './WorkspaceMemberRoleCell';

type WorkspaceMembersTableRowProps = {
    item: WorkspaceMemberRowData;
    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;

    /** Whether the custom field 1 column is visible on web screens or not */
    shouldShowCustomField1Column: boolean;

    /** Whether the custom field 2 column is visible on web screens or not */
    shouldShowCustomField2Column: boolean;

    /** Whether the approver column is visible on web screens or not */
    shouldShowApproverColumn: boolean;

    /** Whether the office location column is visible on web screens or not */
    shouldShowOfficeLocationColumn: boolean;

    /** Whether the bank account column is visible on web screens or not */
    shouldShowBankAccountColumn: boolean;

    /** Policy used to determine which roles can be assigned from the inline editor */
    policy: OnyxEntry<Policy>;
};

export default function WorkspaceMembersTableRow({
    item,
    rowIndex,
    shouldShowCustomField1Column,
    shouldShowCustomField2Column,
    shouldShowApproverColumn,
    shouldShowOfficeLocationColumn,
    shouldShowBankAccountColumn,
    shouldUseNarrowTableLayout,
    policy,
}: WorkspaceMembersTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const roleLabel = translate('workspace.common.roleName', item.role);
    const ownerLabel = item.isOwner ? translate('common.owner') : '';
    const bankAccountLabel =
        !shouldUseNarrowTableLayout && shouldShowBankAccountColumn && item.bankAccountLastFour ? `${translate('paymentMethodList.accountLastFour')} ${item.bankAccountLastFour}` : '';
    const approverLabel = shouldShowApproverColumn && item.approverDisplayName ? `${translate('common.approver')}: ${item.approverDisplayName}` : '';
    const accessibilityLabel = [item.name, ownerLabel, item.email, approverLabel, bankAccountLabel, roleLabel].filter(Boolean).join(', ');
    const memberSubtitle = !shouldUseNarrowTableLayout ? item.email : `${roleLabel} • ${item.email}`;

    return (
        <Table.Row
            interactive
            shouldAllowTextSelection
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.LIST_ROW}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
            }}
            onPress={item.action}
        >
            {(hovered) => (
                <>
                    <View
                        style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                    >
                        <View
                            style={styles.userSelectNone}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            <AccountAvatar
                                size={avatarSize}
                                accountID={item.accountID}
                                accountEmail={item.login}
                                fallbackDisplayName={item.name ?? item.email}
                            />
                        </View>
                        <View style={[shouldUseNarrowTableLayout && styles.gap1, styles.flex1]}>
                            <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                                <TextWithTooltip
                                    shouldShowTooltip
                                    text={item.name}
                                    style={[styles.optionDisplayName, styles.pre, styles.flexShrink1]}
                                    numberOfLines={1}
                                    isSelectable
                                />
                                {!!item.isOwner && (
                                    <Badge
                                        text={translate('common.owner')}
                                        textStyles={styles.textStrong}
                                        isCondensed={shouldUseNarrowTableLayout}
                                        badgeStyles={[styles.alignSelfCenter, styles.ml0]}
                                    />
                                )}
                            </View>
                            <TextWithTooltip
                                shouldShowTooltip
                                text={memberSubtitle}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                numberOfLines={1}
                                isSelectable
                            />
                        </View>
                    </View>

                    {!shouldUseNarrowTableLayout && shouldShowApproverColumn && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.gap2, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            {!!item.approverDisplayName && !!item.approverAccountID && (
                                <OfflineWithFeedback
                                    pendingAction={item.approverPendingAction}
                                    style={styles.flex1}
                                    contentContainerStyle={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}
                                >
                                    <AccountAvatar
                                        accountID={item.approverAccountID}
                                        accountEmail={item.approverLogin}
                                        fallbackDisplayName={item.approverDisplayName}
                                        size={CONST.AVATAR_SIZE.XXX_SMALL}
                                        containerStyle={StyleUtils.getWidthAndHeightStyle(variables.avatarSizeXxxSmall)}
                                    />
                                    <TextWithTooltip
                                        shouldShowTooltip
                                        numberOfLines={1}
                                        text={item.approverDisplayName}
                                    />
                                </OfflineWithFeedback>
                            )}
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowOfficeLocationColumn && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            {!!item.officeLocationName && (
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={item.officeLocationName}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                />
                            )}
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowCustomField1Column && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            {!!item.employeeUserID && (
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={item.employeeUserID}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    isSelectable
                                />
                            )}
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowCustomField2Column && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            {!!item.employeePayrollID && (
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={item.employeePayrollID}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                    isSelectable
                                />
                            )}
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowBankAccountColumn && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            {!!item.bankAccountLastFour && (
                                <TextWithTooltip
                                    shouldShowTooltip
                                    numberOfLines={1}
                                    text={bankAccountLabel}
                                    style={[styles.lh16, styles.optionDisplayName, styles.pre]}
                                />
                            )}
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.editableCellColumn]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled)}
                        >
                            <WorkspaceMemberRoleCell
                                role={item.role}
                                policy={policy}
                                memberLogin={item.login}
                                canEdit={item.canEditRole}
                                onSave={item.onChangeRole}
                            />
                        </View>
                    )}

                    <View {...getCellAccessibilityProps(isTableSemanticsEnabled)}>
                        <Icon
                            src={icons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, !hovered && styles.opacitySemiTransparent]}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </View>
                </>
            )}
        </Table.Row>
    );
}
