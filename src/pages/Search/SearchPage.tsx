import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import SearchTableHeader from './SearchTableHeader';
import useCustomBackHandler from './useCustomBackHandler';

type SearchPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;

function SearchPage({route}: SearchPageProps) {
    useCustomBackHandler();

    return (
        <ScreenWrapper testID={SearchPage.displayName}>
            <HeaderWithBackButton
                title="All"
                icon={Illustrations.MoneyReceipts}
                shouldShowBackButton={false}
            />
            <SelectionList
                canSelectMultiple
                headerContent={<SearchTableHeader />}
                ListItem={UserListItem}
                onSelectRow={() => {}}
                sections={[]}
                onCheckboxPress={() => {}}
                shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            />
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';

export default SearchPage;
