import type {ReactNode} from 'react';

import type SupportalSwitcherButtonProps from './types';

// The supportal quick switcher is desktop web only, matching the OldDot launcher which is revealed on hover.
function SupportalSwitcherButton(props: SupportalSwitcherButtonProps): ReactNode;
function SupportalSwitcherButton() {
    return null;
}

SupportalSwitcherButton.displayName = 'SupportalSwitcherButton';

export default SupportalSwitcherButton;
