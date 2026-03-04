import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, PersonalDetails} from '@src/types/onyx';
import useOnyx from './useOnyx';

const personalDetailMapper = (personalDetail: OnyxInputOrEntry<PersonalDetails>): OnyxInputOrEntry<PersonalDetails> =>
    personalDetail && {
        accountID: personalDetail.accountID,
        login: personalDetail.login,
        avatar: personalDetail.avatar,
        pronouns: personalDetail.pronouns,
    };

/**
 * Subscribes to all personal details and transforms each one via the provided mapper.
 * Unlike passing a selector directly to useOnyx (which triggers expensive deepEqual
 * comparisons on the entire mapped collection), this hook lets Onyx use cheap
 * shallowEqual on raw personal detail references, then maps the collection inline.
 */
function useMappedPersonalDetails<T>(mapper: (personalDetail: OnyxEntry<PersonalDetails>) => T) {
    const [personalDetails, metadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const transformed = Object.entries(personalDetails ?? {}).reduce<Record<string, T>>((acc, [key, entry]) => {
        acc[key] = mapper(entry ?? undefined);
        return acc;
    }, {});

    return [transformed, metadata] as const;
}

export {personalDetailMapper};
export default useMappedPersonalDetails;
