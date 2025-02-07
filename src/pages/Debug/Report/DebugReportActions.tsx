import React, {useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import {getReportActionMessageText} from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type DebugReportActionsProps = {
    reportID: string;
};

function DebugReportActions({reportID}: DebugReportActionsProps) {
    const {translate, datetimeToCalendarTime} = useLocalize();
    const styles = useThemeStyles();
    const [searchValue, setSearchValue] = useState('');
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);
    const [sortedAllReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        selector: (allReportActions) => ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, canUserPerformWriteAction, true),
    });

    const searchedReportActions = useMemo(() => {
        return (sortedAllReportActions ?? [])
            .filter((reportAction) => reportAction.reportActionID.includes(searchValue) || getReportActionMessageText(reportAction).toLowerCase().includes(searchValue.toLowerCase()))
            .map((reportAction) => ({
                reportActionID: reportAction.reportActionID,
                text: getReportActionMessageText(reportAction),
                alternateText: `${reportAction.reportActionID} | ${datetimeToCalendarTime(reportAction.created, false, false)}`,
            }));
    }, [sortedAllReportActions, searchValue, datetimeToCalendarTime]);

    return (
        <ScrollView style={styles.mv3}>
            <Button
                success
                large
                text={translate('common.create')}
                onPress={() => Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION_CREATE.getRoute(reportID))}
                style={[styles.pb3, styles.ph3]}
            />
            <SelectionList
                sections={[{title: `Total Amount: ${searchedReportActions.length}`, data: searchedReportActions}]} // TODO: add translation for the Total Amount: text
                listItemTitleStyles={styles.fontWeightNormal}
                textInputValue={searchValue}
                textInputLabel={translate('common.search')}
                onChangeText={setSearchValue}
                onSelectRow={(item) => Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION.getRoute(reportID, item.reportActionID))}
                ListItem={RadioListItem}
            />
        </ScrollView>
    );
}

DebugReportActions.displayName = 'DebugReportActions';

export default DebugReportActions;
