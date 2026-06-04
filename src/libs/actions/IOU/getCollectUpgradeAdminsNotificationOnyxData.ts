import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import DateUtils from '@libs/DateUtils';
import {getDisplayNameOrDefault, getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {isCollectPolicy} from '@libs/PolicyUtils';
import {buildOptimisticAddCommentReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

type CollectUpgradeAdminsNotificationOnyxData = {
    optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>;
    successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>;
    failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>;
};

function getCollectUpgradeAdminsNotificationOnyxData({
    translate,
    policy,
    upgraderAccountID,
    currentUserEmail,
    delegateAccountID,
}: {
    translate: LocalizedTranslate;
    policy: OnyxEntry<Policy>;
    upgraderAccountID: number;
    currentUserEmail: string;
    delegateAccountID: number | undefined;
}): CollectUpgradeAdminsNotificationOnyxData | null {
    if (!isCollectPolicy(policy)) {
        return null;
    }

    const adminsReportID = policy?.chatReportIDAdmins?.toString();
    if (!adminsReportID) {
        return null;
    }

    const personalDetail = getPersonalDetailsByIDs({accountIDs: [upgraderAccountID], currentUserAccountID: upgraderAccountID})?.at(0);
    const upgraderName = getDisplayNameOrDefault(personalDetail, translate('common.hidden'));
    const message = translate('workspace.upgrade.adminsCollectUpgradeMessage', upgraderName);

    const conciergeAccountID = CONST.ACCOUNT_ID.CONCIERGE;
    const {reportAction} = buildOptimisticAddCommentReportAction({
        text: message,
        actorAccountID: conciergeAccountID,
        reportID: adminsReportID,
        currentUserAccountID: upgraderAccountID,
        currentUserEmail,
        delegateAccountIDParam: delegateAccountID,
    });

    reportAction.person = [{style: 'strong', text: CONST.CONCIERGE_DISPLAY_NAME, type: 'TEXT'}];

    const optimisticReportActionID = reportAction.reportActionID;
    const currentTime = DateUtils.getDBTime();

    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsReportID}`,
                value: {
                    [optimisticReportActionID]: {
                        ...reportAction,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${adminsReportID}`,
                value: {
                    lastVisibleActionCreated: reportAction.created,
                    lastMessageText: message,
                    lastActorAccountID: conciergeAccountID,
                    lastReadTime: currentTime,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsReportID}`,
                value: {
                    [optimisticReportActionID]: {
                        pendingAction: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsReportID}`,
                value: {
                    [optimisticReportActionID]: null,
                },
            },
        ],
    };
}

export default getCollectUpgradeAdminsNotificationOnyxData;
