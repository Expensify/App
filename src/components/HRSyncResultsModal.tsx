import React, {useState} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type HrSyncResult from '@libs/API/HrSyncResult';
import {getConnectedHRProvider} from '@libs/HRUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Button from './Button';
import FixedFooter from './FixedFooter';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import Modal from './Modal';
import type {ModalProps} from './Modal/Global/ModalContext';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import ScrollView from './ScrollView';
import Text from './Text';

type HRSyncResultsModalProps = ModalProps & {
    /** Sync result returned by the completed HR sync job */
    result: HrSyncResult;

    /** ID of the policy associated with this sync */
    policyID: string;
};

function HRSyncResultsModal({result, policyID, closeModal}: HRSyncResultsModalProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const illustrations = useMemoizedLazyIllustrations(['SyncUsers']);
    const [isSkippedSectionExpanded, setIsSkippedSectionExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const [providerDisplayName = ''] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: (policy) => getConnectedHRProvider(policy)?.displayName ?? '',
    });
    const addedCount = result.addedEmployeesCount ?? 0;
    const removedCount = result.removedEmployeesCount ?? 0;
    const skippedCount = result.skippedEmployees?.length ?? 0;

    const hideModal = () => setIsVisible(false);

    const renderResultSummary = (label: string, count: number) => (
        <View style={[styles.mb6]}>
            <Text style={[styles.textSupporting, styles.mb1]}>{label}</Text>
            <Text style={[styles.textNormalThemeText, styles.textStrong]}>{translate('workspace.hr.syncResults.employeeCount', {count})}</Text>
        </View>
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={hideModal}
            onModalHide={closeModal}
            shouldHandleNavigationBack
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View
                testID="HRSyncResultsModal"
                style={[styles.flex1, styles.appBG]}
            >
                <HeaderWithBackButton
                    title={translate('workspace.hr.syncResults.title', providerDisplayName)}
                    onBackButtonPress={hideModal}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb8]}>
                    <View style={[styles.alignItemsCenter, styles.mt4, styles.mb4, styles.pRelative]}>
                        <Icon
                            src={illustrations.SyncUsers}
                            width={68}
                            height={68}
                        />
                    </View>
                    <Text style={[styles.textHeadlineH1, styles.mb8]}>{translate('workspace.hr.syncResults.successTitle', providerDisplayName)}</Text>
                    {renderResultSummary(translate('workspace.hr.syncResults.added'), addedCount)}
                    {renderResultSummary(translate('workspace.hr.syncResults.removed'), removedCount)}
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('workspace.hr.syncResults.skipped')}
                        sentryLabel="HRSyncResultsModal-SkippedEmployees"
                        role={CONST.ROLE.BUTTON}
                        onPress={() => setIsSkippedSectionExpanded((isExpanded) => !isExpanded)}
                        style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}
                    >
                        <View>
                            <Text style={[styles.textSupporting, styles.mb1]}>{translate('workspace.hr.syncResults.skipped')}</Text>
                            <Text style={[styles.textNormalThemeText, styles.textStrong]}>{translate('workspace.hr.syncResults.employeeCount', {count: skippedCount})}</Text>
                        </View>
                        <Icon
                            src={icons.DownArrow}
                            fill={theme.icon}
                            additionalStyles={isSkippedSectionExpanded ? {transform: [{rotate: '180deg'}]} : undefined}
                        />
                    </PressableWithoutFeedback>
                    {isSkippedSectionExpanded &&
                        result.skippedEmployees?.map((employee) => (
                            <View
                                key={employee.id}
                                style={[styles.mt4]}
                            >
                                <Text style={[styles.textNormalThemeText, styles.textStrong]}>{employee.name}</Text>
                                <Text style={[styles.textSupporting]}>{employee.reason}</Text>
                            </View>
                        ))}
                </ScrollView>
                <FixedFooter addBottomSafeAreaPadding>
                    <Button
                        large
                        success
                        text={translate('common.buttonConfirm')}
                        onPress={hideModal}
                    />
                </FixedFooter>
            </View>
        </Modal>
    );
}

export default HRSyncResultsModal;
