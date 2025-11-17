import {COMPANY_CARD_BANK_ICON_NAMES, COMPANY_CARD_FEED_ICON_NAMES} from '@libs/CardUtils';
import {useMemoizedLazyIllustrations} from './useLazyAsset';

function useCompanyCardFeedIcons() {
    return useMemoizedLazyIllustrations(COMPANY_CARD_FEED_ICON_NAMES);
}

function useCompanyCardBankIcons() {
    return useMemoizedLazyIllustrations(COMPANY_CARD_BANK_ICON_NAMES);
}

export {useCompanyCardFeedIcons, useCompanyCardBankIcons};
