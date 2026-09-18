import {act, render, screen} from '@testing-library/react-native';

import {AccountingContextProvider, useAccountingActions} from '@pages/workspace/accounting/AccountingContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';

import React, {useImperativeHandle} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import createRandomPolicy from '../utils/collections/policies';
import {getShowConfirmModalOption, MockModalActions, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type StartFlowHandle = {
    startIntegrationFlow: ReturnType<typeof useAccountingActions>['startIntegrationFlow'];
};

const POLICY_ID = 'policy-1';
const SETUP_FLOW_TEST_ID = 'setup-connection-flow';

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string, ...parameters: unknown[]) => (parameters.length > 0 ? `${key}:${String(parameters.at(0))}` : key),
}));

jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

const mockRemovePolicyConnection = jest.fn<void, [Policy, string]>();
jest.mock('@libs/actions/connections', () => ({
    __esModule: true,
    removePolicyConnection: (policyToUpdate: Policy, connectionName: string) => {
        mockRemovePolicyConnection(policyToUpdate, connectionName);
    },
}));

jest.mock('@libs/PolicyUtils', () => ({
    __esModule: true,
    isControlPolicy: () => true,
    tryNavigateToSubmitWorkspaceUpgrade: () => false,
}));

// `getAccountingIntegrationData` pulls in every integration's setup flow, so it is stubbed down to the one thing these
// tests care about: whether the provider mounts a setup flow while the confirmation prompt is pending.
function mockCreateSetupFlowElement() {
    return <View testID={SETUP_FLOW_TEST_ID} />;
}

