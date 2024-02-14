import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    TITLE: 'title',
    DESCRIPTION: 'description',
} as const;

type InputIDs = ValueOf<typeof INPUT_IDS>;

type EditTaskForm = Form<
    InputIDs,
    {
        [INPUT_IDS.TITLE]: string;
        [INPUT_IDS.DESCRIPTION]: string;
    }
>;

export type {EditTaskForm};
export default INPUT_IDS;
