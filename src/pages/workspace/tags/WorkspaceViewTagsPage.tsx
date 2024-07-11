import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Tag from '@userActions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {TagListItem} from './types';

type WorkspaceViewTagsProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TAG_LIST_VIEW>;

function WorkspaceViewTagsPage({route}: WorkspaceViewTagsProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
    const dropdownButtonRef = useRef(null);
    const [isDeleteTagsConfirmModalVisible, setIsDeleteTagsConfirmModalVisible] = useState(false);
    const isFocused = useIsFocused();
    const policyID = route.params.policyID ?? '-1';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const currentTagListName = useMemo(() => PolicyUtils.getTagListName(policyTags, route.params.orderWeight), [policyTags, route.params.orderWeight]);
    const currentPolicyTag = policyTags?.[currentTagListName];

    const fetchTags = useCallback(() => {
        Tag.openPolicyTagsPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchTags});

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedTags({});
    }, [isFocused]);

    const tagList = useMemo<TagListItem[]>(
        () =>
            Object.values(currentPolicyTag?.tags ?? {})
                .sort((tagA, tagB) => localeCompare(tagA.name, tagB.name))
                .map((tag) => ({
                    value: tag.name,
                    text: PolicyUtils.getCleanedTagName(tag.name),
                    keyForList: tag.name,
                    isSelected: selectedTags[tag.name],
                    pendingAction: tag.pendingAction,
                    errors: tag.errors ?? undefined,
                    enabled: tag.enabled,
                    isDisabled: tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    rightElement: <ListItemRightCaretWithLabel labelText={tag.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')} />,
                })),
        [currentPolicyTag, selectedTags, translate],
    );

    const hasDependentTags = useMemo(() => PolicyUtils.hasDependentTags(policy, policyTags), [policy, policyTags]);

    const tagListKeyedByName = useMemo(
        () =>
            tagList.reduce<Record<string, TagListItem>>((acc, tag) => {
                acc[tag.value] = tag;
                return acc;
            }, {}),
        [tagList],
    );

    if (!currentPolicyTag) {
        return <NotFoundPage />;
    }

    const toggleTag = (tag: TagListItem) => {
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

    const navigateToTagSettings = (tag: TagListItem) => {
        Navigation.navigate(ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(policyID, route.params.orderWeight, tag.value));
    };

    const selectedTagsArray = Object.keys(selectedTags).filter((key) => selectedTags[key]);

    const deleteTags = () => {
        setSelectedTags({});
        Tag.deletePolicyTags(policyID, selectedTagsArray);
        setIsDeleteTagsConfirmModalVisible(false);
    };

    const isLoading = !isOffline && policyTags === undefined;

    const getHeaderButtons = () => {
        if (selectedTagsArray.length === 0) {
            return null;
        }

        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];
        const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;
        const isMultiLevelTags = PolicyUtils.isMultiLevelTags(policyTags);

        if (!isThereAnyAccountingConnection && !isMultiLevelTags) {
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
                    Tag.setWorkspaceTagEnabled(policyID, tagsToDisable, route.params.orderWeight);
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
                    Tag.setWorkspaceTagEnabled(policyID, tagsToEnable, route.params.orderWeight);
                },
            });
        }

        return (
            <ButtonWithDropdownMenu
                buttonRef={dropdownButtonRef}
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

    const navigateToEditTag = () => {
        Navigation.navigate(ROUTES.WORKSPACE_EDIT_TAGS.getRoute(route.params.policyID, currentPolicyTag?.orderWeight));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={WorkspaceViewTagsPage.displayName}
            >
                <HeaderWithBackButton title={currentTagListName}>{!isSmallScreenWidth && getHeaderButtons()}</HeaderWithBackButton>
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
                {!hasDependentTags && (
                    <View style={[styles.pv4, styles.ph5]}>
                        <ToggleSettingOptionRow
                            title={translate('common.required')}
                            switchAccessibilityLabel={translate('common.required')}
                            isActive={!!currentPolicyTag?.required}
                            onToggle={(on) => Tag.setPolicyTagsRequired(policyID, on, route.params.orderWeight)}
                            pendingAction={currentPolicyTag.pendingFields?.required}
                            errors={currentPolicyTag?.errorFields?.required ?? undefined}
                            onCloseError={() => Tag.clearPolicyTagListErrorField(policyID, route.params.orderWeight, 'required')}
                            disabled={!currentPolicyTag?.required && !Object.values(currentPolicyTag?.tags ?? {}).some((tag) => tag.enabled)}
                        />
                    </View>
                )}
                <OfflineWithFeedback
                    errors={currentPolicyTag.errors}
                    onClose={() => Tag.clearPolicyTagListErrors(policyID, currentPolicyTag.orderWeight)}
                    pendingAction={currentPolicyTag.pendingAction}
                    errorRowStyles={styles.mh5}
                >
                    <MenuItemWithTopDescription
                        title={PolicyUtils.getCleanedTagName(currentPolicyTag.name)}
                        description={translate(`workspace.tags.customTagName`)}
                        onPress={navigateToEditTag}
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.spinner}
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
                        onDismissError={(item) => {
                            Tag.clearPolicyTagErrors(policyID, item.value, route.params.orderWeight);
                        }}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceViewTagsPage.displayName = 'WorkspaceViewTagsPage';

export default WorkspaceViewTagsPage;
