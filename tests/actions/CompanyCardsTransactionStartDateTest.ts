import {act, render} from '@testing-library/react-native';

import {bulkUpdateCardTransactionStartDate, deleteWorkspaceCompanyCardFeed, updateCardTransactionStartDate} from '@libs/actions/CompanyCards';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import Growl from '@libs/Growl';
import * as SequentialQueue from '@libs/Network/SequentialQueue';

import WorkspaceCompanyCardsPage from '@pages/workspace/companyCards/WorkspaceCompanyCardsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {setupGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/DecisionModal', () => () => null);
jest.mock('@components/Tables/WorkspaceCompanyCardsTable', () => () => null);
jest.mock('@hooks/useAssignCard', () => () => ({assignCard: jest.fn(), isAssigningCardDisabled: false}));
jest.mock('@hooks/useLocalize', () => {
    const translate = (key: string) => key;
    return () => ({translate});
});
jest.mock('@hooks/useMobileSelectionMode', () => () => false);
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));
jest.mock('@hooks/useWorkspaceDocumentTitle', () => jest.fn());
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@pages/workspace/WorkspacePageWithSections',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 1234567;
const CARD_ID = '123';
const FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE;
const POLICY_ID = 'policy123';
const loadingStateKey = `${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARDS_LOADING_STATE}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}` as const;
const feedsKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}` as const;
const serverFeedSnapshot = {
    settings: {
        companyCards: {[FEED]: {preferredPolicy: POLICY_ID}},
        oAuthAccountDetails: {[FEED]: {accountList: [], credentials: '', expiration: 0}},
    },
};

OnyxUpdateManager();

describe('actions/CompanyCards transaction start date updates', () => {
    const mockFetch = setupGlobalFetchMock();

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockFetch.mockClear();
        mockFetch.mockAPICommand(WRITE_COMMANDS.BULK_UPDATE_CARD_TRANSACTION_START_DATE, () => ({}));
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('removes an optimistically added date when a single-card update fails', () => {
        // Given a card that previously imported transactions from the beginning
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

        // When setting a custom start date
        updateCardTransactionStartDate(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, '2026-10-13', FEED, undefined);

        // Then a failed request rolls the missing date back with null so Onyx removes the optimistic value
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_CARD_TRANSACTION_START_DATE,
            expect.anything(),
            expect.objectContaining({
                failureData: [
                    expect.objectContaining({
                        value: {
                            [CARD_ID]: expect.objectContaining({scrapeMinDate: null}),
                        },
                    }),
                ],
            }),
        );
    });

    it('rolls back absent dates, signals the queued update immediately, and signals success only through success data for bulk updates', () => {
        // Given cards that previously imported transactions from the beginning
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const onyxMergeSpy = jest.spyOn(Onyx, 'merge');

        // When setting a custom start date in bulk
        bulkUpdateCardTransactionStartDate(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, FEED, [{cardID: CARD_ID, oldStartDate: undefined}], '2026-10-13');

        // Then the queued request signals selection clearing immediately
        expect(onyxMergeSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARDS_LOADING_STATE}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}`, expect.anything());

        // And failure data removes the optimistic date while success data signals the confirmed server response
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.BULK_UPDATE_CARD_TRANSACTION_START_DATE,
            expect.anything(),
            expect.objectContaining({
                failureData: [
                    expect.objectContaining({
                        value: {
                            [CARD_ID]: expect.objectContaining({scrapeMinDate: null}),
                        },
                    }),
                ],
                successData: [
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARDS_LOADING_STATE}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}`,
                        value: {
                            bulkTransactionStartDateUpdateSuccessID: expect.any(String) as unknown,
                            bulkTransactionStartDateUpdateFeed: getCardFeedWithDomainID(FEED, DOMAIN_OR_WORKSPACE_ACCOUNT_ID),
                        },
                    }),
                ],
            }),
        );
    });

    it.each(['active', 'reloaded', 'pending', 'removed', 'refreshed', 'unlinked'])('only shows an offline bulk update growl for an active feed (feed state: %s)', async (feedState) => {
        // Given a feed whose bulk update is queued until the device reconnects
        const growlSpy = jest.spyOn(Growl, 'success').mockImplementation(() => {});
        const onyxMergeSpy = jest.spyOn(Onyx, 'merge');
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, policyAccountID: DOMAIN_OR_WORKSPACE_ACCOUNT_ID});
        await Onyx.set(feedsKey, serverFeedSnapshot);
        const isFeedDeleted = feedState !== 'active' && feedState !== 'reloaded';
        if (feedState === 'unlinked') {
            // Deleting a domain feed only unlinks it from the workspace, so the server's response still contains the feed.
            mockFetch.mockAPICommand(WRITE_COMMANDS.DELETE_COMPANY_CARD_FEED, () => ({
                onyxData: [{onyxMethod: Onyx.METHOD.SET, key: feedsKey, value: serverFeedSnapshot}],
            }));
        }
        if (feedState === 'refreshed') {
            // A server snapshot cannot contain the optimistic pendingAction of the queued deletion.
            mockFetch.mockAPICommand(WRITE_COMMANDS.BULK_UPDATE_CARD_TRANSACTION_START_DATE, () => ({
                onyxData: [{onyxMethod: Onyx.METHOD.SET, key: feedsKey, value: serverFeedSnapshot}],
            }));
        }
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        await waitForBatchedUpdates();
        // The page does not use navigation; only the navigator's prop contract requires it.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const navigation = {} as React.ComponentProps<typeof WorkspaceCompanyCardsPage>['navigation'];
        render(
            React.createElement(WorkspaceCompanyCardsPage, {
                route: {key: 'company-cards', name: SCREENS.WORKSPACE.COMPANY_CARDS, params: {policyID: POLICY_ID}},
                navigation,
            }),
        );
        await waitForBatchedUpdatesWithAct();
        await act(async () => {
            bulkUpdateCardTransactionStartDate(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, FEED, [{cardID: CARD_ID}], '2026-10-13');
            await waitForBatchedUpdates();
        });
        expect(mockFetch).not.toHaveBeenCalled();

        // When the app reloads before reconnecting, RAM-only state is lost but the queued request survives
        if (feedState === 'reloaded') {
            await act(async () => {
                await Onyx.set(loadingStateKey, null);
            });
        }

        // When a feed is deleted before reconnecting, its earlier queued update can still succeed
        if (isFeedDeleted) {
            await act(async () => {
                deleteWorkspaceCompanyCardFeed(POLICY_ID, DOMAIN_OR_WORKSPACE_ACCOUNT_ID, FEED, [CARD_ID]);
                await waitForBatchedUpdates();
            });
            expect((await getOnyxValue(feedsKey))?.settings?.companyCards?.[FEED]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        }
        if (feedState === 'removed') {
            await act(async () => {
                await Onyx.merge(feedsKey, {settings: {companyCards: {[FEED]: null}}});
            });
        }
        await act(async () => {
            await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: false});
            SequentialQueue.flush();
            await waitForBatchedUpdates();
        });
        await waitForBatchedUpdatesWithAct();

        // Then every success is consumed, but only a feed that was not deleted gets a notification
        expect(mockFetch).toHaveBeenCalled();
        expect((await getOnyxValue(ONYXKEYS.PERSISTED_REQUESTS)) ?? []).toHaveLength(0);
        expect(growlSpy).toHaveBeenCalledTimes(isFeedDeleted ? 0 : 1);
        if (feedState === 'refreshed' || feedState === 'unlinked') {
            expect((await getOnyxValue(feedsKey))?.settings?.companyCards?.[FEED]?.pendingAction).toBeUndefined();
        }
        expect(onyxMergeSpy).toHaveBeenCalledWith(loadingStateKey, {
            bulkTransactionStartDateUpdateSuccessID: null,
            bulkTransactionStartDateUpdateFeed: null,
        });
        const loadingState = await getOnyxValue(loadingStateKey);
        expect(loadingState?.bulkTransactionStartDateUpdateSuccessID).toBeUndefined();
        expect(loadingState?.bulkTransactionStartDateUpdateFeed).toBeUndefined();
    });
});
