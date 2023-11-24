import CONST from '@src/CONST';

/**
 * Determines if the deeplink prompt should be shown on the current screen
 */
export default function shouldPreventDeeplinkPrompt(screenName: string): boolean {
    // We don't want to show the deeplink prompt on screens where a user is in the
    // authentication process, so we are blocking the prompt on the following screens (Denylist)
    return CONST.DEEPLINK_PROMPT_DENYLIST.some((name) => name === screenName);
}
