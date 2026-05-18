import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {TDefaultRenderer, TDefaultRendererProps, TPhrasing, TText} from 'react-native-render-html';

type TTextOrTPhrasing = TText | TPhrasing;

type InlineCodeBlockProps<TComponent extends TTextOrTPhrasing> = {
    TDefaultRenderer: TDefaultRenderer<TComponent>;
    textStyle: StyleProp<TextStyle>;
    defaultRendererProps: TDefaultRendererProps<TComponent>;
    boxModelStyle: StyleProp<ViewStyle & TextStyle>;
};

export default InlineCodeBlockProps;
export type {TTextOrTPhrasing};
