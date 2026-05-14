import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceCompanyCardFeedName = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: string;
    }
>;

// eslint-disable-next-line import/prefer-default-export
export type {WorkspaceCompanyCardFeedName};
