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

const onyxState = {
    [ONYXKEYS.SESSION]: {accountID: LOGGED_USER_ID, email: personalDetails[LOGGED_USER_ID].login},
    [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
    ...toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policy], (item) => item.id),
    ...toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT, [iouReport, chatReport], (report) => report.reportID),
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`]: {[reportPreviewAction.reportActionID]: reportPreviewAction},
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
});
