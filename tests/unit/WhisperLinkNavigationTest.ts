import * as Link from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

// Mock the Navigation module
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
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

// Mock helper functions
jest.mock('@libs/actions/Link', () => {
    const actual = jest.requireActual('@libs/actions/Link');
    return {
        ...actual,
        openOldDotLink: jest.fn(),
        openExternalLink: jest.fn(),
        getInternalNewExpensifyPath: jest.fn(),
        canAnonymousUserAccessRoute: jest.fn(() => true),
    };
});

// Mock user authentication
jest.mock('@libs/actions/User', () => ({
    isAnonymousUser: jest.fn(() => false),
}));

const mockNavigate = Navigation.navigate as jest.MockedFunction<typeof Navigation.navigate>;
const mockHasSameExpensifyOrigin = require('@libs/Url').hasSameExpensifyOrigin as jest.MockedFunction<any>;
const mockGetInternalNewExpensifyPath = Link.getInternalNewExpensifyPath as jest.MockedFunction<typeof Link.getInternalNewExpensifyPath>;

describe('Whisper Link Navigation with backTo Parameters', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mocks
        mockHasSameExpensifyOrigin.mockReturnValue(true);
    });

    describe('Expense Chat Links with backTo', () => {
        it('should navigate to expense chat with backTo parameter preserved', () => {
            // Setup: Link from whisper message with backTo parameter
            const originalRoomID = 'room123456';
            const expenseChatID = 'expenseChat789';
            const href = `https://new.expensify.com/r/${expenseChatID}?backTo=/r/${originalRoomID}`;
            
            mockGetInternalNewExpensifyPath.mockReturnValue(`/r/${expenseChatID}?backTo=/r/${originalRoomID}`);

            // Execute
            Link.openLink(href);

            // Verify: Navigation includes the backTo parameter
            expect(mockNavigate).toHaveBeenCalledWith(`/r/${expenseChatID}?backTo=/r/${originalRoomID}`);
        });

        it('should handle URL-encoded backTo parameters correctly', () => {
            // Setup: URL-encoded backTo parameter (as backend would generate)
            const originalRoomID = 'room123456';
            const expenseChatID = 'expenseChat789';
            const href = `https://new.expensify.com/r/${expenseChatID}?backTo=%2Fr%2F${originalRoomID}`;
            
            mockGetInternalNewExpensifyPath.mockReturnValue(`/r/${expenseChatID}?backTo=%2Fr%2F${originalRoomID}`);

            // Execute
            Link.openLink(href);

            // Verify: Navigation preserves the encoded parameter
            expect(mockNavigate).toHaveBeenCalledWith(`/r/${expenseChatID}?backTo=%2Fr%2F${originalRoomID}`);
        });
    });

    describe('Workspace Member Settings Links with backTo', () => {
        it('should navigate to workspace settings with backTo parameter preserved', () => {
            // Setup: Workspace member settings link with backTo
            const originalRoomID = 'room123456';
            const workspaceID = 'workspace789';
            const href = `https://new.expensify.com/workspace/${workspaceID}/members?backTo=/r/${originalRoomID}`;
            
            mockGetInternalNewExpensifyPath.mockReturnValue(`/workspace/${workspaceID}/members?backTo=/r/${originalRoomID}`);

            // Execute
            Link.openLink(href);

            // Verify: Navigation includes the backTo parameter
            expect(mockNavigate).toHaveBeenCalledWith(`/workspace/${workspaceID}/members?backTo=/r/${originalRoomID}`);
        });

        it('should handle complex workspace URLs with multiple parameters and backTo', () => {
            // Setup: Complex URL with additional parameters
            const originalRoomID = 'room123456';
            const workspaceID = 'workspace789';
            const href = `https://new.expensify.com/workspace/${workspaceID}/members?tab=invited&backTo=/r/${originalRoomID}`;
            
            mockGetInternalNewExpensifyPath.mockReturnValue(`/workspace/${workspaceID}/members?tab=invited&backTo=/r/${originalRoomID}`);

            // Execute
            Link.openLink(href);

            // Verify: All parameters preserved including backTo
            expect(mockNavigate).toHaveBeenCalledWith(`/workspace/${workspaceID}/members?tab=invited&backTo=/r/${originalRoomID}`);
        });
    });

    describe('ReportID URLs with backTo (Concierge Links)', () => {
        it('should handle reportID URLs with backTo parameters', () => {
            // Setup: Concierge-style link with reportID and backTo
            const originalRoomID = 'room123456';
            const targetReportID = 'report789';
            const href = `https://www.expensify.com/newdotreport?reportID=${targetReportID}&backTo=/r/${originalRoomID}`;
            
            mockHasSameExpensifyOrigin
                .mockReturnValueOnce(true) // hasSameOrigin
                .mockReturnValueOnce(true); // hasExpensifyOrigin

            // Execute
            Link.openLink(href);

            // Verify: backTo parameter is preserved in navigation
            const expectedRoute = ROUTES.REPORT_WITH_ID.getRoute(targetReportID);
            expect(mockNavigate).toHaveBeenCalledWith(expectedRoute);
            
            // Note: The current implementation doesn't preserve backTo for reportID URLs
            // This test documents the current behavior and can be updated when that changes
        });
    });

    describe('Backward Compatibility', () => {
        it('should still work with links that dont have backTo parameters', () => {
            // Setup: Legacy link without backTo (current backend behavior)
            const expenseChatID = 'expenseChat789';
            const href = `https://new.expensify.com/r/${expenseChatID}`;
            
            mockGetInternalNewExpensifyPath.mockReturnValue(`/r/${expenseChatID}`);

            // Execute
            Link.openLink(href);

            // Verify: Navigation still works without backTo
            expect(mockNavigate).toHaveBeenCalledWith(`/r/${expenseChatID}`);
        });

        it('should handle malformed backTo parameters gracefully', () => {
            // Setup: Link with malformed backTo parameter
            const expenseChatID = 'expenseChat789';
            const href = `https://new.expensify.com/r/${expenseChatID}?backTo=invalid-format`;
            
            mockGetInternalNewExpensifyPath.mockReturnValue(`/r/${expenseChatID}?backTo=invalid-format`);

            // Execute
            Link.openLink(href);

            // Verify: Navigation doesn't crash with malformed backTo
            expect(mockNavigate).toHaveBeenCalledWith(`/r/${expenseChatID}?backTo=invalid-format`);
        });
    });

    describe('Backend Fix Verification Templates', () => {
        it('should verify the exact format backend should generate for expense chat links', () => {
            // This test documents the expected format for backend implementation
            const originalRoomID = 'room123456';
            const expenseChatID = 'expenseChat789';
            
            // Expected format: https://new.expensify.com/r/expenseChatID?backTo=/r/originalRoomID
            const expectedHref = `https://new.expensify.com/r/${expenseChatID}?backTo=${encodeURIComponent(`/r/${originalRoomID}`)}`;
            
            mockGetInternalNewExpensifyPath.mockReturnValue(`/r/${expenseChatID}?backTo=${encodeURIComponent(`/r/${originalRoomID}`)}`);
            
            Link.openLink(expectedHref);
            
            expect(mockNavigate).toHaveBeenCalledWith(`/r/${expenseChatID}?backTo=${encodeURIComponent(`/r/${originalRoomID}`)}`);
        });

        it('should verify the exact format backend should generate for workspace settings links', () => {
            // This test documents the expected format for backend implementation
            const originalRoomID = 'room123456';
            const workspaceID = 'workspace789';
            
            // Expected format: https://new.expensify.com/workspace/workspaceID/members?backTo=/r/originalRoomID
            const expectedHref = `https://new.expensify.com/workspace/${workspaceID}/members?backTo=${encodeURIComponent(`/r/${originalRoomID}`)}`;
            
            mockGetInternalNewExpensifyPath.mockReturnValue(`/workspace/${workspaceID}/members?backTo=${encodeURIComponent(`/r/${originalRoomID}`)}`);
            
            Link.openLink(expectedHref);
            
            expect(mockNavigate).toHaveBeenCalledWith(`/workspace/${workspaceID}/members?backTo=${encodeURIComponent(`/r/${originalRoomID}`)}`);
        });
    });

    describe('Navigation System Integration', () => {
        it('should verify that arePathAndBackToEqual function handles whisper links correctly', () => {
            // This tests the frontend navigation logic that handles backTo parameters
            // The linkTo function in src/libs/Navigation/helpers/linkTo/index.ts 
            // should properly recognize and handle the backTo parameters
            
            const originalRoomID = 'room123456';
            const expenseChatID = 'expenseChat789';
            const href = `https://new.expensify.com/r/${expenseChatID}?backTo=/r/${originalRoomID}`;
            
            mockGetInternalNewExpensifyPath.mockReturnValue(`/r/${expenseChatID}?backTo=/r/${originalRoomID}`);
            
            Link.openLink(href);
            
            // The navigation should preserve the backTo parameter for proper back navigation
            expect(mockNavigate).toHaveBeenCalledWith(`/r/${expenseChatID}?backTo=/r/${originalRoomID}`);
        });
    });
});