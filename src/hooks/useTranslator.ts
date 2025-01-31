import {pipeline} from '@xenova/transformers';
import type {TranslationPipeline} from '@xenova/transformers';
import {useEffect, useState} from 'react';

// Cache the translator globally
let translatorPromise: Promise<TranslationPipeline> | null = null;

export default function useTranslator(source: string, srcLang: string, tgtLang: string) {
    const [text, setText] = useState<string>(source);

    useEffect(() => {
        if (!translatorPromise) {
            console.log('over here koa')
            translatorPromise = pipeline('translation', 'Xenova/nllb-200-distilled-600M', { progress_callback: (x) => console.log('over here progress: ', x)});
        }

        // eslint-disable-next-line
        const translate = async () => {
            if (!source) {
                return;
            }
            console.log('over here translating: ', source)

            try {
                const translator = await translatorPromise;
                const output = await translator(source, {tgt_lang: tgtLang});
                const translatedText = (output?.[0]?.translation_text as string) || '';
                console.log('over here translation', {source, translatedText})
                setText(translatedText);
            } catch (error) {
                console.error('over here Translation error:', error);
                return;
            }
        };

        translate();
    }, [source, srcLang, tgtLang]);

    return text;
}
