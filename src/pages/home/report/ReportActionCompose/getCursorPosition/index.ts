type WebSelection = {
    start: number;
    end: number;
    positionX?: number;
    positionY?: number;
};
function getCursorPosition(selection: WebSelection) {
    return {
        x: selection?.positionX ?? 0,
        y: selection?.positionY ?? 0,
    };
}
export default getCursorPosition;
