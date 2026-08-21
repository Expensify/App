import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import UnreadActionIndicator from '@components/UnreadActionIndicator';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type CollapsedSystemMessagesProps = {
    /** Number of canonical system actions represented by this row. */
    count: number;

    /** Whether every action in the run is currently visible. */
    isExpanded: boolean;

    /** Expands or collapses the represented run. */
    onPress: () => void;

    /** The unread action represented by this collapsed row, if any. */
    unreadMarkerReportActionID?: string;
};

function CollapsedSystemMessages({count, isExpanded, onPress, unreadMarkerReportActionID}: CollapsedSystemMessagesProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);
    const label = translate('report.collapsedSystemMessages', {count, isExpanded});

    return (
        <View>
            {!!unreadMarkerReportActionID && <UnreadActionIndicator reportActionID={unreadMarkerReportActionID} />}
            <View style={styles.chatItem}>
                <PressableWithFeedback
                    onPress={onPress}
                    style={[styles.chatItemRightGrouped, styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.pv1]}
                    hoverStyle={styles.hoveredComponentBG}
                    accessibilityRole={CONST.ROLE.BUTTON}
                    accessibilityLabel={label}
                    accessibilityState={{expanded: isExpanded}}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT.COLLAPSED_SYSTEM_MESSAGES}
                >
                    <Text style={styles.textMicroSupporting}>{label}</Text>
                    <Icon
                        src={isExpanded ? icons.UpArrow : icons.DownArrow}
                        fill={theme.icon}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                        additionalStyles={styles.opacitySemiTransparent}
                    />
                </PressableWithFeedback>
            </View>
        </View>
    );
}

export default CollapsedSystemMessages;
