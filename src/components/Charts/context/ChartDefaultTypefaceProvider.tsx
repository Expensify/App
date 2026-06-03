import {useTypeface} from '@shopify/react-native-skia';
import React from 'react';
import {ChartDefaultTypefaceContext} from './ChartDefaultTypefaceContext';
import chartWebFont from './chartWebFont';

function ChartDefaultTypefaceProvider({children}: {children: React.ReactNode}) {
    const regular = useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Regular.woff2') as string));
    const bold = useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNeue-Bold.woff2') as string));
    const kansas = useTypeface(chartWebFont(require('@assets/fonts/web/ExpensifyNewKansas-Medium.woff2') as string));

    return <ChartDefaultTypefaceContext.Provider value={{regular, bold, kansas}}>{children}</ChartDefaultTypefaceContext.Provider>;
}

export default ChartDefaultTypefaceProvider;
