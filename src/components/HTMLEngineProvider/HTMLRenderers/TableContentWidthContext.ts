import {createContext} from 'react';

/**
 * The width available to the HTML content, measured at the comment level (above react-native-render-html's per-block
 * wrappers). `TableRenderer` uses it to fill the message width, because the block wrappers shrink-wrap to their content
 * and a width measured inside them collapses to the table's own content width instead of the available space.
 */
const TableContentWidthContext = createContext<number>(0);

export default TableContentWidthContext;
