import {render, screen} from '@testing-library/react-native';
import {View as MockedAvatarData} from 'react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ReportActionAvatars from '@components/ReportActionAvatars';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import type IconAsset from '@src/types/utils/IconAsset';
import {actionR14932} from '../../__mocks__/reportData/actions';
import personalDetails from '../../__mocks__/reportData/personalDetails';
import {policy420A} from '../../__mocks__/reportData/policies';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import {transactionR14932} from '../../__mocks__/reportData/transactions';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type AvatarProps = {
    source?: AvatarSource;
    name?: string;
    avatarID?: number | string;
    testID?: string;
};

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
        // If the source is a function, we assume it's an SVG component
        return source.name;
    }
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return source?.toString() ?? 'No Source';
};

jest.mock('@src/components/Avatar', () => {
    return ({source, name, avatarID, testID = 'Avatar'}: AvatarProps) => {
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

const chatReport = {
    ...chatReportR14932,
    reportID: 'CHAT_REPORT',
    policyID: policy.id,
};

const reportChatDM = {
    ...chatReportR14932,
    chatType: undefined,
    reportID: 'CHAT_REPORT_DM',
    policyID: personalPolicy.id,
    type: CONST.REPORT.TYPE.CHAT,
};

const reportPreviewAction = {
    ...actionR14932,
    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
    reportActionID: 'REPORT_PREVIEW',
    childReportID: 'IOU_REPORT',
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

const commentAction = {
    ...actionR14932,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    reportActionID: 'ADD_COMMENT',
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

const iouReport = {
    ...iouReportR14932,
    reportID: 'IOU_REPORT',
    chatReportID: chatReport.reportID,
    parentReportActionID: reportPreviewAction.reportActionID,
    policyID: policy.id,
};

const iouTripReport = {
    ...iouReportR14932,
    reportID: 'IOU_REPORT_TRIP',
    chatReportID: chatReport.reportID,
    parentReportActionID: tripPreviewAction.reportActionID,
    policyID: policy.id,
};

const iouActionOne = {
    ...actionR14932,
    originalMessage: {
        ...getOriginalMessage(actionR14932),
        IOUTransactionID: 'TRANSACTION_NUMBER_ONE',
        IOUReportID: iouDMReport.reportID,
    },
};

const iouActionTwo = {
    ...actionR14932,
    originalMessage: {
        ...getOriginalMessage(actionR14932),
        IOUTransactionID: 'TRANSACTION_NUMBER_TWO',
        IOUReportID: iouDMReport.reportID,
    },
};

const iouActionThree = {
    ...actionR14932,
    originalMessage: {
        ...getOriginalMessage(actionR14932),
        IOUTransactionID: 'TRANSACTION_NUMBER_THREE',
        IOUReportID: iouDMSingleExpenseReport.reportID,
    },
};

const transactions = [
    {
        ...transactionR14932,
        reportID: iouDMReport.reportID,
        transactionID: 'TRANSACTION_NUMBER_ONE',
    },
    {
        ...transactionR14932,
        reportID: iouDMReport.reportID,
        transactionID: 'TRANSACTION_NUMBER_TWO',
    },
    {
        ...transactionR14932,
        reportID: iouDMSingleExpenseReport.reportID,
        transactionID: 'TRANSACTION_NUMBER_THREE',
    },
];

const reports = [iouReport, iouTripReport, chatReport, iouDMReport, iouDMSingleExpenseReport, reportChatDM];
const policies = [policy, personalPolicy];

const DEFAULT_WORKSPACE_AVATAR = getDefaultWorkspaceAvatar(policies.at(0)?.name);
const USER_AVATAR = personalDetails[LOGGED_USER_ID].avatar;
const SECOND_USER_AVATAR = personalDetails[SECOND_USER_ID].avatar;

/* --- Onyx Mocks --- */

const transactionCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.TRANSACTION, transactions, (transaction) => transaction.transactionID);
const reportActionCollectionDataSet = {
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`]: {
        [reportPreviewAction.reportActionID]: reportPreviewAction,
        [tripPreviewAction.reportActionID]: tripPreviewAction,
        [commentAction.reportActionID]: commentAction,
    },
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportChatDM.reportID}`]: {
        [reportPreviewDMAction.reportActionID]: reportPreviewDMAction,
        [reportPreviewSingleTransactionDMAction.reportActionID]: reportPreviewSingleTransactionDMAction,
    },
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportPreviewDMAction.reportID}`]: {
        [iouActionOne.reportActionID]: iouActionOne,
        [iouActionTwo.reportActionID]: iouActionTwo,
    },
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportPreviewSingleTransactionDMAction.reportID}`]: {
        [iouActionThree.reportActionID]: iouActionThree,
    },
};

const reportCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT, reports, (report) => report.reportID);
const policiesCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, policies, (item) => item.id);

