import {render} from '@testing-library/react-native';
import React from 'react';
import DisplayNames from '@components/DisplayNames';

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: jest.fn((key) => {
            if (key === 'common.hidden') {
                return 'hidden';
            }
            return key;
        }),
    }),
}));

jest.mock('@libs/Parser', () => ({
    __esModule: true,
    default: {
        htmlToText: jest.fn((html: string) => {
            // Simulate stripTag behavior: remove anything that looks like HTML tags
            return html.replace(/(<([^>]+)>)/gi, '');
        }),
    },
}));

jest.mock('@libs/StringUtils', () => ({
    __esModule: true,
    default: {
        lineBreaksToSpaces: jest.fn((text: string) => text),
    },
}));

describe('DisplayNames - shouldParseHtml prop', () => {
    const testTitle = '< >';
    const defaultProps = {
        fullTitle: testTitle,
        numberOfLines: 1,
        tooltipEnabled: false,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should NOT parse HTML by default (shouldParseHtml defaults to false)', () => {
        const {getByText} = render(<DisplayNames {...defaultProps} />);

        // With shouldParseHtml = false (default), "< >" should be preserved
        expect(getByText('< >')).toBeTruthy();
    });

    it('should parse HTML when shouldParseHtml is explicitly set to true', () => {
        const htmlTitle = '<b>Bold Text</b>';
        const {getByText, queryByText} = render(
            <DisplayNames
                {...defaultProps}
                fullTitle={htmlTitle}
                shouldParseHtml
            />,
        );

        // With shouldParseHtml = true, HTML tags should be stripped
        expect(getByText('Bold Text')).toBeTruthy();
        expect(queryByText('<b>Bold Text</b>')).toBeNull();
    });

    it('should preserve special characters when shouldParseHtml is false', () => {
        const specialCharsTitle = '< > & " \' test';
        const {getByText} = render(
            <DisplayNames
                {...defaultProps}
                fullTitle={specialCharsTitle}
            />,
        );

        // Special characters should be preserved when not parsing HTML
        expect(getByText(specialCharsTitle)).toBeTruthy();
    });

    it('should show "hidden" when title is empty and HTML parsing is disabled', () => {
        const {getByText} = render(
            <DisplayNames
                {...defaultProps}
                fullTitle=""
            />,
        );

        expect(getByText('hidden')).toBeTruthy();
    });

    it('should show "hidden" when title becomes empty after HTML parsing', () => {
        const onlyTagsTitle = '<div></div>';
        const {getByText} = render(
            <DisplayNames
                {...defaultProps}
                fullTitle={onlyTagsTitle}
                shouldParseHtml
            />,
        );

        // After parsing, only tags remain which get stripped to empty string
        expect(getByText('hidden')).toBeTruthy();
    });
});
