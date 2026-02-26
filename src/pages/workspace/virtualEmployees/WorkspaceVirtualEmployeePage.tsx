import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {VirtualEmployee, VirtualEmployeeCapability, VirtualEmployeeEventSubscription} from '@src/types/onyx/VirtualEmployee';

type WorkspaceVirtualEmployeePageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.VIRTUAL_EMPLOYEES_EDIT>;

const ALL_CAPABILITIES: Array<{key: VirtualEmployeeCapability; labelKey: TranslationPaths}> = [
    {key: 'can_read_transactions', labelKey: 'workspace.virtualEmployees.capabilities.readTransactions'},
    {key: 'can_edit_transactions', labelKey: 'workspace.virtualEmployees.capabilities.editTransactions'},
    {key: 'can_send_messages', labelKey: 'workspace.virtualEmployees.capabilities.sendMessages'},
    {key: 'can_approve_reports', labelKey: 'workspace.virtualEmployees.capabilities.approveReports'},
    {key: 'can_reject_reports', labelKey: 'workspace.virtualEmployees.capabilities.rejectReports'},
    {key: 'can_dismiss_violations', labelKey: 'workspace.virtualEmployees.capabilities.dismissViolations'},
    {key: 'can_read_policy', labelKey: 'workspace.virtualEmployees.capabilities.readPolicy'},
    {key: 'can_read_reports', labelKey: 'workspace.virtualEmployees.capabilities.readReports'},
];

const ALL_EVENTS: Array<{key: VirtualEmployeeEventSubscription; labelKey: TranslationPaths}> = [
    {key: 'transaction.created', labelKey: 'workspace.virtualEmployees.events.transactionCreated'},
    {key: 'transaction.modified', labelKey: 'workspace.virtualEmployees.events.transactionModified'},
    {key: 'transaction.receipt_scanned', labelKey: 'workspace.virtualEmployees.events.receiptScanned'},
    {key: 'report.submitted', labelKey: 'workspace.virtualEmployees.events.reportSubmitted'},
    {key: 'report.approved', labelKey: 'workspace.virtualEmployees.events.reportApproved'},
    {key: 'chat.mention', labelKey: 'workspace.virtualEmployees.events.chatMention'},
    {key: 'chat.message', labelKey: 'workspace.virtualEmployees.events.chatMessage'},
];

const MIN_SYSTEM_PROMPT_LENGTH = 20;

function WorkspaceVirtualEmployeePage({route}: WorkspaceVirtualEmployeePageProps) {
    const {policyID, virtualEmployeeID} = route.params;
    const isNew = virtualEmployeeID === 'new';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [virtualEmployeesCollection] = useOnyx(`${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`);

    const existingVE: VirtualEmployee | undefined = useMemo(() => {
        if (isNew || !virtualEmployeesCollection) {
            return undefined;
        }
        return Object.values(virtualEmployeesCollection).find((ve): ve is VirtualEmployee => !!ve && ve.id === virtualEmployeeID);
    }, [isNew, virtualEmployeesCollection, virtualEmployeeID]);

    const [displayName, setDisplayName] = useState(existingVE?.displayName ?? '');
    const [systemPrompt, setSystemPrompt] = useState(existingVE?.systemPrompt ?? '');
    const [capabilities, setCapabilities] = useState<VirtualEmployeeCapability[]>(existingVE?.capabilities ?? []);
    const [eventSubs, setEventSubs] = useState<VirtualEmployeeEventSubscription[]>(existingVE?.eventSubs ?? []);

    const [displayNameError, setDisplayNameError] = useState('');
    const [systemPromptError, setSystemPromptError] = useState('');

    const toggleCapability = useCallback((cap: VirtualEmployeeCapability) => {
        setCapabilities((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]));
    }, []);

    const toggleEvent = useCallback((event: VirtualEmployeeEventSubscription) => {
        setEventSubs((prev) => (prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]));
    }, []);

    const validate = useCallback((): boolean => {
        let isValid = true;

        if (!displayName.trim()) {
            setDisplayNameError(translate('workspace.virtualEmployees.errors.displayNameRequired'));
            isValid = false;
        } else {
            setDisplayNameError('');
        }

        if (systemPrompt.trim().length < MIN_SYSTEM_PROMPT_LENGTH) {
            setSystemPromptError(translate('workspace.virtualEmployees.errors.systemPromptMinLength', {minLength: MIN_SYSTEM_PROMPT_LENGTH}));
            isValid = false;
        } else {
            setSystemPromptError('');
        }

        return isValid;
    }, [displayName, systemPrompt, translate]);

    const handleSave = useCallback(() => {
        if (!validate()) {
            return;
        }

        // TODO: Wire up to createVirtualEmployee / updateVirtualEmployee actions when available
        // const params = {
        //     policyID,
        //     displayName: displayName.trim(),
        //     systemPrompt: systemPrompt.trim(),
        //     capabilities,
        //     eventSubs,
        // };

        Navigation.goBack();
    }, [validate]);

    return (
        <ScreenWrapper testID="WorkspaceVirtualEmployeePage">
            <HeaderWithBackButton
                title={isNew ? translate('workspace.virtualEmployees.createTitle') : translate('workspace.virtualEmployees.editTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={[styles.p5, styles.pb10]}>
                <View style={styles.mb5}>
                    <TextInput
                        label={translate('workspace.virtualEmployees.displayNameLabel')}
                        value={displayName}
                        onChangeText={setDisplayName}
                        errorText={displayNameError}
                        maxLength={100}
                    />
                </View>

                <View style={styles.mb5}>
                    <TextInput
                        label={translate('workspace.virtualEmployees.systemPromptLabel')}
                        value={systemPrompt}
                        onChangeText={setSystemPrompt}
                        errorText={systemPromptError}
                        multiline
                        numberOfLines={6}
                        autoGrowHeight
                    />
                    <Text style={[styles.textMicro, styles.textSupporting, styles.mt1]}>
                        {translate('workspace.virtualEmployees.systemPromptHint')}
                    </Text>
                </View>

                <Text style={[styles.textLabelSupporting, styles.mb3]}>{translate('workspace.virtualEmployees.capabilitiesSection')}</Text>
                {ALL_CAPABILITIES.map(({key, labelKey}) => (
                    <View
                        key={key}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb3]}
                    >
                        <Text style={styles.flex1}>{translate(labelKey)}</Text>
                        <Switch
                            isOn={capabilities.includes(key)}
                            onToggle={() => toggleCapability(key)}
                        />
                    </View>
                ))}

                <Text style={[styles.textLabelSupporting, styles.mb3, styles.mt5]}>{translate('workspace.virtualEmployees.eventsSection')}</Text>
                {ALL_EVENTS.map(({key, labelKey}) => (
                    <View
                        key={key}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb3]}
                    >
                        <Text style={styles.flex1}>{translate(labelKey)}</Text>
                        <Switch
                            isOn={eventSubs.includes(key)}
                            onToggle={() => toggleEvent(key)}
                        />
                    </View>
                ))}

                <View style={styles.mt5}>
                    <Button
                        success
                        text={isNew ? translate('workspace.virtualEmployees.create') : translate('common.save')}
                        onPress={handleSave}
                        isDisabled={isOffline}
                        large
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

WorkspaceVirtualEmployeePage.displayName = 'WorkspaceVirtualEmployeePage';

export default WorkspaceVirtualEmployeePage;
