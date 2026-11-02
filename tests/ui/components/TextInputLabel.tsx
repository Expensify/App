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

    it('should measure truncation again when the label text changes in the same box', () => {
        const shortLabel = 'Short label';
        const longLabel = 'A much longer label that no longer fits in the box';
        const onTruncationChange = jest.fn();
        const renderWithLabel = (label: string) => (
            <WebTextInputLabel
                label={label}
                labelTranslateY={labelTranslateY}
                labelScale={labelScale}
                onTruncationChange={onTruncationChange}
            />
        );
        const {rerender} = render(renderWithLabel(shortLabel));

        // Given the label measures like a web element in a 200px box, where each character takes 10px, so only labels of up to
        // 20 characters fit. Jest renders a mocked Text class, which is what the label's ref holds.
        let currentLabel = shortLabel;
        Object.defineProperties(screen.getByText(shortLabel, {includeHiddenElements: true}).parent?.instance, {
            scrollWidth: {get: () => currentLabel.length * 10},
            offsetWidth: {value: 200},
            scrollHeight: {value: 20},
            offsetHeight: {value: 20},
        });
        onTruncationChange.mockClear();

        // When the text changes to one that no longer fits, like after a language switch or a report field rename, without a new layout
        currentLabel = longLabel;
        rerender(renderWithLabel(longLabel));

        // Then the label reports that it is cut off, so the tooltip shows
        expect(onTruncationChange).toHaveBeenLastCalledWith(true);

        // When the text changes back to one that fits
        currentLabel = shortLabel;
        rerender(renderWithLabel(shortLabel));

        // Then the label reports that it is no longer cut off, so the tooltip hides
        expect(onTruncationChange).toHaveBeenLastCalledWith(false);
    });
});
