import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import CopyPolicySettingsUpgradePage from '@pages/workspace/copyPolicySettings/CopyPolicySettingsUpgradePage';
import type {UpgradeIntroViewProps} from '@pages/workspace/upgrade/UpgradeIntroView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const SOURCE_POLICY_ID = 'source-policy-1';
const TARGET_POLICY_ID = 'target-policy-1';
const TEST_USER_EMAIL = 'test@expensify.com';
const TEST_USER_ACCOUNT_ID = 12345;

// Capture the props passed to the upgrade intro card so the test can drive onUpgrade and read loading.
let capturedIntroProps: UpgradeIntroViewProps | null = null;

// jest.mock factories can't reference imported bindings, but `mock`-prefixed locals are allowed.
const MockView = View;

jest.mock('@pages/workspace/upgrade/UpgradeIntroView', () => ({
    __esModule: true,
    default: (props: UpgradeIntroViewProps) => {
        capturedIntroProps = props;
        return <MockView testID="upgrade-intro" />;
    },
}));

jest.mock('@pages/workspace/upgrade/UpgradeConfirmation', () => ({
    __esModule: true,
    default: () => <MockView testID="upgrade-success" />,
}));

// Track the bulk upgrade call without performing the real API write; the test drives Onyx manually.
const mockBulkUpgradeToCorporate = jest.fn();
jest.mock('@libs/actions/Policy/Policy', () => ({
    bulkUpgradeToCorporate: (...args: unknown[]): void => {
        mockBulkUpgradeToCorporate(...args);
    },
}));

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]): void => {
        mockNavigate(...args);
    },
    goBack: jest.fn(),
}));

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

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@components/ScreenWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode | ((props: Record<string, unknown>) => React.ReactNode)}) =>
        typeof children === 'function' ? children({insets: {top: 0, bottom: 0, left: 0, right: 0}, safeAreaPaddingBottomStyle: {}, didScreenTransitionEnd: true}) : children,
}));

jest.mock('@components/HeaderWithBackButton', () => ({
    __esModule: true,
    default: () => null,
}));

function createTestPolicy(id: string, name: string, type: 'team' | 'corporate'): Policy {
    const policy = createRandomPolicy(Number(id.replaceAll(/\D/g, '')) || 1);
    return {
        ...policy,
        id,
        name,
        type,
        role: 'admin',
        owner: TEST_USER_EMAIL,
        ownerAccountID: TEST_USER_ACCOUNT_ID,
        pendingAction: null,
        isPendingUpgrade: undefined,
        employeeList: {
            [TEST_USER_EMAIL]: {email: TEST_USER_EMAIL, role: 'admin'},
        },
    } as Policy;
}

function renderUpgradePage() {
    return render(
        <OnyxListItemProvider>
            <CopyPolicySettingsUpgradePage />
        </OnyxListItemProvider>,
    );
}

describe('CopyPolicySettingsUpgradePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        capturedIntroProps = null;
        await Onyx.clear();
        // Control source, Collect (Team) target, with a Control-only part selected so an upgrade is required.
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${SOURCE_POLICY_ID}`, createTestPolicy(SOURCE_POLICY_ID, 'Source Workspace', CONST.POLICY.TYPE.CORPORATE));
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TARGET_POLICY_ID}`, createTestPolicy(TARGET_POLICY_ID, 'Target Workspace', CONST.POLICY.TYPE.TEAM));
        await Onyx.set(ONYXKEYS.COPY_POLICY_SETTINGS, {
            sourcePolicyID: SOURCE_POLICY_ID,
            targetPolicyIDs: [TARGET_POLICY_ID],
            parts: ['rules'] as Part[],
        });
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('keeps the upgrade intro loading until the bulk upgrade completes', async () => {
        renderUpgradePage();
        await waitForBatchedUpdates();

        // Intro is shown, not the success view, and there is no premature redirect.
        expect(screen.getByTestId('upgrade-intro')).toBeTruthy();
        expect(screen.queryByTestId('upgrade-success')).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();

        // When the user presses Upgrade, the bulk upgrade fires.
        act(() => {
            capturedIntroProps?.onUpgrade();
        });
        await waitForBatchedUpdates();
        expect(mockBulkUpgradeToCorporate).toHaveBeenCalledTimes(1);

        // Optimistic state: target becomes Corporate but the upgrade is still pending.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${TARGET_POLICY_ID}`, {type: CONST.POLICY.TYPE.CORPORATE, isPendingUpgrade: true});
        });
        await waitForBatchedUpdates();

        // Success must not show while the upgrade is pending; the intro button shows loading instead.
        expect(screen.queryByTestId('upgrade-success')).toBeNull();
        expect(screen.getByTestId('upgrade-intro')).toBeTruthy();
        expect(capturedIntroProps?.loading).toBe(true);

        // When the backend confirms (isPendingUpgrade cleared), the success confirmation is shown.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${TARGET_POLICY_ID}`, {isPendingUpgrade: false});
        });
        await waitForBatchedUpdates();

        expect(screen.getByTestId('upgrade-success')).toBeTruthy();
        expect(screen.queryByTestId('upgrade-intro')).toBeNull();
        // Showing success must not, by itself, navigate to Confirm.
        expect(mockNavigate).not.toHaveBeenCalledWith(ROUTES.POLICY_COPY_SETTINGS_CONFIRM.getRoute(SOURCE_POLICY_ID));
    });

    it('does not show success when the bulk upgrade fails', async () => {
        renderUpgradePage();
        await waitForBatchedUpdates();

        act(() => {
            capturedIntroProps?.onUpgrade();
        });
        await waitForBatchedUpdates();

        // Optimistic state: target is Corporate + pending.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${TARGET_POLICY_ID}`, {type: CONST.POLICY.TYPE.CORPORATE, isPendingUpgrade: true});
        });
        await waitForBatchedUpdates();

        // Failure state: target reverts to Team and the upgrade is no longer pending.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${TARGET_POLICY_ID}`, {type: CONST.POLICY.TYPE.TEAM, isPendingUpgrade: false});
        });
        await waitForBatchedUpdates();

        // The intro stays visible (so the user can retry), success is never shown, and Continue isn't reachable.
        expect(screen.getByTestId('upgrade-intro')).toBeTruthy();
        expect(screen.queryByTestId('upgrade-success')).toBeNull();
        expect(capturedIntroProps?.loading).toBe(false);
        expect(mockNavigate).not.toHaveBeenCalledWith(ROUTES.POLICY_COPY_SETTINGS_CONFIRM.getRoute(SOURCE_POLICY_ID));
    });
});
