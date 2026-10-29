import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormPage, DynamicFormSchema, DynamicFormSchemaField} from '@src/types/onyx';

import getContentFields from './getContentFields';
import isSupportedField from './isSupportedField';

const OWN_PAGE_TYPES = new Set<DynamicFormField['type']>(['address', 'file', 'multiselect', 'countryMultiselect', 'list']);

function needsOwnPage(field: DynamicFormField): boolean {
    if (OWN_PAGE_TYPES.has(field.type)) {
        return true;
    }
    if (field.type !== 'select') {
        return false;
    }
    return !!field.dependsOn || (field.values?.length ?? 0) > CONST.DYNAMIC_FORM.LARGE_SELECT_MIN_OPTIONS;
}

function toSlug(key: string): string {
    return key
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/^-+|-+$/g, '');
}

/**
 * Groups a flat list of fields into pages. Fields that need room (addresses, files, multi-selects, lists, dependent or large selects) get a page of their own,
 * and the rest share a page up to `MAX_FIELDS_PER_PAGE` in a row. A field with `showWhen` joins the page of its controller and does not count toward that limit.
 * The pages have no title and no key, `getPages` names them.
 */
function paginate(fields: DynamicFormSchemaField[]): DynamicFormPage[] {
    const pages: DynamicFormPage[] = [];
    const pageOfKey = new Map<string, DynamicFormPage>();
    let sharedPage: DynamicFormPage | undefined;
    let sharedQuestionCount = 0;

    for (const field of fields.filter(isSupportedField)) {
        const controllerPage = field.showWhen ? pageOfKey.get(field.showWhen.key) : undefined;
        if (controllerPage) {
            controllerPage.content.push(field);
            pageOfKey.set(field.key, controllerPage);
            continue;
        }

        if (needsOwnPage(field)) {
            const ownPage: DynamicFormPage = {key: '', content: [field]};
            pages.push(ownPage);
            pageOfKey.set(field.key, ownPage);
            sharedPage = undefined;
            continue;
        }

        if (!sharedPage || sharedQuestionCount >= CONST.DYNAMIC_FORM.MAX_FIELDS_PER_PAGE) {
            sharedPage = {key: '', content: []};
            sharedQuestionCount = 0;
            pages.push(sharedPage);
        }
        sharedPage.content.push(field);
        sharedQuestionCount++;
        pageOfKey.set(field.key, sharedPage);
    }
    return pages;
}

/** Every page's key becomes a URL-safe route segment that is unique and never the confirmation page's. Pages with no usable key get `page-N`. */
function withRouteKeys(pages: DynamicFormPage[]): DynamicFormPage[] {
    const takenKeys = new Set<string>([CONST.DYNAMIC_FORM.CONFIRMATION_PAGE_KEY]);
    return pages.map((page, index) => {
        const baseKey = toSlug(page.key) || `page-${index + 1}`;
        let key = baseKey;
        for (let suffix = 2; takenKeys.has(key); suffix++) {
            key = `${baseKey}-${suffix}`;
        }
        takenKeys.add(key);
        return {...page, key};
    });
}

/** The pages of a schema, as the server grouped them or as `paginate` builds them */
function getPages(schema: DynamicFormSchema): DynamicFormPage[] {
    return withRouteKeys('pages' in schema ? schema.pages : paginate(schema.fields));
}

/** Every field of every page, which is where a `showWhen` finds its controller */
function getAllFields(pages: DynamicFormPage[]): DynamicFormField[] {
    return pages.flatMap((page) => getContentFields(page.content).filter(isSupportedField));
}

export default paginate;
export {getAllFields, getPages};
