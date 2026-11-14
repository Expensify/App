import CONST from '@src/CONST';

/** Whether a focused element with this role presses itself on Enter, so the list's Enter shortcut stands aside for it. */
function isRoleHandlingOwnEnter(role: string | null | undefined): boolean {
    return [CONST.ROLE.BUTTON, CONST.ROLE.CHECKBOX, CONST.ROLE.SWITCH].some((ownEnterRole) => ownEnterRole === role);
}

export default isRoleHandlingOwnEnter;
