import resolveRequirements from '@libs/KYB/resolveRequirements';
import {regionKYBConfigs, US_BUSINESS_BOOTSTRAP} from '@libs/KYB/wiseKYB';

describe('resolveRequirements', () => {
    test('US bootstrap is form 1 and does not ask for formation documents', () => {
        // Given the US region config
        // When reading form 1
        const pages = US_BUSINESS_BOOTSTRAP.pages;

        // Then formation docs stay off the mainline. Wise asks for them later only if the electronic check fails.
        expect(pages).toContain('EIN');
        expect(pages).not.toContain('FORMATION_DOCUMENTS');
        expect(regionKYBConfigs.US.journey).toEqual({type: 'API'});
    });

    test('a missing owner SSN becomes COLLECT', () => {
        // Given Wise asked for owner identity and we do not have the SSN
        // When resolving the graph
        const tasks = resolveRequirements({
            journey: {type: 'API'},
            dispositions: {'owner.ssn': 'MISSING'},
            graph: [[{key: 'BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID', state: 'NOT_PROVIDED'}]],
        });

        // Then form 2 asks the user for it
        expect(tasks).toEqual([
            expect.objectContaining({
                requirementKey: 'BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID',
                action: 'COLLECT',
                presenter: 'AUTHORIZE_OR_COLLECT_OWNER_SSN',
            }),
        ]);
    });

    test('a held SSN that is not disclosable becomes AUTHORIZE_DISCLOSURE', () => {
        // Given Auth already stores the encrypted SSN but consent is still closed
        // When Wise asks for owner identity
        const tasks = resolveRequirements({
            journey: {type: 'API'},
            dispositions: {'owner.ssn': 'COLLECTED_NOT_DISCLOSABLE'},
            graph: [[{key: 'BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID', state: 'NOT_PROVIDED'}]],
        });

        // Then we do not re-collect the number. We ask for permission to send it.
        expect(tasks[0]?.action).toBe('AUTHORIZE_DISCLOSURE');
    });

    test('a disclosable SSN becomes SUBMIT so form 2 can skip the screen', () => {
        // Given consent is granted and the SSN is on file
        // When Wise asks for owner identity
        const tasks = resolveRequirements({
            journey: {type: 'API'},
            dispositions: {'owner.ssn': 'DISCLOSABLE'},
            graph: [[{key: 'BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID', state: 'NOT_PROVIDED'}]],
        });

        // Then the orchestrator can POST without a presenter
        expect(tasks[0]?.action).toBe('SUBMIT');
        expect(tasks[0]?.submitter).toBe('WISE_US_UBO_SSN');
    });

    test('an OR group is skipped when either alternative is already provided', () => {
        // Given Wise accepted ID_DOCUMENT as one of two alternatives
        // When the sibling key is still NOT_PROVIDED
        const tasks = resolveRequirements({
            journey: {type: 'API'},
            dispositions: {},
            graph: [
                [
                    {key: 'ID_DOCUMENT', state: 'PROVIDED'},
                    {key: 'ANNUAL_VOLUME', state: 'NOT_PROVIDED'},
                ],
            ],
        });

        // Then we must not also collect annual volume for that group
        expect(tasks).toEqual([]);
    });

    test('AU stays empty because the journey is blocked', () => {
        // Given AU has no decided API or hosted path
        // When resolving any graph
        const tasks = resolveRequirements({
            journey: regionKYBConfigs.AU.journey,
            dispositions: {},
            graph: [[{key: 'ID_DOCUMENT', state: 'NOT_PROVIDED'}]],
        });

        // Then no screens are invented
        expect(tasks).toEqual([]);
    });
});
