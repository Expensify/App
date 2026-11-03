// Note: if you are updating this set, please update it in PHP as well: https://github.com/Expensify/Web-Expensify/blob/d5d74f1ba73deed0379ff5b9f57376213a8b02bf/lib/Github/Utils.php#L51
const KNOWN_BOT_USERS = new Set(['CLABotify', 'MelvinBot', 'OSBotify', 'botify', 'exfy-zapier']);

function isBotUser(login: string, actorType: string): boolean {
    if (actorType === 'Bot') {
        return true;
    }

    if (login.endsWith('[bot]')) {
        return true;
    }

    return KNOWN_BOT_USERS.has(login);
}

export default isBotUser;
