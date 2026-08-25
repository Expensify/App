import type {NumberFormInputBaseProps, NumberFormRef} from '@components/NumberForm/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

/** NumberComposer exposes the same imperative editing contract as NumberForm. */
type NumberComposerRef = NumberFormRef;

type NumberComposerSymbolInputProps = NumberFormInputBaseProps &
    Pick<BaseTextInputProps, 'onPress' | 'shouldAllowFocusInLandscapeMode'> & {
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

export type {NumberComposerRef, NumberComposerSymbolInputProps};
