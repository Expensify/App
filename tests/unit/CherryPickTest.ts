/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import CONST from '@github/libs/CONST';
import GitUtils from '@github/libs/GitUtils';

describe('Cherry-picking PRs to production', () => {
    test('getValidMergedPRs detects cherry-picked PRs to production', () => {
        // Create test commits with various patterns
        const commits = [
            {
                commit: 'abc123',
                authorName: CONST.OS_BOTIFY,
                subject: 'Cherry-pick PR #123 to production'
            },
            {
                commit: 'def456',
                authorName: CONST.OS_BOTIFY,
                subject: 'Merge pull request #456 from Expensify/pr-456'
            },
            {
                commit: 'ghi789',
                authorName: 'human-user',
                subject: 'Merge pull request #789 from Expensify/pr-789'
            },
            {
                commit: 'jkl012',
                authorName: CONST.OS_BOTIFY,
                subject: 'Merge pull request #012 from Expensify/cherry-pick-staging'
            }
        ];

        // Verify that the function detects the correct PR numbers
        const prNumbers = GitUtils.getValidMergedPRs(commits);
        
        // Should detect:
        // - PR #123 from the cherry-pick commit
        // - PR #456 from OSBotify's merge
        // - PR #789 from human merge
        // Should NOT detect:
        // - PR #012 because it's from a cherry-pick-staging branch
        expect(prNumbers).toStrictEqual([123, 456, 789]);
    });

    test('getValidMergedPRs detects multiple cherry-picked PRs correctly', () => {
        // Create test commits with various patterns including multiple cherry-picks
        const commits = [
            {
                commit: 'abc123',
                authorName: CONST.OS_BOTIFY,
                subject: 'Cherry-pick PR #123 to production'
            },
            {
                commit: 'def456',
                authorName: CONST.OS_BOTIFY,
                subject: 'Cherry-pick PR #456 to production'
            },
            {
                commit: 'ghi789',
                authorName: CONST.OS_BOTIFY,
                subject: 'Cherry-pick PR #789 to staging'
            }
        ];

        // Verify that the function detects the correct PR numbers
        const prNumbers = GitUtils.getValidMergedPRs(commits);
        
        // Should detect all cherry-picked PRs
        expect(prNumbers).toStrictEqual([123, 456, 789]);
    });
}); 