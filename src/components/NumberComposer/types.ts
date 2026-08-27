import type {NumberInputBaseProps, NumberInputRef} from '@components/NumberInput';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

/** NumberComposer exposes the same imperative editing contract as NumberForm. */
type NumberComposerRef = NumberInputRef;

type NumberComposerSymbolInputProps = NumberInputBaseProps &
    Pick<BaseTextInputProps, 'onPress' | 'prefixCharacter' | 'prefixStyle' | 'shouldAllowFocusInLandscapeMode'> & {
        /** Whether the symbol can be pressed. Prefer the Composer currency control for new compositions. */
        isSymbolPressable?: boolean;

        /** Called when the inline symbol is pressed. Prefer the Composer currency control for new compositions. */
        onSymbolButtonPress?: () => void;

        /** Whether the input grows with its content. */
        autoGrow?: boolean;

        /** Hide the focused appearance of the symbol input. */
        hideFocusedState?: boolean;

        /** Style applied to the input container. */
        containerStyle?: StyleProp<ViewStyle>;

        /** Style applied to the symbol. */
        symbolTextStyle?: StyleProp<TextStyle>;

        /** Style applied to the negative symbol. */
        negativeSymbolStyle?: StyleProp<TextStyle>;
    };

type NumberComposerErrorProps = {
    /** Style applied to the message container, appended to the primitive's defaults. */
    style?: StyleProp<ViewStyle>;
};

export type {NumberComposerErrorProps, NumberComposerRef, NumberComposerSymbolInputProps};
