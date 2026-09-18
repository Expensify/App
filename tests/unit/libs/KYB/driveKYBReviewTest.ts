import driveKYBReview from '@libs/KYB/driveKYBReview';
import type {DriveKYBReviewDependencies} from '@libs/KYB/driveKYBReview';
import type {KYBReview} from '@libs/KYB/KYBTypes';
import {regionKYBConfigs} from '@libs/KYB/wiseKYB';

function createDependencies(reviews: KYBReview[]): DriveKYBReviewDependencies & {calls: string[]} {
    const calls: string[] = [];
    let reviewIndex = 0;

    return {
        calls,
        createBusinessProfile: jest.fn(async () => {
            calls.push('createBusinessProfile');
        }),
        createUBOs: jest.fn(async () => {
            calls.push('createUBOs');
        }),
        createDirectors: jest.fn(async () => {
            calls.push('createDirectors');
        }),
        createReview: jest.fn(async () => {
            calls.push('createReview');
        }),
        getReview: jest.fn(async () => {
            const review = reviews.at(reviewIndex) ?? reviews.at(-1);
            reviewIndex += 1;
            return review as KYBReview;
        }),
        submitTasks: jest.fn(async () => {
            calls.push('submitTasks');
        }),
        launchHostedFlow: jest.fn(async () => {
            calls.push('launchHostedFlow');
        }),
    };
}

describe('driveKYBReview', () => {
    test('blocks AU before creating a Wise profile', async () => {
        // Given AU KYB is still undetermined
        const dependencies = createDependencies([]);

        // When form 1 is submitted
        const result = await driveKYBReview({
            journey: regionKYBConfigs.AU.journey,
            dispositions: {},
            dependencies,
        });

        // Then we must not call Wise
        expect(result).toEqual({status: 'BLOCKED'});
        expect(dependencies.calls).toEqual([]);
    });

    test('creates people before the review so the first requirement list is accurate', async () => {
        // Given a US API journey whose review is already passed
        const dependencies = createDependencies([{status: 'PASSED', requirements: []}]);

        // When form 1 is submitted
        const result = await driveKYBReview({
            journey: {type: 'API'},
            dispositions: {},
            dependencies,
        });

        // Then profile, UBOs, and directors are created before the review
        expect(result).toEqual({status: 'COMPLETE'});
        expect(dependencies.calls).toEqual(['createBusinessProfile', 'createUBOs', 'createDirectors', 'createReview']);
    });

    test('auto-submits a disclosable SSN then re-reads because Wise can add another key', async () => {
        // Given owner SSN is disclosable, and after that submit Wise asks for the rep ID
        const dependencies = createDependencies([
            {
                status: 'WAITING_CUSTOMER_INPUT',
                requirements: [[{key: 'BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID', state: 'NOT_PROVIDED'}]],
            },
            {
                status: 'WAITING_CUSTOMER_INPUT',
                requirements: [[{key: 'BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID', state: 'PROVIDED'}], [{key: 'ID_DOCUMENT', state: 'NOT_PROVIDED'}]],
            },
        ]);

        // When driving form 2
        const result = await driveKYBReview({
            journey: {type: 'API'},
            dispositions: {'owner.ssn': 'DISCLOSABLE'},
            dependencies,
        });

        // Then the SSN is sent without a screen, the graph is read again, and ID upload waits for the user
        expect(dependencies.calls).toEqual(['createBusinessProfile', 'createUBOs', 'createDirectors', 'createReview', 'submitTasks']);
        expect(result).toEqual({
            status: 'WAITING_ON_USER',
            tasks: [
                expect.objectContaining({
                    requirementKey: 'ID_DOCUMENT',
                    action: 'COLLECT',
                    presenter: 'UPLOAD_REP_ID',
                }),
            ],
        });
    });

    test('GB hosted journey opens the hosted flow instead of API requirement screens', async () => {
        // Given GB uses hosted KYB after bootstrap
        const dependencies = createDependencies([
            {
                status: 'WAITING_CUSTOMER_INPUT',
                requirements: [[{key: 'ID_DOCUMENT', state: 'NOT_PROVIDED'}]],
            },
        ]);

        // When form 1 is submitted
        const result = await driveKYBReview({
            journey: regionKYBConfigs.GB.journey,
            dispositions: {},
            dependencies,
        });

        // Then we hand off rather than inventing GB screens
        expect(result).toEqual({status: 'HOSTED'});
        expect(dependencies.calls).toContain('launchHostedFlow');
    });
});
