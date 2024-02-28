import type {RoomVisibility} from '@src/types/onyx/Report';

type UpdateRoomVisibilityParams = {
    reportID: string;
    visibility: RoomVisibility;
};

export default UpdateRoomVisibilityParams;
