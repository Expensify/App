import type {LocaleContextProps} from '@components/LocaleContextProvider';

type GetSectionSubtitleProps = {
    translate: LocaleContextProps['translate'];
    hasDefaultCard: boolean;
    nextPaymentDate?: string;
};

function getSectionSubtitle({translate, hasDefaultCard, nextPaymentDate}: GetSectionSubtitleProps): string {
    if (hasDefaultCard && nextPaymentDate) {
        return translate('subscription.cardSection.cardNextPayment', nextPaymentDate);
    }
    return translate('subscription.cardSection.subtitle');
}

export default getSectionSubtitle;
