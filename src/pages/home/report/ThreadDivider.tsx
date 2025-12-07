import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUserPerformWriteAction, navigateToLinkedReportAction} from '@libs/ReportUtils';
import type {Ancestor} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type ThreadDividerProps = {
    /** Thread ancestor */
    ancestor: Ancestor;

    /** Whether the link is disabled */
    isLinkDisabled?: boolean;
};

function ThreadDivider({ancestor, isLinkDisabled = false}: ThreadDividerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Thread'] as const);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const isReportArchived = useReportIsArchived(ancestor.report.reportID);

    return (
        <View
            style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.mt3, styles.mb1, styles.userSelectNone]}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
        >
            {isLinkDisabled ? (
                <>
                    <Icon
                        src={icons.Thread}
                        fill={theme.icon}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                    />
                    <Text style={[styles.threadDividerText, styles.textSupporting, styles.ml1, styles.userSelectNone]}>{translate('threads.thread')}</Text>
                </>
            ) : (
                <PressableWithoutFeedback
                    onPress={() => navigateToLinkedReportAction(ancestor, isInNarrowPaneModal, canUserPerformWriteAction(ancestor.report, isReportArchived), isOffline)}
                    accessibilityLabel={translate('threads.thread')}
                    role={CONST.ROLE.BUTTON}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                >
                    <Icon
                        src={icons.Thread}
                        fill={theme.link}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                    />
                    <Text style={[styles.threadDividerText, styles.link]}>{translate('threads.thread')}</Text>
                </PressableWithoutFeedback>
            )}
            {!ancestor.shouldDisplayNewMarker && <View style={[styles.threadDividerLine]} />}
        </View>
    );
}

ThreadDivider.displayName = 'ThreadDivider';
export default ThreadDivider;
