import type * as ReactNavigation from '@react-navigation/native';
import {renderHook} from '@testing-library/react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';
import useShouldSuppressConciergeIndicators from '@hooks/useShouldSuppressConciergeIndicators';
import useSidePanelState from '@hooks/useSidePanelState';
import ONYXKEYS from '@src/ONYXKEYS';

const CONCIERGE_REPORT_ID = '12345';
const CURRENT_USER_ACCOUNT_ID = 999;

const mockUseIsFocused = jest.fn().mockReturnValue(false);
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        useIsFocused: () => mockUseIsFocused(),
    };
});

const mockUseOnyx = useOnyx as jest.Mock;
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

const mockUseIsInSidePanel = useIsInSidePanel as jest.Mock;
jest.mock('@hooks/useIsInSidePanel', () => jest.fn(() => false));

const mockUseSidePanelState = useSidePanelState as jest.Mock;
jest.mock('@hooks/useSidePanelState', () => jest.fn(() => ({sessionStartTime: null})));

const mockUseCurrentUserPersonalDetails = useCurrentUserPersonalDetails as jest.Mock;
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: CURRENT_USER_ACCOUNT_ID})));

describe('useShouldSuppressConciergeIndicators', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(false);
        mockUseIsInSidePanel.mockReturnValue(false);
        mockUseSidePanelState.mockReturnValue({sessionStartTime: null});
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: CURRENT_USER_ACCOUNT_ID});
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('should return false for non-concierge report', () => {
        mockUseIsFocused.mockReturnValue(true);
        const {result} = renderHook(() => useShouldSuppressConciergeIndicators('other-report-id'));
        expect(result.current).toBe(false);
    });

    it('should suppress indicators when focused on concierge DM with no user messages', () => {
        mockUseIsFocused.mockReturnValue(true);
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`) {
                return [false, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(CONCIERGE_REPORT_ID));
        expect(result.current).toBe(true);
    });

    it('should not suppress when user has sent a message after session start', () => {
        mockUseIsFocused.mockReturnValue(true);
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`) {
                return [true, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(CONCIERGE_REPORT_ID));
        expect(result.current).toBe(false);
    });

    it('should use side panel session time when in side panel', () => {
        mockUseIsFocused.mockReturnValue(true);
        mockUseIsInSidePanel.mockReturnValue(true);
        mockUseSidePanelState.mockReturnValue({sessionStartTime: '2024-01-01 00:00:00.000'});
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`) {
                return [false, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(CONCIERGE_REPORT_ID));
        expect(result.current).toBe(true);
    });

    it('should reset session time on focus transition', () => {
        mockUseIsFocused.mockReturnValue(false);
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`) {
                return [false, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {result, rerender} = renderHook(() => useShouldSuppressConciergeIndicators(CONCIERGE_REPORT_ID));
        expect(result.current).toBe(false);

        mockUseIsFocused.mockReturnValue(true);
        rerender(undefined);

        expect(result.current).toBe(true);
    });
});
