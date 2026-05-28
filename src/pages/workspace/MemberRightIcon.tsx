import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Badge from '@components/Badge';
import {useListItemFocus} from '@components/SelectionList/ListItemFocusContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type MemberRightIconProps = {
    owner?: string;
    role?: string;
    login?: string;
    isAgent?: boolean;
    badgeStyles?: StyleProp<ViewStyle>;
};

export default function MemberRightIcon({role, owner, login, isAgent = false, badgeStyles}: MemberRightIconProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isFocused} = useListItemFocus();

    let badgeText: TranslationPaths | undefined;
    if (owner && owner === login) {
        badgeText = 'common.owner';
    } else if (role === CONST.POLICY.ROLE.ADMIN) {
        badgeText = 'common.admin';
    } else if (role === CONST.POLICY.ROLE.AUDITOR) {
        badgeText = 'common.auditor';
    } else if (isAgent) {
        badgeText = 'common.agent';
    }
    if (badgeText) {
        return (
            <Badge
                text={translate(badgeText)}
                badgeStyles={[isFocused && styles.badgeDefaultActive, badgeStyles]}
            />
        );
    }
    return null;
}
