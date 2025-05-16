import fs from 'fs';
import {vol} from 'memfs';
import path from 'path';
import {generateAndroidVersionCode, updateAndroid} from '../../scripts/bumpVersion';

const BUILD_GRADLE_PATH = path.resolve(__dirname, '../../android/app/build.gradle');
const ANDROID_MANIFEST_PATH = path.resolve(__dirname, '../../Mobile-Expensify/Android/AndroidManifest.xml');

const mockBuildGradle = `
    android {
        defaultConfig {
            versionCode 1000001479
            versionName "1.0.1-47"
        }
    }
`;
const mockAndroidManifest = `
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
      package="org.me.mobiexpensifyg"
      android:versionCode="1000001479" android:versionName="1.0.1-47"
      xmlns:tools="http://schemas.android.com/tools">
</manifest>`;

jest.mock('fs');
jest.mock('fs/promises');

beforeEach(() => {
    // Clear the mocked filesystem
    vol.reset();

    // Set up mocked filesystem
    vol.fromJSON({
        [BUILD_GRADLE_PATH]: mockBuildGradle,
        [ANDROID_MANIFEST_PATH]: mockAndroidManifest,
    });
});

describe('BumpVersion', () => {
    describe('generateAndroidVersionCode', () => {
        test.each([
            ['1.0.1-0', '1001000100'],
            ['1.0.1-44', '1001000144'],
            ['10.11.12-35', '1010111235'],
            ['0.0.1-1', '1000000101'],
            ['10.99.66-88', '1010996688'],
        ])('generateAndroidVersionCode(%s) – %s', (input, expected) => {
            expect(generateAndroidVersionCode(input, '10')).toBe(expected);
        });
    });

    describe('updateAndroidVersion', () => {
        test.each([
            [
                '1.0.1-47',
                `
    android {
        defaultConfig {
            versionCode 1001000147
            versionName "1.0.1-47"
        }
    }
`,
                `
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
      package="org.me.mobiexpensifyg"
      android:versionCode="0501000147" android:versionName="1.0.1-47"
      xmlns:tools="http://schemas.android.com/tools">
</manifest>`,
            ],
            [
                '1.0.1-0',
                `
    android {
        defaultConfig {
            versionCode 1001000100
            versionName "1.0.1-0"
        }
    }
`,
                `
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
      package="org.me.mobiexpensifyg"
      android:versionCode="0501000100" android:versionName="1.0.1-0"
      xmlns:tools="http://schemas.android.com/tools">
</manifest>`,
            ],
            [
                '10.99.66-88',
                `
    android {
        defaultConfig {
            versionCode 1010996688
            versionName "10.99.66-88"
        }
    }
`,
                `
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
      package="org.me.mobiexpensifyg"
      android:versionCode="0510996688" android:versionName="10.99.66-88"
      xmlns:tools="http://schemas.android.com/tools">
</manifest>`,
            ],
        ])('updateAndroid("%s")', async (versionName, expectedBuildGradle, expectedAndroidManifest) => {
            await updateAndroid(versionName);
            const buildGradle = fs.readFileSync(BUILD_GRADLE_PATH, {encoding: 'utf8'});
            expect(buildGradle).toBe(expectedBuildGradle);
            const androidManifest = fs.readFileSync(ANDROID_MANIFEST_PATH, {encoding: 'utf8'});
            expect(androidManifest).toBe(expectedAndroidManifest);
        });
    });
});
