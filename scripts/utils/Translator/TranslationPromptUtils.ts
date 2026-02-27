import getBasePrompt from '@prompts/translation/base';
import getContextPrompt from '@prompts/translation/context';
import type {TranslationTargetLocale} from '@src/CONST/LOCALES';

/**
 * Gets a locale-specific prompt if one exists for the target language.
 */
async function getLocaleSpecificPrompt(targetLang: TranslationTargetLocale): Promise<string> {
    try {
        const localePrompt = (await import(`@prompts/translation/${targetLang}`)) as {default?: string};
        return localePrompt.default ?? '';
    } catch {
        return '';
    }
}

/**
 * Build the system instructions for a locale, using the base prompt and locale-specific prompt.
 */
async function buildTranslationInstructions(targetLang: TranslationTargetLocale): Promise<string> {
    let instructions = '<system_prompt>\n';
    instructions += '<base_prompt>\n';
    instructions += getBasePrompt(targetLang);
    instructions += '\n</base_prompt>';

    const localeSpecificPrompt = await getLocaleSpecificPrompt(targetLang);
    if (localeSpecificPrompt) {
        instructions += `\n\n<locale_specific_prompt language="${targetLang}">\n`;
        instructions += localeSpecificPrompt;
        instructions += '\n</locale_specific_prompt>';
    }

    instructions += '\n</system_prompt>';
    return instructions;
}

/**
 * Build the user input for a translation request, including optional phrase context.
 */
function buildTranslationRequestInput(text: string, context?: string): string {
    let input = '<translation_request>\n';

    const contextPrompt = getContextPrompt(context);
    if (contextPrompt) {
        input += '<phrase_context>\n';
        input += contextPrompt;
        input += '\n</phrase_context>\n';
    }

    input += '<text_to_translate>\n';
    input += text;
    input += '\n</text_to_translate>\n';
    input += '</translation_request>';

    return input;
}

export {getLocaleSpecificPrompt, buildTranslationInstructions, buildTranslationRequestInput};