jest.mock('@pages/workspace/accounting/utils', () => ({
    __esModule: true,
    getAccountingIntegrationData: () => ({setupConnectionFlow: mockCreateSetupFlowElement()}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    __esModule: true,
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useCardFeeds', () => ({
    __esModule: true,
    default: () => [undefined, {status: 'loaded'}, undefined],
}));

jest.mock('@hooks/useCardsLists', () => ({
    __esModule: true,
    default: () => [undefined, {status: 'loaded'}],
}));

jest.mock('@hooks/useHasReusablePoliciesConnectedTo', () => ({
    __esModule: true,
    default: () => false,
}));

const policy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Test workspace'), id: POLICY_ID};

const TestHarness = React.forwardRef<StartFlowHandle>((_props, ref) => {
    const {startIntegrationFlow} = useAccountingActions();

    useImperativeHandle(ref, () => ({startIntegrationFlow}));

    return null;
});

function renderProvider() {
    const ref = React.createRef<StartFlowHandle>();
    render(
        <AccountingContextProvider policy={policy}>
            <TestHarness ref={ref} />
        </AccountingContextProvider>,
    );
    return ref;
}

async function startFlowNeedingDisconnect(ref: React.RefObject<StartFlowHandle | null>) {
    await act(async () => {
        ref.current?.startIntegrationFlow({
            name: CONST.POLICY.CONNECTIONS.NAME.QBO,
            shouldDisconnectIntegrationBeforeConnecting: true,
            integrationToDisconnect: CONST.POLICY.CONNECTIONS.NAME.XERO,
        });
        await waitForBatchedUpdates();
    });
}

describe('AccountingContextProvider connect-confirmation prompt', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        resetMockConfirmModal();
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    it('should mount the setup flow without a prompt when no connection has to be disconnected first', async () => {
        const ref = renderProvider();

        await act(async () => {
            ref.current?.startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.QBO});
            await waitForBatchedUpdates();
        });

        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(screen.getByTestId(SETUP_FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('should show the prompt and hold the setup flow back when a connection has to be disconnected first', async () => {
        const ref = renderProvider();

        await startFlowNeedingDisconnect(ref);

        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('title')).toBe(`workspace.accounting.connectTitle:${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.quickbooksOnline}`);
        expect(getShowConfirmModalOption('prompt')).toBe(`workspace.accounting.connectPrompt:${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.quickbooksOnline}`);
        expect(getShowConfirmModalOption('confirmText')).toBe('workspace.accounting.setup');
        expect(getShowConfirmModalOption('cancelText')).toBe('common.cancel');
        expect(getShowConfirmModalOption('buttonVariant')).toBe(CONST.BUTTON_VARIANT.SUCCESS);
        expect(screen.queryByTestId(SETUP_FLOW_TEST_ID)).not.toBeOnTheScreen();
    });

    it('should reuse one prompt when the flow is started again while the prompt is still unanswered', async () => {
        const ref = renderProvider();

        // `PolicyAccountingPage` starts the flow from a `useFocusEffect` that re-fires whenever `startIntegrationFlow`
        // is re-created, so the same flow can be started twice before the user has answered.
        await startFlowNeedingDisconnect(ref);
        await startFlowNeedingDisconnect(ref);

        expect(getShowConfirmModalOption('id')).toBe('accountingConnectionConfirmation');

        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();
        });

        // One prompt, one answer, one disconnect - not one request per time the flow was started.
        expect(mockRemovePolicyConnection).toHaveBeenCalledTimes(1);
        expect(mockRemovePolicyConnection).toHaveBeenCalledWith(policy, CONST.POLICY.CONNECTIONS.NAME.XERO);
        expect(screen.getByTestId(SETUP_FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('should use the Intuit Enterprise Suite display name when the integration is one', async () => {
        const ref = renderProvider();

        await act(async () => {
            ref.current?.startIntegrationFlow({
                name: CONST.POLICY.CONNECTIONS.NAME.QBO,
                isIntuitEnterpriseSuite: true,
                shouldDisconnectIntegrationBeforeConnecting: true,
                integrationToDisconnect: CONST.POLICY.CONNECTIONS.NAME.XERO,
            });
            await waitForBatchedUpdates();
        });

        expect(getShowConfirmModalOption('title')).toBe('workspace.accounting.connectTitle:workspace.accounting.intuitEnterpriseSuite');
    });

    it('should disconnect the old connection and release the setup flow on confirm', async () => {
        const ref = renderProvider();

        await startFlowNeedingDisconnect(ref);

        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();
        });

        expect(mockRemovePolicyConnection).toHaveBeenCalledWith(policy, CONST.POLICY.CONNECTIONS.NAME.XERO);
        expect(screen.getByTestId(SETUP_FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('should abandon the flow without disconnecting anything on cancel', async () => {
        const ref = renderProvider();

        await startFlowNeedingDisconnect(ref);

        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();
        });

        expect(mockRemovePolicyConnection).not.toHaveBeenCalled();
        expect(screen.queryByTestId(SETUP_FLOW_TEST_ID)).not.toBeOnTheScreen();
    });

    it('should keep the setup flow blocked when the policy disappears before the prompt is confirmed', async () => {
        const ref = React.createRef<StartFlowHandle>();
        const {rerender} = render(
            <AccountingContextProvider policy={policy}>
                <TestHarness ref={ref} />
            </AccountingContextProvider>,
        );

        await startFlowNeedingDisconnect(ref);

        // With no policy there is nothing to disconnect, so the setup flow must stay held back rather than start
        // against a connection that was never removed.
        rerender(
            <AccountingContextProvider policy={undefined}>
                <TestHarness ref={ref} />
            </AccountingContextProvider>,
        );
        await waitForBatchedUpdates();

        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();
        });

        // The policy has to come back before this proves anything: `renderActiveIntegration()` returns null whenever
        // `policyID` is missing, so while the policy is gone the setup flow stays unmounted either way. With the policy
        // back, the only thing still holding the flow back is the confirmation state the guard preserved.
        rerender(
            <AccountingContextProvider policy={policy}>
                <TestHarness ref={ref} />
            </AccountingContextProvider>,
        );
        await waitForBatchedUpdates();

        expect(mockRemovePolicyConnection).not.toHaveBeenCalled();
        expect(screen.queryByTestId(SETUP_FLOW_TEST_ID)).not.toBeOnTheScreen();
    });
});
