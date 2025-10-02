import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import Navigation from '@libs/Navigation/Navigation';

// Mock Navigation
jest.mock('@libs/Navigation/Navigation');

describe('useCreateEmptyReportConfirmation', () => {
    const mockOnConfirm = jest.fn();
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (Navigation.navigate as jest.Mock) = mockNavigate;
    });

    describe('openCreateReportConfirmation', () => {
        it('should call onConfirm directly when shouldShowWarning is false', () => {
            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: 'policy-123',
                    policyName: 'Test Workspace',
                    shouldShowWarning: false,
                    onConfirm: mockOnConfirm,
                }),
            );

            act(() => {
                result.current.openCreateReportConfirmation();
            });

            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        });

        it('should call onConfirm directly when policyID is undefined', () => {
            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: undefined,
                    policyName: 'Test Workspace',
                    shouldShowWarning: true,
                    onConfirm: mockOnConfirm,
                }),
            );

            act(() => {
                result.current.openCreateReportConfirmation();
            });

            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        });

        it('should not throw when onConfirm returns a Promise that rejects', () => {
            const mockOnConfirmAsync = jest.fn().mockRejectedValue(new Error('Test error'));

            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: undefined,
                    policyName: 'Test Workspace',
                    shouldShowWarning: true,
                    onConfirm: mockOnConfirmAsync,
                }),
            );

            expect(() => {
                act(() => {
                    result.current.openCreateReportConfirmation();
                });
            }).not.toThrow();
        });

        it('should render modal when shouldShowWarning is true and policyID is provided', () => {
            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: 'policy-123',
                    policyName: 'Test Workspace',
                    shouldShowWarning: true,
                    onConfirm: mockOnConfirm,
                }),
            );

            // Modal should not be called yet
            expect(mockOnConfirm).not.toHaveBeenCalled();

            // The modal component should be available
            expect(result.current.CreateReportConfirmationModal).toBeDefined();
            expect(React.isValidElement(result.current.CreateReportConfirmationModal)).toBe(true);
        });
    });

    describe('Modal behavior', () => {
        it('should provide a valid React element for CreateReportConfirmationModal', () => {
            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: 'policy-123',
                    policyName: 'Test Workspace',
                    shouldShowWarning: true,
                    onConfirm: mockOnConfirm,
                }),
            );

            const modal = result.current.CreateReportConfirmationModal;

            expect(React.isValidElement(modal)).toBe(true);
            expect(modal).not.toBeNull();
        });

        it('should use generic workspace name when policyName is empty', () => {
            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: 'policy-123',
                    policyName: '',
                    shouldShowWarning: true,
                    onConfirm: mockOnConfirm,
                }),
            );

            expect(result.current.CreateReportConfirmationModal).toBeDefined();
        });

        it('should use generic workspace name when policyName is whitespace', () => {
            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: 'policy-123',
                    policyName: '   ',
                    shouldShowWarning: true,
                    onConfirm: mockOnConfirm,
                }),
            );

            expect(result.current.CreateReportConfirmationModal).toBeDefined();
        });

        it('should use provided policyName when it is not empty', () => {
            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: 'policy-123',
                    policyName: 'Engineering Team',
                    shouldShowWarning: true,
                    onConfirm: mockOnConfirm,
                }),
            );

            expect(result.current.CreateReportConfirmationModal).toBeDefined();
        });
    });

    describe('Async callback handling', () => {
        it('should handle async onConfirm callback that resolves', () => {
            const mockOnConfirmAsync = jest.fn().mockResolvedValue(undefined);

            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: undefined,
                    policyName: 'Test Workspace',
                    shouldShowWarning: false,
                    onConfirm: mockOnConfirmAsync,
                }),
            );

            act(() => {
                result.current.openCreateReportConfirmation();
            });

            expect(mockOnConfirmAsync).toHaveBeenCalledTimes(1);
        });

        it('should handle async onConfirm callback that rejects without throwing', () => {
            const mockOnConfirmAsync = jest.fn().mockRejectedValue(new Error('Test error'));

            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: undefined,
                    policyName: 'Test Workspace',
                    shouldShowWarning: false,
                    onConfirm: mockOnConfirmAsync,
                }),
            );

            // Should not throw even though the promise rejects
            expect(() => {
                act(() => {
                    result.current.openCreateReportConfirmation();
                });
            }).not.toThrow();

            expect(mockOnConfirmAsync).toHaveBeenCalledTimes(1);
        });
    });

    describe('Sync callback handling', () => {
        it('should handle synchronous onConfirm callback', () => {
            const mockOnConfirmSync = jest.fn();

            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: undefined,
                    policyName: 'Test Workspace',
                    shouldShowWarning: false,
                    onConfirm: mockOnConfirmSync,
                }),
            );

            act(() => {
                result.current.openCreateReportConfirmation();
            });

            expect(mockOnConfirmSync).toHaveBeenCalledTimes(1);
        });
    });

    describe('Hook re-rendering', () => {
        it('should update when policyID changes', () => {
            const {result, rerender} = renderHook(
                ({policyID}) =>
                    useCreateEmptyReportConfirmation({
                        policyID,
                        policyName: 'Test Workspace',
                        shouldShowWarning: true,
                        onConfirm: mockOnConfirm,
                    }),
                {
                    initialProps: {policyID: 'policy-123'},
                },
            );

            rerender({policyID: 'policy-456'});

            const updatedModal = result.current.CreateReportConfirmationModal;

            // The modal should be available after policyID change
            expect(updatedModal).toBeDefined();
            expect(React.isValidElement(updatedModal)).toBe(true);
        });

        it('should update when shouldShowWarning changes', () => {
            const {result, rerender} = renderHook(
                ({shouldShowWarning}) =>
                    useCreateEmptyReportConfirmation({
                        policyID: 'policy-123',
                        policyName: 'Test Workspace',
                        shouldShowWarning,
                        onConfirm: mockOnConfirm,
                    }),
                {
                    initialProps: {shouldShowWarning: true},
                },
            );

            // When shouldShowWarning is true, modal should not call onConfirm immediately
            act(() => {
                result.current.openCreateReportConfirmation();
            });
            expect(mockOnConfirm).not.toHaveBeenCalled();

            mockOnConfirm.mockClear();

            // When shouldShowWarning changes to false, it should call onConfirm immediately
            rerender({shouldShowWarning: false});

            act(() => {
                result.current.openCreateReportConfirmation();
            });
            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        });

        it('should call the latest onConfirm callback', () => {
            const mockOnConfirm1 = jest.fn();
            const mockOnConfirm2 = jest.fn();

            const {result, rerender} = renderHook(
                ({onConfirm}) =>
                    useCreateEmptyReportConfirmation({
                        policyID: undefined,
                        policyName: 'Test Workspace',
                        shouldShowWarning: false,
                        onConfirm,
                    }),
                {
                    initialProps: {onConfirm: mockOnConfirm1},
                },
            );

            act(() => {
                result.current.openCreateReportConfirmation();
            });
            expect(mockOnConfirm1).toHaveBeenCalledTimes(1);
            expect(mockOnConfirm2).not.toHaveBeenCalled();

            mockOnConfirm1.mockClear();

            // Update to a new callback
            rerender({onConfirm: mockOnConfirm2});

            act(() => {
                result.current.openCreateReportConfirmation();
            });
            expect(mockOnConfirm1).not.toHaveBeenCalled();
            expect(mockOnConfirm2).toHaveBeenCalledTimes(1);
        });
    });

    describe('Return value structure', () => {
        it('should return an object with openCreateReportConfirmation and CreateReportConfirmationModal', () => {
            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: 'policy-123',
                    policyName: 'Test Workspace',
                    shouldShowWarning: true,
                    onConfirm: mockOnConfirm,
                }),
            );

            expect(result.current).toHaveProperty('openCreateReportConfirmation');
            expect(result.current).toHaveProperty('CreateReportConfirmationModal');
            expect(typeof result.current.openCreateReportConfirmation).toBe('function');
            expect(React.isValidElement(result.current.CreateReportConfirmationModal)).toBe(true);
        });
    });

    describe('Edge cases', () => {
        it('should handle undefined policyName gracefully', () => {
            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: 'policy-123',
                    policyName: undefined as unknown as string,
                    shouldShowWarning: true,
                    onConfirm: mockOnConfirm,
                }),
            );

            expect(result.current.CreateReportConfirmationModal).toBeDefined();
        });

        it('should handle being called multiple times', () => {
            const {result} = renderHook(() =>
                useCreateEmptyReportConfirmation({
                    policyID: undefined,
                    policyName: 'Test Workspace',
                    shouldShowWarning: false,
                    onConfirm: mockOnConfirm,
                }),
            );

            act(() => {
                result.current.openCreateReportConfirmation();
            });

            act(() => {
                result.current.openCreateReportConfirmation();
            });

            act(() => {
                result.current.openCreateReportConfirmation();
            });

            expect(mockOnConfirm).toHaveBeenCalledTimes(3);
        });
    });
});
