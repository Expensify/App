import getWiseOnboardingPageParams, {getLabelledFileKey, getSavedFileAnswers, toSavedFile} from '@libs/getWiseOnboardingPageParams';

import type {DynamicFormPage} from '@src/types/onyx';

// Jest resolves the native helper, which accepts any entry with a uri, so the web rule is used to tell a real file from an entry with no data
jest.mock('@libs/isFileUploadable', () => ({__esModule: true, default: (file: unknown) => file instanceof Blob}));

const BANK_ACCOUNT_ID = 1;
const CITY_KEY = 'address.city';
const FIRST_ID_DOCUMENT_PART = 'idDocument[0]';
const REVENUE_TAX_RETURNS = getLabelledFileKey('REVENUE', 'TAX_DOCUMENTS');
const REVENUE_BANK_STATEMENTS = getLabelledFileKey('REVENUE', 'BANK_STATEMENT');
const REVENUE_INVOICES = getLabelledFileKey('REVENUE', 'INVOICES');

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
        const params = getPageParams(BANK_ACCOUNT_ID, BUSINESS_PAGE, answers);

        // Then the page key is the step, the answers are its inputs, and nothing about files is sent
        expect(params).toEqual({
            bankAccountID: BANK_ACCOUNT_ID,
            step: 'business',
            inputs: JSON.stringify(answers),
        });
    });

    it('splits kept server files from new ones', () => {
        // Given a resumed representative page that keeps one saved ID file and adds a new one
        const newFile = new File(['passport'], 'passport.jpg', {type: 'image/jpeg'});
        const answers = {
            firstName: 'Alice',
            [CITY_KEY]: 'Austin',
            idDocument: [toSavedFile('kyc/1/license.jpg'), newFile],
        };

        // When the page is turned into a save request
        const params = getPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers);

        // Then the kept file is listed by key, the new one goes as a multipart part numbered among new files, and the other answers are the inputs
        const {[FIRST_ID_DOCUMENT_PART]: sentFile, ...rest} = params;
        expect(sentFile).toBe(newFile);
        expect(rest).toEqual({
            bankAccountID: BANK_ACCOUNT_ID,
            step: 'representative',
            inputs: JSON.stringify({firstName: 'Alice', [CITY_KEY]: 'Austin'}),
            documents: JSON.stringify({idDocument: ['kyc/1/license.jpg']}),
        });
    });

    it('lists a hidden file field as empty', () => {
        // Given the user said they have no SSN, which hides the SSN and the ID document
        const answers = {firstName: 'Alice', hasNoSSN: true};

        // When the page is turned into a save request
        const params = getPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers);

        // Then the server is told to drop the ID files
        expect(params.documents).toBe(JSON.stringify({idDocument: []}));
        expect(params.inputs).toBe(JSON.stringify(answers));
    });

    it('leaves out a drafted entry that cannot be uploaded and keeps the files the server holds', () => {
        // Given a saved ID file, a file entry with no file data behind it, such as one whose data the device no longer has, and a new file
        const newFile = new File(['passport'], 'passport.jpg', {type: 'image/jpeg'});
        const answers = {firstName: 'Alice', idDocument: [toSavedFile('kyc/1/license.jpg'), {name: 'lost.jpg', uri: 'blob:lost'}, newFile]};

        // When the page is turned into a save request
        const params = getPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers);

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
        const params = getPageParams(BANK_ACCOUNT_ID, REPRESENTATIVE_PAGE, answers);

        // Then the field is listed with no keys, so the server removes the file too
        expect(params.documents).toBe(JSON.stringify({idDocument: []}));
    });

    it('sends an empty object as the inputs of a page whose only answers are files', () => {
        // Given a page that asks for nothing but a file, answered with one new file
        const page: DynamicFormPage = {key: 'BUSINESS_SOURCE_OF_WEALTH_PROOF', content: [{key: 'proofFile', type: 'file', required: true}]};
        const proofFile = new File(['statement'], 'statement.pdf', {type: 'application/pdf'});

        // When the page is turned into a save request
        const params = getPageParams(BANK_ACCOUNT_ID, page, {proofFile: [proofFile]});

        // Then inputs is `{}`, since the server rejects `[]` as "Inputs is not a valid json object", and the file still goes as its own part
        expect(params.inputs).toBe('{}');
        expect(params['proofFile[0]']).toBe(proofFile);
    });

    it('sends the files of a labelled field under its key and their type, listing every type it offers', () => {
        // Given a source of funds that keeps a saved tax return and adds a new bank statement, and offers invoices too
        const page: DynamicFormPage = {
            key: 'BUSINESS_SOURCE_OF_WEALTH_PROOF',
            content: [{key: 'REVENUE', type: 'file', required: true, uploads: [{fileTypes: [{key: 'TAX_DOCUMENTS'}, {key: 'INVOICES'}]}, {fileTypes: [{key: 'BANK_STATEMENT'}]}]}],
        };
        const statement = new File(['statement'], 'statement.pdf', {type: 'application/pdf'});
        const answers = {
            REVENUE: [
                {id: 'TAX_DOCUMENTS', fileType: 'TAX_DOCUMENTS', files: [toSavedFile('kyc/1/tax.pdf')]},
                {id: 'BANK_STATEMENT', fileType: 'BANK_STATEMENT', files: [statement]},
            ],
        };

        // When the page is turned into a save request
        const params = getPageParams(BANK_ACCOUNT_ID, page, answers);

        // Then each file goes under `<source>.<document type>`, so the server knows both, and the unused type is listed empty, so a removed invoice is removed on the server too
        expect(params[`${REVENUE_BANK_STATEMENTS}[0]`]).toBe(statement);
        expect(params.documents).toBe(JSON.stringify({[REVENUE_TAX_RETURNS]: ['kyc/1/tax.pdf'], [REVENUE_INVOICES]: [], [REVENUE_BANK_STATEMENTS]: []}));
        expect(params.inputs).toBe('{}');
    });

    it('sends the picked sources as the list Wise takes, keeping what the server holds for a source still picked', () => {
        // Given the sources page answered with a loan, revenue and grants, after a save that said the loan funds daily operations and revenue does not
        const page: DynamicFormPage = {key: 'BUSINESS_SOURCE_OF_WEALTH_INFO', content: [{key: 'businessSourceOfWealthInfo', type: 'multiselect', required: true}]};
        const savedSourceOfWealthList = [
            {businessSourceOfWealthInfo: 'BUSINESS_LOAN', isSourceOfFund: true},
            {businessSourceOfWealthInfo: 'REVENUE', isSourceOfFund: false},
        ];

        // When the page is turned into a save request
        const params = getPageParams(BANK_ACCOUNT_ID, page, {businessSourceOfWealthInfo: ['BUSINESS_LOAN', 'REVENUE', 'GRANTS']}, savedSourceOfWealthList);

        // Then the inputs are Wise's sourceOfWealthList, one entry per picked source, since the server replaces the saved page on every save, and the new source waits for the daily operations page
        expect(JSON.parse(params.inputs)).toEqual({
            sourceOfWealthList: [
                {businessSourceOfWealthInfo: 'BUSINESS_LOAN', isSourceOfFund: true},
                {businessSourceOfWealthInfo: 'REVENUE', isSourceOfFund: false},
                {businessSourceOfWealthInfo: 'GRANTS'},
            ],
        });
    });

    it('makes a lone picked source fund daily operations', () => {
        // Given the sources page answered with revenue alone, which skips the daily operations page
        const page: DynamicFormPage = {key: 'BUSINESS_SOURCE_OF_WEALTH_INFO', content: [{key: 'businessSourceOfWealthInfo', type: 'multiselect', required: true}]};

        // When the page is turned into a save request
        const params = getPageParams(BANK_ACCOUNT_ID, page, {businessSourceOfWealthInfo: ['REVENUE']}, [{businessSourceOfWealthInfo: 'REVENUE', isSourceOfFund: false}]);

        // Then revenue funds daily operations, whatever the server held
        expect(JSON.parse(params.inputs)).toEqual({sourceOfWealthList: [{businessSourceOfWealthInfo: 'REVENUE', isSourceOfFund: true}]});
    });

    it('sends every picked source with whether it funds daily operations from the daily operations page', () => {
        // Given the daily operations page answered with the loan, out of the loan and revenue picked before
        const page: DynamicFormPage = {key: 'BUSINESS_SOURCE_OF_WEALTH_INFO', content: [{key: 'sourceOfFunds', type: 'multiselect', required: true}]};

        // When the page is turned into a save request with the picked sources
        const params = getPageParams(BANK_ACCOUNT_ID, page, {sourceOfFunds: ['BUSINESS_LOAN'], businessSourceOfWealthInfo: ['BUSINESS_LOAN', 'REVENUE']});

        // Then each source says whether it funds daily operations
        expect(JSON.parse(params.inputs)).toEqual({
            sourceOfWealthList: [
                {businessSourceOfWealthInfo: 'BUSINESS_LOAN', isSourceOfFund: true},
                {businessSourceOfWealthInfo: 'REVENUE', isSourceOfFund: false},
            ],
        });
    });

    it('gives nothing for a page whose key is not a step the server accepts', () => {
        // Given a page keyed by something other than a step, which the server would answer with 400 Invalid step
        const page: DynamicFormPage = {key: 'ownership', content: [{key: 'description', type: 'text', required: true}]};

        // When the page is turned into a save request
        const pageParams = getWiseOnboardingPageParams(BANK_ACCOUNT_ID, page, {description: 'We sell bikes'});

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

    it('groups the files of a labelled field into an entry per type', () => {
        // Given the server's file keys for a source of funds, with a tax return and a bank statement, and invoices the user removed
        const documents = {BUSINESS_SOURCE_OF_WEALTH_PROOF: {[REVENUE_TAX_RETURNS]: ['kyc/1/tax.pdf'], [REVENUE_BANK_STATEMENTS]: ['kyc/1/statement.pdf'], [REVENUE_INVOICES]: []}};

        // When they are turned into draft answers
        const answers = getSavedFileAnswers(documents);

        // Then the source holds one entry per type that has files, as its upload field stores them
        expect(answers).toEqual({
            REVENUE: [
                {id: 'TAX_DOCUMENTS', fileType: 'TAX_DOCUMENTS', files: [toSavedFile('kyc/1/tax.pdf')]},
                {id: 'BANK_STATEMENT', fileType: 'BANK_STATEMENT', files: [toSavedFile('kyc/1/statement.pdf')]},
            ],
        });
    });

    it('leaves out the files of a page whose save failed', () => {
        // Given the server's file keys after one page saved and another failed, so the server still holds the failed page's older file
        const documents = {representative: {idDocument: ['kyc/1/older.jpg']}, business: {proofOfAddress: ['kyc/1/proof.pdf']}};

        // When they are turned into draft answers with the failed page skipped
        const answers = getSavedFileAnswers(documents, ['representative']);

        // Then only the saved page's files are taken, so the replacement picked on the failed page stays in the draft for the next save
        expect(answers).toEqual({proofOfAddress: [toSavedFile('kyc/1/proof.pdf')]});
    });
});
