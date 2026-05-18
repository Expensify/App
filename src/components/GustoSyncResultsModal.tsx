import React, {useState} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {GustoSyncResult} from '@libs/API/GustoSyncResult';
import CONST from '@src/CONST';
import Button from './Button';
import FixedFooter from './FixedFooter';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import Modal from './Modal';
import type {ModalProps} from './Modal/Global/ModalContext';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import ScrollView from './ScrollView';
import Text from './Text';

type GustoSyncResultsModalProps = ModalProps & {
    /** Sync result returned by the completed Gusto sync job */
    result: GustoSyncResult;
};

function GustoSyncResultsModal({result, closeModal}: GustoSyncResultsModalProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const illustrations = useMemoizedLazyIllustrations(['SyncUsers']);
    const [isSkippedSectionExpanded, setIsSkippedSectionExpanded] = useState(false);

    const addedCount = result.addedEmployeesCount ?? 0;
    const removedCount = result.removedEmployeesCount ?? 0;
    const skippedCount = result.skippedEmployees?.length ?? 0;
    const closeResultsModal = () => closeModal();

    const renderResultSummary = (label: string, count: number) => (
        <View style={[styles.mb6]}>
            <Text style={[styles.textSupporting, styles.mb1]}>{label}</Text>
            <Text style={[styles.textNormalThemeText, styles.textStrong]}>{translate('workspace.hr.gusto.syncResults.employeeCount', {count})}</Text>
        </View>
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible
            onClose={closeResultsModal}
            shouldHandleNavigationBack
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View
                testID="GustoSyncResultsModal"
                style={[styles.flex1, styles.appBG]}
            >
                <HeaderWithBackButton
                    title={translate('workspace.hr.gusto.syncResults.title')}
                    onBackButtonPress={closeResultsModal}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb8]}>
                    <View style={[styles.alignItemsCenter, styles.mt4, styles.mb4, styles.pRelative]}>
                        <Icon
                            src={illustrations.SyncUsers}
                            width={68}
                            height={68}
                        />
                    </View>
                    <Text style={[styles.textHeadlineH1, styles.mb8]}>{translate('workspace.hr.gusto.syncResults.successTitle')}</Text>
                    {renderResultSummary(translate('workspace.hr.gusto.syncResults.added'), addedCount)}
                    {renderResultSummary(translate('workspace.hr.gusto.syncResults.removed'), removedCount)}
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('workspace.hr.gusto.syncResults.skipped')}
                        sentryLabel="GustoSyncResultsModal-SkippedEmployees"
                        role={CONST.ROLE.BUTTON}
                        onPress={() => setIsSkippedSectionExpanded((isExpanded) => !isExpanded)}
                        style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}
                    >
                        <View>
                            <Text style={[styles.textSupporting, styles.mb1]}>{translate('workspace.hr.gusto.syncResults.skipped')}</Text>
                            <Text style={[styles.textNormalThemeText, styles.textStrong]}>{translate('workspace.hr.gusto.syncResults.employeeCount', {count: skippedCount})}</Text>
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
                        onPress={closeResultsModal}
                    />
                </FixedFooter>
            </View>
        </Modal>
    );
}

export default GustoSyncResultsModal;
