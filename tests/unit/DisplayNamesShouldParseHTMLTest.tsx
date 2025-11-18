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

describe('DisplayNames - shouldParseHtml prop', () => {
    const testTitle = '< >';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should NOT parse HTML by default (shouldParseHtml defaults to false)', () => {
        render(
            <DisplayNames
                fullTitle={testTitle}
                numberOfLines={1}
                tooltipEnabled={false}
            />,
        );

        // With shouldParseHtml = false (default), "< >" should be preserved
        expect(screen.getByText('< >')).toBeTruthy();
    });

    it('should parse HTML when shouldParseHtml is explicitly set to true', () => {
        const htmlTitle = '<b>Bold Text</b>';
        render(
            <DisplayNames
                fullTitle={htmlTitle}
                numberOfLines={1}
                tooltipEnabled={false}
                shouldParseHtml
            />,
        );

        // With shouldParseHtml = true, HTML tags should be stripped
        expect(screen.getByText('Bold Text')).toBeTruthy();
        expect(screen.queryByText('<b>Bold Text</b>')).toBeNull();
    });

    it('should preserve special characters when shouldParseHtml is false', () => {
        const specialCharsTitle = '< > & " \' test';
        render(
            <DisplayNames
                fullTitle={specialCharsTitle}
                numberOfLines={1}
                tooltipEnabled={false}
            />,
        );

        // Special characters should be preserved when not parsing HTML
        expect(screen.getByText(specialCharsTitle)).toBeTruthy();
    });

    it('should show "hidden" when title is empty and HTML parsing is disabled', () => {
        render(
            <DisplayNames
                fullTitle=""
                numberOfLines={1}
                tooltipEnabled={false}
            />,
        );

        expect(screen.getByText('hidden')).toBeTruthy();
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
