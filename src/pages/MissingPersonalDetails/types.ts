import type {SubPageProps} from '@hooks/useSubPage/types';
import type {SubStepProps} from '@hooks/useSubStep/types';
import type {PersonalDetailsForm} from '@src/types/form';

type CustomSubStepProps = SubStepProps & {
    /** User's personal details values */
    personalDetailsValues: PersonalDetailsForm;
};

type CustomSubPageProps = SubPageProps & {
    /** User's personal details values */
    personalDetailsValues: PersonalDetailsForm;
};

type CountryZipRegex = {
    regex?: RegExp;
    samples?: string;
};

export type {CustomSubStepProps, CustomSubPageProps, CountryZipRegex};
