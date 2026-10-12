import type {GrowlPosition} from '@libs/Growl';

import CONST from '@src/CONST';

function shouldUseExplicitBottomPosition(position?: GrowlPosition) {
    return position === CONST.GROWL.POSITION.BOTTOM_RIGHT;
}

export default shouldUseExplicitBottomPosition;
