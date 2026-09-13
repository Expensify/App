import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

type MissingWorkspacesIntroProps = {
    /** Login of the delegate the copy is about */
    delegate: string;

    /** The current user administers some of the missing workspaces, so they can invite the delegate themselves */
    hasAdminWorkspaces: boolean;

    /** Some of the missing workspaces are administered by somebody else, whose admins the backend emails instead */
    hasNonAdminWorkspaces: boolean;
};

function MissingWorkspacesIntro({delegate, hasAdminWorkspaces, hasNonAdminWorkspaces}: MissingWorkspacesIntroProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();

    // Format SMS delegates as phone numbers rather than raw @expensify.sms logins, and escape the result since this copy is rendered as HTML.
    const escapedDelegate = Str.htmlEncode(formatPhoneNumber(delegate));
    let copy: string;
    if (!hasAdminWorkspaces) {
        copy = translate('statusPage.vacationDelegate.notAMemberAdminsWillBeAsked', escapedDelegate);
    } else if (hasNonAdminWorkspaces) {
        copy = translate('statusPage.vacationDelegate.notAMemberMixed', escapedDelegate);
    } else {
        copy = translate('statusPage.vacationDelegate.notAMemberInviteThemNow', escapedDelegate);
    }

    return (
        <View style={styles.renderHTML}>
            <RenderHTML html={copy} />
        </View>
    );
}

MissingWorkspacesIntro.displayName = 'MissingWorkspacesIntro';

export default MissingWorkspacesIntro;
