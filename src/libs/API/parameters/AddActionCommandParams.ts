import type {ComposerCommandAction} from '@src/CONST';

type AddActionCommandParams = {
    reportID: string;
    reportActionID: string;
    answerReportActionID: string;
    reportComment: string;
    actionType: ComposerCommandAction;
};

export default AddActionCommandParams;
