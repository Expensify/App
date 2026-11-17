import {act, renderHook} from '@testing-library/react-native';

import useDomainsTabBadge from '@pages/home/ForYouSection/useDomainsTabBadge';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain, DomainErrors} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const REQUESTER_A = 2;
const REQUESTER_B = 3;

// Builds a domain the current user administers, optionally carrying pending adminship requesters.
const createDomain = (accountID: number, options: {requesters?: Record<number, unknown>; isAdmin?: boolean} = {}): Domain => {
    const {requesters, isAdmin = true} = options;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const domain: Domain = {accountID, validated: true, email: `domain${accountID}@example.com`, domain_defaultSecurityGroupID: '0'};
    if (isAdmin) {
        Reflect.set(domain, `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`, CURRENT_USER_ACCOUNT_ID);
    }
    if (requesters) {
        Reflect.set(domain, 'domain_adminRequesters', requesters);
    }
    return domain;
};

// A domain error entry with a top-level error, which is enough for hasDomainErrors to flag the domain.
const createDomainErrors = (): DomainErrors => ({
    errors: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '1700000000': 'Something went wrong',
    },
});

const setDomain = (accountID: number, domain: Domain) => Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, domain);
const setDomainErrors = (accountID: number, errors: DomainErrors) => Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${accountID}`, errors);

const renderDomainsTabBadge = async () => {
    const hook = renderHook(() => useDomainsTabBadge());
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

describe('useDomainsTabBadge', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'tester@example.com'});
        await waitForBatchedUpdates();
    });

    it('returns no badge when there are no pending requests and no errors', async () => {
        // Given no domains carrying pending requests or errors

        // When the badge hook renders
        const {result} = await renderDomainsTabBadge();

        // Then there is nothing to surface, so the badge stays empty and green
        expect(result.current.badgeText).toBeUndefined();
        expect(result.current.hasDomainErrors).toBe(false);
    });

    it('counts a single domain with a pending request and stays green', async () => {
        // Given one administered domain with a single pending adminship request
        await setDomain(10, createDomain(10, {requesters: {[REQUESTER_A]: 'read'}}));
        await waitForBatchedUpdates();

        // When the badge hook renders
        const {result} = await renderDomainsTabBadge();

        // Then the badge counts that one domain and, with no errors, stays green
        expect(result.current.badgeText).toBe('1');
        expect(result.current.hasDomainErrors).toBe(false);
    });

    it('counts one row per domain, not per request, when a domain has several requesters', async () => {
        // Given one administered domain that has two pending requesters
        await setDomain(10, createDomain(10, {requesters: {[REQUESTER_A]: 'read', [REQUESTER_B]: 'read'}}));
        await waitForBatchedUpdates();

        // When the badge hook renders
        const {result} = await renderDomainsTabBadge();

        // Then the count reflects the domain once, not each requester, so it reads 1
        expect(result.current.badgeText).toBe('1');
        expect(result.current.hasDomainErrors).toBe(false);
    });

    it('counts distinct domains that each have a pending request', async () => {
        // Given two administered domains, each with its own pending requester
        await setDomain(10, createDomain(10, {requesters: {[REQUESTER_A]: 'read'}}));
        await setDomain(11, createDomain(11, {requesters: {[REQUESTER_B]: 'read'}}));
        await waitForBatchedUpdates();

        // When the badge hook renders
        const {result} = await renderDomainsTabBadge();

        // Then each distinct domain adds to the count, so it reads 2
        expect(result.current.badgeText).toBe('2');
        expect(result.current.hasDomainErrors).toBe(false);
    });

    it('counts a domain with an error and colors the badge red', async () => {
        // Given one administered domain with no pending requests but a domain error
        await setDomain(20, createDomain(20));
        await setDomainErrors(20, createDomainErrors());
        await waitForBatchedUpdates();

        // When the badge hook renders
        const {result} = await renderDomainsTabBadge();

        // Then the errored domain is counted and the presence of errors turns the badge red
        expect(result.current.badgeText).toBe('1');
        expect(result.current.hasDomainErrors).toBe(true);
    });

    it('counts a domain once when it has both a pending request and an error', async () => {
        // Given one administered domain that has both a pending request and an error
        await setDomain(10, createDomain(10, {requesters: {[REQUESTER_A]: 'read'}}));
        await setDomainErrors(10, createDomainErrors());
        await waitForBatchedUpdates();

        // When the badge hook renders
        const {result} = await renderDomainsTabBadge();

        // Then the domain is counted once even though it qualifies on two fronts, and the error still turns it red
        expect(result.current.badgeText).toBe('1');
        expect(result.current.hasDomainErrors).toBe(true);
    });

    it('sums distinct domains across pending requests and errors', async () => {
        // Given one domain that qualifies via a pending request and a different domain that qualifies via an error
        await setDomain(10, createDomain(10, {requesters: {[REQUESTER_A]: 'read'}}));
        await setDomain(20, createDomain(20));
        await setDomainErrors(20, createDomainErrors());
        await waitForBatchedUpdates();

        // When the badge hook renders
        const {result} = await renderDomainsTabBadge();

        // Then both distinct domains are summed to 2 and the error keeps the badge red
        expect(result.current.badgeText).toBe('2');
        expect(result.current.hasDomainErrors).toBe(true);
    });

    it('does not count a pending request on a domain the user does not administer', async () => {
        // Given a domain with a pending request that the current user does not administer
        await setDomain(30, createDomain(30, {isAdmin: false, requesters: {[REQUESTER_A]: 'read'}}));
        await waitForBatchedUpdates();

        // When the badge hook renders
        const {result} = await renderDomainsTabBadge();

        // Then the request is ignored because it is not actionable by this user, so no badge shows
        expect(result.current.badgeText).toBeUndefined();
        expect(result.current.hasDomainErrors).toBe(false);
    });

    it('clears the badge once the last pending request is resolved', async () => {
        // Given an administered domain with a single pending request that currently shows a badge
        await setDomain(10, createDomain(10, {requesters: {[REQUESTER_A]: 'read'}}));
        await waitForBatchedUpdates();

        const {result} = await renderDomainsTabBadge();
        expect(result.current.badgeText).toBe('1');

        // When that last request is resolved, which tombstones the requester entry and drops it from the count
        await act(async () => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}10`, {domain_adminRequesters: {[REQUESTER_A]: null}});
            await waitForBatchedUpdates();
        });

        // Then nothing remains to surface, so the badge clears
        expect(result.current.badgeText).toBeUndefined();
        expect(result.current.hasDomainErrors).toBe(false);
    });

    it('drops the red color once the domain error clears while a request remains', async () => {
        // Given an administered domain that has both a pending request and an error, so the badge is red
        await setDomain(10, createDomain(10, {requesters: {[REQUESTER_A]: 'read'}}));
        await setDomainErrors(10, createDomainErrors());
        await waitForBatchedUpdates();

        const {result} = await renderDomainsTabBadge();
        expect(result.current.hasDomainErrors).toBe(true);

        // When the error clears but the pending request stays
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}10`, {errors: {}});
            await waitForBatchedUpdates();
        });

        // Then the domain is still counted for its request, but the badge reverts from red to green
        expect(result.current.badgeText).toBe('1');
        expect(result.current.hasDomainErrors).toBe(false);
    });
});
