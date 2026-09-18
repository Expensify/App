import type {WiseField} from '@src/types/onyx';

type DynamicFormPage = {
    /** The fields' shared `group`, used as the sub page name */
    name: string;
    fields: WiseField[];
};

function groupFieldsIntoPages(fields: WiseField[]): DynamicFormPage[] {
    const pages: DynamicFormPage[] = [];
    for (const field of fields) {
        const page = pages.find(({name}) => name === field.group);
        if (page) {
            page.fields.push(field);
        } else {
            pages.push({name: field.group, fields: [field]});
        }
    }
    return pages;
}

export default groupFieldsIntoPages;
export type {DynamicFormPage};
