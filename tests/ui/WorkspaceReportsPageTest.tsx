/* eslint-disable @typescript-eslint/naming-convention */
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import WorkspaceReportFieldsPage from '@pages/workspace/reports/WorkspaceReportsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'testReportsPolicy123';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
        useRoute: () => ({
            key: 'test-route',
            name: 'Workspace_Reports',
            params: {policyID: 'testReportsPolicy123'},
        }),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (...mockArgs: unknown[]) => mockNavigate(...mockArgs),
        getActiveRoute: jest.fn(() => ''),
        isTopmostRouteModalScreen: jest.fn(() => false),
        goBack: jest.fn(),
    },
}));

const mockShowConfirmModal = jest.fn().mockResolvedValue({action: ModalActions.CONFIRM});
const mockCloseModal = jest.fn();

jest.mock('@hooks/useConfirmModal', () => {
    return jest.fn().mockImplementation(() => ({
        showConfirmModal: mockShowConfirmModal,
        closeModal: mockCloseModal,
    }));
});

const mockEnablePolicyReportFields = jest.fn();
const mockClearPolicyTitleFieldError = jest.fn();
const mockSetPolicyPreventMemberCreatedTitle = jest.fn();
jest.mock('@libs/actions/Policy/Policy', () => ({
    enablePolicyReportFields: (...mockArgs: unknown[]) => mockEnablePolicyReportFields(...mockArgs),
    clearPolicyTitleFieldError: (...mockArgs: unknown[]) => mockClearPolicyTitleFieldError(...mockArgs),
    setPolicyPreventMemberCreatedTitle: (...mockArgs: unknown[]) => mockSetPolicyPreventMemberCreatedTitle(...mockArgs),
}));

jest.mock('@userActions/Policy/ReportField', () => ({
    openPolicyReportFieldsPage: jest.fn(),
}));

// Mock ToggleSettingOptionRow to capture onToggle and disabledAction callbacks
type MockToggleProps = {
    title?: string;
    isActive?: boolean;
    disabled?: boolean;
    onToggle?: (mockEnabled: boolean) => void;
    disabledAction?: () => void;
};
let mockCapturedReportFieldsToggle: MockToggleProps | undefined;
let mockCapturedPreventMemberToggle: MockToggleProps | undefined;

jest.mock('@pages/workspace/workflows/ToggleSettingsOptionRow', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View, Text, Pressable} = require('react-native');
    return (mockProps: MockToggleProps) => {
        if (mockProps.title === 'Report fields') {
            mockCapturedReportFieldsToggle = mockProps;
        } else if (mockProps.title === 'Prevent members from changing custom report titles') {
            mockCapturedPreventMemberToggle = mockProps;
        }
        return (
            <View testID={`ToggleSettingOptionRow-${mockProps.title}`}>
                <Text>{mockProps.title}</Text>
                <Pressable
                    testID={`toggle-${mockProps.title}`}
                    onPress={() => {
                        if (mockProps.disabled && mockProps.disabledAction) {
                            mockProps.disabledAction();
                        } else {
                            mockProps.onToggle?.(!mockProps.isActive);
                        }
                    }}
                >
                    <Text>Toggle</Text>
                </Pressable>
            </View>
        );
    };
});

jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (mockProps: {children: React.ReactNode}) => <View>{mockProps.children}</View>;
});

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({ReportReceipt: 'ReportReceipt'}),
    useMemoizedLazyExpensifyIcons: () => ({Plus: 'Plus'}),
}));

jest.mock('@components/RenderHTML', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {Text} = require('react-native');
    return (mockProps: {html: string}) => <Text>{mockProps.html}</Text>;
});

jest.mock('@components/ImportedFromAccountingSoftware', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {Text} = require('react-native');
    return (mockProps: {translatedText: string}) => <Text>{mockProps.translatedText}</Text>;
});

const mockPolicy: Policy = {
    ...createRandomPolicy(parseInt(POLICY_ID, 10) || 1),
    id: POLICY_ID,
    type: CONST.POLICY.TYPE.CORPORATE,
    outputCurrency: CONST.CURRENCY.USD,
    pendingAction: null,
    role: CONST.POLICY.ROLE.ADMIN,
    areReportFieldsEnabled: true,
};

