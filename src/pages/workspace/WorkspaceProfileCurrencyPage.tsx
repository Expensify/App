import React, {useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrencyList} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AdminPolicyAccessOrNotFoundWrapper from './AdminPolicyAccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceProfileCurrentPageOnyxProps = {
    /** Constant, list of available currencies */
    currencyList: OnyxEntry<CurrencyList>;
};

type WorkspaceProfileCurrentPageProps = WithPolicyAndFullscreenLoadingProps & WorkspaceProfileCurrentPageOnyxProps;

type WorkspaceProfileCurrencyPageSectionItem = {
    text: string;
    keyForList: string;
    isSelected: boolean;
};

const getDisplayText = (currencyCode: string, currencySymbol: string) => `${currencyCode} - ${currencySymbol}`;

function WorkspaceProfileCurrencyPage({currencyList = {}, policy}: WorkspaceProfileCurrentPageProps) {
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');
    const trimmedText = searchText.trim().toLowerCase();
    const currencyListKeys = Object.keys(currencyList ?? {});

    const filteredItems = currencyListKeys.filter((currencyCode: string) => {
        const currency = currencyList?.[currencyCode];
        return getDisplayText(currencyCode, currency?.symbol ?? '')
            .toLowerCase()
            .includes(trimmedText);
    });

    let initiallyFocusedOptionKey;

    const currencyItems: WorkspaceProfileCurrencyPageSectionItem[] = filteredItems.map((currencyCode: string) => {
        const currency = currencyList?.[currencyCode];
        const isSelected = policy?.outputCurrency === currencyCode;

        if (isSelected) {
            initiallyFocusedOptionKey = currencyCode;
        }

        return {
            text: getDisplayText(currencyCode, currency?.symbol ?? ''),
            keyForList: currencyCode,
            isSelected,
        };
    });

    const sections = [{data: currencyItems}];

    const headerMessage = searchText.trim() && !currencyItems.length ? translate('common.noResultsFound') : '';

    const onSelectCurrency = (item: WorkspaceProfileCurrencyPageSectionItem) => {
        Policy.updateGeneralSettings(policy?.id ?? '', policy?.name ?? '', item.keyForList);
        Navigation.goBack();
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper
            policyID={policy?.id ?? ''}
            onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
            subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceProfileCurrencyPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.editor.currencyInputLabel')}
                    onBackButtonPress={() => Navigation.goBack()}
                />

                <SelectionList
                    sections={sections}
                    ListItem={RadioListItem}
                    textInputLabel={translate('workspace.editor.currencyInputLabel')}
                    textInputValue={searchText}
                    onChangeText={setSearchText}
                    onSelectRow={onSelectCurrency}
                    headerMessage={headerMessage}
                    initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                    showScrollIndicator
                />
            </ScreenWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceProfileCurrencyPage.displayName = 'WorkspaceProfileCurrencyPage';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspaceProfileCurrentPageProps, WorkspaceProfileCurrentPageOnyxProps>({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    })(WorkspaceProfileCurrencyPage),
);
