import ONYXKEYS from '@src/ONYXKEYS';

type UseOnyxOptions = {selector?: (value: unknown) => unknown};

type ActualOnyx = {useOnyx: (key: string, options?: UseOnyxOptions) => unknown};

/**
 * Builds a `react-native-onyx` module whose `useOnyx` serves the live personal details list from `getPersonalDetails`
 * and reads every other key from the real store. Use it as the factory of `jest.mock('react-native-onyx', ...)`.
 */
function mockOnyxWithLivePersonalDetails(getPersonalDetails: () => unknown) {
    const actualOnyx = jest.requireActual<ActualOnyx>('react-native-onyx');
    return {
        __esModule: true,
        ...actualOnyx,
        useOnyx: (key: string, options?: UseOnyxOptions) => {
            if (key !== ONYXKEYS.PERSONAL_DETAILS_LIST) {
                return actualOnyx.useOnyx(key, options);
            }
            const personalDetails = getPersonalDetails();
            return [options?.selector ? options.selector(personalDetails) : personalDetails, {status: 'loaded'}];
        },
    };
}

export default mockOnyxWithLivePersonalDetails;