const renderComponent = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceReportFieldsPage
                route={{key: 'test', name: 'Workspace_Reports' as never, params: {policyID: POLICY_ID}}}
                navigation={{} as never}
            />
        </ComposeProviders>,
    );
};

describe('WorkspaceReportsPage - Modal Features', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        mockCapturedReportFieldsToggle = undefined;
        mockCapturedPreventMemberToggle = undefined;
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Disable Report Fields Confirm Modal', () => {
        it('should show danger confirm modal when disabling report fields', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    areReportFieldsEnabled: true,
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // Trigger toggle to disable (isEnabled = false)
            mockCapturedReportFieldsToggle?.onToggle?.(false);
            await waitForBatchedUpdatesWithAct();

            expect(mockShowConfirmModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    danger: true,
                    title: 'Disable report fields',
                    prompt: 'Are you sure? Text and date fields will be deleted, and lists will be disabled.',
                    confirmText: 'Disable',
                    cancelText: 'Cancel',
                }),
            );
        });

        it('should call enablePolicyReportFields with false when user confirms disabling', async () => {
            mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    areReportFieldsEnabled: true,
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            mockCapturedReportFieldsToggle?.onToggle?.(false);
            await waitForBatchedUpdatesWithAct();

            // Allow promise to resolve
            await act(async () => {
                await Promise.resolve();
            });

            expect(mockEnablePolicyReportFields).toHaveBeenCalledWith(POLICY_ID, false);
        });

        it('should not call enablePolicyReportFields when user dismisses the disable modal', async () => {
            mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    areReportFieldsEnabled: true,
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            mockCapturedReportFieldsToggle?.onToggle?.(false);
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                await Promise.resolve();
            });

            expect(mockEnablePolicyReportFields).not.toHaveBeenCalled();
        });

        it('should enable report fields directly without modal for control policy', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    type: CONST.POLICY.TYPE.CORPORATE,
                    areReportFieldsEnabled: false,
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // Trigger toggle to enable (isEnabled = true)
            mockCapturedReportFieldsToggle?.onToggle?.(true);
            await waitForBatchedUpdatesWithAct();

            // Should not show modal for enabling
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            // Should call enablePolicyReportFields directly
            expect(mockEnablePolicyReportFields).toHaveBeenCalledWith(POLICY_ID, true);
        });

        it('should navigate to upgrade page when enabling report fields on non-control policy', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    type: CONST.POLICY.TYPE.TEAM,
                    areReportFieldsEnabled: false,
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            mockCapturedReportFieldsToggle?.onToggle?.(true);
            await waitForBatchedUpdatesWithAct();

            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(mockEnablePolicyReportFields).not.toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalled();
        });
    });

    describe('Accounting Connections Warning Modal', () => {
        it('should show confirm modal when toggling report fields with accounting connections', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    connections: {
                        quickbooksOnline: {
                            config: {},
                            data: {},
                        },
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // The toggle should be disabled when accounting connections exist
            // Trigger the disabledAction
            mockCapturedReportFieldsToggle?.disabledAction?.();
            await waitForBatchedUpdatesWithAct();

            expect(mockShowConfirmModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Not so fast...',
                    prompt: "To enable or disable this feature, you'll need to change your accounting import settings.",
                    confirmText: 'Manage settings',
                    cancelText: 'Cancel',
                }),
            );
        });

        it('should navigate to accounting settings when user confirms the connections warning', async () => {
            mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    connections: {
                        quickbooksOnline: {
                            config: {},
                            data: {},
                        },
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            mockCapturedReportFieldsToggle?.disabledAction?.();
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                await Promise.resolve();
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should not navigate when user dismisses the connections warning modal', async () => {
            mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    connections: {
                        quickbooksOnline: {
                            config: {},
                            data: {},
                        },
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            mockCapturedReportFieldsToggle?.disabledAction?.();
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                await Promise.resolve();
            });

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not show modal when no accounting connections exist', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // disabledAction should not trigger showConfirmModal when there are no connections
            // because the guard `if (!hasAccountingConnections) return;` prevents it
            mockCapturedReportFieldsToggle?.disabledAction?.();
            await waitForBatchedUpdatesWithAct();

            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });
    });
});
