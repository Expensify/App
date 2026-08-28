import type {NumericInputBaseProps, NumericInputRef as NumericInputControllerRef} from '@components/NumericInputController';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type NumericInputRef = NumericInputControllerRef;

type NumericSymbolInputProps = NumericInputBaseProps &
    Pick<BaseTextInputProps, 'onPress' | 'prefixCharacter' | 'prefixStyle' | 'shouldAllowFocusInLandscapeMode'> & {
        /** Whether the symbol can be pressed. Prefer a dedicated currency control for new compositions. */
        isSymbolPressable?: boolean;

        /** Called when the inline symbol is pressed. Prefer a dedicated currency control for new compositions. */
        onSymbolButtonPress?: () => void;

        /** Whether the input grows with its content. */
        autoGrow?: boolean;

        /** Whether to use dynamic font sizing based on the displayed value length. */
        shouldUseDynamicFontSize?: boolean;

        /** Hide the focused appearance of the symbol input. */
        hideFocusedState?: boolean;

        /** Style applied to the input container. */
        containerStyle?: StyleProp<ViewStyle>;

        /** Style applied to the symbol. */
        symbolTextStyle?: StyleProp<TextStyle>;

        /** Style applied to the negative symbol. */
        negativeSymbolStyle?: StyleProp<TextStyle>;
    };

type NumericErrorProps = {
    /** Style applied to the message container, appended to the primitive's defaults. */
    style?: StyleProp<ViewStyle>;
};

export type {NumericErrorProps, NumericInputRef, NumericSymbolInputProps};
