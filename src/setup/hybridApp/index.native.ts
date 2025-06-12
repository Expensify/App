import {Linking} from 'react-native';
import Navigation from '@navigation/Navigation';
import CONFIG from '@src/CONFIG';
import type {Route} from '@src/ROUTES';
import {openReportFromDeepLink} from '@userActions/Report';

if (CONFIG.IS_HYBRID_APP) {
    Linking.addEventListener('url', (state) => {
        const parsedUrl = Navigation.parseHybridAppUrl(state.url as Route);
        openReportFromDeepLink(parsedUrl);
    });
}
