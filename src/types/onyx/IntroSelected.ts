import * as OnyxCommon from './OnyxCommon';

type IntroSelected = {
    /** The choice that the user selected in the engagement modal */
    choice: string;
};

type LoginList = Record<string, IntroSelected>;

export default IntroSelected;
export type {LoginList};
