/* eslint-disable @typescript-eslint/naming-convention -- avatar IDs are kebab-case to match CDN filenames */
import {BotAvatarBlue, BotAvatarGreen, BotAvatarIce, BotAvatarPink, BotAvatarTangerine, BotAvatarYellow} from '@components/Icon/DefaultBotAvatars';

import CONST from '@src/CONST';

import type {AvatarEntry} from './AvatarCatalog';

import {createAvatarCatalog} from './AvatarCatalog';

type AgentAvatarID = 'bot-avatar--blue' | 'bot-avatar--green' | 'bot-avatar--ice' | 'bot-avatar--pink' | 'bot-avatar--tangerine' | 'bot-avatar--yellow';

const CDN_BOT_AVATARS = `${CONST.CLOUDFRONT_URL}/images/avatars/bots`;

const AGENT_AVATAR_ENTRIES: Record<AgentAvatarID, AvatarEntry> = {
    'bot-avatar--blue': {local: BotAvatarBlue, url: `${CDN_BOT_AVATARS}/bot-avatar--blue.png`},
    'bot-avatar--green': {local: BotAvatarGreen, url: `${CDN_BOT_AVATARS}/bot-avatar--green.png`},
    'bot-avatar--ice': {local: BotAvatarIce, url: `${CDN_BOT_AVATARS}/bot-avatar--ice.png`},
    'bot-avatar--pink': {local: BotAvatarPink, url: `${CDN_BOT_AVATARS}/bot-avatar--pink.png`},
    'bot-avatar--tangerine': {local: BotAvatarTangerine, url: `${CDN_BOT_AVATARS}/bot-avatar--tangerine.png`},
    'bot-avatar--yellow': {local: BotAvatarYellow, url: `${CDN_BOT_AVATARS}/bot-avatar--yellow.png`},
};

const AGENT_AVATARS = createAvatarCatalog<AgentAvatarID>(AGENT_AVATAR_ENTRIES);

export {AGENT_AVATARS};
export type {AgentAvatarID};
