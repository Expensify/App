import {Linking} from 'react-native';
import CONFIG from '@src/CONFIG';
import HybridAppModule from '@expensify/react-native-hybrid-app';
import {generateReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {HybridAppRoute, Route} from '@src/ROUTES';
import ROUTES, {HYBRID_APP_ROUTES} from '@src/ROUTES';

function parseHybridAppUrl(url: HybridAppRoute | Route): Route {
    switch (url) {
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL:
            return ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, generateReportID());
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE:
            return ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, generateReportID());
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE:
        case HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN:
            return ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, generateReportID());
        default:
            return url;
    }
}

// On HybridApp we need to shadow official implementation of Linking.getInitialURL on NewDot side with our custom implementation.
// Main benefit from this approach is that our deeplink-related code can be implemented the same way for both standalone NewDot and HybridApp.
if(CONFIG.IS_HYBRID_APP) {
    Linking.getInitialURL = () => HybridAppModule.getInitialURL().then((url) => parseHybridAppUrl(url as HybridAppRoute | Route));

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalAddEventListener = Linking.addEventListener;
    
    Linking.addEventListener = (type: 'url', handler: (event: {url: string}) => void) => {
        // For hybrid app, we need to transform the URL through parseHybridAppUrl before calling the handler
        const handlerWithParsedHybridAppUrl = (event: {url: string}) => {
            const transformedUrl = parseHybridAppUrl(event.url as HybridAppRoute | Route);
            handler({url: transformedUrl});
        };
        
        // Call the original addEventListener with our transformed handler
        return originalAddEventListener.call(Linking, type, handlerWithParsedHybridAppUrl);
    };
}
