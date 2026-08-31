import {fireEvent, render, screen} from '@testing-library/react-native';

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

// Two distinct component types, like SearchPageNarrow / SearchPageWide: swapping between them unmounts one
// subtree and mounts the other, so any state owned inside a branch is destroyed.
function WideBranch() {
    const {trackExport} = useExportDownloadStatus();
    return (
        <Text
            testID="track-export"
            onPress={() => trackExport('export-1')}
        >
            wide
        </Text>
    );
}

function NarrowBranch() {
    const {trackExport} = useExportDownloadStatus();
    return (
        <Text
            testID="track-export"
            onPress={() => trackExport('export-1')}
        >
            narrow
        </Text>
    );
}

function ProviderHarness({shouldUseNarrowLayout}: {shouldUseNarrowLayout: boolean}) {
    return <ExportDownloadStatusProvider>{shouldUseNarrowLayout ? <NarrowBranch /> : <WideBranch />}</ExportDownloadStatusProvider>;
}

// The pre-fix shape: each branch owns the tracking state and renders the modal itself.
function WideBranchOwningState() {
    const {trackExport, exportDownloadStatusModal} = useExportDownloadStatusModal();
    return (
        <>
            <Text
                testID="track-export"
                onPress={() => trackExport('export-1')}
            >
                wide
            </Text>
            {exportDownloadStatusModal}
        </>
    );
}

function NarrowBranchOwningState() {
    const {trackExport, exportDownloadStatusModal} = useExportDownloadStatusModal();
    return (
        <>
            <Text
                testID="track-export"
                onPress={() => trackExport('export-1')}
            >
                narrow
            </Text>
            {exportDownloadStatusModal}
        </>
    );
}

function InBranchHarness({shouldUseNarrowLayout}: {shouldUseNarrowLayout: boolean}) {
    return shouldUseNarrowLayout ? <NarrowBranchOwningState /> : <WideBranchOwningState />;
}

describe('ExportDownloadStatusProvider', () => {
    it('keeps tracking an in-flight export when the layout branch below it remounts', () => {
        const {rerender} = render(<ProviderHarness shouldUseNarrowLayout={false} />);

        fireEvent.press(screen.getByTestId('track-export'));
        expect(screen.getByTestId('export-status-modal')).toBeOnTheScreen();

        // Cross the narrow/wide breakpoint mid-export, e.g. by resizing the browser.
        rerender(<ProviderHarness shouldUseNarrowLayout />);

        expect(screen.getByTestId('export-status-modal')).toBeOnTheScreen();
    });

    it('loses the in-flight export when the tracking state lives inside the layout branch', () => {
        const {rerender} = render(<InBranchHarness shouldUseNarrowLayout={false} />);

        fireEvent.press(screen.getByTestId('track-export'));
        expect(screen.getByTestId('export-status-modal')).toBeOnTheScreen();

        rerender(<InBranchHarness shouldUseNarrowLayout />);

        expect(screen.queryByTestId('export-status-modal')).not.toBeOnTheScreen();
    });
});
