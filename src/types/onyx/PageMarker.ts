import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type PageMarker = ValueOf<typeof CONST.PAGE_MARKER> | [number, number];
