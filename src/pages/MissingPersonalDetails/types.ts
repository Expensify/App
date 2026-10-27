import type {SubPageProps} from '@hooks/useSubPage/types';

import type {PersonalDetailsForm} from '@src/types/form';

type CustomSubPageProps = SubPageProps & {
    personalDetailsValues: PersonalDetailsForm;

    /** Whether the flow should collect a PIN */
    shouldCollectPIN: boolean;
};

type CountryZipRegex = {
    regex?: RegExp;
    samples?: string;
};

export type {CustomSubPageProps, CountryZipRegex};
