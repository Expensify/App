import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ActionButtonsProps = {
    containerStyle: React.ComponentProps<typeof View>['style'];
    resetSentryLabel?: string;
    applySentryLabel?: string;
    onReset?: () => void;
    onApply: () => void;
};

function ActionButtons({containerStyle, resetSentryLabel, applySentryLabel, onReset, onApply}: ActionButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={containerStyle}>
            {!!onReset && (
                <Button
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    style={[styles.flex1]}
                    onPress={onReset}
                    sentryLabel={resetSentryLabel}
                >
                    <Button.Text>{translate('common.reset')}</Button.Text>
                </Button>
            )}
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.MEDIUM}
                style={[styles.flex1]}
                onPress={onApply}
                sentryLabel={applySentryLabel}
            >
                <Button.Text>{translate('common.apply')}</Button.Text>
            </Button>
        </View>
    );
}

export default ActionButtons;
