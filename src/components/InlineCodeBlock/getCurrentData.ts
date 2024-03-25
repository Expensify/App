import type {TDefaultRendererProps} from 'react-native-render-html';
import type {TTextOrTPhrasing} from './types';

// Create a temporary solution to display when there are emojis in the inline code block
// We can remove this after https://github.com/Expensify/App/issues/14676 is fixed
export default function getCurrentData(defaultRendererProps: TDefaultRendererProps<TTextOrTPhrasing>): string {
    if ('data' in defaultRendererProps.tnode) {
        return defaultRendererProps.tnode.data;
    }
    return defaultRendererProps.tnode.children.map((child) => ('data' in child ? child.data : '')).join('');
}
