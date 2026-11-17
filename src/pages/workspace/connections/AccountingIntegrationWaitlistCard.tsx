/**
 * A coming-soon card for an accounting integration that isn't available yet. Admins join its waitlist for the
 * workspace, and Concierge lets them know once they can connect.
 */
import UserAvatar from '@components/Avatar/UserAvatar';
import Badge from '@components/Badge';
import Button from '@components/Button';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import shouldBreakAccessibilityGrouping from '@libs/shouldBreakAccessibilityGrouping';

import {clearAccountingIntegrationWaitlistError, joinAccountingIntegrationWaitlist} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AccountingIntegrationWaitlistConnectionName} from '@src/types/onyx/AccountingIntegrationWaitlist';
import type IconAsset from '@src/types/utils/IconAsset';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

type AccountingIntegrationWaitlistCardProps = {
    connectionName: AccountingIntegrationWaitlistConnectionName;
    title: string;

    /** Local asset, or a remote logo URL */
    icon?: IconAsset | string;
    policyID: string;

    /** Stacks the card at full width instead of wrapping it by its minimum width */
    shouldUseFullWidth: boolean;
};

function AccountingIntegrationWaitlistCard({connectionName, title, icon, policyID, shouldUseFullWidth}: AccountingIntegrationWaitlistCardProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.ACCOUNTING);
    const [isOnServerWaitlist] = useOnyx(ONYXKEYS.NVP_ACCOUNTING_INTEGRATION_WAITLIST, {
        selector: (waitlist) => !!waitlist?.some((entry) => entry.connectionName === connectionName && entry.policyID === policyID),
    });
    const [request] = useOnyx(ONYXKEYS.ACCOUNTING_INTEGRATION_WAITLIST_REQUESTS, {
        selector: (requests) => requests?.[policyID]?.[connectionName],
    });
    const isOnWaitlist = !!isOnServerWaitlist && !request?.pendingAction;
    const isJoiningWaitlist = useRef(false);
    const comingSoon = translate('workspace.accounting.integrationWaitlist.comingSoon');
    const accessibilityLabel = [title, comingSoon, isOnWaitlist && translate('workspace.accounting.integrationWaitlist.onWaitlist')].filter(Boolean).join(', ');

    // Queued requests finish through Onyx, including retries after the press handler has returned, so the confirmation waits for the server to save the signup
    useEffect(() => {
        if (!isJoiningWaitlist.current || request?.pendingAction) {
            return;
        }
        if (request?.errors || !isOnServerWaitlist) {
            // The request settled without the server saving this workspace, so allow another try
            isJoiningWaitlist.current = false;
            return;
        }

        isJoiningWaitlist.current = false;
        showConfirmModal({
            title: translate('workspace.accounting.integrationWaitlist.onTheList'),
            prompt: translate('workspace.accounting.integrationWaitlist.waitlistDescription'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [isOnServerWaitlist, request?.errors, request?.pendingAction, showConfirmModal, translate]);

    const joinWaitlist = () => {
        if (isJoiningWaitlist.current || request?.pendingAction) {
            return;
        }
        if (!canWrite) {
            showReadOnlyModal();
            return;
        }
        // Prevents repeated presses before the pending request reaches this component
        isJoiningWaitlist.current = true;
        joinAccountingIntegrationWaitlist(policyID, connectionName);
    };

    return (
        <View
            style={[
                styles.workspaceSectionMoreFeaturesItem,
                styles.p0,
                styles.overflowHidden,
                // Uses width, not flexBasis, since native Yoga caches a flexBasis percentage across rotations.
                shouldUseFullWidth ? [styles.flexBasisAuto, styles.w100, StyleUtils.getMinimumWidth(0)] : styles.connectionCard,
            ]}
        >
            <OfflineWithFeedback
                errors={request?.errors}
                pendingAction={request?.pendingAction}
                onClose={() => clearAccountingIntegrationWaitlistError(policyID, connectionName)}
                errorRowStyles={[styles.ph4, styles.pb3]}
            >
                <MenuItem.Root
                    accessibilityLabel={accessibilityLabel}
                    // On iOS, disable row grouping so VoiceOver can focus the nested waitlist button.
                    shouldBeAccessible={!shouldBreakAccessibilityGrouping()}
                    style={[styles.pv4, styles.ph4]}
                >
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <UserAvatar
                                source={icon}
                                accountID={CONST.DEFAULT_NUMBER_ID}
                                // Many partner logos are transparent, so they need a white backdrop in both themes
                                imageStyles={styles.backgroundWhite}
                            />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <View style={styles.gap1}>
                                <MenuItem.Title>{title}</MenuItem.Title>
                                <Badge
                                    text={comingSoon}
                                    isCondensed
                                    badgeStyles={[styles.alignSelfStart, styles.ml0, styles.mw100]}
                                />
                            </View>
                        </MenuItem.Content>
                        <View style={[isOnWaitlist && styles.flex1, styles.justifyContentCenter]}>
                            <MenuItem.Trailing>
                                {isOnWaitlist ? (
                                    <Text style={[styles.textSupporting, styles.flexShrink1, styles.textAlignRight]}>{translate('workspace.accounting.integrationWaitlist.onWaitlist')}</Text>
                                ) : (
                                    <Button
                                        onPress={joinWaitlist}
                                        // A queued request can't finish offline, so the button is disabled rather than loading until the connection returns
                                        isDisabled={isOffline}
                                        isLoading={!isOffline && !!request?.pendingAction}
                                        style={styles.justifyContentCenter}
                                        innerStyles={!canWrite ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                                        hoverStyles={!canWrite ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                                        size={CONST.BUTTON_SIZE.SMALL}
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.JOIN_WAITLIST_BUTTON}
                                    >
                                        <Button.Text>{translate('workspace.accounting.integrationWaitlist.joinWaitlist')}</Button.Text>
                                    </Button>
                                )}
                            </MenuItem.Trailing>
                        </View>
                    </MenuItem.Row>
                </MenuItem.Root>
            </OfflineWithFeedback>
        </View>
    );
}

export default AccountingIntegrationWaitlistCard;
