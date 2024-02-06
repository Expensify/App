import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    TASK_TITLE: 'taskTitle',
    TASK_DESCRIPTION: 'taskDescription',
} as const;

type NewTaskForm = Form<{
    [INPUT_IDS.TASK_TITLE]: string;
    [INPUT_IDS.TASK_DESCRIPTION]: string;
}>;

export type {NewTaskForm};
export default INPUT_IDS;
