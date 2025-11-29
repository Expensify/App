import {render, screen} from '@testing-library/react-native';
import React from 'react';
import DisplayNames from '@components/DisplayNames';
import Parser from '@libs/Parser';

jest.mock('@libs/Parser', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        htmlToText: jest.fn((html: string) => html.replaceAll(/<[^>]*>/g, '')),
    },
}));

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        translate: jest.fn((key: string) => key),
    })),
}));

// eslint-disable-next-line @typescript-eslint/unbound-method
const mockHtmlToText = Parser.htmlToText as jest.Mock;

describe('DisplayNames HTML Parsing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('DisplayNames Component - isGroupChat prop triggers correct shouldParseHtml behavior', () => {
        it('should set shouldParseHtml to false when isGroupChat is true', () => {
            const isGroupChat = true;
            const htmlTitle = '<strong>Group Chat</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml={!isGroupChat}
                />,
            );

            expect(mockHtmlToText).not.toHaveBeenCalled();
        });

        it('should set shouldParseHtml to true when isGroupChat is false', () => {
            const isGroupChat = false;
            const htmlTitle = '<strong>Regular Chat</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml={!isGroupChat}
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });
    });

    describe('DisplayNames Component - Group chat titles and report names', () => {
        it('should NOT parse HTML for group chats when shouldParseHtml is false', () => {
            const htmlTitle = '<strong>Group Chat Title</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml={false}
                />,
            );

            expect(mockHtmlToText).not.toHaveBeenCalled();
        });

        it('should preserve HTML content for group chat titles without parsing', () => {
            const htmlTitle = '<strong>My Group</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml={false}
                />,
            );

            expect(screen.getByText(htmlTitle)).toBeTruthy();
        });

        it('should NOT parse HTML for group chat report details when shouldParseHtml is false', () => {
            const htmlReportName = '<em>Team Discussion</em>';

            render(
                <DisplayNames
                    fullTitle={htmlReportName}
                    numberOfLines={1}
                    tooltipEnabled
                    shouldParseHtml={false}
                    shouldUseFullTitle
                />,
            );

            expect(mockHtmlToText).not.toHaveBeenCalled();
        });

        it('should NOT parse HTML for group chat with special characters', () => {
            const htmlTitle = '<script>alert("test")</script>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml={false}
                />,
            );

            expect(mockHtmlToText).not.toHaveBeenCalled();
            expect(screen.getByText(htmlTitle)).toBeTruthy();
        });
    });

    describe('DisplayNames Component - All other message types', () => {
        it('should parse HTML for non-group chat messages when shouldParseHtml is true', () => {
            const htmlTitle = '<strong>Regular Chat Title</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
            expect(mockHtmlToText).toHaveBeenCalledTimes(1);
        });

        it('should parse HTML by default when shouldParseHtml is not provided', () => {
            const htmlTitle = '<b>Default Behavior</b>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });

        it('should convert HTML to plain text for DM messages', () => {
            const htmlTitle = '<strong>Direct Message</strong>';
            const expectedPlainText = 'Direct Message';

            mockHtmlToText.mockReturnValue(expectedPlainText);

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
            expect(screen.getByText(expectedPlainText)).toBeTruthy();
        });

        it('should parse HTML for policy expense chat messages', () => {
            const htmlTitle = '<span>Expense Report #123</span>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    tooltipEnabled
                    shouldParseHtml
                    shouldUseFullTitle
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });

        it('should parse HTML for task report titles', () => {
            const htmlTitle = '<div>Complete onboarding</div>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });

        it('should parse HTML for thread messages', () => {
            const htmlTitle = '<p>Thread: Discussion topic</p>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    tooltipEnabled
                    shouldParseHtml
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });

        it('should parse HTML for chat room messages', () => {
            const htmlTitle = '<strong>Chat Room Name</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });

        it('should parse HTML for invoice messages', () => {
            const htmlTitle = '<em>Invoice #456</em>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });
    });

    describe('DisplayNames Component - Edge cases', () => {
        it('should handle empty HTML tags correctly for group chats', () => {
            const htmlTitle = '<strong></strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml={false}
                />,
            );

            expect(mockHtmlToText).not.toHaveBeenCalled();
        });

        it('should handle nested HTML tags for non-group chats', () => {
            const htmlTitle = '<div><strong><em>Nested Tags</em></strong></div>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });
    });
});

describe('ReportDetailsPage HTML Parsing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('MenuItemWithTopDescription - reportNameForMenus variable', () => {
        it('should NOT call Parser.htmlToText for group chat when building reportNameForMenus', () => {
            const isGroupChat = true;
            const rawReportName = '<strong>Group Chat</strong>';

            // Simulating the logic from ReportDetailsPage.tsx lines 337-338
            const reportNameForMenus = isGroupChat ? rawReportName : Parser.htmlToText(rawReportName);

            expect(mockHtmlToText).not.toHaveBeenCalled();
            expect(reportNameForMenus).toBe('<strong>Group Chat</strong>');
        });

        it('should call Parser.htmlToText for non-group chat when building reportNameForMenus', () => {
            const isGroupChat = false;
            const rawReportName = '<strong>Regular Chat</strong>';
            const expectedParsedName = 'Regular Chat';
            mockHtmlToText.mockReturnValue(expectedParsedName);

            // Simulating the logic from ReportDetailsPage.tsx lines 337-338
            const reportNameForMenus = isGroupChat ? rawReportName : Parser.htmlToText(rawReportName);

            expect(mockHtmlToText).toHaveBeenCalledWith(rawReportName);
            expect(mockHtmlToText).toHaveBeenCalledTimes(1);
            expect(reportNameForMenus).toBe(expectedParsedName);
        });

        it('should preserve HTML for group chat menu items', () => {
            const isGroupChat = true;
            const rawReportName = '<em>Team Chat</em>';

            const reportNameForMenus = isGroupChat ? rawReportName : Parser.htmlToText(rawReportName);

            expect(reportNameForMenus).toBe('<em>Team Chat</em>');
        });

        it('should convert HTML to text for DM menu items', () => {
            const isGroupChat = false;
            const rawReportName = '<strong>John Doe</strong>';
            mockHtmlToText.mockReturnValue('John Doe');

            const reportNameForMenus = isGroupChat ? rawReportName : Parser.htmlToText(rawReportName);

            expect(reportNameForMenus).toBe('John Doe');
        });

        it('should convert HTML to text for policy expense chat menu items', () => {
            const isGroupChat = false;
            const rawReportName = '<span>Workspace: Engineering</span>';
            mockHtmlToText.mockReturnValue('Workspace: Engineering');

            const reportNameForMenus = isGroupChat ? rawReportName : Parser.htmlToText(rawReportName);

            expect(reportNameForMenus).toBe('Workspace: Engineering');
        });

        it('should convert HTML to text for invoice room menu items', () => {
            const isGroupChat = false;
            const rawReportName = '<div>Invoice Room</div>';
            mockHtmlToText.mockReturnValue('Invoice Room');

            const reportNameForMenus = isGroupChat ? rawReportName : Parser.htmlToText(rawReportName);

            expect(reportNameForMenus).toBe('Invoice Room');
        });
    });
});
