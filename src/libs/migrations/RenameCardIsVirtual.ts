import Onyx from 'react-native-onyx';
import type {NullishDeep, OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type OldCard = Card & {isVirtual?: boolean};

// This migration changes the property name on each card from card list from isVirtual to nameValuePairs.isVirtual
export default function () {
    return new Promise<void>((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.CARD_LIST,
            callback: (cardList: OnyxEntry<Record<string, OldCard>>) => {
                Onyx.disconnect(connection);

                if (!cardList || isEmptyObject(cardList)) {
                    Log.info('[Migrate Onyx] Skipped migration RenameCardIsVirtual because there are no cards linked to the account');
                    return resolve();
                }
                const cardsWithIsVirtualProp = Object.values(cardList).filter((card) => card?.nameValuePairs?.isVirtual !== undefined);
                if (!cardsWithIsVirtualProp.length) {
                    Log.info('[Migrate Onyx] Skipped migration RenameCardIsVirtual because there were no cards with the isVirtual property');
                    return resolve();
                }

                Log.info('[Migrate Onyx] Running  RenameCardIsVirtual migration');
                const dataToSave = cardsWithIsVirtualProp.reduce((acc, card) => {
                    if (!card) {
                        return acc;
                    }

                    acc[card.cardID] = {
                        nameValuePairs: {
                            isVirtual: card?.nameValuePairs?.isVirtual,
                        },
                        isVirtual: undefined,
                    };

                    return acc;
                }, {} as Record<string, NullishDeep<OldCard>>);

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.merge(ONYXKEYS.CARD_LIST, dataToSave).then(() => {
                    Log.info(`[Migrate Onyx] Ran migration RenameCardIsVirtual and renamed ${Object.keys(dataToSave)?.length} properties`);
                    resolve();
                });
            },
        });
    });
}
