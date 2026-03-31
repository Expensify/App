import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import useLocalize from '@hooks/useLocalize';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import {useInboxPanelActions} from './InboxPanelContext';

type InboxStackParamList = {
    InboxList: undefined;
    InboxReport: {reportID: string};
};

function InboxListScreen() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const navigation = useNavigation<StackNavigationProp<InboxStackParamList>>();
    const {orderedReports} = useSidebarOrderedReportsState('InboxSidePanel');
    const {registerPanelNavigation} = useInboxPanelActions();

    // Register this screen's navigation so external callers (e.g. the main LHN)
    // can open a report inside the panel by calling navigateToReport().
    useEffect(() => {
        registerPanelNavigation((reportID: string) => {
            navigation.navigate('InboxReport', {reportID});
        });
    }, [navigation, registerPanelNavigation]);

    const onSelectRow = useCallback(
        (option: OptionData) => {
            if (!option.reportID) {
                return;
            }
            navigation.navigate('InboxReport', {reportID: option.reportID});
        },
        [navigation],
    );

    return (
        <View style={[styles.flex1, styles.h100, styles.appBG]}>
            <TopBarWithLoadingBar
                breadcrumbLabel={translate('common.inbox')}
                shouldDisplaySearch={false}
                shouldDisplayHelpButton={false}
            />
            <LHNOptionsList
                style={styles.flex1}
                data={orderedReports}
                onSelectRow={onSelectRow}
                optionMode={CONST.OPTION_MODE.DEFAULT}
                onFirstItemRendered={() => {}}
            />
        </View>
    );
}

export default InboxListScreen;
