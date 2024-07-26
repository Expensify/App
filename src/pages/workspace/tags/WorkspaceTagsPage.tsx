import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import lodashSortBy from 'lodash/sortBy';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Tag from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {PolicyTag, PolicyTagList, TagListItem} from './types';

type WorkspaceTagsPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS>;

function WorkspaceTagsPage({route}: WorkspaceTagsPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
    const [isDeleteTagsConfirmModalVisible, setIsDeleteTagsConfirmModalVisible] = useState(false);
    const isFocused = useIsFocused();
    const policyID = route.params.policyID ?? '-1';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const {environmentURL} = useEnvironment();
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const currentConnectionName = PolicyUtils.getCurrentConnectionName(policy);
    const [policyTagLists, isMultiLevelTags] = useMemo(() => [PolicyUtils.getTagLists(policyTags), PolicyUtils.isMultiLevelTags(policyTags)], [policyTags]);
    const canSelectMultiple = !isMultiLevelTags;

    const fetchTags = useCallback(() => {
        Tag.openPolicyTagsPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchTags});

    useFocusEffect(fetchTags);

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedTags({});
    }, [isFocused]);

    const getPendingAction = (policyTagList: PolicyTagList): PendingAction | undefined => {
        if (!policyTagList) {
            return undefined;
        }
        return (policyTagList.pendingAction as PendingAction) ?? Object.values(policyTagList.tags).some((tag: PolicyTag) => tag.pendingAction)
            ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE
            : undefined;
    };

    const tagList = useMemo<TagListItem[]>(() => {
        if (isMultiLevelTags) {
            return policyTagLists.map((policyTagList) => ({
                value: policyTagList.name,
                orderWeight: policyTagList.orderWeight,
                text: PolicyUtils.getCleanedTagName(policyTagList.name),
                keyForList: String(policyTagList.orderWeight),
                isSelected: selectedTags[policyTagList.name],
                pendingAction: getPendingAction(policyTagList),
                enabled: true,
                required: policyTagList.required,
                rightElement: (
                    <ListItemRightCaretWithLabel
                        labelText={policyTagList.required ? translate('common.required') : undefined}
                        shouldShowCaret={false}
                    />
                ),
            }));
        }
        const sortedTags = lodashSortBy(Object.values(policyTagLists[0]?.tags ?? {}), 'name', localeCompare) as PolicyTag[];
        return sortedTags.map((tag) => ({
            value: tag.name,
            text: PolicyUtils.getCleanedTagName(tag.name),
            keyForList: tag.name,
            isSelected: selectedTags[tag.name],
            pendingAction: tag.pendingAction,
            errors: tag.errors ?? undefined,
            enabled: tag.enabled,
            isDisabled: tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            rightElement: <ListItemRightCaretWithLabel labelText={tag.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')} />,
        }));
    }, [isMultiLevelTags, policyTagLists, selectedTags, translate]);

    const tagListKeyedByName = useMemo(
        () =>
            tagList.reduce<Record<string, TagListItem>>((acc, tag) => {
                acc[tag.value] = tag;
                return acc;
            }, {}),
        [tagList],
    );

    const toggleTag = (tag: TagListItem) => {
        setSelectedTags((prev) => ({
            ...prev,
            [tag.value]: !prev[tag.value],
        }));
    };

    const toggleAllTags = () => {
        const availableTags = tagList.filter((tag) => tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const isAllSelected = availableTags.length === Object.keys(selectedTags).length;
        setSelectedTags(isAllSelected ? {} : Object.fromEntries(availableTags.map((item) => [item.value, true])));
    };

    const getCustomListHeader = () => {
        const header = (
            <View
                style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.justifyContentBetween,
                    // Required padding accounting for the checkbox and the right arrow in multi-select mode
                    canSelectMultiple && [styles.pl3, styles.pr9],
                ]}
            >
                <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
                <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
            </View>
        );
        if (canSelectMultiple) {
            return header;
        }
        return <View style={[styles.flexRow, styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
    };

    const navigateToTagsSettings = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAGS_SETTINGS.getRoute(policyID));
    };

    const navigateToCreateTagPage = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAG_CREATE.getRoute(policyID));
    };

    const navigateToTagSettings = (tag: TagListItem) => {
        if (tag.orderWeight !== undefined) {
            Navigation.navigate(ROUTES.WORKSPACE_TAG_LIST_VIEW.getRoute(policyID, tag.orderWeight));
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(policyID, 0, tag.value));
    };

    const selectedTagsArray = Object.keys(selectedTags).filter((key) => selectedTags[key]);

    const deleteTags = () => {
        setSelectedTags({});
        Tag.deletePolicyTags(policyID, selectedTagsArray);
        setIsDeleteTagsConfirmModalVisible(false);
    };

    const isLoading = !isOffline && policyTags === undefined;

    const getHeaderButtons = () => {
        const hasAccountingConnections = PolicyUtils.hasAccountingConnections(policy);

        if (selectedTagsArray.length === 0) {
            return (
                <View style={[styles.w100, styles.flexRow, styles.gap2, isSmallScreenWidth && styles.mb3]}>
                    {!hasAccountingConnections && !isMultiLevelTags && (
                        <Button
                            medium
                            success
                            onPress={navigateToCreateTagPage}
                            icon={Expensicons.Plus}
                            text={translate('workspace.tags.addTag')}
                            style={[isSmallScreenWidth && styles.flex1]}
                        />
                    )}
                    {policyTags && (
                        <Button
                            medium
                            onPress={navigateToTagsSettings}
                            icon={Expensicons.Gear}
                            text={translate('common.settings')}
                            style={[isSmallScreenWidth && styles.flex1]}
                        />
                    )}
                </View>
            );
        }

        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];

        if (!hasAccountingConnections) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate(selectedTagsArray.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: () => setIsDeleteTagsConfirmModalVisible(true),
            });
        }

        let enabledTagCount = 0;
        const tagsToDisable: Record<string, {name: string; enabled: boolean}> = {};
        let disabledTagCount = 0;
        const tagsToEnable: Record<string, {name: string; enabled: boolean}> = {};
        for (const tagName of selectedTagsArray) {
            if (tagListKeyedByName[tagName]?.enabled) {
                enabledTagCount++;
                tagsToDisable[tagName] = {
                    name: tagName,
                    enabled: false,
                };
            } else {
                disabledTagCount++;
                tagsToEnable[tagName] = {
                    name: tagName,
                    enabled: true,
                };
            }
        }

        if (enabledTagCount > 0) {
            options.push({
                icon: Expensicons.DocumentSlash,
                text: translate(enabledTagCount === 1 ? 'workspace.tags.disableTag' : 'workspace.tags.disableTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                onSelected: () => {
                    setSelectedTags({});
                    Tag.setWorkspaceTagEnabled(policyID, tagsToDisable, 0);
                },
            });
        }

        if (disabledTagCount > 0) {
            options.push({
                icon: Expensicons.Document,
                text: translate(disabledTagCount === 1 ? 'workspace.tags.enableTag' : 'workspace.tags.enableTags'),
                value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                onSelected: () => {
                    setSelectedTags({});
                    Tag.setWorkspaceTagEnabled(policyID, tagsToEnable, 0);
                },
            });
        }

        return (
            <ButtonWithDropdownMenu
                onPress={() => null}
                shouldAlwaysShowDropdownMenu
                pressOnEnter
                isSplitButton={false}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                customText={translate('workspace.common.selected', {selectedNumber: selectedTagsArray.length})}
                options={options}
                style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
            />
        );
    };

    const getHeaderText = () => (
        <View style={[styles.ph5, styles.pb5, styles.pt3]}>
            {isConnectedToAccounting ? (
                <Text>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{`${translate('workspace.tags.importedFromAccountingSoftware')} `}</Text>
                    <TextLink
                        style={[styles.textNormal, styles.link]}
                        href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`}
                    >
                        {`${currentConnectionName} ${translate('workspace.accounting.settings')}`}
                    </TextLink>
                    <Text style={[styles.textNormal, styles.colorMuted]}>.</Text>
                </Text>
            ) : (
                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.tags.subtitle')}</Text>
            )}
        </View>
    );

    const hasVisibleTag = tagList.some((tag) => tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
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
                {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                <ConfirmModal
                    isVisible={isDeleteTagsConfirmModalVisible}
                    onConfirm={deleteTags}
                    onCancel={() => setIsDeleteTagsConfirmModalVisible(false)}
                    title={translate(selectedTagsArray.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags')}
                    prompt={translate(selectedTagsArray.length === 1 ? 'workspace.tags.deleteTagConfirmation' : 'workspace.tags.deleteTagsConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                {(!isSmallScreenWidth || tagList.length === 0 || isLoading) && getHeaderText()}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.spinner}
                    />
                )}
                {!hasVisibleTag && !isLoading && (
                    <EmptyStateComponent
                        SkeletonComponent={TableListItemSkeleton}
                        headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                        headerMedia={Illustrations.EmptyState}
                        headerStyles={styles.emptyFolderBG}
                        headerContentStyles={styles.emptyStateFolderIconSize}
                        title={translate('workspace.tags.emptyTags.title')}
                        subtitle={translate('workspace.tags.emptyTags.subtitle')}
                    />
                )}
                {hasVisibleTag && !isLoading && (
                    <SelectionList
                        canSelectMultiple={canSelectMultiple}
                        sections={[{data: tagList, isDisabled: false}]}
                        onCheckboxPress={toggleTag}
                        onSelectRow={navigateToTagSettings}
                        shouldDebounceRowSelect={!canSelectMultiple}
                        onSelectAll={toggleAllTags}
                        ListItem={TableListItem}
                        customListHeader={getCustomListHeader()}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        onDismissError={(item) => !isMultiLevelTags && Tag.clearPolicyTagErrors(policyID, item.value, 0)}
                        listHeaderContent={isSmallScreenWidth ? getHeaderText() : null}
                        showScrollIndicator={false}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTagsPage.displayName = 'WorkspaceTagsPage';

export default WorkspaceTagsPage;
