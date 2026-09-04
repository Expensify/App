/**
 * Cover/reveal contract of the "Fix company card connection" item once the Home tab sits under `ScreenActivityWrapper`.
 *
 * The item carries the two effects the Home audit flagged: a fetch keyed on `isOffline` and the clear of the
 * module-level in-flight set, plus a `useNetwork({onReconnect})` whose subscription a cover detaches. What has to
 * hold is that the fetch fires once per fund, that nothing fires behind the cover, that a reconnect missed behind the
 * cover is covered by the reveal, and that the in-flight marker is cleared whenever the feed arrives, cover or no
 * cover, because that set outlives the component and a lost clear would block every later fetch of the same fund.
 *
 * `openPolicyCompanyCardsPage` is mocked, so the domain member key is written by the test at the moment the response
 * lands instead of by the action's optimistic update. That leaves the in-flight set as the only guard against a
 * duplicate request, which is the guard under test here.
 */
import {act, cleanup, screen} from '@testing-library/react-native';

import {openPolicyCompanyCardsPage} from '@libs/actions/CompanyCards';
import {setForceOffline} from '@libs/NetworkState';

import FixCompanyCardConnection from '@pages/home/TimeSensitiveSection/items/FixCompanyCardConnection';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardFeeds} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const POLICY_ACCOUNT_ID = 777;
const POLICY_MEMBER_EMAIL = 'admin@example.com';

jest.mock('@libs/actions/CompanyCards', () => ({
    openPolicyCompanyCardsPage: jest.fn(),
}));

jest.mock('@libs/actions/Card', () => ({
    updateSelectedFeed: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key)})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Connect: null})),
}));

jest.mock('@components/BaseWidgetItem', () => () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return ReactModule.createElement('View', {testID: 'fix-company-card-item'});
});

jest.mock('@pages/home/TimeSensitiveSection/items/FixCompanyCardConnectionSkeleton', () => () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return ReactModule.createElement('View', {testID: 'fix-company-card-skeleton'});
});

const mockedOpenPolicyCompanyCardsPage = jest.mocked(openPolicyCompanyCardsPage);

// The in-flight set is module state that outlives a component, so every test works on its own fund to stay independent.
let nextFundID = 1000;

type CardFixture = {
    card: Card;
    policyID: string;
    feedKey: `${typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${string}`;
};

async function setUpBrokenCard(): Promise<CardFixture> {
    nextFundID += 1;
    const fundID = String(nextFundID);
    const policyID = `policy_${fundID}`;

    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
            id: policyID,
            policyAccountID: POLICY_ACCOUNT_ID,
            employeeList: {[POLICY_MEMBER_EMAIL]: {email: POLICY_MEMBER_EMAIL}},
        });
    });
    await waitForBatchedUpdatesWithAct();

    return {
        card: createMock<Card>({cardID: Number(fundID), fundID, bank: 'vcf', domainName: 'expensify.com'}),
        policyID,
        feedKey: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${fundID}`,
    };
}

async function setFeed(feedKey: CardFixture['feedKey'], value: CardFeeds | null) {
    await act(async () => {
        await Onyx.set(feedKey, value);
    });
    await waitForBatchedUpdatesWithAct();
}

// Drives the real network store the real `useNetwork` subscribes to, so the hook keeps the subscribe/unsubscribe
// lifecycle a cover detaches and restores.
async function setNetworkOffline(isOffline: boolean) {
    await act(async () => {
        setForceOffline(isOffline);
    });
    await waitForBatchedUpdatesWithAct();
}

const LOADED_FEED = createMock<CardFeeds>({isLoading: false, settings: {companyCardNicknames: {}}});

describe('FixCompanyCardConnection under a screen cover', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockedOpenPolicyCompanyCardsPage.mockClear();
    });

    afterEach(async () => {
        cleanup();
        setForceOffline(false);
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('fetches the feed once on mount and shows the skeleton until it arrives', async () => {
        const {card, policyID, feedKey} = await setUpBrokenCard();

        renderScreenWithCover(
            <FixCompanyCardConnection
                card={card}
                policyID={policyID}
                policyName="Corp"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockedOpenPolicyCompanyCardsPage).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('fix-company-card-skeleton')).toBeOnTheScreen();

        await setFeed(feedKey, LOADED_FEED);

        expect(screen.getByTestId('fix-company-card-item')).toBeOnTheScreen();
    });

    it('does not fetch again on a reveal while the first request is still in flight', async () => {
        const {card, policyID} = await setUpBrokenCard();

        const home = renderScreenWithCover(
            <FixCompanyCardConnection
                card={card}
                policyID={policyID}
                policyName="Corp"
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(mockedOpenPolicyCompanyCardsPage).toHaveBeenCalledTimes(1);

        await home.hide();
        await home.reveal();

        // The in-flight set is module state that a cover never touches, so the re-run of the fetch effect is a no-op.
        expect(mockedOpenPolicyCompanyCardsPage).toHaveBeenCalledTimes(1);
    });

    it('never fetches while the feed is already there', async () => {
        const {card, policyID, feedKey} = await setUpBrokenCard();
        await setFeed(feedKey, LOADED_FEED);

        const home = renderScreenWithCover(
            <FixCompanyCardConnection
                card={card}
                policyID={policyID}
                policyName="Corp"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        await home.hide();
        await home.reveal();

        expect(mockedOpenPolicyCompanyCardsPage).not.toHaveBeenCalled();
        expect(screen.getByTestId('fix-company-card-item')).toBeOnTheScreen();
    });

    it('issues no fetch while hidden and covers a reconnect missed behind the cover with a single reveal fetch', async () => {
        await setNetworkOffline(true);
        const {card, policyID} = await setUpBrokenCard();

        const home = renderScreenWithCover(
            <FixCompanyCardConnection
                card={card}
                policyID={policyID}
                policyName="Corp"
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(mockedOpenPolicyCompanyCardsPage).not.toHaveBeenCalled();

        await home.hide();
        await setNetworkOffline(false);

        // A hidden subtree has no network subscription left, so the reconnect callback cannot run behind the cover.
        const fetchesWhileHidden = getCoverMode() === 'activity' ? 0 : 1;
        expect(mockedOpenPolicyCompanyCardsPage).toHaveBeenCalledTimes(fetchesWhileHidden);

        await home.reveal();

        // On reveal the restored network subscription reports the reconnect and the fetch effect re-runs, and the
        // in-flight set keeps the two of them from turning into two requests.
        expect(mockedOpenPolicyCompanyCardsPage).toHaveBeenCalledTimes(1);
    });

    it('clears the in-flight marker when the feed arrives behind the cover, so a later mount can fetch again', async () => {
        const {card, policyID, feedKey} = await setUpBrokenCard();

        const home = renderScreenWithCover(
            <FixCompanyCardConnection
                card={card}
                policyID={policyID}
                policyName="Corp"
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(mockedOpenPolicyCompanyCardsPage).toHaveBeenCalledTimes(1);

        await home.hide();
        await setFeed(feedKey, LOADED_FEED);
        await home.reveal();

        expect(screen.getByTestId('fix-company-card-item')).toBeOnTheScreen();

        // A fresh mount with the feed gone again proves the marker was cleared: were it still set, this fund could
        // never be fetched again for the rest of the session.
        home.unmount();
        await setFeed(feedKey, null);

        renderScreenWithCover(
            <FixCompanyCardConnection
                card={card}
                policyID={policyID}
                policyName="Corp"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockedOpenPolicyCompanyCardsPage).toHaveBeenCalledTimes(2);
    });
});
