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
import {createVirtualEmployee, updateVirtualEmployee} from '@libs/actions/VirtualEmployee';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {VirtualEmployee, VirtualEmployeeCapability, VirtualEmployeeEventSubscription} from '@src/types/onyx/VirtualEmployee';

type WorkspaceVirtualEmployeePageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.VIRTUAL_EMPLOYEES_EDIT>;

type CapabilityConfig = {
    key: VirtualEmployeeCapability;
    labelKey: TranslationPaths;
    descriptionKey: TranslationPaths;
};

type EventConfig = {
    key: VirtualEmployeeEventSubscription;
    labelKey: TranslationPaths;
    descriptionKey: TranslationPaths;
};

const ALL_CAPABILITIES: CapabilityConfig[] = [
    {
        key: 'can_read_transactions',
        labelKey: 'workspace.virtualEmployees.capabilities.readTransactions',
        descriptionKey: 'workspace.virtualEmployees.capabilities.readTransactionsDescription',
    },
    {
        key: 'can_read_reports',
        labelKey: 'workspace.virtualEmployees.capabilities.readReports',
        descriptionKey: 'workspace.virtualEmployees.capabilities.readReportsDescription',
    },
    {
        key: 'can_edit_transactions',
        labelKey: 'workspace.virtualEmployees.capabilities.editTransactions',
        descriptionKey: 'workspace.virtualEmployees.capabilities.editTransactionsDescription',
    },
    {
        key: 'can_send_messages',
        labelKey: 'workspace.virtualEmployees.capabilities.sendMessages',
        descriptionKey: 'workspace.virtualEmployees.capabilities.sendMessagesDescription',
    },
    {
        key: 'can_approve_reports',
        labelKey: 'workspace.virtualEmployees.capabilities.approveReports',
        descriptionKey: 'workspace.virtualEmployees.capabilities.approveReportsDescription',
    },
    {
        key: 'can_reject_reports',
        labelKey: 'workspace.virtualEmployees.capabilities.rejectReports',
        descriptionKey: 'workspace.virtualEmployees.capabilities.rejectReportsDescription',
    },
    {
        key: 'can_dismiss_violations',
        labelKey: 'workspace.virtualEmployees.capabilities.dismissViolations',
        descriptionKey: 'workspace.virtualEmployees.capabilities.dismissViolationsDescription',
    },
    {
        key: 'can_read_policy',
        labelKey: 'workspace.virtualEmployees.capabilities.readPolicy',
        descriptionKey: 'workspace.virtualEmployees.capabilities.readPolicyDescription',
    },
];

