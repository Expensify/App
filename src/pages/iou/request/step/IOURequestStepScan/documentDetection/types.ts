type QuadPoint = {
    x: number;
    y: number;
};

type DocumentQuad = QuadPoint[];

// Every EDGE_POINTS_PER_SIDE-th point is a corner, so a point follows the same bit of paper from one detection to the next.
type DocumentEdge = QuadPoint[];

export default DocumentQuad;
export type {QuadPoint, DocumentEdge};
