import React from 'react';
import Badge from '@components/Badge';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

type MemberRightIconProps = {
    owner?: string;
    role?: string;
    login?: string;
};

export default function MemberRightIcon({role, owner, login}: MemberRightIconProps) {
    const {translate} = useLocalize();

    const isOwner = owner === login;
    const isAdmin = role === CONST.POLICY.ROLE.ADMIN;
    const isAuditor = role === CONST.POLICY.ROLE.AUDITOR;

    if (isOwner || isAdmin) {
        return <Badge text={isOwner ? translate('common.owner') : translate('common.admin')} />;
    }
    if (isAuditor) {
        return <Badge text={translate('common.auditor')} />;
    }
    return null;
}
