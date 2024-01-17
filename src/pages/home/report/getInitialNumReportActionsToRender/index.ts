function getInitialNumToRender(numToRender: number): number {
    // For web and desktop environments, it's crucial to set this value equal to or higher than the maxToRenderPerBatch setting. If it's set lower, the 'onStartReached' event will be triggered excessively, every time an additional item enters the virtualized list.
    return Math.max(numToRender, 50);
}
export default getInitialNumToRender;
