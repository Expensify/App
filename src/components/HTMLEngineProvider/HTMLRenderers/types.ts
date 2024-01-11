import type {StyleProp, TextStyle} from 'react-native';
import type {TDefaultRenderer, TNode, TText} from 'react-native-render-html';

type HtmlRendererProps = {
    /**
     * Html node to render
     */
    tnode: TNode & {data: string};

    /**
     * Renderer function for the node
     */
    TDefaultRenderer?: TDefaultRenderer<TText>;

    /**
     * Key of the element
     */
    key?: string;

    /**
     * Style for the node
     */
    style?: StyleProp<TextStyle>;
};
export default HtmlRendererProps;
