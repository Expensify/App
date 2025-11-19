import {render, screen} from '@testing-library/react-native';
import React from 'react';
import DisplayNames from '@components/DisplayNames';

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        translate: jest.fn((key: string): string => {
            if (key === 'common.hidden') {
                return 'hidden';
            }
            return key;
        }),
    }),
}));

jest.mock('@libs/Parser', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        htmlToText: jest.fn((html: string) => {
            // Simulate stripTag behavior: remove anything that looks like HTML tags
            return html.replaceAll(/(<([^>]+)>)/gi, '');
        }),
    },
}));

jest.mock('@libs/StringUtils', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        lineBreaksToSpaces: jest.fn((text: string) => text),
    },
}));

describe('DisplayNames - Thread Header HTML Parsing', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should parse HTML when shouldParseHtml is true (for thread headers)', () => {
        const htmlTitle = 'approved via <a href="https://example.com">workspace rules</a>';
        render(
            <DisplayNames
                fullTitle={htmlTitle}
                numberOfLines={1}
                tooltipEnabled={false}
                shouldParseHtml
            />,
        );

        // With shouldParseHtml = true, HTML tags should be stripped
        expect(screen.getByText('approved via workspace rules')).toBeTruthy();
        expect(screen.queryByText(htmlTitle)).toBeNull();
    });

    it('should NOT parse HTML when shouldParseHtml is false (for group chats)', () => {
        const titleWithBrackets = 'Test <Company>';
        render(
            <DisplayNames
                fullTitle={titleWithBrackets}
                numberOfLines={1}
                tooltipEnabled={false}
                shouldParseHtml={false}
            />,
        );

        // With shouldParseHtml = false, angle brackets should be preserved
        expect(screen.getByText('Test <Company>')).toBeTruthy();
    });

    it('should parse mention-user tags when shouldParseHtml is true', () => {
        const htmlWithMention = 'changed the approver to <mention-user accountID="12345">@John Doe</mention-user>';
        render(
            <DisplayNames
                fullTitle={htmlWithMention}
                numberOfLines={1}
                tooltipEnabled={false}
                shouldParseHtml
            />,
        );

        // mention-user tags should be stripped
        expect(screen.getByText('changed the approver to @John Doe')).toBeTruthy();
        expect(screen.queryByText(htmlWithMention)).toBeNull();
    });

    it('should parse integration sync failed message HTML', () => {
        const integrationHTML = 'there was a problem syncing. Please fix the issue in <a href="https://example.com/settings">workspace settings</a>.';
        render(
            <DisplayNames
                fullTitle={integrationHTML}
                numberOfLines={1}
                tooltipEnabled={false}
                shouldParseHtml
            />,
        );

        // HTML link should be stripped
        expect(screen.getByText('there was a problem syncing. Please fix the issue in workspace settings.')).toBeTruthy();
    });

    it('should parse multiple automatic workflow HTML messages', () => {
        const testCases = [
            {
                html: 'approved via <a href="https://example.com">workspace rules</a>',
                expected: 'approved via workspace rules',
            },
            {
                html: 'paid $100.00 with bank account 1234 via <a href="https://example.com">workspace rules</a>',
                expected: 'paid $100.00 with bank account 1234 via workspace rules',
            },
            {
                html: 'paid with Expensify via <a href="https://example.com">workspace rules</a>',
                expected: 'paid with Expensify via workspace rules',
            },
        ];

        testCases.forEach(({html, expected}) => {
            const {unmount} = render(
                <DisplayNames
                    fullTitle={html}
                    numberOfLines={1}
                    tooltipEnabled={false}
                    shouldParseHtml
                />,
            );

            expect(screen.getByText(expected)).toBeTruthy();
            unmount();
        });
    });

    it('should default to shouldParseHtml=false to preserve group chat names', () => {
        const groupChatName = 'Engineering <Team>';
        render(
            <DisplayNames
                fullTitle={groupChatName}
                numberOfLines={1}
                tooltipEnabled={false}
                // Not passing shouldParseHtml, should default to false
            />,
        );

        // Angle brackets should be preserved with default behavior
        expect(screen.getByText('Engineering <Team>')).toBeTruthy();
    });

    it('should show "hidden" when title becomes empty after HTML parsing', () => {
        const onlyTagsTitle = '<div></div>';
        render(
            <DisplayNames
                fullTitle={onlyTagsTitle}
                numberOfLines={1}
                tooltipEnabled={false}
                shouldParseHtml
            />,
        );

        // After parsing, only tags remain which get stripped to empty string
        expect(screen.getByText('hidden')).toBeTruthy();
    });
});
