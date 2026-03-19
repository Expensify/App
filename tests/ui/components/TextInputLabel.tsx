import {render, screen} from '@testing-library/react-native';
import {useSharedValue} from 'react-native-reanimated';
import TextInputLabel from '@components/TextInput/TextInputLabel';
import type TextInputLabelProps from '@components/TextInput/TextInputLabel/types';

describe('TextInputLabel', () => {
    const renderLabel = (props: TextInputLabelProps) => {
        return render(
            <TextInputLabel
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />,
        );
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
