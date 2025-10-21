function getLastSuffixFromPath(path: string | undefined): string {
    const pathWithoutParams = path?.split('?').at(0);

    if (!pathWithoutParams) {
        throw new Error('Failed to parse the path, path is empty');
    }

    const pathWithoutTrailingSlash = pathWithoutParams.endsWith('/') ? pathWithoutParams.slice(0, -1) : pathWithoutParams;

    const lastSuffix = pathWithoutTrailingSlash.split('/').pop() ?? '';

    return lastSuffix;
}

export default getLastSuffixFromPath;
