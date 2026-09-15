import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

// Chart labels translate their conjunction, and a headless render has no provider to load a locale, so the phrase would draw as its own key.
await IntlStore.load(CONST.LOCALES.DEFAULT);
