import type {ReactNode} from 'react';

type HTMLTableScrollProps = {
    /** Width of the visible scroll viewport, i.e. the available message width. */
    viewportWidth: number;

    /** Full width of the table content; at least the viewport width. */
    contentWidth: number;

    /** The rendered table rows. */
    children: ReactNode;
};

export default HTMLTableScrollProps;
