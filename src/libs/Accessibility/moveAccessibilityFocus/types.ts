import type {RefObject} from 'react';

// Accept any RefObject - the implementation handles runtime checks for ref?.current?.focus()
// This allows both native/web component refs and form input refs (InputComponentBaseProps)
// Using RefObject<any> is more permissive but still better than 'as any' in calling code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MoveAccessibilityFocus = (ref?: RefObject<any>) => void;

export default MoveAccessibilityFocus;
