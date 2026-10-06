import {renderHook} from '@testing-library/react-native';

import useShareActions from '@hooks/useShareActions';

import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

import createMock from '../../utils/createMock';

const REPORT_ID = 'report1';
const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ENVIRONMENT_URL = 'https://new.expensify.com';

const submittedReport: Report = {
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    managerID: OTHER_ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
};

let mockReport: Report | undefined = submittedReport;

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({
    __esModule: true,
    default: (path: string) => path,
}));

jest.mock('@libs/Clipboard', () => ({
    setString: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: () => ({environmentURL: ENVIRONMENT_URL}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: CURRENT_USER_ACCOUNT_ID}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [mockReport],
}));

function getShareOptions(policy?: Policy) {
    const {result} = renderHook(() => useShareActions({reportID: REPORT_ID, policy}));
    return result.current[CONST.REPORT.SECONDARY_ACTIONS.SHARE].subMenuItems ?? [];
}

describe('useShareActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockReport = submittedReport;
    });

    it('lists share report first for the submitter of a submitted report', () => {
        // Given a submitted expense report owned by the current user
        // When the share options are built
        const options = getShareOptions();

        // Then share report comes before the options every report has
        expect(options.map((option) => option.text)).toEqual(['common.shareReport', 'common.shareCode', 'referralProgram.referralFriend.header', 'qrCodes.copy']);
    });

    it('hides share report on an open report', () => {
        // Given the same report before it is submitted
        mockReport = {...submittedReport, stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN};

        // When the share options are built
        const options = getShareOptions();

        // Then a report that was never submitted cannot be emailed
        expect(options.map((option) => option.text)).not.toContain('common.shareReport');
    });

    it('hides share report from a member who is not the submitter, the approver or an admin', () => {
        // Given a submitted report that someone else owns and approves
        mockReport = {...submittedReport, ownerAccountID: OTHER_ACCOUNT_ID};

        // When the share options are built for a regular workspace member
        const memberOptions = getShareOptions(createMock<Policy>({id: 'policy1', role: CONST.POLICY.ROLE.USER}));

        // Then they cannot share it, while a workspace admin can
        expect(memberOptions.map((option) => option.text)).not.toContain('common.shareReport');
        const adminOptions = getShareOptions(createMock<Policy>({id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}));
        expect(adminOptions.at(0)?.text).toBe('common.shareReport');
    });

    it('opens the share report page', () => {
        // Given the share options of a report the current user can share
        const options = getShareOptions();

        // When share report is selected
        options.at(0)?.onSelected?.();

        // Then the picker for the recipient opens
        expect(Navigation.navigate).toHaveBeenCalledWith(DYNAMIC_ROUTES.REPORT_DETAILS_SHARE_REPORT.path);
    });

    it('copies the report URL', () => {
        // Given the share options of a report
        const options = getShareOptions();

        // When copy URL is selected
        options.at(-1)?.onSelected?.();

        // Then the link to the report is on the clipboard
        expect(Clipboard.setString).toHaveBeenCalledWith(`${ENVIRONMENT_URL}/${ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID)}`);
    });
});
