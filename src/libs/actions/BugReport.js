import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

const getSystemDetails = (navigation) => {
    const navigationState = navigation.getState();

    const appstate = {
        version: DeviceInfo.getVersion(),
        platform: Platform.OS,
        OS: Platform.OS,
        currentScreen: navigationState.key,
        recentRouteHistory: _.map(navigationState.routes, route => route.name),
        recentLogs: [],
    };

    console.log('state' + JSON.stringify(appstate));

    return appstate;
};

function send(stuff) {
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.BUG_REPORT,
            value: {
                loading: true,
            },
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.BUG_REPORT,
            value: {
                loading: false,
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.BUG_REPORT,
            value: {
                loading: false,
            },
        },
    ];

    API.write('SubmitBugReport', {
        ...stuff,
    }, {optimisticData, successData, failureData});
}

export {
    send,
    getSystemDetails,
};
