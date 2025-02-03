import {pipeline} from '@xenova/transformers';
import type {TranslationPipeline} from '@xenova/transformers';
import {useEffect, useState} from 'react';

// Cache the translator globally
let translatorPromise: Promise<TranslationPipeline> | null = null;

export default function useTranslator(source: string, srcLang: string, tgtLang: string) {
    const [text, setText] = useState<string>(source);

    useEffect(() => {
        if (!translatorPromise) {
            translatorPromise = pipeline('translation', 'Xenova/nllb-200-distilled-600M', { progress_callback: (x) => console.log('progress: ', x)});
        }

        // eslint-disable-next-line
        const translate = async () => {
            if (!source) {
                return;
            }

            try {
                const translator = await translatorPromise;
                const output = await translator(source, {tgt_lang: tgtLang});
                const translatedText = (output?.[0]?.translation_text as string) || '';
                console.log('translation', {source, translatedText})
                setText(translatedText);
            } catch (error) {
                return;
            }
        };

        translate();
    }, [source, srcLang, tgtLang]);

    return text;
}
