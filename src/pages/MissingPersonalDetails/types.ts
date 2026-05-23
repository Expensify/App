import type {SubPageProps} from '@hooks/useSubPage/types';
import type {PersonalDetailsForm} from '@src/types/form';

type CustomSubPageProps = SubPageProps & {
    /** User's personal details values */
    personalDetailsValues: PersonalDetailsForm;

    /** Whether the flow should collect a PIN */
    shouldCollectPIN: boolean;
};

type CountryZipRegex = {
    regex?: RegExp;
    samples?: string;
};

export type {CustomSubPageProps, CountryZipRegex};
