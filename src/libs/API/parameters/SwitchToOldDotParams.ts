import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type SwitchToOldDotParams = {
    reason?: ValueOf<typeof CONST.EXIT_SURVEY.REASONS>;
    surveyResponse?: string;
};

export default SwitchToOldDotParams;
