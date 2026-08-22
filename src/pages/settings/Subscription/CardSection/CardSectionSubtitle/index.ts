import type {LocaleContextProps} from '@components/LocaleContextProvider';

type GetSectionSubtitleProps = {
    translate: LocaleContextProps['translate'];
    hasDefaultCard: boolean;
    nextPaymentDate?: string;
};

function getSectionSubtitle({translate, hasDefaultCard, nextPaymentDate}: GetSectionSubtitleProps): string | undefined {
    if (hasDefaultCard && nextPaymentDate) {
        return translate('subscription.cardSection.cardNextPayment', nextPaymentDate);
    }
    // The web empty state renders its own title and description, so the section subtitle is omitted to avoid duplicating the copy.
    if (!hasDefaultCard) {
        return undefined;
    }
    return translate('subscription.cardSection.subtitle');
}

export default getSectionSubtitle;
