import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Table from '@components/Table';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {WorkspaceMemberRowData} from '.';

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

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;

    const roleLabel = (() => {
        if (item.role === CONST.POLICY.ROLE.OWNER) {
            return translate('common.owner');
        } else if (item.role === CONST.POLICY.ROLE.ADMIN) {
            return translate('common.admin');
        } else if (item.role === CONST.POLICY.ROLE.AUDITOR) {
            return translate('common.auditor');
        } else if (item.role === CONST.POLICY.ROLE.EDITOR) {
            return translate('common.editor');
        }
        return '';
    })();

    const getSecondaryAvatarContainerStyle = (hovered: boolean) => [
        styleUtils.getBackgroundAndBorderStyle(theme.sidebar),
        hovered ? styleUtils.getBackgroundAndBorderStyle(styles.sidebarLinkHover?.backgroundColor ?? theme.sidebar) : undefined,
    ];

    return (
        <Table.Row
            rowIndex={rowIndex}
            interactive={!item.disabled}
            skeletonReasonAttributes={{context: 'WorkspaceMembersTableRow'}}
            onPress={item.action}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                dismissError: item.dismissError,
            }}
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
                            <Text
                                style={[styles.optionDisplayName, styles.pre]}
                                numberOfLines={1}
                            >
                                {item.name}
                            </Text>
                            <Text
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                numberOfLines={1}
                            >
                                {item.login}
                            </Text>
                        </View>
                    </View>

                    {shouldUseNarrowTableLayout && shouldShowCustomField1Column && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text numberOfLines={1}>{item.employeeUserID}</Text>
                        </View>
                    )}

                    {shouldUseNarrowTableLayout && shouldShowCustomField2Column && (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text numberOfLines={1}>{item.employeePayrollID}</Text>
                        </View>
                    )}

                    <View style={[!shouldUseNarrowTableLayout && styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <Badge
                            text={roleLabel}
                            badgeStyles={styles.ml0}
                        />
                    </View>

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
