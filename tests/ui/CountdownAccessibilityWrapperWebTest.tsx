import {render, screen} from '@testing-library/react-native';

import Text from '@components/Text';
import type CountdownAccessibilityWrapperModule from '@components/ValidateCodeCountdown/CountdownAccessibilityWrapper';

import React from 'react';

// Jest resolves the native file by default, so the web version is loaded by its path
const WebCountdownAccessibilityWrapper = jest.requireActual<{default: typeof CountdownAccessibilityWrapperModule}>(
    '@components/ValidateCodeCountdown/CountdownAccessibilityWrapper/index.tsx',
).default;

describe('CountdownAccessibilityWrapper on web', () => {
    it('leaves the countdown exactly as it was, since web cannot name a plain element', () => {
        // Given the countdown text on web
        // When it is wrapped
        render(
            <WebCountdownAccessibilityWrapper accessibilityLabel="Request a new code in 26 seconds">
                <Text>00:26</Text>
            </WebCountdownAccessibilityWrapper>,
        );

        // Then no wrapper or label is added, so the page and what web screen readers read stay unchanged
        expect(screen.queryByLabelText('Request a new code in 26 seconds')).not.toBeOnTheScreen();
        expect(screen.getByText('00:26')).toBeOnTheScreen();
        expect(screen.toJSON()).toEqual(expect.objectContaining({type: 'Text'}));
    });
});
