import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftValues} from '@libs/actions/FormActions';
import {searchInServer} from '@libs/actions/Report';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceConfirmationForm';
import type {Participant} from '@src/types/onyx/IOU';

function WorkspaceConfirmationOwnerSelectorPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: false});
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT, {canBeMissing: true});
    const currentOwner = draftValues?.owner ?? currentUserLogin ?? '';
    const ownerPersonalDetails = getPersonalDetailByEmail(currentOwner);
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const excludeLogins = useMemo(
        () => ({
            ...CONST.EXPENSIFY_EMAILS_OBJECT,
        }),
        [],
    );

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        excludeLogins,
        includeRecentReports: true,
        getValidOptionsConfig: {
            excludeLogins,
        },
    });

    const headerMessage = useMemo(() => {
        return getHeaderMessage(
            (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
            !!availableOptions.userToInvite,
            debouncedSearchTerm.trim(),
            countryCode,
            false,
        );
    }, [availableOptions.recentReports?.length, availableOptions.personalDetails?.length, availableOptions.userToInvite, debouncedSearchTerm, countryCode]);

    const sections = useMemo(() => {
        const sectionsList = [];

        if (currentOwner && ownerPersonalDetails) {
            sectionsList.push({
                title: undefined,
                data: [
                    {
                        ...ownerPersonalDetails,
                        text: ownerPersonalDetails?.displayName ?? currentOwner,
                        alternateText: ownerPersonalDetails?.login ?? currentOwner,
                        login: ownerPersonalDetails.login ?? currentOwner,
                        keyForList: `currentOwner-${ownerPersonalDetails.login}`,
                        isDisabled: false,
                        isSelected: true,
                        shouldShowSubscript: undefined,
                        icons: [
                            {
                                source: ownerPersonalDetails?.avatar ?? icons.FallbackAvatar,
                                name: formatPhoneNumber(ownerPersonalDetails?.login ?? ''),
                                type: CONST.ICON_TYPE_AVATAR,
                                id: ownerPersonalDetails?.accountID,
                            },
                        ],
                    },
                ],
                shouldShow: true,
            });
        }

        sectionsList.push({
            title: translate('common.recents'),
            data: availableOptions.recentReports,
            shouldShow: availableOptions.recentReports?.length > 0,
        });

        sectionsList.push({
            title: translate('common.contacts'),
            data: availableOptions.personalDetails,
            shouldShow: availableOptions.personalDetails?.length > 0,
        });

        if (availableOptions.userToInvite) {
            sectionsList.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                shouldShow: true,
            });
        }

        return sectionsList.map((section) => ({
            ...section,
            data: section.data.map((option) => ({
                ...option,
                text: option.text ?? option.displayName ?? '',
                alternateText: option.alternateText ?? option.login ?? undefined,
                keyForList: option.keyForList ?? '',
                isDisabled: option.isDisabled ?? undefined,
                isSelected: option.isSelected ?? undefined,
                login: option.login ?? undefined,
                shouldShowSubscript: option.shouldShowSubscript ?? undefined,
            })),
        }));
    }, [currentOwner, ownerPersonalDetails, translate, availableOptions.recentReports, availableOptions.personalDetails, availableOptions.userToInvite, icons.FallbackAvatar]);

    const onSelectRow = useCallback(
        (option: Participant) => {
            // Clear search to prevent "No results found" after selection
            setSearchTerm('');

            // Update the draft form with the selected owner
            const login = option?.login ?? '';

            setDraftValues(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM, {
                [INPUT_IDS.OWNER]: login,
            });

            // Navigate back to the confirmation form
            Navigation.goBack();
        },
        [setSearchTerm],
    );

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="WorkspaceConfirmationOwnerSelectorPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.common.workspaceOwner')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                <SelectionList
                    sections={areOptionsInitialized ? sections : []}
                    ListItem={UserListItem}
                    onSelectRow={onSelectRow}
                    shouldSingleExecuteRowSelect
                    onChangeText={setSearchTerm}
                    textInputValue={searchTerm}
                    headerMessage={headerMessage}
                    textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                    showLoadingPlaceholder={!areOptionsInitialized}
                    isLoadingNewOptions={!!isSearchingForReports}
                    onEndReached={onListEndReached}
                />
            </View>
        </ScreenWrapper>
    );
}

export default WorkspaceConfirmationOwnerSelectorPage;
