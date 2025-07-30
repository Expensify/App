import React from 'react';
import Badge from '@components/Badge';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type MemberRightIconProps = {
    owner?: string;
    role?: string;
    login?: string;
};

export default function MemberRightIcon({role, owner, login}: MemberRightIconProps) {
    const {translate} = useLocalize();

    let badgeText: TranslationPaths | undefined;
    if (owner && owner === login) {
        badgeText = 'common.owner';
    } else if (role === CONST.POLICY.ROLE.ADMIN) {
        badgeText = 'common.admin';
    } else if (role === CONST.POLICY.ROLE.AUDITOR) {
        badgeText = 'common.auditor';
    }
    if (badgeText) {
        return <Badge text={translate(badgeText)} />;
    }
    return null;
}
