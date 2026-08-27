// cspell:ignore Julesssss jasperhuangg GYJH
import {describe, expect, it} from 'bun:test';

import CONST from '@github/libs/CONST';

import {buildRetestPayload, getCherryPicks, getLinkedIssueNumbers, getRetestMarker, getSlackAuthor} from '@scripts/createRetestRequestForCP';
import type {RetestHit} from '@scripts/createRetestRequestForCP';

describe('createRetestRequestForCP', () => {
    describe('getCherryPicks', () => {
        it('pulls the source SHA and the requester out of the trailers', () => {
            const message = 'Fix the thing\n\n(cherry picked from commit 1234567890abcdef1234567890abcdef12345678)\n\n(cherry-picked to staging by Julesssss)';
            expect(getCherryPicks([message])).toEqual([{sourceSHA: '1234567890abcdef1234567890abcdef12345678', actor: 'Julesssss'}]);
        });

        it('keeps each cherry-pick with its own requester and dedupes repeats', () => {
            const messages = [
                '(cherry picked from commit aaaaaaa)\n\n(cherry-picked to staging by mountiny)',
                '(cherry picked from commit bbbbbbb)\n\n(cherry-picked to staging by Julesssss)',
                '(cherry picked from commit aaaaaaa)\n\n(cherry-picked to staging by someoneElse)',
            ];
            expect(getCherryPicks(messages)).toEqual([
                {sourceSHA: 'aaaaaaa', actor: 'mountiny'},
                {sourceSHA: 'bbbbbbb', actor: 'Julesssss'},
            ]);
        });

        it('still returns the SHA when the requester trailer is missing', () => {
            expect(getCherryPicks(['(cherry picked from commit aaaaaaa)'])).toEqual([{sourceSHA: 'aaaaaaa', actor: ''}]);
        });

        it('returns nothing when no commit was cherry-picked', () => {
            expect(getCherryPicks(['Merge pull request #1 from foo/bar', 'Update version to 1.2.3-4'])).toEqual([]);
        });
    });

    describe('getSlackAuthor', () => {
        const slackIDs = new Map([['jasperhuangg', 'U01N2A6GYJH']]);

        it('sends the raw member ID, since the retest workflow builds the mention itself', () => {
            expect(getSlackAuthor('jasperhuangg', slackIDs)).toBe('U01N2A6GYJH');
        });

        it('falls back to the plain login for people outside the whitelist', () => {
            expect(getSlackAuthor('some-oss-contributor', slackIDs)).toBe('some-oss-contributor');
        });

        it('sends N/A when there is no login at all', () => {
            expect(getSlackAuthor('', slackIDs)).toBe('N/A');
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
            author: 'U01N2A6GYJH',
        };

        it('maps a hit to the exact Slack workflow variables', () => {
            expect(buildRetestPayload(hit)).toEqual({
                isDb: 'dbTrue',
                whereToRetest: 'Staging',
                notes: 'Auto-filed after cherry-pick to staging: "Fix crash on staging"',
                ghIssueLink: `${CONST.APP_REPO_URL}/issues/42`,
                adhocLink: 'N/A',
                requesterName: 'octocat',
                author: 'U01N2A6GYJH',
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
