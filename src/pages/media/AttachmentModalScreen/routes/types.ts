import type {AttachmentModalScreensParamList} from '@libs/Navigation/types';
import type {AttachmentModalScreenBaseParams} from '@pages/media/AttachmentModalScreen/types';
import type Modify from '@src/types/utils/Modify';
import type {AttachmentModalScreenType} from '..';

type AttachmentModalScreenParams<Screen extends AttachmentModalScreenType> = Modify<AttachmentModalScreenBaseParams, AttachmentModalScreensParamList[Screen]>;

export default AttachmentModalScreenParams;
