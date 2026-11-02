import lazySVG from '@src/utils/lazySVG';

// Each pattern is its own async chunk, so it stays out of the main bundle. Native uses EReceiptBGs.native.ts (static imports).
const EReceiptBGBlue = lazySVG(() => import('@assets/images/eReceiptBGs/eReceiptBG_blue.svg'));
const EReceiptBGGreen = lazySVG(() => import('@assets/images/eReceiptBGs/eReceiptBG_green.svg'));
const EReceiptBGIce = lazySVG(() => import('@assets/images/eReceiptBGs/eReceiptBG_ice.svg'));
const EReceiptBGPink = lazySVG(() => import('@assets/images/eReceiptBGs/eReceiptBG_pink.svg'));
const EReceiptBGTangerine = lazySVG(() => import('@assets/images/eReceiptBGs/eReceiptBG_tangerine.svg'));
const EReceiptBGYellow = lazySVG(() => import('@assets/images/eReceiptBGs/eReceiptBG_yellow.svg'));
const EReceiptBGDistance = lazySVG(() => import('@assets/images/eReceipt_background.svg'));

export {EReceiptBGYellow, EReceiptBGIce, EReceiptBGBlue, EReceiptBGGreen, EReceiptBGTangerine, EReceiptBGPink, EReceiptBGDistance};
