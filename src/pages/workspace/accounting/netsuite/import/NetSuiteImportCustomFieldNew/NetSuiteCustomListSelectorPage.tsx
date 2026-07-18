import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {CustomListSelectorType} from '@pages/workspace/accounting/netsuite/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';

import {Str} from 'expensify-common';
import React, {useMemo} from 'react';

type NetSuiteCustomListSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_LIST_SELECTOR>;

function NetSuiteCustomListSelectorPage({
    route: {
        params: {policyID, action},
    },
}: NetSuiteCustomListSelectorPageProps) {
    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const policy = usePolicy(policyID);
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM_DRAFT);
    const currentCustomListValue = formDraft?.[INPUT_IDS.LIST_NAME] ?? '';

    const rawCustomLists = policy?.connections?.netsuite?.options?.data?.customLists;

    const {options, showTextInput} = useMemo(() => {
        const customLists = rawCustomLists ?? [];
        const customListData = customLists.map((customListRecord) => ({
            text: customListRecord.name,
            value: customListRecord.name,
            isSelected: customListRecord.name === currentCustomListValue,
            keyForList: customListRecord.name,
            id: customListRecord.id,
        }));

        const searchRegex = new RegExp(Str.escapeForRegExp(debouncedSearchValue.trim()), 'i');
        const filteredCustomLists = customListData.filter((customListRecord) => searchRegex.test(customListRecord.text ?? ''));
        const isEmpty = debouncedSearchValue.trim() && !filteredCustomLists.length;

        return {
            options: isEmpty ? [] : filteredCustomLists,
            showTextInput: customListData.length >= CONST.STANDARD_LIST_ITEM_LIMIT,
        };
    }, [debouncedSearchValue, rawCustomLists, currentCustomListValue]);

    const textInputOptions = useMemo(
        () => ({
            value: searchValue,
            label: showTextInput ? translate('common.search') : undefined,
            onChangeText: setSearchValue,
            headerMessage: debouncedSearchValue.trim() && options.length === 0 ? translate('common.noResultsFound') : '',
        }),
        [searchValue, showTextInput, translate, setSearchValue, debouncedSearchValue, options.length],
    );

    const label = translate('workspace.netsuite.import.importCustomFields.customLists.fields.listName');

    const goBack = () =>
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD.getRoute(policyID, CONST.NETSUITE_CONFIG.NETSUITE_ADD_CUSTOM_LIST.PAGE_NAME.NAME, action));

    const onSelectRow = (item: CustomListSelectorType) => {
        setDraftValues(ONYXKEYS.FORMS.NETSUITE_CUSTOM_LIST_ADD_FORM, {
            [INPUT_IDS.LIST_NAME]: item.value,
            [INPUT_IDS.INTERNAL_ID]: item.id,
        });
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includePaddingTop={false}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="NetSuiteCustomListSelectorPage"
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    data={options}
                    textInputOptions={textInputOptions}
                    onSelectRow={onSelectRow}
                    ListItem={SingleSelectListItem}
                    initiallyFocusedItemKey={currentCustomListValue}
                    shouldSingleExecuteRowSelect
                    shouldStopPropagation
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

NetSuiteCustomListSelectorPage.displayName = 'NetSuiteCustomListSelectorPage';

export default NetSuiteCustomListSelectorPage;
