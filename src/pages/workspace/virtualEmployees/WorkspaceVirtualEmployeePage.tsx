import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {createVirtualEmployee, updateVirtualEmployee} from '@libs/actions/VirtualEmployee';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {VirtualEmployee, VirtualEmployeeCapability, VirtualEmployeeEventSubscription} from '@src/types/onyx/VirtualEmployee';
import ToggleSettingOptionRow from '../workflows/ToggleSettingsOptionRow';

type WorkspaceVirtualEmployeePageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.VIRTUAL_EMPLOYEES_EDIT>;

type CapabilityConfig = {
    key: VirtualEmployeeCapability;
    illustrationKey:
        | 'MagnifyingGlassMoney'
        | 'Binoculars'
        | 'Pencil'
        | 'CommentBubbles'
        | 'Approval'
        | 'Alert'
        | 'CheckmarkCircle'
        | 'Gears';
    labelKey: TranslationPaths;
    descriptionKey: TranslationPaths;
};

type EventConfig = {
    key: VirtualEmployeeEventSubscription;
    illustrationKey: 'FastMoney' | 'Pencil' | 'EnvelopeReceipt' | 'Hourglass' | 'ThumbsUpStars' | 'ConciergeBubble' | 'ChatBubbles';
    labelKey: TranslationPaths;
    descriptionKey: TranslationPaths;
};

const ALL_CAPABILITIES: CapabilityConfig[] = [
    {
        key: 'can_read_transactions',
        illustrationKey: 'MagnifyingGlassMoney',
        labelKey: 'workspace.virtualEmployees.capabilities.readTransactions',
        descriptionKey: 'workspace.virtualEmployees.capabilities.readTransactionsDescription',
    },
    {
        key: 'can_read_reports',
        illustrationKey: 'Binoculars',
        labelKey: 'workspace.virtualEmployees.capabilities.readReports',
        descriptionKey: 'workspace.virtualEmployees.capabilities.readReportsDescription',
    },
    {
        key: 'can_edit_transactions',
        illustrationKey: 'Pencil',
        labelKey: 'workspace.virtualEmployees.capabilities.editTransactions',
        descriptionKey: 'workspace.virtualEmployees.capabilities.editTransactionsDescription',
    },
    {
        key: 'can_send_messages',
        illustrationKey: 'CommentBubbles',
        labelKey: 'workspace.virtualEmployees.capabilities.sendMessages',
        descriptionKey: 'workspace.virtualEmployees.capabilities.sendMessagesDescription',
    },
    {
        key: 'can_approve_reports',
        illustrationKey: 'Approval',
        labelKey: 'workspace.virtualEmployees.capabilities.approveReports',
        descriptionKey: 'workspace.virtualEmployees.capabilities.approveReportsDescription',
    },
    {
        key: 'can_reject_reports',
        illustrationKey: 'Alert',
        labelKey: 'workspace.virtualEmployees.capabilities.rejectReports',
        descriptionKey: 'workspace.virtualEmployees.capabilities.rejectReportsDescription',
    },
    {
        key: 'can_dismiss_violations',
        illustrationKey: 'CheckmarkCircle',
        labelKey: 'workspace.virtualEmployees.capabilities.dismissViolations',
        descriptionKey: 'workspace.virtualEmployees.capabilities.dismissViolationsDescription',
    },
    {
        key: 'can_read_policy',
        illustrationKey: 'Gears',
        labelKey: 'workspace.virtualEmployees.capabilities.readPolicy',
        descriptionKey: 'workspace.virtualEmployees.capabilities.readPolicyDescription',
    },
];

const ALL_EVENTS: EventConfig[] = [
    {
        key: 'transaction.created',
        illustrationKey: 'FastMoney',
        labelKey: 'workspace.virtualEmployees.events.transactionCreated',
        descriptionKey: 'workspace.virtualEmployees.events.transactionCreatedDescription',
    },
    {
        key: 'transaction.modified',
        illustrationKey: 'Pencil',
        labelKey: 'workspace.virtualEmployees.events.transactionModified',
        descriptionKey: 'workspace.virtualEmployees.events.transactionModifiedDescription',
    },
    {
        key: 'transaction.receipt_scanned',
        illustrationKey: 'EnvelopeReceipt',
        labelKey: 'workspace.virtualEmployees.events.receiptScanned',
        descriptionKey: 'workspace.virtualEmployees.events.receiptScannedDescription',
    },
    {
        key: 'report.submitted',
        illustrationKey: 'Hourglass',
        labelKey: 'workspace.virtualEmployees.events.reportSubmitted',
        descriptionKey: 'workspace.virtualEmployees.events.reportSubmittedDescription',
    },
    {
        key: 'report.approved',
        illustrationKey: 'ThumbsUpStars',
        labelKey: 'workspace.virtualEmployees.events.reportApproved',
        descriptionKey: 'workspace.virtualEmployees.events.reportApprovedDescription',
    },
    {
        key: 'chat.mention',
        illustrationKey: 'ConciergeBubble',
        labelKey: 'workspace.virtualEmployees.events.chatMention',
        descriptionKey: 'workspace.virtualEmployees.events.chatMentionDescription',
    },
    {
        key: 'chat.message',
        illustrationKey: 'ChatBubbles',
        labelKey: 'workspace.virtualEmployees.events.chatMessage',
        descriptionKey: 'workspace.virtualEmployees.events.chatMessageDescription',
    },
];

