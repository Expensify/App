import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';

import {submitWiseBusinessOnboarding, updateWiseOnboardingAdditionalData} from '@src/libs/actions/Wise';
import * as API from '@src/libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@src/libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormPage} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const BANK_ACCOUNT_ID = 9053192;
const ADDRESS_KEYS = getAddressInputKeys('address');
const ERROR_KEY = 1;
const FIRST_ID_FILE_PARAMETER = 'idDocument_0';
const SECOND_ID_FILE_PARAMETER = 'idDocument_1';
const ID_FRONT = {uri: 'file:///id-front.png', name: 'id-front.png', type: 'image/png'};
const ID_BACK = {uri: 'file:///id-back.png', name: 'id-back.png', type: 'image/png'};

// jest-expo resolves the native check, which reads `uri`. A test can switch to the web check, which reads Blobs.
const mockFileUploadCheck = {isWeb: false};
jest.mock('@libs/isFileUploadable', () => ({
    __esModule: true,
    default: (file: FileObject | undefined): boolean => {
        const checkPath = mockFileUploadCheck.isWeb ? '@libs/isFileUploadable/index.ts' : '@libs/isFileUploadable/index.native.ts';
        return jest.requireActual<{default: (file: FileObject | undefined) => boolean}>(checkPath).default(file);
    },
}));

/** One place spies on API, since the API-call lint rule counts every mention of it in a function */
const spyOnWrite = () => jest.spyOn(API, 'write');

const representativePage: DynamicFormPage = {
    key: 'representative',
    title: 'Representative',
    content: [
        {key: 'firstName', type: 'text', required: true},
        {key: 'address', type: 'address', required: true},
        {key: 'ssn', type: 'text', required: true, sensitive: true},
        {key: 'idDocument', type: 'file', required: true, maxFiles: 5},
    ],
};

const businessPage: DynamicFormPage = {
    key: 'business',
    title: 'Business',
    content: [
        {key: 'companyName', type: 'text', readonly: true},
        {key: 'companyRole', type: 'select', required: true, values: [{key: 'OWNER'}, {key: 'OTHER'}]},
        {key: 'industryCategories', type: 'multiselect', required: true, values: [{key: 'SOFTWARE_DEVELOPMENT_PUBLISHING'}]},
    ],
};

