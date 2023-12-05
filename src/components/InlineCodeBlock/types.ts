import {TextStyle, ViewStyle} from 'react-native';
import {TDefaultRenderer, TDefaultRendererProps, TText} from 'react-native-render-html';

type InlineCodeBlockProps<TComponent extends TText> = {
    TDefaultRenderer: TDefaultRenderer<TComponent>;
    textStyle: TextStyle;
    defaultRendererProps: TDefaultRendererProps<TComponent>;
    boxModelStyle: ViewStyle & TextStyle;
};

export default InlineCodeBlockProps;
