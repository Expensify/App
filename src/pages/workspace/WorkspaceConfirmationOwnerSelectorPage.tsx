import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
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
import type {OptionWithKey} from '@libs/OptionsListUtils/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {generateAccountID} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceConfirmationForm';
import type {Participant} from '@src/types/onyx/IOU';
import type IconAsset from '@src/types/utils/IconAsset';

/**
 * Helper function to create a formatted user list item
 */
function createUserListItem(
    personalDetails: ReturnType<typeof getPersonalDetailByEmail>,
    login: string,
    keyPrefix: string,
    isSelected: boolean,
    fallBackAvatarIcon: IconAsset,
): OptionWithKey {
    const accountID = personalDetails?.accountID ?? generateAccountID(login);
    return {
        ...(personalDetails ?? {}),
        text: personalDetails?.displayName ?? login,
        alternateText: personalDetails?.login ?? login,
        login: personalDetails?.login ?? login,
        keyForList: `${keyPrefix}-${personalDetails?.login ?? login}`,
        accountID,
        isSelected,
        shouldShowSubscript: undefined,
        icons: [
            {
                source: personalDetails?.avatar ?? fallBackAvatarIcon,
                name: formatPhoneNumber(personalDetails?.login ?? login),
                type: CONST.ICON_TYPE_AVATAR,
                id: accountID,
            },
        ],
    };
}

function WorkspaceConfirmationOwnerSelectorPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);

    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT);
    const currentOwner = draftValues?.owner ?? currentUserLogin ?? '';
    const ownerPersonalDetails = getPersonalDetailByEmail(currentOwner);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.OWNER_SELECTOR.path);

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

    const sections = useMemo(() => {
        const sectionsList = [];
        const currentUserPersonalDetails = getPersonalDetailByEmail(currentUserLogin ?? '');

        if (currentOwner) {
            const ownerItem = createUserListItem(ownerPersonalDetails, currentOwner, 'currentOwner', true, icons.FallbackAvatar);
            sectionsList.push({
                data: [ownerItem],
                sectionIndex: 0,
            });
        }

        if (currentUserLogin && currentUserLogin !== currentOwner) {
            const currentUserItem = createUserListItem(currentUserPersonalDetails, currentUserLogin, 'currentUser', false, icons.FallbackAvatar);
            sectionsList.push({
                data: [currentUserItem],
                sectionIndex: 1,
            });
        }

        const filteredRecentReports = availableOptions.recentReports?.filter((report) => report.login !== currentOwner) ?? [];
        if (filteredRecentReports.length > 0) {
            sectionsList.push({
                title: translate('common.recents'),
                data: filteredRecentReports,
                sectionIndex: 2,
            });
        }

        const filteredPersonalDetails = availableOptions.personalDetails?.filter((contact) => contact.login !== currentOwner) ?? [];
        if (filteredPersonalDetails.length > 0) {
            sectionsList.push({
                title: translate('common.contacts'),
                data: filteredPersonalDetails,
                sectionIndex: 3,
            });
        }

        if (availableOptions.userToInvite && availableOptions.userToInvite.login !== currentOwner) {
            sectionsList.push({
                data: [availableOptions.userToInvite],
                sectionIndex: 4,
            });
        }

        return sectionsList;
    }, [
        currentOwner,
        currentUserLogin,
        ownerPersonalDetails,
        translate,
        availableOptions.recentReports,
        availableOptions.personalDetails,
        availableOptions.userToInvite,
        icons.FallbackAvatar,
    ]);

    const onSelectRow = useCallback(
        (option: Participant) => {
            // Clear search to prevent "No results found" after selection
            setSearchTerm('');

            setDraftValues(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM, {
                [INPUT_IDS.OWNER]: option?.login,
            });

            // Navigate back to the confirmation form
            Navigation.goBack(backPath);
        },
        [setSearchTerm, backPath],
    );

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const textInputOptions = {
        onChangeText: setSearchTerm,
        value: searchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        headerMessage: getHeaderMessage(
            (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
            !!availableOptions.userToInvite,
            debouncedSearchTerm.trim(),
            countryCode,
            false,
        ),
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="WorkspaceConfirmationOwnerSelectorPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.common.workspaceOwner')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                <SelectionListWithSections
                    sections={areOptionsInitialized ? sections : []}
                    ListItem={UserListItem}
                    onSelectRow={onSelectRow}
                    shouldShowTextInput
                    textInputOptions={textInputOptions}
                    shouldShowLoadingPlaceholder={!areOptionsInitialized}
                    isLoadingNewOptions={!!isSearchingForReports}
                    onEndReached={onListEndReached}
                    shouldSingleExecuteRowSelect
                />
            </View>
        </ScreenWrapper>
    );
}

export default WorkspaceConfirmationOwnerSelectorPage;
