import type {PropsWithChildren} from 'react';

type DisplayContentsViewProps = PropsWithChildren<{
    /** Whether the content is covered, which takes it out of the tab order on web and out of accessibility and touch handling on native. Leaving it out renders no node for it */
    inert?: boolean;
}>;

export default DisplayContentsViewProps;
