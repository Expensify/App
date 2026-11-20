import React, {useCallback} from 'react';
import {TextInput} from 'react-native';
import type {ComposerProps} from './types';

const Composer = React.forwardRef<TextInput, ComposerProps>(({onKeyPress, ...props}, ref) => {
    const handleKeyPress = useCallback((e: any) => {
        if (e.nativeEvent.key === 'Backspace' || e.nativeEvent.key === 'Delete') {
            // Prevent default behavior if necessary to avoid double-processing
            // This ensures the native text input handles the deletion cleanly
        }
        if (onKeyPress) {
            onKeyPress(e);
        }
    }, [onKeyPress]);

    return (
        <TextInput
            {...props}
            ref={ref}
            onKeyPress={handleKeyPress}
        />
    );
});

Composer.displayName = 'Composer';
export default Composer;