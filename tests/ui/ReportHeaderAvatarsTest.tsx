import {fireEvent, render, screen} from '@testing-library/react-native';

import type {UserAvatarProps} from '@components/Avatar/UserAvatar';
import type {WorkspaceAvatarProps} from '@components/Avatar/WorkspaceAvatar';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ReportHeaderAvatars from '@components/ReportHeaderAvatars';

import Navigation from '@navigation/Navigation';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';

import {View as MockedAvatarData} from 'react-native';
import Onyx from 'react-native-onyx';

import {actionR14932} from '../../__mocks__/reportData/actions';
import personalDetails from '../../__mocks__/reportData/personalDetails';
import {policy420A} from '../../__mocks__/reportData/policies';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

/* --- UI Mocks --- */

jest.mock('@components/Avatar/UserAvatar', () => {
    return ({testID = 'UserAvatar'}: UserAvatarProps) => {
        return <MockedAvatarData testID={testID} />;
    };
});

jest.mock('@components/Avatar/WorkspaceAvatar', () => {
    return ({testID = 'WorkspaceAvatar'}: WorkspaceAvatarProps) => {
        return <MockedAvatarData testID={testID} />;
    };
});

/* --- Data Mocks --- */

const LOGGED_USER_ID = iouReportR14932.ownerAccountID;

const policy = {
    ...policy420A,
    name: 'XYZ',
    id: 'WORKSPACE_POLICY',
};

const chatReport = {
    ...chatReportR14932,
    reportID: 'CHAT_REPORT',
    policyID: policy.id,
};

const reportPreviewAction = {
    ...actionR14932,
    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
    reportActionID: 'REPORT_PREVIEW',
    childReportID: 'IOU_REPORT',
};

const iouReport = {
    ...iouReportR14932,
    reportID: 'IOU_REPORT',
    chatReportID: chatReport.reportID,
    parentReportActionID: reportPreviewAction.reportActionID,
    policyID: policy.id,
};

const personalPolicy = {
    ...policy420A,
    name: 'Test user expenses',
    id: 'PERSONAL_POLICY',
    type: CONST.POLICY.TYPE.PERSONAL,
};

const dmChatReport = {
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

// Both DM members have expenses on this report (no single sender), so the header shows the diagonal layout
const iouDMReport = {
    ...iouReportR14932,
    reportID: 'IOU_REPORT_DM',
    chatReportID: dmChatReport.reportID,
    parentReportActionID: reportPreviewDMAction.reportActionID,
    policyID: personalPolicy.id,
    type: CONST.REPORT.TYPE.IOU,
    chatType: undefined,
};

const onyxState = {
    [ONYXKEYS.SESSION]: {accountID: LOGGED_USER_ID, email: personalDetails[LOGGED_USER_ID].login},
    [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
    ...toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policy, personalPolicy], (item) => item.id),
    ...toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT, [iouReport, chatReport, iouDMReport, dmChatReport], (report) => report.reportID),
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`]: {[reportPreviewAction.reportActionID]: reportPreviewAction},
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${dmChatReport.reportID}`]: {[reportPreviewDMAction.reportActionID]: reportPreviewDMAction},
};

const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

/* --- Helpers --- */

async function renderHeaderAvatars(reportID: string) {
    render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <ReportHeaderAvatars reportID={reportID} />
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );

    await waitForBatchedUpdatesWithAct();
}

describe('ReportHeaderAvatars', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: onyxState,
        });
        initOnyxDerivedValues();
        await IntlStore.load(CONST.LOCALES.EN);
        await waitForBatchedUpdates();
    });

    afterAll(async () => {
        await Onyx.clear();
    });

    beforeEach(() => {
        navigateSpy.mockClear();
    });

    it('renders both halves of the subscript avatar', async () => {
        await renderHeaderAvatars(iouReport.reportID);

        expect(screen.getByTestId('ReportActionAvatars-Subscript')).toBeOnTheScreen();
        expect(screen.getByTestId('ReportActionAvatars-Subscript-MainAvatar')).toBeOnTheScreen();
        expect(screen.getByTestId('ReportActionAvatars-Subscript-SecondaryAvatar')).toBeOnTheScreen();
    });

    it('gives the primary avatar and the subscript badge their own press target', async () => {
        await renderHeaderAvatars(iouReport.reportID);

        expect(screen.getAllByRole(CONST.ROLE.BUTTON)).toHaveLength(2);
    });

    it('opens the profile avatar when the primary avatar of a user + workspace subscript is pressed', async () => {
        await renderHeaderAvatars(iouReport.reportID);

        fireEvent.press(screen.getByLabelText(translateLocal('common.profile')));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(expect.stringContaining(`avatar/${LOGGED_USER_ID}`));
    });

    it('opens the workspace avatar when the subscript badge of a user + workspace subscript is pressed', async () => {
        await renderHeaderAvatars(iouReport.reportID);

        fireEvent.press(screen.getByLabelText(translateLocal('common.workspaces')));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.REPORT_AVATAR.getRoute(iouReport.reportID, policy.id));
    });

    it('opens the report avatar when a workspace-as-primary avatar is pressed', async () => {
        await renderHeaderAvatars(chatReport.reportID);

        fireEvent.press(screen.getByLabelText(translateLocal('common.workspaces')));

        expect(navigateSpy).toHaveBeenCalledTimes(1);
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.REPORT_AVATAR.getRoute(chatReport.reportID, policy.id));
    });

    it('renders diagonal avatars with their own press targets when both DM members have expenses on the report', async () => {
        await renderHeaderAvatars(iouDMReport.reportID);

        expect(screen.getByTestId('ReportActionAvatars-MultipleAvatars')).toBeOnTheScreen();
        expect(screen.getByTestId('ReportActionAvatars-MultipleAvatars-MainAvatar')).toBeOnTheScreen();
        expect(screen.getByTestId('ReportActionAvatars-MultipleAvatars-SecondaryAvatar')).toBeOnTheScreen();
        expect(screen.getAllByRole(CONST.ROLE.BUTTON)).toHaveLength(2);
    });

    it('navigates from each diagonal avatar independently', async () => {
        await renderHeaderAvatars(iouDMReport.reportID);

        const buttons = screen.getAllByRole(CONST.ROLE.BUTTON);
        for (const button of buttons) {
            fireEvent.press(button);
        }

        expect(navigateSpy).toHaveBeenCalledTimes(2);
        const [[firstRoute], [secondRoute]] = navigateSpy.mock.calls;
        expect(firstRoute).not.toBe(secondRoute);
    });
});
