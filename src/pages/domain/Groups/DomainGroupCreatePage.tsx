import {defaultSecurityGroupIDSelector} from '@selectors/Domain';
import {createAdminPoliciesSelector, policyNameSelector} from '@selectors/Policy';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearDomainGroupCreatePreferredPolicyID, createDomainSecurityGroup, setDomainGroupCreatePreferredPolicyID} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/DomainGroupCreateForm';

type DomainGroupCreatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.GROUP_CREATE>;

function DomainGroupCreatePage({route}: DomainGroupCreatePageProps) {
    const styles = useThemeStyles();
    const {domainAccountID} = route.params;
    const {translate, localeCompare} = useLocalize();

    const inputRef = useRef<AnimatedTextInputRef>(null);

    const [defaultGroupForNewMembers, setDefaultGroupForNewMembers] = useState(false);
    const [strictlyEnforceWorkspaceRules, setStrictlyEnforceWorkspaceRules] = useState(false);
    const [restrictDefaultLoginSelection, setRestrictDefaultLoginSelection] = useState(false);
    const [restrictExpenseWorkspaceCreation, setRestrictExpenseWorkspaceCreation] = useState(false);
    const [expensifyCardPreferredWorkspace, setExpensifyCardPreferredWorkspace] = useState(false);
    const [preferredWorkspace, setPreferredWorkspace] = useState(false);

    const {showConfirmModal} = useConfirmModal();

    const [preferredPolicyID] = useOnyx(ONYXKEYS.DOMAIN_GROUP_CREATE_PREFERRED_POLICY_ID);
    const [preferredPolicyName] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${preferredPolicyID}`, {
        selector: policyNameSelector,
    });
    const [defaultSecurityGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: defaultSecurityGroupIDSelector,
    });
    const [adminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createAdminPoliciesSelector()});
    const [domainCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}`);
    const isDomainUsingExpensifyCard = !!domainCardSettings;

    const firstAdminPolicy = Object.values(adminPolicies ?? {})
        .sort((a, b) => localeCompare(a?.created ?? '', b?.created ?? ''))
        .at(0);
    const hasAdminPolicies = !!firstAdminPolicy;

    useEffect(() => {
        return () => {
            clearDomainGroupCreatePreferredPolicyID();
        };
    }, []);

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                onEntryTransitionEnd={() => inputRef.current?.focus()}
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID="DomainGroupCreatePage"
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton
                    title={translate('domain.groups.createNewGroupButton')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID));
                    }}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.CREATE_DOMAIN_GROUP_FORM}
                    validate={(values: FormOnyxValues<typeof ONYXKEYS.FORMS.CREATE_DOMAIN_GROUP_FORM>) => {
                        const errors = {};
                        if (!values.name) {
                            addErrorMessage(errors, INPUT_IDS.NAME, translate('common.error.fieldRequired'));
                        } else if (values.name.length > CONST.FORM_CHARACTER_LIMIT) {
                            addErrorMessage(errors, INPUT_IDS.NAME, translate('common.error.characterLimitExceedCounter', values.name.length, CONST.FORM_CHARACTER_LIMIT));
                        }
                        return errors;
                    }}
                    onSubmit={(values: FormOnyxValues<typeof ONYXKEYS.FORMS.CREATE_DOMAIN_GROUP_FORM>) => {
                        createDomainSecurityGroup(
                            domainAccountID,
                            {
                                name: values[INPUT_IDS.NAME],
                                shared: {},
                                enableRestrictedPolicyCreation: restrictExpenseWorkspaceCreation,
                                enableRestrictedPrimaryLogin: restrictDefaultLoginSelection,
                                enableStrictPolicyRules: strictlyEnforceWorkspaceRules,
                                enableRestrictedPrimaryPolicy: preferredWorkspace,
                                restrictedPrimaryPolicyID: preferredPolicyID ?? firstAdminPolicy?.id,
                                overridePreferredPolicyWithCardPolicy: expensifyCardPreferredWorkspace,
                            },
                            defaultGroupForNewMembers,
                            defaultSecurityGroupID,
                        );
                        clearDomainGroupCreatePreferredPolicyID();
                        Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID));
                    }}
                    enabledWhenOffline
                    submitButtonText={translate('domain.groups.createGroupSubmitButton')}
                    style={[styles.flex1]}
                    submitButtonStyles={[styles.ph5, styles.pb3]}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        label={translate('common.name')}
                        aria-label={translate('common.name')}
                        role={CONST.ROLE.PRESENTATION}
                        inputID={INPUT_IDS.NAME}
                        defaultValue=""
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="done"
                        ref={inputRef}
                        containerStyles={[styles.ph5, styles.mv3]}
                    />
                    <ToggleSettingOptionRow
                        title={translate('domain.groups.defaultGroup')}
                        switchAccessibilityLabel={translate('domain.groups.defaultGroup')}
                        isActive={defaultGroupForNewMembers}
                        onToggle={setDefaultGroupForNewMembers}
                        wrapperStyle={[styles.ph5, styles.mv3]}
                    />
                    <View style={[styles.sectionDividerLine, styles.mh5, styles.mv6]} />
                    <Text style={[styles.textNormal, styles.textStrong, styles.ph5]}>{translate('domain.groups.permissions')}</Text>
                    <ToggleSettingOptionRow
                        title={translate('domain.groups.strictlyEnforceWorkspaceRules')}
                        subtitle={translate('domain.groups.strictlyEnforceWorkspaceRulesDescription')}
                        switchAccessibilityLabel={translate('domain.groups.strictlyEnforceWorkspaceRules')}
                        isActive={strictlyEnforceWorkspaceRules}
                        onToggle={setStrictlyEnforceWorkspaceRules}
                        wrapperStyle={[styles.ph5, styles.mv3]}
                        shouldPlaceSubtitleBelowSwitch
                    />
                    <ToggleSettingOptionRow
                        title={translate('domain.groups.restrictDefaultLoginSelection')}
                        subtitle={translate('domain.groups.restrictDefaultLoginSelectionDescription')}
                        switchAccessibilityLabel={translate('domain.groups.restrictDefaultLoginSelection')}
                        isActive={restrictDefaultLoginSelection}
                        onToggle={setRestrictDefaultLoginSelection}
                        wrapperStyle={[styles.ph5, styles.mv3]}
                        shouldPlaceSubtitleBelowSwitch
                    />
                    <ToggleSettingOptionRow
                        title={translate('domain.groups.restrictExpenseWorkspaceCreation')}
                        subtitle={translate('domain.groups.restrictExpenseWorkspaceCreationDescription')}
                        switchAccessibilityLabel={translate('domain.groups.restrictExpenseWorkspaceCreation')}
                        isActive={restrictExpenseWorkspaceCreation}
                        onToggle={setRestrictExpenseWorkspaceCreation}
                        wrapperStyle={[styles.ph5, styles.mv3]}
                        shouldPlaceSubtitleBelowSwitch
                    />
                    <ToggleSettingOptionRow
                        title={translate('domain.groups.preferredWorkspace')}
                        subtitle={translate('domain.groups.preferredWorkspaceDescription', preferredWorkspace)}
                        switchAccessibilityLabel={translate('domain.groups.preferredWorkspace')}
                        isActive={preferredWorkspace}
                        disabled={!hasAdminPolicies}
                        disabledAction={() => {
                            showConfirmModal({
                                title: translate('workspace.distanceRates.oopsNotSoFast'),
                                prompt: translate('domain.groups.noWorkspacesMessage'),
                                confirmText: translate('common.buttonConfirm'),
                                shouldShowCancelButton: false,
                            });
                        }}
                        onToggle={(value) => {
                            setPreferredWorkspace(value);
                            if (value) {
                                if (!preferredPolicyID && firstAdminPolicy?.id) {
                                    setDomainGroupCreatePreferredPolicyID(firstAdminPolicy.id);
                                }
                            } else {
                                clearDomainGroupCreatePreferredPolicyID();
                                setExpensifyCardPreferredWorkspace(false);
                            }
                        }}
                        wrapperStyle={[styles.ph5, styles.mv3]}
                        shouldPlaceSubtitleBelowSwitch
                    />
                    {hasAdminPolicies && (
                        <MenuItemWithTopDescription
                            description={translate('domain.groups.preferredWorkspace')}
                            title={preferredPolicyName ?? firstAdminPolicy?.name}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.DOMAIN_GROUP_CREATE_PREFERRED_WORKSPACE.getRoute(domainAccountID))}
                            disabled={!preferredWorkspace}
                        />
                    )}
                    <ToggleSettingOptionRow
                        title={translate('domain.groups.expensifyCardPreferredWorkspace')}
                        subtitle={translate('domain.groups.expensifyCardPreferredWorkspaceDescription')}
                        switchAccessibilityLabel={translate('domain.groups.expensifyCardPreferredWorkspace')}
                        isActive={expensifyCardPreferredWorkspace}
                        disabled={!preferredWorkspace || !isDomainUsingExpensifyCard}
                        disabledAction={() => {
                            showConfirmModal({
                                title: translate('workspace.distanceRates.oopsNotSoFast'),
                                prompt: translate('domain.groups.expensifyCardPreferredWorkspaceDisabledMessage'),
                                confirmText: translate('common.buttonConfirm'),
                                shouldShowCancelButton: false,
                            });
                        }}
                        onToggle={setExpensifyCardPreferredWorkspace}
                        wrapperStyle={[styles.ph5, styles.mv3]}
                        shouldPlaceSubtitleBelowSwitch
                    />
                </FormProvider>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainGroupCreatePage;
