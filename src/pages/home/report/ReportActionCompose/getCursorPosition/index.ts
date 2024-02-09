type WebSelection = {
    start: number;
    end: number;
    positionX: number;
    positionY: number;
};
function getCursorPosition(selection: WebSelection) {
    return {
        x: selection.positionX,
        y: selection.positionY,
    };
}
export default getCursorPosition;
