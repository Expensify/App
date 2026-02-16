import {render} from '@testing-library/react-native';
import type {PropsWithChildren} from 'react';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ReportActionComposeProps} from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import ReportActionCompose from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import {ReportActionEditMessageContextProvider} from '@pages/inbox/report/ReportActionEditMessageContext';
import type {ReportActionItemMessageEditProps} from '@pages/inbox/report/ReportActionItemMessageEdit';
import ReportActionItemMessageEdit from '@pages/inbox/report/ReportActionItemMessageEdit';
import * as LHNTestUtils from './LHNTestUtils';

const defaultReport = LHNTestUtils.getFakeReport();

function ReportActionEditMessageContextProviderForReport({children}: PropsWithChildren) {
    return <ReportActionEditMessageContextProvider reportID={defaultReport.reportID}>{children}</ReportActionEditMessageContextProvider>;
}

function ReportScreenProviders({children}: PropsWithChildren) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, ReportActionEditMessageContextProviderForReport]}>{children}</ComposeProviders>;
}

const defaultReportActionComposeProps: ReportActionComposeProps = {
    onSubmit: jest.fn(),
    isComposerFullSize: false,
    reportID: defaultReport.reportID,
    report: defaultReport,
};

const renderReportActionCompose = (props?: Partial<ReportActionComposeProps>) => {
    return render(
        <ReportScreenProviders>
            <ReportActionCompose
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultReportActionComposeProps}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </ReportScreenProviders>,
    );
};

const defaultReportActionItemMessageEditProps: ReportActionItemMessageEditProps = {
    action: LHNTestUtils.getFakeReportAction(),
    draftMessage: '',
    reportID: defaultReport.reportID,
    originalReportID: defaultReport.reportID,
    index: 0,
    isGroupPolicyReport: false,
};

const renderReportActionItemMessageEdit = (props?: Partial<ReportActionItemMessageEditProps>) => {
    return render(
        <ReportScreenProviders>
            <ReportActionItemMessageEdit
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultReportActionItemMessageEditProps}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </ReportScreenProviders>,
    );
};

const renderReportActionMessageEditComponents = (
    reportActionComposeProps?: Partial<ReportActionComposeProps>,
    reportActionItemMessageEditProps?: Partial<ReportActionItemMessageEditProps>,
) => {
    return render(
        <ReportScreenProviders>
            <ReportActionCompose
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultReportActionComposeProps}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...reportActionComposeProps}
            />
            <ReportActionItemMessageEdit
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultReportActionItemMessageEditProps}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...reportActionItemMessageEditProps}
            />
        </ReportScreenProviders>,
    );
};

export {renderReportActionCompose, renderReportActionItemMessageEdit, renderReportActionMessageEditComponents};
