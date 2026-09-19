import type {DynamicFormField} from '@src/types/onyx';

type DynamicFormPage = {
    /** The fields' shared `group`, shown as the page title and step name */
    name: string;

    /** URL-safe form of the name, used as the sub page route segment */
    slug: string;

    fields: DynamicFormField[];
};

function toSlug(name: string): string {
    return name
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/^-+|-+$/g, '');
}

function groupFieldsIntoPages(fields: DynamicFormField[]): DynamicFormPage[] {
    const pages: DynamicFormPage[] = [];
    for (const field of fields) {
        const page = pages.find(({name}) => name === field.group);
        if (page) {
            page.fields.push(field);
        } else {
            pages.push({name: field.group, slug: toSlug(field.group), fields: [field]});
        }
    }
    return pages;
}

export default groupFieldsIntoPages;
export type {DynamicFormPage};
