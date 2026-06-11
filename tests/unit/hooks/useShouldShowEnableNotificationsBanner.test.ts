import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {NotificationPermissionStatus} from '@libs/Notification/notificationPermission/types';
import useShouldShowEnableNotificationsBanner from '@pages/inbox/report/useShouldShowEnableNotificationsBanner';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

const CONCIERGE_REPORT_ID = '1';
const OTHER_REPORT_ID = '2';

const conciergeReport = {reportID: CONCIERGE_REPORT_ID} as Report;
const otherReport = {reportID: OTHER_REPORT_ID} as Report;

let mockCurrentPermission: NotificationPermissionStatus = 'default';

jest.mock('@libs/Notification/notificationPermission', () => ({
    __esModule: true,
    default: {
        getStatus: () => Promise.resolve(mockCurrentPermission),
        request: () => Promise.resolve(mockCurrentPermission),
    },
}));

describe('useShouldShowEnableNotificationsBanner', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockCurrentPermission = 'default';
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
    });

    it('returns false when the report is undefined', async () => {
        const {result} = renderHook(() => useShouldShowEnableNotificationsBanner(undefined));
        await waitFor(() => expect(result.current).toBe(false));
    });

    it('returns false in a non-Concierge report', async () => {
        const {result} = renderHook(() => useShouldShowEnableNotificationsBanner(otherReport));
        await waitFor(() => expect(result.current).toBe(false));
    });

    it('returns false when the user has already dismissed the banner this session', async () => {
        await Onyx.set(ONYXKEYS.RAM_ONLY_HAS_DISMISSED_CONCIERGE_NOTIFICATION_BANNER, true);
        const {result} = renderHook(() => useShouldShowEnableNotificationsBanner(conciergeReport));
        await waitFor(() => expect(result.current).toBe(false));
    });

    it('returns false when notifications are already granted', async () => {
        mockCurrentPermission = 'granted';
        const {result} = renderHook(() => useShouldShowEnableNotificationsBanner(conciergeReport));
        // Give the async probe a tick to resolve, then assert it stays false.
        await waitFor(() => expect(result.current).toBe(false));
    });

    it('returns false when notifications are denied', async () => {
        mockCurrentPermission = 'denied';
        const {result} = renderHook(() => useShouldShowEnableNotificationsBanner(conciergeReport));
        await waitFor(() => expect(result.current).toBe(false));
    });

    it('returns true in the Concierge report when permission is default and not dismissed', async () => {
        const {result} = renderHook(() => useShouldShowEnableNotificationsBanner(conciergeReport));
        await waitFor(() => expect(result.current).toBe(true));
    });
});
