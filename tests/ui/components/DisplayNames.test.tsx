import {render, screen} from '@testing-library/react-native';

import DisplayNames from '@components/DisplayNames';
import type DisplayNamesProps from '@components/DisplayNames/types';

import Parser from '@libs/Parser';

import type {ComponentType} from 'react';

import React from 'react';

jest.mock('@libs/Parser', () => ({
    __esModule: true,
    default: {
        htmlToText: jest.fn((html: string) => html.replaceAll(/<[^>]*>/g, '')),
    },
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        translate: jest.fn((key: string) => key),
    })),
}));

// eslint-disable-next-line @typescript-eslint/unbound-method
const mockHtmlToText = jest.mocked(Parser.htmlToText);

describe('DisplayNames HTML Parsing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('DisplayNames Component - shouldParseFullTitle prop', () => {
        it('should parse HTML when shouldParseFullTitle is true', () => {
            const htmlTitle = '<strong>Test Title</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseFullTitle
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle, {accountIDToName: undefined});
            expect(mockHtmlToText).toHaveBeenCalledTimes(1);
        });

        it('should NOT parse HTML when shouldParseFullTitle is false', () => {
            const htmlTitle = '<strong>Test Title</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseFullTitle={false}
                />,
            );
            expect(mockHtmlToText).not.toHaveBeenCalled();
            expect(screen.getByText(htmlTitle)).toBeTruthy();
        });

        it('HTML is parsed by default when shouldParseFullTitle is not provided', () => {
            const htmlTitle = '<em>Test Title </em>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle, {accountIDToName: undefined});
        });
    });

    describe('DisplayNames Component (web) - accountIDToName prop', () => {
        // Jest resolves the native implementation by default, so the web one is loaded explicitly
        const {default: WebDisplayNames} = jest.requireActual<{default: ComponentType<DisplayNamesProps>}>('@components/DisplayNames/index.tsx');

        it('passes the accountIDToName map to the HTML parser so mentions show readable names', () => {
            // Given a title that mentions a user and a map with that user's name
            const mentionedAccountID = 42;
            const htmlTitle = `<mention-user accountID="${mentionedAccountID}"></mention-user>`;
            const accountIDToName = {[mentionedAccountID]: 'mentioned@test.com'};

            // When the web component renders the title
            render(
                <WebDisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    accountIDToName={accountIDToName}
                />,
            );

            // Then the parser receives the map to resolve the mention
            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle, {accountIDToName});
        });

        it('shows the title as is when shouldParseFullTitle is false', () => {
            // Given a plain title that must not go through the HTML parser
            const plainTitle = '<strong>Test Title</strong>';

            // When the web component renders it without parsing
            render(
                <WebDisplayNames
                    fullTitle={plainTitle}
                    numberOfLines={1}
                    shouldParseFullTitle={false}
                />,
            );

            // Then the parser is skipped and the raw title is shown
            expect(mockHtmlToText).not.toHaveBeenCalled();
            expect(screen.getByText(plainTitle)).toBeTruthy();
        });
    });
});
