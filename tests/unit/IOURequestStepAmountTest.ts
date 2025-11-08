import {hasManuallySelectedParticipant} from '@pages/iou/request/step/IOURequestStepAmount';

jest.mock('@components/withCurrentUserPersonalDetails', () => (Component: unknown) => Component);
jest.mock('@pages/iou/request/step/withWritableReportOrNotFound', () => () => (Component: unknown) => Component);
jest.mock('@pages/iou/request/step/withFullTransactionOrNotFound', () => (Component: unknown) => Component);
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: jest.fn(),
    createNavigationContainerRef: jest.fn(() => ({
        current: null,
        isReady: jest.fn(() => true),
        navigate: jest.fn(),
    })),
}));

describe('IOURequestStepAmount - Participant Selection Logic', () => {
    describe('hasManuallySelectedParticipant', () => {
        const DEFAULT_WORKSPACE_REPORT_ID = '100';
        const DIFFERENT_WORKSPACE_REPORT_ID = '200';
        const P2P_ACCOUNT_ID = 5;

        it('should detect manually selected different workspace', () => {
            const firstParticipant = {
                reportID: DIFFERENT_WORKSPACE_REPORT_ID,
                isPolicyExpenseChat: true,
            };

            const result = hasManuallySelectedParticipant(firstParticipant, DEFAULT_WORKSPACE_REPORT_ID);

            expect(result.hasDifferentWorkspace).toBe(true);
            expect(result.isP2PChat).toBe(false);
            expect(result.hasManualSelection).toBe(true);
        });

        it('should detect manually selected P2P recipient', () => {
            const firstParticipant = {
                accountID: P2P_ACCOUNT_ID,
                isPolicyExpenseChat: false,
            };

            const result = hasManuallySelectedParticipant(firstParticipant, DEFAULT_WORKSPACE_REPORT_ID);

            expect(result.hasDifferentWorkspace).toBe(false);
            expect(result.isP2PChat).toBe(true);
            expect(result.hasManualSelection).toBe(true);
        });

        it('should NOT detect manual selection when no participant is selected', () => {
            const firstParticipant = undefined;

            const result = hasManuallySelectedParticipant(firstParticipant, DEFAULT_WORKSPACE_REPORT_ID);

            expect(result.hasDifferentWorkspace).toBe(false);
            expect(result.isP2PChat).toBe(false);
            expect(result.hasManualSelection).toBe(false);
        });

        it('should NOT detect manual selection when default workspace is selected', () => {
            const firstParticipant = {
                reportID: DEFAULT_WORKSPACE_REPORT_ID,
                isPolicyExpenseChat: true,
            };

            const result = hasManuallySelectedParticipant(firstParticipant, DEFAULT_WORKSPACE_REPORT_ID);

            expect(result.hasDifferentWorkspace).toBe(false);
            expect(result.isP2PChat).toBe(false);
            expect(result.hasManualSelection).toBe(false);
        });

        it('should handle participant with both accountID and reportID (workspace chat)', () => {
            const firstParticipant = {
                accountID: P2P_ACCOUNT_ID,
                reportID: DIFFERENT_WORKSPACE_REPORT_ID,
                isPolicyExpenseChat: true,
            };

            const result = hasManuallySelectedParticipant(firstParticipant, DEFAULT_WORKSPACE_REPORT_ID);

            expect(result.hasDifferentWorkspace).toBe(true);
            expect(result.isP2PChat).toBe(false);
            expect(result.hasManualSelection).toBe(true);
        });

        it('should handle participant with accountID but isPolicyExpenseChat is true', () => {
            const firstParticipant = {
                accountID: P2P_ACCOUNT_ID,
                isPolicyExpenseChat: true,
            };

            const result = hasManuallySelectedParticipant(firstParticipant, DEFAULT_WORKSPACE_REPORT_ID);

            expect(result.hasDifferentWorkspace).toBe(false);
            expect(result.isP2PChat).toBe(false);
            expect(result.hasManualSelection).toBe(false);
        });
    });
});
