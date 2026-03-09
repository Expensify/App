import type {DataModule} from '@shopify/react-native-skia';
import {Canvas, Circle, Paragraph, Skia, TextAlign, useFonts} from '@shopify/react-native-skia';
import React, {useMemo} from 'react';
import variables from '@styles/variables';

function MyParagraph() {
    const customFontMgr = useFonts({
        ExpensifyNeue: [
            require('@assets/fonts/native/ExpensifyNeue-Regular.otf') as DataModule,
            require('@assets/fonts/native/ExpensifyNeue-Bold.otf') as DataModule,
            require('@assets/fonts/native/ExpensifyNeue-Italic.otf') as DataModule,
            require('@assets/fonts/native/ExpensifyNeue-BoldItalic.otf') as DataModule,
        ],
        ExpensifyMono: [
            require('@assets/fonts/native/ExpensifyMono-Regular.otf') as DataModule,
            require('@assets/fonts/native/ExpensifyMono-Bold.otf') as DataModule,
            require('@assets/fonts/native/ExpensifyMono-Italic.otf') as DataModule,
            require('@assets/fonts/native/ExpensifyMono-BoldItalic.otf') as DataModule,
        ],
        ExpensifyNewKansas: [require('@assets/fonts/native/ExpensifyNewKansas-Medium.otf') as DataModule, require('@assets/fonts/native/ExpensifyNewKansas-MediumItalic.otf') as DataModule],
    });

    const paragraph = useMemo(() => {
        const paragraphStyle = {
            textAlign: TextAlign.Center,
        };
        const textStyle = {
            color: Skia.Color('black'),
            fontFamilies: customFontMgr ? ['ExpensifyNeue'] : [],
            fontSize: variables.iconSizeExtraSmall,
        };
        const builder = customFontMgr ? Skia.ParagraphBuilder.Make(paragraphStyle, customFontMgr) : Skia.ParagraphBuilder.Make(paragraphStyle);
        return builder.pushStyle(textStyle).addText('xd ₹').pop().build();
    }, [customFontMgr]);

    return (
        <Canvas style={{width: 256, height: 256}}>
            <Circle
                cx={128}
                cy={128}
                r={5}
                color="red"
            />
            <Paragraph
                paragraph={paragraph}
                x={0}
                y={0}
                width={300}
            />
        </Canvas>
    );
}

export default MyParagraph;
