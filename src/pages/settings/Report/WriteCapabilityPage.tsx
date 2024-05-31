import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

type WriteCapabilityPageOnyxProps = {
    /** The policy object for the current route */
    policy: OnyxEntry<Policy>;
};

type WriteCapabilityPageProps = WriteCapabilityPageOnyxProps &
    WithReportOrNotFoundProps &
    StackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY>;

function WriteCapabilityPage({report, policy}: WriteCapabilityPageProps) {
    const {translate} = useLocalize();
    const writeCapabilityOptions = Object.values(CONST.REPORT.WRITE_CAPABILITIES).map((value) => ({
        value,
        text: translate(`writeCapabilityPage.writeCapability.${value}`),
        keyForList: value,
        isSelected: value === (report?.writeCapability ?? CONST.REPORT.WRITE_CAPABILITIES.ALL),
    }));

    const isAbleToEdit = ReportUtils.canEditWriteCapability(report, policy);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WriteCapabilityPage.displayName}
        >
            <FullPageNotFoundView shouldShow={!isAbleToEdit}>
                <HeaderWithBackButton
                    title={translate('writeCapabilityPage.label')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report?.reportID ?? ''))}
                />
                <SelectionList
                    sections={[{data: writeCapabilityOptions}]}
                    ListItem={RadioListItem}
                    onSelectRow={(option) => report && ReportActions.updateWriteCapabilityAndNavigate(report, option.value)}
                    shouldDebounceRowSelect
                    initiallyFocusedOptionKey={writeCapabilityOptions.find((locale) => locale.isSelected)?.keyForList}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WriteCapabilityPage.displayName = 'WriteCapabilityPage';

export default withReportOrNotFound()(
    withOnyx<WriteCapabilityPageProps, WriteCapabilityPageOnyxProps>({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`,
        },
    })(WriteCapabilityPage),
);
