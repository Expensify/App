import {Platform} from 'react-native';
import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import packageJSON from '../../../package.json';

const getSystemDetails = (navigation) => {
    const navigationState = navigation.getState();

    const appstate = {
        version: packageJSON.version,
        platform: Platform.OS,
        OS: Platform.OS,
        currentScreen: navigationState ? navigationState.key : undefined,
        recentRouteHistory: navigationState ? _.map(navigationState.routes, route => route.name) : undefined,
        recentLogs: [],
    };

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
