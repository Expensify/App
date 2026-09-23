import {isRecord} from '@libs/ObjectUtils';

import {spawnSync} from 'node:child_process';

import type {PlatformName} from '../lib/nativeAppBenchmark';

type JourneyNode = {
    label: string;
    value: string;
    identifier: string;
    type: string;
    enabled: boolean;
    width: number;
    height: number;
};

type JourneyDevice = ReturnType<typeof createJourneyDevice>;

/** Execute deterministic device commands. Authentication is always handled by the user. */
function createJourneyDevice(options: {platform: PlatformName; device: string; appID: string; session: string}) {
    const targetArguments = ['--platform', options.platform, options.platform === 'android' ? '--serial' : '--udid', options.device, '--session', options.session, '--json'];

    function command(...args: string[]): unknown {
        const result = spawnSync('agent-device', [...args, ...targetArguments], {encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024});
        if (result.error) {
            throw new Error(`Device command ${args.at(0)} failed: ${result.error.message}`);
        }
        let response: unknown;
        try {
            response = JSON.parse(result.stdout);
        } catch {
            throw new Error(`Device command ${args.at(0)} did not return JSON: ${result.stderr.trim()}`);
        }
        if (!isRecord(response) || response.success !== true || result.status !== 0) {
            const error = isRecord(response) && isRecord(response.error) ? response.error : undefined;
            throw new Error(`Device command ${args.at(0)} failed: ${typeof error?.message === 'string' ? error.message : result.stderr.trim()}`);
        }
        return response.data;
    }

    function snapshot(): JourneyNode[] {
        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                const nodes = parseJourneySnapshot(command('snapshot', '-i', '--force-full'), options.appID);
                assertSignedIn(nodes);
                return nodes;
            } catch (error) {
                // The Android accessibility service can briefly return only system UI while a heavy list mounts.
                // Retry this read alone; repeating a tap or send could perform the action twice.
                if (attempt === 2 || !(error instanceof Error) || !error.message.includes('insufficient foreground app content')) {
                    throw error;
                }
                command('wait', '500');
            }
        }
        throw new Error('Unable to read the app accessibility tree.');
    }

    function wait(selector: string): void {
        try {
            command('wait', selector, '30000');
        } catch (error) {
            // Give sign-in a specific, actionable failure instead of continuing through an expired session.
            snapshot();
            throw error;
        }
    }

    function press(selector: string): void {
        wait(selector);
        command('press', selector, '--settle');
    }

    function labels(): string[] {
        return snapshot().map((node) => normalizeLabel(node.label));
    }

    function hasLabel(label: string): boolean {
        return labels().includes(normalizeLabel(label));
    }

    return {
        command,
        snapshot,
        wait,
        press,
        hasLabel,
        pressLabel: (label: string) => press(labelSelector(label)),
        waitLabel: (label: string) => wait(labelSelector(label)),
        fill: (identifier: string, text: string) => {
            wait(idSelector(identifier));
            command('fill', idSelector(identifier), text, '--settle');
        },
        back: () => command('back', '--settle'),
        open: (relaunch: boolean) => command('open', options.appID, ...(relaunch ? ['--relaunch'] : []), ...(options.platform === 'android' ? ['--test-ime'] : [])),
    };
}

function parseJourneySnapshot(data: unknown, appID: string): JourneyNode[] {
    if (!isRecord(data) || !Array.isArray(data.nodes)) {
        throw new Error('The device did not return an accessibility tree.');
    }
    if (data.appBundleId !== appID) {
        throw new Error('The automation is no longer attached to the expected app.');
    }
    return data.nodes
        .filter(isRecord)
        .filter((node) => !node.bundleId || node.bundleId === appID)
        .map((node) => ({
            label: typeof node.label === 'string' ? node.label : '',
            value: typeof node.value === 'string' ? node.value : '',
            identifier: typeof node.identifier === 'string' ? node.identifier : '',
            type: typeof node.type === 'string' ? node.type : '',
            enabled: node.enabled !== false,
            width: isRecord(node.rect) && typeof node.rect.width === 'number' ? node.rect.width : 0,
            height: isRecord(node.rect) && typeof node.rect.height === 'number' ? node.rect.height : 0,
        }));
}

function assertSignedIn(nodes: JourneyNode[]): void {
    const signInLabels = new Set(['Sign in', 'Email or phone number', 'Enter your email or phone number', 'Enter your magic code']);
    if (nodes.some((node) => ['username', 'validateCode'].includes(node.identifier) || signInLabels.has(normalizeLabel(node.label)))) {
        throw new Error('SIGN_IN_REQUIRED: Ask Chris to sign into the approved heavy account, then restart the journey. Automated sign-in is disabled.');
    }
}

function normalizeLabel(label: string): string {
    return label
        .replaceAll(/[\u2066-\u2069]/g, '')
        .replaceAll(/\s+/g, ' ')
        .trim();
}

function labelSelector(label: string): string {
    return `label=${JSON.stringify(label)}`;
}

function idSelector(identifier: string): string {
    return `id=${JSON.stringify(identifier)}`;
}

export {assertSignedIn, createJourneyDevice, idSelector, labelSelector, normalizeLabel, parseJourneySnapshot};
export type {JourneyDevice, JourneyNode};
