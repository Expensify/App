import type {SubPageProps} from '@hooks/useSubPage/types';
import type {PersonalDetailsForm} from '@src/types/form';

type CustomSubPageProps = SubPageProps & {
    /** User's personal details values */
    personalDetailsValues: PersonalDetailsForm;

    /** Whether this is a UK/EU card (requires PIN) */
    isUKEUCard?: boolean;
};

type CountryZipRegex = {
    regex?: RegExp;
    samples?: string;
};

export type {CustomSubPageProps, CountryZipRegex};
