type AppVersion = {
    buildNumber?: string;
    semanticVersion: string;
};

function getAppVersion(version: string): AppVersion {
    const [semanticVersion, buildNumber] = version.split('-');

    return {semanticVersion, buildNumber};
}

export default getAppVersion;
