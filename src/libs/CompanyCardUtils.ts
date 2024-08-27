import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

/**
 * @param feedProvider
 * @returns Title based on the feedProvider
 */
function getTranslationKeyForNewFeedDetails(feedProvider: ValueOf<typeof CONST.COMPANY_CARDS.CARD_TYPE> | undefined): TranslationPaths | '' {
    switch (feedProvider) {
        case CONST.COMPANY_CARDS.CARD_TYPE.AMEX:
            return 'workspace.companyCards.addNewCard.feedDetails.amex.title';
        case CONST.COMPANY_CARDS.CARD_TYPE.MASTERCARD:
            return 'workspace.companyCards.addNewCard.feedDetails.mastercard.title';
        case CONST.COMPANY_CARDS.CARD_TYPE.VISA:
            return 'workspace.companyCards.addNewCard.feedDetails.visa.title';
        default:
            return '';
    }
}

// eslint-disable-next-line import/prefer-default-export
export {getTranslationKeyForNewFeedDetails};
