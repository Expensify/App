import type Form from './Form';

const INPUT_IDS = {
    TITLE: 'title',
    DESCRIPTION: 'description',
} as const;

type EditTaskForm = Form<{
    [INPUT_IDS.TITLE]: string;
    [INPUT_IDS.DESCRIPTION]: string;
}>;

export type {EditTaskForm};
export default INPUT_IDS;