const ALL_EVENTS: EventConfig[] = [
    {
        key: 'transaction.created',
        labelKey: 'workspace.virtualEmployees.events.transactionCreated',
        descriptionKey: 'workspace.virtualEmployees.events.transactionCreatedDescription',
    },
    {
        key: 'transaction.modified',
        labelKey: 'workspace.virtualEmployees.events.transactionModified',
        descriptionKey: 'workspace.virtualEmployees.events.transactionModifiedDescription',
    },
    {
        key: 'transaction.receipt_scanned',
        labelKey: 'workspace.virtualEmployees.events.receiptScanned',
        descriptionKey: 'workspace.virtualEmployees.events.receiptScannedDescription',
    },
    {
        key: 'report.submitted',
        labelKey: 'workspace.virtualEmployees.events.reportSubmitted',
        descriptionKey: 'workspace.virtualEmployees.events.reportSubmittedDescription',
    },
    {
        key: 'report.approved',
        labelKey: 'workspace.virtualEmployees.events.reportApproved',
        descriptionKey: 'workspace.virtualEmployees.events.reportApprovedDescription',
    },
    {
        key: 'chat.mention',
        labelKey: 'workspace.virtualEmployees.events.chatMention',
        descriptionKey: 'workspace.virtualEmployees.events.chatMentionDescription',
    },
    {
        key: 'chat.message',
        labelKey: 'workspace.virtualEmployees.events.chatMessage',
        descriptionKey: 'workspace.virtualEmployees.events.chatMessageDescription',
    },
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

        if (isNew) {
            createVirtualEmployee(policyID, displayName.trim(), systemPrompt.trim(), capabilities, eventSubs);
        } else {
            updateVirtualEmployee(policyID, virtualEmployeeID, {
                displayName: displayName.trim(),
                systemPrompt: systemPrompt.trim(),
                capabilities,
                eventSubs,
            });
        }

        Navigation.goBack();
    }, [validate, isNew, policyID, displayName, systemPrompt, capabilities, eventSubs, virtualEmployeeID]);

    return (
        <ScreenWrapper testID="WorkspaceVirtualEmployeePage">
            <HeaderWithBackButton
                title={isNew ? translate('workspace.virtualEmployees.createTitle') : translate('workspace.virtualEmployees.editTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={[styles.p5, styles.pb10]}>

                {/* Name */}
                <View style={styles.mb5}>
                    <TextInput
                        label={translate('workspace.virtualEmployees.displayNameLabel')}
                        value={displayName}
                        onChangeText={setDisplayName}
                        errorText={displayNameError}
                        maxLength={100}
                    />
                </View>

                {/* System prompt */}
                <View style={styles.mb5}>
                    <TextInput
                        label={translate('workspace.virtualEmployees.systemPromptLabel')}
                        value={systemPrompt}
                        onChangeText={setSystemPrompt}
                        errorText={systemPromptError}
                        multiline
                        numberOfLines={10}
                        autoGrowHeight
                    />
                    <Text style={[styles.textMicro, styles.textSupporting, styles.mt1]}>
                        {translate('workspace.virtualEmployees.systemPromptHint')}
                    </Text>
                </View>

                {/* Divider */}
                <View style={[styles.sectionDividerLine, styles.mh0, styles.mv4]} />

                {/* Capabilities */}
                <Text style={[styles.textLabelSupporting, styles.mb1]}>{translate('workspace.virtualEmployees.capabilitiesSection')}</Text>
                <Text style={[styles.textMicro, styles.textSupporting, styles.mb4]}>{translate('workspace.virtualEmployees.capabilitiesSectionHint')}</Text>

                {ALL_CAPABILITIES.map(({key, labelKey, descriptionKey}) => (
                    <View
                        key={key}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb4]}
                    >
                        <View style={[styles.flex1, styles.mr4]}>
                            <Text style={styles.textNormal}>{translate(labelKey)}</Text>
                            <Text style={[styles.textMicro, styles.textSupporting, styles.mt1]}>{translate(descriptionKey)}</Text>
                        </View>
                        <Switch
                            isOn={capabilities.includes(key)}
                            onToggle={() => toggleCapability(key)}
                            accessibilityLabel={translate(labelKey)}
                        />
                    </View>
                ))}

                {/* Divider */}
                <View style={[styles.sectionDividerLine, styles.mh0, styles.mv4]} />

                {/* Event subscriptions */}
                <Text style={[styles.textLabelSupporting, styles.mb1]}>{translate('workspace.virtualEmployees.eventsSection')}</Text>
                <Text style={[styles.textMicro, styles.textSupporting, styles.mb4]}>{translate('workspace.virtualEmployees.eventsSectionHint')}</Text>

                {ALL_EVENTS.map(({key, labelKey, descriptionKey}) => (
                    <View
                        key={key}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb4]}
                    >
                        <View style={[styles.flex1, styles.mr4]}>
                            <Text style={styles.textNormal}>{translate(labelKey)}</Text>
                            <Text style={[styles.textMicro, styles.textSupporting, styles.mt1]}>{translate(descriptionKey)}</Text>
                        </View>
                        <Switch
                            isOn={eventSubs.includes(key)}
                            onToggle={() => toggleEvent(key)}
                            accessibilityLabel={translate(labelKey)}
                        />
                    </View>
                ))}

                {/* Save */}
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
