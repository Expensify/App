import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

type BooleanOption = ListItem & {
    value: boolean;
};

function SearchEditMultipleBooleanPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});

    const isBillableScreen = route.name === SCREENS.SEARCH.EDIT_MULTIPLE_BILLABLE_RHP;
    const selectedValue = isBillableScreen ? draftTransaction?.billable : draftTransaction?.reimbursable;
    const title = isBillableScreen ? translate('common.billable') : translate('common.reimbursable');
    const testID = isBillableScreen ? 'SearchEditMultipleBillablePage' : 'SearchEditMultipleReimbursablePage';

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
        const shouldClear = selectedValue === item.value;
        if (isBillableScreen) {
            updateBulkEditDraftTransaction({billable: shouldClear ? null : item.value});
        } else {
            updateBulkEditDraftTransaction({reimbursable: shouldClear ? null : item.value});
        }
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
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
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchEditMultipleBooleanPage;
