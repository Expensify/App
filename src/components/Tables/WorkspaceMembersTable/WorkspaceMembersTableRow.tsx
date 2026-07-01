import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Table from '@components/Table';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
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

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.X_SMALL;
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
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.LIST_ROW}
            offlineWithFeedback={{errors: item.errors, pendingAction: item.pendingAction, onClose: item.dismissError}}
            onPress={item.action}
        >
            {(hovered) => (
                <>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                        <ReportActionAvatars
                            size={avatarSize}
                            accountIDs={[item.accountID]}
                            fallbackDisplayName={item.name ?? item.email}
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

                    {!shouldUseNarrowTableLayout && shouldShowCustomField1Column && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text numberOfLines={1}>{item.employeeUserID}</Text>
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && shouldShowCustomField2Column && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text numberOfLines={1}>{item.employeePayrollID}</Text>
                        </View>
                    )}

                    {!shouldUseNarrowTableLayout && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text numberOfLines={1}>{roleLabel}</Text>
                        </View>
                    )}

                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={[styles.justifyContentCenter, styles.alignItemsCenter, !hovered && styles.opacitySemiTransparent]}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                </>
            )}
        </Table.Row>
    );
}
