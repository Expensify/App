import type CountdownAccessibilityWrapperProps from './types';

/** Web keeps the visible text as is, since a plain element can't carry an accessible name there. */
function CountdownAccessibilityWrapper({children}: CountdownAccessibilityWrapperProps) {
    return children;
}

export default CountdownAccessibilityWrapper;
