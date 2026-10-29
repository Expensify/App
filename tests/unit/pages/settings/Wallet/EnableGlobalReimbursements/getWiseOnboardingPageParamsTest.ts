import getWiseOnboardingPageParams, {getSavedFileAnswers, toSavedFile} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseOnboardingPageParams';

import type {DynamicFormPage} from '@src/types/onyx';

// Jest resolves the native helper, which accepts any entry with a uri, so the web rule is used to tell a real file from an entry with no data
jest.mock('@libs/isFileUploadable', () => ({__esModule: true, default: (file: unknown) => file instanceof Blob}));

const BANK_ACCOUNT_ID = 1;
const CITY_KEY = 'address.city';
const FIRST_ID_DOCUMENT_PART = 'idDocument[0]';

const REPRESENTATIVE_PAGE: DynamicFormPage = {
    key: 'representative',
    content: [
        {key: 'firstName', type: 'text', required: true},
        {key: 'address', type: 'address', required: true},
        {key: 'ssn', type: 'text', required: true, sensitive: true},
        {key: 'idDocument', type: 'file', required: true, maxFiles: 5},
    ],
};

const BUSINESS_PAGE: DynamicFormPage = {
    key: 'business',
    content: [{key: 'description', type: 'text', required: true}],
};

/** The page's save parameters, which every page here has, since its key is a step the server accepts */
function getPageParams(...args: Parameters<typeof getWiseOnboardingPageParams>) {
    const pageParams = getWiseOnboardingPageParams(...args);
    if (!pageParams) {
        throw new Error(`No step for page ${args[1].key}`);
    }
    return pageParams;
}

describe('getWiseOnboardingPageParams', () => {
    it('sends the answers as flat JSON inputs under the page key', () => {
        // Given a page without files, answered with plain text
        const answers = {description: 'We sell bikes'};

        // When the page is turned into a save request
        const {params, hasSensitiveAnswers} = getPageParams(BANK_ACCOUNT_ID, BUSINESS_PAGE, answers, {});

        // Then the page key is the step, the answers are its inputs, nothing about files is sent, and the request may be queued
        expect(params).toEqual({
            bankAccountID: BANK_ACCOUNT_ID,
            step: 'business',
            inputs: JSON.stringify(answers),
        });
        expect(hasSensitiveAnswers).toBe(false);
    });

    it('splits kept server files from new ones and sends the typed SSN in the inputs', () => {
        // Given a resumed representative page that keeps one saved ID file, adds a new one, and has a new SSN typed
        const newFile = new File(['passport'], 'passport.jpg', {type: 'image/jpeg'});
        const answers = {
            firstName: 'Alice',
            [CITY_KEY]: 'Austin',
            idDocument: [toSavedFile('kyc/1/license.jpg'), newFile],
        };

        // When the page is turned into a save request
        const {params, hasSensitiveAnswers} = getPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers, {ssn: '123456789'});

        // Then the kept file is listed by key, the new one goes as a multipart part numbered among new files, and the SSN is in the inputs, where the
        // server reads it, with the request flagged to stay out of the queue
        const {[FIRST_ID_DOCUMENT_PART]: sentFile, ...rest} = params;
        expect(sentFile).toBe(newFile);
        expect(rest).toEqual({
            bankAccountID: BANK_ACCOUNT_ID,
            step: 'representative',
            inputs: JSON.stringify({firstName: 'Alice', [CITY_KEY]: 'Austin', ssn: '123456789'}),
            documents: JSON.stringify({idDocument: ['kyc/1/license.jpg']}),
        });
        expect(hasSensitiveAnswers).toBe(true);
    });

    it('lists a hidden file field as empty and leaves out a blank SSN', () => {
        // Given the user said they have no SSN, which hides the SSN and the ID document
        const answers = {firstName: 'Alice', hasNoSSN: true};

        // When the page is turned into a save request
        const {params, hasSensitiveAnswers} = getPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers, {ssn: ''});

        // Then the server is told to drop the ID files, and no SSN is sent so the stored one is kept
        expect(params.documents).toBe(JSON.stringify({idDocument: []}));
        expect(params.inputs).toBe(JSON.stringify(answers));
        expect(hasSensitiveAnswers).toBe(false);
    });

    it('leaves out a drafted entry that cannot be uploaded and keeps the files the server holds', () => {
        // Given a saved ID file, a file entry with no file data behind it, such as one whose data the device no longer has, and a new file
        const newFile = new File(['passport'], 'passport.jpg', {type: 'image/jpeg'});
        const answers = {firstName: 'Alice', idDocument: [toSavedFile('kyc/1/license.jpg'), {name: 'lost.jpg', uri: 'blob:lost'}, newFile]};

        // When the page is turned into a save request
        const {params} = getPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers, {});

        // Then only the new file is sent as a part, so the server never receives "[object Object]" as a file, and the saved file is still listed,
        // so the server keeps it next to the new one
        expect(params[FIRST_ID_DOCUMENT_PART]).toBe(newFile);
        expect(Object.keys(params)).not.toContain('idDocument[1]');
        expect(params.documents).toBe(JSON.stringify({idDocument: ['kyc/1/license.jpg']}));
    });

    it('lists a removed saved file as empty', () => {
        // Given a resumed representative page where the user removed the only saved ID file
        const answers = {firstName: 'Alice', idDocument: []};

        // When the page is turned into a save request
        const {params} = getPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers, {});

        // Then the field is listed with no keys, so the server removes the file too
        expect(params.documents).toBe(JSON.stringify({idDocument: []}));
    });

    it('gives nothing for a page whose key is not a step the server accepts', () => {
        // Given a page keyed by something other than a step, which the server would answer with 400 Invalid step
        const page: DynamicFormPage = {key: 'ownership', content: [{key: 'description', type: 'text', required: true}]};

        // When the page is turned into a save request
        const pageParams = getWiseOnboardingPageParams(BANK_ACCOUNT_ID, page, {description: 'We sell bikes'}, {});

        // Then there is no request to send, so the caller can keep the page unsaved instead
        expect(pageParams).toBeUndefined();
    });
});

describe('getSavedFileAnswers', () => {
    it('turns the file keys the server holds into draft entries, an emptied field included', () => {
        // Given the server's file keys after a save, with one page holding a file and another field emptied by the user
        const documents = {representative: {idDocument: ['kyc/1/passport.jpg']}, business: {proofOfAddress: []}};

        // When they are turned into draft answers
        const answers = getSavedFileAnswers(documents);

        // Then each field lists the saved files, so the next save sends their keys instead of uploading them again, and the emptied field stays empty
        expect(answers).toEqual({idDocument: [toSavedFile('kyc/1/passport.jpg')], proofOfAddress: []});
    });
});
