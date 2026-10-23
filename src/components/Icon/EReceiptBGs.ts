import type React from 'react';
import type {SvgProps} from 'react-native-svg';

import {lazy} from 'react';

// Each pattern is its own async chunk, so it stays out of the main bundle. Render these inside <Suspense>. Native uses EReceiptBGs.native.ts (static imports).
const fallback = (): {default: React.FC<SvgProps>} => ({
    default: () => null,
});

const EReceiptBGBlue = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_blue.svg').catch(fallback));
const EReceiptBGGreen = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_green.svg').catch(fallback));
const EReceiptBGIce = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_ice.svg').catch(fallback));
const EReceiptBGPink = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_pink.svg').catch(fallback));
const EReceiptBGTangerine = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_tangerine.svg').catch(fallback));
const EReceiptBGYellow = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_yellow.svg').catch(fallback));
const EReceiptBGDistance = lazy(() => import('@assets/images/eReceipt_background.svg').catch(fallback));

export {EReceiptBGYellow, EReceiptBGIce, EReceiptBGBlue, EReceiptBGGreen, EReceiptBGTangerine, EReceiptBGPink, EReceiptBGDistance};
