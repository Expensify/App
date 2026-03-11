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
        CustomEmojiFont: [require('@assets/fonts/native/CustomEmojiNativeFont.ttf') as DataModule],
    });

    const paragraph = useMemo(() => {
        const paragraphStyle = {
            textAlign: TextAlign.Center,
        };
        const textStyle = {
            color: Skia.Color('black'),
            fontFamilies: ['CustomEmojiFont'],
            fontSize: 60,
        };
        const builder = customFontMgr ? Skia.ParagraphBuilder.Make(paragraphStyle, customFontMgr) : Skia.ParagraphBuilder.Make(paragraphStyle);
        return builder.pushStyle(textStyle).addText('$ € ¥ £ ₹ ₪ ₦ ₨ ₱ ₲ ₴ ₭ ₮ ₩ ₽ ₡ ₫ ฿ ﷼ ₵ ល 〒').pop().build();
    }, [customFontMgr]);

    return (
        <Canvas style={{width: 350, height: 400}}>
            <Circle
                cx={175}
                cy={175}
                r={5}
                color="red"
            />
            <Paragraph
                paragraph={paragraph}
                x={0}
                y={0}
                width={350}
            />
        </Canvas>
    );
}

export default MyParagraph;
