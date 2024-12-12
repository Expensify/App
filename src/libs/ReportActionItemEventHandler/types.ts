import type {LayoutChangeEvent} from 'react-native';
import type ReportScrollManagerData from '@hooks/useReportScrollManager/types';

type ReportActionItemEventHandler = {
    handleComposerLayoutChange: (reportScrollManager: ReportScrollManagerData, index: number) => (event: LayoutChangeEvent) => void;
};

export default ReportActionItemEventHandler;
