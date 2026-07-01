import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Badge from '@components/Badge';
import {useListItemFocus} from '@components/SelectionList/ListItemFocusContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type MemberRightIconProps = {
    owner?: string;
    role?: string;
    login?: string;
    badgeStyles?: StyleProp<ViewStyle>;
};

export default function MemberRightIcon({role, owner, login, badgeStyles}: MemberRightIconProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isFocused} = useListItemFocus();

    let badgeText = '';
    if (owner && owner === login) {
        badgeText = translate('common.owner');
    } else if (
        role === CONST.POLICY.ROLE.ADMIN ||
        role === CONST.POLICY.ROLE.AUDITOR ||
        role === CONST.POLICY.ROLE.CARD_ADMIN ||
        role === CONST.POLICY.ROLE.PEOPLE_ADMIN ||
        role === CONST.POLICY.ROLE.PAYMENTS_ADMIN
    ) {
        badgeText = translate('workspace.common.roleName', role);
    } else if (role === CONST.POLICY.ROLE.EDITOR) {
        badgeText = translate('common.editor');
    }
    if (badgeText) {
        return (
            <Badge
                text={badgeText}
                badgeStyles={[isFocused && styles.badgeDefaultActive, badgeStyles]}
            />
        );
    }
    return null;
}
