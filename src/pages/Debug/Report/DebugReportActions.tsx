import React from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';

type DebugReportActionsProps = {
    reportID: string;
};

function DebugReportActions({reportID}: DebugReportActionsProps) {
    const {translate, datetimeToCalendarTime} = useLocalize();
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);
    const [sortedAllReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        selector: (allReportActions) => ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, canUserPerformWriteAction, true),
    });

    const renderItem = (item: ReportAction, index: number) => (
        <PressableWithFeedback
            accessibilityLabel={translate('common.details')}
            onPress={() => Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION.getRoute(reportID, item.reportActionID))}
            style={({pressed}) => [styles.flexRow, styles.justifyContentBetween, pressed && styles.hoveredComponentBG, styles.p4]}
            hoverStyle={styles.hoveredComponentBG}
            key={index}
        >
            <Text>{item.reportActionID}</Text>
            <Text style={styles.textLabelSupporting}>{datetimeToCalendarTime(item.created, false, false)}</Text>
        </PressableWithFeedback>
    );

    return (
        <ScrollView style={styles.mv5}>
            <Button
                success
                large
                text={translate('common.create')}
                onPress={() => Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION_CREATE.getRoute(reportID))}
                style={[styles.pb5, styles.ph3]}
            />
            {/* This list was previously rendered as a FlatList, but it turned out that it caused the component to flash in some cases,
            so it was replaced by this solution. */}
            {sortedAllReportActions?.map((item, index) => renderItem(item, index))}
        </ScrollView>
    );
}

DebugReportActions.displayName = 'DebugReportActions';

export default DebugReportActions;
