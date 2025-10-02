import {render, waitFor} from '@testing-library/react-native';
import React from 'react';
import {EnvironmentContext, EnvironmentProvider} from '@components/EnvironmentContext';
import CONST from '@src/CONST';

// Mock getEnvironment and getEnvironmentURL
const mockGetEnvironment: jest.MockedFunction<() => Promise<string>> = jest.fn();
const mockGetEnvironmentURL: jest.MockedFunction<() => Promise<string>> = jest.fn();

jest.mock('@libs/Environment/getEnvironment', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
                    <EnvironmentContext.Consumer>
                        {({adjustExpensifyLinksForEnv: fn}) => {
                            adjustExpensifyLinksForEnv = fn;
                            return null;
                        }}
                    </EnvironmentContext.Consumer>
                </EnvironmentProvider>,
            );

            // Wait for useEffect to resolve mocked promises
            await waitFor(() => {
                expect(mockGetEnvironment).toHaveBeenCalled();
                // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
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
    });
});
