import {render, screen} from '@testing-library/react-native';

import {AvatarTooltipsProvider} from '@components/Avatar/tooltips/AvatarTooltipContext';
import type {UserAvatarProps} from '@components/Avatar/UserAvatar';
import type {WorkspaceAvatarProps} from '@components/Avatar/WorkspaceAvatar';
import ExpenseReportListItemAvatar from '@components/Search/SearchList/ListItem/ExpenseReportListItemRow/ExpenseReportListItemAvatar';
import type {ExpenseReportListItemType} from '@components/Search/SearchList/ListItem/types';

import {getDefaultWorkspaceAvatar, getIcons} from '@libs/ReportUtils';
import {getSearchReportAvatarProps} from '@libs/SearchUIUtils';
import type {AvatarSource} from '@libs/UserUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import type IconAsset from '@src/types/utils/IconAsset';

import {View as MockedAvatarData} from 'react-native';
import Onyx from 'react-native-onyx';

import {actionR14932} from '../../../../__mocks__/reportData/actions';
import personalDetails from '../../../../__mocks__/reportData/personalDetails';
import {policy420A} from '../../../../__mocks__/reportData/policies';
import {chatReportR14932, iouReportR14932} from '../../../../__mocks__/reportData/reports';
import createMock from '../../../utils/createMock';
import {translateLocal} from '../../../utils/TestHelper';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

type AvatarData = {
    uri: string;
    avatarID?: UserAvatarProps['accountID'] | WorkspaceAvatarProps['avatarID'];
    name?: string;
    parent: string;
};