const onyxState = {
    [ONYXKEYS.SESSION]: {accountID: LOGGED_USER_ID, email: personalDetails[LOGGED_USER_ID].login},
    [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
    ...policiesCollectionDataSet,
    ...transactionCollectionDataSet,
    ...reportActionCollectionDataSet,
    ...reportCollectionDataSet,
};

/* --- Helpers --- */

function renderAvatar(props: Parameters<typeof ReportActionAvatars>[0]) {
    return render(
        <OnyxListItemProvider>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <ReportActionAvatars {...props} />
        </OnyxListItemProvider>,
    );
}

async function retrieveDataFromAvatarView(props: Parameters<typeof ReportActionAvatars>[0]) {
    renderAvatar(props);

    await waitForBatchedUpdatesWithAct();

    const images = screen.queryAllByTestId('MockedAvatarData');
    const icons = screen.queryAllByTestId('MockedIconData');
    const reportAvatarFragments = screen.queryAllByTestId('ReportActionAvatars-', {
        exact: false,
    });

    const imageData = images.map((img) => img.props.dataSet as AvatarData);
    const iconData = icons.map((icon) => icon.props.dataSet as AvatarData);
    const fragmentsData = reportAvatarFragments.map((fragment) => fragment.props.testID as string);

    return {
        images: imageData,
        icons: iconData,
        fragments: fragmentsData,
    };
}

function isSubscriptAvatarRendered({
    images,
    fragments,
    workspaceIconAsPrimaryAvatar,
    negate = false,
}: {
    images: AvatarData[];
    fragments: string[];
    workspaceIconAsPrimaryAvatar?: boolean;
    negate?: boolean;
}) {
    const isEveryAvatarFragmentASubscript = fragments.every((fragment) => fragment.startsWith('ReportActionAvatars-Subscript')) && fragments.length !== 0;
    const isUserAvatarCorrect = images.some(
        (image) => image.uri === USER_AVATAR && image.parent === `ReportActionAvatars-Subscript-${workspaceIconAsPrimaryAvatar ? 'SecondaryAvatar' : 'MainAvatar'}`,
    );
    const isWorkspaceAvatarCorrect = images.some(
        (image) => image.uri === DEFAULT_WORKSPACE_AVATAR.name && image.parent === `ReportActionAvatars-Subscript-${workspaceIconAsPrimaryAvatar ? 'MainAvatar' : 'SecondaryAvatar'}`,
    );

    expect(isEveryAvatarFragmentASubscript).toBe(!negate);
    expect(isWorkspaceAvatarCorrect).toBe(!negate);
    expect(isUserAvatarCorrect).toBe(!negate);
}

function isMultipleAvatarRendered({
    images,
    fragments,
    workspaceIconAsPrimaryAvatar,
    negate = false,
    secondUserAvatar,
    stacked,
}: {
    images: AvatarData[];
    fragments: string[];
    workspaceIconAsPrimaryAvatar?: boolean;
    negate?: boolean;
    secondUserAvatar?: string;
    stacked?: boolean;
}) {
    const isEveryAvatarFragmentAMultiple = fragments.every((fragment) => fragment.startsWith('ReportActionAvatars-MultipleAvatars')) && fragments.length !== 0;

    const isUserAvatarCorrect = images.some(
        (image) =>
            image.uri === USER_AVATAR &&
            image.parent ===
                (stacked
                    ? 'ReportActionAvatars-MultipleAvatars-StackedHorizontally-Avatar'
                    : `ReportActionAvatars-MultipleAvatars-${workspaceIconAsPrimaryAvatar ? 'SecondaryAvatar' : 'MainAvatar'}`),
    );
    const isWorkspaceAvatarCorrect = images.some(
        (image) =>
            image.uri === (secondUserAvatar ?? DEFAULT_WORKSPACE_AVATAR.name) &&
            image.parent ===
                (stacked
                    ? 'ReportActionAvatars-MultipleAvatars-StackedHorizontally-Avatar'
                    : `ReportActionAvatars-MultipleAvatars-${workspaceIconAsPrimaryAvatar ? 'MainAvatar' : 'SecondaryAvatar'}`),
    );

    expect(isEveryAvatarFragmentAMultiple).toBe(!negate);
    expect(isWorkspaceAvatarCorrect).toBe(!negate);
    expect(isUserAvatarCorrect).toBe(!negate);
}

function isSingleAvatarRendered({images, negate = false, userAvatar}: {images: AvatarData[]; negate?: boolean; userAvatar?: string}) {
    const isUserAvatarCorrect = images.some((image) => image.uri === (userAvatar ?? USER_AVATAR) && image.parent === 'ReportActionAvatars-SingleAvatar');

    expect(isUserAvatarCorrect).toBe(!negate);
}

describe('ReportActionAvatars', () => {
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

    describe('renders properly subscript avatars', () => {
        it('renders user primary avatar and workspace subscript next to report preview action', async () => {
            const retrievedData = await retrieveDataFromAvatarView({reportID: iouReport.reportID});
            isSubscriptAvatarRendered(retrievedData);
        });

        it('renders workspace avatar with user subscript avatar on chat report view', async () => {
            const retrievedData = await retrieveDataFromAvatarView({reportID: chatReport.reportID});
            isSubscriptAvatarRendered({...retrievedData, workspaceIconAsPrimaryAvatar: true});
        });

        it('renders user primary avatar and workspace subscript next to the trip preview', async () => {
            const retrievedData = await retrieveDataFromAvatarView({reportID: iouTripReport.reportID});
            isSubscriptAvatarRendered(retrievedData);
        });

        it('renders subscript avatar if the report preview action is provided instead of report ID', async () => {
            const retrievedData = await retrieveDataFromAvatarView({action: reportPreviewAction});
            isSubscriptAvatarRendered(retrievedData);
        });

        it("doesn't render subscript for user message in workspace if they are text messages", async () => {
            const retrievedData = await retrieveDataFromAvatarView({action: commentAction, reportID: iouReport.reportID});
            isSubscriptAvatarRendered({...retrievedData, negate: true});
        });

        it('properly converts subscript avatars to multiple avatars if the avatars are stacked horizontally', async () => {
            const retrievedData = await retrieveDataFromAvatarView({reportID: iouReport.reportID, horizontalStacking: true});
            isSubscriptAvatarRendered({...retrievedData, negate: true});
            isMultipleAvatarRendered({...retrievedData, stacked: true});
        });
    });

    describe('renders properly multiple and single avatars', () => {
        it('renders single avatar if only one account ID is passed even if reportID & action is passed as well', async () => {
            const retrievedData = await retrieveDataFromAvatarView({
                reportID: iouReport.reportID,
                action: reportPreviewAction,
                accountIDs: [SECOND_USER_ID],
            });
            isMultipleAvatarRendered({...retrievedData, negate: true});
            isSingleAvatarRendered({...retrievedData, userAvatar: SECOND_USER_AVATAR});
        });

        it('renders multiple avatars if more than one account ID is passed', async () => {
            const retrievedData = await retrieveDataFromAvatarView({accountIDs: [LOGGED_USER_ID, SECOND_USER_ID]});
            isMultipleAvatarRendered({...retrievedData, secondUserAvatar: SECOND_USER_AVATAR});
        });

        it('renders diagonal avatar if both DM chat members sent expense to each other in one report', async () => {
            const retrievedData = await retrieveDataFromAvatarView({reportID: iouDMReport.reportID});
            isMultipleAvatarRendered({...retrievedData, secondUserAvatar: SECOND_USER_AVATAR, workspaceIconAsPrimaryAvatar: true});
        });

        it('renders single avatar if only one chat member sent an expense to the other', async () => {
            const retrievedData = await retrieveDataFromAvatarView({reportID: iouDMSingleExpenseReport.reportID});
            isSingleAvatarRendered(retrievedData);
        });

        it('renders workspace avatar if policyID is passed as a prop', async () => {
            const retrievedData = await retrieveDataFromAvatarView({policyID: policy.id});
            isSingleAvatarRendered({...retrievedData, userAvatar: getDefaultWorkspaceAvatar(policy.name).name});
        });
    });
});
