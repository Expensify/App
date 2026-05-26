import {useTypeface} from '@shopify/react-native-skia';
import React from 'react';
import {ChartDefaultTypefaceContext} from './ChartDefaultTypefaceContext';
import webFont from './chartWebFont';

type ChartDefaultTypefaceProviderProps = {
    children: React.ReactNode;
};

function ChartDefaultTypefaceProvider({children}: ChartDefaultTypefaceProviderProps) {
    const regular = useTypeface(webFont(require('@assets/fonts/web/ExpensifyNeue-Regular.woff2') as string));
    const bold = useTypeface(webFont(require('@assets/fonts/web/ExpensifyNeue-Bold.woff2') as string));

    return <ChartDefaultTypefaceContext.Provider value={{regular, bold}}>{children}</ChartDefaultTypefaceContext.Provider>;
}

ChartDefaultTypefaceProvider.displayName = 'ChartDefaultTypefaceProvider';

export default ChartDefaultTypefaceProvider;
