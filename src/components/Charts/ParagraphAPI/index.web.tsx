import type {DataModule, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {Canvas, Circle, FontWeight, Paragraph, Skia, TextAlign, useFonts} from '@shopify/react-native-skia';
import React, {useEffect, useMemo, useState} from 'react';

// On web, webpack's `type: 'asset'` returns a plain URL string for font files,
// but Skia's useFonts/resolveAsset expects a DataModule (ESModule or MetroAsset object).
// Wrapping the URL in {__esModule: true, default: url} satisfies the ESModule variant.
function webFont(url: string): DataModule {
    return {__esModule: true, default: url} as unknown as DataModule;
}

const FONT_SOURCES: Array<{family: string; url: string}> = [
    {family: 'ExpensifyNeue', url: require('@assets/fonts/web/ExpensifyNeue-Regular.woff') as string},
    {family: 'ExpensifyNeue', url: require('@assets/fonts/web/ExpensifyNeue-Bold.woff') as string},
    {family: 'ExpensifyNeue', url: require('@assets/fonts/web/ExpensifyNeue-Italic.woff') as string},
    {family: 'ExpensifyNeue', url: require('@assets/fonts/web/ExpensifyNeue-BoldItalic.woff') as string},
    {family: 'ExpensifyMono', url: require('@assets/fonts/web/ExpensifyMono-Regular.woff') as string},
    {family: 'ExpensifyMono', url: require('@assets/fonts/web/ExpensifyMono-Bold.woff') as string},
    {family: 'ExpensifyMono', url: require('@assets/fonts/web/ExpensifyMono-Italic.woff') as string},
    {family: 'ExpensifyMono', url: require('@assets/fonts/web/ExpensifyMono-BoldItalic.woff') as string},
    {family: 'ExpensifyNewKansas', url: require('@assets/fonts/web/ExpensifyNewKansas-Medium.woff') as string},
    {family: 'ExpensifyNewKansas', url: require('@assets/fonts/web/ExpensifyNewKansas-MediumItalic.woff') as string},
    {family: 'CustomEmojiFont', url: require('@assets/fonts/web/CustomEmojiWebFont.ttf') as string},
];

function useWebFonts(): SkTypefaceFontProvider | null {
    const [fontMgr, setFontMgr] = useState<SkTypefaceFontProvider | null>(null);

    useEffect(() => {
        Promise.all(
            FONT_SOURCES.map(({family, url}) =>
                Skia.Data.fromURI(url).then((data) => {
                    const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(data);
                    return typeface ? {family, typeface} : null;
                }),
            ),
        ).then((results) => {
            const provider = Skia.TypefaceFontProvider.Make();
            for (const result of results) {
                if (result) {
                    provider.registerFont(result.typeface, result.family);
                }
            }
            setFontMgr(provider);
        });
    }, []);

    return fontMgr;
}

function MyParagraph() {
    const customFontManager1 = useFonts({
        ExpensifyNeue: [
            webFont(require('@assets/fonts/web/ExpensifyNeue-Regular.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyNeue-Bold.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyNeue-Italic.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyNeue-BoldItalic.woff2') as string),
        ],
        ExpensifyMono: [
            webFont(require('@assets/fonts/web/ExpensifyMono-Regular.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyMono-Bold.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyMono-Italic.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyMono-BoldItalic.woff2') as string),
        ],
        ExpensifyNewKansas: [
            webFont(require('@assets/fonts/web/ExpensifyNewKansas-Medium.woff2') as string),
            webFont(require('@assets/fonts/web/ExpensifyNewKansas-MediumItalic.woff2') as string),
        ],
        CustomEmojiFont: [webFont(require('@assets/fonts/web/CustomEmojiWebFont.ttf') as string)],
    });
    const customFontMgr = useWebFonts();

    const paragraph = useMemo(() => {
        if (!customFontManager1) {
            return null;
        }
        const paragraphStyle = {
            textAlign: TextAlign.Center,
        };
        const textStyle = {
            color: Skia.Color('black'),
            fontFamilies: ['CustomEmojiFont', 'ExpensifyNeue'],
            fontSize: 60,
            fontWeight: FontWeight.Bold,
        };
        return Skia.ParagraphBuilder.Make(paragraphStyle, customFontManager1).pushStyle(textStyle).addText('$ € ¥ £ ₹ ₪ ₦ ₨ ₱ ₲ ₴ ₭ ₮ ₩ ₽ ₡ ₫ ฿ ﷼ ₵ ល 〒').pop().build();
    }, [customFontManager1]);

    return (
        <Canvas style={{width: 512, height: 512}}>
            <Circle
                cx={256}
                cy={256}
                r={5}
                color="red"
            />
            {paragraph && (
                <Paragraph
                    paragraph={paragraph}
                    x={0}
                    y={0}
                    width={512}
                />
            )}
        </Canvas>
    );
}

export default MyParagraph;
