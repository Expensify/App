import type {LazySvgLoader} from '@hooks/useLazySvg';

// Each pattern is its own async chunk, so it stays out of the main bundle. Keep these as module-level constants: useLazySvg caches by loader identity.
const loadEReceiptBGBlue: LazySvgLoader = () => import('@assets/images/eReceiptBGs/eReceiptBG_blue.svg');
const loadEReceiptBGGreen: LazySvgLoader = () => import('@assets/images/eReceiptBGs/eReceiptBG_green.svg');
const loadEReceiptBGIce: LazySvgLoader = () => import('@assets/images/eReceiptBGs/eReceiptBG_ice.svg');
const loadEReceiptBGPink: LazySvgLoader = () => import('@assets/images/eReceiptBGs/eReceiptBG_pink.svg');
const loadEReceiptBGTangerine: LazySvgLoader = () => import('@assets/images/eReceiptBGs/eReceiptBG_tangerine.svg');
const loadEReceiptBGYellow: LazySvgLoader = () => import('@assets/images/eReceiptBGs/eReceiptBG_yellow.svg');

export {loadEReceiptBGYellow, loadEReceiptBGIce, loadEReceiptBGBlue, loadEReceiptBGGreen, loadEReceiptBGTangerine, loadEReceiptBGPink};
