import {renderHook, waitFor} from '@testing-library/react-native';

import useMoneyRequestParticipantsPolicyTags from '@hooks/useMoneyRequestParticipantsPolicyTags';

import {getMoneyRequestParticipantOptions} from '@libs/actions/IOU/MoneyRequest';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    getMoneyRequestParticipantOptions: jest.fn(),
}));

const translate = jest.fn().mockReturnValue('translated');

describe('useMoneyRequestParticipantsPolicyTags', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('calls getMoneyRequestParticipantOptions with all the given arguments and returns its participants', async () => {
        const mockParticipants = [{accountID: 111, selected: true}];
        jest.mocked(getMoneyRequestParticipantOptions).mockReturnValue(mockParticipants);

        const report = {reportID: '1', policyID: 'policy1'};
        const policy = {...createRandomPolicy(1), id: 'policy1'};
        const personalDetails = {};
        const reportAttributesDerived = {};
        const reportDraft = undefined;

        const {result} = renderHook(() =>
            useMoneyRequestParticipantsPolicyTags({
                currentUserAccountID: 999,
                report,
                policy,
                personalDetails,
                conciergeReportID: 'concierge1',
                isArchived: false,
                reportAttributesDerived,
                reportDraft,
                translate,
            }),
        );

        await waitFor(() => expect(result.current.participants).toEqual(mockParticipants));

        expect(getMoneyRequestParticipantOptions).toHaveBeenCalledWith(999, report, policy, personalDetails, 'concierge1', false, reportAttributesDerived, reportDraft, translate);
    });

    it('derives participantsPolicyTags from Onyx policy tags keyed by each participant policyID', async () => {
        const tagsForPolicyOne: PolicyTagLists = {
            Project: {
                name: 'Project',
                required: false,
                tags: {Alpha: {name: 'Alpha', enabled: true}},
                orderWeight: 1,
            },
        };
        const tagsForPolicyTwo: PolicyTagLists = {
            Region: {
                name: 'Region',
                required: false,
                tags: {North: {name: 'North', enabled: true}},
                orderWeight: 1,
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}policy1`, tagsForPolicyOne);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}policy2`, tagsForPolicyTwo);
        await waitForBatchedUpdatesWithAct();

        jest.mocked(getMoneyRequestParticipantOptions).mockReturnValue([
            {accountID: 111, selected: true, policyID: 'policy1'},
            {accountID: 222, selected: true, policyID: 'policy2'},
        ]);

        const {result} = renderHook(() =>
            useMoneyRequestParticipantsPolicyTags({
                currentUserAccountID: 999,
                report: {reportID: '1'},
                policy: undefined,
                personalDetails: {},
                conciergeReportID: undefined,
                isArchived: false,
                reportAttributesDerived: {},
                reportDraft: undefined,
                translate,
            }),
        );

        await waitFor(() => expect(result.current.participantsPolicyTags.policy1).toBeDefined());
        expect(result.current.participantsPolicyTags.policy1).toEqual(tagsForPolicyOne);
        expect(result.current.participantsPolicyTags.policy2).toEqual(tagsForPolicyTwo);
    });

    it('returns an empty participantsPolicyTags map when no participant has a policyID', async () => {
        jest.mocked(getMoneyRequestParticipantOptions).mockReturnValue([{accountID: 111, selected: true}]);

        const {result} = renderHook(() =>
            useMoneyRequestParticipantsPolicyTags({
                currentUserAccountID: 999,
                report: {reportID: '1'},
                policy: undefined,
                personalDetails: {},
                conciergeReportID: undefined,
                isArchived: false,
                reportAttributesDerived: {},
                reportDraft: undefined,
                translate,
            }),
        );

        await waitForBatchedUpdatesWithAct();
        expect(result.current.participantsPolicyTags).toEqual({});
    });
});
