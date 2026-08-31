import {act, render} from '@testing-library/react-native';

import {ExportDownloadStatusProvider, useExportDownloadStatus} from '@components/MoneyReportHeaderActions/ExportDownloadStatusProvider';

import useExportDownloadStatusModal from '@hooks/useExportDownloadStatusModal';

import React from 'react';
import {Text} from 'react-native';

const mockExportDownloadStatusModal = jest.fn(({exportID}: {exportID: string}) => <Text testID="export-status-modal">{exportID}</Text>);
jest.mock('@components/ExportDownloadStatusModal', () => ({
    __esModule: true,
    default: (props: {exportID: string}) => mockExportDownloadStatusModal(props),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionActions: () => ({clearSelectedTransactions: jest.fn()}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));

let trackExportFromBranch: ((exportID: string) => void) | undefined;

// Two distinct component types, like SearchPageNarrow / SearchPageWide: swapping between them unmounts one
// subtree and mounts the other, so any state owned inside a branch is destroyed.
function WideBranch() {
    trackExportFromBranch = useExportDownloadStatus().trackExport;
    return <Text>wide</Text>;
}

function NarrowBranch() {
    trackExportFromBranch = useExportDownloadStatus().trackExport;
    return <Text>narrow</Text>;
}

function ProviderHarness({shouldUseNarrowLayout}: {shouldUseNarrowLayout: boolean}) {
    return <ExportDownloadStatusProvider>{shouldUseNarrowLayout ? <NarrowBranch /> : <WideBranch />}</ExportDownloadStatusProvider>;
}

// The pre-fix shape: each branch owns the tracking state and renders the modal itself.
function WideBranchOwningState() {
    const {trackExport, exportDownloadStatusModal} = useExportDownloadStatusModal();
    trackExportFromBranch = trackExport;
    return (
        <>
            <Text>wide</Text>
            {exportDownloadStatusModal}
        </>
    );
}

function NarrowBranchOwningState() {
    const {trackExport, exportDownloadStatusModal} = useExportDownloadStatusModal();
    trackExportFromBranch = trackExport;
    return (
        <>
            <Text>narrow</Text>
            {exportDownloadStatusModal}
        </>
    );
}

function InBranchHarness({shouldUseNarrowLayout}: {shouldUseNarrowLayout: boolean}) {
    return shouldUseNarrowLayout ? <NarrowBranchOwningState /> : <WideBranchOwningState />;
}

describe('ExportDownloadStatusProvider', () => {
    beforeEach(() => {
        trackExportFromBranch = undefined;
    });

    it('keeps tracking an in-flight export when the layout branch below it remounts', () => {
        const {rerender, queryByTestId} = render(<ProviderHarness shouldUseNarrowLayout={false} />);

        act(() => {
            trackExportFromBranch?.('export-1');
        });
        expect(queryByTestId('export-status-modal')).not.toBeNull();

        // Cross the narrow/wide breakpoint mid-export, e.g. by resizing the browser.
        rerender(<ProviderHarness shouldUseNarrowLayout />);

        expect(queryByTestId('export-status-modal')).not.toBeNull();
    });

    it('loses the in-flight export when the tracking state lives inside the layout branch', () => {
        const {rerender, queryByTestId} = render(<InBranchHarness shouldUseNarrowLayout={false} />);

        act(() => {
            trackExportFromBranch?.('export-1');
        });
        expect(queryByTestId('export-status-modal')).not.toBeNull();

        rerender(<InBranchHarness shouldUseNarrowLayout />);

        expect(queryByTestId('export-status-modal')).toBeNull();
    });
});
