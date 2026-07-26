import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {updateWriteCapability as updateWriteCapabilityUtil} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {canEditWriteCapability} from '@libs/ReportUtils';

import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {WriteCapability} from '@src/types/onyx/Report';

import React, {useState} from 'react';

type DynamicWriteCapabilityPageProps = WithReportOrNotFoundProps;

function DynamicWriteCapabilityPage({report, policy}: DynamicWriteCapabilityPageProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_SETTINGS_WRITE_CAPABILITY.path);
    const {translate} = useLocalize();
    const currentWriteCapability = report?.writeCapability ?? CONST.REPORT.WRITE_CAPABILITIES.ALL;

    // Keep the draft undefined until the user picks a row so we always fall back to the live write capability.
    // This avoids freezing a stale value that could be saved over an external update to report.writeCapability.
    const [draftWriteCapability, setDraftWriteCapability] = useState<WriteCapability | undefined>(undefined);
    const selectedWriteCapability = draftWriteCapability ?? currentWriteCapability;
    const writeCapabilityOptions = Object.values(CONST.REPORT.WRITE_CAPABILITIES).map((value) => ({
        value,
        text: translate(`writeCapabilityPage.writeCapability.${value}`),
        keyForList: value,
        isSelected: value === selectedWriteCapability,
    }));
    const isReportArchived = useReportIsArchived(report.reportID);
    const isAbleToEdit = canEditWriteCapability(report, policy, isReportArchived);

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const saveWriteCapability = () => {
        updateWriteCapabilityUtil(report, selectedWriteCapability);
        goBack();
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveWriteCapability,
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="WriteCapabilityPage"
        >
            <FullPageNotFoundView shouldShow={!isAbleToEdit}>
                <HeaderWithBackButton
                    title={translate('writeCapabilityPage.label')}
                    shouldShowBackButton
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    data={writeCapabilityOptions}
                    ListItem={SingleSelectListItem}
                    onSelectRow={(option) => setDraftWriteCapability(option.value)}
                    confirmButtonOptions={confirmButtonOptions}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={currentWriteCapability}
                    addBottomSafeAreaPadding
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicWriteCapabilityPage);
