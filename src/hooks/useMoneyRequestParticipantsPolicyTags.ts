/**
 * Resolves the participants for a money request and derives the policy tags for each participant's policy.
 * Combines `getMoneyRequestParticipantOptions` with `useParticipantsPolicyTags` so distance-request call sites can
 * read reactive participant policy tags from Onyx instead of the deprecated `buildParticipantsPolicyTags` helper.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getMoneyRequestParticipantOptions} from '@libs/actions/IOU/MoneyRequest';
import type {OptionData} from '@libs/ReportUtils';

import type {ParticipantsPolicyTags, PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import useParticipantsPolicyTags from './useParticipantsPolicyTags';

type UseMoneyRequestParticipantsPolicyTagsParams = {
    currentUserAccountID: number;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    conciergeReportID: string | undefined;
    isArchived: boolean | undefined;
    reportAttributesDerived: ReportAttributesDerivedValue['reports'] | undefined;
    reportDraft: OnyxEntry<Report> | undefined;
    translate: LocaleContextProps['translate'];
};

type UseMoneyRequestParticipantsPolicyTagsResult = {
    participants: Array<Participant | OptionData>;
    participantsPolicyTags: ParticipantsPolicyTags;
};

function useMoneyRequestParticipantsPolicyTags({
    currentUserAccountID,
    report,
    policy,
    personalDetails,
    conciergeReportID,
    isArchived,
    reportAttributesDerived,
    reportDraft,
    translate,
}: UseMoneyRequestParticipantsPolicyTagsParams): UseMoneyRequestParticipantsPolicyTagsResult {
    const participants = getMoneyRequestParticipantOptions(
        currentUserAccountID,
        report,
        policy,
        personalDetails,
        conciergeReportID,
        isArchived,
        reportAttributesDerived,
        reportDraft,
        translate,
    );
    const participantsPolicyTags = useParticipantsPolicyTags(participants);

    return {participants, participantsPolicyTags};
}

export default useMoneyRequestParticipantsPolicyTags;
