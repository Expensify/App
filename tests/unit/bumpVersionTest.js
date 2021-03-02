const fs = require('fs');
const path = require('path');
const mockFS = require('mock-fs');
const {
    generateAndroidVersionCode,
    updateAndroidVersion,
} = require('../../.github/libs/nativeVersionUpdater');

const BUILD_GRADLE_PATH = path.resolve(__dirname, '../../android/app/build.gradle');

const mockBuildGradle = `
    android {
        defaultConfig {
            versionCode 001000001473
            versionName "1.0.1-473"
        }
    }
`;

beforeAll(() => {
    // Override global console to fix bug with mock-fs: https://github.com/tschaub/mock-fs/issues/234
    global.console = require('../../__mocks__/console');

    // Set up mocked filesystem
    mockFS({
        [BUILD_GRADLE_PATH]: mockBuildGradle,
    });
});

// Restore modules to normal
afterAll(() => {
    mockFS.restore();
    global.console = require('console');
});

describe('generateAndroidVersionCode', () => {
    test.each([
        ['1.0.1', '001000001000'],
        ['1.0.1-444', '001000001444'],
        ['10.11.12-345', '010011012345'],
        ['0.0.1-1', '000000001001'],
        ['100.999.666-888', '100999666888'],
    ])('generateAndroidVersionCode(%s) – %s', (input, expected) => {
        expect(generateAndroidVersionCode(input)).toBe(expected);
    });
});

describe('updateAndroidVersion', () => {
    test.each([
        [
            '1.0.1-474',
            '001000001474',
            `
    android {
        defaultConfig {
            versionCode 001000001474
            versionName "1.0.1-474"
        }
    }
`],
        [
            '1.0.1',
            '001000001000',
            `
    android {
        defaultConfig {
            versionCode 001000001000
            versionName "1.0.1"
        }
    }
`],
        [
            '100.999.666-888',
            '100999666888',
            `
    android {
        defaultConfig {
            versionCode 100999666888
            versionName "100.999.666-888"
        }
    }
`],
    ])('updateAndroidVersion("%s", "%s")', (versionName, versionCode, expected) => (
        updateAndroidVersion(versionName, versionCode)
            .then(() => {
                const result = fs.readFileSync(BUILD_GRADLE_PATH, {encoding: 'utf8'}).toString();
                expect(result).toBe(expected);
            })
    ));
});