const MIN_SYSTEM_PROMPT_LENGTH = 20;

function WorkspaceVirtualEmployeePage({route}: WorkspaceVirtualEmployeePageProps) {
    const {policyID, virtualEmployeeID} = route.params;
    const isNew = virtualEmployeeID === 'new';
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const illustrations = useMemoizedLazyIllustrations([
        'ConciergeBot',
        'MagnifyingGlassMoney',
        'Binoculars',
        'Pencil',
        'CommentBubbles',
        'Approval',
        'Alert',
        'CheckmarkCircle',
        'Gears',
        'FastMoney',
        'EnvelopeReceipt',
        'Hourglass',
        'ThumbsUpStars',
        'ConciergeBubble',
        'ChatBubbles',
    ] as const);

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

    const hasHydratedFromOnyx = useRef(!isNew && !existingVE);
    useEffect(() => {
        if (!hasHydratedFromOnyx.current || !existingVE) {
            return;
        }
        hasHydratedFromOnyx.current = false;
        setDisplayName(existingVE.displayName);
        setSystemPrompt(existingVE.systemPrompt);
        setCapabilities(existingVE.capabilities);
        setEventSubs(existingVE.eventSubs);
    }, [existingVE]);

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
        } else if (existingVE) {
            updateVirtualEmployee(policyID, virtualEmployeeID, existingVE.accountID, {
                displayName: displayName.trim(),
                systemPrompt: systemPrompt.trim(),
                capabilities,
                eventSubs,
            });
        }
        Navigation.goBack();
    }, [validate, isNew, policyID, displayName, systemPrompt, capabilities, eventSubs, virtualEmployeeID, existingVE]);

    return (
        <ScreenWrapper testID="WorkspaceVirtualEmployeePage">
            <HeaderWithBackButton
                icon={illustrations.ConciergeBot}
                shouldUseHeadlineHeader
                title={isNew ? translate('workspace.virtualEmployees.createTitle') : translate('workspace.virtualEmployees.editTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={styles.pb10}>
                <View style={[styles.mh5, styles.mt4, styles.mb4]}>
                    <TextInput
                        label={translate('workspace.virtualEmployees.displayNameLabel')}
                        placeholder={translate('workspace.virtualEmployees.displayNamePlaceholder')}
                        value={displayName}
                        onChangeText={setDisplayName}
                        errorText={displayNameError}
                        maxLength={100}
                    />
                </View>

                <View style={[styles.mh5, styles.mb5, !shouldUseNarrowLayout && styles.flexRow]}>
                    <View style={!shouldUseNarrowLayout ? {flex: 3, marginRight: 16} : undefined}>
                        <View
                            style={[
                                styles.p4,
                                {borderRadius: 8},
                                styles.highlightBG,
                                {borderLeftWidth: 3, borderLeftColor: theme.success},
                            ]}
                        >
                            <Text
                                style={[styles.textMicroBold, {color: theme.success}, styles.mb2]}
                                accessibilityRole="header"
                            >
                                {translate('workspace.virtualEmployees.systemPromptLabel').toUpperCase()}
                            </Text>
                            <TextInput
                                placeholder={translate('workspace.virtualEmployees.systemPromptPlaceholder')}
                                value={systemPrompt}
                                onChangeText={setSystemPrompt}
                                multiline
                                numberOfLines={8}
                                autoGrowHeight
                            />
                        </View>
                        {!!systemPromptError && (
                            <Text style={[styles.textMicro, {color: theme.danger}, styles.mt1]}>
                                {systemPromptError}
                            </Text>
                        )}
                        <Text style={[styles.textMicro, styles.textSupporting, styles.mt2]}>
                            {translate('workspace.virtualEmployees.systemPromptHint')}
                        </Text>
                    </View>

                    {!shouldUseNarrowLayout && (
                        <View style={{flex: 2}}>
                            <View
                                style={[
                                    styles.p4,
                                    {borderRadius: 8},
                                    styles.alignItemsCenter,
                                    styles.flex1,
                                    {backgroundColor: theme.cardBG, borderWidth: 1, borderColor: theme.border},
                                ]}
                            >
                                <View style={styles.mb3}>
                                    <Icon
                                        src={illustrations.ConciergeBot}
                                        width={64}
                                        height={64}
                                    />
                                </View>
                                <Text style={[styles.textStrong, styles.mb1, {textAlign: 'center'}]}>
                                    {displayName || translate('workspace.virtualEmployees.unnamedEmployee')}
                                </Text>
                                <Text style={[styles.textMicro, styles.textSupporting, styles.mb3]}>
                                    {translate('workspace.virtualEmployees.virtualEmployeeLabel')}
                                </Text>

                                <View
                                    style={[
                                        styles.p3,
                                        {borderRadius: 8},
                                        styles.highlightBG,
                                        styles.mb3,
                                        styles.flex1,
                                        {width: '100%'},
                                    ]}
                                >
                                    <Text style={[styles.textMicro, styles.textSupporting, {fontStyle: 'italic'}]}>
                                        {systemPrompt
                                            ? `\u201C${systemPrompt.substring(0, 200)}${systemPrompt.length > 200 ? '\u2026' : ''}\u201D`
                                            : translate('workspace.virtualEmployees.previewPlaceholder')}
                                    </Text>
                                </View>

                                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
                                        <View
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: capabilities.length > 0 ? theme.success : theme.icon,
                                                marginRight: 6,
                                            }}
                                        />
                                        <Text style={[styles.textMicro, styles.textSupporting]}>
                                            {translate('workspace.virtualEmployees.capabilityCount', {count: capabilities.length})}
                                        </Text>
                                    </View>
                                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                        <View
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: eventSubs.length > 0 ? theme.success : theme.icon,
                                                marginRight: 6,
                                            }}
                                        />
                                        <Text style={[styles.textMicro, styles.textSupporting]}>
                                            {translate('workspace.virtualEmployees.triggerCount', {count: eventSubs.length})}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                <View style={!shouldUseNarrowLayout ? [styles.flexRow, styles.mh5, {gap: 16}] : undefined}>
                    <View
                        style={[
                            styles.mb2,
                            !shouldUseNarrowLayout && styles.flex1,
                            !shouldUseNarrowLayout && {borderRadius: 8, backgroundColor: theme.cardBG, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' as const},
                        ]}
                    >
                        <View style={[styles.ph5, styles.pb2, !shouldUseNarrowLayout && styles.pt4]}>
                            <Text
                                style={styles.textLabelSupporting}
                                accessibilityRole="header"
                            >
                                {translate('workspace.virtualEmployees.capabilitiesSection')}
                            </Text>
                            <Text style={[styles.textMicro, styles.textSupporting, styles.mt1]}>
                                {translate('workspace.virtualEmployees.capabilitiesSectionHint')}
                            </Text>
                        </View>
                        {ALL_CAPABILITIES.map(({key, illustrationKey, labelKey, descriptionKey}) => (
                            <ToggleSettingOptionRow
                                key={key}
                                icon={illustrations[illustrationKey]}
                                title={translate(labelKey)}
                                subtitle={translate(descriptionKey)}
                                switchAccessibilityLabel={translate(labelKey)}
                                isActive={capabilities.includes(key)}
                                onToggle={() => toggleCapability(key)}
                                wrapperStyle={[styles.ph5, styles.pv3]}
                                shouldPlaceSubtitleBelowSwitch
                            />
                        ))}
                    </View>

                    <View
                        style={[
                            styles.mb2,
                            !shouldUseNarrowLayout && styles.flex1,
                            !shouldUseNarrowLayout && {borderRadius: 8, backgroundColor: theme.cardBG, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' as const},
                        ]}
                    >
                        <View style={[styles.ph5, styles.pb2, !shouldUseNarrowLayout && styles.pt4]}>
                            <Text
                                style={styles.textLabelSupporting}
                                accessibilityRole="header"
                            >
                                {translate('workspace.virtualEmployees.eventsSection')}
                            </Text>
                            <Text style={[styles.textMicro, styles.textSupporting, styles.mt1]}>
                                {translate('workspace.virtualEmployees.eventsSectionHint')}
                            </Text>
                        </View>
                        {ALL_EVENTS.map(({key, illustrationKey, labelKey, descriptionKey}) => (
                            <ToggleSettingOptionRow
                                key={key}
                                icon={illustrations[illustrationKey]}
                                title={translate(labelKey)}
                                subtitle={translate(descriptionKey)}
                                switchAccessibilityLabel={translate(labelKey)}
                                isActive={eventSubs.includes(key)}
                                onToggle={() => toggleEvent(key)}
                                wrapperStyle={[styles.ph5, styles.pv3]}
                                shouldPlaceSubtitleBelowSwitch
                            />
                        ))}
                    </View>
                </View>

                <View style={[styles.ph5, styles.mt4]}>
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
