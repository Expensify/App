import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportLayoutGroupBy, setReportLayoutGroupBy} from '@libs/actions/ReportLayout';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportSettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReportLayoutGroupBy} from '@src/types/onyx';

type ReportLayoutItem = ListItem & {
    value: ReportLayoutGroupBy;
};

type ReportLayoutPageProps = PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.REPORT_LAYOUT>;

function ReportLayoutPage({route}: ReportLayoutPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [reportLayoutGroupByNVP] = useOnyx(ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY, {canBeMissing: true});

    const {reportID} = route.params;
    const currentGroupBy = getReportLayoutGroupBy(reportLayoutGroupByNVP);

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
    }, [reportID]);

    const onSelectGroupBy = useCallback(
        (item: ReportLayoutItem) => {
            if (item.value === currentGroupBy) {
                goBack();
                return;
            }
            setReportLayoutGroupBy(item.value, reportLayoutGroupByNVP);
            goBack();
        },
        [currentGroupBy, reportLayoutGroupByNVP, goBack],
    );

    const layoutOptions: ReportLayoutItem[] = [
        {
            text: translate('reportLayout.groupBy.category'),
            keyForList: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
            value: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
            isSelected: currentGroupBy === CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
        },
        {
            text: translate('reportLayout.groupBy.tag'),
            keyForList: CONST.REPORT_LAYOUT.GROUP_BY.TAG,
            value: CONST.REPORT_LAYOUT.GROUP_BY.TAG,
            isSelected: currentGroupBy === CONST.REPORT_LAYOUT.GROUP_BY.TAG,
        },
    ];

    if (!reportID) {
        return null;
    }

    return (
        <ScreenWrapper
            testID={ReportLayoutPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('reportLayout.reportLayout')}
                onBackButtonPress={goBack}
            />
            <Text style={[styles.textLabel, styles.mh5, styles.mv3]}>{translate('reportLayout.groupByLabel')}</Text>
            <SelectionList
                data={layoutOptions}
                ListItem={RadioListItem}
                onSelectRow={onSelectGroupBy}
                initiallyFocusedItemKey={layoutOptions.find((option) => option.isSelected)?.keyForList}
            />
        </ScreenWrapper>
    );
}

ReportLayoutPage.displayName = 'ReportLayoutPage';

export default ReportLayoutPage;
