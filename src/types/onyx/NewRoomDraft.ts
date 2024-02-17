import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type Workspace = {
    id?: string;
    name?: string;
};

type Visibility = {
    value?: ValueOf<typeof CONST.REPORT.VISIBILITY>;
    label?: string;
    description?: string;
};

type WriteCapabilities = {
    value?: ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>;
    label?: string;
};

type NewRoomDraft = {
    workspace: Workspace;
    writeCapability: WriteCapabilities;
    visibility: Visibility;
};

export default NewRoomDraft;
