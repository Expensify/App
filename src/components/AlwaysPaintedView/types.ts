import type {PropsWithChildren} from 'react';

type AlwaysPaintedViewProps = PropsWithChildren<{
    /** Whether the content is covered, which takes it out of the tab order on web and out of accessibility and touch handling on native. Defaults to false */
    inert?: boolean;
}>;

export default AlwaysPaintedViewProps;
