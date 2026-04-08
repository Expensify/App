import React from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {GustoSyncResult} from '@libs/API/types';

type GustoSyncResultsModalProps = {
    isVisible: boolean;
    onClose: () => void;
    result?: GustoSyncResult | null;
};

function GustoSyncResultsModal({isVisible, onClose, result}: GustoSyncResultsModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const getSkippedReasonLabel = (reason: string) => {
        switch (reason) {
            case 'missingManager':
                return translate('workspace.hr.gusto.syncResults.skippedReasons.missingManager');
            case 'missingFinalApprover':
                return translate('workspace.hr.gusto.syncResults.skippedReasons.missingFinalApprover');
            case 'alreadyExists':
                return translate('workspace.hr.gusto.syncResults.skippedReasons.alreadyExists');
            default:
                return reason;
        }
    };

    const renderUsers = (users?: Array<{email: string; displayName?: string}>) => {
        if (!users?.length) {
            return <Text style={[styles.textSupporting]}>{translate('workspace.hr.gusto.syncResults.empty')}</Text>;
        }

        return users.map((user) => (
            <Text
                key={user.email}
                style={[styles.mt1]}
            >
                {user.displayName ?? user.email}
            </Text>
        ));
    };

    return (
        <ConfirmModal
            title={translate('workspace.hr.gusto.syncResults.title')}
            isVisible={isVisible}
            onConfirm={onClose}
            onCancel={onClose}
            confirmText={translate('workspace.hr.gusto.syncResults.confirmText')}
            shouldShowCancelButton={false}
            prompt={
                <View style={[styles.gap4]}>
                    <View>
                        <Text style={[styles.textLabelSupporting]}>{translate('workspace.hr.gusto.syncResults.added')}</Text>
                        {renderUsers(result?.added)}
                    </View>
                    <View>
                        <Text style={[styles.textLabelSupporting]}>{translate('workspace.hr.gusto.syncResults.removed')}</Text>
                        {renderUsers(result?.removed)}
                    </View>
                    <View>
                        <Text style={[styles.textLabelSupporting]}>{translate('workspace.hr.gusto.syncResults.skipped')}</Text>
                        {result?.skipped?.length ? (
                            result.skipped.map((user) => (
                                <View
                                    key={`${user.email}-${user.reason}`}
                                    style={[styles.mt1]}
                                >
                                    <Text>{user.displayName ?? user.email}</Text>
                                    <Text style={[styles.textSupporting]}>{getSkippedReasonLabel(user.reason)}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={[styles.textSupporting]}>{translate('workspace.hr.gusto.syncResults.empty')}</Text>
                        )}
                    </View>
                </View>
            }
        />
    );
}

export default GustoSyncResultsModal;
