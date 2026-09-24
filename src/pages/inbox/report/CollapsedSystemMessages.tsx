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
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import ReportActionItemSingle from './ReportActionItemSingle';

type CollapsedSystemMessagesProps = {
    /** Number of canonical system actions represented by this row. */
    count: number;

    /** Oldest action supplies the standard avatar, actor name and timestamp. */
    earliestReportAction: ReportAction;

    report: OnyxEntry<Report>;

    /** Reveals every action in the run and removes this control. */
    onPress: () => void;

    /** The unread action represented by this collapsed row, if any. */
    unreadMarkerReportActionID?: string;
};

function CollapsedSystemMessages({count, earliestReportAction, report, onPress, unreadMarkerReportActionID}: CollapsedSystemMessagesProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const label = translate('report.collapsedSystemMessages', {count});

    return (
        <View>
            {!!unreadMarkerReportActionID && <UnreadActionIndicator reportActionID={unreadMarkerReportActionID} />}
            <ReportActionItemSingle
                action={earliestReportAction}
                report={report}
            >
                <PressableWithFeedback
                    onPress={onPress}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.alignSelfStart, styles.gap1]}
                    hoverStyle={styles.hoveredComponentBG}
                    accessibilityRole={CONST.ROLE.BUTTON}
                    accessibilityLabel={label}
                    accessibilityState={{expanded: false}}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT.COLLAPSED_SYSTEM_MESSAGES}
                >
                    <Text style={[styles.chatItemMessage, styles.colorMuted]}>{label}</Text>
                    <Icon
                        src={icons.DownArrow}
                        fill={theme.icon}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                        additionalStyles={styles.opacitySemiTransparent}
                    />
                </PressableWithFeedback>
            </ReportActionItemSingle>
        </View>
    );
}

export default CollapsedSystemMessages;
