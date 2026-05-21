import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import {AgentActionButtons} from './AgentActions';
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
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    const isPendingDeletion = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const navigateToEdit = () => Navigation.navigate(ROUTES.SETTINGS_AGENTS_EDIT.getRoute(accountID));
    const errorIndicator = !!brickRoadIndicator && (
        <Icon
            src={icons.DotIndicator}
            fill={theme.danger}
        />
    );
    const actionButtons = (
        <View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.flexWrap, shouldUseNarrowLayout && styles.alignSelfStart]}>
            <AgentActionButtons
                accountID={accountID}
                login={login}
                isDisabled={isPendingDeletion}
            />
            <Button
                small
                text={translate('common.edit')}
                onPress={navigateToEdit}
                isDisabled={isPendingDeletion}
            />
        </View>
    );

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            onClose={onErrorClose}
            errorRowStyles={[styles.ph5, styles.pb5]}
            shouldHideOnDelete={false}
        >
            {shouldUseNarrowLayout ? (
                <View style={[styles.selectionListPressableItemWrapper, styles.flexColumn, styles.alignItemsStretch, styles.mb2, styles.gap3]}>
                    <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                        <PressableWithFeedback
                            style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}
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
                        </PressableWithFeedback>
                        {errorIndicator}
                    </View>
                    {actionButtons}
                </View>
            ) : (
                <View style={[styles.selectionListPressableItemWrapper, styles.mb2, styles.gap3]}>
                    <AgentInfoRow
                        accountID={accountID}
                        displayName={displayName}
                        login={login}
                        isPendingDeletion={isPendingDeletion}
                    />
                    {errorIndicator}
                    {actionButtons}
                </View>
            )}
        </OfflineWithFeedback>
    );
}

export default AgentsListRow;
