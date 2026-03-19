import {act, renderHook} from '@testing-library/react-native';
import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';

const mockOpenCreateReportConfirmation = jest.fn();

let mockOnConfirmFromModal: ((val?: boolean) => void) | undefined;

jest.mock('@hooks/useCreateEmptyReportConfirmation', () => (params: {onConfirm: (val?: boolean) => void; onCancel?: () => void}) => {
    // Store the onConfirm so tests can simulate the modal confirming
    mockOnConfirmFromModal = params.onConfirm;
    return {openCreateReportConfirmation: mockOpenCreateReportConfirmation};
});

let mockHasEmptyReport = false;
jest.mock('@hooks/useHasEmptyReportsForPolicy', () => () => mockHasEmptyReport);

let mockHasDismissedConfirmation: boolean | undefined;
jest.mock('@hooks/useOnyx', () => () => [mockHasDismissedConfirmation]);

const policyID = 'policy-123';
const policyName = 'Test Workspace';

describe('useConditionalCreateEmptyReportConfirmation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHasEmptyReport = false;
        mockHasDismissedConfirmation = undefined;
        mockOnConfirmFromModal = undefined;
    });

    it('calls onCreateReport directly when there is no empty report', () => {
        mockHasEmptyReport = false;
        const onCreateReport = jest.fn();

        const {result} = renderHook(() =>
            useConditionalCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onCreateReport,
            }),
        );

        act(() => {
            result.current.handleCreateReport();
        });

        expect(onCreateReport).toHaveBeenCalledWith(false);
        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
    });

    it('opens confirmation modal when there is an empty report and confirmation not dismissed', () => {
        mockHasEmptyReport = true;
        mockHasDismissedConfirmation = undefined;
        const onCreateReport = jest.fn();

        const {result} = renderHook(() =>
            useConditionalCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onCreateReport,
            }),
        );

        act(() => {
            result.current.handleCreateReport();
        });

        expect(mockOpenCreateReportConfirmation).toHaveBeenCalledTimes(1);
        expect(onCreateReport).not.toHaveBeenCalled();
    });

    it('skips confirmation when empty report exists but user previously dismissed it', () => {
        mockHasEmptyReport = true;
        mockHasDismissedConfirmation = true;
        const onCreateReport = jest.fn();

        const {result} = renderHook(() =>
            useConditionalCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onCreateReport,
            }),
        );

        act(() => {
            result.current.handleCreateReport();
        });

        expect(onCreateReport).toHaveBeenCalledWith(false);
        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
    });

    it('skips confirmation when shouldBypassConfirmation is true even with empty report', () => {
        mockHasEmptyReport = true;
        mockHasDismissedConfirmation = undefined;
        const onCreateReport = jest.fn();

        const {result} = renderHook(() =>
            useConditionalCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onCreateReport,
                shouldBypassConfirmation: true,
            }),
        );

        act(() => {
            result.current.handleCreateReport();
        });

        expect(onCreateReport).toHaveBeenCalledWith(false);
        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
    });

    it('returns hasEmptyReport from the underlying hook', () => {
        mockHasEmptyReport = true;
        const {result} = renderHook(() =>
            useConditionalCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onCreateReport: jest.fn(),
            }),
        );

        expect(result.current.hasEmptyReport).toBe(true);
    });

    it('returns hasEmptyReport false when no empty report exists', () => {
        mockHasEmptyReport = false;
        const {result} = renderHook(() =>
            useConditionalCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onCreateReport: jest.fn(),
            }),
        );

        expect(result.current.hasEmptyReport).toBe(false);
    });

    it('passes onConfirm callback through to useCreateEmptyReportConfirmation', () => {
        mockHasEmptyReport = true;
        const onCreateReport = jest.fn();

        renderHook(() =>
            useConditionalCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onCreateReport,
            }),
        );

        // Simulate the modal confirming with shouldDismissEmptyReportsConfirmation = true
        act(() => {
            mockOnConfirmFromModal?.(true);
        });

        expect(onCreateReport).toHaveBeenCalledWith(true);
    });
});
