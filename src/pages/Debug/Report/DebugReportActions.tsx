import {createPersonalDetailsSelector} from '@selectors/PersonalDetails';
import React, {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessageForNonUserList, getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getOriginalMessage, getReportActionMessage, getReportActionMessageText, getSortedReportActionsForDisplay, isCreatedAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, formatReportLastMessageText, getParticipantsAccountIDsForDisplay} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnyxInputOrEntry, PersonalDetails, PersonalDetailsList, ReportAction, ReportActions} from '@src/types/onyx';

type DebugReportActionsProps = {
    reportID: string;
};
const personalDetailSelector = (personalDetail: OnyxInputOrEntry<PersonalDetails>): OnyxInputOrEntry<PersonalDetails> =>
    personalDetail && {
        accountID: personalDetail.accountID,
        login: personalDetail.login,
        avatar: personalDetail.avatar,
        pronouns: personalDetail.pronouns,
    };

const personalDetailsSelector = (personalDetail: OnyxEntry<PersonalDetailsList>) => createPersonalDetailsSelector(personalDetail, personalDetailSelector);

function DebugReportActions({reportID}: DebugReportActionsProps) {
    const {translate, datetimeToCalendarTime, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const isReportArchived = useReportIsArchived(reportID);
    const ifUserCanPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector, canBeMissing: false});

    const getSortedAllReportActionsSelector = useCallback(
        (allReportActions: OnyxEntry<ReportActions>): ReportAction[] => {
            return getSortedReportActionsForDisplay(allReportActions, ifUserCanPerformWriteAction, true, undefined, reportID);
        },
        [ifUserCanPerformWriteAction, reportID],
    );

    const [sortedAllReportActions] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
        {
            canEvict: false,
            selector: getSortedAllReportActionsSelector,
            canBeMissing: true,
        },
        [getSortedAllReportActionsSelector],
    );
    const participantAccountIDs = getParticipantsAccountIDsForDisplay(report, undefined, undefined, true);
    const participantPersonalDetailList = Object.values(getPersonalDetailsForAccountIDs(participantAccountIDs, personalDetails as OnyxInputOrEntry<PersonalDetailsList>));

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
                return formatReportLastMessageText(
                    SidebarUtils.getWelcomeMessage(report, policy, participantPersonalDetailList, translate, localeCompare, isReportArchived).messageText ??
                        translate('report.noActivityYet'),
                );
            }

            if (reportActionMessage.html) {
                return Parser.htmlToText(reportActionMessage.html.replaceAll(/<mention-user accountID=(\d+)>\s*<\/mention-user>/gi, '<mention-user accountID="$1"/>'));
            }

            return getReportActionMessageText(reportAction);
        },
        [translate, report, policy, participantPersonalDetailList, localeCompare, isReportArchived],
    );

    const searchedReportActions = useMemo(() => {
        return (sortedAllReportActions ?? [])
            .filter(
                (reportAction) =>
                    reportAction.reportActionID.includes(debouncedSearchValue) || getReportActionDebugText(reportAction).toLowerCase().includes(debouncedSearchValue.toLowerCase()),
            )
            .map((reportAction) => ({
                reportActionID: reportAction.reportActionID,
                text: getReportActionDebugText(reportAction),
                alternateText: `${reportAction.reportActionID} | ${datetimeToCalendarTime(reportAction.created, false, false)}`,
                keyForList: reportAction.reportActionID,
            }));
    }, [sortedAllReportActions, debouncedSearchValue, getReportActionDebugText, datetimeToCalendarTime]);

    const textInputOptions = useMemo(
        () => ({
            value: searchValue,
            label: translate('common.search'),
            onChangeText: setSearchValue,
            headerMessage: getHeaderMessageForNonUserList(searchedReportActions.length > 0, debouncedSearchValue),
        }),
        [debouncedSearchValue, searchValue, searchedReportActions.length, setSearchValue, translate],
    );

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
                data={searchedReportActions}
                style={{listItemTitleStyles: styles.fontWeightNormal}}
                textInputOptions={textInputOptions}
                onSelectRow={(item) => Navigation.navigate(ROUTES.DEBUG_REPORT_ACTION.getRoute(reportID, item.reportActionID))}
                ListItem={RadioListItem}
            />
        </ScrollView>
    );
}

export default DebugReportActions;
