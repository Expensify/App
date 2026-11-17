/** Keep native map tiles in the app's language, since Mapbox localizes their labels on the server. */
import Log from '@libs/Log';

import type {Locale} from '@src/CONST/LOCALES';

import {setLanguage} from '@rnmapbox/maps';
import {useEffect} from 'react';

import utils from './utils';

function useMapboxLanguage(preferredLocale: Locale | undefined) {
    const language = utils.getMapboxLanguage(preferredLocale) ?? null;

    useEffect(() => {
        setLanguage(language).catch((error: unknown) => {
            Log.warn('Failed to set Mapbox language', {language, error});
        });
    }, [language]);
}

export default useMapboxLanguage;
