import type {LocaleContextProps} from '@components/LocaleContextProvider';

/** Accessible name of a navigation tab: its label, followed by a review notice when the tab shows a status indicator. */
function getTabAccessibilityLabel(label: string, isReviewRequired: boolean, translate: LocaleContextProps['translate']) {
    return isReviewRequired ? `${label}. ${translate('common.yourReviewIsRequired')}` : label;
}

export default getTabAccessibilityLabel;