const parseSource = (source: AvatarSource | IconAsset): string => {
    if (typeof source === 'string') {
        return source;
    }
    if (typeof source === 'object' && 'name' in source && typeof source.name === 'string') {
        return source.name;
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

jest.mock('@components/Search/SearchSelectionProvider', () => ({
    useRowSelection: () => ({isSelected: false}),
}));

jest.mock('@components/Avatar/UserAvatar', () => {
    return ({source, accountID, testID = 'Avatar'}: UserAvatarProps) => {
        return (
            <MockedAvatarData
                dataSet={{
                    avatarID: accountID,
                    uri: parseSource(source ?? '') || 'No Source',
                    parent: testID,
                }}
                testID="MockedAvatarData"
            />
        );
    };
});

jest.mock('@components/Avatar/WorkspaceAvatar', () => {
    return ({source, name, avatarID, testID = 'Avatar'}: WorkspaceAvatarProps) => {
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

function buildSearchListItem(report: Report, policyForReport: typeof policy): ExpenseReportListItemType {
    const avatarProps = getSearchReportAvatarProps(report, formatPhoneNumber, translateLocal, personalDetails, policyForReport);

    return createMock<ExpenseReportListItemType>({
        keyForList: report.reportID,
        isDisabled: false,
        groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        ...avatarProps,
    });
}

async function retrieveAvatarData(item: ExpenseReportListItemType) {
    render(
        <AvatarTooltipsProvider isEnabled={false}>
            <ExpenseReportListItemAvatar item={item} />
        </AvatarTooltipsProvider>,
    );

    await waitForBatchedUpdatesWithAct();

    const images = screen.queryAllByTestId('MockedAvatarData');
    const fragments = screen.queryAllByTestId('ReportActionAvatars-', {exact: false}).map((fragment) => {
        const testID: unknown = fragment.props.testID;
        if (typeof testID !== 'string') {
            throw new Error('Rendered report action avatar fragment is missing its test ID');
        }
        return testID;
    });

    return {
        images: images.map((img): AvatarData => {
            const dataSet: unknown = img.props.dataSet;
            if (typeof dataSet !== 'object' || dataSet === null || !('uri' in dataSet) || typeof dataSet.uri !== 'string' || !('parent' in dataSet) || typeof dataSet.parent !== 'string') {
                throw new Error('Rendered avatar data is missing its URI or parent');
            }

            const avatarID = 'avatarID' in dataSet ? dataSet.avatarID : undefined;
            const name = 'name' in dataSet ? dataSet.name : undefined;
            if (avatarID !== undefined && typeof avatarID !== 'number' && typeof avatarID !== 'string') {
                throw new Error('Rendered avatar data has an invalid avatar ID');
            }
            if (name !== undefined && typeof name !== 'string') {
                throw new Error('Rendered avatar data has an invalid name');
            }

            return {uri: dataSet.uri, parent: dataSet.parent, avatarID, name};
        }),
        fragments,
    };
}

describe('ExpenseReportListItemAvatar', () => {
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
            const item = buildSearchListItem(expenseReport, policy);
            const {images, fragments} = await retrieveAvatarData(item);

            expect(item.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            expect(fragments.every((f) => f.startsWith('ReportActionAvatars-Subscript'))).toBe(true);

            const mainAvatar = images.find((img) => img.parent === 'ReportActionAvatars-Subscript-MainAvatar');
            const secondaryAvatar = images.find((img) => img.parent === 'ReportActionAvatars-Subscript-SecondaryAvatar');

            expect(mainAvatar?.uri).toBe(USER_AVATAR);
            expect(secondaryAvatar?.uri).toBe(DEFAULT_WORKSPACE_AVATAR.name);
        });

        it('renders workspace primary avatar and user subscript for a policy expense chat', async () => {
            const item = buildSearchListItem(chatReport, policy);
            const {images, fragments} = await retrieveAvatarData(item);

            expect(item.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT);
            expect(fragments.every((f) => f.startsWith('ReportActionAvatars-Subscript'))).toBe(true);

            const mainAvatar = images.find((img) => img.parent === 'ReportActionAvatars-Subscript-MainAvatar');
            const secondaryAvatar = images.find((img) => img.parent === 'ReportActionAvatars-Subscript-SecondaryAvatar');

            expect(mainAvatar?.uri).toBe(DEFAULT_WORKSPACE_AVATAR.name);
            expect(secondaryAvatar?.uri).toBe(USER_AVATAR);
        });
    });

    describe('renders diagonal multiple avatars for IOU reports (both user avatars)', () => {
        it('renders manager as main and owner as secondary in diagonal layout for an IOU report', async () => {
            const item = buildSearchListItem(iouReport, personalPolicy);
            const {images, fragments} = await retrieveAvatarData(item);

            expect(item.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL);
            expect(fragments.some((f) => f.startsWith('ReportActionAvatars-MultipleAvatars'))).toBe(true);

            const mainAvatar = images.find((img) => img.parent === 'ReportActionAvatars-MultipleAvatars-MainAvatar');
            const secondaryAvatar = images.find((img) => img.parent === 'ReportActionAvatars-MultipleAvatars-SecondaryAvatar');

            expect(mainAvatar?.uri).toBe(SECOND_USER_AVATAR);
            expect(secondaryAvatar?.uri).toBe(USER_AVATAR);
        });
    });

    describe('renders single avatar for personal policy expense reports', () => {
        it('renders single user avatar for a DM single-expense report', async () => {
            const item = buildSearchListItem(iouDMSingleExpenseReport, personalPolicy);
            const {images} = await retrieveAvatarData(item);

            expect(item.avatarType).toBe(CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE);

            const singleAvatar = images.find((img) => img.parent === 'SingleAvatar');
            expect(singleAvatar).toBeDefined();
            expect(singleAvatar?.uri).toBe(USER_AVATAR);
        });
    });

    describe('handles edge cases', () => {
        it('returns nothing when primaryAvatar is undefined', async () => {
            render(
                <AvatarTooltipsProvider isEnabled={false}>
                    <ExpenseReportListItemAvatar item={createMock<ExpenseReportListItemType>({keyForList: 'empty', isDisabled: false})} />
                </AvatarTooltipsProvider>,
            );

            await waitForBatchedUpdatesWithAct();

            const images = screen.queryAllByTestId('MockedAvatarData');
            expect(images).toHaveLength(0);
        });

        it('returns nothing when primaryAvatar is undefined but secondaryAvatar is provided', async () => {
            const avatarIcons = getIcons(expenseReport, formatPhoneNumber, translateLocal, personalDetails, null, '', -1, policy);
            const {images} = await retrieveAvatarData(
                createMock<ExpenseReportListItemType>({
                    keyForList: expenseReport.reportID,
                    isDisabled: false,
                    secondaryAvatar: avatarIcons.at(1),
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT,
                }),
            );

            // The secondary avatar must not be promoted into the primary slot
            expect(images).toHaveLength(0);
        });

        it('renders single avatar when avatarType is SINGLE even if secondaryAvatar is provided', async () => {
            const avatarIcons = getIcons(expenseReport, formatPhoneNumber, translateLocal, personalDetails, null, '', -1, policy);
            const {images, fragments} = await retrieveAvatarData(
                createMock<ExpenseReportListItemType>({
                    keyForList: expenseReport.reportID,
                    isDisabled: false,
                    primaryAvatar: avatarIcons.at(0),
                    secondaryAvatar: avatarIcons.at(1),
                    avatarType: CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
                }),
            );

            const subscriptFragments = fragments.filter((f) => f.startsWith('ReportActionAvatars-Subscript'));
            expect(subscriptFragments).toHaveLength(0);

            const singleAvatar = images.find((img) => img.parent === 'SingleAvatar');
            expect(singleAvatar).toBeDefined();
            expect(singleAvatar?.uri).toBe(USER_AVATAR);
        });
    });
});
