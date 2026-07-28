import {getDefaultWorkspaceAvatar, getIcons} from '@libs/ReportUtils';
import {getSearchReportAvatarProps} from '@libs/SearchUIUtils';
import type {AvatarSource} from '@libs/UserUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import type IconAsset from '@src/types/utils/IconAsset';

import Onyx from 'react-native-onyx';

import {actionR14932} from '../../../__mocks__/reportData/actions';
import personalDetails from '../../../__mocks__/reportData/personalDetails';
import {policy420A} from '../../../__mocks__/reportData/policies';
import {chatReportR14932, iouReportR14932} from '../../../__mocks__/reportData/reports';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const parseSource = (source: AvatarSource | IconAsset): string => {
    if (typeof source === 'string') {
        return source;
    }
    if (typeof source === 'object' && 'name' in source) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return source.name as string;
    }
    if (typeof source === 'object' && 'uri' in source) {
        return source.uri ?? 'No Source';
    }
    if (typeof source === 'function') {
        return source.name;
    }
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return source?.toString() ?? 'No Source';
};

const LOGGED_USER_ID = iouReportR14932.ownerAccountID;
const SECOND_USER_ID = iouReportR14932.managerID;
const formatPhoneNumber: (phoneNumber: string) => string = (phone) => phone;

const policy = {
    ...policy420A,
    name: 'XYZ',
    id: 'WORKSPACE_POLICY',
};

const personalPolicy = {
    ...policy420A,
    name: 'Test user expenses',
    id: 'PERSONAL_POLICY',
    type: CONST.POLICY.TYPE.PERSONAL,
};

const expenseReport = {
    ...iouReportR14932,
    reportID: 'EXPENSE_REPORT',
    policyID: policy.id,
    type: CONST.REPORT.TYPE.EXPENSE,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
};

const iouReport = {
    ...iouReportR14932,
    reportID: 'IOU_REPORT',
    policyID: personalPolicy.id,
    type: CONST.REPORT.TYPE.IOU,
    chatType: undefined,
};

const chatReport = {
    ...chatReportR14932,
    reportID: 'CHAT_REPORT',
    policyID: policy.id,
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
};

const reportChatDM = {
    ...chatReportR14932,
    chatType: undefined,
    reportID: 'CHAT_REPORT_DM',
    policyID: personalPolicy.id,
    type: CONST.REPORT.TYPE.CHAT,
};

const reportPreviewDMAction = {
    ...actionR14932,
    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
    reportActionID: 'REPORT_PREVIEW_DM',
    childReportID: 'IOU_REPORT_DM',
};

const reportPreviewSingleTransactionDMAction = {
    ...actionR14932,
    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
    reportActionID: 'REPORT_PREVIEW_SINGLE_ACTION_DM',
    childReportID: 'IOU_REPORT_SINGLE_EXPENSE_DM',
    childOwnerAccountID: LOGGED_USER_ID,
    childManagerAccountID: SECOND_USER_ID,
};

const tripPreviewAction = {
    ...actionR14932,
    actionName: CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW,
    reportActionID: 'TRIP_PREVIEW',
    childReportID: 'IOU_REPORT_TRIP',
};

const iouDMReport = {
    ...iouReportR14932,
    reportID: 'IOU_REPORT_DM',
    chatReportID: reportChatDM.reportID,
    parentReportActionID: reportPreviewDMAction.reportActionID,
    policyID: personalPolicy.id,
    type: CONST.REPORT.TYPE.IOU,
    chatType: undefined,
};

const iouDMSingleExpenseReport = {
    ...iouReportR14932,
    reportID: 'IOU_REPORT_SINGLE_EXPENSE_DM',
    chatReportID: reportChatDM.reportID,
    parentReportActionID: reportPreviewSingleTransactionDMAction.reportActionID,
    policyID: personalPolicy.id,
};

const iouTripReport = {
    ...iouReportR14932,
    reportID: 'IOU_REPORT_TRIP',
    chatReportID: chatReport.reportID,
    parentReportActionID: tripPreviewAction.reportActionID,
    policyID: policy.id,
};

const DEFAULT_WORKSPACE_AVATAR = getDefaultWorkspaceAvatar(policy.name);
const USER_AVATAR = personalDetails[LOGGED_USER_ID].avatar;
const SECOND_USER_AVATAR = personalDetails[SECOND_USER_ID].avatar;

const policiesCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policy, personalPolicy], (item) => item.id);
const reportsCollectionDataSet = toCollectionDataSet(
    ONYXKEYS.COLLECTION.REPORT,
    [expenseReport, iouReport, chatReport, reportChatDM, iouDMReport, iouDMSingleExpenseReport, iouTripReport],
    (report) => report.reportID,
);

