import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useThemeStyles from '@hooks/useThemeStyles';

import {getMemberChangeMessageFragment, getOriginalMessage, isMemberChangeAction} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';

import TextCommentFragment from '@pages/inbox/report/comment/TextCommentFragment';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsListSelector, personalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {ReportAction} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type MemberChangeContentProps = {
    action: ReportAction<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG | typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>>;
};

function MemberChangeContent({action}: MemberChangeContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const reportAttributes = useReportAttributes();
    const memberChangeLogReportActionMessage = isMemberChangeAction(action) ? getOriginalMessage(action) : undefined;
    const [actorDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector(action.actorAccountID)});
    const [targetAccountDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsListSelector(memberChangeLogReportActionMessage?.targetAccountIDs)});
    const [memberChangeLogRoomReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${memberChangeLogReportActionMessage?.reportID}`);
    const memberChangeLogRoomReportName = getReportName(memberChangeLogRoomReport, reportAttributes) || memberChangeLogReportActionMessage?.roomName;
    const fragment = getMemberChangeMessageFragment(translate, action, actorDetails, targetAccountDetailsList, memberChangeLogRoomReportName);

    return (
        <View style={[styles.chatItemMessage]}>
            <TextCommentFragment
                style={undefined}
                fragment={fragment}
                source=""
                displayAsGroup={false}
                styleAsDeleted={false}
            />
        </View>
    );
}

export default MemberChangeContent;
