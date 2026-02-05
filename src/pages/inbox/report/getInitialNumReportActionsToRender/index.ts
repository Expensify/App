const DEFAULT_NUM_TO_RENDER = 50;

function getInitialNumToRender(numToRender: number): number {
    // For web environment, it's crucial to set this value equal to or higher than the maxToRenderPerBatch setting. If it's set lower, the 'onStartReached' event will be triggered excessively, every time an additional item enters the virtualized list.
    return Math.max(numToRender, DEFAULT_NUM_TO_RENDER);
}
export default getInitialNumToRender;
