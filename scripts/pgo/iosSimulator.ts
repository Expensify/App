import {isRecord} from '@libs/ObjectUtils';

// cspell:ignore bootstatus simctl notifyutil UDID
import {cpSync, existsSync, readFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';

import {capture, fail, run} from '../lib/scriptUtils';

/** Create a disposable simulator from the selected Xcode's installed iOS runtime. */
function bootIOSVerificationSimulator(): string {
    const input: unknown = JSON.parse(capture('xcrun', ['simctl', 'list', 'runtimes', '--json']));
    const runtime = selectIOSVerificationRuntime(input);
    const identifier = capture('xcrun', ['simctl', 'create', 'PGO verification', 'com.apple.CoreSimulator.SimDeviceType.iPhone-16', runtime]).trim();
    if (!/^[a-f0-9-]{36}$/i.test(identifier)) {
        fail('Xcode did not return a simulator identifier.');
    }
    run('xcrun', ['simctl', 'boot', identifier]);
    run('xcrun', ['simctl', 'bootstatus', identifier, '-b']);
    return identifier;
}

function selectIOSVerificationRuntime(input: unknown): string {
    if (!isRecord(input) || !Array.isArray(input.runtimes)) {
        fail('Xcode returned an invalid simulator runtime list.');
    }
    const runtimes = input.runtimes.flatMap((item: unknown) => {
        if (
            !isRecord(item) ||
            item.isAvailable !== true ||
            typeof item.identifier !== 'string' ||
            typeof item.version !== 'string' ||
            !item.identifier.startsWith('com.apple.CoreSimulator.SimRuntime.iOS-')
        ) {
            return [];
        }
        return [{identifier: item.identifier, version: item.version}];
    });
    const runtime = runtimes.sort((a, b) => b.version.localeCompare(a.version, undefined, {numeric: true})).at(0);
    if (!runtime) {
        fail('The selected Xcode has no available iOS simulator runtime.');
    }
    return runtime.identifier;
}

function createIOSSimulatorDevice(identifier: string, appID: () => string) {
    const containerPath = () => capture('xcrun', ['simctl', 'get_app_container', identifier, appID(), 'data']).trim();
    return {
        install: (path: string) => run('xcrun', ['simctl', 'install', identifier, path]),
        launch: () => run('xcrun', ['simctl', 'launch', '--terminate-running-process', identifier, appID()]),
        notify: (name: string) => run('xcrun', ['simctl', 'spawn', identifier, 'notifyutil', '-p', name]),
        removeFile: (path: string) => rmSync(join(containerPath(), path), {force: true}),
        readFile: (path: string): string | undefined => {
            const source = join(containerPath(), path);
            return existsSync(source) ? readFileSync(source, 'utf8').trim() : undefined;
        },
        copyDirectory: (path: string, destination: string) => cpSync(join(containerPath(), path), destination, {recursive: true}),
    };
}

export {bootIOSVerificationSimulator, createIOSSimulatorDevice, selectIOSVerificationRuntime};
