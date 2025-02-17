import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {getReportActionHtml, getReportActionMessageText, getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type DebugReportActionsProps = {
    reportID: string;
};

function DebugReportActions({reportID}: DebugReportActionsProps) {
    const {translate, datetimeToCalendarTime} = useLocalize();
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const ifUserCanPerformWriteAction = canUserPerformWriteAction(report);
    const [sortedAllReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        selector: (allReportActions) => getSortedReportActionsForDisplay(allReportActions, ifUserCanPerformWriteAction, true),
    });

    const searchedReportActions = useMemo(() => {
        return (sortedAllReportActions ?? [])
            .filter(
                (reportAction) =>
                    reportAction.reportActionID.includes(debouncedSearchValue) || getReportActionMessageText(reportAction).toLowerCase().includes(debouncedSearchValue.toLowerCase()),
            )
            .map((reportAction) => {
                const htmlMessage = getReportActionHtml(reportAction);
                return {
                    reportActionID: reportAction.reportActionID,
                    text: htmlMessage
                        ? Parser.htmlToText(htmlMessage.replace(/<mention-user accountID=(\d+)>\s*<\/mention-user>/gi, '<mention-user accountID="$1"/>'))
                        : getReportActionMessageText(reportAction),
                    alternateText: `${reportAction.reportActionID} | ${datetimeToCalendarTime(reportAction.created, false, false)}`,
                };
            });
    }, [sortedAllReportActions, debouncedSearchValue, datetimeToCalendarTime]);

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
                sections={[{data: searchedReportActions}]}
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
