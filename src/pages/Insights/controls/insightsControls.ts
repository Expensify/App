import CONST from '@src/CONST';

const INSIGHTS_CONTROL_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

type InsightsControlProps<T> = {
    value: T;
    onChange: (value: T) => void;
};

export type {InsightsControlProps};
export default INSIGHTS_CONTROL_ANCHOR_ALIGNMENT;
