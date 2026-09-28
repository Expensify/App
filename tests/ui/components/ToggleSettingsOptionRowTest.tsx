import {render, screen} from '@testing-library/react-native';

import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import type ReactNative from 'react-native';

import React from 'react';

jest.mock('@components/RenderHTML', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({html}: {html: string}) => <Text testID="parsed-subtitle">{html}</Text>;
});

const SUBTITLE_STYLE = {paddingTop: 4};

function renderRow(shouldParseSubtitle: boolean) {
    return render(
        <ToggleSettingOptionRow
            title="Auto-pay approved reports"
            subtitle="Auto-pay is only available on the Control plan."
            subtitleStyle={SUBTITLE_STYLE}
            switchAccessibilityLabel="Auto-pay approved reports"
            shouldPlaceSubtitleBelowSwitch
            shouldParseSubtitle={shouldParseSubtitle}
            isActive={false}
            onToggle={jest.fn()}
        />,
    );
}

describe('ToggleSettingOptionRow', () => {
    it('applies subtitleStyle to a plain-text subtitle', () => {
        // Given a row with a plain-text subtitle and a custom subtitle style
        renderRow(false);

        // When the subtitle renders
        const subtitle = screen.getByText('Auto-pay is only available on the Control plan.');

        // Then it gets the custom style
        expect(subtitle).toHaveStyle(SUBTITLE_STYLE);
    });

    it('applies subtitleStyle to a parsed HTML subtitle so the row is as tall as with a plain-text subtitle', () => {
        // Given a row with a parsed HTML subtitle (e.g. one with an upgrade link) and a custom subtitle style
        renderRow(true);

        // When the subtitle renders
        const subtitleText = screen.getByTestId('parsed-subtitle');
        let subtitleWrapper = subtitleText.parent;
        while (subtitleWrapper && typeof subtitleWrapper.type !== 'string') {
            subtitleWrapper = subtitleWrapper.parent;
        }

        // Then its wrapper gets the same custom style as the plain-text subtitle
        expect(subtitleWrapper).toHaveStyle(SUBTITLE_STYLE);
    });
});
