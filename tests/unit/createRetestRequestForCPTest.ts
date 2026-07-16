import CONST from '@github/libs/CONST';

import {buildRetestPayload, getCherryPickSourceSHAs, getLinkedIssueNumbers, getRetestMarker} from '@scripts/createRetestRequestForCP';
import type {RetestHit} from '@scripts/createRetestRequestForCP';

/**
 * @jest-environment node
 */

describe('createRetestRequestForCP', () => {
    describe('getCherryPickSourceSHAs', () => {
        it('pulls the source SHA out of a cherry-pick trailer', () => {
            const message = 'Fix the thing\n\n(cherry picked from commit 1234567890abcdef1234567890abcdef12345678)';
            expect(getCherryPickSourceSHAs([message])).toEqual(['1234567890abcdef1234567890abcdef12345678']);
        });

        it('collects a SHA from each commit and dedupes repeats', () => {
            const messages = ['(cherry picked from commit aaaaaaa)', '(cherry picked from commit bbbbbbb)', '(cherry picked from commit aaaaaaa)'];
            expect(getCherryPickSourceSHAs(messages)).toEqual(['aaaaaaa', 'bbbbbbb']);
        });

        it('returns nothing when no commit was cherry-picked', () => {
            expect(getCherryPickSourceSHAs(['Merge pull request #1 from foo/bar', 'Update version to 1.2.3-4'])).toEqual([]);
        });
    });

    describe('getLinkedIssueNumbers', () => {
        it('finds App issue links in the PR body', () => {
            const body = `Fixes ${CONST.APP_REPO_URL}/issues/42 and also ${CONST.APP_REPO_URL}/issues/99`;
            expect(getLinkedIssueNumbers(body)).toEqual([42, 99]);
        });

        it('ignores PR links and other repos', () => {
            const body = `See ${CONST.APP_REPO_URL}/pull/7 and ${CONST.MOBILE_EXPENSIFY_URL}/issues/5`;
            expect(getLinkedIssueNumbers(body)).toEqual([]);
        });

        it('handles an empty body', () => {
            expect(getLinkedIssueNumbers(null)).toEqual([]);
            expect(getLinkedIssueNumbers('')).toEqual([]);
        });
    });

    describe('buildRetestPayload', () => {
        const hit: RetestHit = {
            prNumber: 123,
            prURL: `${CONST.APP_REPO_URL}/pull/123`,
            prAuthor: 'octocat',
            blockerIssueURLs: [`${CONST.APP_REPO_URL}/issues/42`],
            prTitle: 'Fix crash on staging',
        };

        it('maps a hit to the exact Slack workflow variables', () => {
            expect(buildRetestPayload(hit)).toEqual({
                isDb: 'dbTrue',
                whereToRetest: 'Staging',
                notes: 'Auto-filed after cherry-pick to staging: "Fix crash on staging"',
                ghIssueLink: `${CONST.APP_REPO_URL}/issues/42`,
                adhocLink: 'N/A',
                requesterName: 'octocat',
                cpLink: `${CONST.APP_REPO_URL}/pull/123`,
                platforms: 'Android, iOS, Web',
            });
        });

        it('puts every blocker a PR fixes into one request, space-separated (Slack field rejects newlines)', () => {
            const multi = {...hit, blockerIssueURLs: [`${CONST.APP_REPO_URL}/issues/42`, `${CONST.APP_REPO_URL}/issues/99`]};
            expect(buildRetestPayload(multi).ghIssueLink).toBe(`${CONST.APP_REPO_URL}/issues/42 ${CONST.APP_REPO_URL}/issues/99`);
        });

        it('sends N/A for a missing requester so Slack does not reject an empty value', () => {
            expect(buildRetestPayload({...hit, prAuthor: ''}).requesterName).toBe('N/A');
        });
    });

    describe('getRetestMarker', () => {
        it('is unique per staging tag so a re-deploy does not double-file', () => {
            expect(getRetestMarker('9.1.2-3-staging')).toBe('<!-- retest-requested:9.1.2-3-staging -->');
            expect(getRetestMarker('9.1.2-3-staging')).not.toBe(getRetestMarker('9.1.2-4-staging'));
        });
    });
});
