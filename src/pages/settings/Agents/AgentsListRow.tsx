import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {connect} from '@libs/actions/Delegate';
import {navigateToAndOpenReportWithAccountIDs} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import AgentInfoRow from './AgentInfoRow';

type AgentsListRowProps = {
    /** Account ID of the agent */
    accountID: number;

    /** Display name of the agent */
    displayName: string;

    /** Login email of the agent */
    login: string;

    /** Pending action for offline feedback */
    pendingAction?: PendingAction | null;

    /** Errors to display on the row */
    errors?: Errors | null;

    /** Called when the user dismisses the error */
    onErrorClose?: () => void;

    /** Whether to show the red error dot indicator */
    brickRoadIndicator?: typeof CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR | null;
};

function AgentsListRow({accountID, displayName, login, pendingAction, errors, onErrorClose, brickRoadIndicator}: AgentsListRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'ChatBubble', 'UserPlus']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const isPendingDeletion = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const navigateToEdit = () => Navigation.navigate(ROUTES.SETTINGS_AGENTS_EDIT.getRoute(accountID));
    const handleChatPress = () => {
        navigateToAndOpenReportWithAccountIDs([accountID], currentUserPersonalDetails.accountID, introSelected, isSelfTourViewed, betas, personalDetails);
    };
    const handleCopilotPress = () => {
        connect({email: login, delegatedAccess: account?.delegatedAccess, credentials, session, activePolicyID});
    };

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            onClose={onErrorClose}
            errorRowStyles={[styles.ph5, styles.pb5]}
            shouldHideOnDelete={false}
        >
            {shouldUseNarrowLayout ? (
                <PressableWithFeedback
                    style={[styles.selectionListPressableItemWrapper, styles.mb2, styles.gap3]}
                    onPress={navigateToEdit}
                    accessibilityLabel={displayName}
                    role={CONST.ROLE.BUTTON}
                    sentryLabel="AgentsListRow-Edit"
                    disabled={isPendingDeletion}
                >
                    <AgentInfoRow
                        accountID={accountID}
                        displayName={displayName}
                        login={login}
                        isPendingDeletion={isPendingDeletion}
                    />
                    {!!brickRoadIndicator && (
                        <Icon
                            src={icons.DotIndicator}
                            fill={theme.danger}
                        />
                    )}
                </PressableWithFeedback>
            ) : (
                <View style={[styles.selectionListPressableItemWrapper, styles.mb2, styles.gap3]}>
                    <AgentInfoRow
                        accountID={accountID}
                        displayName={displayName}
                        login={login}
                        isPendingDeletion={isPendingDeletion}
                    />
                    {!!brickRoadIndicator && (
                        <Icon
                            src={icons.DotIndicator}
                            fill={theme.danger}
                        />
                    )}
                    <Button
                        small
                        icon={icons.ChatBubble}
                        onPress={handleChatPress}
                        isDisabled={isPendingDeletion}
                    />
                    <Button
                        small
                        icon={icons.UserPlus}
                        onPress={handleCopilotPress}
                        isDisabled={isPendingDeletion}
                    />
                    <Button
                        small
                        text={translate('common.edit')}
                        onPress={navigateToEdit}
                        isDisabled={isPendingDeletion}
                    />
                </View>
            )}
        </OfflineWithFeedback>
    );
}

export default AgentsListRow;
