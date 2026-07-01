import {act, render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import CopyPolicySettingsConfirmPage from '@pages/workspace/copyPolicySettings/CopyPolicySettingsConfirmPage';
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

// jest.mock factories can't reference imported bindings, but `mock`-prefixed locals are allowed.
const MockView = View;

// Capture the props passed to the primary (copy) button so the test can drive its onPress.
type CapturedButtonProps = {onPress?: () => void; isDisabled?: boolean};
let capturedButtonProps: CapturedButtonProps | null = null;

jest.mock('@components/Button', () => ({
    __esModule: true,
    default: (props: CapturedButtonProps) => {
        capturedButtonProps = props;
        return <MockView testID="copy-settings-button" />;
    },
}));

// Keep the real PART_TO_POLICY_FEATURE map (CopyPolicySettingsUtils relies on it) but stub the write action.
const mockCopyPolicySettings = jest.fn();
jest.mock('@libs/actions/Policy/CopyPolicySettings', () => {
    // requireActual is typed as `any`; spreading it preserves the real exports the page/utils depend on.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Policy/CopyPolicySettings');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        copyPolicySettings: (...args: unknown[]): void => {
            mockCopyPolicySettings(...args);
        },
    };
});

const mockNavigate = jest.fn();
const mockDismissModal = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]): void => {
        mockNavigate(...args);
    },
    dismissModal: (...args: unknown[]): void => {
        mockDismissModal(...args);
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

jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@components/ScreenWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode | ((props: Record<string, unknown>) => React.ReactNode)}) =>
        typeof children === 'function' ? children({insets: {top: 0, bottom: 0, left: 0, right: 0}, safeAreaPaddingBottomStyle: {}, didScreenTransitionEnd: true}) : children,
}));

jest.mock('@components/ScrollView', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@components/FixedFooter', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@components/HeaderWithBackButton', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('@components/MenuItemWithTopDescription', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('@components/RenderHTML', () => ({
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

function renderConfirmPage() {
    return render(
        <OnyxListItemProvider>
            <CopyPolicySettingsConfirmPage />
        </OnyxListItemProvider>,
    );
}

describe('CopyPolicySettingsConfirmPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        capturedButtonProps = null;
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${SOURCE_POLICY_ID}`, createTestPolicy(SOURCE_POLICY_ID, 'Source Workspace', CONST.POLICY.TYPE.CORPORATE));
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('routes to the Upgrade step instead of copying when a Collect target still needs an upgrade', async () => {
        // Collect (Team) target with a Control-only part selected: confirming would bypass the Upgrade step.
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TARGET_POLICY_ID}`, createTestPolicy(TARGET_POLICY_ID, 'Target Workspace', CONST.POLICY.TYPE.TEAM));
        await Onyx.set(ONYXKEYS.COPY_POLICY_SETTINGS, {
            sourcePolicyID: SOURCE_POLICY_ID,
            targetPolicyIDs: [TARGET_POLICY_ID],
            parts: ['rules'] as Part[],
        });
        await waitForBatchedUpdates();

        renderConfirmPage();
        await waitForBatchedUpdates();

        act(() => {
            capturedButtonProps?.onPress?.();
        });
        await waitForBatchedUpdates();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.POLICY_COPY_SETTINGS_UPGRADE.getRoute(SOURCE_POLICY_ID));
        expect(mockCopyPolicySettings).not.toHaveBeenCalled();
        expect(mockDismissModal).not.toHaveBeenCalled();
    });

    it('copies and dismisses when no upgrade is required', async () => {
        // Corporate (Control) target: the selected Control-only part is already accessible, no upgrade needed.
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TARGET_POLICY_ID}`, createTestPolicy(TARGET_POLICY_ID, 'Target Workspace', CONST.POLICY.TYPE.CORPORATE));
        await Onyx.set(ONYXKEYS.COPY_POLICY_SETTINGS, {
            sourcePolicyID: SOURCE_POLICY_ID,
            targetPolicyIDs: [TARGET_POLICY_ID],
            parts: ['rules'] as Part[],
        });
        await waitForBatchedUpdates();

        renderConfirmPage();
        await waitForBatchedUpdates();

        act(() => {
            capturedButtonProps?.onPress?.();
        });
        await waitForBatchedUpdates();

        expect(mockCopyPolicySettings).toHaveBeenCalledTimes(1);
        expect(mockDismissModal).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalledWith(ROUTES.POLICY_COPY_SETTINGS_UPGRADE.getRoute(SOURCE_POLICY_ID));
    });
});
