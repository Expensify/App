import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import verifyExpoPatches from '../../scripts/verifyExpoPatches';

const PATCH_NAME = 'patches/example+1.0.0.patch';

function writeFile(rootDir: string, relativePath: string, content: string): void {
    const filePath = path.join(rootDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
    fs.writeFileSync(filePath, content);
}

function writeJSON(rootDir: string, relativePath: string, value: unknown): void {
    writeFile(rootDir, relativePath, JSON.stringify(value));
}

function writePatch(rootDir: string, files: string[], patchName = PATCH_NAME): void {
    const content = files.map((file) => `diff --git a/node_modules/${file} b/node_modules/${file}\n--- a/node_modules/${file}\n+++ b/node_modules/${file}\n`).join('');
    writeFile(rootDir, patchName, content);
}

describe('verifyExpoPatches', () => {
    let rootDir: string;
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let processExitSpy: jest.SpyInstance;

    beforeEach(() => {
        rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-expo-patches-'));
        fs.mkdirSync(path.join(rootDir, 'patches'));
        writeJSON(rootDir, 'package.json', {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`process.exit(${code})`);
        });
    });

    afterEach(() => {
        fs.rmSync(rootDir, {recursive: true, force: true});
        jest.restoreAllMocks();
    });

    it('passes when there are no patches', () => {
        verifyExpoPatches(rootDir);

        expect(processExitSpy).not.toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('no patches target a precompiled Expo module'));
    });

    it('reports an Android source patch when the module publishes a precompiled AAR', () => {
        writePatch(rootDir, ['expo-location/android/src/main/java/expo/modules/location/LocationModule.kt']);
        writeJSON(rootDir, 'node_modules/expo-location/expo-module.config.json', {android: {publication: {group: 'host.exp.exponent'}}});

        expect(() => verifyExpoPatches(rootDir)).toThrow('process.exit(1)');

        expect(processExitSpy).toHaveBeenCalledWith(1);
        const output = consoleErrorSpy.mock.calls.flat().join('\n');
        expect(output).toContain(PATCH_NAME);
        expect(output).toContain('expo-location — android ships a precompiled binary');
        expect(output).toContain('expo.autolinking.android.buildFromSource');
    });

    it('allows an Android source patch when the package builds from source', () => {
        writePatch(rootDir, ['expo-location/android/src/main/java/expo/modules/location/LocationModule.kt']);
        writeJSON(rootDir, 'node_modules/expo-location/expo-module.config.json', {android: {publication: {}}});
        writeJSON(rootDir, 'package.json', {expo: {autolinking: {android: {buildFromSource: ['expo-.*']}}}});

        verifyExpoPatches(rootDir);

        expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('skips excluded packages and explicitly ignored patches', () => {
        writePatch(rootDir, ['@example/expo-camera/android/src/main/java/CameraModule.kt']);
        writePatch(rootDir, ['expo-location/android/src/main/java/expo/modules/location/LocationModule.kt'], 'patches/excluded+1.0.0.patch');
        writeJSON(rootDir, 'node_modules/expo-location/expo-module.config.json', {android: {publication: {}}});
        writeJSON(rootDir, 'node_modules/@example/expo-camera/expo-module.config.json', {android: {publication: {}}});
        writeJSON(rootDir, 'package.json', {expo: {autolinking: {exclude: ['expo-location']}}});
        writeFile(rootDir, 'patches/.expo-patch-ignore', '# Verified locally\nexample+1.0.0.patch # exact patch\n');

        verifyExpoPatches(rootDir);

        expect(processExitSpy).not.toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith('  Ignored patches: example+1.0.0.patch');
    });

    it('applies platform-specific excludes only to their platform', () => {
        writePatch(rootDir, ['expo-video/android/src/main/java/expo/modules/video/VideoModule.kt', 'expo-video/ios/VideoPlayer.swift']);
        writeJSON(rootDir, 'node_modules/expo-video/expo-module.config.json', {android: {publication: {}}});
        writeJSON(rootDir, 'node_modules/expo-video/spm.config.json', {
            products: [{name: 'ExpoVideo', targets: [{path: 'ios', pattern: '*.swift'}]}],
        });
        writeFile(rootDir, 'node_modules/expo-video/prebuilds/output/apple/xcframeworks/ExpoVideo.tar.gz', '');
        writeJSON(rootDir, 'package.json', {expo: {autolinking: {android: {exclude: ['expo-video']}}}});

        expect(() => verifyExpoPatches(rootDir)).toThrow('process.exit(1)');

        const output = consoleErrorSpy.mock.calls.flat().join('\n');
        expect(output).not.toContain('android ships a precompiled binary');
        expect(output).toContain('ios ships a precompiled binary');
    });

    it.each(['ios', 'apple'])('honors an iOS platform-specific exclude in the %s block', (platform) => {
        writePatch(rootDir, ['expo-video/ios/VideoPlayer.swift']);
        writeJSON(rootDir, 'node_modules/expo-video/spm.config.json', {
            products: [{name: 'ExpoVideo', targets: [{path: 'ios', pattern: '*.swift'}]}],
        });
        writeFile(rootDir, 'node_modules/expo-video/prebuilds/output/apple/xcframeworks/ExpoVideo.tar.gz', '');
        writeJSON(rootDir, 'package.json', {expo: {autolinking: {[platform]: {exclude: ['expo-video']}}}});

        verifyExpoPatches(rootDir);

        expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('does not treat package names as patch ignore entries', () => {
        writePatch(rootDir, ['expo-location/android/src/main/java/expo/modules/location/LocationModule.kt']);
        writeJSON(rootDir, 'node_modules/expo-location/expo-module.config.json', {android: {publication: {}}});
        writeFile(rootDir, 'patches/.expo-patch-ignore', 'expo-location\n');

        expect(() => verifyExpoPatches(rootDir)).toThrow('process.exit(1)');

        expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('only reports patched files claimed by a prebuilt iOS product', () => {
        writePatch(rootDir, ['expo-video/ios/VideoPlayer.swift', 'expo-video/ios/Adapter/WorkletsAdapter.swift']);
        writeJSON(rootDir, 'node_modules/expo-video/expo-module.config.json', {apple: {}});
        writeJSON(rootDir, 'node_modules/expo-video/spm.config.json', {
            products: [
                {name: 'ExpoVideo', targets: [{path: 'ios', pattern: '*.swift'}]},
                {name: 'ExpoVideoWorkletsAdapter', sourceOnly: true, targets: [{path: 'ios/Adapter', pattern: '*.swift'}]},
            ],
        });
        writeFile(rootDir, 'node_modules/expo-video/prebuilds/output/apple/xcframeworks/ExpoVideo.tar.gz', '');

        expect(() => verifyExpoPatches(rootDir)).toThrow('process.exit(1)');

        expect(processExitSpy).toHaveBeenCalledWith(1);
        const output = consoleErrorSpy.mock.calls.flat().join('\n');
        expect(output).toContain('ios ships a precompiled binary for product(s) ExpoVideo');
        expect(output).not.toContain('product(s) ExpoVideoWorkletsAdapter');
        expect(output).toContain('expo.autolinking.ios.buildFromSource');
    });

    it('reports shared source paths claimed by external iOS prebuilt products', () => {
        writePatch(rootDir, ['@shopify/react-native-skia/cpp/jsi/RuntimeAwareCache.h', 'react-native-reanimated/Common/cpp/reanimated/LayoutAnimations/LayoutAnimationsProxy_Legacy.cpp']);
        writeJSON(rootDir, 'node_modules/expo-modules-autolinking/external-configs/ios/@shopify/react-native-skia/spm.config.json', {
            products: [{name: 'RNSkia', podName: 'react-native-skia', targets: [{path: 'cpp', headerPattern: '**/*.h'}]}],
        });
        writeJSON(rootDir, 'node_modules/expo-modules-autolinking/external-configs/ios/react-native-reanimated/spm.config.json', {
            products: [{name: 'RNReanimated', podName: 'RNReanimated', targets: [{path: 'Common/cpp/reanimated', pattern: '**/*.cpp'}]}],
        });

        expect(() => verifyExpoPatches(rootDir)).toThrow('process.exit(1)');

        const output = consoleErrorSpy.mock.calls.flat().join('\n');
        expect(output).toContain('@shopify/react-native-skia — ios ships a precompiled binary for product(s) RNSkia');
        expect(output).toContain('react-native-reanimated — ios ships a precompiled binary for product(s) RNReanimated');
    });

    it('honors an iOS buildFromSource entry that matches the product pod name', () => {
        writePatch(rootDir, ['react-native-maps/ios/AirMaps/AIRMap.m']);
        writeJSON(rootDir, 'node_modules/expo-modules-autolinking/external-configs/ios/react-native-maps/spm.config.json', {
            products: [{podName: 'ReactNativeMaps', targets: [{path: 'ios', pattern: '**/*.m'}]}],
        });
        writeJSON(rootDir, 'package.json', {expo: {autolinking: {apple: {buildFromSource: ['ReactNativeMaps']}}}});

        verifyExpoPatches(rootDir);

        expect(processExitSpy).not.toHaveBeenCalled();
    });
});
