import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import DecisionModal from '@components/DecisionModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {close} from '@libs/actions/Modal';
import {cleanPolicyTags, downloadMultiLevelTagsCSV, downloadTagsCSV, setImportedSpreadsheetIsImportingMultiLevelTags} from '@libs/actions/Policy/Tag';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {
    getTagLists,
    goBackFromInvalidPolicy,
    hasAccountingConnections as hasAccountingConnectionsPolicyUtils,
    hasDependentTags as hasDependentTagsPolicyUtils,
    isControlPolicy,
    isMultiLevelTags as isMultiLevelTagsPolicyUtils,
} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ImportTagsOptionsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS_IMPORT_OPTIONS>;

function ImportTagsOptionsPage({route}: ImportTagsOptionsPageProps) {
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const backTo = route.params.backTo;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const isQuickSettingsFlow = !!backTo;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MultiTag', 'Tag']);

    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const [shouldRunPostUpgradeFlow, setShouldRunPostUpgradeFlow] = useState(false);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [policyTagLists, isMultiLevelTags, hasDependentTags] = useMemo(
        () => [getTagLists(policyTags), isMultiLevelTagsPolicyUtils(policyTags), hasDependentTagsPolicyUtils(policy, policyTags)],
        [policy, policyTags],
    );

    const hasVisibleTags = useMemo(() => {
        if (isMultiLevelTags) {
            return policyTagLists.some((policyTagList) => Object.values(policyTagList.tags ?? {}).some((tag) => tag.enabled));
        }

        const singleLevelTags = policyTagLists.at(0)?.tags ?? {};
        return Object.values(singleLevelTags).some((tag) => tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    }, [isMultiLevelTags, policyTagLists]);

    const overrideMultiTagPrompt = useMemo(
        () => (
            <Text>
                {translate('workspace.tags.overrideMultiTagWarning.prompt1')}
                <>
                    {translate('workspace.tags.overrideMultiTagWarning.prompt2')}
                    <TextLink
                        onPress={() => {
                            if (isMultiLevelTags) {
                                downloadMultiLevelTagsCSV(
                                    policyID,
                                    () => {
                                        close(() => {
                                            setIsDownloadFailureModalVisible(true);
                                        });
                                    },
                                    hasDependentTags,
                                    translate,
                                );
                            } else {
                                downloadTagsCSV(
                                    policyID,
                                    () => {
                                        close(() => {
                                            setIsDownloadFailureModalVisible(true);
                                        });
                                    },
                                    translate,
                                );
                            }
                        }}
                    >
                        {translate('workspace.tags.overrideMultiTagWarning.prompt3')}
                    </TextLink>
                    {translate('workspace.tags.overrideMultiTagWarning.prompt4')}
                </>
            </Text>
        ),
        [translate, isMultiLevelTags, policyID, hasDependentTags],
    );

    const switchSingleToMultiLevelTagPrompt = useMemo(
        () => (
            <Text>
                {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt1')}
                {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt2')}
                <TextLink
                    onPress={() => {
                        if (isMultiLevelTags) {
                            downloadMultiLevelTagsCSV(
                                policyID,
                                () => {
                                    close(() => {
                                        setIsDownloadFailureModalVisible(true);
                                    });
                                },
                                hasDependentTags,
                                translate,
                            );
                        } else {
                            downloadTagsCSV(
                                policyID,
                                () => {
                                    close(() => {
                                        setIsDownloadFailureModalVisible(true);
                                    });
                                },
                                translate,
                            );
                        }
                    }}
                >
                    {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt3')}
                </TextLink>
                {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt4')}
                <TextLink href={CONST.IMPORT_SPREADSHEET.TAGS_ARTICLE_LINK}>{translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt5')}</TextLink>
                {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt6')}
            </Text>
        ),
        [translate, policyID, hasDependentTags, isMultiLevelTags],
    );

    const startMultiLevelTagImportFlow = useCallback(async () => {
        setImportedSpreadsheetIsImportingMultiLevelTags(true);
        if (hasVisibleTags) {
            if (isMultiLevelTags) {
                const {action} = await showConfirmModal({
                    title: translate('workspace.tags.overrideMultiTagWarning.title'),
                    prompt: overrideMultiTagPrompt,
                    confirmText: translate('workspace.tags.overrideMultiTagWarning.title'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                });
                if (action === ModalActions.CONFIRM) {
                    Navigation.navigate(
                        isQuickSettingsFlow
                            ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                            : ROUTES.WORKSPACE_TAGS_IMPORT.getRoute(policyID),
                    );
                } else {
                    setImportedSpreadsheetIsImportingMultiLevelTags(false);
                }
            } else {
                const {action} = await showConfirmModal({
                    title: translate('workspace.tags.switchSingleToMultiLevelTagWarning.title'),
                    prompt: switchSingleToMultiLevelTagPrompt,
                    confirmText: translate('workspace.tags.switchSingleToMultiLevelTagWarning.title'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                });
                if (action === ModalActions.CONFIRM) {
                    cleanPolicyTags(policyID);
                    Navigation.setNavigationActionToMicrotaskQueue(() => {
                        Navigation.navigate(
                            isQuickSettingsFlow
                                ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                                : ROUTES.WORKSPACE_TAGS_IMPORT.getRoute(policyID),
                        );
                    });
                } else {
                    setImportedSpreadsheetIsImportingMultiLevelTags(false);
                }
            }
        } else {
            Navigation.navigate(
                isQuickSettingsFlow ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo)) : ROUTES.WORKSPACE_TAGS_IMPORT.getRoute(policyID),
            );
        }
    }, [hasVisibleTags, isMultiLevelTags, showConfirmModal, translate, overrideMultiTagPrompt, isQuickSettingsFlow, policyID, backTo, switchSingleToMultiLevelTagPrompt]);

    useFocusEffect(
        useCallback(() => {
            if (!shouldRunPostUpgradeFlow || !isControlPolicy(policy)) {
                return;
            }

            startMultiLevelTagImportFlow();
            setShouldRunPostUpgradeFlow(false);
        }, [shouldRunPostUpgradeFlow, policy, startMultiLevelTagImportFlow]),
    );

    if (hasAccountingConnections) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={false}
                testID="ImportSpreadsheet"
                shouldEnableMaxHeight={canUseTouchScreen()}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.tags.importTags')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <FullPageOfflineBlockingView>
                    <Text style={[styles.ph5, styles.pv3, styles.textSupporting, styles.textNormal]}>{translate('workspace.tags.importTagsSupportingText')}</Text>

                    <MenuItem
                        title={translate('workspace.tags.tagLevel.singleLevel')}
                        icon={expensifyIcons.Tag}
                        shouldShowRightIcon
                        onPress={async () => {
                            setImportedSpreadsheetIsImportingMultiLevelTags(false);
                            if (hasVisibleTags && isMultiLevelTags) {
                                const {action} = await showConfirmModal({
                                    title: translate('workspace.tags.switchSingleToMultiLevelTagWarning.title'),
                                    prompt: switchSingleToMultiLevelTagPrompt,
                                    confirmText: translate('workspace.tags.switchSingleToMultiLevelTagWarning.title'),
                                    cancelText: translate('common.cancel'),
                                    danger: true,
                                });
                                if (action === ModalActions.CONFIRM) {
                                    cleanPolicyTags(policyID);
                                    Navigation.setNavigationActionToMicrotaskQueue(() => {
                                        Navigation.navigate(
                                            isQuickSettingsFlow
                                                ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                                                : ROUTES.WORKSPACE_TAGS_IMPORT.getRoute(policyID),
                                        );
                                    });
                                } else {
                                    setImportedSpreadsheetIsImportingMultiLevelTags(false);
                                }
                            } else {
                                Navigation.navigate(
                                    isQuickSettingsFlow
                                        ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                                        : ROUTES.WORKSPACE_TAGS_IMPORT.getRoute(policyID),
                                );
                            }
                        }}
                    />
                    <MenuItem
                        title={translate('workspace.tags.tagLevel.multiLevel')}
                        // TODO: Update icon to multi-level tag icon once it's provided by design team
                        icon={expensifyIcons.MultiTag}
                        shouldShowRightIcon
                        onPress={() => {
                            if (!isControlPolicy(policy)) {
                                setShouldRunPostUpgradeFlow(true);
                                Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiLevelTags.alias, Navigation.getActiveRoute()));
                                return;
                            }
                            startMultiLevelTagImportFlow();
                        }}
                    />
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsDownloadFailureModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadFailureModalVisible}
                onClose={() => setIsDownloadFailureModalVisible(false)}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default ImportTagsOptionsPage;
