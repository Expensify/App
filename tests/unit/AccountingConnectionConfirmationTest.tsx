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

// Has to match the id the provider pushes its prompt under, because releasing that id on unmount is what keeps the
// next provider from inheriting this one's promise.
const ACCOUNTING_CONNECTION_CONFIRMATION_MODAL_ID = 'accountingConnectionConfirmation';

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
        // Given a workspace with nothing connected, so there is nothing to warn the user about
        const ref = renderProvider();

        // When a connect flow is started for an integration that needs no disconnect
        await act(async () => {
            ref.current?.startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.QBO});
            await waitForBatchedUpdates();
        });

        // Then the user goes straight into setup, because an unnecessary confirmation is an extra step for nothing
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(screen.getByTestId(SETUP_FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('should show the prompt and hold the setup flow back when a connection has to be disconnected first', async () => {
        // Given a workspace that already has an integration connected
        const ref = renderProvider();

        // When a connect flow is started for a different integration, which means dropping the existing connection
        await startFlowNeedingDisconnect(ref);

        // Then the user is asked first, and the setup flow stays unmounted so it cannot start behind the prompt
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('title')).toBe(`workspace.accounting.connectTitle:${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.quickbooksOnline}`);
        expect(getShowConfirmModalOption('prompt')).toBe(`workspace.accounting.connectPrompt:${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.quickbooksOnline}`);
        expect(getShowConfirmModalOption('confirmText')).toBe('workspace.accounting.setup');
        expect(getShowConfirmModalOption('cancelText')).toBe('common.cancel');
        expect(getShowConfirmModalOption('buttonVariant')).toBe(CONST.BUTTON_VARIANT.SUCCESS);
        expect(screen.queryByTestId(SETUP_FLOW_TEST_ID)).not.toBeOnTheScreen();
    });

    it('should reuse one prompt when the flow is started again while the prompt is still unanswered', async () => {
        // Given a prompt already raised for a flow that needs a disconnect. `PolicyAccountingPage` starts the flow
        // from a `useFocusEffect` that re-fires whenever `startIntegrationFlow` is re-created, so the same flow can be
        // started twice before the user has answered.
        const ref = renderProvider();
        await startFlowNeedingDisconnect(ref);

        // When the same flow is started a second time
        await startFlowNeedingDisconnect(ref);

        // Then both calls addressed the same named entry, which is what updates the prompt in place instead of
        // stacking a second copy the user would have to dismiss twice
        expect(getShowConfirmModalOption('id')).toBe(ACCOUNTING_CONNECTION_CONFIRMATION_MODAL_ID);

        // When the user answers the one prompt they were shown
        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();
        });

        // Then the disconnect is requested once, because both calls share a promise and a second request would try to
        // remove a connection that is already going
        expect(mockRemovePolicyConnection).toHaveBeenCalledTimes(1);
        expect(mockRemovePolicyConnection).toHaveBeenCalledWith(policy, CONST.POLICY.CONNECTIONS.NAME.XERO);
        expect(screen.getByTestId(SETUP_FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('should use the Intuit Enterprise Suite display name when the integration is one', async () => {
        // Given a workspace with an integration connected
        const ref = renderProvider();

        // When the flow being started is the Intuit Enterprise Suite variant, which shares QBO's connection name
        await act(async () => {
            ref.current?.startIntegrationFlow({
                name: CONST.POLICY.CONNECTIONS.NAME.QBO,
                isIntuitEnterpriseSuite: true,
                shouldDisconnectIntegrationBeforeConnecting: true,
                integrationToDisconnect: CONST.POLICY.CONNECTIONS.NAME.XERO,
            });
            await waitForBatchedUpdates();
        });

        // Then the prompt names the suite rather than QuickBooks Online, so the user recognises what they bought
        expect(getShowConfirmModalOption('title')).toBe('workspace.accounting.connectTitle:workspace.accounting.intuitEnterpriseSuite');
    });

    it('should disconnect the old connection and release the setup flow on confirm', async () => {
        // Given a prompt raised for a flow that needs the existing connection dropped
        const ref = renderProvider();
        await startFlowNeedingDisconnect(ref);

        // When the user confirms
        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();
        });

        // Then the old connection goes and setup starts, in that order, so the two are never connected at once
        expect(mockRemovePolicyConnection).toHaveBeenCalledWith(policy, CONST.POLICY.CONNECTIONS.NAME.XERO);
        expect(screen.getByTestId(SETUP_FLOW_TEST_ID)).toBeOnTheScreen();
    });

    it('should abandon the flow without disconnecting anything on cancel', async () => {
        // Given a prompt raised for a flow that needs the existing connection dropped
        const ref = renderProvider();
        await startFlowNeedingDisconnect(ref);

        // When the user cancels
        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();
        });

        // Then their existing connection survives untouched, and setup never starts
        expect(mockRemovePolicyConnection).not.toHaveBeenCalled();
        expect(screen.queryByTestId(SETUP_FLOW_TEST_ID)).not.toBeOnTheScreen();
    });

    it('should not run a departed provider handler when a later provider raises the same prompt', async () => {
        // Given a provider that raised the prompt for one workspace and then unmounted while it was unanswered. Its
        // entry is global, so leaving it behind would hand the next provider the same promise under the same id.
        const firstRef = React.createRef<StartFlowHandle>();
        const {unmount} = render(
            <AccountingContextProvider policy={policy}>
                <TestHarness ref={firstRef} />
            </AccountingContextProvider>,
        );
        await startFlowNeedingDisconnect(firstRef);

        await act(async () => {
            unmount();
            await waitForBatchedUpdates();
        });

        // When a fresh provider raises the same prompt and the user confirms it
        const secondRef = renderProvider();
        await startFlowNeedingDisconnect(secondRef);

        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();
        });

        // Then only the live provider acts on that answer. A second disconnect here would be the departed provider
        // firing against the workspace it captured rather than the one the user is looking at.
        expect(mockRemovePolicyConnection).toHaveBeenCalledTimes(1);
        expect(mockRemovePolicyConnection).toHaveBeenCalledWith(policy, CONST.POLICY.CONNECTIONS.NAME.XERO);
    });

    it('should keep the setup flow blocked when the policy disappears before the prompt is confirmed', async () => {
        // Given a prompt raised for a flow that needs a disconnect
        const ref = React.createRef<StartFlowHandle>();
        const {rerender} = render(
            <AccountingContextProvider policy={policy}>
                <TestHarness ref={ref} />
            </AccountingContextProvider>,
        );

        await startFlowNeedingDisconnect(ref);

        // When the policy becomes unavailable while the user is still deciding, then the user confirms anyway
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

        // Then setup still does not start, because starting it here would leave the old connection in place and the
        // workspace holding two accounting integrations at once
        expect(mockRemovePolicyConnection).not.toHaveBeenCalled();
        expect(screen.queryByTestId(SETUP_FLOW_TEST_ID)).not.toBeOnTheScreen();
    });
});
