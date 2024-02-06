type WebSelection = {
    start: number;
    end: number;
    positionX: number;
    positionY: number;
};
function getCursorPosition(selection: WebSelection) {
  console.log('get.measureCursorPosition.0.1', selection);
    return {
        x: selection.positionX,
        y: selection.positionY,
    };
}
export default getCursorPosition;
