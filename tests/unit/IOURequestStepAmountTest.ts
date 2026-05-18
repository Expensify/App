import {isParticipantP2P} from '@pages/iou/request/step/IOURequestStepAmount';

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

describe('IOURequestStepAmount', () => {
    describe('isParticipantP2P', () => {
        it('should return true for P2P participant with accountID and isPolicyExpenseChat false', () => {
            const participant = {
                accountID: 123,
                isPolicyExpenseChat: false,
            };

            expect(isParticipantP2P(participant)).toBe(true);
        });

        it('should return false when participant is undefined', () => {
            expect(isParticipantP2P(undefined)).toBe(false);
        });

        it('should return false when participant has no accountID', () => {
            const participant = {
                isPolicyExpenseChat: false,
            };

            expect(isParticipantP2P(participant)).toBe(false);
        });

        it('should return false when participant is a policy expense chat', () => {
            const participant = {
                accountID: 123,
                isPolicyExpenseChat: true,
            };

            expect(isParticipantP2P(participant)).toBe(false);
        });

        it('should return false when accountID is 0', () => {
            const participant = {
                accountID: 0,
                isPolicyExpenseChat: false,
            };

            expect(isParticipantP2P(participant)).toBe(false);
        });

        it('should return true for P2P participant without isPolicyExpenseChat property', () => {
            const participant = {
                accountID: 456,
            };

            expect(isParticipantP2P(participant)).toBe(true);
        });
    });
});
