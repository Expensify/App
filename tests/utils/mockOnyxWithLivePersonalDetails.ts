import ONYXKEYS from '@src/ONYXKEYS';

type UseOnyxOptions = {selector?: (value: unknown) => unknown};

type ActualOnyx = {useOnyx: (key: string, options?: UseOnyxOptions) => unknown};

/**
 * Builds a `react-native-onyx` module whose `useOnyx` serves the live personal details collection from `getPersonalDetails`
 * and reads every other key from the real store. Use it as the factory of `jest.mock('react-native-onyx', ...)`.
 */
function mockOnyxWithLivePersonalDetails(getPersonalDetails: () => unknown) {
    const actualOnyx = jest.requireActual<ActualOnyx>('react-native-onyx');
    return {
        __esModule: true,
        ...actualOnyx,
        useOnyx: (key: string, options?: UseOnyxOptions) => {
            if (!key.startsWith(ONYXKEYS.COLLECTION.PERSONAL_DETAILS)) {
                return actualOnyx.useOnyx(key, options);
            }
            // Re-keyed inline: importing a helper that loads react-native-onyx would recurse into this mock
            const collection: Record<string, unknown> = {};
            for (const [accountID, personalDetail] of Object.entries(getPersonalDetails() ?? {})) {
                collection[`${ONYXKEYS.COLLECTION.PERSONAL_DETAILS}${accountID}`] = personalDetail;
            }
            const value = key === ONYXKEYS.COLLECTION.PERSONAL_DETAILS ? collection : collection[key];
            return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
        },
    };
}

export default mockOnyxWithLivePersonalDetails;
