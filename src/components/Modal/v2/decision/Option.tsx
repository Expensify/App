import React from 'react';
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';

type OptionVariant = 'primary' | 'success' | 'danger' | 'neutral';

type OptionPosition = 'sole' | 'primary' | 'secondary';

type OptionProps = {
    text: string;
    onPress: () => void;
    variant: OptionVariant;
    position: OptionPosition;
};

function Option({text, onPress, variant, position}: OptionProps) {
    const styles = useThemeStyles();
    const isEnterCarrier = position === 'sole' || position === 'primary';
    const suppressSelection = position === 'sole' || position === 'secondary';
    return (
        <Button
            success={variant === 'success' || variant === 'primary'}
            danger={variant === 'danger'}
            style={suppressSelection ? [styles.mt3, styles.noSelect] : styles.mt3}
            onPress={onPress}
            pressOnEnter={isEnterCarrier}
            text={text}
            large
        />
    );
}

export default Option;
export type {OptionProps, OptionPosition, OptionVariant};
