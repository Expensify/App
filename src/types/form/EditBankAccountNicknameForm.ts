import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    NICKNAME: 'nickname',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type EditBankAccountNicknameForm = Form<
    InputID,
    {
        [INPUT_IDS.NICKNAME]: string;
    }
>;

export type {EditBankAccountNicknameForm};
export default INPUT_IDS;
