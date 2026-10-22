import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import TextWithTooltip from '@components/TextWithTooltip';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

import React from 'react';
import {View} from 'react-native';

type TravelMemberRowProps = {
    accountID: number;

    /** The member's login, which their avatar is looked up by */
    login: string;

    name: string;

    /** The member's login formatted for display */
    displayLogin: string;

    /** Whether the member can book travel on the workspace */
    canUseTravel: boolean;

    pendingAction?: PendingAction;

    errors?: Errors;

    /** Whether the current user can change the member's travel access */
    canEdit: boolean;

    onToggleTravelAccess: (canUseTravel: boolean) => void;

    /** Called when the switch is pressed while the current user can't change it */
    onReadOnlyPress?: () => void | Promise<void>;

    onDismissError: () => void;
};

function TravelMemberRow({accountID, login, name, displayLogin, canUseTravel, pendingAction, errors, canEdit, onToggleTravelAccess, onReadOnlyPress, onDismissError}: TravelMemberRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            onClose={onDismissError}
            errorRowStyles={styles.mb2}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv3]}>
                <AccountAvatar
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    accountID={accountID}
                    accountEmail={login}
                    fallbackDisplayName={name}
                />
                <View style={styles.flex1}>
                    <TextWithTooltip
                        shouldShowTooltip
                        text={name}
                        style={[styles.optionDisplayName, styles.pre]}
                        numberOfLines={1}
                    />
                    <TextWithTooltip
                        shouldShowTooltip
                        text={displayLogin}
                        style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                        numberOfLines={1}
                    />
                </View>
                <Switch
                    isOn={canUseTravel}
                    onToggle={onToggleTravelAccess}
                    accessibilityLabel={`${translate('workspace.moreFeatures.travel.members.canBookTravel')}: ${name}`}
                    disabled={!canEdit}
                    showLockIcon={!canEdit}
                    disabledAction={onReadOnlyPress}
                />
            </View>
        </OfflineWithFeedback>
    );
}

export default TravelMemberRow;
