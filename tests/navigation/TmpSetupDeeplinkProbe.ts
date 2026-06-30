import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import type {Route} from '@src/ROUTES';

function summarize(node: unknown, depth = 0): string {
    if (!node || typeof node !== 'object') {
        return '';
    }
    const anyNode = node as {name?: string; state?: {routes?: unknown[]; index?: number}; routes?: unknown[]; index?: number};
    const routes = anyNode.routes ?? anyNode.state?.routes ?? [];
    const index = anyNode.index ?? anyNode.state?.index;
    const pad = '  '.repeat(depth);
    let out = '';
    routes.forEach((r, i) => {
        const rr = r as {name?: string};
        const marker = i === index ? ' <-- focused' : '';
        out += `${pad}${rr.name ?? '?'}${marker}\n`;
        out += summarize(r, depth + 1);
    });
    return out;
}

describe('TMP setup deeplink probe', () => {
    it('prints adapted state for xero setup deeplink', () => {
        const state = getAdaptedStateFromPath('workspaces/ABC123/accounting/xero/setup' as Route, undefined, false);
        // eslint-disable-next-line no-console
        console.log('\n===XERO SETUP DEEPLINK STATE===\n' + summarize(state));
        expect(state).toBeTruthy();
    });

    it('prints adapted state for xero import deeplink (known-good comparison)', () => {
        const state = getAdaptedStateFromPath('workspaces/ABC123/accounting/xero/import' as Route, undefined, false);
        // eslint-disable-next-line no-console
        console.log('\n===XERO IMPORT DEEPLINK STATE===\n' + summarize(state));
        expect(state).toBeTruthy();
    });
});
