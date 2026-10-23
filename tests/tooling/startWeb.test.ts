/** The launcher should hand its resolved settings to each child explicitly, without mutating its own environment. */
import {describe, expect, test} from 'bun:test';

import getWebCommands from '../../scripts/startWeb';

const SETTINGS = {root: '/repo', publicPort: 8102, internalPort: 8103, connectOrigins: ['https://www.expensify.com.dev']};

describe('web launcher commands', () => {
    test('passes the resolved settings and an explicit launcher flag to Rsbuild', () => {
        // Given a session with the Worker and the API proxy enabled
        // When the launcher builds its commands
        const commands = getWebCommands({...SETTINGS, isWorkerEnabled: true, isProxyEnabled: true});
        // Then Rsbuild learns that the launcher started it, and which ports to use, from its own env
        expect(commands.find(({name}) => name === 'rsbuild')?.env).toEqual({
            WEB_LAUNCHER: 'true',
            WEB_PORT: '8102',
            WEB_INTERNAL_PORT: '8103',
            USE_CLOUDFLARE_WORKER: 'true',
            USE_WEB_PROXY: 'true',
        });
        expect(commands.map(({name}) => name)).toEqual(['api', 'rsbuild', 'worker']);
    });

    test('does not change its own environment, which every child would inherit', () => {
        // Given the launcher's environment
        const before = {...process.env};
        // When it builds its commands
        getWebCommands({...SETTINGS, isWorkerEnabled: false, isProxyEnabled: false});
        // Then nothing leaks into it
        expect(process.env).toEqual(before);
    });

    test('starts only the selected services', () => {
        // Given both services opted out
        // When the launcher builds its commands
        const commands = getWebCommands({...SETTINGS, isWorkerEnabled: false, isProxyEnabled: false});
        // Then only Rsbuild runs, and it knows the Worker and proxy are off
        expect(commands.map(({name}) => name)).toEqual(['rsbuild']);
        expect(commands.at(0)?.env).toMatchObject({USE_CLOUDFLARE_WORKER: 'false', USE_WEB_PROXY: 'false'});
    });
});
