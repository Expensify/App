import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    TASK_TITLE: 'taskTitle',
    TASK_DESCRIPTION: 'taskDescription',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type NewTaskForm = Form<
    InputIDs,
    {
        [INPUT_IDS.TASK_TITLE]: string;
        [INPUT_IDS.TASK_DESCRIPTION]: string;
    }
>;

export type {NewTaskForm};
export default INPUT_IDS;
