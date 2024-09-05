import type {StackScreenProps} from '@react-navigation/stack';
import isObject from 'lodash/isObject';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {DebugParamList} from '@libs/Navigation/types';
import Debug from '@userActions/Debug';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type DebugReportActionTypeListPageProps = StackScreenProps<DebugParamList, typeof SCREENS.DEBUG.DEBUG_REPORT_ACTION_TYPE_LIST>;

const reportActionTypeList = Object.values(CONST.REPORT.ACTIONS.TYPE).reduce((acc: string[], value) => {
    if (isObject(value)) {
        acc.push(...Object.values(value));
        return acc;
    }

    acc.push(value);

    return acc;
}, []);

function DebugReportActionTypeListPage({
    route: {
        params: {reportID, reportActionID},
    },
}: DebugReportActionTypeListPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        selector: (reportActions) => reportActions?.[reportActionID ?? ''],
    });

    const [searchValue, setSearchValue] = useState('');

    const selectedAction = reportAction?.actionName ?? report?.lastActionType ?? '';

    const searchValueUppercase = searchValue.toUpperCase();

    const sections = useMemo(
        () =>
            reportActionTypeList
                .filter((option) => option.includes(searchValueUppercase))
                .map(
                    (option): ListItem => ({
                        text: option,
                        keyForList: option,
                        isSelected: option === selectedAction,
                        searchText: option,
                    }),
                ),
        [searchValueUppercase, selectedAction],
    );

    const selectedOptionKey = useMemo(() => (sections ?? []).filter((option) => option.searchText === selectedAction)[0]?.keyForList, [sections, selectedAction]);

    const onSubmit = (item: ListItem) => {
        if (reportActionID) {
            Debug.mergeDebugData(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[reportActionID]: {actionName: item.text as DeepValueOf<typeof CONST.REPORT.ACTIONS.TYPE>}});
        } else {
            Debug.mergeDebugData(ONYXKEYS.FORMS.DEBUG_REPORT_PAGE_FORM_DRAFT, {lastActionType: item.text as DeepValueOf<typeof CONST.REPORT.ACTIONS.TYPE>});
        }
        Navigation.goBack();
    };

    return (
        <ScreenWrapper testID={DebugReportActionTypeListPage.displayName}>
            <HeaderWithBackButton title={DebugReportActionTypeListPage.displayName} />
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

DebugReportActionTypeListPage.displayName = 'DebugReportActionTypeListPage';

export default DebugReportActionTypeListPage;
