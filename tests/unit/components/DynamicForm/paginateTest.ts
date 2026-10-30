import getPageTitle, {getPageSectionName, isPageShown} from '@components/DynamicForm/utils/getPageTitle';
import paginate, {getAllFields, getPages} from '@components/DynamicForm/utils/paginate';

import type {DynamicFormField, DynamicFormPage, DynamicFormSchemaField, DynamicFormTextField} from '@src/types/onyx';

import {translateLocal} from '../../../utils/TestHelper';

function text(key: string, extra: Partial<DynamicFormTextField> = {}): DynamicFormTextField {
    return {key, type: 'text', required: true, label: key, ...extra};
}

function options(count: number) {
    return Array.from({length: count}, (_, index) => ({key: `o${index}`, label: `o${index}`}));
}

function keysOf(pages: DynamicFormPage[]): string[][] {
    return pages.map((page) => page.content.map((item) => item.key));
}

describe('paginate', () => {
    it('puts each own-page type on a page of its own', () => {
        // Given one field of every type that needs room
        const fields: DynamicFormField[] = [
            {key: 'address', type: 'address', required: true},
            {key: 'file', type: 'file', required: true},
            {key: 'multi', type: 'multiselect', required: true, values: options(2)},
            {key: 'countries', type: 'countryMultiselect', required: true},
            {key: 'dependent', type: 'select', required: true, dependsOn: {key: 'country', valuesBy: {}}},
        ];

        // When the fields are paginated
        const pages = paginate(fields);

        // Then none of them shares a page, since each needs the whole screen
        expect(keysOf(pages)).toEqual([['address'], ['file'], ['multi'], ['countries'], ['dependent']]);
    });

    it('keeps a small select with the other short questions but moves a large one out', () => {
        // Given a small select and a select with more options than the threshold
        const small: DynamicFormField = {key: 'small', type: 'select', required: true, values: options(3)};
        const large: DynamicFormField = {key: 'large', type: 'select', required: true, values: options(11)};

        // When they are paginated between two text fields
        const pages = paginate([text('a'), small, large, text('b')]);

        // Then the large select, which opens a searchable list, is alone and breaks the run
        expect(keysOf(pages)).toEqual([['a', 'small'], ['large'], ['b']]);
    });

    it('starts a new page after four questions in a row', () => {
        // Given five short questions
        const fields = [text('a'), text('b'), text('c'), text('d'), text('e')];

        // When they are split into pages
        const pages = paginate(fields);

        // Then the fifth does not fit the shared page
        expect(keysOf(pages)).toEqual([['a', 'b', 'c', 'd'], ['e']]);
    });

    it('keeps a field revealed by its controller on the controller page without counting it', () => {
        // Given four questions where the second reveals a fifth field
        const revealed = text('other', {showWhen: {key: 'b', equals: ['x']}});

        // When they are paginated
        const pages = paginate([text('a'), text('b'), revealed, text('c'), text('d')]);

        // Then all of them stay on one page, since the revealed field is not a question of its own
        expect(keysOf(pages)).toEqual([['a', 'b', 'other', 'c', 'd']]);
    });

    it('keeps the fields an own-page controller reveals with it', () => {
        // Given an own-page select that reveals a text field
        const select: DynamicFormField = {key: 'dep', type: 'select', required: true, dependsOn: {key: 'x', valuesBy: {}}};

        // When paginated with a field after the revealed one
        const pages = paginate([select, text('why', {showWhen: {key: 'dep', equals: ['y']}}), text('z')]);

        // Then the revealed field follows its controller and the next question starts a new page
        expect(keysOf(pages)).toEqual([['dep', 'why'], ['z']]);
    });

    it('leaves out fields of an unknown type', () => {
        // Given a field of a type this App version does not know
        const unknown = {key: 'x', type: 'hologram', required: true};

        // When paginated
        const pages = paginate([unknown, text('a')]);

        // Then it does not produce an empty page
        expect(keysOf(pages)).toEqual([['a']]);
    });
});

describe('getPages', () => {
    it('names pages built from fields page-N', () => {
        // Given a flat schema
        const fields: DynamicFormSchemaField[] = [text('a'), {key: 'address', type: 'address', required: true}];

        // When its pages are built
        const pages = getPages({fields});

        // Then the pages get stable keys
        expect(pages.map((page) => page.key)).toEqual(['page-1', 'page-2']);
    });

    it('turns keys into URL-safe slugs, reserves confirm and makes keys unique', () => {
        // Given pages whose keys are not URL-safe, collide, or take the confirmation route
        const content = [text('a')];
        const schemaPages: DynamicFormPage[] = [
            {key: 'Bank Info', content},
            {key: 'bank-info', content},
            {key: 'confirm', content},
            {key: '###', content},
        ];

        // When the schema's pages are read
        const pages = getPages({pages: schemaPages});

        // Then each is a unique route segment
        expect(pages.map((page) => page.key)).toEqual(['bank-info', 'bank-info-2', 'confirm-2', 'page-4']);
    });
});

