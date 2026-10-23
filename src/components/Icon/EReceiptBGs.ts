import type React from 'react';
import type {SvgProps} from 'react-native-svg';

import {lazy} from 'react';

// Each pattern is its own async chunk, so it stays out of the main bundle. Render these inside <Suspense>. Native uses EReceiptBGs.native.ts (static imports).
const getFallbackModule = (): {default: React.FC<SvgProps>} => ({
    default: () => null,
});

const EReceiptBGBlue = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_blue.svg').catch(getFallbackModule));
const EReceiptBGGreen = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_green.svg').catch(getFallbackModule));
const EReceiptBGIce = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_ice.svg').catch(getFallbackModule));
const EReceiptBGPink = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_pink.svg').catch(getFallbackModule));
const EReceiptBGTangerine = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_tangerine.svg').catch(getFallbackModule));
const EReceiptBGYellow = lazy(() => import('@assets/images/eReceiptBGs/eReceiptBG_yellow.svg').catch(getFallbackModule));
const EReceiptBGDistance = lazy(() => import('@assets/images/eReceipt_background.svg').catch(getFallbackModule));

export {EReceiptBGYellow, EReceiptBGIce, EReceiptBGBlue, EReceiptBGGreen, EReceiptBGTangerine, EReceiptBGPink, EReceiptBGDistance};
