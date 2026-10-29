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

describe('getWiseOnboardingPageParams', () => {
    it('sends the answers as flat JSON inputs under the page key', () => {
        // Given a page without files, answered with plain text
        const answers = {description: 'We sell bikes'};

        // When the page is turned into a save request
        const params = getWiseOnboardingPageParams(BANK_ACCOUNT_ID, BUSINESS_PAGE, answers, {});

        // Then the page key is the step, the answers are its inputs, and nothing about files or the SSN is sent
        expect(params).toEqual({
            bankAccountID: BANK_ACCOUNT_ID,
            step: 'business',
            inputs: JSON.stringify(answers),
        });
    });

    it('splits kept server files from new ones and sends the typed SSN apart from the inputs', () => {
        // Given a resumed representative page that keeps one saved ID file, adds a new one, and has a new SSN typed
        const newFile = new File(['passport'], 'passport.jpg', {type: 'image/jpeg'});
        const answers = {
            firstName: 'Alice',
            [CITY_KEY]: 'Austin',
            idDocument: [toSavedFile('kyc/1/license.jpg'), newFile],
        };

        // When the page is turned into a save request
        const params = getWiseOnboardingPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers, {ssn: '123456789'});

        // Then the kept file is listed by key, the new one goes as a multipart part numbered among new files, and the SSN never lands in the inputs JSON
        const {[FIRST_ID_DOCUMENT_PART]: sentFile, ...rest} = params;
        expect(sentFile).toBe(newFile);
        expect(rest).toEqual({
            bankAccountID: BANK_ACCOUNT_ID,
            step: 'representative',
            inputs: JSON.stringify({firstName: 'Alice', [CITY_KEY]: 'Austin'}),
            documents: JSON.stringify({idDocument: ['kyc/1/license.jpg']}),
            ssn: '123456789',
        });
    });

    it('lists a hidden file field as empty and leaves out a blank SSN', () => {
        // Given the user said they have no SSN, which hides the SSN and the ID document
        const answers = {firstName: 'Alice', hasNoSSN: true};

        // When the page is turned into a save request
        const params = getWiseOnboardingPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers, {ssn: ''});

        // Then the server is told to drop the ID files, and no SSN is sent so the stored one is kept
        expect(params.documents).toBe(JSON.stringify({idDocument: []}));
        expect(params.ssn).toBeUndefined();
    });

    it('leaves out a drafted entry that cannot be uploaded and keeps the files the server holds', () => {
        // Given a file entry with no file data behind it, such as one whose data the device no longer has
        const answers = {firstName: 'Alice', idDocument: [{name: 'lost.jpg', uri: 'blob:lost'}]};

        // When the page is turned into a save request
        const params = getWiseOnboardingPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers, {});

        // Then no part is sent for it, so the server never receives "[object Object]" as a file, and no `documents` is sent, so an empty list
        // does not drop the stored file the user still sees
        expect(Object.keys(params)).not.toContain(FIRST_ID_DOCUMENT_PART);
        expect(params.documents).toBeUndefined();
    });

    it('lists a removed saved file as empty', () => {
        // Given a resumed representative page where the user removed the only saved ID file
        const answers = {firstName: 'Alice', idDocument: []};

        // When the page is turned into a save request
        const params = getWiseOnboardingPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers, {});

        // Then the field is listed with no keys, so the server removes the file too
        expect(params.documents).toBe(JSON.stringify({idDocument: []}));
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
