import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import CopyPolicySettingsSelectWorkspacesPage from '@pages/workspace/copyPolicySettings/CopyPolicySettingsSelectWorkspacesPage';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CopyPolicySettings as CopyPolicySettingsState, PersonalDetailsList, Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const SOURCE_POLICY_ID = 'source-policy-1';
const TARGET_POLICY_1_ID = 'target-policy-1';
const TARGET_POLICY_2_ID = 'target-policy-2';
const TEST_USER_EMAIL = 'test@expensify.com';
const TEST_USER_ACCOUNT_ID = 12345;

// Capture SelectionList props to test the component's behavior
type CapturedSelectionListProps = {
    data: ListItem[];
    confirmButtonOptions?: ConfirmButtonOptions<ListItem>;
    onSelectRow?: (item: ListItem) => void;
};
let capturedProps: CapturedSelectionListProps | null = null;

// Mock SelectionList to capture props and avoid navigation issues
jest.mock('@components/SelectionList', () => ({
    __esModule: true,
    default: (props: CapturedSelectionListProps) => {
        capturedProps = props;
        return null;
    },
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]): void => {
        mockNavigate(...args);
    },
    goBack: jest.fn(),
}));

// Mock route to provide policyID
jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useRoute: () => ({params: {policyID: SOURCE_POLICY_ID}}),
        useIsFocused: () => true,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
            addListener: jest.fn(() => jest.fn()),
        }),
    };
});

// Bypass the access gate
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

// Simplified ScreenWrapper
jest.mock('@components/ScreenWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode | ((props: Record<string, unknown>) => React.ReactNode)}) =>
        typeof children === 'function' ? children({insets: {top: 0, bottom: 0, left: 0, right: 0}, safeAreaPaddingBottomStyle: {}, didScreenTransitionEnd: true}) : children,
}));

// Mock current user
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({email: TEST_USER_EMAIL, accountID: TEST_USER_ACCOUNT_ID}),
}));

function createTestPolicy(id: string, name: string): Policy {
    const policy = createRandomPolicy(Number(id.replaceAll(/\D/g, '')) || 1);
    return {
        ...policy,
        id,
        name,
        type: 'team',
        role: 'admin',
        owner: TEST_USER_EMAIL,
        ownerAccountID: TEST_USER_ACCOUNT_ID,
        employeeList: {
            [TEST_USER_EMAIL]: {
                email: TEST_USER_EMAIL,
                role: 'admin',
            },
        },
    } as Policy;
}

async function getCopyPolicySettings(): Promise<CopyPolicySettingsState | null> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.COPY_POLICY_SETTINGS,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value ?? null);
            },
        });
    });
}

describe('CopyPolicySettingsNavigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        capturedProps = null;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('Route construction', () => {
        it('POLICY_COPY_SETTINGS route should be correctly constructed', () => {
            const route = ROUTES.POLICY_COPY_SETTINGS.getRoute(SOURCE_POLICY_ID);
            expect(route).toBe(`policy/${SOURCE_POLICY_ID}/copy-settings`);
        });

        it('POLICY_COPY_SETTINGS_SELECT_FEATURES route should be correctly constructed', () => {
            const route = ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(SOURCE_POLICY_ID);
            expect(route).toBe(`policy/${SOURCE_POLICY_ID}/copy-settings/select-features`);
        });

        it('POLICY_COPY_SETTINGS_CONFIRM route should be correctly constructed', () => {
            const route = ROUTES.POLICY_COPY_SETTINGS_CONFIRM.getRoute(SOURCE_POLICY_ID);
            expect(route).toBe(`policy/${SOURCE_POLICY_ID}/copy-settings/confirm`);
        });
    });

    describe('Workspace selection and feature clearing behavior', () => {
        beforeEach(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${SOURCE_POLICY_ID}`, createTestPolicy(SOURCE_POLICY_ID, 'Source Workspace'));
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TARGET_POLICY_1_ID}`, createTestPolicy(TARGET_POLICY_1_ID, 'Target Workspace 1'));
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TARGET_POLICY_2_ID}`, createTestPolicy(TARGET_POLICY_2_ID, 'Target Workspace 2'));
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [TEST_USER_ACCOUNT_ID]: {
                    accountID: TEST_USER_ACCOUNT_ID,
                    login: TEST_USER_EMAIL,
                    displayName: 'Test User',
                },
            } as PersonalDetailsList);
            await waitForBatchedUpdates();
        });

        it('should preserve parts when workspace selection does not change', async () => {
            const initialParts: Part[] = ['categories', 'tags'];

            await Onyx.set(ONYXKEYS.COPY_POLICY_SETTINGS, {
                sourcePolicyID: SOURCE_POLICY_ID,
                targetPolicyIDs: [TARGET_POLICY_1_ID],
                parts: initialParts,
            });
            await waitForBatchedUpdates();

            render(
                <OnyxListItemProvider>
                    <CopyPolicySettingsSelectWorkspacesPage />
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdates();

            // Trigger onConfirm without changing selection
            act(() => {
                capturedProps?.confirmButtonOptions?.onConfirm?.();
            });

            await waitForBatchedUpdates();

            // Verify parts were preserved
            const copySettings = await getCopyPolicySettings();
            expect(copySettings?.parts).toEqual(initialParts);
            expect(copySettings?.targetPolicyIDs).toEqual([TARGET_POLICY_1_ID]);
        });

        it('should clear parts when a workspace is removed from selection', async () => {
            await Onyx.set(ONYXKEYS.COPY_POLICY_SETTINGS, {
                sourcePolicyID: SOURCE_POLICY_ID,
                targetPolicyIDs: [TARGET_POLICY_1_ID, TARGET_POLICY_2_ID],
                parts: ['categories'] as Part[],
            });
            await waitForBatchedUpdates();

            render(
                <OnyxListItemProvider>
                    <CopyPolicySettingsSelectWorkspacesPage />
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdates();

            // Find and deselect workspace 2 (toggle it off)
            const workspace2Item = capturedProps?.data.find((item) => item.keyForList === TARGET_POLICY_2_ID);
            expect(workspace2Item).toBeDefined();
            if (workspace2Item) {
                act(() => {
                    capturedProps?.onSelectRow?.(workspace2Item);
                });
                await waitForBatchedUpdates();
            }

            // Trigger onConfirm
            act(() => {
                capturedProps?.confirmButtonOptions?.onConfirm?.();
            });

            await waitForBatchedUpdates();

            // Verify parts were cleared since selection changed
            const copySettings = await getCopyPolicySettings();
            expect(copySettings?.parts).toEqual([]);
            // Should only have policy 1 now
            expect(copySettings?.targetPolicyIDs).toEqual([TARGET_POLICY_1_ID]);
        });

        it('should preserve parts when workspace selection changes back to original', async () => {
            await Onyx.set(ONYXKEYS.COPY_POLICY_SETTINGS, {
                sourcePolicyID: SOURCE_POLICY_ID,
                targetPolicyIDs: [TARGET_POLICY_1_ID, TARGET_POLICY_2_ID],
                parts: ['categories', 'tags'] as Part[],
            });
            await waitForBatchedUpdates();

            render(
                <OnyxListItemProvider>
                    <CopyPolicySettingsSelectWorkspacesPage />
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdates();

            // First deselect workspace 2 then reselect it (net change: none)
            const workspace2Item = capturedProps?.data.find((item) => item.keyForList === TARGET_POLICY_2_ID);
            expect(workspace2Item).toBeDefined();
            if (workspace2Item) {
                act(() => {
                    capturedProps?.onSelectRow?.(workspace2Item);
                });
                await waitForBatchedUpdates();

                // Reselect workspace 2
                act(() => {
                    capturedProps?.onSelectRow?.(workspace2Item);
                });
                await waitForBatchedUpdates();
            }

            // Confirm the selection
            act(() => {
                capturedProps?.confirmButtonOptions?.onConfirm?.();
            });

            await waitForBatchedUpdates();

            // Verify navigation was called
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(SOURCE_POLICY_ID));

            // After toggling twice, the selection should be unchanged, so parts should be preserved
            const copySettings = await getCopyPolicySettings();
            expect(copySettings?.parts).toEqual(['categories', 'tags']);
        });

        it('should navigate to SELECT_FEATURES after confirming', async () => {
            await Onyx.set(ONYXKEYS.COPY_POLICY_SETTINGS, {
                sourcePolicyID: SOURCE_POLICY_ID,
                targetPolicyIDs: [TARGET_POLICY_1_ID],
                parts: [],
            });
            await waitForBatchedUpdates();

            render(
                <OnyxListItemProvider>
                    <CopyPolicySettingsSelectWorkspacesPage />
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdates();

            // Trigger onConfirm
            act(() => {
                capturedProps?.confirmButtonOptions?.onConfirm?.();
            });

            await waitForBatchedUpdates();

            // Verify navigation was called with correct route
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.POLICY_COPY_SETTINGS_SELECT_FEATURES.getRoute(SOURCE_POLICY_ID));
        });
    });
});
