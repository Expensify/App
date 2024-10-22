import type {TupleToUnion} from 'type-fest';
import CONST from '@src/CONST';

const TOP_TAB_SCREENS = [CONST.TAB.NEW_CHAT, CONST.TAB.NEW_ROOM, CONST.TAB_REQUEST.DISTANCE, CONST.TAB_REQUEST.MANUAL, CONST.TAB_REQUEST.SCAN] as const;

type TopTabScreen = TupleToUnion<typeof TOP_TAB_SCREENS>;

export type {TopTabScreen};

export default TOP_TAB_SCREENS;
