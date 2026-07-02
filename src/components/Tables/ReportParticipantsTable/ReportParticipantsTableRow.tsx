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
import type {ReportParticipantRowData} from '.';

type ReportParticipantsTableRowProps = {
    /** The participant item for the row */
    item: ReportParticipantRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

export default function ReportParticipantsTableRow({item, rowIndex, shouldUseNarrowTableLayout}: ReportParticipantsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    // Only admins surface a role, matching the production Members list where non-admins have no role indicator.
    const roleLabel = item.isGroupChat && item.isAdmin ? translate('common.admin') : '';
    const accessibilityLabel = roleLabel ? `${item.name}, ${item.email}, ${roleLabel}` : `${item.name}, ${item.email}`;
    const memberSubtitle = shouldUseNarrowTableLayout && roleLabel ? `${roleLabel} • ${item.email}` : item.email;

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
            offlineWithFeedback={{pendingAction: item.pendingAction}}
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

                    {!shouldUseNarrowTableLayout && item.isGroupChat && (
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
