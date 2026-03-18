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
import {KeyboardStateProvider} from '@src/components/withKeyboardState';
import * as LHNTestUtils from './LHNTestUtils';

const defaultReport = LHNTestUtils.getFakeReport();

function ReportActionEditMessageContextProviderForReport({children}: PropsWithChildren) {
    return <ReportActionEditMessageContextProvider reportID={defaultReport.reportID}>{children}</ReportActionEditMessageContextProvider>;
}

function ReportScreenProviders({children}: PropsWithChildren) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, KeyboardStateProvider, ReportActionEditMessageContextProviderForReport]}>{children}</ComposeProviders>;
}

const defaultReportActionComposeProps: ReportActionComposeProps = {
    onSubmit: jest.fn(),
    isComposerFullSize: false,
    reportID: defaultReport.reportID,
    report: defaultReport,
};

function ReportActionComposeWrapper(props?: Partial<ReportActionComposeProps>) {
    return (
        <ReportScreenProviders>
            <ReportActionCompose
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultReportActionComposeProps}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </ReportScreenProviders>
    );
}

const renderReportActionCompose = (props?: Partial<ReportActionComposeProps>) => {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return render(<ReportActionComposeWrapper {...props} />);
};

const defaultReportActionItemMessageEditProps: ReportActionItemMessageEditProps = {
    action: LHNTestUtils.getFakeReportAction(),
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

export {ReportActionComposeWrapper, renderReportActionCompose, renderReportActionItemMessageEdit, renderReportActionMessageEditComponents};
