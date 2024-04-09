import type CONST from "@src/CONST";
import type { ValueOf } from "type-fest";

type UpdateGroupChatMemberRolesParams = {
    memberRoles: ValueOf<typeof CONST.REPORT.ROLE>;
    reportID: string;
};
export default UpdateGroupChatMemberRolesParams;
