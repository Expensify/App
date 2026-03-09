import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {Canvas, Circle, Paragraph, Skia, TextAlign} from '@shopify/react-native-skia';
import React, {useEffect, useMemo, useState} from 'react';
import variables from '@styles/variables';

// Font URLs served as static assets — same convention used by Charts/font/index.ts
const FONT_URLS: Record<string, string[]> = {
    ExpensifyNeue: ['/fonts/ExpensifyNeue-Regular.woff', '/fonts/ExpensifyNeue-Bold.woff', '/fonts/ExpensifyNeue-Italic.woff', '/fonts/ExpensifyNeue-BoldItalic.woff'],
    ExpensifyMono: ['/fonts/ExpensifyMono-Regular.woff', '/fonts/ExpensifyMono-Bold.woff', '/fonts/ExpensifyMono-Italic.woff', '/fonts/ExpensifyMono-BoldItalic.woff'],
    ExpensifyNewKansas: ['/fonts/ExpensifyNewKansas-Medium.woff', '/fonts/ExpensifyNewKansas-MediumItalic.woff'],
};

// useFonts() expects DataModule (require() results), which on web are URL strings that go through
// Platform.resolveAsset — that path fails for plain strings. Instead, we fetch each font,
// convert to Uint8Array, and register typefaces directly into a TypefaceFontProvider.
async function buildFontProvider(): Promise<SkTypefaceFontProvider> {
    const provider = Skia.TypefaceFontProvider.Make();
    await Promise.all(
        Object.entries(FONT_URLS).map(async ([family, urls]) => {
            await Promise.all(
                urls.map(async (url) => {
                    const response = await fetch(url);
                    const buffer = await response.arrayBuffer();
                    const data = Skia.Data.fromBytes(new Uint8Array(buffer));
                    const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(data);
                    if (typeface) {
                        provider.registerFont(typeface, family);
                    }
                }),
            );
        }),
    );
    return provider;
}

function MyParagraph() {
    const [fontProvider, setFontProvider] = useState<SkTypefaceFontProvider | null>(null);

    useEffect(() => {
        buildFontProvider().then(setFontProvider);
    }, []);

    const paragraph = useMemo(() => {
        if (!fontProvider) {
            return null;
        }
        const paragraphStyle = {
            textAlign: TextAlign.Center,
        };
        const textStyle = {
            color: Skia.Color('black'),
            fontFamilies: ['ExpensifyNeue'],
            fontSize: variables.iconSizeExtraSmall,
        };
        return Skia.ParagraphBuilder.Make(paragraphStyle, fontProvider).pushStyle(textStyle).addText('xd ₹').pop().build();
    }, [fontProvider]);

    return (
        <Canvas style={{width: 256, height: 256}}>
            <Circle
                cx={128}
                cy={128}
                r={5}
                color="red"
            />
            {paragraph && (
                <Paragraph
                    paragraph={paragraph}
                    x={0}
                    y={0}
                    width={300}
                />
            )}
        </Canvas>
    );
}

export default MyParagraph;
