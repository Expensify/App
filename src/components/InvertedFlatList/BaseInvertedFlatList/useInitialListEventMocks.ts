import type {RenderInfo} from './RenderTaskQueue';

type UseInitialListEventMocksProps = {
    handleStartReached: (info: RenderInfo) => void;
    handleContentSizeChange: (contentWidth: number, contentHeight: number) => void;
};
type UseInitialListEventMocks = (props: UseInitialListEventMocksProps) => void;

const NOOP = () => {};
const useInitialListEventMocks: UseInitialListEventMocks = NOOP;

export default useInitialListEventMocks;
export type {UseInitialListEventMocks};
