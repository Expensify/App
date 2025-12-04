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

    describe('DisplayNames Component - shouldParseHtml prop', () => {
        it('should parse HTML when shouldParseHtml is true', () => {
            const htmlTitle = '<strong>Test Title</strong>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                    shouldParseHtml={true}
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
            expect(mockHtmlToText).toHaveBeenCalledTimes(1);
        });

        it('should NOT parse HTML when shouldParseHtml is false', () => {
            const htmlTitle = '<strong>Test Title</strong>';

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

        it('HTML is parsed by default when shouldParseHtml is not provided', () => {
            const htmlTitle = '<em>Test Title </em>';

            render(
                <DisplayNames
                    fullTitle={htmlTitle}
                    numberOfLines={1}
                />,
            );

            expect(mockHtmlToText).toHaveBeenCalledWith(htmlTitle);
        });
    });
});
