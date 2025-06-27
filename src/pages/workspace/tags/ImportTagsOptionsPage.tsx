import React, {useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {MultiTag, Tag} from '@components/Icon/Expensicons';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {cleanPolicyTags, downloadMultiLevelIndependentTagsCSV, downloadTagsCSV, setImportedSpreadsheetIsImportingMultiLevelTags} from '@libs/actions/Policy/Tag';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {
    getTagLists,
    goBackFromInvalidPolicy,
    hasAccountingConnections as hasAccountingConnectionsPolicyUtils,
    hasDependentTags as hasDependentTagsPolicyUtils,
    hasIndependentTags as hasIndependentTagsPolicyUtils,
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
    const [isSwitchSingleToMultipleLevelTagWarningModalVisible, setIsSwitchSingleToMultipleLevelTagWarningModalVisible] = useState(false);

    const [isDownloadFailureModalVisible, setIsDownloadFailureModalVisible] = useState(false);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [policyTagLists, isMultiLevelTags, hasDependentTags, hasIndependentTags] = useMemo(
        () => [getTagLists(policyTags), isMultiLevelTagsPolicyUtils(policyTags), hasDependentTagsPolicyUtils(policy, policyTags), hasIndependentTagsPolicyUtils(policy, policyTags)],
        [policy, policyTags],
    );

    const hasVisibleTags = useMemo(() => {
        if (isMultiLevelTags) {
            return policyTagLists.some((policyTagList) => Object.values(policyTagList.tags ?? {}).some((tag) => tag.enabled));
        }

        const singleLevelTags = policyTagLists.at(0)?.tags ?? {};
        return Object.values(singleLevelTags).some((tag) => tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    }, [isMultiLevelTags, policyTagLists]);

    if (hasAccountingConnections) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={false}
                testID={ImportSpreadsheet.displayName}
                shouldEnableMaxHeight={canUseTouchScreen()}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.tags.importTags')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <FullPageOfflineBlockingView>
                    <Text style={[styles.ph5, styles.textSupporting, styles.textNormal]}>{translate('workspace.tags.importTagsSupportingText')}</Text>

                    <MenuItem
                        title={translate('workspace.tags.tagLevel.singleLevel')}
                        icon={Tag}
                        shouldShowRightIcon
                        onPress={() => {
                            setImportedSpreadsheetIsImportingMultiLevelTags(false);
                            if (hasVisibleTags) {
                                setIsSwitchSingleToMultipleLevelTagWarningModalVisible(true);
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
                        icon={MultiTag}
                        shouldShowRightIcon
                        onPress={() => {
                            if (!isControlPolicy(policy)) {
                                Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiLevelTags.alias, Navigation.getActiveRoute()));
                                return;
                            }
                            setImportedSpreadsheetIsImportingMultiLevelTags(true);
                            if (hasVisibleTags) {
                                setIsSwitchSingleToMultipleLevelTagWarningModalVisible(true);
                            } else {
                                Navigation.navigate(
                                    isQuickSettingsFlow
                                        ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                                        : ROUTES.WORKSPACE_TAGS_IMPORT.getRoute(policyID),
                                );
                            }
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
            <ConfirmModal
                isVisible={isSwitchSingleToMultipleLevelTagWarningModalVisible}
                onConfirm={() => {
                    cleanPolicyTags(policyID);
                    setIsSwitchSingleToMultipleLevelTagWarningModalVisible(false);
                    Navigation.navigate(
                        isQuickSettingsFlow
                            ? ROUTES.SETTINGS_TAGS_IMPORT.getRoute(policyID, ROUTES.SETTINGS_TAGS_ROOT.getRoute(policyID, backTo))
                            : ROUTES.WORKSPACE_TAGS_IMPORT.getRoute(policyID),
                    );
                }}
                title={translate('workspace.tags.switchSingleToMultiLevelTagWarning.title')}
                prompt={
                    <Text>
                        {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt1')}
                        {!hasDependentTags && (
                            <>
                                {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt2')}
                                <TextLink
                                    onPress={() => {
                                        if (hasIndependentTags && isMultiLevelTags) {
                                            downloadMultiLevelIndependentTagsCSV(policyID, () => {
                                                setIsDownloadFailureModalVisible(true);
                                            });
                                        } else {
                                            downloadTagsCSV(policyID, () => {
                                                setIsDownloadFailureModalVisible(true);
                                            });
                                        }
                                    }}
                                >
                                    {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt3')}
                                </TextLink>
                                {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt4')}
                                <TextLink
                                    onPress={() => {
                                        // TODO: Add link to tag levels documentation
                                        return null;
                                    }}
                                >
                                    {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt5')}
                                </TextLink>
                                {translate('workspace.tags.switchSingleToMultiLevelTagWarning.prompt6')}
                            </>
                        )}
                    </Text>
                }
                confirmText={translate('workspace.tags.switchSingleToMultiLevelTagWarning.title')}
                danger
                cancelText={translate('common.cancel')}
                onCancel={() => {
                    setImportedSpreadsheetIsImportingMultiLevelTags(false);
                    setIsSwitchSingleToMultipleLevelTagWarningModalVisible(false);
                }}
            />
        </AccessOrNotFoundWrapper>
    );
}

ImportTagsOptionsPage.displayName = 'ImportTagsOptionsPage';

export default ImportTagsOptionsPage;
