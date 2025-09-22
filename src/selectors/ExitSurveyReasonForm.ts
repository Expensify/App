import type {OnyxEntry} from 'react-native-onyx';
import type {ExitSurveyReasonForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ExitSurveyReasonForm';

const exitSurveyReasonSelector = (value: OnyxEntry<ExitSurveyReasonForm>) => value?.[INPUT_IDS.REASON] ?? null;

// eslint-disable-next-line import/prefer-default-export
export {exitSurveyReasonSelector};
