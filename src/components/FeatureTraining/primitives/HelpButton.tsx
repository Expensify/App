import Button from '@components/ButtonComposed';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

type HelpButtonProps = {
    /** Text label shown on the help button */
    children: string;

    /** Called when the help button is pressed */
    onPress?: () => void;

    /** Sentry label for the help button */
    sentryLabel?: string;
};

function HelpButton({children, onPress, sentryLabel}: HelpButtonProps) {
    const styles = useThemeStyles();

    return (
        <Button
            size={CONST.BUTTON_SIZE.LARGE}
            style={[styles.mb3]}
            onPress={onPress}
            sentryLabel={sentryLabel}
        >
            <Button.Text>{children}</Button.Text>
        </Button>
    );
}

HelpButton.displayName = 'FeatureTraining.HelpButton';

export default HelpButton;
