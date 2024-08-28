import type {StackScreenProps} from '@react-navigation/stack';
import isObject from 'lodash/isObject';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {DebugParamList} from '@libs/Navigation/types';
import {LAST_ACTION_TYPE} from '@pages/Debug/const';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type DebugReportLastActionPageProps = StackScreenProps<DebugParamList, typeof SCREENS.DEBUG.REPORT_ACTION_CREATE>;

const LastActionTypeList: string[] = Object.values(LAST_ACTION_TYPE).reduce((acc, value) => {
    if (isObject(value)) {
        acc.push(...Object.values(value));
        return acc;
    }

    acc.push(value);

    return acc;
}, [] as string[]);

function SelectionListLastActionType({
    route: {
        params: {reportID},
    },
}: DebugReportLastActionPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [searchValue, setSearchValue] = useState('');

    const selectedLastAction = report?.lastActionType ?? '';

    const searchValueUppercase = searchValue.toUpperCase();

    const sections = useMemo(
        () =>
            LastActionTypeList.filter((option) => option.includes(searchValueUppercase)).map((option) => ({
                text: option,
                keyForList: option,
                isSelected: option === selectedLastAction,
                searchText: option,
            })),
        [searchValueUppercase, selectedLastAction],
    );

    const selectedOptionKey = useMemo(() => (sections ?? []).filter((option) => option.searchText === selectedLastAction)[0]?.keyForList, [sections, selectedLastAction]);

    const onSubmit = (item: ListItem) => {
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {lastActionType: item.text as ValueOf<typeof CONST.REPORT.ACTIONS.TYPE>});
        Navigation.goBack();
    };

    return (
        <ScreenWrapper testID={SelectionListLastActionType.displayName}>
            <HeaderWithBackButton title={SelectionListLastActionType.displayName} />
            <View style={styles.containerWithSpaceBetween}>
                <SelectionList
                    sections={[{data: sections}]}
                    textInputValue={searchValue}
                    textInputLabel={translate('common.search')}
                    onChangeText={setSearchValue}
                    onSelectRow={onSubmit}
                    ListItem={RadioListItem}
                    initiallyFocusedOptionKey={selectedOptionKey ?? undefined}
                    isRowMultilineSupported
                />
            </View>
        </ScreenWrapper>
    );
}

SelectionListLastActionType.displayName = 'SelectionListLastActionType';

export default SelectionListLastActionType;
