import {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {TDefaultRenderer, TDefaultRendererProps, TText} from 'react-native-render-html';

type InlineCodeBlockProps<TComponent extends TText> = {
    TDefaultRenderer: TDefaultRenderer<TComponent>;
    textStyle: StyleProp<TextStyle>;
    defaultRendererProps: TDefaultRendererProps<TComponent>;
    boxModelStyle: StyleProp<ViewStyle & TextStyle>;
};

export default InlineCodeBlockProps;
