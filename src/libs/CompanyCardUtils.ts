import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

/**
 * @param feedProvider
 * @returns Title based on the feedProvider
 */
function getTranslationKeyForFeedDetails(feedProvider: ValueOf<typeof CONST.COMPANY_CARDS.CARD_TYPE> | undefined): TranslationPaths | '' {
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

/**
 * @param feedProvider
 * @returns Title based on the feedProvider
 */
function getTranslationKeyForFeedInstructions(feedProvider: ValueOf<typeof CONST.COMPANY_CARDS.CARD_TYPE> | undefined): TranslationPaths | '' {
    switch (feedProvider) {
        case CONST.COMPANY_CARDS.CARD_TYPE.AMEX:
            return 'workspace.companyCards.addNewCard.enableFeed.amex';
        case CONST.COMPANY_CARDS.CARD_TYPE.MASTERCARD:
            return 'workspace.companyCards.addNewCard.enableFeed.mastercard';
        case CONST.COMPANY_CARDS.CARD_TYPE.VISA:
            return 'workspace.companyCards.addNewCard.enableFeed.visa';
        default:
            return '';
    }
}

export {getTranslationKeyForFeedDetails, getTranslationKeyForFeedInstructions};
