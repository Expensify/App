import type {CollapsibleHeaderOnKeyboardGroupMemberProps} from '@components/CollapsibleHeaderOnKeyboard/types';

/**
 * Web no-op — renders children as-is, matching `CollapsibleHeaderOnKeyboard`. The collapsing behaviour is only needed
 * on native where the software keyboard reduces the visible viewport height.
 */
function CollapsibleHeaderOnKeyboardGroupMember({children}: CollapsibleHeaderOnKeyboardGroupMemberProps) {
    return children;
}

export default CollapsibleHeaderOnKeyboardGroupMember;
