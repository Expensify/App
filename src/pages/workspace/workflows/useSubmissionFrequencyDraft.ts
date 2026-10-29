import useOnyx from '@hooks/useOnyx';

import {getCorrectedAutoReportingFrequency} from '@libs/PolicyUtils';
import {getAutoReportingOffsetsForFrequency, getPolicyAutoReportingOffsets, isAutoReportingFrequency, parseAutoReportingOffset} from '@libs/SubmissionScheduleUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceSubmissionFrequencyForm';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/** The schedule being edited in the Frequency RHP. Draft values win, and the saved policy values fill the gaps while the saved frequency is selected. */
function useSubmissionFrequencyDraft(policy: OnyxEntry<Policy>) {
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_SUBMISSION_FREQUENCY_FORM_DRAFT);

    const savedFrequency = getCorrectedAutoReportingFrequency(policy);
    const draftFrequency = formDraft?.[INPUT_IDS.FREQUENCY];
    const selectedFrequency = isAutoReportingFrequency(draftFrequency) ? draftFrequency : savedFrequency;
    const isSavedFrequencySelected = selectedFrequency === savedFrequency;
    const savedOffsets = getPolicyAutoReportingOffsets(policy);
    const {offset, secondOffset} = getAutoReportingOffsetsForFrequency(selectedFrequency, {
        offset: parseAutoReportingOffset(formDraft?.[INPUT_IDS.OFFSET]) ?? (isSavedFrequencySelected ? savedOffsets.offset : undefined),
        secondOffset: parseAutoReportingOffset(formDraft?.[INPUT_IDS.SECOND_OFFSET]) ?? (isSavedFrequencySelected ? savedOffsets.secondOffset : undefined),
    });

    return {
        selectedFrequency,
        isSavedFrequencySelected,
        offset,
        secondOffset,
        hasChanges: !isSavedFrequencySelected || offset !== savedOffsets.offset || secondOffset !== savedOffsets.secondOffset,
    };
}

export default useSubmissionFrequencyDraft;
