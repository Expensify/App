import type {TDefaultRenderer, TDefaultRendererProps, TPhrasing, TText} from '@native-html/render';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type TTextOrTPhrasing = TText | TPhrasing;

type InlineCodeBlockProps<TComponent extends TTextOrTPhrasing> = {
    TDefaultRenderer: TDefaultRenderer<TComponent>;
    textStyle: StyleProp<TextStyle>;
    defaultRendererProps: TDefaultRendererProps<TComponent>;
    boxModelStyle: StyleProp<ViewStyle & TextStyle>;
};

export default InlineCodeBlockProps;
export type {TTextOrTPhrasing};
