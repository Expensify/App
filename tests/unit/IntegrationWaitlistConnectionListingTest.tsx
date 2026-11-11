import {act, fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ConnectionsGrid from '@pages/workspace/connections/ConnectionsGrid';
import useAccountingConnectionListings from '@pages/workspace/connections/useAccountingConnectionListings';

import {clearIntegrationWaitlistError, joinIntegrationWaitlist} from '@userActions/User';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockEnabledBetas: string[] = [];
const mockStartIntegrationFlow = jest.fn();
const mockConnect = jest.fn();

jest.mock('@userActions/User', () => ({clearIntegrationWaitlistError: jest.fn(), joinIntegrationWaitlist: jest.fn()}));
jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: (beta: string) => mockEnabledBetas.includes(beta)}),
}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => ({
    __esModule: true,
    default: () => ({canWrite: true, showReadOnlyModal: jest.fn()}),
}));
jest.mock('@pages/workspace/accounting/AccountingContext', () => ({
    useAccountingActions: () => ({startIntegrationFlow: mockStartIntegrationFlow}),
    useAccountingState: () => ({activeIntegration: undefined, popoverAnchorRefs: {current: {}}}),
}));

function TestWrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
}

describe('Coming-soon integrations in unified Connections', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it.each([{enabledBetas: []}, {enabledBetas: [CONST.BETAS.EXACT_ONLINE]}])('keeps signup available offline with Exact beta enrollment $enabledBetas', async ({enabledBetas}) => {
        // Given the account is offline, and the Exact beta may be enabled
        mockEnabledBetas = enabledBetas;
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        const policy = createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Test workspace');
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        const {result} = renderHook(() => useAccountingConnectionListings(policy), {wrapper: TestWrapper});
        await waitForBatchedUpdatesWithAct();
        const listing = result.current.find((item) => item.key === CONST.POLICY.CONNECTIONS.NAME.EXACT_ONLINE);
        if (!listing) {
            throw new Error('Exact Online waitlist is missing from Connections');
        }

        // When the connection cards render and the user chooses the waitlist
        render(
            <ConnectionsGrid
                policyID={policy.id}
                listings={[listing, {key: 'existing', category: CONST.TAB.CONNECTIONS.ACCOUNTING, title: 'Existing connector', onConnect: mockConnect}]}
            />,
            {wrapper: TestWrapper},
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole('button', {name: 'Join waitlist'}));
        fireEvent.press(screen.getByRole('button', {name: 'Existing connector', disabled: true}));

        // Then Exact offers coming-soon signup offline while live connectors retain their offline restriction
        expect(screen.getByText('Coming soon')).toBeOnTheScreen();
        expect(joinIntegrationWaitlist).toHaveBeenCalledTimes(1);
        expect(joinIntegrationWaitlist).toHaveBeenCalledWith(CONST.POLICY.CONNECTIONS.NAME.EXACT_ONLINE);
        expect(mockStartIntegrationFlow).not.toHaveBeenCalled();
        expect(mockConnect).not.toHaveBeenCalled();
        expect(screen.getByLabelText('Exact Online, Coming soon')).toBeOnTheScreen();

        await act(() => Onyx.set(ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST, '2026-10-15 10:00:00'));
        expect(screen.getByLabelText('Exact Online, Coming soon, You’re on the waitlist')).toBeOnTheScreen();

        await act(() => Onyx.set(ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST, null));
        expect(screen.getByLabelText('Exact Online, Coming soon')).toBeOnTheScreen();

        await act(() => Onyx.merge(ONYXKEYS.ACCOUNT, {errorFields: {exactOnlineWaitlist: {[Date.now()]: 'Signup failed. Please try again.'}}}));
        expect(screen.getByText('Signup failed. Please try again.')).toBeOnTheScreen();
        fireEvent.press(screen.getByRole('button', {name: 'Dismiss'}));
        expect(clearIntegrationWaitlistError).toHaveBeenCalledWith(CONST.POLICY.CONNECTIONS.NAME.EXACT_ONLINE);
    });

    it.each([{enabledBetas: []}, {enabledBetas: [CONST.BETAS.ODOO]}])(
        'lists Odoo as coming soon right after Sage Intacct with Odoo beta enrollment $enabledBetas',
        async ({enabledBetas}) => {
            // Given a workspace, where the Odoo beta may be enabled since the painted door shows to everyone
            mockEnabledBetas = enabledBetas;
            const policy = createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Test workspace');
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When the accounting listings are built
            const {result} = renderHook(() => useAccountingConnectionListings(policy), {wrapper: TestWrapper});
            await waitForBatchedUpdatesWithAct();

            // Then Odoo follows Sage Intacct, as in the design, and offers no connect flow yet
            const keys = result.current.map((listing) => listing.key);
            expect(keys.indexOf(CONST.POLICY.CONNECTIONS.NAME.ODOO)).toBe(keys.indexOf(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT) + 1);
            const listing = result.current.find((item) => item.key === CONST.POLICY.CONNECTIONS.NAME.ODOO);
            expect(listing?.onConnect).toBeUndefined();

            // When the Odoo card renders and the user joins its waitlist
            render(
                <ConnectionsGrid
                    policyID={policy.id}
                    listings={listing ? [listing] : []}
                />,
                {wrapper: TestWrapper},
            );
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByRole('button', {name: 'Join waitlist'}));

            // Then the coming-soon card signs the account up for the Odoo waitlist
            expect(screen.getByLabelText('Odoo, Coming soon')).toBeOnTheScreen();
            expect(joinIntegrationWaitlist).toHaveBeenCalledWith(CONST.POLICY.CONNECTIONS.NAME.ODOO);
            expect(mockStartIntegrationFlow).not.toHaveBeenCalled();
        },
    );
});
