import type {PropsWithChildren} from 'react';

type DisplayContentsViewProps = PropsWithChildren<{
    /** Whether the content is covered, which takes it out of the tab order. Web only, because a native node has no equivalent attribute */
    inert?: boolean;
}>;

export default DisplayContentsViewProps;
