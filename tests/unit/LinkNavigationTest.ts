import * as Link from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

// Mock the Navigation module
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

// Mock URL utilities
jest.mock('@libs/Url', () => ({
    hasSameExpensifyOrigin: jest.fn(),
}));

// Mock CONFIG
jest.mock('@src/CONFIG', () => ({
    EXPENSIFY: {
        EXPENSIFY_URL: 'https://www.expensify.com',
        STAGING_API_ROOT: 'https://staging.expensify.com',
        NEW_EXPENSIFY_URL: 'https://new.expensify.com',
    },
}));

// Mock external link functions
jest.mock('@libs/actions/Link', () => {
    const actual = jest.requireActual('@libs/actions/Link');
    return {
        ...actual,
        openOldDotLink: jest.fn(),
        openExternalLink: jest.fn(),
    };
});

const mockNavigate = Navigation.navigate as jest.MockedFunction<typeof Navigation.navigate>;
const mockHasSameExpensifyOrigin = require('@libs/Url').hasSameExpensifyOrigin as jest.MockedFunction<any>;

describe('Link Navigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('openLink with reportID URLs', () => {
        it('should navigate to report with proper back navigation options', () => {
            // Setup
            const reportID = '123456789';
            const href = `https://www.expensify.com/newdotreport?reportID=${reportID}`;
            
            mockHasSameExpensifyOrigin
                .mockReturnValueOnce(true) // hasSameOrigin
                .mockReturnValueOnce(true); // hasExpensifyOrigin

            // Execute
            Link.openLink(href);

            // Verify
            expect(mockNavigate).toHaveBeenCalledWith(
                ROUTES.REPORT_WITH_ID.getRoute(reportID),
                { forceReplace: false }
            );
        });

        it('should handle reportID URLs with additional parameters', () => {
            // Setup
            const reportID = '987654321';
            const href = `https://www.expensify.com/newdotreport?reportID=${reportID}&other=param`;
            
            mockHasSameExpensifyOrigin
                .mockReturnValueOnce(true) // hasSameOrigin
                .mockReturnValueOnce(true); // hasExpensifyOrigin

            // Execute
            Link.openLink(href);

            // Verify
            expect(mockNavigate).toHaveBeenCalledWith(
                ROUTES.REPORT_WITH_ID.getRoute(reportID),
                { forceReplace: false }
            );
        });
    });

    describe('openLink with internal New Expensify paths', () => {
        it('should navigate to workspace member settings with proper back navigation', () => {
            // Setup
            const workspaceSettingsPath = '/workspace/123/members';
            const href = `https://new.expensify.com${workspaceSettingsPath}`;
            
            mockHasSameExpensifyOrigin.mockReturnValue(true);
            
            // Mock getInternalNewExpensifyPath to return the path
            jest.spyOn(Link, 'getInternalNewExpensifyPath').mockReturnValue(workspaceSettingsPath);

            // Execute
            Link.openLink(href);

            // Verify
            expect(mockNavigate).toHaveBeenCalledWith(
                workspaceSettingsPath,
                { forceReplace: false }
            );
        });

        it('should navigate to expense chat with proper back navigation', () => {
            // Setup
            const expenseChatPath = '/r/456789';
            const href = `https://new.expensify.com${expenseChatPath}`;
            
            mockHasSameExpensifyOrigin.mockReturnValue(true);
            
            // Mock getInternalNewExpensifyPath to return the path
            jest.spyOn(Link, 'getInternalNewExpensifyPath').mockReturnValue(expenseChatPath);

            // Execute
            Link.openLink(href);

            // Verify
            expect(mockNavigate).toHaveBeenCalledWith(
                expenseChatPath,
                { forceReplace: false }
            );
        });

        it('should handle workspace settings URLs correctly', () => {
            // Setup
            const workspaceID = 'policy123';
            const workspaceSettingsPath = `/workspace/${workspaceID}/profile`;
            const href = `https://new.expensify.com${workspaceSettingsPath}`;
            
            mockHasSameExpensifyOrigin.mockReturnValue(true);
            
            // Mock getInternalNewExpensifyPath to return the path
            jest.spyOn(Link, 'getInternalNewExpensifyPath').mockReturnValue(workspaceSettingsPath);

            // Execute
            Link.openLink(href);

            // Verify
            expect(mockNavigate).toHaveBeenCalledWith(
                workspaceSettingsPath,
                { forceReplace: false }
            );
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle malformed reportID URLs gracefully', () => {
            // Setup
            const href = 'https://www.expensify.com/newdotreport?reportID=';
            
            mockHasSameExpensifyOrigin
                .mockReturnValueOnce(true) // hasSameOrigin
                .mockReturnValueOnce(true); // hasExpensifyOrigin

            // Execute
            Link.openLink(href);

            // Verify that navigation is still called with the extracted (empty) reportID
            expect(mockNavigate).toHaveBeenCalledWith(
                ROUTES.REPORT_WITH_ID.getRoute(''),
                { forceReplace: false }
            );
        });

        it('should not modify navigation behavior for external links', () => {
            // Setup
            const href = 'https://external-site.com/some-page';
            
            mockHasSameExpensifyOrigin.mockReturnValue(false);
            jest.spyOn(Link, 'getInternalNewExpensifyPath').mockReturnValue('');
            jest.spyOn(Link, 'getInternalExpensifyPath').mockReturnValue('');

            const mockOpenExternalLink = jest.spyOn(Link, 'openExternalLink');

            // Execute
            Link.openLink(href);

            // Verify
            expect(mockNavigate).not.toHaveBeenCalled();
            expect(mockOpenExternalLink).toHaveBeenCalledWith(href);
        });
    });

    describe('Back navigation preservation', () => {
        it('should ensure forceReplace is false for whisper message links', () => {
            // Test reportID links (like "Their expense chat")
            const reportHref = 'https://www.expensify.com/newdotreport?reportID=123';
            mockHasSameExpensifyOrigin
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true);

            Link.openLink(reportHref);

            expect(mockNavigate).toHaveBeenCalledWith(
                expect.any(String),
                { forceReplace: false }
            );

            // Reset mocks
            jest.clearAllMocks();

            // Test workspace settings links (like "Workspace member settings")
            const workspaceHref = 'https://new.expensify.com/workspace/123/members';
            mockHasSameExpensifyOrigin.mockReturnValue(true);
            jest.spyOn(Link, 'getInternalNewExpensifyPath').mockReturnValue('/workspace/123/members');

            Link.openLink(workspaceHref);

            expect(mockNavigate).toHaveBeenCalledWith(
                '/workspace/123/members',
                { forceReplace: false }
            );
        });
    });
});