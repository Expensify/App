/**
 * Bottom-right toast for an inline table edit that was rejected and reverted.
 * Spend and workspace tables share this so a rejected value always surfaces in the same place.
 */
import CONST from '@src/CONST';

import Growl from './Growl';

function showInlineEditError(message: string | undefined) {
    if (!message) {
        return;
    }

    Growl.error({bodyText: message, position: CONST.GROWL.POSITION.BOTTOM_RIGHT});
}

export default showInlineEditError;
