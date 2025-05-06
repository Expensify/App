import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getOriginalMessage, getReportActionMessage, getReportActionMessageText, getSortedReportActionsForDisplay, isCreatedAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, formatReportLastMessageText} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';

type DebugReportActionsProps = {
    reportID: string;
};

function DebugReportActions({reportID}: DebugReportActionsProps) {
    const {translate, datetimeToCalendarTime} = useLocalize();
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const ifUserCanPerformWriteAction = canUserPerformWriteAction(report);
    const [sortedAllReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        selector: (allReportActions) => getSortedReportActionsForDisplay(allReportActions, ifUserCanPerformWriteAction, true),
    });

    const getReportActionDebugText = useCallback(
        (reportAction: ReportAction) => {
            const reportActionMessage = getReportActionMessage(reportAction);
            const originalMessage = getOriginalMessage(reportAction);

            if (!reportActionMessage) {
                return '';
            }

            if (!!reportActionMessage.deleted || (originalMessage && 'deleted' in originalMessage && originalMessage.deleted)) {
                return `[${translate('parentReportAction.deletedMessage')}]`;
            }

            if (isCreatedAction(reportAction)) {
                return formatReportLastMessageText(SidebarUtils.getWelcomeMessage(report, policy).messageText ?? translate('report.noActivityYet'));
            }

            if (reportActionMessage.html) {
                return Parser.htmlToText(reportActionMessage.html.replace(/<mention-user accountID=(\d+)>\s*<\/mention-user>/gi, '<mention-user accountID="$1"/>'));
            }

            return getReportActionMessageText(reportAction);
        },
        [translate, policy, report],
    );

    const searchedReportActions = useMemo(() => {
        return (sortedAllReportActions ?? [])
            .filter(
                (reportAction) =>
                    reportAction.reportActionID.includes(debouncedSearchValue) || getReportActionMessageText(reportAction).toLowerCase().includes(debouncedSearchValue.toLowerCase()),
            )
            .map((reportAction) => ({
                reportActionID: reportAction.reportActionID,
                text: getReportActionDebugText(reportAction),
                alternateText: `${reportAction.reportActionID} | ${datetimeToCalendarTime(reportAction.created, false, false)}`,
            }));
    }, [sortedAllReportActions, debouncedSearchValue, getReportActionDebugText, datetimeToCalendarTime]);

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
                headerMessage={getHeaderMessageForNonUserList(searchedReportActions.length > 0, debouncedSearchValue)}
                onChangeText={setSearchValue}
                onSelectRow={(item) => Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION.getRoute(reportID, item.reportActionID))}
                ListItem={RadioListItem}
            />
        </ScrollView>
    );
}

DebugReportActions.displayName = 'DebugReportActions';

export default DebugReportActions;
