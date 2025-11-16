import type {AttachmentModalScreensParamList} from '@libs/Navigation/types';
import type {AttachmentModalScreenBaseParams, AttachmentModalScreenType} from '@pages/media/AttachmentModalScreen/types';
import type Modify from '@src/types/utils/Modify';

/**
 * The navigation params a specific attachment modal screen.
 */
type AttachmentModalScreenParams<Screen extends AttachmentModalScreenType> = Modify<AttachmentModalScreenBaseParams, AttachmentModalScreensParamList[Screen]>;

export default AttachmentModalScreenParams;
