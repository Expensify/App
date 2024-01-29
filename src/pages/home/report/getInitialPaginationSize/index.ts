import * as Browser from '@libs/Browser';
import CONST from '@src/CONST';

const isMobileSafari = Browser.isMobileSafari();

function getInitialPaginationSize(numToRender: number): number {
    if (isMobileSafari) {
        return Math.round(Math.min(numToRender / 3, CONST.MOBILE_PAGINATION_SIZE));
    }
    // WEB: Calculate and position it correctly for each frame, enabling the rendering of up to 50 items.
    return CONST.WEB_PAGINATION_SIZE;
}
export default getInitialPaginationSize;
