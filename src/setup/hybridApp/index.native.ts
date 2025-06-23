import {Linking} from 'react-native';
import Navigation from '@navigation/Navigation';
import {openReportFromDeepLink} from '@userActions/Report';
import CONFIG from '@src/CONFIG';
import type {Route} from '@src/ROUTES';

if (CONFIG.IS_HYBRID_APP) {
    Linking.addEventListener('url', (state) => {
        const parsedUrl = Navigation.parseHybridAppUrl(state.url as Route);
        openReportFromDeepLink(parsedUrl);
    });
}
