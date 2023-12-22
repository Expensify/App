const fs = require('fs');
const path = require('path');
const {vol} = require('memfs');
const {updateAndroidVersion, generateAndroidVersionCode} = require('../../.github/libs/nativeVersionUpdater');

const BUILD_GRADLE_PATH = path.resolve(__dirname, '../../android/app/build.gradle');

const mockBuildGradle = `
    android {
        defaultConfig {
            versionCode 1000001479
            versionName "1.0.1-47"
        }
    }
`;

jest.mock('fs');
jest.mock('fs/promises');

beforeEach(() => {
    // Clear the mocked filesystem
    vol.reset();

    // Set up mocked filesystem
    vol.fromJSON({
        [BUILD_GRADLE_PATH]: mockBuildGradle,
    });
});

describe('generateAndroidVersionCode', () => {
    test.each([
        ['1.0.1-0', '1001000100'],
        ['1.0.1-44', '1001000144'],
        ['10.11.12-35', '1010111235'],
        ['0.0.1-1', '1000000101'],
        ['10.99.66-88', '1010996688'],
    ])('generateAndroidVersionCode(%s) – %s', (input, expected) => {
        expect(generateAndroidVersionCode(input)).toBe(expected);
    });
});

describe('updateAndroidVersion', () => {
    test.each([
        [
            '1.0.1-47',
            '1001000147',
            `
    android {
        defaultConfig {
            versionCode 1001000147
            versionName "1.0.1-47"
        }
    }
`,
        ],
        [
            '1.0.1-0',
            '1001000100',
            `
    android {
        defaultConfig {
            versionCode 1001000100
            versionName "1.0.1-0"
        }
    }
`,
        ],
        [
            '10.99.66-88',
            '1010996688',
            `
    android {
        defaultConfig {
            versionCode 1010996688
            versionName "10.99.66-88"
        }
    }
`,
        ],
    ])('updateAndroidVersion("%s", "%s")', (versionName, versionCode, expected) =>
        updateAndroidVersion(versionName, versionCode).then(() => {
            const result = fs.readFileSync(BUILD_GRADLE_PATH, {encoding: 'utf8'}).toString();
            expect(result).toBe(expected);
        }),
    );
});
