import type {OnyxEntry} from 'react-native-onyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import type {PrivatePersonalDetails} from '@src/types/onyx';

type CustomSubStepProps = SubStepProps & {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
};

type CountryZipRegex = {
    regex?: RegExp;
    samples?: string;
};

export type {CustomSubStepProps, CountryZipRegex};
