import {render, screen} from '@testing-library/react-native';

import TextInputLabel from '@components/TextInput/TextInputLabel';
import LabelScaleSettleListener from '@components/TextInput/TextInputLabel/LabelScaleSettleListener';
import type TextInputLabelProps from '@components/TextInput/TextInputLabel/types';

import {useSharedValue} from 'react-native-reanimated';

describe('TextInputLabel', () => {
    const renderLabel = (props: TextInputLabelProps) => {
        return render(<TextInputLabel {...props} />);
    };

    const labelTranslateY = useSharedValue(0);
    const labelScale = useSharedValue(1);

    it('should render label with ellipsizeMode="tail" and numberOfLines=1 when isMultiline is false', () => {
        const longLabel = 'This is a very long label that should be shortened';
        // Render the component with isMultiline=false
        renderLabel({
            label: longLabel,
            isMultiline: false,
            labelTranslateY,
            labelScale,
        });
        // Find the Animated.Text component by its text content
        const labelElement = screen.getByText(longLabel, {includeHiddenElements: true});
        // Verify the component renders the correct text
        expect(labelElement).toBeTruthy();
        // Verify the props for shortening behavior
        expect(labelElement.props).toHaveProperty('numberOfLines', 1);
        expect(labelElement.props).toHaveProperty('ellipsizeMode', 'tail');
    });

    it('should not apply numberOfLines or ellipsizeMode when isMultiline is true', () => {
        const label = 'Multiline label';
        // Render the component with isMultiline=true
        renderLabel({
            label,
            isMultiline: true,
            labelTranslateY,
            labelScale,
        });
        // Find the Animated.Text component by its text content
        const labelElement = screen.getByText(label, {includeHiddenElements: true});
        // Verify the component renders the correct text
        expect(labelElement).toBeTruthy();
        // Verify that numberOfLines and ellipsizeMode are undefined
        expect(labelElement.props).not.toHaveProperty('numberOfLines');
        expect(labelElement.props).not.toHaveProperty('ellipsizeMode');
    });
});

describe('TextInputLabel (web)', () => {
    // Jest resolves the native label by default, but truncation is only measured on web
    const WebTextInputLabel = jest.requireActual<{default: typeof TextInputLabel}>('../../../src/components/TextInput/TextInputLabel/index.tsx').default;

    const labelTranslateY = useSharedValue(0);
    const labelScale = useSharedValue(1);

    it('should only measure truncation when onTruncationChange is passed', () => {
        // Given a label without a truncation callback, which is how most text inputs render it
        render(
            <WebTextInputLabel
                label="Label without callback"
                labelTranslateY={labelTranslateY}
                labelScale={labelScale}
            />,
        );

        // Then it neither measures itself on layout nor listens to the label scale animation
        expect(screen.getByText('Label without callback', {includeHiddenElements: true}).props.onLayout).toBeUndefined();
        expect(screen.UNSAFE_queryByType(LabelScaleSettleListener)).toBeNull();

        // Given a label that reports truncation, like a report field name
        render(
            <WebTextInputLabel
                label="Label with callback"
                labelTranslateY={labelTranslateY}
                labelScale={labelScale}
                onTruncationChange={jest.fn()}
            />,
        );

        // Then it measures itself on layout and again once the label scale animation settles
        expect(screen.getByText('Label with callback', {includeHiddenElements: true}).props.onLayout).toEqual(expect.any(Function));
        expect(screen.UNSAFE_queryByType(LabelScaleSettleListener)).not.toBeNull();
    });
});
