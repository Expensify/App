import type {GrowlPosition} from '@libs/Growl';

import CONST from '@src/CONST';

// This file is used to determine if we should use an explicit bottom position for the growl notification.
// This is necessary for certain layouts where the growl notification may be obscured by other UI elements, such as a bottom tab bar or a floating action button.
// By using an explicit bottom position, we can ensure that the growl notification is always visible to the user.
function shouldUseExplicitBottomPosition(position?: GrowlPosition) {
    return position === CONST.GROWL.POSITION.BOTTOM_RIGHT;
}

export default shouldUseExplicitBottomPosition;
