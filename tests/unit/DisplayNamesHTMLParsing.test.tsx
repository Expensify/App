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

// eslint-disable-next-line @typescript-eslint/unbound-method
const mockHtmlToText = Parser.htmlToText as jest.Mock;

describe('DisplayNames HTML Parsing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isGroupChat prop triggers correct shouldParseFullTitle behavior', () => {
        it('should set shouldParseFullTitle to false when isGroupChat is true', () => {
            const isGroupChat = true;
            const htmlTitle = '<strong>Group Chat</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseFullTitle={!isGroupChat}
                />,
            );

            expect(mockHtmlToText).not.toHaveBeenCalled();
        });

        it('should set shouldParseFullTitle to true when isGroupChat is false', () => {
            const isGroupChat = false;
            const htmlTitle = '<strong>Regular Chat</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseFullTitle={!isGroupChat}
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });
    });

    describe('Group chat titles and report names', () => {
        it('should NOT parse HTML for group chats when shouldParseFullTitle is false', () => {
            const htmlTitle = '<strong>Group Chat Title</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseFullTitle={false}
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
                    shouldParseFullTitle={false}
                />,
            );

            expect(screen.getByText(htmlTitle)).toBeTruthy();
        });

        it('should NOT parse HTML for group chat report details when shouldParseFullTitle is false', () => {
            const htmlReportName = '<em>Team Discussion</em>';

            render(
                <DisplayNames
                    fullTitle={htmlReportName}
                    numberOfLines={1}
                    tooltipEnabled
                    shouldParseFullTitle={false}
                    shouldUseFullTitle
                />,
            );

            expect(mockHtmlToText).not.toHaveBeenCalled();
        });
    });

    describe('All other message types', () => {
        it('should parse HTML for non-group chat messages when shouldParseFullTitle is true', () => {
            const htmlTitle = '<strong>Regular Chat Title</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseFullTitle
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
            expect(mockHtmlToText).toHaveBeenCalledTimes(1);
        });

        it('should parse HTML by default when shouldParseFullTitle is not provided', () => {
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
                    shouldParseFullTitle
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
                    shouldParseFullTitle
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
                    shouldParseFullTitle
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
                    shouldParseFullTitle
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });
    });
});
