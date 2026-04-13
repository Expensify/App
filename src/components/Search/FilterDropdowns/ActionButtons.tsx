import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type ActionButtonsProps = {
    containerStyle: React.ComponentProps<typeof View>['style'];
    resetSentryLabel?: string;
    applySentryLabel?: string;
    onReset: () => void;
    onApply: () => void;
};

function ActionButtons({containerStyle, resetSentryLabel, applySentryLabel, onReset, onApply}: ActionButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={containerStyle}>
            <Button
                medium
                style={[styles.flex1]}
                text={translate('common.reset')}
                onPress={onReset}
                sentryLabel={resetSentryLabel}
            />
            <Button
                success
                medium
                style={[styles.flex1]}
                text={translate('common.apply')}
                onPress={onApply}
                sentryLabel={applySentryLabel}
            />
        </View>
    );
}

export type {ActionButtonsProps};
export default ActionButtons;
