import React from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FlatList from '@components/FlatList';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';

type DebugReportActionsProps = {
    reportID: string;
};

function DebugReportActions({reportID}: DebugReportActionsProps) {
    const {translate, datetimeToCalendarTime} = useLocalize();
    const styles = useThemeStyles();
    const [sortedAllReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        selector: (allReportActions) => ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, true),
    });
    const renderItem = ({item}: ListRenderItemInfo<ReportAction>) => (
        <PressableWithFeedback
            accessibilityLabel={translate('common.details')}
            onPress={() => Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION.getRoute(reportID, item.reportActionID))}
            style={({pressed}) => [styles.flexRow, styles.justifyContentBetween, pressed && styles.hoveredComponentBG, styles.p4]}
            hoverStyle={styles.hoveredComponentBG}
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
            <FlatList
                data={sortedAllReportActions}
                renderItem={renderItem}
                scrollEnabled={false}
            />
        </ScrollView>
    );
}

DebugReportActions.displayName = 'DebugReportActions';

export default DebugReportActions;
