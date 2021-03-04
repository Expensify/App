const fs = require('fs');
const path = require('path');
const mockFS = require('mock-fs');
const {updateAndroidVersion} = require('../../.github/libs/nativeVersionUpdater');

const BUILD_GRADLE_PATH = path.resolve(__dirname, '../../android/app/build.gradle');

const mockBuildGradle = `
    android {
        defaultConfig {
            versionCode 1000001479
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

describe('updateAndroidVersion', () => {
    test.each([
        [
            '1.0.1-474',
            `
    android {
        defaultConfig {
            versionCode 1000001480
            versionName "1.0.1-474"
        }
    }
`],
        [
            '1.0.1',
            `
    android {
        defaultConfig {
            versionCode 1000001481
            versionName "1.0.1"
        }
    }
`],
        [
            '100.999.666-888',
            `
    android {
        defaultConfig {
            versionCode 1000001482
            versionName "100.999.666-888"
        }
    }
`],
    ])('updateAndroidVersion("%s")', (versionName, expected) => (
        updateAndroidVersion(versionName)
            .then(() => {
                const result = fs.readFileSync(BUILD_GRADLE_PATH, {encoding: 'utf8'}).toString();
                expect(result).toBe(expected);
            })
    ));
});