const onyxState = {
    [ONYXKEYS.SESSION]: {accountID: LOGGED_USER_ID, email: personalDetails[LOGGED_USER_ID].login},
    [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
    ...policiesCollectionDataSet,
    ...reportsCollectionDataSet,
};

describe('getSearchReportAvatarProps', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: onyxState,
        });
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    afterAll(async () => {
        await Onyx.clear();
    });

    it('produces correct primaryAvatar and secondaryAvatar for expense reports', () => {
        const {primaryAvatar, secondaryAvatar} = getSearchReportAvatarProps(expenseReport, formatPhoneNumber, translateLocal, personalDetails, policy);

        expect(primaryAvatar).toBeDefined();
        expect(parseSource(primaryAvatar?.source ?? '')).toBe(USER_AVATAR);
        expect(primaryAvatar?.type).toBe(CONST.ICON_TYPE_AVATAR);
        expect(parseSource(secondaryAvatar?.source ?? '')).toBe(DEFAULT_WORKSPACE_AVATAR.name);
        expect(secondaryAvatar?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
    });

    it('returns SUBSCRIPT avatarType for expense reports', () => {
        const {avatarType} = getSearchReportAvatarProps(expenseReport, formatPhoneNumber, translateLocal, personalDetails, policy);
        expect(avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
    });

    it('produces correct icons for IOU reports (manager as primary, owner as secondary)', () => {
        const {primaryAvatar, secondaryAvatar} = getSearchReportAvatarProps(iouReport, formatPhoneNumber, translateLocal, personalDetails, personalPolicy);

        expect(parseSource(primaryAvatar?.source ?? '')).toBe(SECOND_USER_AVATAR);
        expect(parseSource(secondaryAvatar?.source ?? '')).toBe(USER_AVATAR);
    });

    it('returns MULTIPLE_DIAGONAL avatarType for personal policy IOU reports', () => {
        const {avatarType} = getSearchReportAvatarProps(iouReport, formatPhoneNumber, translateLocal, personalDetails, personalPolicy);
        expect(avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
    });

    it('uses SUBSCRIPT for workspace expense reports and MULTIPLE_DIAGONAL for personal IOU reports', () => {
        const expenseProps = getSearchReportAvatarProps(expenseReport, formatPhoneNumber, translateLocal, personalDetails, policy);
        expect(expenseProps.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);

        const iouProps = getSearchReportAvatarProps(iouReport, formatPhoneNumber, translateLocal, personalDetails, personalPolicy);
        expect(iouProps.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
    });

    it('produces correct icons for a trip report (user + workspace, subscript)', () => {
        const {primaryAvatar, secondaryAvatar, avatarType} = getSearchReportAvatarProps(iouTripReport, formatPhoneNumber, translateLocal, personalDetails, policy);

        expect(avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
        expect(parseSource(primaryAvatar?.source ?? '')).toBe(USER_AVATAR);
        expect(primaryAvatar?.type).toBe(CONST.ICON_TYPE_AVATAR);
        expect(parseSource(secondaryAvatar?.source ?? '')).toBe(DEFAULT_WORKSPACE_AVATAR.name);
        expect(secondaryAvatar?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
    });

    it('produces correct icons for a DM IOU report (manager + owner, diagonal multiple)', () => {
        const {primaryAvatar, secondaryAvatar, avatarType} = getSearchReportAvatarProps(iouDMReport, formatPhoneNumber, translateLocal, personalDetails, personalPolicy);

        expect(avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
        expect(parseSource(primaryAvatar?.source ?? '')).toBe(SECOND_USER_AVATAR);
        expect(primaryAvatar?.type).toBe(CONST.ICON_TYPE_AVATAR);
        expect(parseSource(secondaryAvatar?.source ?? '')).toBe(USER_AVATAR);
        expect(secondaryAvatar?.type).toBe(CONST.ICON_TYPE_AVATAR);
    });

    it('produces correct icons for a DM single-expense report (single user, no subscript)', () => {
        const {primaryAvatar, avatarType} = getSearchReportAvatarProps(iouDMSingleExpenseReport, formatPhoneNumber, translateLocal, personalDetails, personalPolicy);

        expect(avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
        expect(parseSource(primaryAvatar?.source ?? '')).toBe(USER_AVATAR);
        expect(primaryAvatar?.type).toBe(CONST.ICON_TYPE_AVATAR);
    });
});
