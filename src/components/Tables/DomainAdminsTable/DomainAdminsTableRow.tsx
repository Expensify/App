import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {DomainAdminRowData} from '.';

type DomainAdminsTableRowProps = {
    /** Data about the domain admin */
    item: DomainAdminRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

export default function DomainAdminsTableRow({item, rowIndex, shouldUseNarrowTableLayout}: DomainAdminsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.X_SMALL;
    const primaryContactLabel = item.isPrimaryContact ? translate('domain.admins.primaryContact') : '';
    const accessibilityLabel = [item.name, item.email, primaryContactLabel].filter(Boolean).join(', ');

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
            sentryLabel={CONST.SENTRY_LABEL.DOMAIN.ADMINS.ROW}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
            }}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
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
                            />
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.email}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        </View>
                    </View>

                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3]}>
                        {item.isPrimaryContact && (
                            <Badge
                                text={translate('domain.admins.primaryContact')}
                                badgeStyles={styles.ml0}
                                isCondensed={shouldUseNarrowTableLayout}
                            />
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
