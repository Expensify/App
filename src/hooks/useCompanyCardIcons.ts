import type {CompanyCardBankIcons, CompanyCardFeedIcons} from '@libs/CardUtils';
import {COMPANY_CARD_BANK_ICON_NAMES, COMPANY_CARD_FEED_ICON_NAMES} from '@libs/CardUtils';
import {useMemoizedLazyIllustrations} from './useLazyAsset';

function useCompanyCardFeedIcons(): CompanyCardFeedIcons {
    return useMemoizedLazyIllustrations(COMPANY_CARD_FEED_ICON_NAMES);
}

function useCompanyCardBankIcons(): CompanyCardBankIcons {
    return useMemoizedLazyIllustrations(COMPANY_CARD_BANK_ICON_NAMES);
}

export {useCompanyCardFeedIcons, useCompanyCardBankIcons};
