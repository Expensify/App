import type {ReactNode} from 'react';

type CountdownAccessibilityWrapperProps = {
    /** Full sentence screen readers read instead of the visible text, such as "Request a new code in 26 seconds" */
    accessibilityLabel: string;

    children: ReactNode;
};

export default CountdownAccessibilityWrapperProps;
