import getAppVersion from '@libs/VersionUtils';

describe('getAppVersion', () => {
    it('should split the semantic version from the build number', () => {
        expect(getAppVersion('9.4.48-2')).toStrictEqual({semanticVersion: '9.4.48', buildNumber: '2'});
    });

    it('should support versions without a build number', () => {
        expect(getAppVersion('9.4.48')).toStrictEqual({semanticVersion: '9.4.48', buildNumber: undefined});
    });
});
