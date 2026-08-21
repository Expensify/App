import {fireEvent, render, screen} from '@testing-library/react-native';

import InteractiveStepButton from '@components/InteractiveStepButton';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import React from 'react';

const STEP_LABEL = 'Step 1 of 6';
const CURRENT_STEP_DESCRIPTION = 'Confirm currency and country';
const CURRENT_STEP_ACCESSIBILITY_LABEL = `${STEP_LABEL}, ${CURRENT_STEP_DESCRIPTION}`;

function renderButton(props: Partial<React.ComponentProps<typeof InteractiveStepButton>> = {}) {
    return render(
        <OnyxListItemProvider>
            <InteractiveStepButton
                stepNumber={1}
                stepLabel={STEP_LABEL}
                isCurrentStep={false}
                isLockedStep={false}
                isCompletedStep={false}
                {...props}
            />
        </OnyxListItemProvider>,
    );
}

describe('InteractiveStepButton', () => {
    describe('display-only steps', () => {
        it('announces the step label and marks non-current steps as disabled', () => {
            renderButton();

            const step = screen.getByLabelText(STEP_LABEL);
            expect(step).toBeTruthy();
            expect(step.props.accessibilityState).toMatchObject({selected: false, disabled: true});
            // JAWS fallback: label is also present as hidden DOM text
            expect(screen.getByText(STEP_LABEL)).toBeTruthy();
        });

        it('appends the current step description with a comma and marks the step selected', () => {
            renderButton({
                isCurrentStep: true,
                currentStepDescription: CURRENT_STEP_DESCRIPTION,
            });

            const step = screen.getByLabelText(CURRENT_STEP_ACCESSIBILITY_LABEL);
            expect(step.props.accessibilityState).toMatchObject({selected: true, disabled: true});
            expect(screen.getByText(CURRENT_STEP_ACCESSIBILITY_LABEL)).toBeTruthy();
        });
    });

    describe('interactive steps', () => {
        it('keeps the JAWS text fallback alongside accessibilityLabel', () => {
            const onPress = jest.fn();
            renderButton({
                isCurrentStep: true,
                currentStepDescription: CURRENT_STEP_DESCRIPTION,
                onPress,
            });

            expect(screen.getByLabelText(CURRENT_STEP_ACCESSIBILITY_LABEL)).toBeTruthy();
            expect(screen.getByText(CURRENT_STEP_ACCESSIBILITY_LABEL)).toBeTruthy();
        });

        it('calls onPress when pressed and is not marked disabled when unlocked', () => {
            const onPress = jest.fn();
            renderButton({onPress});

            const step = screen.getByLabelText(STEP_LABEL);
            expect(step.props.accessibilityState).toMatchObject({selected: false});
            expect(step).not.toBeDisabled();

            fireEvent.press(step);
            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('marks locked steps as disabled', () => {
            const onPress = jest.fn();
            renderButton({
                isLockedStep: true,
                onPress,
            });

            const step = screen.getByLabelText(STEP_LABEL);
            expect(step).toBeDisabled();
            expect(step.props.accessibilityState).toMatchObject({disabled: true});
        });
    });
});
