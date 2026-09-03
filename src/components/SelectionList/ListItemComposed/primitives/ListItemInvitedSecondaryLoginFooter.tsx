import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type ListItemInvitedSecondaryLoginFooterProps = {
    /** The secondary login that added the member */
    invitedSecondaryLogin: string;
};

/** Row footer naming the secondary login that added the member. Shared by the UserListItem family; the row gates rendering. */
function ListItemInvitedSecondaryLoginFooter({invitedSecondaryLogin}: ListItemInvitedSecondaryLoginFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return <Text style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>{translate('workspace.people.invitedBySecondaryLogin', invitedSecondaryLogin)}</Text>;
}

export default ListItemInvitedSecondaryLoginFooter;