describe('actions/Wise', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(() => {
        mockFileUploadCheck.isWeb = false;
        mockFetch.succeed();
        jest.restoreAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateWiseOnboardingAdditionalData', () => {
        it('sends the page key as the step, the answers as JSON and each file as its own parameter', async () => {
            // Given the representative page's answers, with an address and two ID files
            const writeSpy = spyOnWrite();
            const answers = {
                firstName: 'Alice',
                [ADDRESS_KEYS.street]: '42 Oak Ave',
                [ADDRESS_KEYS.city]: 'Austin',
                [ADDRESS_KEYS.state]: 'TX',
                [ADDRESS_KEYS.zipCode]: '78704',
                [ADDRESS_KEYS.country]: 'US',
                idDocument: [ID_FRONT, ID_BACK],
            };

            // When the page is saved
            updateWiseOnboardingAdditionalData(BANK_ACCOUNT_ID, representativePage, answers);
            await waitForBatchedUpdates();

            // Then the server gets the bank account and the page, the address as one answer, and the files beside the JSON, since a request carries only files and plain values
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA,
                {
                    bankAccountID: BANK_ACCOUNT_ID,
                    step: 'representative',
                    inputs: JSON.stringify({firstName: 'Alice', address: {street: '42 Oak Ave', city: 'Austin', state: 'TX', zipCode: '78704', country: 'US'}}),
                    [FIRST_ID_FILE_PARAMETER]: ID_FRONT,
                    [SECOND_ID_FILE_PARAMETER]: ID_BACK,
                },
                expect.anything(),
            );
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, 1);
        });

        it.each([
            [
                'the read-only legal name, which stays with the bank account it came from',
                businessPage,
                {companyName: 'Boulder Development Inc.', companyRole: 'OWNER'},
                {companyRole: 'OWNER'},
            ],
            ['the SSN, which is never queued, and an address left unanswered', representativePage, {firstName: 'Alice', ssn: '123456789'}, {firstName: 'Alice'}],
        ])('leaves out %s', async (_label, page, answers, expectedInputs) => {
            // Given a page whose answers hold something the page save must not send
            // When the page is saved
            updateWiseOnboardingAdditionalData(BANK_ACCOUNT_ID, page, answers);
            await waitForBatchedUpdates();

            // Then only the answers the server stores for that page are sent
            TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, -1, {
                bankAccountID: BANK_ACCOUNT_ID,
                step: page.key,
                inputs: JSON.stringify(expectedInputs),
            });
        });

        it('leaves out a file that cannot be uploaded, so it does not reach the server as text', async () => {
            // Given ID answers holding a file and one whose local copy is gone
            const writeSpy = spyOnWrite();

            // When the page is saved
            updateWiseOnboardingAdditionalData(BANK_ACCOUNT_ID, representativePage, {idDocument: [ID_FRONT, {uri: ''}]});
            await waitForBatchedUpdates();

            // Then only the file that can be read is sent
            const parameters = writeSpy.mock.calls.at(0)?.[1];
            expect(parameters).toMatchObject({[FIRST_ID_FILE_PARAMETER]: ID_FRONT});
            expect(parameters).not.toHaveProperty(SECOND_ID_FILE_PARAMETER);
        });

        it('sends a web file and leaves out an empty one', async () => {
            // Given the web upload check, a picked file and an empty Blob
            mockFileUploadCheck.isWeb = true;
            const writeSpy = spyOnWrite();
            const pickedFile = new File(['id'], 'id-front.png', {type: 'image/png'});

            // When the page is saved
            updateWiseOnboardingAdditionalData(BANK_ACCOUNT_ID, representativePage, {idDocument: [new Blob([]), pickedFile]});
            await waitForBatchedUpdates();

            // Then only the picked file is sent, as the first ID file
            const parameters = writeSpy.mock.calls.at(0)?.[1];
            expect(parameters).toHaveProperty(FIRST_ID_FILE_PARAMETER);
            expect(Object.values(parameters ?? {})).toContain(pickedFile);
            expect(parameters).not.toHaveProperty(SECOND_ID_FILE_PARAMETER);
        });

        it("clears the saved page's earlier server errors and keeps the other page's", async () => {
            // Given server errors on a representative answer and on a business answer
            await Onyx.merge(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {
                errors: {[ERROR_KEY]: 'Something went wrong'},
                errorFields: {[ADDRESS_KEYS.zipCode]: {[ERROR_KEY]: 'Invalid ZIP'}, companyRole: {[ERROR_KEY]: 'Invalid role'}},
            });
            mockFetch.pause();

            // When the representative page is saved again
            updateWiseOnboardingAdditionalData(BANK_ACCOUNT_ID, representativePage, {firstName: 'Alice'});
            await waitForBatchedUpdates();

            // Then the errors on this page clear right away, and the business page still shows its own
            const form = await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
            expect(form?.errors).toBeUndefined();
            expect(form?.errorFields?.[ADDRESS_KEYS.zipCode]).toBeUndefined();
            expect(form?.errorFields?.companyRole).toEqual({[ERROR_KEY]: 'Invalid role'});
            await mockFetch.resume();
        });

        it('shows an error on the form when the save fails, beside the field errors the server sends', async () => {
            // Given a server that rejects the ZIP code of the representative's address
            mockFetch.mockAPICommand(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, () => ({
                jsonCode: 400,
                onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, value: {errorFields: {[ADDRESS_KEYS.zipCode]: {[ERROR_KEY]: 'Invalid ZIP'}}}}],
            }));

            // When the page is saved
            updateWiseOnboardingAdditionalData(BANK_ACCOUNT_ID, representativePage, {firstName: 'Alice'});
            await waitForBatchedUpdates();

            // Then the form holds the field's error for its page to show, and a general error so a failure without field errors is not silent
            const form = await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
            expect(form?.errorFields?.[ADDRESS_KEYS.zipCode]).toEqual({[ERROR_KEY]: 'Invalid ZIP'});
            expect(Object.values(form?.errors ?? {})).toHaveLength(1);
        });
    });

    describe('submitWiseBusinessOnboarding', () => {
        const SSN = '123456789';
        const SUBMIT_PARAMETERS = {bankAccountID: BANK_ACCOUNT_ID, policyID: 'ABCDEF1234567890', termsAccepted: true, ssn: SSN};

        /** The commands sent to the server so far, in order */
        const getSentCommands = () => mockFetch.mock.calls.map(([input]) => (typeof input === 'string' ? /api\/(\w+)\?/.exec(input)?.[1] : undefined));

        beforeEach(async () => {
            mockFetch.mockClear();
            await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT, {companyRole: 'OWNER'});
            await Onyx.set(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {errorFields: {companyRole: {[ERROR_KEY]: 'Invalid role'}}});
            await Onyx.set(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS, {
                [ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM]: {ssn: SSN},
                [ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM]: {ssn: '987654321'},
            });
        });

        it("sends the terms, the SSN and the workspace, shows loading while the request runs, and clears an earlier attempt's field errors", async () => {
            // Given a request that has not answered yet
            mockFetch.pause();

            // When the business is submitted
            submitWiseBusinessOnboarding(SUBMIT_PARAMETERS);
            await waitForBatchedUpdates();

            // Then the terms page can show its button loading, a field error from an earlier attempt cannot send this one back to the onboarding, and the request carries what the page saves did not
            expect((await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT))?.isLoading).toBe(true);
            expect((await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM))?.errorFields).toBeUndefined();
            await mockFetch.resume();
            TestHelper.expectAPICommandToHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.SUBMIT_WISE_BUSINESS_ONBOARDING, -1, SUBMIT_PARAMETERS);
        });

        it('never stores the SSN in the request queue on the device, and sends Submit after the page saves', async () => {
            // Given a page save still waiting for the server
            mockFetch.pause();
            updateWiseOnboardingAdditionalData(BANK_ACCOUNT_ID, businessPage, {companyRole: 'OWNER'});
            await waitForBatchedUpdates();

            // When the business is submitted, and the page save then finishes
            submitWiseBusinessOnboarding(SUBMIT_PARAMETERS);
            await waitForBatchedUpdates();
            const storedQueueWhileWaiting = JSON.stringify([await getOnyxValue(ONYXKEYS.PERSISTED_REQUESTS), await getOnyxValue(ONYXKEYS.PERSISTED_ONGOING_REQUESTS)]);
            const commandsWhileWaiting = getSentCommands();
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the stored queue holds the page save but never the SSN, and Submit goes only after the save, since Auth reads the answers the save stores
            expect(storedQueueWhileWaiting).toContain(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA);
            expect(storedQueueWhileWaiting).not.toContain(SSN);
            expect(commandsWhileWaiting).toEqual([WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA]);
            expect(getSentCommands()).toEqual([WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, SIDE_EFFECT_REQUEST_COMMANDS.SUBMIT_WISE_BUSINESS_ONBOARDING]);
        });

        it("drops the draft, the form's errors and the SSN once the submission succeeds", async () => {
            // Given a server that accepts the submission
            // When the business is submitted
            submitWiseBusinessOnboarding(SUBMIT_PARAMETERS);
            await waitForBatchedUpdates();

            // Then nothing of the finished onboarding stays on the device, and other forms keep their answers in memory
            expect((await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT))?.isLoading).toBe(false);
            expect(await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT)).toBeUndefined();
            expect(await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM)).toBeUndefined();
            expect(await getOnyxValue(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS)).toEqual({[ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM]: {ssn: '987654321'}});
        });

        it.each([
            ['the server rejects it', () => mockFetch.fail()],
            ['the connection drops before an answer', () => mockFetch.mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))],
        ])('keeps the answers and shows an error when %s, so the user can try again', async (_label, failRequest) => {
            // Given a submission that fails
            failRequest();

            // When the business is submitted
            submitWiseBusinessOnboarding(SUBMIT_PARAMETERS);
            await waitForBatchedUpdates();

            // Then the loading stops with an error kept off the shared reimbursement account, and the draft and the SSN are still there for the next Confirm
            const submitState = await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT);
            expect(submitState?.isLoading).toBe(false);
            expect(Object.values(submitState?.errors ?? {})).toHaveLength(1);
            expect((await getOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT))?.errors).toBeUndefined();
            expect(await getOnyxValue(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT)).toEqual({companyRole: 'OWNER'});
            expect((await getOnyxValue(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS))?.[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM]).toEqual({ssn: SSN});
        });
    });
});
