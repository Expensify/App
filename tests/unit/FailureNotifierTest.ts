/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/naming-convention -- matching GitHub API response field names */
import {getMergedPR} from '@github/actions/javascript/failureNotifier/failureNotifier';
import type {PullRequest} from '@github/actions/javascript/failureNotifier/failureNotifier';

describe('getMergedPR', () => {
    const mergedPR = {
        html_url: 'https://github.com/Expensify/App/pull/82016',
        user: {login: 'test-user'},
        merged_at: '2026-02-10T17:00:00Z',
        base: {ref: 'main'},
        number: 82016,
    } as PullRequest;

    const openPRWithMainMerged = {
        html_url: 'https://github.com/Expensify/App/pull/80254',
        user: {login: 'test-user'},
        merged_at: null,
        base: {ref: 'main'},
        number: 80254,
    } as PullRequest;

    const openPRDifferentBase = {
        html_url: 'https://github.com/Expensify/App/pull/99999',
        user: {login: 'other-user'},
        merged_at: null,
        base: {ref: 'staging'},
        number: 99999,
    } as PullRequest;

    it('should return the merged PR, not an open PR that contains the same commit', () => {
        // When an open PR has merged main, both PRs are associated with the head commit.
        // The API may return the open PR first (this is the bug scenario).
        const associatedPRs = [openPRWithMainMerged, mergedPR];

        const result = getMergedPR(associatedPRs);

        // Should pick the actually-merged PR, not the open one
        expect(result?.number).toBe(82016);
        expect(result?.merged_at).not.toBeNull();
    });

    it('should return the merged PR even when it appears first', () => {
        const associatedPRs = [mergedPR, openPRWithMainMerged];

        const result = getMergedPR(associatedPRs);

        expect(result?.number).toBe(82016);
    });

    it('should filter by target branch', () => {
        const mergedToStaging = {
            ...mergedPR,
            number: 11111,
            base: {ref: 'staging'},
            merged_at: '2026-02-10T18:00:00Z',
        } as PullRequest;

        const associatedPRs = [mergedToStaging, mergedPR];

        // Default target branch is 'main', so it should skip the staging PR
        const result = getMergedPR(associatedPRs);
        expect(result?.number).toBe(82016);
    });

    it('should fall back to first PR if no merged PR is found', () => {
        const associatedPRs = [openPRWithMainMerged, openPRDifferentBase];

        const result = getMergedPR(associatedPRs);

        // Falls back to first element when no merged PR matches
        expect(result?.number).toBe(80254);
    });

    it('should return undefined for empty array', () => {
        const result = getMergedPR([]);

        expect(result).toBeUndefined();
    });
});
