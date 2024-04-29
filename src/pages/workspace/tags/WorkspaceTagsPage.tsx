import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import lodashSortBy from 'lodash/sortBy';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RightElementEnabledStatus from '@components/SelectionList/RightElementEnabledStatus';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type PolicyForList = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
    rightElement: React.ReactNode;
    enabled: boolean;
};

type PolicyOption = ListItem & {
    /** Tag name is used as a key for the selectedTags state */
    keyForList: string;
};

type WorkspaceTagsPageProps = WithPolicyConnectionsProps;

function WorkspaceTagsPage({route, policy}: WorkspaceTagsPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
    const dropdownButtonRef = useRef(null);
    const [deleteTagsConfirmModalVisible, setDeleteTagsConfirmModalVisible] = useState(false);
    const isFocused = useIsFocused();
    const policyID = route.params.policyID ?? '';
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const {environmentURL} = useEnvironment();
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;

    const fetchTags = useCallback(() => {
        Policy.openPolicyTagsPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchTags});

    useFocusEffect(
        useCallback(() => {
            fetchTags();
        }, [fetchTags]),
    );

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedTags({});
    }, [isFocused]);

    // We currently don't support multi level tags, so let's only get the first level tags.
    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags).slice(0, 1), [policyTags]);
    const tagList = useMemo<PolicyForList[]>(
        () =>
            policyTagLists
                .map((policyTagList) =>
                    lodashSortBy(Object.values(policyTagList.tags || []), 'name', localeCompare).map((value) => {
                        const tag = value as OnyxCommon.OnyxValueWithOfflineFeedback<OnyxTypes.PolicyTag>;
                        const isDisabled = tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                        return {
                            value: tag.name,
                            text: PolicyUtils.getCleanedTagName(tag.name),
                            keyForList: tag.name,
                            isSelected: !!selectedTags[tag.name],
                            pendingAction: tag.pendingAction,
                            errors: tag.errors ?? undefined,
                            enabled: tag.enabled,
                            isDisabled,
                            rightElement: <RightElementEnabledStatus enabled={tag.enabled} />,
                        };
                    }),
                )
                .flat(),
        [policyTagLists, selectedTags],
    );

    const tagListKeyedByName = tagList.reduce<Record<string, PolicyForList>>((acc, tag) => {
        acc[tag.value] = tag;
        return acc;
    }, {});

    const toggleTag = (tag: PolicyForList) => {
        setSelectedTags((prev) => ({
            ...prev,
            [tag.value]: !prev[tag.value],
        }));
    };

    const toggleAllTags = () => {
        const isAllSelected = tagList.every((tag) => !!selectedTags[tag.value]);
        setSelectedTags(isAllSelected ? {} : Object.fromEntries(tagList.map((item) => [item.value, true])));
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    const navigateToTagsSettings = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAGS_SETTINGS.getRoute(policyID));
    };

    const navigateToCreateTagPage = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAG_CREATE.getRoute(policyID));
    };

    const navigateToTagSettings = (tag: PolicyOption) => {
        Navigation.navigate(ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(policyID, tag.keyForList));
    };

    const selectedTagsArray = Object.keys(selectedTags).filter((key) => selectedTags[key]);

    const handleDeleteTags = () => {
        setSelectedTags({});
        Policy.deletePolicyTags(policyID, selectedTagsArray);
        setDeleteTagsConfirmModalVisible(false);
    };

    const isLoading = !isOffline && policyTags === undefined;

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.TAGS_BULK_ACTION_TYPES>>> = [];

        if (selectedTagsArray.length > 0) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate(selectedTagsArray.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                value: CONST.POLICY.TAGS_BULK_ACTION_TYPES.DELETE,
                onSelected: () => setDeleteTagsConfirmModalVisible(true),
            });

            const enabledTags = selectedTagsArray.filter((tagName) => tagListKeyedByName?.[tagName]?.enabled);
            if (enabledTags.length > 0) {
                const tagsToDisable = selectedTagsArray
                    .filter((tagName) => tagListKeyedByName?.[tagName]?.enabled)
                    .reduce<Record<string, {name: string; enabled: boolean}>>((acc, tagName) => {
                        acc[tagName] = {
                            name: tagName,
                            enabled: false,
                        };
                        return acc;
                    }, {});

                options.push({
                    icon: Expensicons.DocumentSlash,
                    text: translate(enabledTags.length === 1 ? 'workspace.tags.disableTag' : 'workspace.tags.disableTags'),
                    value: CONST.POLICY.TAGS_BULK_ACTION_TYPES.DISABLE,
                    onSelected: () => {
                        setSelectedTags({});
                        Policy.setWorkspaceTagEnabled(policyID, tagsToDisable);
                    },
                });
            }

            const disabledTags = selectedTagsArray.filter((tagName) => !tagListKeyedByName?.[tagName]?.enabled);
            if (disabledTags.length > 0) {
                const tagsToEnable = selectedTagsArray
                    .filter((tagName) => !tagListKeyedByName?.[tagName]?.enabled)
                    .reduce<Record<string, {name: string; enabled: boolean}>>((acc, tagName) => {
                        acc[tagName] = {
                            name: tagName,
                            enabled: true,
                        };
                        return acc;
                    }, {});
                options.push({
                    icon: Expensicons.Document,
                    text: translate(disabledTags.length === 1 ? 'workspace.tags.enableTag' : 'workspace.tags.enableTags'),
                    value: CONST.POLICY.TAGS_BULK_ACTION_TYPES.ENABLE,
                    onSelected: () => {
                        setSelectedTags({});
                        Policy.setWorkspaceTagEnabled(policyID, tagsToEnable);
                    },
                });
            }

            return (
                <ButtonWithDropdownMenu
                    buttonRef={dropdownButtonRef}
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {selectedNumber: selectedTagsArray.length})}
                    options={options}
                    style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
                />
            );
        }

        return (
            <View style={[styles.w100, styles.flexRow, isSmallScreenWidth && styles.mb3]}>
                <Button
                    medium
                    success
                    onPress={navigateToCreateTagPage}
                    icon={Expensicons.Plus}
                    text={translate('workspace.tags.addTag')}
                    style={[styles.mr3, isSmallScreenWidth && styles.w50]}
                />
                {policyTags && (
                    <Button
                        medium
                        onPress={navigateToTagsSettings}
                        icon={Expensicons.Gear}
                        text={translate('common.settings')}
                        style={[isSmallScreenWidth && styles.w50]}
                    />
                )}
            </View>
        );
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
                    policyID={policyID}
                    featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
                >
                    <ScreenWrapper
                        includeSafeAreaPaddingBottom={false}
                        style={[styles.defaultModalContainer]}
                        testID={WorkspaceTagsPage.displayName}
                        shouldShowOfflineIndicatorInWideScreen
                        offlineIndicatorStyle={styles.mtAuto}
                    >
                        <HeaderWithBackButton
                            icon={Illustrations.Tag}
                            title={translate('workspace.common.tags')}
                            shouldShowBackButton={isSmallScreenWidth}
                        >
                            {!isSmallScreenWidth && getHeaderButtons()}
                        </HeaderWithBackButton>
                        <ConfirmModal
                            isVisible={deleteTagsConfirmModalVisible}
                            onConfirm={handleDeleteTags}
                            onCancel={() => setDeleteTagsConfirmModalVisible(false)}
                            title={translate(selectedTagsArray.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags')}
                            prompt={translate(selectedTagsArray.length === 1 ? 'workspace.tags.deleteTagConfirmation' : 'workspace.tags.deleteTagsConfirmation')}
                            confirmText={translate('common.delete')}
                            cancelText={translate('common.cancel')}
                            danger
                        />
                        {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                        <View style={[styles.ph5, styles.pb5, styles.pt3]}>
                            {isConnectedToAccounting ? (
                                <Text>
                                    <Text style={[styles.textNormal, styles.colorMuted]}>{`${translate('workspace.tags.importedFromAccountingSoftware')} `}</Text>
                                    <TextLink
                                        style={[styles.textNormal, styles.link]}
                                        href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`}
                                    >
                                        {`${translate('workspace.accounting.qbo')} ${translate('workspace.accounting.settings')}`}
                                    </TextLink>
                                </Text>
                            ) : (
                                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.tags.subtitle')}</Text>
                            )}
                        </View>
                        {isLoading && (
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                style={[styles.flex1]}
                                color={theme.spinner}
                            />
                        )}
                        {tagList.length === 0 && !isLoading && (
                            <WorkspaceEmptyStateSection
                                title={translate('workspace.tags.emptyTags.title')}
                                icon={Illustrations.EmptyStateExpenses}
                                subtitle={translate('workspace.tags.emptyTags.subtitle')}
                            />
                        )}
                        {tagList.length > 0 && !isLoading && (
                            <SelectionList
                                canSelectMultiple
                                sections={[{data: tagList, isDisabled: false}]}
                                onCheckboxPress={toggleTag}
                                onSelectRow={navigateToTagSettings}
                                onSelectAll={toggleAllTags}
                                showScrollIndicator
                                ListItem={TableListItem}
                                customListHeader={getCustomListHeader()}
                                shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                                listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                                onDismissError={(item) => Policy.clearPolicyTagErrors(policyID, item.value)}
                            />
                        )}
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceTagsPage.displayName = 'WorkspaceTagsPage';

export default withPolicyConnections(WorkspaceTagsPage);
