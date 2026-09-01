import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';

type BooleanOption = ListItem & {
    value: boolean;
};

function SearchEditMultipleBooleanPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);

    const isBillableScreen = route.name === SCREENS.SEARCH.EDIT_MULTIPLE_BILLABLE_RHP;
    const persistedValue = isBillableScreen ? draftTransaction?.billable : draftTransaction?.reimbursable;
    const title = isBillableScreen ? translate('common.billable') : translate('common.reimbursable');
    const testID = isBillableScreen ? 'SearchEditMultipleBillablePage' : 'SearchEditMultipleReimbursablePage';

    const [draftValue, setDraftValue] = useState<boolean | null>();
    const selectedValue = draftValue === undefined ? persistedValue : draftValue;

    const items = useMemo(
        () => [
            {
                value: true,
                keyForList: CONST.SEARCH.BOOLEAN.YES,
                text: translate('common.yes'),
                isSelected: selectedValue === true,
            },
            {
                value: false,
                keyForList: CONST.SEARCH.BOOLEAN.NO,
                text: translate('common.no'),
                isSelected: selectedValue === false,
            },
        ],
        [selectedValue, translate],
    );

    const selectValue = (item: BooleanOption) => {
        setDraftValue((prev) => {
            const current = prev === undefined ? persistedValue : prev;
            return current === item.value ? null : item.value;
        });
    };

    const saveAndGoBack = () => {
        if (isBillableScreen) {
            updateBulkEditDraftTransaction({billable: selectedValue ?? null});
        } else {
            updateBulkEditDraftTransaction({reimbursable: selectedValue ?? null});
        }
        Navigation.goBack();
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveAndGoBack,
        isDisabled: (selectedValue ?? null) === (persistedValue ?? null),
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={testID}
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    data={items}
                    ListItem={SingleSelectListItem}
                    onSelectRow={selectValue}
                    confirmButtonOptions={confirmButtonOptions}
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchEditMultipleBooleanPage;
