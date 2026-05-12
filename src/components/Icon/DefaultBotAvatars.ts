import type {TupleToUnion} from 'type-fest';
import BotAvatarBlue from '@assets/images/avatars/bots/bot-avatar--blue.svg';
import BotAvatarGreen from '@assets/images/avatars/bots/bot-avatar--green.svg';
import BotAvatarIce from '@assets/images/avatars/bots/bot-avatar--ice.svg';
import BotAvatarPink from '@assets/images/avatars/bots/bot-avatar--pink.svg';
import BotAvatarTangerine from '@assets/images/avatars/bots/bot-avatar--tangerine.svg';
import BotAvatarYellow from '@assets/images/avatars/bots/bot-avatar--yellow.svg';

const botAvatars = [BotAvatarBlue, BotAvatarGreen, BotAvatarIce, BotAvatarPink, BotAvatarTangerine, BotAvatarYellow] as const;

type BotAvatar = TupleToUnion<typeof botAvatars>;

const botAvatarIDs = new Map<BotAvatar, string>([
    [BotAvatarBlue, 'bot-avatar--blue'],
    [BotAvatarGreen, 'bot-avatar--green'],
    [BotAvatarIce, 'bot-avatar--ice'],
    [BotAvatarPink, 'bot-avatar--pink'],
    [BotAvatarTangerine, 'bot-avatar--tangerine'],
    [BotAvatarYellow, 'bot-avatar--yellow'],
]);

export {BotAvatarBlue, BotAvatarGreen, BotAvatarIce, BotAvatarPink, BotAvatarTangerine, BotAvatarYellow, botAvatars, botAvatarIDs};
export type {BotAvatar};
