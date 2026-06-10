import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportLayoutSelection, setReportLayout} from '@libs/actions/ReportLayout';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportLayoutSelection} from '@src/types/onyx';

type ReportLayoutItem = ListItem & {
    value: ReportLayoutSelection;
};

function ReportLayoutPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [reportLayoutGroupByNVP] = useOnyx(ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY);
    const [reportLayoutOptionNVP] = useOnyx(ONYXKEYS.NVP_REPORT_LAYOUT_OPTION);

    const currentSelection = getReportLayoutSelection(reportLayoutOptionNVP, reportLayoutGroupByNVP);

    const goBack = useCallback(() => {
        Navigation.goBack();
    }, []);

    const onSelectGroupBy = useCallback(
        (item: ReportLayoutItem) => {
            if (item.value === currentSelection) {
                goBack();
                return;
            }
            setReportLayout(item.value, reportLayoutOptionNVP, reportLayoutGroupByNVP);
            goBack();
        },
        [currentSelection, reportLayoutOptionNVP, reportLayoutGroupByNVP, goBack],
    );

    const layoutOptions: ReportLayoutItem[] = [
        {
            text: translate('reportLayout.groupBy.category'),
            keyForList: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
            value: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
            isSelected: currentSelection === CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
        },
        {
            text: translate('reportLayout.groupBy.tag'),
            keyForList: CONST.REPORT_LAYOUT.GROUP_BY.TAG,
            value: CONST.REPORT_LAYOUT.GROUP_BY.TAG,
            isSelected: currentSelection === CONST.REPORT_LAYOUT.GROUP_BY.TAG,
        },
        {
            text: translate('common.none'),
            keyForList: CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX,
            value: CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX,
            isSelected: currentSelection === CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX,
        },
    ];

    return (
        <ScreenWrapper
            testID="ReportLayoutPage"
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('reportLayout.reportLayout')}
                onBackButtonPress={goBack}
            />
            <Text style={[styles.textLabel, styles.textSupporting, styles.mh5, styles.mv3]}>{translate('reportLayout.groupByLabel')}</Text>
            <SelectionList
                data={layoutOptions}
                ListItem={SingleSelectListItem}
                onSelectRow={onSelectGroupBy}
                initiallyFocusedItemKey={layoutOptions.find((option) => option.isSelected)?.keyForList}
            />
        </ScreenWrapper>
    );
}

export default ReportLayoutPage;
