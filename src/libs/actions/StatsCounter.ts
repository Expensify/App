import * as API from '@libs/API';
import type GraphiteParams from '@libs/API/parameters/GraphiteParams';
import {READ_COMMANDS} from '@libs/API/types';
import * as Environment from '@libs/Environment/Environment';
import getEnvironment from '@libs/Environment/getEnvironment';
import getPlatform from '@libs/getPlatform';
import pkg from '../../../package.json';

const StatsCounter = (eventName: string, value = 1) => {
    getEnvironment().then((envName) => {
        const platform = getPlatform();
        const version = pkg.version.replaceAll('.', '-');

        // This normalizes the name of the web platform so it will be more consistent in Grafana
        const grafanaEventName = `${platform === 'web' ? 'webApp' : platform}.${envName}.new.expensify.${eventName}.${version}`;

        console.debug(`Counter:${grafanaEventName}`, value);

        if (Environment.isDevelopment()) {
            // Don't record stats on dev as this will mess up the accuracy of data in release builds of the app
            return;
        }

        const parameters: GraphiteParams = {
            type: 'counter',
            statName: grafanaEventName,
            value,
        };

        API.read(READ_COMMANDS.GRAPHITE, parameters, {});
    });
};

export default StatsCounter;
