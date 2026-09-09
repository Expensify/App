import {render, waitFor} from '@testing-library/react-native';

import EnvironmentProvider, {EnvironmentActionsContext} from '@components/EnvironmentContextProvider';
import {defaultEnvironmentActionsContextValue} from '@components/EnvironmentContextProvider/default';

import CONST from '@src/CONST';

import React from 'react';

// Mock getEnvironment and getEnvironmentURL
const mockGetEnvironment: jest.MockedFunction<() => Promise<string>> = jest.fn();
const mockGetEnvironmentURL: jest.MockedFunction<() => Promise<string>> = jest.fn();

jest.mock('@libs/Environment/getEnvironment', () => ({
    __esModule: true,
    default: jest.fn(() => mockGetEnvironment()),
}));

jest.mock('@libs/Environment/Environment', () => ({
    getEnvironmentURL: jest.fn().mockImplementation(() => mockGetEnvironmentURL()),
}));

describe('EnvironmentProvider', () => {
    describe('adjustExpensifyLinksForEnv', () => {
        let adjustExpensifyLinksForEnv: (html: string) => string;

        const setupTest = async (environment: string, environmentURL: string) => {
            // Assign mock implementations
            mockGetEnvironment.mockReset().mockResolvedValue(environment);
            mockGetEnvironmentURL.mockReset().mockResolvedValue(environmentURL);

            render(
                <EnvironmentProvider>
                    <EnvironmentActionsContext.Consumer>
                        {({adjustExpensifyLinksForEnv: fn}) => {
                            adjustExpensifyLinksForEnv = fn;
                            return null;
                        }}
                    </EnvironmentActionsContext.Consumer>
                </EnvironmentProvider>,
            );

            // Wait for useEffect to resolve mocked promises
            await waitFor(() => {
                expect(mockGetEnvironment).toHaveBeenCalled();

                expect(mockGetEnvironmentURL).toHaveBeenCalled();
            });
        };

        beforeEach(() => {
            jest.clearAllMocks();
            mockGetEnvironment.mockReset();
            mockGetEnvironmentURL.mockReset();
        });

        it('should not modify URLs in production environment', async () => {
            await setupTest(CONST.ENVIRONMENT.PRODUCTION, CONST.NEW_EXPENSIFY_URL);
            const inputHtml = '<a href="https://new.expensify.com/workspaces/123/more-features">More Features</a>';
            const expectedOutput = '<a href="https://new.expensify.com/workspaces/123/more-features">More Features</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should replace new.expensify.com with staging environment URL', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '<a href="https://new.expensify.com/workspaces/123/more-features">More Features</a>';
            const expectedOutput = '<a href="https://staging.new.expensify.com/workspaces/123/more-features">More Features</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should replace new.expensify.com with dev environment URL', async () => {
            await setupTest(CONST.ENVIRONMENT.DEV, 'https://dev.new.expensify.com');
            const inputHtml = '<a href="https://new.expensify.com/workspaces/123/more-features">More Features</a>';
            const expectedOutput = '<a href="https://dev.new.expensify.com/workspaces/123/more-features">More Features</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should handle multiple links in the HTML', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '<a href="https://new.expensify.com/settings">Settings</a><a href="https://new.expensify.com/profile">Profile</a>';
            const expectedOutput = '<a href="https://staging.new.expensify.com/settings">Settings</a><a href="https://staging.new.expensify.com/profile">Profile</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should not modify non-expensify URLs', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '<a href="https://example.com">Example</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(inputHtml);
        });

        it('should handle empty HTML string', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe('');
        });

        it('should handle HTML without href attributes', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '<a>Link without href</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(inputHtml);
        });

        it('should handle complex HTML with mixed content', async () => {
            await setupTest(CONST.ENVIRONMENT.DEV, 'https://dev.new.expensify.com');
            const inputHtml = '<p>Visit <a href="https://new.expensify.com/workspaces/123/more-features">More Features</a> and <a href="https://example.com">Example</a></p>';
            const expectedOutput = '<p>Visit <a href="https://dev.new.expensify.com/workspaces/123/more-features">More Features</a> and <a href="https://example.com">Example</a></p>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should preserve additional attributes in anchor tags', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '<a class="link" href="https://new.expensify.com/workspaces/123/more-features" target="_blank">More Features</a>';
            const expectedOutput = '<a class="link" href="https://staging.new.expensify.com/workspaces/123/more-features" target="_blank">More Features</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should handle URLs with query parameters', async () => {
            await setupTest(CONST.ENVIRONMENT.DEV, 'https://dev.new.expensify.com');
            const inputHtml = '<a href="https://new.expensify.com/workspaces/123/more-features?param=value">More Features</a>';
            const expectedOutput = '<a href="https://dev.new.expensify.com/workspaces/123/more-features?param=value">More Features</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should handle partial HTML with a single Expensify link', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = 'Read up on <a href="https://new.expensify.com/help">Expensify Help</a> to find out more.';
            const expectedOutput = 'Read up on <a href="https://staging.new.expensify.com/help">Expensify Help</a> to find out more.';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should handle partial HTML with multiple Expensify links', async () => {
            await setupTest(CONST.ENVIRONMENT.DEV, 'https://dev.new.expensify.com');
            const inputHtml = 'Check <a href="https://new.expensify.com/help">Help</a> or <a href="https://new.expensify.com/support">Support</a>.';
            const expectedOutput = 'Check <a href="https://dev.new.expensify.com/help">Help</a> or <a href="https://dev.new.expensify.com/support">Support</a>.';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should handle partial HTML with mixed Expensify and non-Expensify links', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = 'Visit <a href="https://new.expensify.com/help">Expensify Help</a> or <a href="https://example.com">Example</a> for more info.';
            const expectedOutput = 'Visit <a href="https://staging.new.expensify.com/help">Expensify Help</a> or <a href="https://example.com">Example</a> for more info.';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should handle partial HTML with no HTML tags', async () => {
            await setupTest(CONST.ENVIRONMENT.DEV, 'https://dev.new.expensify.com');
            const inputHtml = 'Just text with no links or tags.';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(inputHtml);
        });

        it('should handle partial HTML with incomplete anchor tags', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = 'Link: <a href="https://new.expensify.com/help">Help</a> and <a>broken link</a>.';
            const expectedOutput = 'Link: <a href="https://staging.new.expensify.com/help">Help</a> and <a>broken link</a>.';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should not modify custom tags like <mention-user /> or <emoji>', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '<mention-user accountID="20565304"/><emoji ismedium>😃</emoji><a href="https://new.expensify.com/help">Help</a>';
            const expectedOutput = '<mention-user accountID="20565304"/><emoji ismedium>😃</emoji><a href="https://staging.new.expensify.com/help">Help</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should not modify HTML without any href attributes', async () => {
            await setupTest(CONST.ENVIRONMENT.DEV, 'https://dev.new.expensify.com');
            const inputHtml = '<p>No links here</p><div><span>Just text</span></div>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(inputHtml);
        });

        // The backend writes anchors with single-quoted attributes, so these are the cases that matter most in practice.
        it('should replace the origin in a single-quoted href generated by the backend', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml =
                "<a href='https://new.expensify.com/settings/wallet' target='_blank' rel='noreferrer noopener'>Connect your card</a> to sync transactions and auto-match receipts next time!";
            const expectedOutput =
                "<a href='https://staging.new.expensify.com/settings/wallet' target='_blank' rel='noreferrer noopener'>Connect your card</a> to sync transactions and auto-match receipts next time!";
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should replace the origin in a single-quoted href on dev', async () => {
            await setupTest(CONST.ENVIRONMENT.DEV, 'https://dev.new.expensify.com:8082');
            const inputHtml = "<a href='https://new.expensify.com/settings/wallet'>Wallet</a>";
            const expectedOutput = "<a href='https://dev.new.expensify.com:8082/settings/wallet'>Wallet</a>";
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should replace the origin in an unquoted href and leave it unquoted', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '<a href=https://new.expensify.com/settings/wallet>Wallet</a>';
            const expectedOutput = '<a href=https://staging.new.expensify.com/settings/wallet>Wallet</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should preserve each anchor own quoting style when they are mixed', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = `<a href="https://new.expensify.com/settings/subscription">Subscription</a> and <a href='https://new.expensify.com/settings/wallet'>Wallet</a>`;
            const expectedOutput = `<a href="https://staging.new.expensify.com/settings/subscription">Subscription</a> and <a href='https://staging.new.expensify.com/settings/wallet'>Wallet</a>`;
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should replace every occurrence when two anchors share the same href', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = "<a href='https://new.expensify.com/r/1'>first</a><a href='https://new.expensify.com/r/1'>second</a>";
            const expectedOutput = "<a href='https://staging.new.expensify.com/r/1'>first</a><a href='https://staging.new.expensify.com/r/1'>second</a>";
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should not modify custom tags when the anchor is single-quoted', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = `<mention-user accountID="20565304"/><emoji ismedium>😃</emoji><muted-text><a href='https://new.expensify.com/help'>Help</a></muted-text><br /><edited></edited>`;
            const expectedOutput = `<mention-user accountID="20565304"/><emoji ismedium>😃</emoji><muted-text><a href='https://staging.new.expensify.com/help'>Help</a></muted-text><br /><edited></edited>`;
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should not modify data-raw-href, which holds the text the user typed', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml =
                '<a href="https://new.expensify.com/r/1" data-raw-href="https://new.expensify.com/r/1" data-link-variant="auto" target="_blank" rel="noreferrer noopener">link</a>';
            const expectedOutput =
                '<a href="https://staging.new.expensify.com/r/1" data-raw-href="https://new.expensify.com/r/1" data-link-variant="auto" target="_blank" rel="noreferrer noopener">link</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should preserve HTML entities in the href', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '<a href="https://new.expensify.com/search?type=expense&amp;status=all">Search</a>';
            const expectedOutput = '<a href="https://staging.new.expensify.com/search?type=expense&amp;status=all">Search</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should not modify a host that merely starts with the production origin', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '<a href="https://new.expensify.com.example.com/steal">Lookalike</a>';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(inputHtml);
        });

        it('should replace a bare production origin with no path', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = "<a href='https://new.expensify.com'>Home</a>";
            const expectedOutput = "<a href='https://staging.new.expensify.com'>Home</a>";
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(expectedOutput);
        });

        it('should only rewrite anchor tags', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = '<link href="https://new.expensify.com/styles.css" />';
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(inputHtml);
        });

        // We deliberately only rewrite the production origin. Staging links pasted into production chats must keep
        // pointing at staging, otherwise clicking them would silently land the reader on a different environment.
        it('should not rewrite staging links when running on production', async () => {
            await setupTest(CONST.ENVIRONMENT.PRODUCTION, CONST.NEW_EXPENSIFY_URL);
            const inputHtml = "<a href='https://staging.new.expensify.com/r/1'>Staging report</a>";
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(inputHtml);
        });

        it('should not rewrite staging links when running on staging', async () => {
            await setupTest(CONST.ENVIRONMENT.STAGING, 'https://staging.new.expensify.com');
            const inputHtml = "<a href='https://staging.new.expensify.com/r/1'>Staging report</a>";
            expect(adjustExpensifyLinksForEnv(inputHtml)).toBe(inputHtml);
        });
    });

    describe('defaultEnvironmentActionsContextValue', () => {
        it('should return the HTML unchanged when rendered outside of EnvironmentProvider', () => {
            const inputHtml = "<a href='https://new.expensify.com/settings/wallet'>Wallet</a>";
            expect(defaultEnvironmentActionsContextValue.adjustExpensifyLinksForEnv(inputHtml)).toBe(inputHtml);
        });
    });
});
