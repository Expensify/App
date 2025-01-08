import type {NativeSyntheticEvent, TextInputKeyPressEventData} from 'react-native';
import CONST from '@src/CONST';

function handleKeyPress(onSubmit: () => void) {
    return (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        const isEnterKey = event.nativeEvent.key.toLowerCase() === CONST.PLATFORM_SPECIFIC_KEYS.ENTER.DEFAULT;

        if (!isEnterKey) {
            return;
        }

        onSubmit();
    };
}

export default handleKeyPress;
