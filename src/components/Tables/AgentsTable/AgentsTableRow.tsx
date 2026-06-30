import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Table from '@components/Table';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {AgentRowData} from '.';

type AgentsTableRowProps = {
    /** Data about the agent */
    item: AgentRowData;

    /** The index of the row relative to all other rows */
    rowIndex: number;

    /** Whether to use narrow table row layout */
    shouldUseNarrowTableLayout: boolean;
};

export default function AgentsTableRow({item, rowIndex, shouldUseNarrowTableLayout}: AgentsTableRowProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'DotIndicator']);

    const avatarSize = shouldUseNarrowTableLayout ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.SMALL;
    const isPendingDeletion = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const accessibilityLabel = [item.displayName, item.login].filter(Boolean).join(', ');

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
            sentryLabel={CONST.SENTRY_LABEL.AGENTS.TABLE_ROW}
            offlineWithFeedback={{
                errors: item.errors,
                pendingAction: item.pendingAction,
                onClose: item.dismissError,
                shouldHideOnDelete: false,
            }}
            onPress={item.action}
        >
            {({hovered}) => (
                <>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                        <ReportActionAvatars
                            size={avatarSize}
                            accountIDs={[item.accountID]}
                            fallbackDisplayName={item.displayName}
                            shouldShowTooltip
                            secondaryAvatarContainerStyle={getSecondaryAvatarContainerStyle(!!hovered)}
                        />
                        <View style={[shouldUseNarrowTableLayout && styles.gap1, styles.flex1]}>
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.displayName}
                                style={[styles.optionDisplayName, styles.pre, isPendingDeletion && styles.offlineFeedbackDeleted]}
                            />
                            <TextWithTooltip
                                shouldShowTooltip
                                text={item.login}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre, isPendingDeletion && styles.offlineFeedbackDeleted]}
                            />
                        </View>
                    </View>

                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap3]}>
                        {item.hasUpdateErrors && (
                            <Icon
                                src={icons.DotIndicator}
                                fill={theme.danger}
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
