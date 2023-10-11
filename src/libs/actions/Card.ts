import * as API from '../API';
import CONST from '../../CONST';
import {TCardDetails} from '../../types/onyx/Card';
import * as Localize from '../Localize';

function revealVirtualCardDetails(cardID: string): Promise<TCardDetails> {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects('RevealVirtualCardDetails', {cardID})
            .then((response) => {
                if (response.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                    reject(response.message || Localize.translateLocal('cardPage.cardDetailsLoadingFailure'));
                    return;
                }
                resolve(response);
            })
            .catch((err) => {
                reject(err.message);
            });
    });
}

export default {revealVirtualCardDetails};
