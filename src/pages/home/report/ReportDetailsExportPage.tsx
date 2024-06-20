import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportDetailsExportPageProps = StackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.EXPORT>;

function ReportDetailsExportPage({route}: ReportDetailsExportPageProps) {
    const reportID = route.params.reportID;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScreenWrapper testID={ReportDetailsExportPage.displayName}>
            <FullPageNotFoundView shouldShow={isEmptyObject(report)}>
                <HeaderWithBackButton title={translate('workspace.qbo.export')} />
                <ScrollView style={[styles.flex1]}>
                    <Text>{report?.policyName}</Text>
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportDetailsExportPage.displayName = 'ReportDetailsExportPage';

export default ReportDetailsExportPage;
