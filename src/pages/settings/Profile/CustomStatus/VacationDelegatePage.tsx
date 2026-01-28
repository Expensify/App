import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {clearVacationDelegateError, deleteVacationDelegate, setVacationDelegate} from '@libs/actions/VacationDelegate';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Participant} from '@src/types/onyx/IOU';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionList from '@components/SelectionList/SelectionListWithSections';

function VacationDelegatePage() { 
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
    const [newVacationDelegate, setNewVacationDelegate] = useState('');
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: false});
    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {canBeMissing: true});
    const currentVacationDelegate = vacationDelegate?.delegate ?? '';
    const delegatePersonalDetails = getPersonalDetailByEmail(currentVacationDelegate);
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const excludeLogins = useMemo(
        () => ({
            ...CONST.EXPENSIFY_EMAILS_OBJECT,
            [currentVacationDelegate]: true,
        }),
        [currentVacationDelegate],
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

        if (vacationDelegate && delegatePersonalDetails) {
            sectionsList.push({
                title: undefined,
                sectionIndex: 0,
                data: [
                    {
                        ...delegatePersonalDetails,
                        text: delegatePersonalDetails?.displayName ?? vacationDelegate.delegate,
                        alternateText: delegatePersonalDetails?.login ?? vacationDelegate.delegate,
                        login: delegatePersonalDetails.login ?? vacationDelegate.delegate,
                        keyForList: `vacationDelegate-${delegatePersonalDetails.login}`,
                        isDisabled: false,
                        isSelected: true,
                        shouldShowSubscript: undefined,
                        icons: [
                            {
                                source: delegatePersonalDetails?.avatar ?? icons.FallbackAvatar,
                                name: formatPhoneNumber(delegatePersonalDetails?.login ?? ''),
                                type: CONST.ICON_TYPE_AVATAR,
                                id: delegatePersonalDetails?.accountID,
                            },
                        ],
                    },
                ],
            });
        }

        sectionsList.push({
            title: translate('common.recents'),
            sectionIndex: 1,
            data: availableOptions.recentReports,
        });

        sectionsList.push({
            title: translate('common.contacts'),
            sectionIndex: 2,
            data: availableOptions.personalDetails,
        });

        if (availableOptions.userToInvite) {
            sectionsList.push({
                title: undefined,
                sectionIndex: 3,
                data: [availableOptions.userToInvite],
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
    }, [vacationDelegate, delegatePersonalDetails, translate, availableOptions.recentReports, availableOptions.personalDetails, availableOptions.userToInvite, icons.FallbackAvatar]);

    const onSelectRow = useCallback(
        (option: Participant) => {
            // Clear search to prevent "No results found" after selection
            setSearchTerm('');

            if (option?.login === vacationDelegate?.delegate) {
                deleteVacationDelegate(vacationDelegate);
                Navigation.goBack(ROUTES.SETTINGS_STATUS);
                return;
            }

            setVacationDelegate(currentUserLogin ?? '', option?.login ?? '', false, vacationDelegate?.delegate).then((response) => {
                if (!response?.jsonCode) {
                    Navigation.goBack(ROUTES.SETTINGS_STATUS);
                    return;
                }

                if (response.jsonCode === CONST.JSON_CODE.POLICY_DIFF_WARNING) {
                    setIsWarningModalVisible(true);
                    setNewVacationDelegate(option?.login ?? '');
                    return;
                }

                Navigation.goBack(ROUTES.SETTINGS_STATUS);
            });
        },
        [currentUserLogin, vacationDelegate, setSearchTerm],
    );

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const textInputOptions = {
        value: searchTerm,
        onChangeText: setSearchTerm,
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
        <>
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID="VacationDelegatePage"
            >
                <HeaderWithBackButton
                    title={translate('statusPage.vacationDelegate')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
                />
                <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionList
                        sections={areOptionsInitialized ? sections : []}
                        ListItem={UserListItem}
                        onSelectRow={onSelectRow}
                        shouldSingleExecuteRowSelect
                        textInputOptions={textInputOptions}
                        shouldShowTextInput
                        showLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                        onEndReached={onListEndReached}
                    />
                </View>
            </ScreenWrapper>
            <ConfirmModal
                isVisible={isWarningModalVisible}
                title={translate('common.headsUp')}
                prompt={translate('statusPage.vacationDelegateWarning', {nameOrEmail: getPersonalDetailByEmail(newVacationDelegate)?.displayName ?? newVacationDelegate})}
                onConfirm={() => {
                    setIsWarningModalVisible(false);
                    setVacationDelegate(currentUserLogin ?? '', newVacationDelegate, true, vacationDelegate?.delegate).then(() => Navigation.goBack(ROUTES.SETTINGS_STATUS));
                }}
                onCancel={() => {
                    setIsWarningModalVisible(false);
                    clearVacationDelegateError(vacationDelegate?.previousDelegate);
                }}
                confirmText={translate('common.confirm')}
                cancelText={translate('common.cancel')}
            />
        </>
    );
}

export default VacationDelegatePage;
