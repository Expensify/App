import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type SwitchToOldDotParams = {
    reason?: ValueOf<typeof CONST.EXIT_SURVEY.REASONS>;
    surveyResponse?: string;
};

export default SwitchToOldDotParams;
