import type {ComposerCommand} from '@src/CONST';
import CONST from '@src/CONST';

function suggestCommands(text: string, limit: number = CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS): ComposerCommand[] {
    const suggestions: ComposerCommand[] = [];

    for (const composedCommand of CONST.COMPOSER_COMMANDS) {
        if (suggestions.length === limit) {
            break;
        }

        if (composedCommand.command.startsWith(text)) {
            suggestions.push(composedCommand);
        }
    }

    return suggestions;
}

// eslint-disable-next-line import/prefer-default-export
export {suggestCommands};
