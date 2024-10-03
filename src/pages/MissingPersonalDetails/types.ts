import type {OnyxEntry} from 'react-native-onyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import type {PersonalDetailsForm} from '@src/types/form';
import type {PrivatePersonalDetails} from '@src/types/onyx';

type CustomSubStepProps = SubStepProps & {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
};

type CountryZipRegex = {
    regex?: RegExp;
    samples?: string;
};

type SubStepsValues = {
    [TKey in keyof PersonalDetailsForm]: PersonalDetailsForm[TKey];
};

export type {CustomSubStepProps, CountryZipRegex, SubStepsValues};
