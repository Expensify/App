import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    TITLE: 'title',
    DESCRIPTION: 'description',
} as const;

type EditTaskForm = Form<{
    [INPUT_IDS.TITLE]: string;
    [INPUT_IDS.DESCRIPTION]: string;
}>;

export default EditTaskForm;
export {INPUT_IDS};
