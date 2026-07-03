import useConditionalCreateEmptyReportConfirmation from '@hooks/useConditionalCreateEmptyReportConfirmation';

import {act, renderHook} from '@testing-library/react-native';

const mockOpenCreateReportConfirmation = jest.fn();

let mockOnConfirmFromModal: ((val?: boolean) => void) | undefined;

jest.mock('@hooks/useCreateEmptyReportConfirmation', () => (params: {onConfirm: (val?: boolean) => void; onCancel?: () => void}) => {
    // Store the onConfirm so tests can simulate the modal confirming
    mockOnConfirmFromModal = params.onConfirm;
    return {openCreateReportConfirmation: mockOpenCreateReportConfirmation};
});

let mockShouldShowConfirmation = false;
jest.mock('@hooks/useShouldShowEmptyReportConfirmation', () => () => mockShouldShowConfirmation);

const policyID = 'policy-123';
const policyName = 'Test Workspace';

describe('useConditionalCreateEmptyReportConfirmation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockShouldShowConfirmation = false;
        mockOnConfirmFromModal = undefined;
    });

    it('calls onCreateReport directly when confirmation is not needed', () => {
        mockShouldShowConfirmation = false;
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

    it('opens confirmation modal when empty report confirmation should be shown', () => {
        mockShouldShowConfirmation = true;
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

    it('skips confirmation when shouldBypassConfirmation is true even when confirmation would be shown', () => {
        mockShouldShowConfirmation = false;
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

    it('returns hasEmptyReport true when confirmation should be shown', () => {
        mockShouldShowConfirmation = true;
        const {result} = renderHook(() =>
            useConditionalCreateEmptyReportConfirmation({
                policyID,
                policyName,
                onCreateReport: jest.fn(),
            }),
        );

        expect(result.current.hasEmptyReport).toBe(true);
    });

    it('returns hasEmptyReport false when confirmation is not needed', () => {
        mockShouldShowConfirmation = false;
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
        mockShouldShowConfirmation = true;
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
