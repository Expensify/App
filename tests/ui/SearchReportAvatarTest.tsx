import {render, screen} from '@testing-library/react-native';
import {View as MockedAvatarData} from 'react-native';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import SearchReportAvatar from '@components/ReportActionAvatars/SearchReportAvatar';
import {getDefaultWorkspaceAvatar, getIcons} from '@libs/ReportUtils';
import {getSearchReportAvatarProps} from '@libs/SearchUIUtils';
import type {AvatarSource} from '@libs/UserUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import type IconAsset from '@src/types/utils/IconAsset';
import {actionR14932} from '../../__mocks__/reportData/actions';
import personalDetails from '../../__mocks__/reportData/personalDetails';
import {policy420A} from '../../__mocks__/reportData/policies';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type AvatarData = {
    uri: string;
    avatarID?: number;
    name?: string;
    parent: string;
};

/* --- UI Mocks --- */

const parseSource = (source: AvatarSource | IconAsset): string => {
    if (typeof source === 'string') {
        return source;
    }
    if (typeof source === 'object' && 'name' in source) {
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

jest.mock('@src/components/Avatar', () => {
    return ({source, name, avatarID, testID = 'Avatar'}: {source?: AvatarSource; name?: string; avatarID?: number | string; testID?: string}) => {
        return (
            <MockedAvatarData
                dataSet={{
                    name,
                    avatarID,
                    uri: parseSource(source ?? '') || 'No Source',
                    parent: testID,
                }}
                testID="MockedAvatarData"
            />
        );
    };
});

jest.mock('@src/components/Icon', () => {
    return ({src, testID = 'Avatar'}: {src: IconAsset; testID?: string}) => {
        return (
            <MockedAvatarData
                dataSet={{
                    uri: parseSource(src) || 'No Source',
                    parent: testID,
                }}
                testID="MockedIconData"
            />
        );
    };
});

/* --- Data Mocks --- */

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

/* --- Onyx Setup --- */

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

/* --- Helpers --- */

function renderSearchReportAvatar(props: {primaryAvatar?: Icon; secondaryAvatar?: Icon; avatarType?: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>; reportID: string}) {
    return render(
        <SearchReportAvatar
            primaryAvatar={props.primaryAvatar}
            secondaryAvatar={props.secondaryAvatar}
            avatarType={props.avatarType ?? CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE}
            shouldShowTooltip={false}
            subscriptAvatarBorderColor="transparent"
            reportID={props.reportID}
        />,
    );
}

async function retrieveAvatarData(props: {primaryAvatar?: Icon; secondaryAvatar?: Icon; avatarType?: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>; reportID: string}) {
    renderSearchReportAvatar(props);

    await waitForBatchedUpdatesWithAct();

    const images = screen.queryAllByTestId('MockedAvatarData');
    const fragments = screen.queryAllByTestId('ReportActionAvatars-', {exact: false}).map((fragment) => fragment.props.testID as string);

    return {
        images: images.map((img) => img.props.dataSet as AvatarData),
        fragments,
    };
}

/* --- Tests --- */

describe('SearchReportAvatar', () => {
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

    describe('renders subscript avatars for workspace-linked reports', () => {
        it('renders user primary avatar and workspace subscript for an expense report', async () => {
            const props = getSearchReportAvatarProps(expenseReport, formatPhoneNumber, personalDetails, policy);
            const {images, fragments} = await retrieveAvatarData({...props, reportID: expenseReport.reportID});

            expect(props.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            expect(fragments.every((f) => f.startsWith('ReportActionAvatars-Subscript'))).toBe(true);

            const mainAvatar = images.find((img) => img.parent === 'ReportActionAvatars-Subscript-MainAvatar');
            const secondaryAvatar = images.find((img) => img.parent === 'ReportActionAvatars-Subscript-SecondaryAvatar');

            expect(mainAvatar?.uri).toBe(USER_AVATAR);
            expect(secondaryAvatar?.uri).toBe(DEFAULT_WORKSPACE_AVATAR.name);
        });

        it('renders workspace primary avatar and user subscript for a policy expense chat', async () => {
            const props = getSearchReportAvatarProps(chatReport, formatPhoneNumber, personalDetails, policy);
            const {images, fragments} = await retrieveAvatarData({...props, reportID: chatReport.reportID});

            expect(props.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            expect(fragments.every((f) => f.startsWith('ReportActionAvatars-Subscript'))).toBe(true);

            const mainAvatar = images.find((img) => img.parent === 'ReportActionAvatars-Subscript-MainAvatar');
            const secondaryAvatar = images.find((img) => img.parent === 'ReportActionAvatars-Subscript-SecondaryAvatar');

            expect(mainAvatar?.uri).toBe(DEFAULT_WORKSPACE_AVATAR.name);
            expect(secondaryAvatar?.uri).toBe(USER_AVATAR);
        });

        it('renders user primary avatar and workspace subscript for a trip report', async () => {
            const props = getSearchReportAvatarProps(iouTripReport, formatPhoneNumber, personalDetails, policy);
            const {images, fragments} = await retrieveAvatarData({...props, reportID: iouTripReport.reportID});

            expect(props.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            expect(fragments.every((f) => f.startsWith('ReportActionAvatars-Subscript'))).toBe(true);

            const mainAvatar = images.find((img) => img.parent === 'ReportActionAvatars-Subscript-MainAvatar');
            const secondaryAvatar = images.find((img) => img.parent === 'ReportActionAvatars-Subscript-SecondaryAvatar');

            expect(mainAvatar?.uri).toBe(USER_AVATAR);
            expect(secondaryAvatar?.uri).toBe(DEFAULT_WORKSPACE_AVATAR.name);
        });
    });

    describe('renders diagonal multiple avatars for IOU reports (both user avatars)', () => {
        it('renders manager as main and owner as secondary in diagonal layout for an IOU report', async () => {
            const props = getSearchReportAvatarProps(iouReport, formatPhoneNumber, personalDetails, personalPolicy);
            const {images, fragments} = await retrieveAvatarData({...props, reportID: iouReport.reportID});

            expect(props.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
            expect(fragments.some((f) => f.startsWith('ReportActionAvatars-MultipleAvatars'))).toBe(true);

            const mainAvatar = images.find((img) => img.parent === 'ReportActionAvatars-MultipleAvatars-MainAvatar');
            const secondaryAvatar = images.find((img) => img.parent === 'ReportActionAvatars-MultipleAvatars-SecondaryAvatar');

            expect(mainAvatar?.uri).toBe(SECOND_USER_AVATAR);
            expect(secondaryAvatar?.uri).toBe(USER_AVATAR);
        });

        it('renders manager as main and owner as secondary in diagonal layout for a DM IOU report', async () => {
            const props = getSearchReportAvatarProps(iouDMReport, formatPhoneNumber, personalDetails, personalPolicy);
            const {images, fragments} = await retrieveAvatarData({...props, reportID: iouDMReport.reportID});

            expect(props.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
            expect(fragments.some((f) => f.startsWith('ReportActionAvatars-MultipleAvatars'))).toBe(true);

            const mainAvatar = images.find((img) => img.parent === 'ReportActionAvatars-MultipleAvatars-MainAvatar');
            const secondaryAvatar = images.find((img) => img.parent === 'ReportActionAvatars-MultipleAvatars-SecondaryAvatar');

            expect(mainAvatar?.uri).toBe(SECOND_USER_AVATAR);
            expect(secondaryAvatar?.uri).toBe(USER_AVATAR);
        });
    });

    describe('renders single avatar for personal policy expense reports', () => {
        it('renders single user avatar for a DM single-expense report', async () => {
            const props = getSearchReportAvatarProps(iouDMSingleExpenseReport, formatPhoneNumber, personalDetails, personalPolicy);
            const {images} = await retrieveAvatarData({...props, reportID: iouDMSingleExpenseReport.reportID});

            expect(props.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);

            const singleAvatar = images.find((img) => img.parent === 'ReportActionAvatars-SingleAvatar');
            expect(singleAvatar).toBeDefined();
            expect(singleAvatar?.uri).toBe(USER_AVATAR);
        });
    });

    describe('handles edge cases', () => {
        it('returns nothing when primaryAvatar is undefined', async () => {
            renderSearchReportAvatar({
                primaryAvatar: undefined,
                secondaryAvatar: undefined,
                avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
                reportID: 'NON_EXISTENT',
            });

            await waitForBatchedUpdatesWithAct();

            const images = screen.queryAllByTestId('MockedAvatarData');
            expect(images).toHaveLength(0);
        });

        it('renders single avatar when avatarType is SINGLE even if secondaryAvatar is provided', async () => {
            const avatarIcons = getIcons(expenseReport, formatPhoneNumber, personalDetails, null, '', -1, policy);
            const {images, fragments} = await retrieveAvatarData({
                primaryAvatar: avatarIcons.at(0),
                secondaryAvatar: avatarIcons.at(1),
                avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
                reportID: expenseReport.reportID,
            });

            const subscriptFragments = fragments.filter((f) => f.startsWith('ReportActionAvatars-Subscript'));
            expect(subscriptFragments).toHaveLength(0);

            const singleAvatar = images.find((img) => img.parent === 'ReportActionAvatars-SingleAvatar');
            expect(singleAvatar).toBeDefined();
            expect(singleAvatar?.uri).toBe(USER_AVATAR);
        });

        it('renders single avatar when secondaryAvatar is missing even if avatarType is SUBSCRIPT', async () => {
            const avatarIcons = getIcons(expenseReport, formatPhoneNumber, personalDetails, null, '', -1, policy);
            const {images} = await retrieveAvatarData({
                primaryAvatar: avatarIcons.at(0),
                secondaryAvatar: undefined,
                avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT,
                reportID: expenseReport.reportID,
            });

            const singleAvatar = images.find((img) => img.parent === 'ReportActionAvatars-SingleAvatar');
            expect(singleAvatar).toBeDefined();
            expect(singleAvatar?.uri).toBe(USER_AVATAR);
        });
    });

    describe('getSearchReportAvatarProps computes avatar props correctly', () => {
        it('produces correct primaryAvatar and secondaryAvatar for expense reports', () => {
            const {primaryAvatar, secondaryAvatar} = getSearchReportAvatarProps(expenseReport, formatPhoneNumber, personalDetails, policy);

            expect(primaryAvatar).toBeDefined();
            expect(parseSource(primaryAvatar?.source ?? '')).toBe(USER_AVATAR);
            expect(primaryAvatar?.type).toBe(CONST.ICON_TYPE_AVATAR);
            expect(parseSource(secondaryAvatar?.source ?? '')).toBe(DEFAULT_WORKSPACE_AVATAR.name);
            expect(secondaryAvatar?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        });

        it('returns SUBSCRIPT avatarType for expense reports', () => {
            const {avatarType} = getSearchReportAvatarProps(expenseReport, formatPhoneNumber, personalDetails, policy);
            expect(avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
        });

        it('produces correct icons for IOU reports (manager as primary, owner as secondary)', () => {
            const {primaryAvatar, secondaryAvatar} = getSearchReportAvatarProps(iouReport, formatPhoneNumber, personalDetails, personalPolicy);

            expect(parseSource(primaryAvatar?.source ?? '')).toBe(SECOND_USER_AVATAR);
            expect(parseSource(secondaryAvatar?.source ?? '')).toBe(USER_AVATAR);
        });

        it('returns MULTIPLE_DIAGONAL avatarType for personal policy IOU reports', () => {
            const {avatarType} = getSearchReportAvatarProps(iouReport, formatPhoneNumber, personalDetails, personalPolicy);
            expect(avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
        });

        it('uses SUBSCRIPT for workspace expense reports and MULTIPLE_DIAGONAL for personal IOU reports', () => {
            const expenseProps = getSearchReportAvatarProps(expenseReport, formatPhoneNumber, personalDetails, policy);
            expect(expenseProps.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);

            const iouProps = getSearchReportAvatarProps(iouReport, formatPhoneNumber, personalDetails, personalPolicy);
            expect(iouProps.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
        });

        it('produces correct icons for a trip report (user + workspace, subscript)', () => {
            const {primaryAvatar, secondaryAvatar, avatarType} = getSearchReportAvatarProps(iouTripReport, formatPhoneNumber, personalDetails, policy);

            expect(avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            expect(parseSource(primaryAvatar?.source ?? '')).toBe(USER_AVATAR);
            expect(primaryAvatar?.type).toBe(CONST.ICON_TYPE_AVATAR);
            expect(parseSource(secondaryAvatar?.source ?? '')).toBe(DEFAULT_WORKSPACE_AVATAR.name);
            expect(secondaryAvatar?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        });

        it('produces correct icons for a DM IOU report (manager + owner, diagonal multiple)', () => {
            const {primaryAvatar, secondaryAvatar, avatarType} = getSearchReportAvatarProps(iouDMReport, formatPhoneNumber, personalDetails, personalPolicy);

            expect(avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
            expect(parseSource(primaryAvatar?.source ?? '')).toBe(SECOND_USER_AVATAR);
            expect(primaryAvatar?.type).toBe(CONST.ICON_TYPE_AVATAR);
            expect(parseSource(secondaryAvatar?.source ?? '')).toBe(USER_AVATAR);
            expect(secondaryAvatar?.type).toBe(CONST.ICON_TYPE_AVATAR);
        });

        it('produces correct icons for a DM single-expense report (single user, no subscript)', () => {
            const {primaryAvatar, avatarType} = getSearchReportAvatarProps(iouDMSingleExpenseReport, formatPhoneNumber, personalDetails, personalPolicy);

            expect(avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);
            expect(parseSource(primaryAvatar?.source ?? '')).toBe(USER_AVATAR);
            expect(primaryAvatar?.type).toBe(CONST.ICON_TYPE_AVATAR);
        });
    });
});