describe('getPageTitle', () => {
    it('prefers the page title, translated when it has a key', () => {
        // Given a page with a titleKey
        const page = {key: 'p', titleKey: 'common.next', content: [text('a')]} as DynamicFormPage;

        // When its title is read
        const title = getPageTitle(page, {}, translateLocal);

        // Then the translation is used
        expect(title).toBe(translateLocal('common.next'));
    });

    it('falls back to the label of the lone question, ignoring a field it reveals', () => {
        // Given an untitled page with one question and a field it reveals
        const page: DynamicFormPage = {key: 'p', content: [text('a', {label: 'Alpha'}), text('b', {label: 'Beta', showWhen: {key: 'a', equals: ['x']}})]};

        // When the revealed field shows
        const title = getPageTitle(page, {a: 'x'}, translateLocal);

        // Then the title is still the question's label
        expect(title).toBe('Alpha');
    });

    it("prefers the lone question's wording over its label", () => {
        // Given an untitled page whose only question has its wording as a question
        const page: DynamicFormPage = {key: 'p', content: [text('a', {label: 'Account number', question: "What's your account number?"})]};

        // When its title is read
        const title = getPageTitle(page, {}, translateLocal);

        // Then the headline asks the question, so it does not repeat the input's label
        expect(title).toBe("What's your account number?");
    });

    it('has no title when there are several questions', () => {
        // Given an untitled page with several visible questions
        const page: DynamicFormPage = {key: 'p', content: [text('a', {label: 'Alpha', showWhen: {key: 'z', equals: ['1']}}), text('b', {label: 'Beta'}), text('c', {label: 'Gamma'})]};

        // When its title is read
        const title = getPageTitle(page, {}, translateLocal);

        // Then it is blank, since no one question names the page
        expect(title).toBe('');
    });
});

describe('getPageSectionName', () => {
    it('uses the page title', () => {
        // Given a titled page
        const page: DynamicFormPage = {key: 'p', title: 'Bank details', content: [text('a', {label: 'Alpha'})]};

        // When its section name is read
        const name = getPageSectionName(page, {}, translateLocal);

        // Then it is the page title
        expect(name).toBe('Bank details');
    });

    it("uses the lone question's wording on an untitled page", () => {
        // Given an untitled page whose only question has its wording
        const page: DynamicFormPage = {key: 'p', content: [text('a', {label: 'Account number', question: "What's your account number?"})]};

        // When its section name is read
        const name = getPageSectionName(page, {}, translateLocal);

        // Then it is that wording
        expect(name).toBe("What's your account number?");
    });

    it('never uses a label', () => {
        // Given untitled pages with one question and with several, none with its wording
        const lonePage: DynamicFormPage = {key: 'p', content: [text('a', {label: 'Account number'})]};
        const sharedPage: DynamicFormPage = {key: 'q', content: [text('a', {label: 'Account number'}), text('b', {label: 'Settlement currency'})]};

        // When their section names are read
        const names = [getPageSectionName(lonePage, {}, translateLocal), getPageSectionName(sharedPage, {}, translateLocal)];

        // Then both are blank, since the label is already on the row below and would only name one of several rows
        expect(names).toEqual(['', '']);
    });
});

describe('isPageShown', () => {
    it('hides a page whose own showWhen does not match, using a field of another page', () => {
        // Given a page shown only for business, controlled from another page
        const type = text('type');
        const page: DynamicFormPage = {key: 'biz', showWhen: {key: 'type', equals: ['BUSINESS']}, content: [text('ein')]};
        const allFields = getAllFields([{key: 'first', content: [type]}, page]);

        // When the user answers private, and then business
        const isShownForPrivate = isPageShown(page, {type: 'PRIVATE'}, allFields);
        const isShownForBusiness = isPageShown(page, {type: 'BUSINESS'}, allFields);

        // Then it follows the answer
        expect(isShownForPrivate).toBe(false);
        expect(isShownForBusiness).toBe(true);
    });

    it('hides a page with no visible field', () => {
        // Given a page whose only field is hidden
        const page: DynamicFormPage = {key: 'p', content: [text('a', {showWhen: {key: 'z', equals: ['1']}})]};

        // When the flow checks whether to show it
        const isShown = isPageShown(page, {}, getAllFields([page]));

        // Then the page is skipped
        expect(isShown).toBe(false);
    });
});
