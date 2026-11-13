import type {Locale} from '@src/CONST/LOCALES';

/** Web maps set their language through Mapbox GL JS in MapViewImpl.web.tsx. */
const useMapboxLanguage: (preferredLocale: Locale | undefined) => void = () => {};

export default useMapboxLanguage;
