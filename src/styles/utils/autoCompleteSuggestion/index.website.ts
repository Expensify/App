import * as Browser from '@libs/Browser';
import type ShouldPreventScrollOnAutoCompleteSuggestion from './types';

const isMobileSafari = Browser.isMobileSafari();

const shouldPreventScrollOnAutoCompleteSuggestion: ShouldPreventScrollOnAutoCompleteSuggestion = () => !isMobileSafari;

export default shouldPreventScrollOnAutoCompleteSuggestion;
