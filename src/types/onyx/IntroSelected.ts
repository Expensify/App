import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type IntroSelected = {
    /** The choice that the user selected in the engagement modal */
    choice: ValueOf<typeof CONST.INTRO_CHOICES>;
};

export default IntroSelected;
