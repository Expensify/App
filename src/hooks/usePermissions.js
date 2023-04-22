import {useMemo} from 'react';
import ONYXKEYS from '../ONYXKEYS';
import useOnyx from './useOnyx';
import Permissions from '../libs/Permissions';

export default function usePermissions() {
    const betas = useOnyx(ONYXKEYS.BETAS, []);
    return useMemo(() => ({
        canUseChronos: Permissions.canUseChronos(betas),
        canUseIOU: Permissions.canUseIOU(betas),
        canUsePayWithExpensify: Permissions.canUsePayWithExpensify(betas),
        canUseDefaultRooms: Permissions.canUseDefaultRooms(betas),
        canUseIOUSend: Permissions.canUseIOUSend(betas),
        canUseWallet: Permissions.canUseWallet(betas),
        canUseCommentLinking: Permissions.canUseCommentLinking(betas),
        canUsePolicyRooms: Permissions.canUsePolicyRooms(betas),
        canUsePolicyExpenseChat: Permissions.canUsePolicyExpenseChat(betas),
        canUsePasswordlessLogins: Permissions.canUsePasswordlessLogins(betas),
        canUseTasks: Permissions.canUseTasks(betas),
    }), [betas]);
};
