import CONST from '../src/CONST';

/*
 * This list is generated from the code here https://github.com/github/gemoji/blob/master/db/emoji.json
 * Each code is then converted to hex by replacing the "U+" with "0x"
 * Each hex is then converted to a string using this function (each section is defined as "emojis" in this function)
 * const emojiData = require('./gemoji.json');
 * const { getEmojiUnicode } = require('./EmojiUtils');
 * const emojisGroupedByCategory = _.groupBy(emojiData, 'category');
 * const skinTones = ['1f3fb', '1f3fc', '1f3fd', '1f3fe',  '1f3ff'];
 * const emojisList = []
 * for(let category in emojisGroupedByCategory) {
 *      let categoryName = category.replace(' & ', 'And');
 *      categoryName = categoryName.charAt(0).toLowerCase() + categoryName.slice(1);
 *      emojisList.push({
 *          code: categoryName,
 *          header: true
 *      });
 *
 *     const emojisPerCategory = emojisGroupedByCategory[category];
 *      for(let i = 0; i < emojisPerCategory.length; i++) {
 *          const emoji = emojisPerCategory[i];
 *          let keywords = [...emoji.tags , ...emoji.aliases];
 *          if(oldEmojiMap[emoji.emoji]) { // old Emoji Map is old assets/emojis.js data
 *              keywords = keywords.concat(oldEmojiMap[emoji.emoji].keywords);
 *          }
 *          const emojiRow = {
 *              code: emoji.emoji,
 *              keywords: _.uniq(keywords)
 *          };
 *
 *          if (emoji.skin_tones) {
 *              emojiRow.types = skinTones.map(skinTone => {
 *                 const emojiUnicode = trimEmojiUnicode(getEmojiUnicode(emoji.emoji)).split(' ').map(p => parseInt(p, 16));
 *                 if(emojiUnicode.length > 0) {
 *                     emojiUnicode.splice(1, 0, parseInt(skinTone, 16));
 *                 } else {
 *                    emojiUnicode.push(parseInt(skinTone, 16));
 *                 }
 *                 return String.fromCodePoint(...emojiUnicode);
 *              });
 *          }
 *          emojisList.push(emojiRow);
 *     }
 * };
 */

// BEFORE YOU EDIT THIS, PLEASE SEE WARNINGS IN EmojiPickerMenu.js
const skinTones = [{
    code: '🖐',
    skinTone: CONST.DEFAULT_SKIN_TONE,
}, {
    code: '🖐🏻',
    skinTone: 4,
}, {
    code: '🖐🏼',
    skinTone: 3,
}, {
    code: '🖐🏽',
    skinTone: 2,
}, {
    code: '🖐🏾',
    skinTone: 1,
}, {
    code: '🖐🏿',
    skinTone: 0,
}];

const emojis = [
    {
        code: 'smileysAndEmotion',
        header: true,
    },
    {
        name: 'grinning',
        code: '😀',
        keywords: [
            'smile',
            'happy',
            'grinning',
            'face',
            'grin',
        ],
    },
    {
        name: 'smiley',
        code: '😃',
        keywords: [
            'happy',
            'joy',
            'haha',
            'smiley',
            'face',
            'mouth',
            'open',
            'smile',
        ],
    },
    {
        name: 'smile',
        code: '😄',
        keywords: [
            'happy',
            'joy',
            'laugh',
            'pleased',
            'smile',
            'eye',
            'face',
            'mouth',
            'open',
        ],
    },
    {
        name: 'grin',
        code: '😁',
        keywords: [
            'grin',
            'eye',
            'face',
            'smile',
        ],
    },
    {
        name: 'laughing',
        code: '😆',
        keywords: [
            'happy',
            'haha',
            'laughing',
            'satisfied',
            'face',
            'laugh',
            'mouth',
            'open',
            'smile',
        ],
    },
    {
        name: 'sweat_smile',
        code: '😅',
        keywords: [
            'hot',
            'sweat_smile',
            'cold',
            'face',
            'open',
            'smile',
            'sweat',
        ],
    },
    {
        name: 'rofl',
        code: '🤣',
        keywords: [
            'lol',
            'laughing',
            'rofl',
            'face',
            'floor',
            'laugh',
            'rolling',
        ],
    },
    {
        name: 'joy',
        code: '😂',
        keywords: [
            'tears',
            'joy',
            'face',
            'laugh',
            'tear',
        ],
    },
    {
        name: 'slightly_smiling_face',
        code: '🙂',
        keywords: [
            'slightly_smiling_face',
            'face',
            'smile',
        ],
    },
    {
        name: 'upside_down_face',
        code: '🙃',
        keywords: [
            'upside_down_face',
            'face',
            'upside-down',
        ],
    },
    {
        name: 'wink',
        code: '😉',
        keywords: [
            'flirt',
            'wink',
            'face',
        ],
    },
    {
        name: 'blush',
        code: '😊',
        keywords: [
            'proud',
            'blush',
            'eye',
            'face',
            'smile',
        ],
    },
    {
        name: 'innocent',
        code: '😇',
        keywords: [
            'angel',
            'innocent',
            'face',
            'fairy tale',
            'fantasy',
            'halo',
            'smile',
        ],
    },
    {
        name: 'smiling_face_with_three_hearts',
        code: '🥰',
        keywords: [
            'love',
            'smiling_face_with_three_hearts',
        ],
    },
    {
        name: 'heart_eyes',
        code: '😍',
        keywords: [
            'love',
            'crush',
            'heart_eyes',
            'eye',
            'face',
            'heart',
            'smile',
        ],
    },
    {
        name: 'star_struck',
        code: '🤩',
        keywords: [
            'eyes',
            'star_struck',
        ],
    },
    {
        name: 'kissing_heart',
        code: '😘',
        keywords: [
            'flirt',
            'kissing_heart',
            'face',
            'heart',
            'kiss',
        ],
    },
    {
        name: 'kissing',
        code: '😗',
        keywords: [
            'kissing',
            'face',
            'kiss',
        ],
    },
    {
        name: 'relaxed',
        code: '☺️',
        keywords: [
            'blush',
            'pleased',
            'relaxed',
        ],
    },
    {
        name: 'kissing_closed_eyes',
        code: '😚',
        keywords: [
            'kissing_closed_eyes',
            'closed',
            'eye',
            'face',
            'kiss',
        ],
    },
    {
        name: 'kissing_smiling_eyes',
        code: '😙',
        keywords: [
            'kissing_smiling_eyes',
            'eye',
            'face',
            'kiss',
            'smile',
        ],
    },
    {
        name: 'smiling_face_with_tear',
        code: '🥲',
        keywords: [
            'smiling_face_with_tear',
        ],
    },
    {
        name: 'yum',
        code: '😋',
        keywords: [
            'tongue',
            'lick',
            'yum',
            'delicious',
            'face',
            'savouring',
            'smile',
            'um',
        ],
    },
    {
        name: 'stuck_out_tongue',
        code: '😛',
        keywords: [
            'stuck_out_tongue',
            'face',
            'tongue',
        ],
    },
    {
        name: 'stuck_out_tongue_winking_eye',
        code: '😜',
        keywords: [
            'prank',
            'silly',
            'stuck_out_tongue_winking_eye',
            'eye',
            'face',
            'joke',
            'tongue',
            'wink',
        ],
    },
    {
        name: 'zany_face',
        code: '🤪',
        keywords: [
            'goofy',
            'wacky',
            'zany_face',
        ],
    },
    {
        name: 'stuck_out_tongue_closed_eyes',
        code: '😝',
        keywords: [
            'prank',
            'stuck_out_tongue_closed_eyes',
            'eye',
            'face',
            'horrible',
            'taste',
            'tongue',
        ],
    },
    {
        name: 'money_mouth_face',
        code: '🤑',
        keywords: [
            'rich',
            'money_mouth_face',
            'face',
            'money',
            'mouth',
        ],
    },
    {
        name: 'hugs',
        code: '🤗',
        keywords: [
            'hugs',
            'face',
            'hug',
            'hugging',
        ],
    },
    {
        name: 'hand_over_mouth',
        code: '🤭',
        keywords: [
            'quiet',
            'whoops',
            'hand_over_mouth',
        ],
    },
    {
        name: 'shushing_face',
        code: '🤫',
        keywords: [
            'silence',
            'quiet',
            'shushing_face',
        ],
    },
    {
        name: 'thinking',
        code: '🤔',
        keywords: [
            'thinking',
            'face',
        ],
    },
    {
        name: 'zipper_mouth_face',
        code: '🤐',
        keywords: [
            'silence',
            'hush',
            'zipper_mouth_face',
            'face',
            'mouth',
            'zipper',
        ],
    },
    {
        name: 'raised_eyebrow',
        code: '🤨',
        keywords: [
            'suspicious',
            'raised_eyebrow',
        ],
    },
    {
        name: 'neutral_face',
        code: '😐',
        keywords: [
            'meh',
            'neutral_face',
            'deadpan',
            'face',
            'neutral',
        ],
    },
    {
        name: 'expressionless',
        code: '😑',
        keywords: [
            'expressionless',
            'face',
            'inexpressive',
            'unexpressive',
        ],
    },
    {
        name: 'no_mouth',
        code: '😶',
        keywords: [
            'mute',
            'silence',
            'no_mouth',
            'face',
            'mouth',
            'quiet',
            'silent',
        ],
    },
    {
        name: 'face_in_clouds',
        code: '😶‍🌫️',
        keywords: [
            'face_in_clouds',
        ],
    },
    {
        name: 'smirk',
        code: '😏',
        keywords: [
            'smug',
            'smirk',
            'face',
        ],
    },
    {
        name: 'unamused',
        code: '😒',
        keywords: [
            'meh',
            'unamused',
            'face',
            'unhappy',
        ],
    },
    {
        name: 'roll_eyes',
        code: '🙄',
        keywords: [
            'roll_eyes',
            'eyes',
            'face',
            'rolling',
        ],
    },
    {
        name: 'grimacing',
        code: '😬',
        keywords: [
            'grimacing',
            'face',
            'grimace',
        ],
    },
    {
        name: 'face_exhaling',
        code: '😮‍💨',
        keywords: [
            'face_exhaling',
        ],
    },
    {
        name: 'lying_face',
        code: '🤥',
        keywords: [
            'liar',
            'lying_face',
            'face',
            'lie',
            'pinocchio',
        ],
    },
    {
        name: 'relieved',
        code: '😌',
        keywords: [
            'whew',
            'relieved',
            'face',
        ],
    },
    {
        name: 'pensive',
        code: '😔',
        keywords: [
            'pensive',
            'dejected',
            'face',
        ],
    },
    {
        name: 'sleepy',
        code: '😪',
        keywords: [
            'tired',
            'sleepy',
            'face',
            'sleep',
        ],
    },
    {
        name: 'drooling_face',
        code: '🤤',
        keywords: [
            'drooling_face',
            'drooling',
            'face',
        ],
    },
    {
        name: 'sleeping',
        code: '😴',
        keywords: [
            'zzz',
            'sleeping',
            'face',
            'sleep',
        ],
    },
    {
        name: 'mask',
        code: '😷',
        keywords: [
            'sick',
            'ill',
            'mask',
            'cold',
            'doctor',
            'face',
            'medicine',
        ],
    },
    {
        name: 'face_with_thermometer',
        code: '🤒',
        keywords: [
            'sick',
            'face_with_thermometer',
            'face',
            'ill',
            'thermometer',
        ],
    },
    {
        name: 'face_with_head_bandage',
        code: '🤕',
        keywords: [
            'hurt',
            'face_with_head_bandage',
            'bandage',
            'face',
            'injury',
        ],
    },
    {
        name: 'nauseated_face',
        code: '🤢',
        keywords: [
            'sick',
            'barf',
            'disgusted',
            'nauseated_face',
            'face',
            'nauseated',
            'vomit',
        ],
    },
    {
        name: 'vomiting_face',
        code: '🤮',
        keywords: [
            'barf',
            'sick',
            'vomiting_face',
        ],
    },
    {
        name: 'sneezing_face',
        code: '🤧',
        keywords: [
            'achoo',
            'sick',
            'sneezing_face',
            'face',
            'gesundheit',
            'sneeze',
        ],
    },
    {
        name: 'hot_face',
        code: '🥵',
        keywords: [
            'heat',
            'sweating',
            'hot_face',
        ],
    },
    {
        name: 'cold_face',
        code: '🥶',
        keywords: [
            'freezing',
            'ice',
            'cold_face',
        ],
    },
    {
        name: 'woozy_face',
        code: '🥴',
        keywords: [
            'groggy',
            'woozy_face',
        ],
    },
    {
        name: 'dizzy_face',
        code: '😵',
        keywords: [
            'dizzy_face',
            'dizzy',
            'face',
        ],
    },
    {
        name: 'face_with_spiral_eyes',
        code: '😵‍💫',
        keywords: [
            'face_with_spiral_eyes',
        ],
    },
    {
        name: 'exploding_head',
        code: '🤯',
        keywords: [
            'mind',
            'blown',
            'exploding_head',
        ],
    },
    {
        name: 'cowboy_hat_face',
        code: '🤠',
        keywords: [
            'cowboy_hat_face',
            'cowboy',
            'cowgirl',
            'face',
            'hat',
        ],
    },
    {
        name: 'partying_face',
        code: '🥳',
        keywords: [
            'celebration',
            'birthday',
            'partying_face',
        ],
    },
    {
        name: 'disguised_face',
        code: '🥸',
        keywords: [
            'disguised_face',
        ],
    },
    {
        name: 'sunglasses',
        code: '😎',
        keywords: [
            'cool',
            'sunglasses',
            'bright',
            'eye',
            'eyewear',
            'face',
            'glasses',
            'smile',
            'sun',
            'weather',
        ],
    },
    {
        name: 'nerd_face',
        code: '🤓',
        keywords: [
            'geek',
            'glasses',
            'nerd_face',
            'face',
            'nerd',
        ],
    },
    {
        name: 'monocle_face',
        code: '🧐',
        keywords: [
            'monocle_face',
        ],
    },
    {
        name: 'confused',
        code: '😕',
        keywords: [
            'confused',
            'face',
        ],
    },
    {
        name: 'worried',
        code: '😟',
        keywords: [
            'nervous',
            'worried',
            'face',
        ],
    },
    {
        name: 'slightly_frowning_face',
        code: '🙁',
        keywords: [
            'slightly_frowning_face',
            'face',
            'frown',
        ],
    },
    {
        name: 'frowning_face',
        code: '☹️',
        keywords: [
            'frowning_face',
        ],
    },
    {
        name: 'open_mouth',
        code: '😮',
        keywords: [
            'surprise',
            'impressed',
            'wow',
            'open_mouth',
            'face',
            'mouth',
            'open',
            'sympathy',
        ],
    },
    {
        name: 'hushed',
        code: '😯',
        keywords: [
            'silence',
            'speechless',
            'hushed',
            'face',
            'stunned',
            'surprised',
        ],
    },
    {
        name: 'astonished',
        code: '😲',
        keywords: [
            'amazed',
            'gasp',
            'astonished',
            'face',
            'shocked',
            'totally',
        ],
    },
    {
        name: 'flushed',
        code: '😳',
        keywords: [
            'flushed',
            'dazed',
            'face',
        ],
    },
    {
        name: 'pleading_face',
        code: '🥺',
        keywords: [
            'puppy',
            'eyes',
            'pleading_face',
        ],
    },
    {
        name: 'frowning',
        code: '😦',
        keywords: [
            'frowning',
            'face',
            'frown',
            'mouth',
            'open',
        ],
    },
    {
        name: 'anguished',
        code: '😧',
        keywords: [
            'stunned',
            'anguished',
            'face',
        ],
    },
    {
        name: 'fearful',
        code: '😨',
        keywords: [
            'scared',
            'shocked',
            'oops',
            'fearful',
            'face',
            'fear',
        ],
    },
    {
        name: 'cold_sweat',
        code: '😰',
        keywords: [
            'nervous',
            'cold_sweat',
            'blue',
            'cold',
            'face',
            'mouth',
            'open',
            'rushed',
            'sweat',
        ],
    },
    {
        name: 'disappointed_relieved',
        code: '😥',
        keywords: [
            'phew',
            'sweat',
            'nervous',
            'disappointed_relieved',
            'disappointed',
            'face',
            'relieved',
            'whew',
        ],
    },
    {
        name: 'cry',
        code: '😢',
        keywords: [
            'sad',
            'tear',
            'cry',
            'face',
        ],
    },
    {
        name: 'sob',
        code: '😭',
        keywords: [
            'sad',
            'cry',
            'bawling',
            'sob',
            'face',
            'tear',
        ],
    },
    {
        name: 'scream',
        code: '😱',
        keywords: [
            'horror',
            'shocked',
            'scream',
            'face',
            'fear',
            'fearful',
            'munch',
            'scared',
        ],
    },
    {
        name: 'confounded',
        code: '😖',
        keywords: [
            'confounded',
            'face',
        ],
    },
    {
        name: 'persevere',
        code: '😣',
        keywords: [
            'struggling',
            'persevere',
            'face',
        ],
    },
    {
        name: 'disappointed',
        code: '😞',
        keywords: [
            'sad',
            'disappointed',
            'face',
        ],
    },
    {
        name: 'sweat',
        code: '😓',
        keywords: [
            'sweat',
            'cold',
            'face',
        ],
    },
    {
        name: 'weary',
        code: '😩',
        keywords: [
            'tired',
            'weary',
            'face',
        ],
    },
    {
        name: 'tired_face',
        code: '😫',
        keywords: [
            'upset',
            'whine',
            'tired_face',
            'face',
            'tired',
        ],
    },
    {
        name: 'yawning_face',
        code: '🥱',
        keywords: [
            'yawning_face',
        ],
    },
    {
        name: 'triumph',
        code: '😤',
        keywords: [
            'smug',
            'triumph',
            'face',
            'won',
        ],
    },
    {
        name: 'rage',
        code: '😡',
        keywords: [
            'angry',
            'rage',
            'pout',
            'face',
            'mad',
            'pouting',
            'red',
        ],
    },
    {
        name: 'angry',
        code: '😠',
        keywords: [
            'mad',
            'annoyed',
            'angry',
            'face',
        ],
    },
    {
        name: 'cursing_face',
        code: '🤬',
        keywords: [
            'foul',
            'cursing_face',
        ],
    },
    {
        name: 'smiling_imp',
        code: '😈',
        keywords: [
            'devil',
            'evil',
            'horns',
            'smiling_imp',
            'face',
            'fairy tale',
            'fantasy',
            'smile',
        ],
    },
    {
        name: 'imp',
        code: '👿',
        keywords: [
            'angry',
            'devil',
            'evil',
            'horns',
            'imp',
            'demon',
            'face',
            'fairy tale',
            'fantasy',
        ],
    },
    {
        name: 'skull',
        code: '💀',
        keywords: [
            'dead',
            'danger',
            'poison',
            'skull',
            'body',
            'death',
            'face',
            'fairy tale',
            'monster',
        ],
    },
    {
        name: 'skull_and_crossbones',
        code: '☠️',
        keywords: [
            'danger',
            'pirate',
            'skull_and_crossbones',
            'body',
            'crossbones',
            'death',
            'face',
            'monster',
            'skull',
        ],
    },
    {
        name: 'hankey',
        code: '💩',
        keywords: [
            'crap',
            'hankey',
            'poop',
            'shit',
            'comic',
            'dung',
            'face',
            'monster',
            'poo',
        ],
    },
    {
        name: 'clown_face',
        code: '🤡',
        keywords: [
            'clown_face',
            'clown',
            'face',
        ],
    },
    {
        name: 'japanese_ogre',
        code: '👹',
        keywords: [
            'monster',
            'japanese_ogre',
            'creature',
            'face',
            'fairy tale',
            'fantasy',
            'japanese',
            'ogre',
        ],
    },
    {
        name: 'japanese_goblin',
        code: '👺',
        keywords: [
            'japanese_goblin',
            'creature',
            'face',
            'fairy tale',
            'fantasy',
            'goblin',
            'japanese',
            'monster',
        ],
    },
    {
        name: 'ghost',
        code: '👻',
        keywords: [
            'halloween',
            'ghost',
            'creature',
            'face',
            'fairy tale',
            'fantasy',
            'monster',
        ],
    },
    {
        name: 'alien',
        code: '👽',
        keywords: [
            'ufo',
            'alien',
            'creature',
            'extraterrestrial',
            'face',
            'fairy tale',
            'fantasy',
            'monster',
            'space',
        ],
    },
    {
        name: 'space_invader',
        code: '👾',
        keywords: [
            'game',
            'retro',
            'space_invader',
            'alien',
            'creature',
            'extraterrestrial',
            'face',
            'fairy tale',
            'fantasy',
            'monster',
            'space',
            'ufo',
        ],
    },
    {
        name: 'robot',
        code: '🤖',
        keywords: [
            'robot',
            'face',
            'monster',
        ],
    },
    {
        name: 'smiley_cat',
        code: '😺',
        keywords: [
            'smiley_cat',
            'cat',
            'face',
            'mouth',
            'open',
            'smile',
        ],
    },
    {
        name: 'smile_cat',
        code: '😸',
        keywords: [
            'smile_cat',
            'cat',
            'eye',
            'face',
            'grin',
            'smile',
        ],
    },
    {
        name: 'joy_cat',
        code: '😹',
        keywords: [
            'joy_cat',
            'cat',
            'face',
            'joy',
            'tear',
        ],
    },
    {
        name: 'heart_eyes_cat',
        code: '😻',
        keywords: [
            'heart_eyes_cat',
            'cat',
            'eye',
            'face',
            'heart',
            'love',
            'smile',
        ],
    },
    {
        name: 'smirk_cat',
        code: '😼',
        keywords: [
            'smirk_cat',
            'cat',
            'face',
            'ironic',
            'smile',
            'wry',
        ],
    },
    {
        name: 'kissing_cat',
        code: '😽',
        keywords: [
            'kissing_cat',
            'cat',
            'eye',
            'face',
            'kiss',
        ],
    },
    {
        name: 'scream_cat',
        code: '🙀',
        keywords: [
            'horror',
            'scream_cat',
            'cat',
            'face',
            'oh',
            'surprised',
            'weary',
        ],
    },
    {
        name: 'crying_cat_face',
        code: '😿',
        keywords: [
            'sad',
            'tear',
            'crying_cat_face',
            'cat',
            'cry',
            'face',
        ],
    },
    {
        name: 'pouting_cat',
        code: '😾',
        keywords: [
            'pouting_cat',
            'cat',
            'face',
            'pouting',
        ],
    },
    {
        name: 'see_no_evil',
        code: '🙈',
        keywords: [
            'monkey',
            'blind',
            'ignore',
            'see_no_evil',
            'evil',
            'face',
            'forbidden',
            'gesture',
            'no',
            'not',
            'prohibited',
            'see',
        ],
    },
    {
        name: 'hear_no_evil',
        code: '🙉',
        keywords: [
            'monkey',
            'deaf',
            'hear_no_evil',
            'evil',
            'face',
            'forbidden',
            'gesture',
            'hear',
            'no',
            'not',
            'prohibited',
        ],
    },
    {
        name: 'speak_no_evil',
        code: '🙊',
        keywords: [
            'monkey',
            'mute',
            'hush',
            'speak_no_evil',
            'evil',
            'face',
            'forbidden',
            'gesture',
            'no',
            'not',
            'prohibited',
            'speak',
        ],
    },
    {
        name: 'kiss',
        code: '💋',
        keywords: [
            'lipstick',
            'kiss',
            'heart',
            'lips',
            'mark',
            'romance',
        ],
    },
    {
        name: 'love_letter',
        code: '💌',
        keywords: [
            'email',
            'envelope',
            'love_letter',
            'heart',
            'letter',
            'love',
            'mail',
            'romance',
        ],
    },
    {
        name: 'cupid',
        code: '💘',
        keywords: [
            'love',
            'heart',
            'cupid',
            'arrow',
            'romance',
        ],
    },
    {
        name: 'gift_heart',
        code: '💝',
        keywords: [
            'chocolates',
            'gift_heart',
            'heart',
            'ribbon',
            'valentine',
        ],
    },
    {
        name: 'sparkling_heart',
        code: '💖',
        keywords: [
            'sparkling_heart',
            'excited',
            'heart',
            'sparkle',
        ],
    },
    {
        name: 'heartpulse',
        code: '💗',
        keywords: [
            'heartpulse',
            'excited',
            'growing',
            'heart',
            'nervous',
        ],
    },
    {
        name: 'heartbeat',
        code: '💓',
        keywords: [
            'heartbeat',
            'beating',
            'heart',
            'pulsating',
        ],
    },
    {
        name: 'revolving_hearts',
        code: '💞',
        keywords: [
            'revolving_hearts',
            'heart',
            'revolving',
        ],
    },
    {
        name: 'two_hearts',
        code: '💕',
        keywords: [
            'two_hearts',
            'heart',
            'love',
        ],
    },
    {
        name: 'heart_decoration',
        code: '💟',
        keywords: [
            'heart_decoration',
            'heart',
        ],
    },
    {
        name: 'heavy_heart_exclamation',
        code: '❣️',
        keywords: [
            'heavy_heart_exclamation',
            'exclamation',
            'heart',
            'mark',
            'punctuation',
        ],
    },
    {
        name: 'broken_heart',
        code: '💔',
        keywords: [
            'broken_heart',
            'break',
            'broken',
            'heart',
        ],
    },
    {
        name: 'heart_on_fire',
        code: '❤️‍🔥',
        keywords: [
            'heart_on_fire',
        ],
    },
    {
        name: 'mending_heart',
        code: '❤️‍🩹',
        keywords: [
            'mending_heart',
        ],
    },
    {
        name: 'heart',
        code: '❤️',
        keywords: [
            'love',
            'heart',
        ],
    },
    {
        name: 'orange_heart',
        code: '🧡',
        keywords: [
            'orange_heart',
        ],
    },
    {
        name: 'yellow_heart',
        code: '💛',
        keywords: [
            'yellow_heart',
            'heart',
            'yellow',
        ],
    },
    {
        name: 'green_heart',
        code: '💚',
        keywords: [
            'green_heart',
            'green',
            'heart',
        ],
    },
    {
        name: 'blue_heart',
        code: '💙',
        keywords: [
            'blue_heart',
            'blue',
            'heart',
        ],
    },
    {
        name: 'purple_heart',
        code: '💜',
        keywords: [
            'purple_heart',
            'heart',
            'purple',
        ],
    },
    {
        name: 'brown_heart',
        code: '🤎',
        keywords: [
            'brown_heart',
        ],
    },
    {
        name: 'black_heart',
        code: '🖤',
        keywords: [
            'black_heart',
            'black',
            'evil',
            'heart',
            'wicked',
        ],
    },
    {
        name: 'white_heart',
        code: '🤍',
        keywords: [
            'white_heart',
        ],
    },
    {
        name: '100',
        code: '💯',
        keywords: [
            'score',
            'perfect',
            '100',
            'full',
            'hundred',
        ],
    },
    {
        name: 'anger',
        code: '💢',
        keywords: [
            'angry',
            'anger',
            'comic',
            'mad',
        ],
    },
    {
        name: 'boom',
        code: '💥',
        keywords: [
            'explode',
            'boom',
            'collision',
            'comic',
        ],
    },
    {
        name: 'dizzy',
        code: '💫',
        keywords: [
            'star',
            'dizzy',
            'comic',
        ],
    },
    {
        name: 'sweat_drops',
        code: '💦',
        keywords: [
            'water',
            'workout',
            'sweat_drops',
            'comic',
            'splashing',
            'sweat',
        ],
    },
    {
        name: 'dash',
        code: '💨',
        keywords: [
            'wind',
            'blow',
            'fast',
            'dash',
            'comic',
            'running',
        ],
    },
    {
        name: 'hole',
        code: '🕳️',
        keywords: [
            'hole',
        ],
    },
    {
        name: 'bomb',
        code: '💣',
        keywords: [
            'boom',
            'bomb',
            'comic',
        ],
    },
    {
        name: 'speech_balloon',
        code: '💬',
        keywords: [
            'comment',
            'speech_balloon',
            'balloon',
            'bubble',
            'comic',
            'dialog',
            'speech',
        ],
    },
    {
        name: 'eye_speech_bubble',
        code: '👁️‍🗨️',
        keywords: [
            'eye_speech_bubble',
        ],
    },
    {
        name: 'left_speech_bubble',
        code: '🗨️',
        keywords: [
            'left_speech_bubble',
        ],
    },
    {
        name: 'right_anger_bubble',
        code: '🗯️',
        keywords: [
            'right_anger_bubble',
        ],
    },
    {
        name: 'thought_balloon',
        code: '💭',
        keywords: [
            'thinking',
            'thought_balloon',
            'balloon',
            'bubble',
            'comic',
            'thought',
        ],
    },
    {
        name: 'zzz',
        code: '💤',
        keywords: [
            'sleeping',
            'zzz',
            'comic',
            'sleep',
        ],
    },
    {
        code: 'peopleAndBody',
        header: true,
    },
    {
        name: 'wave',
        code: '👋',
        keywords: [
            'goodbye',
            'wave',
            'body',
            'hand',
            'waving',
        ],
        types: [
            '👋🏿',
            '👋🏾',
            '👋🏽',
            '👋🏼',
            '👋🏻',
        ],
    },
    {
        name: 'raised_back_of_hand',
        code: '🤚',
        keywords: [
            'raised_back_of_hand',
            'backhand',
            'raised',
        ],
        types: [
            '🤚🏿',
            '🤚🏾',
            '🤚🏽',
            '🤚🏼',
            '🤚🏻',
        ],
    },
    {
        name: 'raised_hand_with_fingers_splayed',
        code: '🖐️',
        keywords: [
            'raised_hand_with_fingers_splayed',
        ],
        types: [
            '🖐🏿',
            '🖐🏾',
            '🖐🏽',
            '🖐🏼',
            '🖐🏻',
        ],
    },
    {
        name: 'hand',
        code: '✋',
        keywords: [
            'highfive',
            'stop',
            'hand',
            'raised_hand',
            'body',
        ],
        types: [
            '✋🏿',
            '✋🏾',
            '✋🏽',
            '✋🏼',
            '✋🏻',
        ],
    },
    {
        name: 'vulcan_salute',
        code: '🖖',
        keywords: [
            'prosper',
            'spock',
            'vulcan_salute',
            'body',
            'finger',
            'hand',
            'vulcan',
        ],
        types: [
            '🖖🏿',
            '🖖🏾',
            '🖖🏽',
            '🖖🏼',
            '🖖🏻',
        ],
    },
    {
        name: 'ok_hand',
        code: '👌',
        keywords: [
            'ok_hand',
            'body',
            'hand',
            'ok',
        ],
        types: [
            '👌🏿',
            '👌🏾',
            '👌🏽',
            '👌🏼',
            '👌🏻',
        ],
    },
    {
        name: 'pinched_fingers',
        code: '🤌',
        keywords: [
            'pinched_fingers',
        ],
        types: [
            '🤌🏿',
            '🤌🏾',
            '🤌🏽',
            '🤌🏼',
            '🤌🏻',
        ],
    },
    {
        name: 'pinching_hand',
        code: '🤏',
        keywords: [
            'pinching_hand',
        ],
        types: [
            '🤏🏿',
            '🤏🏾',
            '🤏🏽',
            '🤏🏼',
            '🤏🏻',
        ],
    },
    {
        name: 'v',
        code: '✌️',
        keywords: [
            'victory',
            'peace',
            'v',
        ],
        types: [
            '✌🏿',
            '✌🏾',
            '✌🏽',
            '✌🏼',
            '✌🏻',
        ],
    },
    {
        name: 'crossed_fingers',
        code: '🤞',
        keywords: [
            'luck',
            'hopeful',
            'crossed_fingers',
            'cross',
            'finger',
            'hand',
        ],
        types: [
            '🤞🏿',
            '🤞🏾',
            '🤞🏽',
            '🤞🏼',
            '🤞🏻',
        ],
    },
    {
        name: 'love_you_gesture',
        code: '🤟',
        keywords: [
            'love_you_gesture',
        ],
        types: [
            '🤟🏿',
            '🤟🏾',
            '🤟🏽',
            '🤟🏼',
            '🤟🏻',
        ],
    },
    {
        name: 'metal',
        code: '🤘',
        keywords: [
            'metal',
            'body',
            'finger',
            'hand',
            'horns',
            'rock-on',
        ],
        types: [
            '🤘🏿',
            '🤘🏾',
            '🤘🏽',
            '🤘🏼',
            '🤘🏻',
        ],
    },
    {
        name: 'call_me_hand',
        code: '🤙',
        keywords: [
            'call_me_hand',
            'call',
            'hand',
        ],
        types: [
            '🤙🏿',
            '🤙🏾',
            '🤙🏽',
            '🤙🏼',
            '🤙🏻',
        ],
    },
    {
        name: 'point_left',
        code: '👈',
        keywords: [
            'point_left',
            'backhand',
            'body',
            'finger',
            'hand',
            'index',
            'point',
        ],
        types: [
            '👈🏿',
            '👈🏾',
            '👈🏽',
            '👈🏼',
            '👈🏻',
        ],
    },
    {
        name: 'point_right',
        code: '👉',
        keywords: [
            'point_right',
            'backhand',
            'body',
            'finger',
            'hand',
            'index',
            'point',
        ],
        types: [
            '👉🏿',
            '👉🏾',
            '👉🏽',
            '👉🏼',
            '👉🏻',
        ],
    },
    {
        name: 'point_up_2',
        code: '👆',
        keywords: [
            'point_up_2',
            'backhand',
            'body',
            'finger',
            'hand',
            'index',
            'point',
            'up',
        ],
        types: [
            '👆🏿',
            '👆🏾',
            '👆🏽',
            '👆🏼',
            '👆🏻',
        ],
    },
    {
        name: 'middle_finger',
        code: '🖕',
        keywords: [
            'middle_finger',
            'fu',
            'body',
            'finger',
            'hand',
            'middle finger',
        ],
        types: [
            '🖕🏿',
            '🖕🏾',
            '🖕🏽',
            '🖕🏼',
            '🖕🏻',
        ],
    },
    {
        name: 'point_down',
        code: '👇',
        keywords: [
            'point_down',
            'backhand',
            'body',
            'down',
            'finger',
            'hand',
            'index',
            'point',
        ],
        types: [
            '👇🏿',
            '👇🏾',
            '👇🏽',
            '👇🏼',
            '👇🏻',
        ],
    },
    {
        name: 'point_up',
        code: '☝️',
        keywords: [
            'point_up',
        ],
        types: [
            '☝🏿',
            '☝🏾',
            '☝🏽',
            '☝🏼',
            '☝🏻',
        ],
    },
    {
        name: '+1',
        code: '👍',
        keywords: [
            'approve',
            'ok',
            '+1',
            'thumbsup',
            'body',
            'hand',
            'thumb',
            'thumbs up',
            'up',
        ],
        types: [
            '👍🏿',
            '👍🏾',
            '👍🏽',
            '👍🏼',
            '👍🏻',
        ],
    },
    {
        name: '-1',
        code: '👎',
        keywords: [
            'disapprove',
            'bury',
            '-1',
            'thumbsdown',
            'body',
            'down',
            'hand',
            'thumb',
            'thumbs down',
        ],
        types: [
            '👎🏿',
            '👎🏾',
            '👎🏽',
            '👎🏼',
            '👎🏻',
        ],
    },
    {
        name: 'fist_raised',
        code: '✊',
        keywords: [
            'power',
            'fist_raised',
            'fist',
            'body',
            'clenched',
            'hand',
            'punch',
        ],
        types: [
            '✊🏿',
            '✊🏾',
            '✊🏽',
            '✊🏼',
            '✊🏻',
        ],
    },
    {
        name: 'fist_oncoming',
        code: '👊',
        keywords: [
            'attack',
            'fist_oncoming',
            'facepunch',
            'punch',
            'body',
            'clenched',
            'fist',
            'hand',
        ],
        types: [
            '👊🏿',
            '👊🏾',
            '👊🏽',
            '👊🏼',
            '👊🏻',
        ],
    },
    {
        name: 'fist_left',
        code: '🤛',
        keywords: [
            'fist_left',
            'fist',
            'leftwards',
        ],
        types: [
            '🤛🏿',
            '🤛🏾',
            '🤛🏽',
            '🤛🏼',
            '🤛🏻',
        ],
    },
    {
        name: 'fist_right',
        code: '🤜',
        keywords: [
            'fist_right',
            'fist',
            'rightwards',
        ],
        types: [
            '🤜🏿',
            '🤜🏾',
            '🤜🏽',
            '🤜🏼',
            '🤜🏻',
        ],
    },
    {
        name: 'clap',
        code: '👏',
        keywords: [
            'praise',
            'applause',
            'clap',
            'body',
            'hand',
        ],
        types: [
            '👏🏿',
            '👏🏾',
            '👏🏽',
            '👏🏼',
            '👏🏻',
        ],
    },
    {
        name: 'raised_hands',
        code: '🙌',
        keywords: [
            'hooray',
            'raised_hands',
            'body',
            'celebration',
            'gesture',
            'hand',
            'raised',
        ],
        types: [
            '🙌🏿',
            '🙌🏾',
            '🙌🏽',
            '🙌🏼',
            '🙌🏻',
        ],
    },
    {
        name: 'open_hands',
        code: '👐',
        keywords: [
            'open_hands',
            'body',
            'hand',
            'open',
        ],
        types: [
            '👐🏿',
            '👐🏾',
            '👐🏽',
            '👐🏼',
            '👐🏻',
        ],
    },
    {
        name: 'palms_up_together',
        code: '🤲',
        keywords: [
            'palms_up_together',
        ],
        types: [
            '🤲🏿',
            '🤲🏾',
            '🤲🏽',
            '🤲🏼',
            '🤲🏻',
        ],
    },
    {
        name: 'handshake',
        code: '🤝',
        keywords: [
            'deal',
            'handshake',
            'agreement',
            'hand',
            'meeting',
            'shake',
        ],
        types: [
            '🤝🏿',
            '🤝🏾',
            '🤝🏽',
            '🤝🏼',
            '🤝🏻',
        ],
    },
    {
        name: 'pray',
        code: '🙏',
        keywords: [
            'please',
            'hope',
            'wish',
            'pray',
            'ask',
            'body',
            'bow',
            'folded',
            'gesture',
            'hand',
            'thanks',
        ],
        types: [
            '🙏🏿',
            '🙏🏾',
            '🙏🏽',
            '🙏🏼',
            '🙏🏻',
        ],
    },
    {
        name: 'writing_hand',
        code: '✍️',
        keywords: [
            'writing_hand',
        ],
        types: [
            '✍🏿',
            '✍🏾',
            '✍🏽',
            '✍🏼',
            '✍🏻',
        ],
    },
    {
        name: 'nail_care',
        code: '💅',
        keywords: [
            'beauty',
            'manicure',
            'nail_care',
            'body',
            'care',
            'cosmetics',
            'nail',
            'polish',
        ],
        types: [
            '💅🏿',
            '💅🏾',
            '💅🏽',
            '💅🏼',
            '💅🏻',
        ],
    },
    {
        name: 'selfie',
        code: '🤳',
        keywords: [
            'selfie',
            'camera',
            'phone',
        ],
        types: [
            '🤳🏿',
            '🤳🏾',
            '🤳🏽',
            '🤳🏼',
            '🤳🏻',
        ],
    },
    {
        name: 'muscle',
        code: '💪',
        keywords: [
            'flex',
            'bicep',
            'strong',
            'workout',
            'muscle',
            'biceps',
            'body',
            'comic',
        ],
        types: [
            '💪🏿',
            '💪🏾',
            '💪🏽',
            '💪🏼',
            '💪🏻',
        ],
    },
    {
        name: 'mechanical_arm',
        code: '🦾',
        keywords: [
            'mechanical_arm',
        ],
    },
    {
        name: 'mechanical_leg',
        code: '🦿',
        keywords: [
            'mechanical_leg',
        ],
    },
    {
        name: 'leg',
        code: '🦵',
        keywords: [
            'leg',
        ],
        types: [
            '🦵🏿',
            '🦵🏾',
            '🦵🏽',
            '🦵🏼',
            '🦵🏻',
        ],
    },
    {
        name: 'foot',
        code: '🦶',
        keywords: [
            'foot',
        ],
        types: [
            '🦶🏿',
            '🦶🏾',
            '🦶🏽',
            '🦶🏼',
            '🦶🏻',
        ],
    },
    {
        name: 'ear',
        code: '👂',
        keywords: [
            'hear',
            'sound',
            'listen',
            'ear',
            'body',
        ],
        types: [
            '👂🏿',
            '👂🏾',
            '👂🏽',
            '👂🏼',
            '👂🏻',
        ],
    },
    {
        name: 'ear_with_hearing_aid',
        code: '🦻',
        keywords: [
            'ear_with_hearing_aid',
        ],
        types: [
            '🦻🏿',
            '🦻🏾',
            '🦻🏽',
            '🦻🏼',
            '🦻🏻',
        ],
    },
    {
        name: 'nose',
        code: '👃',
        keywords: [
            'smell',
            'nose',
            'body',
        ],
        types: [
            '👃🏿',
            '👃🏾',
            '👃🏽',
            '👃🏼',
            '👃🏻',
        ],
    },
    {
        name: 'brain',
        code: '🧠',
        keywords: [
            'brain',
        ],
    },
    {
        name: 'anatomical_heart',
        code: '🫀',
        keywords: [
            'anatomical_heart',
        ],
    },
    {
        name: 'lungs',
        code: '🫁',
        keywords: [
            'lungs',
        ],
    },
    {
        name: 'tooth',
        code: '🦷',
        keywords: [
            'tooth',
        ],
    },
    {
        name: 'bone',
        code: '🦴',
        keywords: [
            'bone',
        ],
    },
    {
        name: 'eyes',
        code: '👀',
        keywords: [
            'look',
            'see',
            'watch',
            'eyes',
            'body',
            'eye',
            'face',
        ],
    },
    {
        name: 'eye',
        code: '👁️',
        keywords: [
            'eye',
        ],
    },
    {
        name: 'tongue',
        code: '👅',
        keywords: [
            'taste',
            'tongue',
            'body',
        ],
    },
    {
        name: 'lips',
        code: '👄',
        keywords: [
            'kiss',
            'lips',
            'body',
            'mouth',
        ],
    },
    {
        name: 'baby',
        code: '👶',
        keywords: [
            'child',
            'newborn',
            'baby',
        ],
        types: [
            '👶🏿',
            '👶🏾',
            '👶🏽',
            '👶🏼',
            '👶🏻',
        ],
    },
    {
        name: 'child',
        code: '🧒',
        keywords: [
            'child',
        ],
        types: [
            '🧒🏿',
            '🧒🏾',
            '🧒🏽',
            '🧒🏼',
            '🧒🏻',
        ],
    },
    {
        name: 'boy',
        code: '👦',
        keywords: [
            'child',
            'boy',
        ],
        types: [
            '👦🏿',
            '👦🏾',
            '👦🏽',
            '👦🏼',
            '👦🏻',
        ],
    },
    {
        name: 'girl',
        code: '👧',
        keywords: [
            'child',
            'girl',
            'maiden',
            'virgin',
            'virgo',
            'zodiac',
        ],
        types: [
            '👧🏿',
            '👧🏾',
            '👧🏽',
            '👧🏼',
            '👧🏻',
        ],
    },
    {
        name: 'adult',
        code: '🧑',
        keywords: [
            'adult',
        ],
        types: [
            '🧑🏿',
            '🧑🏾',
            '🧑🏽',
            '🧑🏼',
            '🧑🏻',
        ],
    },
    {
        name: 'blond_haired_person',
        code: '👱',
        keywords: [
            'blond_haired_person',
            'blond',
        ],
        types: [
            '👱🏿',
            '👱🏾',
            '👱🏽',
            '👱🏼',
            '👱🏻',
        ],
    },
    {
        name: 'man',
        code: '👨',
        keywords: [
            'mustache',
            'father',
            'dad',
            'man',
        ],
        types: [
            '👨🏿',
            '👨🏾',
            '👨🏽',
            '👨🏼',
            '👨🏻',
        ],
    },
    {
        name: 'bearded_person',
        code: '🧔',
        keywords: [
            'bearded_person',
        ],
        types: [
            '🧔🏿',
            '🧔🏾',
            '🧔🏽',
            '🧔🏼',
            '🧔🏻',
        ],
    },
    {
        name: 'man_beard',
        code: '🧔‍♂️',
        keywords: [
            'man_beard',
        ],
        types: [
            '🧔🏿‍♂️',
            '🧔🏾‍♂️',
            '🧔🏽‍♂️',
            '🧔🏼‍♂️',
            '🧔🏻‍♂️',
        ],
    },
    {
        name: 'woman_beard',
        code: '🧔‍♀️',
        keywords: [
            'woman_beard',
        ],
        types: [
            '🧔🏿‍♀️',
            '🧔🏾‍♀️',
            '🧔🏽‍♀️',
            '🧔🏼‍♀️',
            '🧔🏻‍♀️',
        ],
    },
    {
        name: 'red_haired_man',
        code: '👨‍🦰',
        keywords: [
            'red_haired_man',
        ],
        types: [
            '👨🏿‍🦰',
            '👨🏾‍🦰',
            '👨🏽‍🦰',
            '👨🏼‍🦰',
            '👨🏻‍🦰',
        ],
    },
    {
        name: 'curly_haired_man',
        code: '👨‍🦱',
        keywords: [
            'curly_haired_man',
        ],
        types: [
            '👨🏿‍🦱',
            '👨🏾‍🦱',
            '👨🏽‍🦱',
            '👨🏼‍🦱',
            '👨🏻‍🦱',
        ],
    },
    {
        name: 'white_haired_man',
        code: '👨‍🦳',
        keywords: [
            'white_haired_man',
        ],
        types: [
            '👨🏿‍🦳',
            '👨🏾‍🦳',
            '👨🏽‍🦳',
            '👨🏼‍🦳',
            '👨🏻‍🦳',
        ],
    },
    {
        name: 'bald_man',
        code: '👨‍🦲',
        keywords: [
            'bald_man',
        ],
        types: [
            '👨🏿‍🦲',
            '👨🏾‍🦲',
            '👨🏽‍🦲',
            '👨🏼‍🦲',
            '👨🏻‍🦲',
        ],
    },
    {
        name: 'woman',
        code: '👩',
        keywords: [
            'girls',
            'woman',
        ],
        types: [
            '👩🏿',
            '👩🏾',
            '👩🏽',
            '👩🏼',
            '👩🏻',
        ],
    },
    {
        name: 'red_haired_woman',
        code: '👩‍🦰',
        keywords: [
            'red_haired_woman',
        ],
        types: [
            '👩🏿‍🦰',
            '👩🏾‍🦰',
            '👩🏽‍🦰',
            '👩🏼‍🦰',
            '👩🏻‍🦰',
        ],
    },
    {
        name: 'person_red_hair',
        code: '🧑‍🦰',
        keywords: [
            'person_red_hair',
        ],
        types: [
            '🧑🏿‍🦰',
            '🧑🏾‍🦰',
            '🧑🏽‍🦰',
            '🧑🏼‍🦰',
            '🧑🏻‍🦰',
        ],
    },
    {
        name: 'curly_haired_woman',
        code: '👩‍🦱',
        keywords: [
            'curly_haired_woman',
        ],
        types: [
            '👩🏿‍🦱',
            '👩🏾‍🦱',
            '👩🏽‍🦱',
            '👩🏼‍🦱',
            '👩🏻‍🦱',
        ],
    },
    {
        name: 'person_curly_hair',
        code: '🧑‍🦱',
        keywords: [
            'person_curly_hair',
        ],
        types: [
            '🧑🏿‍🦱',
            '🧑🏾‍🦱',
            '🧑🏽‍🦱',
            '🧑🏼‍🦱',
            '🧑🏻‍🦱',
        ],
    },
    {
        name: 'white_haired_woman',
        code: '👩‍🦳',
        keywords: [
            'white_haired_woman',
        ],
        types: [
            '👩🏿‍🦳',
            '👩🏾‍🦳',
            '👩🏽‍🦳',
            '👩🏼‍🦳',
            '👩🏻‍🦳',
        ],
    },
    {
        name: 'person_white_hair',
        code: '🧑‍🦳',
        keywords: [
            'person_white_hair',
        ],
        types: [
            '🧑🏿‍🦳',
            '🧑🏾‍🦳',
            '🧑🏽‍🦳',
            '🧑🏼‍🦳',
            '🧑🏻‍🦳',
        ],
    },
    {
        name: 'bald_woman',
        code: '👩‍🦲',
        keywords: [
            'bald_woman',
        ],
        types: [
            '👩🏿‍🦲',
            '👩🏾‍🦲',
            '👩🏽‍🦲',
            '👩🏼‍🦲',
            '👩🏻‍🦲',
        ],
    },
    {
        name: 'person_bald',
        code: '🧑‍🦲',
        keywords: [
            'person_bald',
        ],
        types: [
            '🧑🏿‍🦲',
            '🧑🏾‍🦲',
            '🧑🏽‍🦲',
            '🧑🏼‍🦲',
            '🧑🏻‍🦲',
        ],
    },
    {
        name: 'blond_haired_woman',
        code: '👱‍♀️',
        keywords: [
            'blond_haired_woman',
            'blonde_woman',
        ],
        types: [
            '👱🏿‍♀️',
            '👱🏾‍♀️',
            '👱🏽‍♀️',
            '👱🏼‍♀️',
            '👱🏻‍♀️',
        ],
    },
    {
        name: 'blond_haired_man',
        code: '👱‍♂️',
        keywords: [
            'blond_haired_man',
        ],
        types: [
            '👱🏿‍♂️',
            '👱🏾‍♂️',
            '👱🏽‍♂️',
            '👱🏼‍♂️',
            '👱🏻‍♂️',
        ],
    },
    {
        name: 'older_adult',
        code: '🧓',
        keywords: [
            'older_adult',
        ],
        types: [
            '🧓🏿',
            '🧓🏾',
            '🧓🏽',
            '🧓🏼',
            '🧓🏻',
        ],
    },
    {
        name: 'older_man',
        code: '👴',
        keywords: [
            'older_man',
            'man',
            'old',
        ],
        types: [
            '👴🏿',
            '👴🏾',
            '👴🏽',
            '👴🏼',
            '👴🏻',
        ],
    },
    {
        name: 'older_woman',
        code: '👵',
        keywords: [
            'older_woman',
            'old',
            'woman',
        ],
        types: [
            '👵🏿',
            '👵🏾',
            '👵🏽',
            '👵🏼',
            '👵🏻',
        ],
    },
    {
        name: 'frowning_person',
        code: '🙍',
        keywords: [
            'frowning_person',
            'frown',
            'gesture',
        ],
        types: [
            '🙍🏿',
            '🙍🏾',
            '🙍🏽',
            '🙍🏼',
            '🙍🏻',
        ],
    },
    {
        name: 'frowning_man',
        code: '🙍‍♂️',
        keywords: [
            'frowning_man',
        ],
        types: [
            '🙍🏿‍♂️',
            '🙍🏾‍♂️',
            '🙍🏽‍♂️',
            '🙍🏼‍♂️',
            '🙍🏻‍♂️',
        ],
    },
    {
        name: 'frowning_woman',
        code: '🙍‍♀️',
        keywords: [
            'frowning_woman',
        ],
        types: [
            '🙍🏿‍♀️',
            '🙍🏾‍♀️',
            '🙍🏽‍♀️',
            '🙍🏼‍♀️',
            '🙍🏻‍♀️',
        ],
    },
    {
        name: 'pouting_face',
        code: '🙎',
        keywords: [
            'pouting_face',
            'gesture',
            'pouting',
        ],
        types: [
            '🙎🏿',
            '🙎🏾',
            '🙎🏽',
            '🙎🏼',
            '🙎🏻',
        ],
    },
    {
        name: 'pouting_man',
        code: '🙎‍♂️',
        keywords: [
            'pouting_man',
        ],
        types: [
            '🙎🏿‍♂️',
            '🙎🏾‍♂️',
            '🙎🏽‍♂️',
            '🙎🏼‍♂️',
            '🙎🏻‍♂️',
        ],
    },
    {
        name: 'pouting_woman',
        code: '🙎‍♀️',
        keywords: [
            'pouting_woman',
        ],
        types: [
            '🙎🏿‍♀️',
            '🙎🏾‍♀️',
            '🙎🏽‍♀️',
            '🙎🏼‍♀️',
            '🙎🏻‍♀️',
        ],
    },
    {
        name: 'no_good',
        code: '🙅',
        keywords: [
            'stop',
            'halt',
            'denied',
            'no_good',
            'forbidden',
            'gesture',
            'hand',
            'no',
            'not',
            'prohibited',
        ],
        types: [
            '🙅🏿',
            '🙅🏾',
            '🙅🏽',
            '🙅🏼',
            '🙅🏻',
        ],
    },
    {
        name: 'no_good_man',
        code: '🙅‍♂️',
        keywords: [
            'stop',
            'halt',
            'denied',
            'no_good_man',
            'ng_man',
        ],
        types: [
            '🙅🏿‍♂️',
            '🙅🏾‍♂️',
            '🙅🏽‍♂️',
            '🙅🏼‍♂️',
            '🙅🏻‍♂️',
        ],
    },
    {
        name: 'no_good_woman',
        code: '🙅‍♀️',
        keywords: [
            'stop',
            'halt',
            'denied',
            'no_good_woman',
            'ng_woman',
        ],
        types: [
            '🙅🏿‍♀️',
            '🙅🏾‍♀️',
            '🙅🏽‍♀️',
            '🙅🏼‍♀️',
            '🙅🏻‍♀️',
        ],
    },
    {
        name: 'ok_person',
        code: '🙆',
        keywords: [
            'ok_person',
            'gesture',
            'hand',
            'ok',
        ],
        types: [
            '🙆🏿',
            '🙆🏾',
            '🙆🏽',
            '🙆🏼',
            '🙆🏻',
        ],
    },
    {
        name: 'ok_man',
        code: '🙆‍♂️',
        keywords: [
            'ok_man',
        ],
        types: [
            '🙆🏿‍♂️',
            '🙆🏾‍♂️',
            '🙆🏽‍♂️',
            '🙆🏼‍♂️',
            '🙆🏻‍♂️',
        ],
    },
    {
        name: 'ok_woman',
        code: '🙆‍♀️',
        keywords: [
            'ok_woman',
        ],
        types: [
            '🙆🏿‍♀️',
            '🙆🏾‍♀️',
            '🙆🏽‍♀️',
            '🙆🏼‍♀️',
            '🙆🏻‍♀️',
        ],
    },
    {
        name: 'tipping_hand_person',
        code: '💁',
        keywords: [
            'tipping_hand_person',
            'information_desk_person',
            'hand',
            'help',
            'information',
            'sassy',
        ],
        types: [
            '💁🏿',
            '💁🏾',
            '💁🏽',
            '💁🏼',
            '💁🏻',
        ],
    },
    {
        name: 'tipping_hand_man',
        code: '💁‍♂️',
        keywords: [
            'information',
            'tipping_hand_man',
            'sassy_man',
        ],
        types: [
            '💁🏿‍♂️',
            '💁🏾‍♂️',
            '💁🏽‍♂️',
            '💁🏼‍♂️',
            '💁🏻‍♂️',
        ],
    },
    {
        name: 'tipping_hand_woman',
        code: '💁‍♀️',
        keywords: [
            'information',
            'tipping_hand_woman',
            'sassy_woman',
        ],
        types: [
            '💁🏿‍♀️',
            '💁🏾‍♀️',
            '💁🏽‍♀️',
            '💁🏼‍♀️',
            '💁🏻‍♀️',
        ],
    },
    {
        name: 'raising_hand',
        code: '🙋',
        keywords: [
            'raising_hand',
            'gesture',
            'hand',
            'happy',
            'raised',
        ],
        types: [
            '🙋🏿',
            '🙋🏾',
            '🙋🏽',
            '🙋🏼',
            '🙋🏻',
        ],
    },
    {
        name: 'raising_hand_man',
        code: '🙋‍♂️',
        keywords: [
            'raising_hand_man',
        ],
        types: [
            '🙋🏿‍♂️',
            '🙋🏾‍♂️',
            '🙋🏽‍♂️',
            '🙋🏼‍♂️',
            '🙋🏻‍♂️',
        ],
    },
    {
        name: 'raising_hand_woman',
        code: '🙋‍♀️',
        keywords: [
            'raising_hand_woman',
        ],
        types: [
            '🙋🏿‍♀️',
            '🙋🏾‍♀️',
            '🙋🏽‍♀️',
            '🙋🏼‍♀️',
            '🙋🏻‍♀️',
        ],
    },
    {
        name: 'deaf_person',
        code: '🧏',
        keywords: [
            'deaf_person',
        ],
        types: [
            '🧏🏿',
            '🧏🏾',
            '🧏🏽',
            '🧏🏼',
            '🧏🏻',
        ],
    },
    {
        name: 'deaf_man',
        code: '🧏‍♂️',
        keywords: [
            'deaf_man',
        ],
        types: [
            '🧏🏿‍♂️',
            '🧏🏾‍♂️',
            '🧏🏽‍♂️',
            '🧏🏼‍♂️',
            '🧏🏻‍♂️',
        ],
    },
    {
        name: 'deaf_woman',
        code: '🧏‍♀️',
        keywords: [
            'deaf_woman',
        ],
        types: [
            '🧏🏿‍♀️',
            '🧏🏾‍♀️',
            '🧏🏽‍♀️',
            '🧏🏼‍♀️',
            '🧏🏻‍♀️',
        ],
    },
    {
        name: 'bow',
        code: '🙇',
        keywords: [
            'respect',
            'thanks',
            'bow',
            'apology',
            'gesture',
            'sorry',
        ],
        types: [
            '🙇🏿',
            '🙇🏾',
            '🙇🏽',
            '🙇🏼',
            '🙇🏻',
        ],
    },
    {
        name: 'bowing_man',
        code: '🙇‍♂️',
        keywords: [
            'respect',
            'thanks',
            'bowing_man',
        ],
        types: [
            '🙇🏿‍♂️',
            '🙇🏾‍♂️',
            '🙇🏽‍♂️',
            '🙇🏼‍♂️',
            '🙇🏻‍♂️',
        ],
    },
    {
        name: 'bowing_woman',
        code: '🙇‍♀️',
        keywords: [
            'respect',
            'thanks',
            'bowing_woman',
        ],
        types: [
            '🙇🏿‍♀️',
            '🙇🏾‍♀️',
            '🙇🏽‍♀️',
            '🙇🏼‍♀️',
            '🙇🏻‍♀️',
        ],
    },
    {
        name: 'facepalm',
        code: '🤦',
        keywords: [
            'facepalm',
            'disbelief',
            'exasperation',
            'face',
            'palm',
        ],
        types: [
            '🤦🏿',
            '🤦🏾',
            '🤦🏽',
            '🤦🏼',
            '🤦🏻',
        ],
    },
    {
        name: 'man_facepalming',
        code: '🤦‍♂️',
        keywords: [
            'man_facepalming',
        ],
        types: [
            '🤦🏿‍♂️',
            '🤦🏾‍♂️',
            '🤦🏽‍♂️',
            '🤦🏼‍♂️',
            '🤦🏻‍♂️',
        ],
    },
    {
        name: 'woman_facepalming',
        code: '🤦‍♀️',
        keywords: [
            'woman_facepalming',
        ],
        types: [
            '🤦🏿‍♀️',
            '🤦🏾‍♀️',
            '🤦🏽‍♀️',
            '🤦🏼‍♀️',
            '🤦🏻‍♀️',
        ],
    },
    {
        name: 'shrug',
        code: '🤷',
        keywords: [
            'shrug',
            'doubt',
            'ignorance',
            'indifference',
        ],
        types: [
            '🤷🏿',
            '🤷🏾',
            '🤷🏽',
            '🤷🏼',
            '🤷🏻',
        ],
    },
    {
        name: 'man_shrugging',
        code: '🤷‍♂️',
        keywords: [
            'man_shrugging',
        ],
        types: [
            '🤷🏿‍♂️',
            '🤷🏾‍♂️',
            '🤷🏽‍♂️',
            '🤷🏼‍♂️',
            '🤷🏻‍♂️',
        ],
    },
    {
        name: 'woman_shrugging',
        code: '🤷‍♀️',
        keywords: [
            'woman_shrugging',
        ],
        types: [
            '🤷🏿‍♀️',
            '🤷🏾‍♀️',
            '🤷🏽‍♀️',
            '🤷🏼‍♀️',
            '🤷🏻‍♀️',
        ],
    },
    {
        name: 'health_worker',
        code: '🧑‍⚕️',
        keywords: [
            'health_worker',
        ],
        types: [
            '🧑🏿‍⚕️',
            '🧑🏾‍⚕️',
            '🧑🏽‍⚕️',
            '🧑🏼‍⚕️',
            '🧑🏻‍⚕️',
        ],
    },
    {
        name: 'man_health_worker',
        code: '👨‍⚕️',
        keywords: [
            'doctor',
            'nurse',
            'man_health_worker',
        ],
        types: [
            '👨🏿‍⚕️',
            '👨🏾‍⚕️',
            '👨🏽‍⚕️',
            '👨🏼‍⚕️',
            '👨🏻‍⚕️',
        ],
    },
    {
        name: 'woman_health_worker',
        code: '👩‍⚕️',
        keywords: [
            'doctor',
            'nurse',
            'woman_health_worker',
        ],
        types: [
            '👩🏿‍⚕️',
            '👩🏾‍⚕️',
            '👩🏽‍⚕️',
            '👩🏼‍⚕️',
            '👩🏻‍⚕️',
        ],
    },
    {
        name: 'student',
        code: '🧑‍🎓',
        keywords: [
            'student',
        ],
        types: [
            '🧑🏿‍🎓',
            '🧑🏾‍🎓',
            '🧑🏽‍🎓',
            '🧑🏼‍🎓',
            '🧑🏻‍🎓',
        ],
    },
    {
        name: 'man_student',
        code: '👨‍🎓',
        keywords: [
            'graduation',
            'man_student',
        ],
        types: [
            '👨🏿‍🎓',
            '👨🏾‍🎓',
            '👨🏽‍🎓',
            '👨🏼‍🎓',
            '👨🏻‍🎓',
        ],
    },
    {
        name: 'woman_student',
        code: '👩‍🎓',
        keywords: [
            'graduation',
            'woman_student',
        ],
        types: [
            '👩🏿‍🎓',
            '👩🏾‍🎓',
            '👩🏽‍🎓',
            '👩🏼‍🎓',
            '👩🏻‍🎓',
        ],
    },
    {
        name: 'teacher',
        code: '🧑‍🏫',
        keywords: [
            'teacher',
        ],
        types: [
            '🧑🏿‍🏫',
            '🧑🏾‍🏫',
            '🧑🏽‍🏫',
            '🧑🏼‍🏫',
            '🧑🏻‍🏫',
        ],
    },
    {
        name: 'man_teacher',
        code: '👨‍🏫',
        keywords: [
            'school',
            'professor',
            'man_teacher',
        ],
        types: [
            '👨🏿‍🏫',
            '👨🏾‍🏫',
            '👨🏽‍🏫',
            '👨🏼‍🏫',
            '👨🏻‍🏫',
        ],
    },
    {
        name: 'woman_teacher',
        code: '👩‍🏫',
        keywords: [
            'school',
            'professor',
            'woman_teacher',
        ],
        types: [
            '👩🏿‍🏫',
            '👩🏾‍🏫',
            '👩🏽‍🏫',
            '👩🏼‍🏫',
            '👩🏻‍🏫',
        ],
    },
    {
        name: 'judge',
        code: '🧑‍⚖️',
        keywords: [
            'judge',
        ],
        types: [
            '🧑🏿‍⚖️',
            '🧑🏾‍⚖️',
            '🧑🏽‍⚖️',
            '🧑🏼‍⚖️',
            '🧑🏻‍⚖️',
        ],
    },
    {
        name: 'man_judge',
        code: '👨‍⚖️',
        keywords: [
            'justice',
            'man_judge',
        ],
        types: [
            '👨🏿‍⚖️',
            '👨🏾‍⚖️',
            '👨🏽‍⚖️',
            '👨🏼‍⚖️',
            '👨🏻‍⚖️',
        ],
    },
    {
        name: 'woman_judge',
        code: '👩‍⚖️',
        keywords: [
            'justice',
            'woman_judge',
        ],
        types: [
            '👩🏿‍⚖️',
            '👩🏾‍⚖️',
            '👩🏽‍⚖️',
            '👩🏼‍⚖️',
            '👩🏻‍⚖️',
        ],
    },
    {
        name: 'farmer',
        code: '🧑‍🌾',
        keywords: [
            'farmer',
        ],
        types: [
            '🧑🏿‍🌾',
            '🧑🏾‍🌾',
            '🧑🏽‍🌾',
            '🧑🏼‍🌾',
            '🧑🏻‍🌾',
        ],
    },
    {
        name: 'man_farmer',
        code: '👨‍🌾',
        keywords: [
            'man_farmer',
        ],
        types: [
            '👨🏿‍🌾',
            '👨🏾‍🌾',
            '👨🏽‍🌾',
            '👨🏼‍🌾',
            '👨🏻‍🌾',
        ],
    },
    {
        name: 'woman_farmer',
        code: '👩‍🌾',
        keywords: [
            'woman_farmer',
        ],
        types: [
            '👩🏿‍🌾',
            '👩🏾‍🌾',
            '👩🏽‍🌾',
            '👩🏼‍🌾',
            '👩🏻‍🌾',
        ],
    },
    {
        name: 'cook',
        code: '🧑‍🍳',
        keywords: [
            'cook',
        ],
        types: [
            '🧑🏿‍🍳',
            '🧑🏾‍🍳',
            '🧑🏽‍🍳',
            '🧑🏼‍🍳',
            '🧑🏻‍🍳',
        ],
    },
    {
        name: 'man_cook',
        code: '👨‍🍳',
        keywords: [
            'chef',
            'man_cook',
        ],
        types: [
            '👨🏿‍🍳',
            '👨🏾‍🍳',
            '👨🏽‍🍳',
            '👨🏼‍🍳',
            '👨🏻‍🍳',
        ],
    },
    {
        name: 'woman_cook',
        code: '👩‍🍳',
        keywords: [
            'chef',
            'woman_cook',
        ],
        types: [
            '👩🏿‍🍳',
            '👩🏾‍🍳',
            '👩🏽‍🍳',
            '👩🏼‍🍳',
            '👩🏻‍🍳',
        ],
    },
    {
        name: 'mechanic',
        code: '🧑‍🔧',
        keywords: [
            'mechanic',
        ],
        types: [
            '🧑🏿‍🔧',
            '🧑🏾‍🔧',
            '🧑🏽‍🔧',
            '🧑🏼‍🔧',
            '🧑🏻‍🔧',
        ],
    },
    {
        name: 'man_mechanic',
        code: '👨‍🔧',
        keywords: [
            'man_mechanic',
        ],
        types: [
            '👨🏿‍🔧',
            '👨🏾‍🔧',
            '👨🏽‍🔧',
            '👨🏼‍🔧',
            '👨🏻‍🔧',
        ],
    },
    {
        name: 'woman_mechanic',
        code: '👩‍🔧',
        keywords: [
            'woman_mechanic',
        ],
        types: [
            '👩🏿‍🔧',
            '👩🏾‍🔧',
            '👩🏽‍🔧',
            '👩🏼‍🔧',
            '👩🏻‍🔧',
        ],
    },
    {
        name: 'factory_worker',
        code: '🧑‍🏭',
        keywords: [
            'factory_worker',
        ],
        types: [
            '🧑🏿‍🏭',
            '🧑🏾‍🏭',
            '🧑🏽‍🏭',
            '🧑🏼‍🏭',
            '🧑🏻‍🏭',
        ],
    },
    {
        name: 'man_factory_worker',
        code: '👨‍🏭',
        keywords: [
            'man_factory_worker',
        ],
        types: [
            '👨🏿‍🏭',
            '👨🏾‍🏭',
            '👨🏽‍🏭',
            '👨🏼‍🏭',
            '👨🏻‍🏭',
        ],
    },
    {
        name: 'woman_factory_worker',
        code: '👩‍🏭',
        keywords: [
            'woman_factory_worker',
        ],
        types: [
            '👩🏿‍🏭',
            '👩🏾‍🏭',
            '👩🏽‍🏭',
            '👩🏼‍🏭',
            '👩🏻‍🏭',
        ],
    },
    {
        name: 'office_worker',
        code: '🧑‍💼',
        keywords: [
            'office_worker',
        ],
        types: [
            '🧑🏿‍💼',
            '🧑🏾‍💼',
            '🧑🏽‍💼',
            '🧑🏼‍💼',
            '🧑🏻‍💼',
        ],
    },
    {
        name: 'man_office_worker',
        code: '👨‍💼',
        keywords: [
            'business',
            'man_office_worker',
        ],
        types: [
            '👨🏿‍💼',
            '👨🏾‍💼',
            '👨🏽‍💼',
            '👨🏼‍💼',
            '👨🏻‍💼',
        ],
    },
    {
        name: 'woman_office_worker',
        code: '👩‍💼',
        keywords: [
            'business',
            'woman_office_worker',
        ],
        types: [
            '👩🏿‍💼',
            '👩🏾‍💼',
            '👩🏽‍💼',
            '👩🏼‍💼',
            '👩🏻‍💼',
        ],
    },
    {
        name: 'scientist',
        code: '🧑‍🔬',
        keywords: [
            'scientist',
        ],
        types: [
            '🧑🏿‍🔬',
            '🧑🏾‍🔬',
            '🧑🏽‍🔬',
            '🧑🏼‍🔬',
            '🧑🏻‍🔬',
        ],
    },
    {
        name: 'man_scientist',
        code: '👨‍🔬',
        keywords: [
            'research',
            'man_scientist',
        ],
        types: [
            '👨🏿‍🔬',
            '👨🏾‍🔬',
            '👨🏽‍🔬',
            '👨🏼‍🔬',
            '👨🏻‍🔬',
        ],
    },
    {
        name: 'woman_scientist',
        code: '👩‍🔬',
        keywords: [
            'research',
            'woman_scientist',
        ],
        types: [
            '👩🏿‍🔬',
            '👩🏾‍🔬',
            '👩🏽‍🔬',
            '👩🏼‍🔬',
            '👩🏻‍🔬',
        ],
    },
    {
        name: 'technologist',
        code: '🧑‍💻',
        keywords: [
            'technologist',
        ],
        types: [
            '🧑🏿‍💻',
            '🧑🏾‍💻',
            '🧑🏽‍💻',
            '🧑🏼‍💻',
            '🧑🏻‍💻',
        ],
    },
    {
        name: 'man_technologist',
        code: '👨‍💻',
        keywords: [
            'coder',
            'man_technologist',
        ],
        types: [
            '👨🏿‍💻',
            '👨🏾‍💻',
            '👨🏽‍💻',
            '👨🏼‍💻',
            '👨🏻‍💻',
        ],
    },
    {
        name: 'woman_technologist',
        code: '👩‍💻',
        keywords: [
            'coder',
            'woman_technologist',
        ],
        types: [
            '👩🏿‍💻',
            '👩🏾‍💻',
            '👩🏽‍💻',
            '👩🏼‍💻',
            '👩🏻‍💻',
        ],
    },
    {
        name: 'singer',
        code: '🧑‍🎤',
        keywords: [
            'singer',
        ],
        types: [
            '🧑🏿‍🎤',
            '🧑🏾‍🎤',
            '🧑🏽‍🎤',
            '🧑🏼‍🎤',
            '🧑🏻‍🎤',
        ],
    },
    {
        name: 'man_singer',
        code: '👨‍🎤',
        keywords: [
            'rockstar',
            'man_singer',
        ],
        types: [
            '👨🏿‍🎤',
            '👨🏾‍🎤',
            '👨🏽‍🎤',
            '👨🏼‍🎤',
            '👨🏻‍🎤',
        ],
    },
    {
        name: 'woman_singer',
        code: '👩‍🎤',
        keywords: [
            'rockstar',
            'woman_singer',
        ],
        types: [
            '👩🏿‍🎤',
            '👩🏾‍🎤',
            '👩🏽‍🎤',
            '👩🏼‍🎤',
            '👩🏻‍🎤',
        ],
    },
    {
        name: 'artist',
        code: '🧑‍🎨',
        keywords: [
            'artist',
        ],
        types: [
            '🧑🏿‍🎨',
            '🧑🏾‍🎨',
            '🧑🏽‍🎨',
            '🧑🏼‍🎨',
            '🧑🏻‍🎨',
        ],
    },
    {
        name: 'man_artist',
        code: '👨‍🎨',
        keywords: [
            'painter',
            'man_artist',
        ],
        types: [
            '👨🏿‍🎨',
            '👨🏾‍🎨',
            '👨🏽‍🎨',
            '👨🏼‍🎨',
            '👨🏻‍🎨',
        ],
    },
    {
        name: 'woman_artist',
        code: '👩‍🎨',
        keywords: [
            'painter',
            'woman_artist',
        ],
        types: [
            '👩🏿‍🎨',
            '👩🏾‍🎨',
            '👩🏽‍🎨',
            '👩🏼‍🎨',
            '👩🏻‍🎨',
        ],
    },
    {
        name: 'pilot',
        code: '🧑‍✈️',
        keywords: [
            'pilot',
        ],
        types: [
            '🧑🏿‍✈️',
            '🧑🏾‍✈️',
            '🧑🏽‍✈️',
            '🧑🏼‍✈️',
            '🧑🏻‍✈️',
        ],
    },
    {
        name: 'man_pilot',
        code: '👨‍✈️',
        keywords: [
            'man_pilot',
        ],
        types: [
            '👨🏿‍✈️',
            '👨🏾‍✈️',
            '👨🏽‍✈️',
            '👨🏼‍✈️',
            '👨🏻‍✈️',
        ],
    },
    {
        name: 'woman_pilot',
        code: '👩‍✈️',
        keywords: [
            'woman_pilot',
        ],
        types: [
            '👩🏿‍✈️',
            '👩🏾‍✈️',
            '👩🏽‍✈️',
            '👩🏼‍✈️',
            '👩🏻‍✈️',
        ],
    },
    {
        name: 'astronaut',
        code: '🧑‍🚀',
        keywords: [
            'astronaut',
        ],
        types: [
            '🧑🏿‍🚀',
            '🧑🏾‍🚀',
            '🧑🏽‍🚀',
            '🧑🏼‍🚀',
            '🧑🏻‍🚀',
        ],
    },
    {
        name: 'man_astronaut',
        code: '👨‍🚀',
        keywords: [
            'space',
            'man_astronaut',
        ],
        types: [
            '👨🏿‍🚀',
            '👨🏾‍🚀',
            '👨🏽‍🚀',
            '👨🏼‍🚀',
            '👨🏻‍🚀',
        ],
    },
    {
        name: 'woman_astronaut',
        code: '👩‍🚀',
        keywords: [
            'space',
            'woman_astronaut',
        ],
        types: [
            '👩🏿‍🚀',
            '👩🏾‍🚀',
            '👩🏽‍🚀',
            '👩🏼‍🚀',
            '👩🏻‍🚀',
        ],
    },
    {
        name: 'firefighter',
        code: '🧑‍🚒',
        keywords: [
            'firefighter',
        ],
        types: [
            '🧑🏿‍🚒',
            '🧑🏾‍🚒',
            '🧑🏽‍🚒',
            '🧑🏼‍🚒',
            '🧑🏻‍🚒',
        ],
    },
    {
        name: 'man_firefighter',
        code: '👨‍🚒',
        keywords: [
            'man_firefighter',
        ],
        types: [
            '👨🏿‍🚒',
            '👨🏾‍🚒',
            '👨🏽‍🚒',
            '👨🏼‍🚒',
            '👨🏻‍🚒',
        ],
    },
    {
        name: 'woman_firefighter',
        code: '👩‍🚒',
        keywords: [
            'woman_firefighter',
        ],
        types: [
            '👩🏿‍🚒',
            '👩🏾‍🚒',
            '👩🏽‍🚒',
            '👩🏼‍🚒',
            '👩🏻‍🚒',
        ],
    },
    {
        name: 'police_officer',
        code: '👮',
        keywords: [
            'law',
            'police_officer',
            'cop',
            'officer',
            'police',
        ],
        types: [
            '👮🏿',
            '👮🏾',
            '👮🏽',
            '👮🏼',
            '👮🏻',
        ],
    },
    {
        name: 'policeman',
        code: '👮‍♂️',
        keywords: [
            'law',
            'cop',
            'policeman',
        ],
        types: [
            '👮🏿‍♂️',
            '👮🏾‍♂️',
            '👮🏽‍♂️',
            '👮🏼‍♂️',
            '👮🏻‍♂️',
        ],
    },
    {
        name: 'policewoman',
        code: '👮‍♀️',
        keywords: [
            'law',
            'cop',
            'policewoman',
        ],
        types: [
            '👮🏿‍♀️',
            '👮🏾‍♀️',
            '👮🏽‍♀️',
            '👮🏼‍♀️',
            '👮🏻‍♀️',
        ],
    },
    {
        name: 'detective',
        code: '🕵️',
        keywords: [
            'sleuth',
            'detective',
        ],
        types: [
            '🕵🏿',
            '🕵🏾',
            '🕵🏽',
            '🕵🏼',
            '🕵🏻',
        ],
    },
    {
        name: 'male_detective',
        code: '🕵️‍♂️',
        keywords: [
            'sleuth',
            'male_detective',
        ],
        types: [
            '🕵🏿‍♂️',
            '🕵🏾‍♂️',
            '🕵🏽‍♂️',
            '🕵🏼‍♂️',
            '🕵🏻‍♂️',
        ],
    },
    {
        name: 'female_detective',
        code: '🕵️‍♀️',
        keywords: [
            'sleuth',
            'female_detective',
        ],
        types: [
            '🕵🏿‍♀️',
            '🕵🏾‍♀️',
            '🕵🏽‍♀️',
            '🕵🏼‍♀️',
            '🕵🏻‍♀️',
        ],
    },
    {
        name: 'guard',
        code: '💂',
        keywords: [
            'guard',
            'guardsman',
        ],
        types: [
            '💂🏿',
            '💂🏾',
            '💂🏽',
            '💂🏼',
            '💂🏻',
        ],
    },
    {
        name: 'guardsman',
        code: '💂‍♂️',
        keywords: [
            'guardsman',
        ],
        types: [
            '💂🏿‍♂️',
            '💂🏾‍♂️',
            '💂🏽‍♂️',
            '💂🏼‍♂️',
            '💂🏻‍♂️',
        ],
    },
    {
        name: 'guardswoman',
        code: '💂‍♀️',
        keywords: [
            'guardswoman',
        ],
        types: [
            '💂🏿‍♀️',
            '💂🏾‍♀️',
            '💂🏽‍♀️',
            '💂🏼‍♀️',
            '💂🏻‍♀️',
        ],
    },
    {
        name: 'ninja',
        code: '🥷',
        keywords: [
            'ninja',
        ],
        types: [
            '🥷🏿',
            '🥷🏾',
            '🥷🏽',
            '🥷🏼',
            '🥷🏻',
        ],
    },
    {
        name: 'construction_worker',
        code: '👷',
        keywords: [
            'helmet',
            'construction_worker',
            'construction',
            'hat',
            'worker',
        ],
        types: [
            '👷🏿',
            '👷🏾',
            '👷🏽',
            '👷🏼',
            '👷🏻',
        ],
    },
    {
        name: 'construction_worker_man',
        code: '👷‍♂️',
        keywords: [
            'helmet',
            'construction_worker_man',
        ],
        types: [
            '👷🏿‍♂️',
            '👷🏾‍♂️',
            '👷🏽‍♂️',
            '👷🏼‍♂️',
            '👷🏻‍♂️',
        ],
    },
    {
        name: 'construction_worker_woman',
        code: '👷‍♀️',
        keywords: [
            'helmet',
            'construction_worker_woman',
        ],
        types: [
            '👷🏿‍♀️',
            '👷🏾‍♀️',
            '👷🏽‍♀️',
            '👷🏼‍♀️',
            '👷🏻‍♀️',
        ],
    },
    {
        name: 'prince',
        code: '🤴',
        keywords: [
            'crown',
            'royal',
            'prince',
        ],
        types: [
            '🤴🏿',
            '🤴🏾',
            '🤴🏽',
            '🤴🏼',
            '🤴🏻',
        ],
    },
    {
        name: 'princess',
        code: '👸',
        keywords: [
            'crown',
            'royal',
            'princess',
            'fairy tale',
            'fantasy',
        ],
        types: [
            '👸🏿',
            '👸🏾',
            '👸🏽',
            '👸🏼',
            '👸🏻',
        ],
    },
    {
        name: 'person_with_turban',
        code: '👳',
        keywords: [
            'person_with_turban',
            'man',
            'turban',
        ],
        types: [
            '👳🏿',
            '👳🏾',
            '👳🏽',
            '👳🏼',
            '👳🏻',
        ],
    },
    {
        name: 'man_with_turban',
        code: '👳‍♂️',
        keywords: [
            'man_with_turban',
        ],
        types: [
            '👳🏿‍♂️',
            '👳🏾‍♂️',
            '👳🏽‍♂️',
            '👳🏼‍♂️',
            '👳🏻‍♂️',
        ],
    },
    {
        name: 'woman_with_turban',
        code: '👳‍♀️',
        keywords: [
            'woman_with_turban',
        ],
        types: [
            '👳🏿‍♀️',
            '👳🏾‍♀️',
            '👳🏽‍♀️',
            '👳🏼‍♀️',
            '👳🏻‍♀️',
        ],
    },
    {
        name: 'man_with_gua_pi_mao',
        code: '👲',
        keywords: [
            'man_with_gua_pi_mao',
            'gua pi mao',
            'hat',
            'man',
        ],
        types: [
            '👲🏿',
            '👲🏾',
            '👲🏽',
            '👲🏼',
            '👲🏻',
        ],
    },
    {
        name: 'woman_with_headscarf',
        code: '🧕',
        keywords: [
            'hijab',
            'woman_with_headscarf',
        ],
        types: [
            '🧕🏿',
            '🧕🏾',
            '🧕🏽',
            '🧕🏼',
            '🧕🏻',
        ],
    },
    {
        name: 'person_in_tuxedo',
        code: '🤵',
        keywords: [
            'groom',
            'marriage',
            'wedding',
            'person_in_tuxedo',
            'man',
            'tuxedo',
        ],
        types: [
            '🤵🏿',
            '🤵🏾',
            '🤵🏽',
            '🤵🏼',
            '🤵🏻',
        ],
    },
    {
        name: 'man_in_tuxedo',
        code: '🤵‍♂️',
        keywords: [
            'man_in_tuxedo',
        ],
        types: [
            '🤵🏿‍♂️',
            '🤵🏾‍♂️',
            '🤵🏽‍♂️',
            '🤵🏼‍♂️',
            '🤵🏻‍♂️',
        ],
    },
    {
        name: 'woman_in_tuxedo',
        code: '🤵‍♀️',
        keywords: [
            'woman_in_tuxedo',
        ],
        types: [
            '🤵🏿‍♀️',
            '🤵🏾‍♀️',
            '🤵🏽‍♀️',
            '🤵🏼‍♀️',
            '🤵🏻‍♀️',
        ],
    },
    {
        name: 'person_with_veil',
        code: '👰',
        keywords: [
            'marriage',
            'wedding',
            'person_with_veil',
            'bride',
            'veil',
        ],
        types: [
            '👰🏿',
            '👰🏾',
            '👰🏽',
            '👰🏼',
            '👰🏻',
        ],
    },
    {
        name: 'man_with_veil',
        code: '👰‍♂️',
        keywords: [
            'man_with_veil',
        ],
        types: [
            '👰🏿‍♂️',
            '👰🏾‍♂️',
            '👰🏽‍♂️',
            '👰🏼‍♂️',
            '👰🏻‍♂️',
        ],
    },
    {
        name: 'woman_with_veil',
        code: '👰‍♀️',
        keywords: [
            'woman_with_veil',
            'bride_with_veil',
        ],
        types: [
            '👰🏿‍♀️',
            '👰🏾‍♀️',
            '👰🏽‍♀️',
            '👰🏼‍♀️',
            '👰🏻‍♀️',
        ],
    },
    {
        name: 'pregnant_woman',
        code: '🤰',
        keywords: [
            'pregnant_woman',
            'pregnant',
            'woman',
        ],
        types: [
            '🤰🏿',
            '🤰🏾',
            '🤰🏽',
            '🤰🏼',
            '🤰🏻',
        ],
    },
    {
        name: 'breast_feeding',
        code: '🤱',
        keywords: [
            'nursing',
            'breast_feeding',
        ],
        types: [
            '🤱🏿',
            '🤱🏾',
            '🤱🏽',
            '🤱🏼',
            '🤱🏻',
        ],
    },
    {
        name: 'woman_feeding_baby',
        code: '👩‍🍼',
        keywords: [
            'woman_feeding_baby',
        ],
        types: [
            '👩🏿‍🍼',
            '👩🏾‍🍼',
            '👩🏽‍🍼',
            '👩🏼‍🍼',
            '👩🏻‍🍼',
        ],
    },
    {
        name: 'man_feeding_baby',
        code: '👨‍🍼',
        keywords: [
            'man_feeding_baby',
        ],
        types: [
            '👨🏿‍🍼',
            '👨🏾‍🍼',
            '👨🏽‍🍼',
            '👨🏼‍🍼',
            '👨🏻‍🍼',
        ],
    },
    {
        name: 'person_feeding_baby',
        code: '🧑‍🍼',
        keywords: [
            'person_feeding_baby',
        ],
        types: [
            '🧑🏿‍🍼',
            '🧑🏾‍🍼',
            '🧑🏽‍🍼',
            '🧑🏼‍🍼',
            '🧑🏻‍🍼',
        ],
    },
    {
        name: 'angel',
        code: '👼',
        keywords: [
            'angel',
            'baby',
            'face',
            'fairy tale',
            'fantasy',
        ],
        types: [
            '👼🏿',
            '👼🏾',
            '👼🏽',
            '👼🏼',
            '👼🏻',
        ],
    },
    {
        name: 'santa',
        code: '🎅',
        keywords: [
            'christmas',
            'santa',
            'activity',
            'celebration',
            'fairy tale',
            'fantasy',
            'father',
        ],
        types: [
            '🎅🏿',
            '🎅🏾',
            '🎅🏽',
            '🎅🏼',
            '🎅🏻',
        ],
    },
    {
        name: 'mrs_claus',
        code: '🤶',
        keywords: [
            'santa',
            'mrs_claus',
            'christmas',
            'mother',
            'mrs. claus',
        ],
        types: [
            '🤶🏿',
            '🤶🏾',
            '🤶🏽',
            '🤶🏼',
            '🤶🏻',
        ],
    },
    {
        name: 'mx_claus',
        code: '🧑‍🎄',
        keywords: [
            'mx_claus',
        ],
        types: [
            '🧑🏿‍🎄',
            '🧑🏾‍🎄',
            '🧑🏽‍🎄',
            '🧑🏼‍🎄',
            '🧑🏻‍🎄',
        ],
    },
    {
        name: 'superhero',
        code: '🦸',
        keywords: [
            'superhero',
        ],
        types: [
            '🦸🏿',
            '🦸🏾',
            '🦸🏽',
            '🦸🏼',
            '🦸🏻',
        ],
    },
    {
        name: 'superhero_man',
        code: '🦸‍♂️',
        keywords: [
            'superhero_man',
        ],
        types: [
            '🦸🏿‍♂️',
            '🦸🏾‍♂️',
            '🦸🏽‍♂️',
            '🦸🏼‍♂️',
            '🦸🏻‍♂️',
        ],
    },
    {
        name: 'superhero_woman',
        code: '🦸‍♀️',
        keywords: [
            'superhero_woman',
        ],
        types: [
            '🦸🏿‍♀️',
            '🦸🏾‍♀️',
            '🦸🏽‍♀️',
            '🦸🏼‍♀️',
            '🦸🏻‍♀️',
        ],
    },
    {
        name: 'supervillain',
        code: '🦹',
        keywords: [
            'supervillain',
        ],
        types: [
            '🦹🏿',
            '🦹🏾',
            '🦹🏽',
            '🦹🏼',
            '🦹🏻',
        ],
    },
    {
        name: 'supervillain_man',
        code: '🦹‍♂️',
        keywords: [
            'supervillain_man',
        ],
        types: [
            '🦹🏿‍♂️',
            '🦹🏾‍♂️',
            '🦹🏽‍♂️',
            '🦹🏼‍♂️',
            '🦹🏻‍♂️',
        ],
    },
    {
        name: 'supervillain_woman',
        code: '🦹‍♀️',
        keywords: [
            'supervillain_woman',
        ],
        types: [
            '🦹🏿‍♀️',
            '🦹🏾‍♀️',
            '🦹🏽‍♀️',
            '🦹🏼‍♀️',
            '🦹🏻‍♀️',
        ],
    },
    {
        name: 'mage',
        code: '🧙',
        keywords: [
            'wizard',
            'mage',
        ],
        types: [
            '🧙🏿',
            '🧙🏾',
            '🧙🏽',
            '🧙🏼',
            '🧙🏻',
        ],
    },
    {
        name: 'mage_man',
        code: '🧙‍♂️',
        keywords: [
            'wizard',
            'mage_man',
        ],
        types: [
            '🧙🏿‍♂️',
            '🧙🏾‍♂️',
            '🧙🏽‍♂️',
            '🧙🏼‍♂️',
            '🧙🏻‍♂️',
        ],
    },
    {
        name: 'mage_woman',
        code: '🧙‍♀️',
        keywords: [
            'wizard',
            'mage_woman',
        ],
        types: [
            '🧙🏿‍♀️',
            '🧙🏾‍♀️',
            '🧙🏽‍♀️',
            '🧙🏼‍♀️',
            '🧙🏻‍♀️',
        ],
    },
    {
        name: 'fairy',
        code: '🧚',
        keywords: [
            'fairy',
        ],
        types: [
            '🧚🏿',
            '🧚🏾',
            '🧚🏽',
            '🧚🏼',
            '🧚🏻',
        ],
    },
    {
        name: 'fairy_man',
        code: '🧚‍♂️',
        keywords: [
            'fairy_man',
        ],
        types: [
            '🧚🏿‍♂️',
            '🧚🏾‍♂️',
            '🧚🏽‍♂️',
            '🧚🏼‍♂️',
            '🧚🏻‍♂️',
        ],
    },
    {
        name: 'fairy_woman',
        code: '🧚‍♀️',
        keywords: [
            'fairy_woman',
        ],
        types: [
            '🧚🏿‍♀️',
            '🧚🏾‍♀️',
            '🧚🏽‍♀️',
            '🧚🏼‍♀️',
            '🧚🏻‍♀️',
        ],
    },
    {
        name: 'vampire',
        code: '🧛',
        keywords: [
            'vampire',
        ],
        types: [
            '🧛🏿',
            '🧛🏾',
            '🧛🏽',
            '🧛🏼',
            '🧛🏻',
        ],
    },
    {
        name: 'vampire_man',
        code: '🧛‍♂️',
        keywords: [
            'vampire_man',
        ],
        types: [
            '🧛🏿‍♂️',
            '🧛🏾‍♂️',
            '🧛🏽‍♂️',
            '🧛🏼‍♂️',
            '🧛🏻‍♂️',
        ],
    },
    {
        name: 'vampire_woman',
        code: '🧛‍♀️',
        keywords: [
            'vampire_woman',
        ],
        types: [
            '🧛🏿‍♀️',
            '🧛🏾‍♀️',
            '🧛🏽‍♀️',
            '🧛🏼‍♀️',
            '🧛🏻‍♀️',
        ],
    },
    {
        name: 'merperson',
        code: '🧜',
        keywords: [
            'merperson',
        ],
        types: [
            '🧜🏿',
            '🧜🏾',
            '🧜🏽',
            '🧜🏼',
            '🧜🏻',
        ],
    },
    {
        name: 'merman',
        code: '🧜‍♂️',
        keywords: [
            'merman',
        ],
        types: [
            '🧜🏿‍♂️',
            '🧜🏾‍♂️',
            '🧜🏽‍♂️',
            '🧜🏼‍♂️',
            '🧜🏻‍♂️',
        ],
    },
    {
        name: 'mermaid',
        code: '🧜‍♀️',
        keywords: [
            'mermaid',
        ],
        types: [
            '🧜🏿‍♀️',
            '🧜🏾‍♀️',
            '🧜🏽‍♀️',
            '🧜🏼‍♀️',
            '🧜🏻‍♀️',
        ],
    },
    {
        name: 'elf',
        code: '🧝',
        keywords: [
            'elf',
        ],
        types: [
            '🧝🏿',
            '🧝🏾',
            '🧝🏽',
            '🧝🏼',
            '🧝🏻',
        ],
    },
    {
        name: 'elf_man',
        code: '🧝‍♂️',
        keywords: [
            'elf_man',
        ],
        types: [
            '🧝🏿‍♂️',
            '🧝🏾‍♂️',
            '🧝🏽‍♂️',
            '🧝🏼‍♂️',
            '🧝🏻‍♂️',
        ],
    },
    {
        name: 'elf_woman',
        code: '🧝‍♀️',
        keywords: [
            'elf_woman',
        ],
        types: [
            '🧝🏿‍♀️',
            '🧝🏾‍♀️',
            '🧝🏽‍♀️',
            '🧝🏼‍♀️',
            '🧝🏻‍♀️',
        ],
    },
    {
        name: 'genie',
        code: '🧞',
        keywords: [
            'genie',
        ],
    },
    {
        name: 'genie_man',
        code: '🧞‍♂️',
        keywords: [
            'genie_man',
        ],
    },
    {
        name: 'genie_woman',
        code: '🧞‍♀️',
        keywords: [
            'genie_woman',
        ],
    },
    {
        name: 'zombie',
        code: '🧟',
        keywords: [
            'zombie',
        ],
    },
    {
        name: 'zombie_man',
        code: '🧟‍♂️',
        keywords: [
            'zombie_man',
        ],
    },
    {
        name: 'zombie_woman',
        code: '🧟‍♀️',
        keywords: [
            'zombie_woman',
        ],
    },
    {
        name: 'massage',
        code: '💆',
        keywords: [
            'spa',
            'massage',
            'salon',
        ],
        types: [
            '💆🏿',
            '💆🏾',
            '💆🏽',
            '💆🏼',
            '💆🏻',
        ],
    },
    {
        name: 'massage_man',
        code: '💆‍♂️',
        keywords: [
            'spa',
            'massage_man',
        ],
        types: [
            '💆🏿‍♂️',
            '💆🏾‍♂️',
            '💆🏽‍♂️',
            '💆🏼‍♂️',
            '💆🏻‍♂️',
        ],
    },
    {
        name: 'massage_woman',
        code: '💆‍♀️',
        keywords: [
            'spa',
            'massage_woman',
        ],
        types: [
            '💆🏿‍♀️',
            '💆🏾‍♀️',
            '💆🏽‍♀️',
            '💆🏼‍♀️',
            '💆🏻‍♀️',
        ],
    },
    {
        name: 'haircut',
        code: '💇',
        keywords: [
            'beauty',
            'haircut',
            'barber',
            'parlor',
        ],
        types: [
            '💇🏿',
            '💇🏾',
            '💇🏽',
            '💇🏼',
            '💇🏻',
        ],
    },
    {
        name: 'haircut_man',
        code: '💇‍♂️',
        keywords: [
            'haircut_man',
        ],
        types: [
            '💇🏿‍♂️',
            '💇🏾‍♂️',
            '💇🏽‍♂️',
            '💇🏼‍♂️',
            '💇🏻‍♂️',
        ],
    },
    {
        name: 'haircut_woman',
        code: '💇‍♀️',
        keywords: [
            'haircut_woman',
        ],
        types: [
            '💇🏿‍♀️',
            '💇🏾‍♀️',
            '💇🏽‍♀️',
            '💇🏼‍♀️',
            '💇🏻‍♀️',
        ],
    },
    {
        name: 'walking',
        code: '🚶',
        keywords: [
            'walking',
            'hike',
            'pedestrian',
            'walk',
        ],
        types: [
            '🚶🏿',
            '🚶🏾',
            '🚶🏽',
            '🚶🏼',
            '🚶🏻',
        ],
    },
    {
        name: 'walking_man',
        code: '🚶‍♂️',
        keywords: [
            'walking_man',
        ],
        types: [
            '🚶🏿‍♂️',
            '🚶🏾‍♂️',
            '🚶🏽‍♂️',
            '🚶🏼‍♂️',
            '🚶🏻‍♂️',
        ],
    },
    {
        name: 'walking_woman',
        code: '🚶‍♀️',
        keywords: [
            'walking_woman',
        ],
        types: [
            '🚶🏿‍♀️',
            '🚶🏾‍♀️',
            '🚶🏽‍♀️',
            '🚶🏼‍♀️',
            '🚶🏻‍♀️',
        ],
    },
    {
        name: 'standing_person',
        code: '🧍',
        keywords: [
            'standing_person',
        ],
        types: [
            '🧍🏿',
            '🧍🏾',
            '🧍🏽',
            '🧍🏼',
            '🧍🏻',
        ],
    },
    {
        name: 'standing_man',
        code: '🧍‍♂️',
        keywords: [
            'standing_man',
        ],
        types: [
            '🧍🏿‍♂️',
            '🧍🏾‍♂️',
            '🧍🏽‍♂️',
            '🧍🏼‍♂️',
            '🧍🏻‍♂️',
        ],
    },
    {
        name: 'standing_woman',
        code: '🧍‍♀️',
        keywords: [
            'standing_woman',
        ],
        types: [
            '🧍🏿‍♀️',
            '🧍🏾‍♀️',
            '🧍🏽‍♀️',
            '🧍🏼‍♀️',
            '🧍🏻‍♀️',
        ],
    },
    {
        name: 'kneeling_person',
        code: '🧎',
        keywords: [
            'kneeling_person',
        ],
        types: [
            '🧎🏿',
            '🧎🏾',
            '🧎🏽',
            '🧎🏼',
            '🧎🏻',
        ],
    },
    {
        name: 'kneeling_man',
        code: '🧎‍♂️',
        keywords: [
            'kneeling_man',
        ],
        types: [
            '🧎🏿‍♂️',
            '🧎🏾‍♂️',
            '🧎🏽‍♂️',
            '🧎🏼‍♂️',
            '🧎🏻‍♂️',
        ],
    },
    {
        name: 'kneeling_woman',
        code: '🧎‍♀️',
        keywords: [
            'kneeling_woman',
        ],
        types: [
            '🧎🏿‍♀️',
            '🧎🏾‍♀️',
            '🧎🏽‍♀️',
            '🧎🏼‍♀️',
            '🧎🏻‍♀️',
        ],
    },
    {
        name: 'person_with_probing_cane',
        code: '🧑‍🦯',
        keywords: [
            'person_with_probing_cane',
        ],
        types: [
            '🧑🏿‍🦯',
            '🧑🏾‍🦯',
            '🧑🏽‍🦯',
            '🧑🏼‍🦯',
            '🧑🏻‍🦯',
        ],
    },
    {
        name: 'man_with_probing_cane',
        code: '👨‍🦯',
        keywords: [
            'man_with_probing_cane',
        ],
        types: [
            '👨🏿‍🦯',
            '👨🏾‍🦯',
            '👨🏽‍🦯',
            '👨🏼‍🦯',
            '👨🏻‍🦯',
        ],
    },
    {
        name: 'woman_with_probing_cane',
        code: '👩‍🦯',
        keywords: [
            'woman_with_probing_cane',
        ],
        types: [
            '👩🏿‍🦯',
            '👩🏾‍🦯',
            '👩🏽‍🦯',
            '👩🏼‍🦯',
            '👩🏻‍🦯',
        ],
    },
    {
        name: 'person_in_motorized_wheelchair',
        code: '🧑‍🦼',
        keywords: [
            'person_in_motorized_wheelchair',
        ],
        types: [
            '🧑🏿‍🦼',
            '🧑🏾‍🦼',
            '🧑🏽‍🦼',
            '🧑🏼‍🦼',
            '🧑🏻‍🦼',
        ],
    },
    {
        name: 'man_in_motorized_wheelchair',
        code: '👨‍🦼',
        keywords: [
            'man_in_motorized_wheelchair',
        ],
        types: [
            '👨🏿‍🦼',
            '👨🏾‍🦼',
            '👨🏽‍🦼',
            '👨🏼‍🦼',
            '👨🏻‍🦼',
        ],
    },
    {
        name: 'woman_in_motorized_wheelchair',
        code: '👩‍🦼',
        keywords: [
            'woman_in_motorized_wheelchair',
        ],
        types: [
            '👩🏿‍🦼',
            '👩🏾‍🦼',
            '👩🏽‍🦼',
            '👩🏼‍🦼',
            '👩🏻‍🦼',
        ],
    },
    {
        name: 'person_in_manual_wheelchair',
        code: '🧑‍🦽',
        keywords: [
            'person_in_manual_wheelchair',
        ],
        types: [
            '🧑🏿‍🦽',
            '🧑🏾‍🦽',
            '🧑🏽‍🦽',
            '🧑🏼‍🦽',
            '🧑🏻‍🦽',
        ],
    },
    {
        name: 'man_in_manual_wheelchair',
        code: '👨‍🦽',
        keywords: [
            'man_in_manual_wheelchair',
        ],
        types: [
            '👨🏿‍🦽',
            '👨🏾‍🦽',
            '👨🏽‍🦽',
            '👨🏼‍🦽',
            '👨🏻‍🦽',
        ],
    },
    {
        name: 'woman_in_manual_wheelchair',
        code: '👩‍🦽',
        keywords: [
            'woman_in_manual_wheelchair',
        ],
        types: [
            '👩🏿‍🦽',
            '👩🏾‍🦽',
            '👩🏽‍🦽',
            '👩🏼‍🦽',
            '👩🏻‍🦽',
        ],
    },
    {
        name: 'runner',
        code: '🏃',
        keywords: [
            'exercise',
            'workout',
            'marathon',
            'runner',
            'running',
        ],
        types: [
            '🏃🏿',
            '🏃🏾',
            '🏃🏽',
            '🏃🏼',
            '🏃🏻',
        ],
    },
    {
        name: 'running_man',
        code: '🏃‍♂️',
        keywords: [
            'exercise',
            'workout',
            'marathon',
            'running_man',
        ],
        types: [
            '🏃🏿‍♂️',
            '🏃🏾‍♂️',
            '🏃🏽‍♂️',
            '🏃🏼‍♂️',
            '🏃🏻‍♂️',
        ],
    },
    {
        name: 'running_woman',
        code: '🏃‍♀️',
        keywords: [
            'exercise',
            'workout',
            'marathon',
            'running_woman',
        ],
        types: [
            '🏃🏿‍♀️',
            '🏃🏾‍♀️',
            '🏃🏽‍♀️',
            '🏃🏼‍♀️',
            '🏃🏻‍♀️',
        ],
    },
    {
        name: 'woman_dancing',
        code: '💃',
        keywords: [
            'dress',
            'woman_dancing',
            'dancer',
        ],
        types: [
            '💃🏿',
            '💃🏾',
            '💃🏽',
            '💃🏼',
            '💃🏻',
        ],
    },
    {
        name: 'man_dancing',
        code: '🕺',
        keywords: [
            'dancer',
            'man_dancing',
            'dance',
            'man',
        ],
        types: [
            '🕺🏿',
            '🕺🏾',
            '🕺🏽',
            '🕺🏼',
            '🕺🏻',
        ],
    },
    {
        name: 'business_suit_levitating',
        code: '🕴️',
        keywords: [
            'business_suit_levitating',
        ],
        types: [
            '🕴🏿',
            '🕴🏾',
            '🕴🏽',
            '🕴🏼',
            '🕴🏻',
        ],
    },
    {
        name: 'dancers',
        code: '👯',
        keywords: [
            'bunny',
            'dancers',
            'dancer',
            'ear',
            'girl',
            'woman',
        ],
    },
    {
        name: 'dancing_men',
        code: '👯‍♂️',
        keywords: [
            'bunny',
            'dancing_men',
        ],
    },
    {
        name: 'dancing_women',
        code: '👯‍♀️',
        keywords: [
            'bunny',
            'dancing_women',
        ],
    },
    {
        name: 'sauna_person',
        code: '🧖',
        keywords: [
            'steamy',
            'sauna_person',
        ],
        types: [
            '🧖🏿',
            '🧖🏾',
            '🧖🏽',
            '🧖🏼',
            '🧖🏻',
        ],
    },
    {
        name: 'sauna_man',
        code: '🧖‍♂️',
        keywords: [
            'steamy',
            'sauna_man',
        ],
        types: [
            '🧖🏿‍♂️',
            '🧖🏾‍♂️',
            '🧖🏽‍♂️',
            '🧖🏼‍♂️',
            '🧖🏻‍♂️',
        ],
    },
    {
        name: 'sauna_woman',
        code: '🧖‍♀️',
        keywords: [
            'steamy',
            'sauna_woman',
        ],
        types: [
            '🧖🏿‍♀️',
            '🧖🏾‍♀️',
            '🧖🏽‍♀️',
            '🧖🏼‍♀️',
            '🧖🏻‍♀️',
        ],
    },
    {
        name: 'climbing',
        code: '🧗',
        keywords: [
            'bouldering',
            'climbing',
        ],
        types: [
            '🧗🏿',
            '🧗🏾',
            '🧗🏽',
            '🧗🏼',
            '🧗🏻',
        ],
    },
    {
        name: 'climbing_man',
        code: '🧗‍♂️',
        keywords: [
            'bouldering',
            'climbing_man',
        ],
        types: [
            '🧗🏿‍♂️',
            '🧗🏾‍♂️',
            '🧗🏽‍♂️',
            '🧗🏼‍♂️',
            '🧗🏻‍♂️',
        ],
    },
    {
        name: 'climbing_woman',
        code: '🧗‍♀️',
        keywords: [
            'bouldering',
            'climbing_woman',
        ],
        types: [
            '🧗🏿‍♀️',
            '🧗🏾‍♀️',
            '🧗🏽‍♀️',
            '🧗🏼‍♀️',
            '🧗🏻‍♀️',
        ],
    },
    {
        name: 'person_fencing',
        code: '🤺',
        keywords: [
            'person_fencing',
            'fencer',
            'fencing',
            'sword',
        ],
    },
    {
        name: 'horse_racing',
        code: '🏇',
        keywords: [
            'horse_racing',
            'horse',
            'jockey',
            'racehorse',
            'racing',
        ],
        types: [
            '🏇🏿',
            '🏇🏾',
            '🏇🏽',
            '🏇🏼',
            '🏇🏻',
        ],
    },
    {
        name: 'skier',
        code: '⛷️',
        keywords: [
            'skier',
        ],
    },
    {
        name: 'snowboarder',
        code: '🏂',
        keywords: [
            'snowboarder',
            'ski',
            'snow',
            'snowboard',
        ],
        types: [
            '🏂🏿',
            '🏂🏾',
            '🏂🏽',
            '🏂🏼',
            '🏂🏻',
        ],
    },
    {
        name: 'golfing',
        code: '🏌️',
        keywords: [
            'golfing',
        ],
        types: [
            '🏌🏿',
            '🏌🏾',
            '🏌🏽',
            '🏌🏼',
            '🏌🏻',
        ],
    },
    {
        name: 'golfing_man',
        code: '🏌️‍♂️',
        keywords: [
            'golfing_man',
        ],
        types: [
            '🏌🏿‍♂️',
            '🏌🏾‍♂️',
            '🏌🏽‍♂️',
            '🏌🏼‍♂️',
            '🏌🏻‍♂️',
        ],
    },
    {
        name: 'golfing_woman',
        code: '🏌️‍♀️',
        keywords: [
            'golfing_woman',
        ],
        types: [
            '🏌🏿‍♀️',
            '🏌🏾‍♀️',
            '🏌🏽‍♀️',
            '🏌🏼‍♀️',
            '🏌🏻‍♀️',
        ],
    },
    {
        name: 'surfer',
        code: '🏄',
        keywords: [
            'surfer',
            'surfing',
        ],
        types: [
            '🏄🏿',
            '🏄🏾',
            '🏄🏽',
            '🏄🏼',
            '🏄🏻',
        ],
    },
    {
        name: 'surfing_man',
        code: '🏄‍♂️',
        keywords: [
            'surfing_man',
        ],
        types: [
            '🏄🏿‍♂️',
            '🏄🏾‍♂️',
            '🏄🏽‍♂️',
            '🏄🏼‍♂️',
            '🏄🏻‍♂️',
        ],
    },
    {
        name: 'surfing_woman',
        code: '🏄‍♀️',
        keywords: [
            'surfing_woman',
        ],
        types: [
            '🏄🏿‍♀️',
            '🏄🏾‍♀️',
            '🏄🏽‍♀️',
            '🏄🏼‍♀️',
            '🏄🏻‍♀️',
        ],
    },
    {
        name: 'rowboat',
        code: '🚣',
        keywords: [
            'rowboat',
            'boat',
            'vehicle',
        ],
        types: [
            '🚣🏿',
            '🚣🏾',
            '🚣🏽',
            '🚣🏼',
            '🚣🏻',
        ],
    },
    {
        name: 'rowing_man',
        code: '🚣‍♂️',
        keywords: [
            'rowing_man',
        ],
        types: [
            '🚣🏿‍♂️',
            '🚣🏾‍♂️',
            '🚣🏽‍♂️',
            '🚣🏼‍♂️',
            '🚣🏻‍♂️',
        ],
    },
    {
        name: 'rowing_woman',
        code: '🚣‍♀️',
        keywords: [
            'rowing_woman',
        ],
        types: [
            '🚣🏿‍♀️',
            '🚣🏾‍♀️',
            '🚣🏽‍♀️',
            '🚣🏼‍♀️',
            '🚣🏻‍♀️',
        ],
    },
    {
        name: 'swimmer',
        code: '🏊',
        keywords: [
            'swimmer',
            'swim',
        ],
        types: [
            '🏊🏿',
            '🏊🏾',
            '🏊🏽',
            '🏊🏼',
            '🏊🏻',
        ],
    },
    {
        name: 'swimming_man',
        code: '🏊‍♂️',
        keywords: [
            'swimming_man',
        ],
        types: [
            '🏊🏿‍♂️',
            '🏊🏾‍♂️',
            '🏊🏽‍♂️',
            '🏊🏼‍♂️',
            '🏊🏻‍♂️',
        ],
    },
    {
        name: 'swimming_woman',
        code: '🏊‍♀️',
        keywords: [
            'swimming_woman',
        ],
        types: [
            '🏊🏿‍♀️',
            '🏊🏾‍♀️',
            '🏊🏽‍♀️',
            '🏊🏼‍♀️',
            '🏊🏻‍♀️',
        ],
    },
    {
        name: 'bouncing_ball_person',
        code: '⛹️',
        keywords: [
            'basketball',
            'bouncing_ball_person',
        ],
        types: [
            '⛹🏿',
            '⛹🏾',
            '⛹🏽',
            '⛹🏼',
            '⛹🏻',
        ],
    },
    {
        name: 'bouncing_ball_man',
        code: '⛹️‍♂️',
        keywords: [
            'bouncing_ball_man',
            'basketball_man',
        ],
        types: [
            '⛹🏿‍♂️',
            '⛹🏾‍♂️',
            '⛹🏽‍♂️',
            '⛹🏼‍♂️',
            '⛹🏻‍♂️',
        ],
    },
    {
        name: 'bouncing_ball_woman',
        code: '⛹️‍♀️',
        keywords: [
            'bouncing_ball_woman',
            'basketball_woman',
        ],
        types: [
            '⛹🏿‍♀️',
            '⛹🏾‍♀️',
            '⛹🏽‍♀️',
            '⛹🏼‍♀️',
            '⛹🏻‍♀️',
        ],
    },
    {
        name: 'weight_lifting',
        code: '🏋️',
        keywords: [
            'gym',
            'workout',
            'weight_lifting',
        ],
        types: [
            '🏋🏿',
            '🏋🏾',
            '🏋🏽',
            '🏋🏼',
            '🏋🏻',
        ],
    },
    {
        name: 'weight_lifting_man',
        code: '🏋️‍♂️',
        keywords: [
            'gym',
            'workout',
            'weight_lifting_man',
        ],
        types: [
            '🏋🏿‍♂️',
            '🏋🏾‍♂️',
            '🏋🏽‍♂️',
            '🏋🏼‍♂️',
            '🏋🏻‍♂️',
        ],
    },
    {
        name: 'weight_lifting_woman',
        code: '🏋️‍♀️',
        keywords: [
            'gym',
            'workout',
            'weight_lifting_woman',
        ],
        types: [
            '🏋🏿‍♀️',
            '🏋🏾‍♀️',
            '🏋🏽‍♀️',
            '🏋🏼‍♀️',
            '🏋🏻‍♀️',
        ],
    },
    {
        name: 'bicyclist',
        code: '🚴',
        keywords: [
            'bicyclist',
            'bicycle',
            'bike',
            'cyclist',
        ],
        types: [
            '🚴🏿',
            '🚴🏾',
            '🚴🏽',
            '🚴🏼',
            '🚴🏻',
        ],
    },
    {
        name: 'biking_man',
        code: '🚴‍♂️',
        keywords: [
            'biking_man',
        ],
        types: [
            '🚴🏿‍♂️',
            '🚴🏾‍♂️',
            '🚴🏽‍♂️',
            '🚴🏼‍♂️',
            '🚴🏻‍♂️',
        ],
    },
    {
        name: 'biking_woman',
        code: '🚴‍♀️',
        keywords: [
            'biking_woman',
        ],
        types: [
            '🚴🏿‍♀️',
            '🚴🏾‍♀️',
            '🚴🏽‍♀️',
            '🚴🏼‍♀️',
            '🚴🏻‍♀️',
        ],
    },
    {
        name: 'mountain_bicyclist',
        code: '🚵',
        keywords: [
            'mountain_bicyclist',
            'bicycle',
            'bicyclist',
            'bike',
            'cyclist',
            'mountain',
        ],
        types: [
            '🚵🏿',
            '🚵🏾',
            '🚵🏽',
            '🚵🏼',
            '🚵🏻',
        ],
    },
    {
        name: 'mountain_biking_man',
        code: '🚵‍♂️',
        keywords: [
            'mountain_biking_man',
        ],
        types: [
            '🚵🏿‍♂️',
            '🚵🏾‍♂️',
            '🚵🏽‍♂️',
            '🚵🏼‍♂️',
            '🚵🏻‍♂️',
        ],
    },
    {
        name: 'mountain_biking_woman',
        code: '🚵‍♀️',
        keywords: [
            'mountain_biking_woman',
        ],
        types: [
            '🚵🏿‍♀️',
            '🚵🏾‍♀️',
            '🚵🏽‍♀️',
            '🚵🏼‍♀️',
            '🚵🏻‍♀️',
        ],
    },
    {
        name: 'cartwheeling',
        code: '🤸',
        keywords: [
            'cartwheeling',
            'cartwheel',
            'gymnastics',
        ],
        types: [
            '🤸🏿',
            '🤸🏾',
            '🤸🏽',
            '🤸🏼',
            '🤸🏻',
        ],
    },
    {
        name: 'man_cartwheeling',
        code: '🤸‍♂️',
        keywords: [
            'man_cartwheeling',
        ],
        types: [
            '🤸🏿‍♂️',
            '🤸🏾‍♂️',
            '🤸🏽‍♂️',
            '🤸🏼‍♂️',
            '🤸🏻‍♂️',
        ],
    },
    {
        name: 'woman_cartwheeling',
        code: '🤸‍♀️',
        keywords: [
            'woman_cartwheeling',
        ],
        types: [
            '🤸🏿‍♀️',
            '🤸🏾‍♀️',
            '🤸🏽‍♀️',
            '🤸🏼‍♀️',
            '🤸🏻‍♀️',
        ],
    },
    {
        name: 'wrestling',
        code: '🤼',
        keywords: [
            'wrestling',
            'wrestle',
            'wrestler',
        ],
    },
    {
        name: 'men_wrestling',
        code: '🤼‍♂️',
        keywords: [
            'men_wrestling',
        ],
    },
    {
        name: 'women_wrestling',
        code: '🤼‍♀️',
        keywords: [
            'women_wrestling',
        ],
    },
    {
        name: 'water_polo',
        code: '🤽',
        keywords: [
            'water_polo',
            'polo',
            'water',
        ],
        types: [
            '🤽🏿',
            '🤽🏾',
            '🤽🏽',
            '🤽🏼',
            '🤽🏻',
        ],
    },
    {
        name: 'man_playing_water_polo',
        code: '🤽‍♂️',
        keywords: [
            'man_playing_water_polo',
        ],
        types: [
            '🤽🏿‍♂️',
            '🤽🏾‍♂️',
            '🤽🏽‍♂️',
            '🤽🏼‍♂️',
            '🤽🏻‍♂️',
        ],
    },
    {
        name: 'woman_playing_water_polo',
        code: '🤽‍♀️',
        keywords: [
            'woman_playing_water_polo',
        ],
        types: [
            '🤽🏿‍♀️',
            '🤽🏾‍♀️',
            '🤽🏽‍♀️',
            '🤽🏼‍♀️',
            '🤽🏻‍♀️',
        ],
    },
    {
        name: 'handball_person',
        code: '🤾',
        keywords: [
            'handball_person',
            'ball',
            'handball',
        ],
        types: [
            '🤾🏿',
            '🤾🏾',
            '🤾🏽',
            '🤾🏼',
            '🤾🏻',
        ],
    },
    {
        name: 'man_playing_handball',
        code: '🤾‍♂️',
        keywords: [
            'man_playing_handball',
        ],
        types: [
            '🤾🏿‍♂️',
            '🤾🏾‍♂️',
            '🤾🏽‍♂️',
            '🤾🏼‍♂️',
            '🤾🏻‍♂️',
        ],
    },
    {
        name: 'woman_playing_handball',
        code: '🤾‍♀️',
        keywords: [
            'woman_playing_handball',
        ],
        types: [
            '🤾🏿‍♀️',
            '🤾🏾‍♀️',
            '🤾🏽‍♀️',
            '🤾🏼‍♀️',
            '🤾🏻‍♀️',
        ],
    },
    {
        name: 'juggling_person',
        code: '🤹',
        keywords: [
            'juggling_person',
            'balance',
            'juggle',
            'multitask',
            'skill',
        ],
        types: [
            '🤹🏿',
            '🤹🏾',
            '🤹🏽',
            '🤹🏼',
            '🤹🏻',
        ],
    },
    {
        name: 'man_juggling',
        code: '🤹‍♂️',
        keywords: [
            'man_juggling',
        ],
        types: [
            '🤹🏿‍♂️',
            '🤹🏾‍♂️',
            '🤹🏽‍♂️',
            '🤹🏼‍♂️',
            '🤹🏻‍♂️',
        ],
    },
    {
        name: 'woman_juggling',
        code: '🤹‍♀️',
        keywords: [
            'woman_juggling',
        ],
        types: [
            '🤹🏿‍♀️',
            '🤹🏾‍♀️',
            '🤹🏽‍♀️',
            '🤹🏼‍♀️',
            '🤹🏻‍♀️',
        ],
    },
    {
        name: 'lotus_position',
        code: '🧘',
        keywords: [
            'meditation',
            'lotus_position',
        ],
        types: [
            '🧘🏿',
            '🧘🏾',
            '🧘🏽',
            '🧘🏼',
            '🧘🏻',
        ],
    },
    {
        name: 'lotus_position_man',
        code: '🧘‍♂️',
        keywords: [
            'meditation',
            'lotus_position_man',
        ],
        types: [
            '🧘🏿‍♂️',
            '🧘🏾‍♂️',
            '🧘🏽‍♂️',
            '🧘🏼‍♂️',
            '🧘🏻‍♂️',
        ],
    },
    {
        name: 'lotus_position_woman',
        code: '🧘‍♀️',
        keywords: [
            'meditation',
            'lotus_position_woman',
        ],
        types: [
            '🧘🏿‍♀️',
            '🧘🏾‍♀️',
            '🧘🏽‍♀️',
            '🧘🏼‍♀️',
            '🧘🏻‍♀️',
        ],
    },
    {
        name: 'bath',
        code: '🛀',
        keywords: [
            'shower',
            'bath',
            'bathtub',
        ],
        types: [
            '🛀🏿',
            '🛀🏾',
            '🛀🏽',
            '🛀🏼',
            '🛀🏻',
        ],
    },
    {
        name: 'sleeping_bed',
        code: '🛌',
        keywords: [
            'sleeping_bed',
            'hotel',
            'sleep',
        ],
        types: [
            '🛌🏿',
            '🛌🏾',
            '🛌🏽',
            '🛌🏼',
            '🛌🏻',
        ],
    },
    {
        name: 'people_holding_hands',
        code: '🧑‍🤝‍🧑',
        keywords: [
            'couple',
            'date',
            'people_holding_hands',
        ],
        types: [
            '🧑🏿‍🤝‍🧑🏿',
            '🧑🏿‍🤝‍🧑🏾',
            '🧑🏿‍🤝‍🧑🏽',
            '🧑🏿‍🤝‍🧑🏼',
            '🧑🏿‍🤝‍🧑🏻',
            '🧑🏾‍🤝‍🧑🏿',
            '🧑🏾‍🤝‍🧑🏾',
            '🧑🏾‍🤝‍🧑🏽',
            '🧑🏾‍🤝‍🧑🏼',
            '🧑🏾‍🤝‍🧑🏻',
            '🧑🏽‍🤝‍🧑🏿',
            '🧑🏽‍🤝‍🧑🏾',
            '🧑🏽‍🤝‍🧑🏽',
            '🧑🏽‍🤝‍🧑🏼',
            '🧑🏽‍🤝‍🧑🏻',
            '🧑🏼‍🤝‍🧑🏿',
            '🧑🏼‍🤝‍🧑🏾',
            '🧑🏼‍🤝‍🧑🏽',
            '🧑🏼‍🤝‍🧑🏼',
            '🧑🏼‍🤝‍🧑🏻',
            '🧑🏻‍🤝‍🧑🏿',
            '🧑🏻‍🤝‍🧑🏾',
            '🧑🏻‍🤝‍🧑🏽',
            '🧑🏻‍🤝‍🧑🏼',
            '🧑🏻‍🤝‍🧑🏻',
        ],
    },
    {
        name: 'two_women_holding_hands',
        code: '👭',
        keywords: [
            'couple',
            'date',
            'two_women_holding_hands',
            'hand',
            'hold',
            'woman',
        ],
        types: [
            '👩🏿‍🤝‍👩🏾',
            '👩🏿‍🤝‍👩🏽',
            '👩🏿‍🤝‍👩🏼',
            '👩🏿‍🤝‍👩🏻',
            '👩🏾‍🤝‍👩🏿',
            '👩🏾‍🤝‍👩🏽',
            '👩🏾‍🤝‍👩🏼',
            '👩🏾‍🤝‍👩🏻',
            '👩🏽‍🤝‍👩🏿',
            '👩🏽‍🤝‍👩🏾',
            '👩🏽‍🤝‍👩🏼',
            '👩🏽‍🤝‍👩🏻',
            '👩🏼‍🤝‍👩🏿',
            '👩🏼‍🤝‍👩🏾',
            '👩🏼‍🤝‍👩🏽',
            '👩🏼‍🤝‍👩🏻',
            '👩🏻‍🤝‍👩🏿',
            '👩🏻‍🤝‍👩🏾',
            '👩🏻‍🤝‍👩🏽',
            '👩🏻‍🤝‍👩🏼',
            '👭🏿',
            '👭🏾',
            '👭🏽',
            '👭🏼',
            '👭🏻',
        ],
    },
    {
        name: 'couple',
        code: '👫',
        keywords: [
            'date',
            'couple',
            'hand',
            'hold',
            'man',
            'woman',
        ],
        types: [
            '👩🏿‍🤝‍👨🏾',
            '👩🏿‍🤝‍👨🏽',
            '👩🏿‍🤝‍👨🏼',
            '👩🏿‍🤝‍👨🏻',
            '👩🏾‍🤝‍👨🏿',
            '👩🏾‍🤝‍👨🏽',
            '👩🏾‍🤝‍👨🏼',
            '👩🏾‍🤝‍👨🏻',
            '👩🏽‍🤝‍👨🏿',
            '👩🏽‍🤝‍👨🏾',
            '👩🏽‍🤝‍👨🏼',
            '👩🏽‍🤝‍👨🏻',
            '👩🏼‍🤝‍👨🏿',
            '👩🏼‍🤝‍👨🏾',
            '👩🏼‍🤝‍👨🏽',
            '👩🏼‍🤝‍👨🏻',
            '👩🏻‍🤝‍👨🏿',
            '👩🏻‍🤝‍👨🏾',
            '👩🏻‍🤝‍👨🏽',
            '👩🏻‍🤝‍👨🏼',
            '👫🏿',
            '👫🏾',
            '👫🏽',
            '👫🏼',
            '👫🏻',
        ],
    },
    {
        name: 'two_men_holding_hands',
        code: '👬',
        keywords: [
            'couple',
            'date',
            'two_men_holding_hands',
            'gemini',
            'hand',
            'hold',
            'man',
            'twins',
            'zodiac',
        ],
        types: [
            '👨🏿‍🤝‍👨🏾',
            '👨🏿‍🤝‍👨🏽',
            '👨🏿‍🤝‍👨🏼',
            '👨🏿‍🤝‍👨🏻',
            '👨🏾‍🤝‍👨🏿',
            '👨🏾‍🤝‍👨🏽',
            '👨🏾‍🤝‍👨🏼',
            '👨🏾‍🤝‍👨🏻',
            '👨🏽‍🤝‍👨🏿',
            '👨🏽‍🤝‍👨🏾',
            '👨🏽‍🤝‍👨🏼',
            '👨🏽‍🤝‍👨🏻',
            '👨🏼‍🤝‍👨🏿',
            '👨🏼‍🤝‍👨🏾',
            '👨🏼‍🤝‍👨🏽',
            '👨🏼‍🤝‍👨🏻',
            '👨🏻‍🤝‍👨🏿',
            '👨🏻‍🤝‍👨🏾',
            '👨🏻‍🤝‍👨🏽',
            '👨🏻‍🤝‍👨🏼',
            '👬🏿',
            '👬🏾',
            '👬🏽',
            '👬🏼',
            '👬🏻',
        ],
    },
    {
        name: 'couplekiss',
        code: '💏',
        keywords: [
            'couplekiss',
            'couple',
            'kiss',
            'romance',
        ],
        types: [
            '🧑🏿‍❤️‍💋‍🧑🏾',
            '🧑🏿‍❤️‍💋‍🧑🏽',
            '🧑🏿‍❤️‍💋‍🧑🏼',
            '🧑🏿‍❤️‍💋‍🧑🏻',
            '🧑🏾‍❤️‍💋‍🧑🏿',
            '🧑🏾‍❤️‍💋‍🧑🏽',
            '🧑🏾‍❤️‍💋‍🧑🏼',
            '🧑🏾‍❤️‍💋‍🧑🏻',
            '🧑🏽‍❤️‍💋‍🧑🏿',
            '🧑🏽‍❤️‍💋‍🧑🏾',
            '🧑🏽‍❤️‍💋‍🧑🏼',
            '🧑🏽‍❤️‍💋‍🧑🏻',
            '🧑🏼‍❤️‍💋‍🧑🏿',
            '🧑🏼‍❤️‍💋‍🧑🏾',
            '🧑🏼‍❤️‍💋‍🧑🏽',
            '🧑🏼‍❤️‍💋‍🧑🏻',
            '🧑🏻‍❤️‍💋‍🧑🏿',
            '🧑🏻‍❤️‍💋‍🧑🏾',
            '🧑🏻‍❤️‍💋‍🧑🏽',
            '🧑🏻‍❤️‍💋‍🧑🏼',
            '💏🏿',
            '💏🏾',
            '💏🏽',
            '💏🏼',
            '💏🏻',
        ],
    },
    {
        name: 'couplekiss_man_woman',
        code: '👩‍❤️‍💋‍👨',
        keywords: [
            'couplekiss_man_woman',
        ],
        types: [
            '👩🏿‍❤️‍💋‍👨🏿',
            '👩🏿‍❤️‍💋‍👨🏾',
            '👩🏿‍❤️‍💋‍👨🏽',
            '👩🏿‍❤️‍💋‍👨🏼',
            '👩🏿‍❤️‍💋‍👨🏻',
            '👩🏾‍❤️‍💋‍👨🏿',
            '👩🏾‍❤️‍💋‍👨🏾',
            '👩🏾‍❤️‍💋‍👨🏽',
            '👩🏾‍❤️‍💋‍👨🏼',
            '👩🏾‍❤️‍💋‍👨🏻',
            '👩🏽‍❤️‍💋‍👨🏿',
            '👩🏽‍❤️‍💋‍👨🏾',
            '👩🏽‍❤️‍💋‍👨🏽',
            '👩🏽‍❤️‍💋‍👨🏼',
            '👩🏽‍❤️‍💋‍👨🏻',
            '👩🏼‍❤️‍💋‍👨🏿',
            '👩🏼‍❤️‍💋‍👨🏾',
            '👩🏼‍❤️‍💋‍👨🏽',
            '👩🏼‍❤️‍💋‍👨🏼',
            '👩🏼‍❤️‍💋‍👨🏻',
            '👩🏻‍❤️‍💋‍👨🏿',
            '👩🏻‍❤️‍💋‍👨🏾',
            '👩🏻‍❤️‍💋‍👨🏽',
            '👩🏻‍❤️‍💋‍👨🏼',
            '👩🏻‍❤️‍💋‍👨🏻',
        ],
    },
    {
        name: 'couplekiss_man_man',
        code: '👨‍❤️‍💋‍👨',
        keywords: [
            'couplekiss_man_man',
        ],
        types: [
            '👨🏿‍❤️‍💋‍👨🏿',
            '👨🏿‍❤️‍💋‍👨🏾',
            '👨🏿‍❤️‍💋‍👨🏽',
            '👨🏿‍❤️‍💋‍👨🏼',
            '👨🏿‍❤️‍💋‍👨🏻',
            '👨🏾‍❤️‍💋‍👨🏿',
            '👨🏾‍❤️‍💋‍👨🏾',
            '👨🏾‍❤️‍💋‍👨🏽',
            '👨🏾‍❤️‍💋‍👨🏼',
            '👨🏾‍❤️‍💋‍👨🏻',
            '👨🏽‍❤️‍💋‍👨🏿',
            '👨🏽‍❤️‍💋‍👨🏾',
            '👨🏽‍❤️‍💋‍👨🏽',
            '👨🏽‍❤️‍💋‍👨🏼',
            '👨🏽‍❤️‍💋‍👨🏻',
            '👨🏼‍❤️‍💋‍👨🏿',
            '👨🏼‍❤️‍💋‍👨🏾',
            '👨🏼‍❤️‍💋‍👨🏽',
            '👨🏼‍❤️‍💋‍👨🏼',
            '👨🏼‍❤️‍💋‍👨🏻',
            '👨🏻‍❤️‍💋‍👨🏿',
            '👨🏻‍❤️‍💋‍👨🏾',
            '👨🏻‍❤️‍💋‍👨🏽',
            '👨🏻‍❤️‍💋‍👨🏼',
            '👨🏻‍❤️‍💋‍👨🏻',
        ],
    },
    {
        name: 'couplekiss_woman_woman',
        code: '👩‍❤️‍💋‍👩',
        keywords: [
            'couplekiss_woman_woman',
        ],
        types: [
            '👩🏿‍❤️‍💋‍👩🏿',
            '👩🏿‍❤️‍💋‍👩🏾',
            '👩🏿‍❤️‍💋‍👩🏽',
            '👩🏿‍❤️‍💋‍👩🏼',
            '👩🏿‍❤️‍💋‍👩🏻',
            '👩🏾‍❤️‍💋‍👩🏿',
            '👩🏾‍❤️‍💋‍👩🏾',
            '👩🏾‍❤️‍💋‍👩🏽',
            '👩🏾‍❤️‍💋‍👩🏼',
            '👩🏾‍❤️‍💋‍👩🏻',
            '👩🏽‍❤️‍💋‍👩🏿',
            '👩🏽‍❤️‍💋‍👩🏾',
            '👩🏽‍❤️‍💋‍👩🏽',
            '👩🏽‍❤️‍💋‍👩🏼',
            '👩🏽‍❤️‍💋‍👩🏻',
            '👩🏼‍❤️‍💋‍👩🏿',
            '👩🏼‍❤️‍💋‍👩🏾',
            '👩🏼‍❤️‍💋‍👩🏽',
            '👩🏼‍❤️‍💋‍👩🏼',
            '👩🏼‍❤️‍💋‍👩🏻',
            '👩🏻‍❤️‍💋‍👩🏿',
            '👩🏻‍❤️‍💋‍👩🏾',
            '👩🏻‍❤️‍💋‍👩🏽',
            '👩🏻‍❤️‍💋‍👩🏼',
            '👩🏻‍❤️‍💋‍👩🏻',
        ],
    },
    {
        name: 'couple_with_heart',
        code: '💑',
        keywords: [
            'couple_with_heart',
            'couple',
            'heart',
            'love',
            'romance',
        ],
        types: [
            '🧑🏿‍❤️‍🧑🏾',
            '🧑🏿‍❤️‍🧑🏽',
            '🧑🏿‍❤️‍🧑🏼',
            '🧑🏿‍❤️‍🧑🏻',
            '🧑🏾‍❤️‍🧑🏿',
            '🧑🏾‍❤️‍🧑🏽',
            '🧑🏾‍❤️‍🧑🏼',
            '🧑🏾‍❤️‍🧑🏻',
            '🧑🏽‍❤️‍🧑🏿',
            '🧑🏽‍❤️‍🧑🏾',
            '🧑🏽‍❤️‍🧑🏼',
            '🧑🏽‍❤️‍🧑🏻',
            '🧑🏼‍❤️‍🧑🏿',
            '🧑🏼‍❤️‍🧑🏾',
            '🧑🏼‍❤️‍🧑🏽',
            '🧑🏼‍❤️‍🧑🏻',
            '🧑🏻‍❤️‍🧑🏿',
            '🧑🏻‍❤️‍🧑🏾',
            '🧑🏻‍❤️‍🧑🏽',
            '🧑🏻‍❤️‍🧑🏼',
            '💑🏿',
            '💑🏾',
            '💑🏽',
            '💑🏼',
            '💑🏻',
        ],
    },
    {
        name: 'couple_with_heart_woman_man',
        code: '👩‍❤️‍👨',
        keywords: [
            'couple_with_heart_woman_man',
        ],
        types: [
            '👩🏿‍❤️‍👨🏿',
            '👩🏿‍❤️‍👨🏾',
            '👩🏿‍❤️‍👨🏽',
            '👩🏿‍❤️‍👨🏼',
            '👩🏿‍❤️‍👨🏻',
            '👩🏾‍❤️‍👨🏿',
            '👩🏾‍❤️‍👨🏾',
            '👩🏾‍❤️‍👨🏽',
            '👩🏾‍❤️‍👨🏼',
            '👩🏾‍❤️‍👨🏻',
            '👩🏽‍❤️‍👨🏿',
            '👩🏽‍❤️‍👨🏾',
            '👩🏽‍❤️‍👨🏽',
            '👩🏽‍❤️‍👨🏼',
            '👩🏽‍❤️‍👨🏻',
            '👩🏼‍❤️‍👨🏿',
            '👩🏼‍❤️‍👨🏾',
            '👩🏼‍❤️‍👨🏽',
            '👩🏼‍❤️‍👨🏼',
            '👩🏼‍❤️‍👨🏻',
            '👩🏻‍❤️‍👨🏿',
            '👩🏻‍❤️‍👨🏾',
            '👩🏻‍❤️‍👨🏽',
            '👩🏻‍❤️‍👨🏼',
            '👩🏻‍❤️‍👨🏻',
        ],
    },
    {
        name: 'couple_with_heart_man_man',
        code: '👨‍❤️‍👨',
        keywords: [
            'couple_with_heart_man_man',
        ],
        types: [
            '👨🏿‍❤️‍👨🏿',
            '👨🏿‍❤️‍👨🏾',
            '👨🏿‍❤️‍👨🏽',
            '👨🏿‍❤️‍👨🏼',
            '👨🏿‍❤️‍👨🏻',
            '👨🏾‍❤️‍👨🏿',
            '👨🏾‍❤️‍👨🏾',
            '👨🏾‍❤️‍👨🏽',
            '👨🏾‍❤️‍👨🏼',
            '👨🏾‍❤️‍👨🏻',
            '👨🏽‍❤️‍👨🏿',
            '👨🏽‍❤️‍👨🏾',
            '👨🏽‍❤️‍👨🏽',
            '👨🏽‍❤️‍👨🏼',
            '👨🏽‍❤️‍👨🏻',
            '👨🏼‍❤️‍👨🏿',
            '👨🏼‍❤️‍👨🏾',
            '👨🏼‍❤️‍👨🏽',
            '👨🏼‍❤️‍👨🏼',
            '👨🏼‍❤️‍👨🏻',
            '👨🏻‍❤️‍👨🏿',
            '👨🏻‍❤️‍👨🏾',
            '👨🏻‍❤️‍👨🏽',
            '👨🏻‍❤️‍👨🏼',
            '👨🏻‍❤️‍👨🏻',
        ],
    },
    {
        name: 'couple_with_heart_woman_woman',
        code: '👩‍❤️‍👩',
        keywords: [
            'couple_with_heart_woman_woman',
        ],
        types: [
            '👩🏿‍❤️‍👩🏿',
            '👩🏿‍❤️‍👩🏾',
            '👩🏿‍❤️‍👩🏽',
            '👩🏿‍❤️‍👩🏼',
            '👩🏿‍❤️‍👩🏻',
            '👩🏾‍❤️‍👩🏿',
            '👩🏾‍❤️‍👩🏾',
            '👩🏾‍❤️‍👩🏽',
            '👩🏾‍❤️‍👩🏼',
            '👩🏾‍❤️‍👩🏻',
            '👩🏽‍❤️‍👩🏿',
            '👩🏽‍❤️‍👩🏾',
            '👩🏽‍❤️‍👩🏽',
            '👩🏽‍❤️‍👩🏼',
            '👩🏽‍❤️‍👩🏻',
            '👩🏼‍❤️‍👩🏿',
            '👩🏼‍❤️‍👩🏾',
            '👩🏼‍❤️‍👩🏽',
            '👩🏼‍❤️‍👩🏼',
            '👩🏼‍❤️‍👩🏻',
            '👩🏻‍❤️‍👩🏿',
            '👩🏻‍❤️‍👩🏾',
            '👩🏻‍❤️‍👩🏽',
            '👩🏻‍❤️‍👩🏼',
            '👩🏻‍❤️‍👩🏻',
        ],
    },
    {
        name: 'family',
        code: '👪',
        keywords: [
            'home',
            'parents',
            'child',
            'family',
            'father',
            'mother',
        ],
    },
    {
        name: 'family_man_woman_boy',
        code: '👨‍👩‍👦',
        keywords: [
            'family_man_woman_boy',
            'boy',
            'family',
            'man',
            'woman',
        ],
    },
    {
        name: 'family_man_woman_girl',
        code: '👨‍👩‍👧',
        keywords: [
            'family_man_woman_girl',
            'family',
            'girl',
            'man',
            'woman',
        ],
    },
    {
        name: 'family_man_woman_girl_boy',
        code: '👨‍👩‍👧‍👦',
        keywords: [
            'family_man_woman_girl_boy',
            'boy',
            'family',
            'girl',
            'man',
            'woman',
        ],
    },
    {
        name: 'family_man_woman_boy_boy',
        code: '👨‍👩‍👦‍👦',
        keywords: [
            'family_man_woman_boy_boy',
            'boy',
            'family',
            'man',
            'woman',
        ],
    },
    {
        name: 'family_man_woman_girl_girl',
        code: '👨‍👩‍👧‍👧',
        keywords: [
            'family_man_woman_girl_girl',
            'family',
            'girl',
            'man',
            'woman',
        ],
    },
    {
        name: 'family_man_man_boy',
        code: '👨‍👨‍👦',
        keywords: [
            'family_man_man_boy',
            'boy',
            'family',
            'man',
        ],
    },
    {
        name: 'family_man_man_girl',
        code: '👨‍👨‍👧',
        keywords: [
            'family_man_man_girl',
            'family',
            'girl',
            'man',
        ],
    },
    {
        name: 'family_man_man_girl_boy',
        code: '👨‍👨‍👧‍👦',
        keywords: [
            'family_man_man_girl_boy',
            'boy',
            'family',
            'girl',
            'man',
        ],
    },
    {
        name: 'family_man_man_boy_boy',
        code: '👨‍👨‍👦‍👦',
        keywords: [
            'family_man_man_boy_boy',
            'boy',
            'family',
            'man',
        ],
    },
    {
        name: 'family_man_man_girl_girl',
        code: '👨‍👨‍👧‍👧',
        keywords: [
            'family_man_man_girl_girl',
            'family',
            'girl',
            'man',
        ],
    },
    {
        name: 'family_woman_woman_boy',
        code: '👩‍👩‍👦',
        keywords: [
            'family_woman_woman_boy',
            'boy',
            'family',
            'woman',
        ],
    },
    {
        name: 'family_woman_woman_girl',
        code: '👩‍👩‍👧',
        keywords: [
            'family_woman_woman_girl',
            'family',
            'girl',
            'woman',
        ],
    },
    {
        name: 'family_woman_woman_girl_boy',
        code: '👩‍👩‍👧‍👦',
        keywords: [
            'family_woman_woman_girl_boy',
            'boy',
            'family',
            'girl',
            'woman',
        ],
    },
    {
        name: 'family_woman_woman_boy_boy',
        code: '👩‍👩‍👦‍👦',
        keywords: [
            'family_woman_woman_boy_boy',
            'boy',
            'family',
            'woman',
        ],
    },
    {
        name: 'family_woman_woman_girl_girl',
        code: '👩‍👩‍👧‍👧',
        keywords: [
            'family_woman_woman_girl_girl',
            'family',
            'girl',
            'woman',
        ],
    },
    {
        name: 'family_man_boy',
        code: '👨‍👦',
        keywords: [
            'family_man_boy',
        ],
    },
    {
        name: 'family_man_boy_boy',
        code: '👨‍👦‍👦',
        keywords: [
            'family_man_boy_boy',
        ],
    },
    {
        name: 'family_man_girl',
        code: '👨‍👧',
        keywords: [
            'family_man_girl',
        ],
    },
    {
        name: 'family_man_girl_boy',
        code: '👨‍👧‍👦',
        keywords: [
            'family_man_girl_boy',
        ],
    },
    {
        name: 'family_man_girl_girl',
        code: '👨‍👧‍👧',
        keywords: [
            'family_man_girl_girl',
        ],
    },
    {
        name: 'family_woman_boy',
        code: '👩‍👦',
        keywords: [
            'family_woman_boy',
        ],
    },
    {
        name: 'family_woman_boy_boy',
        code: '👩‍👦‍👦',
        keywords: [
            'family_woman_boy_boy',
        ],
    },
    {
        name: 'family_woman_girl',
        code: '👩‍👧',
        keywords: [
            'family_woman_girl',
        ],
    },
    {
        name: 'family_woman_girl_boy',
        code: '👩‍👧‍👦',
        keywords: [
            'family_woman_girl_boy',
        ],
    },
    {
        name: 'family_woman_girl_girl',
        code: '👩‍👧‍👧',
        keywords: [
            'family_woman_girl_girl',
        ],
    },
    {
        name: 'speaking_head',
        code: '🗣️',
        keywords: [
            'speaking_head',
        ],
    },
    {
        name: 'bust_in_silhouette',
        code: '👤',
        keywords: [
            'user',
            'bust_in_silhouette',
            'bust',
            'silhouette',
        ],
    },
    {
        name: 'busts_in_silhouette',
        code: '👥',
        keywords: [
            'users',
            'group',
            'team',
            'busts_in_silhouette',
            'bust',
            'silhouette',
        ],
    },
    {
        name: 'people_hugging',
        code: '🫂',
        keywords: [
            'people_hugging',
        ],
    },
    {
        name: 'footprints',
        code: '👣',
        keywords: [
            'feet',
            'tracks',
            'footprints',
            'body',
            'clothing',
            'footprint',
            'print',
        ],
    },
    {
        code: 'animalsAndNature',
        header: true,
    },
    {
        name: 'monkey_face',
        code: '🐵',
        keywords: [
            'monkey_face',
            'face',
            'monkey',
        ],
    },
    {
        name: 'monkey',
        code: '🐒',
        keywords: [
            'monkey',
        ],
    },
    {
        name: 'gorilla',
        code: '🦍',
        keywords: [
            'gorilla',
        ],
    },
    {
        name: 'orangutan',
        code: '🦧',
        keywords: [
            'orangutan',
        ],
    },
    {
        name: 'dog',
        code: '🐶',
        keywords: [
            'pet',
            'dog',
            'face',
        ],
    },
    {
        name: 'dog2',
        code: '🐕',
        keywords: [
            'dog2',
            'dog',
            'pet',
        ],
    },
    {
        name: 'guide_dog',
        code: '🦮',
        keywords: [
            'guide_dog',
        ],
    },
    {
        name: 'service_dog',
        code: '🐕‍🦺',
        keywords: [
            'service_dog',
        ],
    },
    {
        name: 'poodle',
        code: '🐩',
        keywords: [
            'dog',
            'poodle',
        ],
    },
    {
        name: 'wolf',
        code: '🐺',
        keywords: [
            'wolf',
            'face',
        ],
    },
    {
        name: 'fox_face',
        code: '🦊',
        keywords: [
            'fox_face',
            'face',
            'fox',
        ],
    },
    {
        name: 'raccoon',
        code: '🦝',
        keywords: [
            'raccoon',
        ],
    },
    {
        name: 'cat',
        code: '🐱',
        keywords: [
            'pet',
            'cat',
            'face',
        ],
    },
    {
        name: 'cat2',
        code: '🐈',
        keywords: [
            'cat2',
            'cat',
            'pet',
        ],
    },
    {
        name: 'black_cat',
        code: '🐈‍⬛',
        keywords: [
            'black_cat',
        ],
    },
    {
        name: 'lion',
        code: '🦁',
        keywords: [
            'lion',
            'face',
            'leo',
            'zodiac',
        ],
    },
    {
        name: 'tiger',
        code: '🐯',
        keywords: [
            'tiger',
            'face',
        ],
    },
    {
        name: 'tiger2',
        code: '🐅',
        keywords: [
            'tiger2',
            'tiger',
        ],
    },
    {
        name: 'leopard',
        code: '🐆',
        keywords: [
            'leopard',
        ],
    },
    {
        name: 'horse',
        code: '🐴',
        keywords: [
            'horse',
            'face',
        ],
    },
    {
        name: 'racehorse',
        code: '🐎',
        keywords: [
            'speed',
            'racehorse',
            'horse',
            'racing',
        ],
    },
    {
        name: 'unicorn',
        code: '🦄',
        keywords: [
            'unicorn',
            'face',
        ],
    },
    {
        name: 'zebra',
        code: '🦓',
        keywords: [
            'zebra',
        ],
    },
    {
        name: 'deer',
        code: '🦌',
        keywords: [
            'deer',
        ],
    },
    {
        name: 'bison',
        code: '🦬',
        keywords: [
            'bison',
        ],
    },
    {
        name: 'cow',
        code: '🐮',
        keywords: [
            'cow',
            'face',
        ],
    },
    {
        name: 'ox',
        code: '🐂',
        keywords: [
            'ox',
            'bull',
            'taurus',
            'zodiac',
        ],
    },
    {
        name: 'water_buffalo',
        code: '🐃',
        keywords: [
            'water_buffalo',
            'buffalo',
            'water',
        ],
    },
    {
        name: 'cow2',
        code: '🐄',
        keywords: [
            'cow2',
            'cow',
        ],
    },
    {
        name: 'pig',
        code: '🐷',
        keywords: [
            'pig',
            'face',
        ],
    },
    {
        name: 'pig2',
        code: '🐖',
        keywords: [
            'pig2',
            'pig',
            'sow',
        ],
    },
    {
        name: 'boar',
        code: '🐗',
        keywords: [
            'boar',
            'pig',
        ],
    },
    {
        name: 'pig_nose',
        code: '🐽',
        keywords: [
            'pig_nose',
            'face',
            'nose',
            'pig',
        ],
    },
    {
        name: 'ram',
        code: '🐏',
        keywords: [
            'ram',
            'aries',
            'sheep',
            'zodiac',
        ],
    },
    {
        name: 'sheep',
        code: '🐑',
        keywords: [
            'sheep',
            'ewe',
        ],
    },
    {
        name: 'goat',
        code: '🐐',
        keywords: [
            'goat',
            'capricorn',
            'zodiac',
        ],
    },
    {
        name: 'dromedary_camel',
        code: '🐪',
        keywords: [
            'desert',
            'dromedary_camel',
            'camel',
            'dromedary',
            'hump',
        ],
    },
    {
        name: 'camel',
        code: '🐫',
        keywords: [
            'camel',
            'bactrian',
            'hump',
        ],
    },
    {
        name: 'llama',
        code: '🦙',
        keywords: [
            'llama',
        ],
    },
    {
        name: 'giraffe',
        code: '🦒',
        keywords: [
            'giraffe',
        ],
    },
    {
        name: 'elephant',
        code: '🐘',
        keywords: [
            'elephant',
        ],
    },
    {
        name: 'mammoth',
        code: '🦣',
        keywords: [
            'mammoth',
        ],
    },
    {
        name: 'rhinoceros',
        code: '🦏',
        keywords: [
            'rhinoceros',
        ],
    },
    {
        name: 'hippopotamus',
        code: '🦛',
        keywords: [
            'hippopotamus',
        ],
    },
    {
        name: 'mouse',
        code: '🐭',
        keywords: [
            'mouse',
            'face',
        ],
    },
    {
        name: 'mouse2',
        code: '🐁',
        keywords: [
            'mouse2',
            'mouse',
        ],
    },
    {
        name: 'rat',
        code: '🐀',
        keywords: [
            'rat',
        ],
    },
    {
        name: 'hamster',
        code: '🐹',
        keywords: [
            'pet',
            'hamster',
            'face',
        ],
    },
    {
        name: 'rabbit',
        code: '🐰',
        keywords: [
            'bunny',
            'rabbit',
            'face',
            'pet',
        ],
    },
    {
        name: 'rabbit2',
        code: '🐇',
        keywords: [
            'rabbit2',
            'bunny',
            'pet',
            'rabbit',
        ],
    },
    {
        name: 'chipmunk',
        code: '🐿️',
        keywords: [
            'chipmunk',
        ],
    },
    {
        name: 'beaver',
        code: '🦫',
        keywords: [
            'beaver',
        ],
    },
    {
        name: 'hedgehog',
        code: '🦔',
        keywords: [
            'hedgehog',
        ],
    },
    {
        name: 'bat',
        code: '🦇',
        keywords: [
            'bat',
            'vampire',
        ],
    },
    {
        name: 'bear',
        code: '🐻',
        keywords: [
            'bear',
            'face',
        ],
    },
    {
        name: 'polar_bear',
        code: '🐻‍❄️',
        keywords: [
            'polar_bear',
        ],
    },
    {
        name: 'koala',
        code: '🐨',
        keywords: [
            'koala',
            'bear',
        ],
    },
    {
        name: 'panda_face',
        code: '🐼',
        keywords: [
            'panda_face',
            'face',
            'panda',
        ],
    },
    {
        name: 'sloth',
        code: '🦥',
        keywords: [
            'sloth',
        ],
    },
    {
        name: 'otter',
        code: '🦦',
        keywords: [
            'otter',
        ],
    },
    {
        name: 'skunk',
        code: '🦨',
        keywords: [
            'skunk',
        ],
    },
    {
        name: 'kangaroo',
        code: '🦘',
        keywords: [
            'kangaroo',
        ],
    },
    {
        name: 'badger',
        code: '🦡',
        keywords: [
            'badger',
        ],
    },
    {
        name: 'feet',
        code: '🐾',
        keywords: [
            'feet',
            'paw_prints',
            'paw',
            'print',
        ],
    },
    {
        name: 'turkey',
        code: '🦃',
        keywords: [
            'thanksgiving',
            'turkey',
        ],
    },
    {
        name: 'chicken',
        code: '🐔',
        keywords: [
            'chicken',
        ],
    },
    {
        name: 'rooster',
        code: '🐓',
        keywords: [
            'rooster',
        ],
    },
    {
        name: 'hatching_chick',
        code: '🐣',
        keywords: [
            'hatching_chick',
            'baby',
            'chick',
            'hatching',
        ],
    },
    {
        name: 'baby_chick',
        code: '🐤',
        keywords: [
            'baby_chick',
            'baby',
            'chick',
        ],
    },
    {
        name: 'hatched_chick',
        code: '🐥',
        keywords: [
            'hatched_chick',
            'baby',
            'chick',
        ],
    },
    {
        name: 'bird',
        code: '🐦',
        keywords: [
            'bird',
        ],
    },
    {
        name: 'penguin',
        code: '🐧',
        keywords: [
            'penguin',
        ],
    },
    {
        name: 'dove',
        code: '🕊️',
        keywords: [
            'peace',
            'dove',
        ],
    },
    {
        name: 'eagle',
        code: '🦅',
        keywords: [
            'eagle',
            'bird',
        ],
    },
    {
        name: 'duck',
        code: '🦆',
        keywords: [
            'duck',
            'bird',
        ],
    },
    {
        name: 'swan',
        code: '🦢',
        keywords: [
            'swan',
        ],
    },
    {
        name: 'owl',
        code: '🦉',
        keywords: [
            'owl',
            'bird',
            'wise',
        ],
    },
    {
        name: 'dodo',
        code: '🦤',
        keywords: [
            'dodo',
        ],
    },
    {
        name: 'feather',
        code: '🪶',
        keywords: [
            'feather',
        ],
    },
    {
        name: 'flamingo',
        code: '🦩',
        keywords: [
            'flamingo',
        ],
    },
    {
        name: 'peacock',
        code: '🦚',
        keywords: [
            'peacock',
        ],
    },
    {
        name: 'parrot',
        code: '🦜',
        keywords: [
            'parrot',
        ],
    },
    {
        name: 'frog',
        code: '🐸',
        keywords: [
            'frog',
            'face',
        ],
    },
    {
        name: 'crocodile',
        code: '🐊',
        keywords: [
            'crocodile',
        ],
    },
    {
        name: 'turtle',
        code: '🐢',
        keywords: [
            'slow',
            'turtle',
        ],
    },
    {
        name: 'lizard',
        code: '🦎',
        keywords: [
            'lizard',
            'reptile',
        ],
    },
    {
        name: 'snake',
        code: '🐍',
        keywords: [
            'snake',
            'bearer',
            'ophiuchus',
            'serpent',
            'zodiac',
        ],
    },
    {
        name: 'dragon_face',
        code: '🐲',
        keywords: [
            'dragon_face',
            'dragon',
            'face',
            'fairy tale',
        ],
    },
    {
        name: 'dragon',
        code: '🐉',
        keywords: [
            'dragon',
            'fairy tale',
        ],
    },
    {
        name: 'sauropod',
        code: '🦕',
        keywords: [
            'dinosaur',
            'sauropod',
        ],
    },
    {
        name: 't-rex',
        code: '🦖',
        keywords: [
            'dinosaur',
            't-rex',
        ],
    },
    {
        name: 'whale',
        code: '🐳',
        keywords: [
            'sea',
            'whale',
            'face',
            'spouting',
        ],
    },
    {
        name: 'whale2',
        code: '🐋',
        keywords: [
            'whale2',
            'whale',
        ],
    },
    {
        name: 'dolphin',
        code: '🐬',
        keywords: [
            'dolphin',
            'flipper',
        ],
    },
    {
        name: 'seal',
        code: '🦭',
        keywords: [
            'seal',
        ],
    },
    {
        name: 'fish',
        code: '🐟',
        keywords: [
            'fish',
            'pisces',
            'zodiac',
        ],
    },
    {
        name: 'tropical_fish',
        code: '🐠',
        keywords: [
            'tropical_fish',
            'fish',
            'tropical',
        ],
    },
    {
        name: 'blowfish',
        code: '🐡',
        keywords: [
            'blowfish',
            'fish',
        ],
    },
    {
        name: 'shark',
        code: '🦈',
        keywords: [
            'shark',
            'fish',
        ],
    },
    {
        name: 'octopus',
        code: '🐙',
        keywords: [
            'octopus',
        ],
    },
    {
        name: 'shell',
        code: '🐚',
        keywords: [
            'sea',
            'beach',
            'shell',
            'spiral',
        ],
    },
    {
        name: 'snail',
        code: '🐌',
        keywords: [
            'slow',
            'snail',
        ],
    },
    {
        name: 'butterfly',
        code: '🦋',
        keywords: [
            'butterfly',
            'insect',
            'pretty',
        ],
    },
    {
        name: 'bug',
        code: '🐛',
        keywords: [
            'bug',
            'insect',
        ],
    },
    {
        name: 'ant',
        code: '🐜',
        keywords: [
            'ant',
            'insect',
        ],
    },
    {
        name: 'bee',
        code: '🐝',
        keywords: [
            'bee',
            'honeybee',
            'insect',
        ],
    },
    {
        name: 'beetle',
        code: '🪲',
        keywords: [
            'beetle',
        ],
    },
    {
        name: 'lady_beetle',
        code: '🐞',
        keywords: [
            'bug',
            'lady_beetle',
            'beetle',
            'insect',
            'lady beetle',
            'ladybird',
            'ladybug',
        ],
    },
    {
        name: 'cricket',
        code: '🦗',
        keywords: [
            'cricket',
        ],
    },
    {
        name: 'cockroach',
        code: '🪳',
        keywords: [
            'cockroach',
        ],
    },
    {
        name: 'spider',
        code: '🕷️',
        keywords: [
            'spider',
        ],
    },
    {
        name: 'spider_web',
        code: '🕸️',
        keywords: [
            'spider_web',
        ],
    },
    {
        name: 'scorpion',
        code: '🦂',
        keywords: [
            'scorpion',
            'scorpio',
            'scorpius',
            'zodiac',
        ],
    },
    {
        name: 'mosquito',
        code: '🦟',
        keywords: [
            'mosquito',
        ],
    },
    {
        name: 'fly',
        code: '🪰',
        keywords: [
            'fly',
        ],
    },
    {
        name: 'worm',
        code: '🪱',
        keywords: [
            'worm',
        ],
    },
    {
        name: 'microbe',
        code: '🦠',
        keywords: [
            'germ',
            'microbe',
        ],
    },
    {
        name: 'bouquet',
        code: '💐',
        keywords: [
            'flowers',
            'bouquet',
            'flower',
            'plant',
            'romance',
        ],
    },
    {
        name: 'cherry_blossom',
        code: '🌸',
        keywords: [
            'flower',
            'spring',
            'cherry_blossom',
            'blossom',
            'cherry',
            'plant',
        ],
    },
    {
        name: 'white_flower',
        code: '💮',
        keywords: [
            'white_flower',
            'flower',
        ],
    },
    {
        name: 'rosette',
        code: '🏵️',
        keywords: [
            'rosette',
        ],
    },
    {
        name: 'rose',
        code: '🌹',
        keywords: [
            'flower',
            'rose',
            'plant',
        ],
    },
    {
        name: 'wilted_flower',
        code: '🥀',
        keywords: [
            'wilted_flower',
            'flower',
            'wilted',
        ],
    },
    {
        name: 'hibiscus',
        code: '🌺',
        keywords: [
            'hibiscus',
            'flower',
            'plant',
        ],
    },
    {
        name: 'sunflower',
        code: '🌻',
        keywords: [
            'sunflower',
            'flower',
            'plant',
            'sun',
        ],
    },
    {
        name: 'blossom',
        code: '🌼',
        keywords: [
            'blossom',
            'flower',
            'plant',
        ],
    },
    {
        name: 'tulip',
        code: '🌷',
        keywords: [
            'flower',
            'tulip',
            'plant',
        ],
    },
    {
        name: 'seedling',
        code: '🌱',
        keywords: [
            'plant',
            'seedling',
            'young',
        ],
    },
    {
        name: 'potted_plant',
        code: '🪴',
        keywords: [
            'potted_plant',
        ],
    },
    {
        name: 'evergreen_tree',
        code: '🌲',
        keywords: [
            'wood',
            'evergreen_tree',
            'evergreen',
            'plant',
            'tree',
        ],
    },
    {
        name: 'deciduous_tree',
        code: '🌳',
        keywords: [
            'wood',
            'deciduous_tree',
            'deciduous',
            'plant',
            'shedding',
            'tree',
        ],
    },
    {
        name: 'palm_tree',
        code: '🌴',
        keywords: [
            'palm_tree',
            'palm',
            'plant',
            'tree',
        ],
    },
    {
        name: 'cactus',
        code: '🌵',
        keywords: [
            'cactus',
            'plant',
        ],
    },
    {
        name: 'ear_of_rice',
        code: '🌾',
        keywords: [
            'ear_of_rice',
            'ear',
            'plant',
            'rice',
        ],
    },
    {
        name: 'herb',
        code: '🌿',
        keywords: [
            'herb',
            'leaf',
            'plant',
        ],
    },
    {
        name: 'shamrock',
        code: '☘️',
        keywords: [
            'shamrock',
            'plant',
        ],
    },
    {
        name: 'four_leaf_clover',
        code: '🍀',
        keywords: [
            'luck',
            'four_leaf_clover',
            '4',
            'clover',
            'four',
            'leaf',
            'plant',
        ],
    },
    {
        name: 'maple_leaf',
        code: '🍁',
        keywords: [
            'canada',
            'maple_leaf',
            'falling',
            'leaf',
            'maple',
            'plant',
        ],
    },
    {
        name: 'fallen_leaf',
        code: '🍂',
        keywords: [
            'autumn',
            'fallen_leaf',
            'falling',
            'leaf',
            'plant',
        ],
    },
    {
        name: 'leaves',
        code: '🍃',
        keywords: [
            'leaf',
            'leaves',
            'blow',
            'flutter',
            'plant',
            'wind',
        ],
    },
    {
        code: 'foodAndDrink',
        header: true,
    },
    {
        name: 'grapes',
        code: '🍇',
        keywords: [
            'grapes',
            'fruit',
            'grape',
            'plant',
        ],
    },
    {
        name: 'melon',
        code: '🍈',
        keywords: [
            'melon',
            'fruit',
            'plant',
        ],
    },
    {
        name: 'watermelon',
        code: '🍉',
        keywords: [
            'watermelon',
            'fruit',
            'plant',
        ],
    },
    {
        name: 'tangerine',
        code: '🍊',
        keywords: [
            'tangerine',
            'orange',
            'mandarin',
            'fruit',
            'plant',
        ],
    },
    {
        name: 'lemon',
        code: '🍋',
        keywords: [
            'lemon',
            'citrus',
            'fruit',
            'plant',
        ],
    },
    {
        name: 'banana',
        code: '🍌',
        keywords: [
            'fruit',
            'banana',
            'plant',
        ],
    },
    {
        name: 'pineapple',
        code: '🍍',
        keywords: [
            'pineapple',
            'fruit',
            'plant',
        ],
    },
    {
        name: 'mango',
        code: '🥭',
        keywords: [
            'mango',
        ],
    },
    {
        name: 'apple',
        code: '🍎',
        keywords: [
            'apple',
            'fruit',
            'plant',
            'red',
        ],
    },
    {
        name: 'green_apple',
        code: '🍏',
        keywords: [
            'fruit',
            'green_apple',
            'apple',
            'green',
            'plant',
        ],
    },
    {
        name: 'pear',
        code: '🍐',
        keywords: [
            'pear',
            'fruit',
            'plant',
        ],
    },
    {
        name: 'peach',
        code: '🍑',
        keywords: [
            'peach',
            'fruit',
            'plant',
        ],
    },
    {
        name: 'cherries',
        code: '🍒',
        keywords: [
            'fruit',
            'cherries',
            'cherry',
            'plant',
        ],
    },
    {
        name: 'strawberry',
        code: '🍓',
        keywords: [
            'fruit',
            'strawberry',
            'berry',
            'plant',
        ],
    },
    {
        name: 'blueberries',
        code: '🫐',
        keywords: [
            'blueberries',
        ],
    },
    {
        name: 'kiwi_fruit',
        code: '🥝',
        keywords: [
            'kiwi_fruit',
            'fruit',
            'kiwi',
        ],
    },
    {
        name: 'tomato',
        code: '🍅',
        keywords: [
            'tomato',
            'plant',
            'vegetable',
        ],
    },
    {
        name: 'olive',
        code: '🫒',
        keywords: [
            'olive',
        ],
    },
    {
        name: 'coconut',
        code: '🥥',
        keywords: [
            'coconut',
        ],
    },
    {
        name: 'avocado',
        code: '🥑',
        keywords: [
            'avocado',
            'fruit',
        ],
    },
    {
        name: 'eggplant',
        code: '🍆',
        keywords: [
            'aubergine',
            'eggplant',
            'plant',
            'vegetable',
        ],
    },
    {
        name: 'potato',
        code: '🥔',
        keywords: [
            'potato',
            'vegetable',
        ],
    },
    {
        name: 'carrot',
        code: '🥕',
        keywords: [
            'carrot',
            'vegetable',
        ],
    },
    {
        name: 'corn',
        code: '🌽',
        keywords: [
            'corn',
            'ear',
            'maize',
            'maze',
            'plant',
        ],
    },
    {
        name: 'hot_pepper',
        code: '🌶️',
        keywords: [
            'spicy',
            'hot_pepper',
        ],
    },
    {
        name: 'bell_pepper',
        code: '🫑',
        keywords: [
            'bell_pepper',
        ],
    },
    {
        name: 'cucumber',
        code: '🥒',
        keywords: [
            'cucumber',
            'pickle',
            'vegetable',
        ],
    },
    {
        name: 'leafy_green',
        code: '🥬',
        keywords: [
            'leafy_green',
        ],
    },
    {
        name: 'broccoli',
        code: '🥦',
        keywords: [
            'broccoli',
        ],
    },
    {
        name: 'garlic',
        code: '🧄',
        keywords: [
            'garlic',
        ],
    },
    {
        name: 'onion',
        code: '🧅',
        keywords: [
            'onion',
        ],
    },
    {
        name: 'mushroom',
        code: '🍄',
        keywords: [
            'mushroom',
            'plant',
        ],
    },
    {
        name: 'peanuts',
        code: '🥜',
        keywords: [
            'peanuts',
            'nut',
            'peanut',
            'vegetable',
        ],
    },
    {
        name: 'chestnut',
        code: '🌰',
        keywords: [
            'chestnut',
            'plant',
        ],
    },
    {
        name: 'bread',
        code: '🍞',
        keywords: [
            'toast',
            'bread',
            'loaf',
        ],
    },
    {
        name: 'croissant',
        code: '🥐',
        keywords: [
            'croissant',
            'bread',
            'crescent roll',
            'french',
        ],
    },
    {
        name: 'baguette_bread',
        code: '🥖',
        keywords: [
            'baguette_bread',
            'baguette',
            'bread',
            'french',
        ],
    },
    {
        name: 'flatbread',
        code: '🫓',
        keywords: [
            'flatbread',
        ],
    },
    {
        name: 'pretzel',
        code: '🥨',
        keywords: [
            'pretzel',
        ],
    },
    {
        name: 'bagel',
        code: '🥯',
        keywords: [
            'bagel',
        ],
    },
    {
        name: 'pancakes',
        code: '🥞',
        keywords: [
            'pancakes',
            'crêpe',
            'hotcake',
            'pancake',
        ],
    },
    {
        name: 'waffle',
        code: '🧇',
        keywords: [
            'waffle',
        ],
    },
    {
        name: 'cheese',
        code: '🧀',
        keywords: [
            'cheese',
        ],
    },
    {
        name: 'meat_on_bone',
        code: '🍖',
        keywords: [
            'meat_on_bone',
            'bone',
            'meat',
        ],
    },
    {
        name: 'poultry_leg',
        code: '🍗',
        keywords: [
            'meat',
            'chicken',
            'poultry_leg',
            'bone',
            'leg',
            'poultry',
        ],
    },
    {
        name: 'cut_of_meat',
        code: '🥩',
        keywords: [
            'cut_of_meat',
        ],
    },
    {
        name: 'bacon',
        code: '🥓',
        keywords: [
            'bacon',
            'meat',
        ],
    },
    {
        name: 'hamburger',
        code: '🍔',
        keywords: [
            'burger',
            'hamburger',
        ],
    },
    {
        name: 'fries',
        code: '🍟',
        keywords: [
            'fries',
            'french',
        ],
    },
    {
        name: 'pizza',
        code: '🍕',
        keywords: [
            'pizza',
            'cheese',
            'slice',
        ],
    },
    {
        name: 'hotdog',
        code: '🌭',
        keywords: [
            'hotdog',
            'frankfurter',
            'hot dog',
            'sausage',
        ],
    },
    {
        name: 'sandwich',
        code: '🥪',
        keywords: [
            'sandwich',
        ],
    },
    {
        name: 'taco',
        code: '🌮',
        keywords: [
            'taco',
            'mexican',
        ],
    },
    {
        name: 'burrito',
        code: '🌯',
        keywords: [
            'burrito',
            'mexican',
        ],
    },
    {
        name: 'tamale',
        code: '🫔',
        keywords: [
            'tamale',
        ],
    },
    {
        name: 'stuffed_flatbread',
        code: '🥙',
        keywords: [
            'stuffed_flatbread',
            'falafel',
            'flatbread',
            'gyro',
            'kebab',
            'stuffed',
        ],
    },
    {
        name: 'falafel',
        code: '🧆',
        keywords: [
            'falafel',
        ],
    },
    {
        name: 'egg',
        code: '🥚',
        keywords: [
            'egg',
        ],
    },
    {
        name: 'fried_egg',
        code: '🍳',
        keywords: [
            'breakfast',
            'fried_egg',
            'cooking',
            'egg',
            'frying',
            'pan',
        ],
    },
    {
        name: 'shallow_pan_of_food',
        code: '🥘',
        keywords: [
            'paella',
            'curry',
            'shallow_pan_of_food',
            'casserole',
            'pan',
            'shallow',
        ],
    },
    {
        name: 'stew',
        code: '🍲',
        keywords: [
            'stew',
            'pot',
        ],
    },
    {
        name: 'fondue',
        code: '🫕',
        keywords: [
            'fondue',
        ],
    },
    {
        name: 'bowl_with_spoon',
        code: '🥣',
        keywords: [
            'bowl_with_spoon',
        ],
    },
    {
        name: 'green_salad',
        code: '🥗',
        keywords: [
            'green_salad',
            'green',
            'salad',
        ],
    },
    {
        name: 'popcorn',
        code: '🍿',
        keywords: [
            'popcorn',
        ],
    },
    {
        name: 'butter',
        code: '🧈',
        keywords: [
            'butter',
        ],
    },
    {
        name: 'salt',
        code: '🧂',
        keywords: [
            'salt',
        ],
    },
    {
        name: 'canned_food',
        code: '🥫',
        keywords: [
            'canned_food',
        ],
    },
    {
        name: 'bento',
        code: '🍱',
        keywords: [
            'bento',
            'box',
        ],
    },
    {
        name: 'rice_cracker',
        code: '🍘',
        keywords: [
            'rice_cracker',
            'cracker',
            'rice',
        ],
    },
    {
        name: 'rice_ball',
        code: '🍙',
        keywords: [
            'rice_ball',
            'ball',
            'japanese',
            'rice',
        ],
    },
    {
        name: 'rice',
        code: '🍚',
        keywords: [
            'rice',
            'cooked',
        ],
    },
    {
        name: 'curry',
        code: '🍛',
        keywords: [
            'curry',
            'rice',
        ],
    },
    {
        name: 'ramen',
        code: '🍜',
        keywords: [
            'noodle',
            'ramen',
            'bowl',
            'steaming',
        ],
    },
    {
        name: 'spaghetti',
        code: '🍝',
        keywords: [
            'pasta',
            'spaghetti',
        ],
    },
    {
        name: 'sweet_potato',
        code: '🍠',
        keywords: [
            'sweet_potato',
            'potato',
            'roasted',
            'sweet',
        ],
    },
    {
        name: 'oden',
        code: '🍢',
        keywords: [
            'oden',
            'kebab',
            'seafood',
            'skewer',
            'stick',
        ],
    },
    {
        name: 'sushi',
        code: '🍣',
        keywords: [
            'sushi',
        ],
    },
    {
        name: 'fried_shrimp',
        code: '🍤',
        keywords: [
            'tempura',
            'fried_shrimp',
            'fried',
            'prawn',
            'shrimp',
        ],
    },
    {
        name: 'fish_cake',
        code: '🍥',
        keywords: [
            'fish_cake',
            'cake',
            'fish',
            'pastry',
            'swirl',
        ],
    },
    {
        name: 'moon_cake',
        code: '🥮',
        keywords: [
            'moon_cake',
        ],
    },
    {
        name: 'dango',
        code: '🍡',
        keywords: [
            'dango',
            'dessert',
            'japanese',
            'skewer',
            'stick',
            'sweet',
        ],
    },
    {
        name: 'dumpling',
        code: '🥟',
        keywords: [
            'dumpling',
        ],
    },
    {
        name: 'fortune_cookie',
        code: '🥠',
        keywords: [
            'fortune_cookie',
        ],
    },
    {
        name: 'takeout_box',
        code: '🥡',
        keywords: [
            'takeout_box',
        ],
    },
    {
        name: 'crab',
        code: '🦀',
        keywords: [
            'crab',
            'cancer',
            'zodiac',
        ],
    },
    {
        name: 'lobster',
        code: '🦞',
        keywords: [
            'lobster',
        ],
    },
    {
        name: 'shrimp',
        code: '🦐',
        keywords: [
            'shrimp',
            'shellfish',
            'small',
        ],
    },
    {
        name: 'squid',
        code: '🦑',
        keywords: [
            'squid',
            'molusc',
        ],
    },
    {
        name: 'oyster',
        code: '🦪',
        keywords: [
            'oyster',
        ],
    },
    {
        name: 'icecream',
        code: '🍦',
        keywords: [
            'icecream',
            'cream',
            'dessert',
            'ice',
            'soft',
            'sweet',
        ],
    },
    {
        name: 'shaved_ice',
        code: '🍧',
        keywords: [
            'shaved_ice',
            'dessert',
            'ice',
            'shaved',
            'sweet',
        ],
    },
    {
        name: 'ice_cream',
        code: '🍨',
        keywords: [
            'ice_cream',
            'cream',
            'dessert',
            'ice',
            'sweet',
        ],
    },
    {
        name: 'doughnut',
        code: '🍩',
        keywords: [
            'doughnut',
            'dessert',
            'donut',
            'sweet',
        ],
    },
    {
        name: 'cookie',
        code: '🍪',
        keywords: [
            'cookie',
            'dessert',
            'sweet',
        ],
    },
    {
        name: 'birthday',
        code: '🎂',
        keywords: [
            'party',
            'birthday',
            'cake',
            'celebration',
            'dessert',
            'pastry',
            'sweet',
        ],
    },
    {
        name: 'cake',
        code: '🍰',
        keywords: [
            'dessert',
            'cake',
            'pastry',
            'shortcake',
            'slice',
            'sweet',
        ],
    },
    {
        name: 'cupcake',
        code: '🧁',
        keywords: [
            'cupcake',
        ],
    },
    {
        name: 'pie',
        code: '🥧',
        keywords: [
            'pie',
        ],
    },
    {
        name: 'chocolate_bar',
        code: '🍫',
        keywords: [
            'chocolate_bar',
            'bar',
            'chocolate',
            'dessert',
            'sweet',
        ],
    },
    {
        name: 'candy',
        code: '🍬',
        keywords: [
            'sweet',
            'candy',
            'dessert',
        ],
    },
    {
        name: 'lollipop',
        code: '🍭',
        keywords: [
            'lollipop',
            'candy',
            'dessert',
            'sweet',
        ],
    },
    {
        name: 'custard',
        code: '🍮',
        keywords: [
            'custard',
            'dessert',
            'pudding',
            'sweet',
        ],
    },
    {
        name: 'honey_pot',
        code: '🍯',
        keywords: [
            'honey_pot',
            'honey',
            'honeypot',
            'pot',
            'sweet',
        ],
    },
    {
        name: 'baby_bottle',
        code: '🍼',
        keywords: [
            'milk',
            'baby_bottle',
            'baby',
            'bottle',
            'drink',
        ],
    },
    {
        name: 'milk_glass',
        code: '🥛',
        keywords: [
            'milk_glass',
            'drink',
            'glass',
            'milk',
        ],
    },
    {
        name: 'coffee',
        code: '☕',
        keywords: [
            'cafe',
            'espresso',
            'coffee',
            'beverage',
            'drink',
            'hot',
            'steaming',
            'tea',
        ],
    },
    {
        name: 'teapot',
        code: '🫖',
        keywords: [
            'teapot',
        ],
    },
    {
        name: 'tea',
        code: '🍵',
        keywords: [
            'green',
            'breakfast',
            'tea',
            'beverage',
            'cup',
            'drink',
            'teacup',
        ],
    },
    {
        name: 'sake',
        code: '🍶',
        keywords: [
            'sake',
            'bar',
            'beverage',
            'bottle',
            'cup',
            'drink',
        ],
    },
    {
        name: 'champagne',
        code: '🍾',
        keywords: [
            'bottle',
            'bubbly',
            'celebration',
            'champagne',
            'bar',
            'cork',
            'drink',
            'popping',
        ],
    },
    {
        name: 'wine_glass',
        code: '🍷',
        keywords: [
            'wine_glass',
            'bar',
            'beverage',
            'drink',
            'glass',
            'wine',
        ],
    },
    {
        name: 'cocktail',
        code: '🍸',
        keywords: [
            'drink',
            'cocktail',
            'bar',
            'glass',
        ],
    },
    {
        name: 'tropical_drink',
        code: '🍹',
        keywords: [
            'summer',
            'vacation',
            'tropical_drink',
            'bar',
            'drink',
            'tropical',
        ],
    },
    {
        name: 'beer',
        code: '🍺',
        keywords: [
            'drink',
            'beer',
            'bar',
            'mug',
        ],
    },
    {
        name: 'beers',
        code: '🍻',
        keywords: [
            'drinks',
            'beers',
            'bar',
            'beer',
            'clink',
            'drink',
            'mug',
        ],
    },
    {
        name: 'clinking_glasses',
        code: '🥂',
        keywords: [
            'cheers',
            'toast',
            'clinking_glasses',
            'celebrate',
            'clink',
            'drink',
            'glass',
        ],
    },
    {
        name: 'tumbler_glass',
        code: '🥃',
        keywords: [
            'whisky',
            'tumbler_glass',
            'glass',
            'liquor',
            'shot',
            'tumbler',
        ],
    },
    {
        name: 'cup_with_straw',
        code: '🥤',
        keywords: [
            'cup_with_straw',
        ],
    },
    {
        name: 'bubble_tea',
        code: '🧋',
        keywords: [
            'bubble_tea',
        ],
    },
    {
        name: 'beverage_box',
        code: '🧃',
        keywords: [
            'beverage_box',
        ],
    },
    {
        name: 'mate',
        code: '🧉',
        keywords: [
            'mate',
        ],
    },
    {
        name: 'ice_cube',
        code: '🧊',
        keywords: [
            'ice_cube',
        ],
    },
    {
        name: 'chopsticks',
        code: '🥢',
        keywords: [
            'chopsticks',
        ],
    },
    {
        name: 'plate_with_cutlery',
        code: '🍽️',
        keywords: [
            'dining',
            'dinner',
            'plate_with_cutlery',
        ],
    },
    {
        name: 'fork_and_knife',
        code: '🍴',
        keywords: [
            'cutlery',
            'fork_and_knife',
            'cooking',
            'fork',
            'knife',
        ],
    },
    {
        name: 'spoon',
        code: '🥄',
        keywords: [
            'spoon',
            'tableware',
        ],
    },
    {
        name: 'hocho',
        code: '🔪',
        keywords: [
            'cut',
            'chop',
            'hocho',
            'knife',
            'cooking',
            'tool',
            'weapon',
        ],
    },
    {
        name: 'amphora',
        code: '🏺',
        keywords: [
            'amphora',
            'aquarius',
            'cooking',
            'drink',
            'jug',
            'tool',
            'weapon',
            'zodiac',
        ],
    },
    {
        code: 'travelAndPlaces',
        header: true,
    },
    {
        name: 'earth_africa',
        code: '🌍',
        keywords: [
            'globe',
            'world',
            'international',
            'earth_africa',
            'africa',
            'earth',
            'europe',
        ],
    },
    {
        name: 'earth_americas',
        code: '🌎',
        keywords: [
            'globe',
            'world',
            'international',
            'earth_americas',
            'americas',
            'earth',
        ],
    },
    {
        name: 'earth_asia',
        code: '🌏',
        keywords: [
            'globe',
            'world',
            'international',
            'earth_asia',
            'asia',
            'australia',
            'earth',
        ],
    },
    {
        name: 'globe_with_meridians',
        code: '🌐',
        keywords: [
            'world',
            'global',
            'international',
            'globe_with_meridians',
            'earth',
            'globe',
            'meridians',
        ],
    },
    {
        name: 'world_map',
        code: '🗺️',
        keywords: [
            'travel',
            'world_map',
        ],
    },
    {
        name: 'japan',
        code: '🗾',
        keywords: [
            'japan',
            'map',
        ],
    },
    {
        name: 'compass',
        code: '🧭',
        keywords: [
            'compass',
        ],
    },
    {
        name: 'mountain_snow',
        code: '🏔️',
        keywords: [
            'mountain_snow',
        ],
    },
    {
        name: 'mountain',
        code: '⛰️',
        keywords: [
            'mountain',
        ],
    },
    {
        name: 'volcano',
        code: '🌋',
        keywords: [
            'volcano',
            'eruption',
            'mountain',
            'weather',
        ],
    },
    {
        name: 'mount_fuji',
        code: '🗻',
        keywords: [
            'mount_fuji',
            'fuji',
            'mountain',
        ],
    },
    {
        name: 'camping',
        code: '🏕️',
        keywords: [
            'camping',
        ],
    },
    {
        name: 'beach_umbrella',
        code: '🏖️',
        keywords: [
            'beach_umbrella',
        ],
    },
    {
        name: 'desert',
        code: '🏜️',
        keywords: [
            'desert',
        ],
    },
    {
        name: 'desert_island',
        code: '🏝️',
        keywords: [
            'desert_island',
        ],
    },
    {
        name: 'national_park',
        code: '🏞️',
        keywords: [
            'national_park',
        ],
    },
    {
        name: 'stadium',
        code: '🏟️',
        keywords: [
            'stadium',
        ],
    },
    {
        name: 'classical_building',
        code: '🏛️',
        keywords: [
            'classical_building',
        ],
    },
    {
        name: 'building_construction',
        code: '🏗️',
        keywords: [
            'building_construction',
        ],
    },
    {
        name: 'bricks',
        code: '🧱',
        keywords: [
            'bricks',
        ],
    },
    {
        name: 'rock',
        code: '🪨',
        keywords: [
            'rock',
        ],
    },
    {
        name: 'wood',
        code: '🪵',
        keywords: [
            'wood',
        ],
    },
    {
        name: 'hut',
        code: '🛖',
        keywords: [
            'hut',
        ],
    },
    {
        name: 'houses',
        code: '🏘️',
        keywords: [
            'houses',
        ],
    },
    {
        name: 'derelict_house',
        code: '🏚️',
        keywords: [
            'derelict_house',
        ],
    },
    {
        name: 'house',
        code: '🏠',
        keywords: [
            'house',
            'building',
            'home',
        ],
    },
    {
        name: 'house_with_garden',
        code: '🏡',
        keywords: [
            'house_with_garden',
            'building',
            'garden',
            'home',
            'house',
        ],
    },
    {
        name: 'office',
        code: '🏢',
        keywords: [
            'office',
            'building',
        ],
    },
    {
        name: 'post_office',
        code: '🏣',
        keywords: [
            'post_office',
            'building',
            'japanese',
            'post',
        ],
    },
    {
        name: 'european_post_office',
        code: '🏤',
        keywords: [
            'european_post_office',
            'building',
            'european',
            'post',
        ],
    },
    {
        name: 'hospital',
        code: '🏥',
        keywords: [
            'hospital',
            'building',
            'doctor',
            'medicine',
        ],
    },
    {
        name: 'bank',
        code: '🏦',
        keywords: [
            'bank',
            'building',
        ],
    },
    {
        name: 'hotel',
        code: '🏨',
        keywords: [
            'hotel',
            'building',
        ],
    },
    {
        name: 'love_hotel',
        code: '🏩',
        keywords: [
            'love_hotel',
            'building',
            'hotel',
            'love',
        ],
    },
    {
        name: 'convenience_store',
        code: '🏪',
        keywords: [
            'convenience_store',
            'building',
            'convenience',
            'store',
        ],
    },
    {
        name: 'school',
        code: '🏫',
        keywords: [
            'school',
            'building',
        ],
    },
    {
        name: 'department_store',
        code: '🏬',
        keywords: [
            'department_store',
            'building',
            'department',
            'store',
        ],
    },
    {
        name: 'factory',
        code: '🏭',
        keywords: [
            'factory',
            'building',
        ],
    },
    {
        name: 'japanese_castle',
        code: '🏯',
        keywords: [
            'japanese_castle',
            'building',
            'castle',
            'japanese',
        ],
    },
    {
        name: 'european_castle',
        code: '🏰',
        keywords: [
            'european_castle',
            'building',
            'castle',
            'european',
        ],
    },
    {
        name: 'wedding',
        code: '💒',
        keywords: [
            'marriage',
            'wedding',
            'activity',
            'chapel',
            'romance',
        ],
    },
    {
        name: 'tokyo_tower',
        code: '🗼',
        keywords: [
            'tokyo_tower',
            'tokyo',
            'tower',
        ],
    },
    {
        name: 'statue_of_liberty',
        code: '🗽',
        keywords: [
            'statue_of_liberty',
            'liberty',
            'statue',
        ],
    },
    {
        name: 'church',
        code: '⛪',
        keywords: [
            'church',
            'building',
            'christian',
            'cross',
            'religion',
        ],
    },
    {
        name: 'mosque',
        code: '🕌',
        keywords: [
            'mosque',
            'islam',
            'muslim',
            'religion',
        ],
    },
    {
        name: 'hindu_temple',
        code: '🛕',
        keywords: [
            'hindu_temple',
        ],
    },
    {
        name: 'synagogue',
        code: '🕍',
        keywords: [
            'synagogue',
            'jew',
            'jewish',
            'religion',
            'temple',
        ],
    },
    {
        name: 'shinto_shrine',
        code: '⛩️',
        keywords: [
            'shinto_shrine',
        ],
    },
    {
        name: 'kaaba',
        code: '🕋',
        keywords: [
            'kaaba',
            'islam',
            'muslim',
            'religion',
        ],
    },
    {
        name: 'fountain',
        code: '⛲',
        keywords: [
            'fountain',
        ],
    },
    {
        name: 'tent',
        code: '⛺',
        keywords: [
            'camping',
            'tent',
        ],
    },
    {
        name: 'foggy',
        code: '🌁',
        keywords: [
            'karl',
            'foggy',
            'fog',
            'weather',
        ],
    },
    {
        name: 'night_with_stars',
        code: '🌃',
        keywords: [
            'night_with_stars',
            'night',
            'star',
            'weather',
        ],
    },
    {
        name: 'cityscape',
        code: '🏙️',
        keywords: [
            'skyline',
            'cityscape',
        ],
    },
    {
        name: 'sunrise_over_mountains',
        code: '🌄',
        keywords: [
            'sunrise_over_mountains',
            'morning',
            'mountain',
            'sun',
            'sunrise',
            'weather',
        ],
    },
    {
        name: 'sunrise',
        code: '🌅',
        keywords: [
            'sunrise',
            'morning',
            'sun',
            'weather',
        ],
    },
    {
        name: 'city_sunset',
        code: '🌆',
        keywords: [
            'city_sunset',
            'building',
            'city',
            'dusk',
            'evening',
            'landscape',
            'sun',
            'sunset',
            'weather',
        ],
    },
    {
        name: 'city_sunrise',
        code: '🌇',
        keywords: [
            'city_sunrise',
            'building',
            'dusk',
            'sun',
            'sunset',
            'weather',
        ],
    },
    {
        name: 'bridge_at_night',
        code: '🌉',
        keywords: [
            'bridge_at_night',
            'bridge',
            'night',
            'weather',
        ],
    },
    {
        name: 'hotsprings',
        code: '♨️',
        keywords: [
            'hotsprings',
            'hot',
            'springs',
            'steaming',
        ],
    },
    {
        name: 'carousel_horse',
        code: '🎠',
        keywords: [
            'carousel_horse',
            'activity',
            'carousel',
            'entertainment',
            'horse',
        ],
    },
    {
        name: 'ferris_wheel',
        code: '🎡',
        keywords: [
            'ferris_wheel',
            'activity',
            'amusement park',
            'entertainment',
            'ferris',
            'wheel',
        ],
    },
    {
        name: 'roller_coaster',
        code: '🎢',
        keywords: [
            'roller_coaster',
            'activity',
            'amusement park',
            'coaster',
            'entertainment',
            'roller',
        ],
    },
    {
        name: 'barber',
        code: '💈',
        keywords: [
            'barber',
            'haircut',
            'pole',
        ],
    },
    {
        name: 'circus_tent',
        code: '🎪',
        keywords: [
            'circus_tent',
            'activity',
            'circus',
            'entertainment',
            'tent',
        ],
    },
    {
        name: 'steam_locomotive',
        code: '🚂',
        keywords: [
            'train',
            'steam_locomotive',
            'engine',
            'locomotive',
            'railway',
            'steam',
            'vehicle',
        ],
    },
    {
        name: 'railway_car',
        code: '🚃',
        keywords: [
            'railway_car',
            'car',
            'electric',
            'railway',
            'train',
            'tram',
            'trolleybus',
            'vehicle',
        ],
    },
    {
        name: 'bullettrain_side',
        code: '🚄',
        keywords: [
            'train',
            'bullettrain_side',
            'railway',
            'shinkansen',
            'speed',
            'vehicle',
        ],
    },
    {
        name: 'bullettrain_front',
        code: '🚅',
        keywords: [
            'train',
            'bullettrain_front',
            'bullet',
            'railway',
            'shinkansen',
            'speed',
            'vehicle',
        ],
    },
    {
        name: 'train2',
        code: '🚆',
        keywords: [
            'train2',
            'railway',
            'train',
            'vehicle',
        ],
    },
    {
        name: 'metro',
        code: '🚇',
        keywords: [
            'metro',
            'subway',
            'vehicle',
        ],
    },
    {
        name: 'light_rail',
        code: '🚈',
        keywords: [
            'light_rail',
            'railway',
            'vehicle',
        ],
    },
    {
        name: 'station',
        code: '🚉',
        keywords: [
            'station',
            'railway',
            'train',
            'vehicle',
        ],
    },
    {
        name: 'tram',
        code: '🚊',
        keywords: [
            'tram',
            'trolleybus',
            'vehicle',
        ],
    },
    {
        name: 'monorail',
        code: '🚝',
        keywords: [
            'monorail',
            'vehicle',
        ],
    },
    {
        name: 'mountain_railway',
        code: '🚞',
        keywords: [
            'mountain_railway',
            'car',
            'mountain',
            'railway',
            'vehicle',
        ],
    },
    {
        name: 'train',
        code: '🚋',
        keywords: [
            'train',
            'car',
            'tram',
            'trolleybus',
            'vehicle',
        ],
    },
    {
        name: 'bus',
        code: '🚌',
        keywords: [
            'bus',
            'vehicle',
        ],
    },
    {
        name: 'oncoming_bus',
        code: '🚍',
        keywords: [
            'oncoming_bus',
            'bus',
            'oncoming',
            'vehicle',
        ],
    },
    {
        name: 'trolleybus',
        code: '🚎',
        keywords: [
            'trolleybus',
            'bus',
            'tram',
            'trolley',
            'vehicle',
        ],
    },
    {
        name: 'minibus',
        code: '🚐',
        keywords: [
            'minibus',
            'bus',
            'vehicle',
        ],
    },
    {
        name: 'ambulance',
        code: '🚑',
        keywords: [
            'ambulance',
            'vehicle',
        ],
    },
    {
        name: 'fire_engine',
        code: '🚒',
        keywords: [
            'fire_engine',
            'engine',
            'fire',
            'truck',
            'vehicle',
        ],
    },
    {
        name: 'police_car',
        code: '🚓',
        keywords: [
            'police_car',
            'car',
            'patrol',
            'police',
            'vehicle',
        ],
    },
    {
        name: 'oncoming_police_car',
        code: '🚔',
        keywords: [
            'oncoming_police_car',
            'car',
            'oncoming',
            'police',
            'vehicle',
        ],
    },
    {
        name: 'taxi',
        code: '🚕',
        keywords: [
            'taxi',
            'vehicle',
        ],
    },
    {
        name: 'oncoming_taxi',
        code: '🚖',
        keywords: [
            'oncoming_taxi',
            'oncoming',
            'taxi',
            'vehicle',
        ],
    },
    {
        name: 'car',
        code: '🚗',
        keywords: [
            'car',
            'red_car',
            'automobile',
            'vehicle',
        ],
    },
    {
        name: 'oncoming_automobile',
        code: '🚘',
        keywords: [
            'oncoming_automobile',
            'automobile',
            'car',
            'oncoming',
            'vehicle',
        ],
    },
    {
        name: 'blue_car',
        code: '🚙',
        keywords: [
            'blue_car',
            'recreational',
            'rv',
            'vehicle',
        ],
    },
    {
        name: 'pickup_truck',
        code: '🛻',
        keywords: [
            'pickup_truck',
        ],
    },
    {
        name: 'truck',
        code: '🚚',
        keywords: [
            'truck',
            'delivery',
            'vehicle',
        ],
    },
    {
        name: 'articulated_lorry',
        code: '🚛',
        keywords: [
            'articulated_lorry',
            'lorry',
            'semi',
            'truck',
            'vehicle',
        ],
    },
    {
        name: 'tractor',
        code: '🚜',
        keywords: [
            'tractor',
            'vehicle',
        ],
    },
    {
        name: 'racing_car',
        code: '🏎️',
        keywords: [
            'racing_car',
        ],
    },
    {
        name: 'motorcycle',
        code: '🏍️',
        keywords: [
            'motorcycle',
        ],
    },
    {
        name: 'motor_scooter',
        code: '🛵',
        keywords: [
            'motor_scooter',
            'motor',
            'scooter',
        ],
    },
    {
        name: 'manual_wheelchair',
        code: '🦽',
        keywords: [
            'manual_wheelchair',
        ],
    },
    {
        name: 'motorized_wheelchair',
        code: '🦼',
        keywords: [
            'motorized_wheelchair',
        ],
    },
    {
        name: 'auto_rickshaw',
        code: '🛺',
        keywords: [
            'auto_rickshaw',
        ],
    },
    {
        name: 'bike',
        code: '🚲',
        keywords: [
            'bicycle',
            'bike',
            'vehicle',
        ],
    },
    {
        name: 'kick_scooter',
        code: '🛴',
        keywords: [
            'kick_scooter',
            'kick',
            'scooter',
        ],
    },
    {
        name: 'skateboard',
        code: '🛹',
        keywords: [
            'skateboard',
        ],
    },
    {
        name: 'roller_skate',
        code: '🛼',
        keywords: [
            'roller_skate',
        ],
    },
    {
        name: 'busstop',
        code: '🚏',
        keywords: [
            'busstop',
            'bus',
            'stop',
        ],
    },
    {
        name: 'motorway',
        code: '🛣️',
        keywords: [
            'motorway',
        ],
    },
    {
        name: 'railway_track',
        code: '🛤️',
        keywords: [
            'railway_track',
        ],
    },
    {
        name: 'oil_drum',
        code: '🛢️',
        keywords: [
            'oil_drum',
        ],
    },
    {
        name: 'fuelpump',
        code: '⛽',
        keywords: [
            'fuelpump',
            'fuel',
            'gas',
            'pump',
            'station',
        ],
    },
    {
        name: 'rotating_light',
        code: '🚨',
        keywords: [
            '911',
            'emergency',
            'rotating_light',
            'beacon',
            'car',
            'light',
            'police',
            'revolving',
            'vehicle',
        ],
    },
    {
        name: 'traffic_light',
        code: '🚥',
        keywords: [
            'traffic_light',
            'light',
            'signal',
            'traffic',
        ],
    },
    {
        name: 'vertical_traffic_light',
        code: '🚦',
        keywords: [
            'semaphore',
            'vertical_traffic_light',
            'light',
            'signal',
            'traffic',
        ],
    },
    {
        name: 'stop_sign',
        code: '🛑',
        keywords: [
            'stop_sign',
            'octagonal',
            'stop',
        ],
    },
    {
        name: 'construction',
        code: '🚧',
        keywords: [
            'wip',
            'construction',
            'barrier',
        ],
    },
    {
        name: 'anchor',
        code: '⚓',
        keywords: [
            'ship',
            'anchor',
            'tool',
        ],
    },
    {
        name: 'boat',
        code: '⛵',
        keywords: [
            'boat',
            'sailboat',
            'resort',
            'sea',
            'vehicle',
            'yacht',
        ],
    },
    {
        name: 'canoe',
        code: '🛶',
        keywords: [
            'canoe',
            'boat',
        ],
    },
    {
        name: 'speedboat',
        code: '🚤',
        keywords: [
            'ship',
            'speedboat',
            'boat',
            'vehicle',
        ],
    },
    {
        name: 'passenger_ship',
        code: '🛳️',
        keywords: [
            'cruise',
            'passenger_ship',
        ],
    },
    {
        name: 'ferry',
        code: '⛴️',
        keywords: [
            'ferry',
        ],
    },
    {
        name: 'motor_boat',
        code: '🛥️',
        keywords: [
            'motor_boat',
        ],
    },
    {
        name: 'ship',
        code: '🚢',
        keywords: [
            'ship',
            'vehicle',
        ],
    },
    {
        name: 'airplane',
        code: '✈️',
        keywords: [
            'flight',
            'airplane',
            'vehicle',
        ],
    },
    {
        name: 'small_airplane',
        code: '🛩️',
        keywords: [
            'flight',
            'small_airplane',
        ],
    },
    {
        name: 'flight_departure',
        code: '🛫',
        keywords: [
            'flight_departure',
            'airplane',
            'check-in',
            'departure',
            'departures',
            'vehicle',
        ],
    },
    {
        name: 'flight_arrival',
        code: '🛬',
        keywords: [
            'flight_arrival',
            'airplane',
            'arrivals',
            'arriving',
            'landing',
            'vehicle',
        ],
    },
    {
        name: 'parachute',
        code: '🪂',
        keywords: [
            'parachute',
        ],
    },
    {
        name: 'seat',
        code: '💺',
        keywords: [
            'seat',
            'chair',
        ],
    },
    {
        name: 'helicopter',
        code: '🚁',
        keywords: [
            'helicopter',
            'vehicle',
        ],
    },
    {
        name: 'suspension_railway',
        code: '🚟',
        keywords: [
            'suspension_railway',
            'railway',
            'suspension',
            'vehicle',
        ],
    },
    {
        name: 'mountain_cableway',
        code: '🚠',
        keywords: [
            'mountain_cableway',
            'cable',
            'gondola',
            'mountain',
            'vehicle',
        ],
    },
    {
        name: 'aerial_tramway',
        code: '🚡',
        keywords: [
            'aerial_tramway',
            'aerial',
            'cable',
            'car',
            'gondola',
            'ropeway',
            'tramway',
            'vehicle',
        ],
    },
    {
        name: 'artificial_satellite',
        code: '🛰️',
        keywords: [
            'orbit',
            'space',
            'artificial_satellite',
        ],
    },
    {
        name: 'rocket',
        code: '🚀',
        keywords: [
            'ship',
            'launch',
            'rocket',
            'space',
            'vehicle',
        ],
    },
    {
        name: 'flying_saucer',
        code: '🛸',
        keywords: [
            'ufo',
            'flying_saucer',
        ],
    },
    {
        name: 'bellhop_bell',
        code: '🛎️',
        keywords: [
            'bellhop_bell',
        ],
    },
    {
        name: 'luggage',
        code: '🧳',
        keywords: [
            'luggage',
        ],
    },
    {
        name: 'hourglass',
        code: '⌛',
        keywords: [
            'time',
            'hourglass',
            'sand',
            'timer',
        ],
    },
    {
        name: 'hourglass_flowing_sand',
        code: '⏳',
        keywords: [
            'time',
            'hourglass_flowing_sand',
            'hourglass',
            'sand',
            'timer',
        ],
    },
    {
        name: 'watch',
        code: '⌚',
        keywords: [
            'time',
            'watch',
            'clock',
        ],
    },
    {
        name: 'alarm_clock',
        code: '⏰',
        keywords: [
            'morning',
            'alarm_clock',
            'alarm',
            'clock',
        ],
    },
    {
        name: 'stopwatch',
        code: '⏱️',
        keywords: [
            'stopwatch',
        ],
    },
    {
        name: 'timer_clock',
        code: '⏲️',
        keywords: [
            'timer_clock',
        ],
    },
    {
        name: 'mantelpiece_clock',
        code: '🕰️',
        keywords: [
            'mantelpiece_clock',
        ],
    },
    {
        name: 'clock12',
        code: '🕛',
        keywords: [
            'clock12',
            '00',
            '12',
            '12:00',
            'clock',
            'o’clock',
            'twelve',
        ],
    },
    {
        name: 'clock1230',
        code: '🕧',
        keywords: [
            'clock1230',
            '12',
            '12:30',
            '30',
            'clock',
            'thirty',
            'twelve',
        ],
    },
    {
        name: 'clock1',
        code: '🕐',
        keywords: [
            'clock1',
            '00',
            '1',
            '1:00',
            'clock',
            'o’clock',
            'one',
        ],
    },
    {
        name: 'clock130',
        code: '🕜',
        keywords: [
            'clock130',
            '1',
            '1:30',
            '30',
            'clock',
            'one',
            'thirty',
        ],
    },
    {
        name: 'clock2',
        code: '🕑',
        keywords: [
            'clock2',
            '00',
            '2',
            '2:00',
            'clock',
            'o’clock',
            'two',
        ],
    },
    {
        name: 'clock230',
        code: '🕝',
        keywords: [
            'clock230',
            '2',
            '2:30',
            '30',
            'clock',
            'thirty',
            'two',
        ],
    },
    {
        name: 'clock3',
        code: '🕒',
        keywords: [
            'clock3',
            '00',
            '3',
            '3:00',
            'clock',
            'o’clock',
            'three',
        ],
    },
    {
        name: 'clock330',
        code: '🕞',
        keywords: [
            'clock330',
            '3',
            '3:30',
            '30',
            'clock',
            'thirty',
            'three',
        ],
    },
    {
        name: 'clock4',
        code: '🕓',
        keywords: [
            'clock4',
            '00',
            '4',
            '4:00',
            'clock',
            'four',
            'o’clock',
        ],
    },
    {
        name: 'clock430',
        code: '🕟',
        keywords: [
            'clock430',
            '30',
            '4',
            '4:30',
            'clock',
            'four',
            'thirty',
        ],
    },
    {
        name: 'clock5',
        code: '🕔',
        keywords: [
            'clock5',
            '00',
            '5',
            '5:00',
            'clock',
            'five',
            'o’clock',
        ],
    },
    {
        name: 'clock530',
        code: '🕠',
        keywords: [
            'clock530',
            '30',
            '5',
            '5:30',
            'clock',
            'five',
            'thirty',
        ],
    },
    {
        name: 'clock6',
        code: '🕕',
        keywords: [
            'clock6',
            '00',
            '6',
            '6:00',
            'clock',
            'o’clock',
            'six',
        ],
    },
    {
        name: 'clock630',
        code: '🕡',
        keywords: [
            'clock630',
            '30',
            '6',
            '6:30',
            'clock',
            'six',
            'thirty',
        ],
    },
    {
        name: 'clock7',
        code: '🕖',
        keywords: [
            'clock7',
            '00',
            '7',
            '7:00',
            'clock',
            'o’clock',
            'seven',
        ],
    },
    {
        name: 'clock730',
        code: '🕢',
        keywords: [
            'clock730',
            '30',
            '7',
            '7:30',
            'clock',
            'seven',
            'thirty',
        ],
    },
    {
        name: 'clock8',
        code: '🕗',
        keywords: [
            'clock8',
            '00',
            '8',
            '8:00',
            'clock',
            'eight',
            'o’clock',
        ],
    },
    {
        name: 'clock830',
        code: '🕣',
        keywords: [
            'clock830',
            '30',
            '8',
            '8:30',
            'clock',
            'eight',
            'thirty',
        ],
    },
    {
        name: 'clock9',
        code: '🕘',
        keywords: [
            'clock9',
            '00',
            '9',
            '9:00',
            'clock',
            'nine',
            'o’clock',
        ],
    },
    {
        name: 'clock930',
        code: '🕤',
        keywords: [
            'clock930',
            '30',
            '9',
            '9:30',
            'clock',
            'nine',
            'thirty',
        ],
    },
    {
        name: 'clock10',
        code: '🕙',
        keywords: [
            'clock10',
            '00',
            '10',
            '10:00',
            'clock',
            'o’clock',
            'ten',
        ],
    },
    {
        name: 'clock1030',
        code: '🕥',
        keywords: [
            'clock1030',
            '10',
            '10:30',
            '30',
            'clock',
            'ten',
            'thirty',
        ],
    },
    {
        name: 'clock11',
        code: '🕚',
        keywords: [
            'clock11',
            '00',
            '11',
            '11:00',
            'clock',
            'eleven',
            'o’clock',
        ],
    },
    {
        name: 'clock1130',
        code: '🕦',
        keywords: [
            'clock1130',
            '11',
            '11:30',
            '30',
            'clock',
            'eleven',
            'thirty',
        ],
    },
    {
        name: 'new_moon',
        code: '🌑',
        keywords: [
            'new_moon',
            'dark',
            'moon',
            'space',
            'weather',
        ],
    },
    {
        name: 'waxing_crescent_moon',
        code: '🌒',
        keywords: [
            'waxing_crescent_moon',
            'crescent',
            'moon',
            'space',
            'waxing',
            'weather',
        ],
    },
    {
        name: 'first_quarter_moon',
        code: '🌓',
        keywords: [
            'first_quarter_moon',
            'moon',
            'quarter',
            'space',
            'weather',
        ],
    },
    {
        name: 'moon',
        code: '🌔',
        keywords: [
            'moon',
            'waxing_gibbous_moon',
            'gibbous',
            'space',
            'waxing',
            'weather',
        ],
    },
    {
        name: 'full_moon',
        code: '🌕',
        keywords: [
            'full_moon',
            'full',
            'moon',
            'space',
            'weather',
        ],
    },
    {
        name: 'waning_gibbous_moon',
        code: '🌖',
        keywords: [
            'waning_gibbous_moon',
            'gibbous',
            'moon',
            'space',
            'waning',
            'weather',
        ],
    },
    {
        name: 'last_quarter_moon',
        code: '🌗',
        keywords: [
            'last_quarter_moon',
            'moon',
            'quarter',
            'space',
            'weather',
        ],
    },
    {
        name: 'waning_crescent_moon',
        code: '🌘',
        keywords: [
            'waning_crescent_moon',
            'crescent',
            'moon',
            'space',
            'waning',
            'weather',
        ],
    },
    {
        name: 'crescent_moon',
        code: '🌙',
        keywords: [
            'night',
            'crescent_moon',
            'crescent',
            'moon',
            'space',
            'weather',
        ],
    },
    {
        name: 'new_moon_with_face',
        code: '🌚',
        keywords: [
            'new_moon_with_face',
            'face',
            'moon',
            'space',
            'weather',
        ],
    },
    {
        name: 'first_quarter_moon_with_face',
        code: '🌛',
        keywords: [
            'first_quarter_moon_with_face',
            'face',
            'moon',
            'quarter',
            'space',
            'weather',
        ],
    },
    {
        name: 'last_quarter_moon_with_face',
        code: '🌜',
        keywords: [
            'last_quarter_moon_with_face',
            'face',
            'moon',
            'quarter',
            'space',
            'weather',
        ],
    },
    {
        name: 'thermometer',
        code: '🌡️',
        keywords: [
            'thermometer',
        ],
    },
    {
        name: 'sunny',
        code: '☀️',
        keywords: [
            'weather',
            'sunny',
            'bright',
            'rays',
            'space',
            'sun',
        ],
    },
    {
        name: 'full_moon_with_face',
        code: '🌝',
        keywords: [
            'full_moon_with_face',
            'bright',
            'face',
            'full',
            'moon',
            'space',
            'weather',
        ],
    },
    {
        name: 'sun_with_face',
        code: '🌞',
        keywords: [
            'summer',
            'sun_with_face',
            'bright',
            'face',
            'space',
            'sun',
            'weather',
        ],
    },
    {
        name: 'ringed_planet',
        code: '🪐',
        keywords: [
            'ringed_planet',
        ],
    },
    {
        name: 'star',
        code: '⭐',
        keywords: [
            'star',
        ],
    },
    {
        name: 'star2',
        code: '🌟',
        keywords: [
            'star2',
            'glittery',
            'glow',
            'shining',
            'sparkle',
            'star',
        ],
    },
    {
        name: 'stars',
        code: '🌠',
        keywords: [
            'stars',
            'activity',
            'falling',
            'shooting',
            'space',
            'star',
        ],
    },
    {
        name: 'milky_way',
        code: '🌌',
        keywords: [
            'milky_way',
            'milky way',
            'space',
            'weather',
        ],
    },
    {
        name: 'cloud',
        code: '☁️',
        keywords: [
            'cloud',
            'weather',
        ],
    },
    {
        name: 'partly_sunny',
        code: '⛅',
        keywords: [
            'weather',
            'cloud',
            'partly_sunny',
            'sun',
        ],
    },
    {
        name: 'cloud_with_lightning_and_rain',
        code: '⛈️',
        keywords: [
            'cloud_with_lightning_and_rain',
        ],
    },
    {
        name: 'sun_behind_small_cloud',
        code: '🌤️',
        keywords: [
            'sun_behind_small_cloud',
        ],
    },
    {
        name: 'sun_behind_large_cloud',
        code: '🌥️',
        keywords: [
            'sun_behind_large_cloud',
        ],
    },
    {
        name: 'sun_behind_rain_cloud',
        code: '🌦️',
        keywords: [
            'sun_behind_rain_cloud',
        ],
    },
    {
        name: 'cloud_with_rain',
        code: '🌧️',
        keywords: [
            'cloud_with_rain',
        ],
    },
    {
        name: 'cloud_with_snow',
        code: '🌨️',
        keywords: [
            'cloud_with_snow',
        ],
    },
    {
        name: 'cloud_with_lightning',
        code: '🌩️',
        keywords: [
            'cloud_with_lightning',
        ],
    },
    {
        name: 'tornado',
        code: '🌪️',
        keywords: [
            'tornado',
        ],
    },
    {
        name: 'fog',
        code: '🌫️',
        keywords: [
            'fog',
        ],
    },
    {
        name: 'wind_face',
        code: '🌬️',
        keywords: [
            'wind_face',
        ],
    },
    {
        name: 'cyclone',
        code: '🌀',
        keywords: [
            'swirl',
            'cyclone',
            'dizzy',
            'twister',
            'typhoon',
            'weather',
        ],
    },
    {
        name: 'rainbow',
        code: '🌈',
        keywords: [
            'rainbow',
            'rain',
            'weather',
        ],
    },
    {
        name: 'closed_umbrella',
        code: '🌂',
        keywords: [
            'weather',
            'rain',
            'closed_umbrella',
            'clothing',
            'umbrella',
        ],
    },
    {
        name: 'open_umbrella',
        code: '☂️',
        keywords: [
            'open_umbrella',
            'clothing',
            'rain',
            'umbrella',
            'weather',
        ],
    },
    {
        name: 'umbrella',
        code: '☔',
        keywords: [
            'rain',
            'weather',
            'umbrella',
            'clothing',
            'drop',
        ],
    },
    {
        name: 'parasol_on_ground',
        code: '⛱️',
        keywords: [
            'beach_umbrella',
            'parasol_on_ground',
        ],
    },
    {
        name: 'zap',
        code: '⚡',
        keywords: [
            'lightning',
            'thunder',
            'zap',
            'danger',
            'electric',
            'electricity',
            'voltage',
        ],
    },
    {
        name: 'snowflake',
        code: '❄️',
        keywords: [
            'winter',
            'cold',
            'weather',
            'snowflake',
            'snow',
        ],
    },
    {
        name: 'snowman_with_snow',
        code: '☃️',
        keywords: [
            'winter',
            'christmas',
            'snowman_with_snow',
            'cold',
            'snow',
            'snowman',
            'weather',
        ],
    },
    {
        name: 'snowman',
        code: '⛄',
        keywords: [
            'winter',
            'snowman',
            'cold',
            'snow',
            'weather',
        ],
    },
    {
        name: 'comet',
        code: '☄️',
        keywords: [
            'comet',
            'space',
        ],
    },
    {
        name: 'fire',
        code: '🔥',
        keywords: [
            'burn',
            'fire',
            'flame',
            'tool',
        ],
    },
    {
        name: 'droplet',
        code: '💧',
        keywords: [
            'water',
            'droplet',
            'cold',
            'comic',
            'drop',
            'sweat',
            'weather',
        ],
    },
    {
        name: 'ocean',
        code: '🌊',
        keywords: [
            'sea',
            'ocean',
            'water',
            'wave',
            'weather',
        ],
    },
    {
        code: 'activities',
        header: true,
    },
    {
        name: 'jack_o_lantern',
        code: '🎃',
        keywords: [
            'halloween',
            'jack_o_lantern',
            'activity',
            'celebration',
            'entertainment',
            'jack',
            'lantern',
        ],
    },
    {
        name: 'christmas_tree',
        code: '🎄',
        keywords: [
            'christmas_tree',
            'activity',
            'celebration',
            'christmas',
            'entertainment',
            'tree',
        ],
    },
    {
        name: 'fireworks',
        code: '🎆',
        keywords: [
            'festival',
            'celebration',
            'fireworks',
            'activity',
            'entertainment',
        ],
    },
    {
        name: 'sparkler',
        code: '🎇',
        keywords: [
            'sparkler',
            'activity',
            'celebration',
            'entertainment',
            'fireworks',
            'sparkle',
        ],
    },
    {
        name: 'firecracker',
        code: '🧨',
        keywords: [
            'firecracker',
        ],
    },
    {
        name: 'sparkles',
        code: '✨',
        keywords: [
            'shiny',
            'sparkles',
            'entertainment',
            'sparkle',
            'star',
        ],
    },
    {
        name: 'balloon',
        code: '🎈',
        keywords: [
            'party',
            'birthday',
            'balloon',
            'activity',
            'celebration',
            'entertainment',
        ],
    },
    {
        name: 'tada',
        code: '🎉',
        keywords: [
            'hooray',
            'party',
            'tada',
            'activity',
            'celebration',
            'entertainment',
            'popper',
        ],
    },
    {
        name: 'confetti_ball',
        code: '🎊',
        keywords: [
            'confetti_ball',
            'activity',
            'ball',
            'celebration',
            'confetti',
            'entertainment',
        ],
    },
    {
        name: 'tanabata_tree',
        code: '🎋',
        keywords: [
            'tanabata_tree',
            'activity',
            'banner',
            'celebration',
            'entertainment',
            'japanese',
            'tree',
        ],
    },
    {
        name: 'bamboo',
        code: '🎍',
        keywords: [
            'bamboo',
            'activity',
            'celebration',
            'japanese',
            'pine',
            'plant',
        ],
    },
    {
        name: 'dolls',
        code: '🎎',
        keywords: [
            'dolls',
            'activity',
            'celebration',
            'doll',
            'entertainment',
            'festival',
            'japanese',
        ],
    },
    {
        name: 'flags',
        code: '🎏',
        keywords: [
            'flags',
            'activity',
            'carp',
            'celebration',
            'entertainment',
            'flag',
            'streamer',
        ],
    },
    {
        name: 'wind_chime',
        code: '🎐',
        keywords: [
            'wind_chime',
            'activity',
            'bell',
            'celebration',
            'chime',
            'entertainment',
            'wind',
        ],
    },
    {
        name: 'rice_scene',
        code: '🎑',
        keywords: [
            'rice_scene',
            'activity',
            'celebration',
            'ceremony',
            'entertainment',
            'moon',
        ],
    },
    {
        name: 'red_envelope',
        code: '🧧',
        keywords: [
            'red_envelope',
        ],
    },
    {
        name: 'ribbon',
        code: '🎀',
        keywords: [
            'ribbon',
            'celebration',
        ],
    },
    {
        name: 'gift',
        code: '🎁',
        keywords: [
            'present',
            'birthday',
            'christmas',
            'gift',
            'box',
            'celebration',
            'entertainment',
            'wrapped',
        ],
    },
    {
        name: 'reminder_ribbon',
        code: '🎗️',
        keywords: [
            'reminder_ribbon',
        ],
    },
    {
        name: 'tickets',
        code: '🎟️',
        keywords: [
            'tickets',
        ],
    },
    {
        name: 'ticket',
        code: '🎫',
        keywords: [
            'ticket',
            'activity',
            'admission',
            'entertainment',
        ],
    },
    {
        name: 'medal_military',
        code: '🎖️',
        keywords: [
            'medal_military',
        ],
    },
    {
        name: 'trophy',
        code: '🏆',
        keywords: [
            'award',
            'contest',
            'winner',
            'trophy',
            'prize',
        ],
    },
    {
        name: 'medal_sports',
        code: '🏅',
        keywords: [
            'gold',
            'winner',
            'medal_sports',
            'medal',
        ],
    },
    {
        name: '1st_place_medal',
        code: '🥇',
        keywords: [
            'gold',
            '1st_place_medal',
            'first',
            'medal',
        ],
    },
    {
        name: '2nd_place_medal',
        code: '🥈',
        keywords: [
            'silver',
            '2nd_place_medal',
            'medal',
            'second',
        ],
    },
    {
        name: '3rd_place_medal',
        code: '🥉',
        keywords: [
            'bronze',
            '3rd_place_medal',
            'medal',
            'third',
        ],
    },
    {
        name: 'soccer',
        code: '⚽',
        keywords: [
            'sports',
            'soccer',
            'ball',
        ],
    },
    {
        name: 'baseball',
        code: '⚾',
        keywords: [
            'sports',
            'baseball',
            'ball',
        ],
    },
    {
        name: 'softball',
        code: '🥎',
        keywords: [
            'softball',
        ],
    },
    {
        name: 'basketball',
        code: '🏀',
        keywords: [
            'sports',
            'basketball',
            'ball',
            'hoop',
        ],
    },
    {
        name: 'volleyball',
        code: '🏐',
        keywords: [
            'volleyball',
            'ball',
            'game',
        ],
    },
    {
        name: 'football',
        code: '🏈',
        keywords: [
            'sports',
            'football',
            'american',
            'ball',
        ],
    },
    {
        name: 'rugby_football',
        code: '🏉',
        keywords: [
            'rugby_football',
            'ball',
            'football',
            'rugby',
        ],
    },
    {
        name: 'tennis',
        code: '🎾',
        keywords: [
            'sports',
            'tennis',
            'ball',
            'racquet',
        ],
    },
    {
        name: 'flying_disc',
        code: '🥏',
        keywords: [
            'flying_disc',
        ],
    },
    {
        name: 'bowling',
        code: '🎳',
        keywords: [
            'bowling',
            'ball',
            'game',
        ],
    },
    {
        name: 'cricket_game',
        code: '🏏',
        keywords: [
            'cricket_game',
            'ball',
            'bat',
            'cricket',
            'game',
        ],
    },
    {
        name: 'field_hockey',
        code: '🏑',
        keywords: [
            'field_hockey',
            'ball',
            'field',
            'game',
            'hockey',
            'stick',
        ],
    },
    {
        name: 'ice_hockey',
        code: '🏒',
        keywords: [
            'ice_hockey',
            'game',
            'hockey',
            'ice',
            'puck',
            'stick',
        ],
    },
    {
        name: 'lacrosse',
        code: '🥍',
        keywords: [
            'lacrosse',
        ],
    },
    {
        name: 'ping_pong',
        code: '🏓',
        keywords: [
            'ping_pong',
            'ball',
            'bat',
            'game',
            'paddle',
            'table tennis',
        ],
    },
    {
        name: 'badminton',
        code: '🏸',
        keywords: [
            'badminton',
            'birdie',
            'game',
            'racquet',
            'shuttlecock',
        ],
    },
    {
        name: 'boxing_glove',
        code: '🥊',
        keywords: [
            'boxing_glove',
            'boxing',
            'glove',
        ],
    },
    {
        name: 'martial_arts_uniform',
        code: '🥋',
        keywords: [
            'martial_arts_uniform',
            'judo',
            'karate',
            'martial arts',
            'taekwondo',
            'uniform',
        ],
    },
    {
        name: 'goal_net',
        code: '🥅',
        keywords: [
            'goal_net',
            'goal',
            'net',
        ],
    },
    {
        name: 'golf',
        code: '⛳',
        keywords: [
            'golf',
            'flag',
            'hole',
        ],
    },
    {
        name: 'ice_skate',
        code: '⛸️',
        keywords: [
            'skating',
            'ice_skate',
        ],
    },
    {
        name: 'fishing_pole_and_fish',
        code: '🎣',
        keywords: [
            'fishing_pole_and_fish',
            'entertainment',
            'fish',
            'pole',
        ],
    },
    {
        name: 'diving_mask',
        code: '🤿',
        keywords: [
            'diving_mask',
        ],
    },
    {
        name: 'running_shirt_with_sash',
        code: '🎽',
        keywords: [
            'marathon',
            'running_shirt_with_sash',
            'running',
            'sash',
            'shirt',
        ],
    },
    {
        name: 'ski',
        code: '🎿',
        keywords: [
            'ski',
            'snow',
        ],
    },
    {
        name: 'sled',
        code: '🛷',
        keywords: [
            'sled',
        ],
    },
    {
        name: 'curling_stone',
        code: '🥌',
        keywords: [
            'curling_stone',
        ],
    },
    {
        name: 'dart',
        code: '🎯',
        keywords: [
            'target',
            'dart',
            'activity',
            'bull',
            'bullseye',
            'entertainment',
            'eye',
            'game',
            'hit',
        ],
    },
    {
        name: 'yo_yo',
        code: '🪀',
        keywords: [
            'yo_yo',
        ],
    },
    {
        name: 'kite',
        code: '🪁',
        keywords: [
            'kite',
        ],
    },
    {
        name: '8ball',
        code: '🎱',
        keywords: [
            'pool',
            'billiards',
            '8ball',
            '8',
            '8 ball',
            'ball',
            'billiard',
            'eight',
            'game',
        ],
    },
    {
        name: 'crystal_ball',
        code: '🔮',
        keywords: [
            'fortune',
            'crystal_ball',
            'ball',
            'crystal',
            'fairy tale',
            'fantasy',
            'tool',
        ],
    },
    {
        name: 'magic_wand',
        code: '🪄',
        keywords: [
            'magic_wand',
        ],
    },
    {
        name: 'nazar_amulet',
        code: '🧿',
        keywords: [
            'nazar_amulet',
        ],
    },
    {
        name: 'video_game',
        code: '🎮',
        keywords: [
            'play',
            'controller',
            'console',
            'video_game',
            'entertainment',
            'game',
            'video game',
        ],
    },
    {
        name: 'joystick',
        code: '🕹️',
        keywords: [
            'joystick',
        ],
    },
    {
        name: 'slot_machine',
        code: '🎰',
        keywords: [
            'slot_machine',
            'activity',
            'game',
            'slot',
        ],
    },
    {
        name: 'game_die',
        code: '🎲',
        keywords: [
            'dice',
            'gambling',
            'game_die',
            'die',
            'entertainment',
            'game',
        ],
    },
    {
        name: 'jigsaw',
        code: '🧩',
        keywords: [
            'jigsaw',
        ],
    },
    {
        name: 'teddy_bear',
        code: '🧸',
        keywords: [
            'teddy_bear',
        ],
    },
    {
        name: 'pinata',
        code: '🪅',
        keywords: [
            'pinata',
        ],
    },
    {
        name: 'nesting_dolls',
        code: '🪆',
        keywords: [
            'nesting_dolls',
        ],
    },
    {
        name: 'spades',
        code: '♠️',
        keywords: [
            'spades',
            'card',
            'game',
            'spade',
            'suit',
        ],
    },
    {
        name: 'hearts',
        code: '♥️',
        keywords: [
            'hearts',
            'card',
            'game',
            'heart',
            'suit',
        ],
    },
    {
        name: 'diamonds',
        code: '♦️',
        keywords: [
            'diamonds',
            'card',
            'diamond',
            'game',
            'suit',
        ],
    },
    {
        name: 'clubs',
        code: '♣️',
        keywords: [
            'clubs',
            'card',
            'club',
            'game',
            'suit',
        ],
    },
    {
        name: 'chess_pawn',
        code: '♟️',
        keywords: [
            'chess_pawn',
        ],
    },
    {
        name: 'black_joker',
        code: '🃏',
        keywords: [
            'black_joker',
            'card',
            'entertainment',
            'game',
            'joker',
            'playing',
        ],
    },
    {
        name: 'mahjong',
        code: '🀄',
        keywords: [
            'mahjong',
            'game',
            'red',
        ],
    },
    {
        name: 'flower_playing_cards',
        code: '🎴',
        keywords: [
            'flower_playing_cards',
            'activity',
            'card',
            'entertainment',
            'flower',
            'game',
            'japanese',
            'playing',
        ],
    },
    {
        name: 'performing_arts',
        code: '🎭',
        keywords: [
            'theater',
            'drama',
            'performing_arts',
            'activity',
            'art',
            'entertainment',
            'mask',
            'performing',
            'theatre',
        ],
    },
    {
        name: 'framed_picture',
        code: '🖼️',
        keywords: [
            'framed_picture',
        ],
    },
    {
        name: 'art',
        code: '🎨',
        keywords: [
            'design',
            'paint',
            'art',
            'activity',
            'entertainment',
            'museum',
            'painting',
            'palette',
        ],
    },
    {
        name: 'thread',
        code: '🧵',
        keywords: [
            'thread',
        ],
    },
    {
        name: 'sewing_needle',
        code: '🪡',
        keywords: [
            'sewing_needle',
        ],
    },
    {
        name: 'yarn',
        code: '🧶',
        keywords: [
            'yarn',
        ],
    },
    {
        name: 'knot',
        code: '🪢',
        keywords: [
            'knot',
        ],
    },
    {
        code: 'objects',
        header: true,
    },
    {
        name: 'eyeglasses',
        code: '👓',
        keywords: [
            'glasses',
            'eyeglasses',
            'clothing',
            'eye',
            'eyewear',
        ],
    },
    {
        name: 'dark_sunglasses',
        code: '🕶️',
        keywords: [
            'dark_sunglasses',
        ],
    },
    {
        name: 'goggles',
        code: '🥽',
        keywords: [
            'goggles',
        ],
    },
    {
        name: 'lab_coat',
        code: '🥼',
        keywords: [
            'lab_coat',
        ],
    },
    {
        name: 'safety_vest',
        code: '🦺',
        keywords: [
            'safety_vest',
        ],
    },
    {
        name: 'necktie',
        code: '👔',
        keywords: [
            'shirt',
            'formal',
            'necktie',
            'clothing',
        ],
    },
    {
        name: 'shirt',
        code: '👕',
        keywords: [
            'shirt',
            'tshirt',
            'clothing',
        ],
    },
    {
        name: 'jeans',
        code: '👖',
        keywords: [
            'pants',
            'jeans',
            'clothing',
            'trousers',
        ],
    },
    {
        name: 'scarf',
        code: '🧣',
        keywords: [
            'scarf',
        ],
    },
    {
        name: 'gloves',
        code: '🧤',
        keywords: [
            'gloves',
        ],
    },
    {
        name: 'coat',
        code: '🧥',
        keywords: [
            'coat',
        ],
    },
    {
        name: 'socks',
        code: '🧦',
        keywords: [
            'socks',
        ],
    },
    {
        name: 'dress',
        code: '👗',
        keywords: [
            'dress',
            'clothing',
        ],
    },
    {
        name: 'kimono',
        code: '👘',
        keywords: [
            'kimono',
            'clothing',
        ],
    },
    {
        name: 'sari',
        code: '🥻',
        keywords: [
            'sari',
        ],
    },
    {
        name: 'one_piece_swimsuit',
        code: '🩱',
        keywords: [
            'one_piece_swimsuit',
        ],
    },
    {
        name: 'swim_brief',
        code: '🩲',
        keywords: [
            'swim_brief',
        ],
    },
    {
        name: 'shorts',
        code: '🩳',
        keywords: [
            'shorts',
        ],
    },
    {
        name: 'bikini',
        code: '👙',
        keywords: [
            'beach',
            'bikini',
            'clothing',
            'swim',
        ],
    },
    {
        name: 'womans_clothes',
        code: '👚',
        keywords: [
            'womans_clothes',
            'clothing',
            'woman',
        ],
    },
    {
        name: 'purse',
        code: '👛',
        keywords: [
            'purse',
            'clothing',
            'coin',
        ],
    },
    {
        name: 'handbag',
        code: '👜',
        keywords: [
            'bag',
            'handbag',
            'clothing',
        ],
    },
    {
        name: 'pouch',
        code: '👝',
        keywords: [
            'bag',
            'pouch',
            'clothing',
        ],
    },
    {
        name: 'shopping',
        code: '🛍️',
        keywords: [
            'bags',
            'shopping',
        ],
    },
    {
        name: 'school_satchel',
        code: '🎒',
        keywords: [
            'school_satchel',
            'activity',
            'bag',
            'satchel',
            'school',
        ],
    },
    {
        name: 'thong_sandal',
        code: '🩴',
        keywords: [
            'thong_sandal',
        ],
    },
    {
        name: 'mans_shoe',
        code: '👞',
        keywords: [
            'mans_shoe',
            'shoe',
            'clothing',
            'man',
        ],
    },
    {
        name: 'athletic_shoe',
        code: '👟',
        keywords: [
            'sneaker',
            'sport',
            'running',
            'athletic_shoe',
            'athletic',
            'clothing',
            'shoe',
        ],
    },
    {
        name: 'hiking_boot',
        code: '🥾',
        keywords: [
            'hiking_boot',
        ],
    },
    {
        name: 'flat_shoe',
        code: '🥿',
        keywords: [
            'flat_shoe',
        ],
    },
    {
        name: 'high_heel',
        code: '👠',
        keywords: [
            'shoe',
            'high_heel',
            'clothing',
            'heel',
            'woman',
        ],
    },
    {
        name: 'sandal',
        code: '👡',
        keywords: [
            'shoe',
            'sandal',
            'clothing',
            'woman',
        ],
    },
    {
        name: 'ballet_shoes',
        code: '🩰',
        keywords: [
            'ballet_shoes',
        ],
    },
    {
        name: 'boot',
        code: '👢',
        keywords: [
            'boot',
            'clothing',
            'shoe',
            'woman',
        ],
    },
    {
        name: 'crown',
        code: '👑',
        keywords: [
            'king',
            'queen',
            'royal',
            'crown',
            'clothing',
        ],
    },
    {
        name: 'womans_hat',
        code: '👒',
        keywords: [
            'womans_hat',
            'clothing',
            'hat',
            'woman',
        ],
    },
    {
        name: 'tophat',
        code: '🎩',
        keywords: [
            'hat',
            'classy',
            'tophat',
            'activity',
            'clothing',
            'entertainment',
            'top',
        ],
    },
    {
        name: 'mortar_board',
        code: '🎓',
        keywords: [
            'education',
            'college',
            'university',
            'graduation',
            'mortar_board',
            'activity',
            'cap',
            'celebration',
            'clothing',
            'hat',
        ],
    },
    {
        name: 'billed_cap',
        code: '🧢',
        keywords: [
            'billed_cap',
        ],
    },
    {
        name: 'military_helmet',
        code: '🪖',
        keywords: [
            'military_helmet',
        ],
    },
    {
        name: 'rescue_worker_helmet',
        code: '⛑️',
        keywords: [
            'rescue_worker_helmet',
        ],
    },
    {
        name: 'prayer_beads',
        code: '📿',
        keywords: [
            'prayer_beads',
            'beads',
            'clothing',
            'necklace',
            'prayer',
            'religion',
        ],
    },
    {
        name: 'lipstick',
        code: '💄',
        keywords: [
            'makeup',
            'lipstick',
            'cosmetics',
        ],
    },
    {
        name: 'ring',
        code: '💍',
        keywords: [
            'wedding',
            'marriage',
            'engaged',
            'ring',
            'diamond',
            'romance',
        ],
    },
    {
        name: 'gem',
        code: '💎',
        keywords: [
            'diamond',
            'gem',
            'jewel',
            'romance',
        ],
    },
    {
        name: 'mute',
        code: '🔇',
        keywords: [
            'sound',
            'volume',
            'mute',
            'quiet',
            'silent',
            'speaker',
        ],
    },
    {
        name: 'speaker',
        code: '🔈',
        keywords: [
            'speaker',
            'volume',
        ],
    },
    {
        name: 'sound',
        code: '🔉',
        keywords: [
            'volume',
            'sound',
            'low',
            'speaker',
            'wave',
        ],
    },
    {
        name: 'loud_sound',
        code: '🔊',
        keywords: [
            'volume',
            'loud_sound',
            '3',
            'entertainment',
            'high',
            'loud',
            'speaker',
            'three',
        ],
    },
    {
        name: 'loudspeaker',
        code: '📢',
        keywords: [
            'announcement',
            'loudspeaker',
            'communication',
            'loud',
            'public address',
        ],
    },
    {
        name: 'mega',
        code: '📣',
        keywords: [
            'mega',
            'cheering',
            'communication',
            'megaphone',
        ],
    },
    {
        name: 'postal_horn',
        code: '📯',
        keywords: [
            'postal_horn',
            'communication',
            'entertainment',
            'horn',
            'post',
            'postal',
        ],
    },
    {
        name: 'bell',
        code: '🔔',
        keywords: [
            'sound',
            'notification',
            'bell',
        ],
    },
    {
        name: 'no_bell',
        code: '🔕',
        keywords: [
            'volume',
            'off',
            'no_bell',
            'bell',
            'forbidden',
            'mute',
            'no',
            'not',
            'prohibited',
            'quiet',
            'silent',
        ],
    },
    {
        name: 'musical_score',
        code: '🎼',
        keywords: [
            'musical_score',
            'activity',
            'entertainment',
            'music',
            'score',
        ],
    },
    {
        name: 'musical_note',
        code: '🎵',
        keywords: [
            'musical_note',
            'activity',
            'entertainment',
            'music',
            'note',
        ],
    },
    {
        name: 'notes',
        code: '🎶',
        keywords: [
            'music',
            'notes',
            'activity',
            'entertainment',
            'note',
        ],
    },
    {
        name: 'studio_microphone',
        code: '🎙️',
        keywords: [
            'podcast',
            'studio_microphone',
        ],
    },
    {
        name: 'level_slider',
        code: '🎚️',
        keywords: [
            'level_slider',
        ],
    },
    {
        name: 'control_knobs',
        code: '🎛️',
        keywords: [
            'control_knobs',
        ],
    },
    {
        name: 'microphone',
        code: '🎤',
        keywords: [
            'sing',
            'microphone',
            'activity',
            'entertainment',
            'karaoke',
            'mic',
        ],
    },
    {
        name: 'headphones',
        code: '🎧',
        keywords: [
            'music',
            'earphones',
            'headphones',
            'activity',
            'earbud',
            'entertainment',
            'headphone',
        ],
    },
    {
        name: 'radio',
        code: '📻',
        keywords: [
            'podcast',
            'radio',
            'entertainment',
            'video',
        ],
    },
    {
        name: 'saxophone',
        code: '🎷',
        keywords: [
            'saxophone',
            'activity',
            'entertainment',
            'instrument',
            'music',
            'sax',
        ],
    },
    {
        name: 'accordion',
        code: '🪗',
        keywords: [
            'accordion',
        ],
    },
    {
        name: 'guitar',
        code: '🎸',
        keywords: [
            'rock',
            'guitar',
            'activity',
            'entertainment',
            'instrument',
            'music',
        ],
    },
    {
        name: 'musical_keyboard',
        code: '🎹',
        keywords: [
            'piano',
            'musical_keyboard',
            'activity',
            'entertainment',
            'instrument',
            'keyboard',
            'music',
        ],
    },
    {
        name: 'trumpet',
        code: '🎺',
        keywords: [
            'trumpet',
            'activity',
            'entertainment',
            'instrument',
            'music',
        ],
    },
    {
        name: 'violin',
        code: '🎻',
        keywords: [
            'violin',
            'activity',
            'entertainment',
            'instrument',
            'music',
        ],
    },
    {
        name: 'banjo',
        code: '🪕',
        keywords: [
            'banjo',
        ],
    },
    {
        name: 'drum',
        code: '🥁',
        keywords: [
            'drum',
            'drumsticks',
            'music',
        ],
    },
    {
        name: 'long_drum',
        code: '🪘',
        keywords: [
            'long_drum',
        ],
    },
    {
        name: 'iphone',
        code: '📱',
        keywords: [
            'smartphone',
            'mobile',
            'iphone',
            'cell',
            'communication',
            'phone',
            'telephone',
        ],
    },
    {
        name: 'calling',
        code: '📲',
        keywords: [
            'call',
            'incoming',
            'calling',
            'arrow',
            'cell',
            'communication',
            'mobile',
            'phone',
            'receive',
            'telephone',
        ],
    },
    {
        name: 'phone',
        code: '☎️',
        keywords: [
            'phone',
            'telephone',
        ],
    },
    {
        name: 'telephone_receiver',
        code: '📞',
        keywords: [
            'phone',
            'call',
            'telephone_receiver',
            'communication',
            'receiver',
            'telephone',
        ],
    },
    {
        name: 'pager',
        code: '📟',
        keywords: [
            'pager',
            'communication',
        ],
    },
    {
        name: 'fax',
        code: '📠',
        keywords: [
            'fax',
            'communication',
        ],
    },
    {
        name: 'battery',
        code: '🔋',
        keywords: [
            'power',
            'battery',
        ],
    },
    {
        name: 'electric_plug',
        code: '🔌',
        keywords: [
            'electric_plug',
            'electric',
            'electricity',
            'plug',
        ],
    },
    {
        name: 'computer',
        code: '💻',
        keywords: [
            'desktop',
            'screen',
            'computer',
            'pc',
            'personal',
        ],
    },
    {
        name: 'desktop_computer',
        code: '🖥️',
        keywords: [
            'desktop_computer',
        ],
    },
    {
        name: 'printer',
        code: '🖨️',
        keywords: [
            'printer',
        ],
    },
    {
        name: 'keyboard',
        code: '⌨️',
        keywords: [
            'keyboard',
            'computer',
        ],
    },
    {
        name: 'computer_mouse',
        code: '🖱️',
        keywords: [
            'computer_mouse',
        ],
    },
    {
        name: 'trackball',
        code: '🖲️',
        keywords: [
            'trackball',
        ],
    },
    {
        name: 'minidisc',
        code: '💽',
        keywords: [
            'minidisc',
            'computer',
            'disk',
            'entertainment',
            'minidisk',
            'optical',
        ],
    },
    {
        name: 'floppy_disk',
        code: '💾',
        keywords: [
            'save',
            'floppy_disk',
            'computer',
            'disk',
            'floppy',
        ],
    },
    {
        name: 'cd',
        code: '💿',
        keywords: [
            'cd',
            'blu-ray',
            'computer',
            'disk',
            'dvd',
            'optical',
        ],
    },
    {
        name: 'dvd',
        code: '📀',
        keywords: [
            'dvd',
            'blu-ray',
            'cd',
            'computer',
            'disk',
            'entertainment',
            'optical',
        ],
    },
    {
        name: 'abacus',
        code: '🧮',
        keywords: [
            'abacus',
        ],
    },
    {
        name: 'movie_camera',
        code: '🎥',
        keywords: [
            'film',
            'video',
            'movie_camera',
            'activity',
            'camera',
            'cinema',
            'entertainment',
            'movie',
        ],
    },
    {
        name: 'film_strip',
        code: '🎞️',
        keywords: [
            'film_strip',
        ],
    },
    {
        name: 'film_projector',
        code: '📽️',
        keywords: [
            'film_projector',
        ],
    },
    {
        name: 'clapper',
        code: '🎬',
        keywords: [
            'film',
            'clapper',
            'activity',
            'entertainment',
            'movie',
        ],
    },
    {
        name: 'tv',
        code: '📺',
        keywords: [
            'tv',
            'entertainment',
            'television',
            'video',
        ],
    },
    {
        name: 'camera',
        code: '📷',
        keywords: [
            'photo',
            'camera',
            'entertainment',
            'video',
        ],
    },
    {
        name: 'camera_flash',
        code: '📸',
        keywords: [
            'photo',
            'camera_flash',
            'camera',
            'flash',
            'video',
        ],
    },
    {
        name: 'video_camera',
        code: '📹',
        keywords: [
            'video_camera',
            'camera',
            'entertainment',
            'video',
        ],
    },
    {
        name: 'vhs',
        code: '📼',
        keywords: [
            'vhs',
            'entertainment',
            'tape',
            'video',
            'videocassette',
        ],
    },
    {
        name: 'mag',
        code: '🔍',
        keywords: [
            'search',
            'zoom',
            'mag',
            'glass',
            'magnifying',
            'tool',
        ],
    },
    {
        name: 'mag_right',
        code: '🔎',
        keywords: [
            'mag_right',
            'glass',
            'magnifying',
            'search',
            'tool',
        ],
    },
    {
        name: 'candle',
        code: '🕯️',
        keywords: [
            'candle',
        ],
    },
    {
        name: 'bulb',
        code: '💡',
        keywords: [
            'idea',
            'light',
            'bulb',
            'comic',
            'electric',
        ],
    },
    {
        name: 'flashlight',
        code: '🔦',
        keywords: [
            'flashlight',
            'electric',
            'light',
            'tool',
            'torch',
        ],
    },
    {
        name: 'izakaya_lantern',
        code: '🏮',
        keywords: [
            'izakaya_lantern',
            'lantern',
            'bar',
            'japanese',
            'light',
            'red',
        ],
    },
    {
        name: 'diya_lamp',
        code: '🪔',
        keywords: [
            'diya_lamp',
        ],
    },
    {
        name: 'notebook_with_decorative_cover',
        code: '📔',
        keywords: [
            'notebook_with_decorative_cover',
            'book',
            'cover',
            'decorated',
            'notebook',
        ],
    },
    {
        name: 'closed_book',
        code: '📕',
        keywords: [
            'closed_book',
            'book',
            'closed',
        ],
    },
    {
        name: 'book',
        code: '📖',
        keywords: [
            'book',
            'open_book',
            'open',
        ],
    },
    {
        name: 'green_book',
        code: '📗',
        keywords: [
            'green_book',
            'book',
            'green',
        ],
    },
    {
        name: 'blue_book',
        code: '📘',
        keywords: [
            'blue_book',
            'blue',
            'book',
        ],
    },
    {
        name: 'orange_book',
        code: '📙',
        keywords: [
            'orange_book',
            'book',
            'orange',
        ],
    },
    {
        name: 'books',
        code: '📚',
        keywords: [
            'library',
            'books',
            'book',
        ],
    },
    {
        name: 'notebook',
        code: '📓',
        keywords: [
            'notebook',
        ],
    },
    {
        name: 'ledger',
        code: '📒',
        keywords: [
            'ledger',
            'notebook',
        ],
    },
    {
        name: 'page_with_curl',
        code: '📃',
        keywords: [
            'page_with_curl',
            'curl',
            'document',
            'page',
        ],
    },
    {
        name: 'scroll',
        code: '📜',
        keywords: [
            'document',
            'scroll',
            'paper',
        ],
    },
    {
        name: 'page_facing_up',
        code: '📄',
        keywords: [
            'document',
            'page_facing_up',
            'page',
        ],
    },
    {
        name: 'newspaper',
        code: '📰',
        keywords: [
            'press',
            'newspaper',
            'communication',
            'news',
            'paper',
        ],
    },
    {
        name: 'newspaper_roll',
        code: '🗞️',
        keywords: [
            'press',
            'newspaper_roll',
        ],
    },
    {
        name: 'bookmark_tabs',
        code: '📑',
        keywords: [
            'bookmark_tabs',
            'bookmark',
            'mark',
            'marker',
            'tabs',
        ],
    },
    {
        name: 'bookmark',
        code: '🔖',
        keywords: [
            'bookmark',
            'mark',
        ],
    },
    {
        name: 'label',
        code: '🏷️',
        keywords: [
            'tag',
            'label',
        ],
    },
    {
        name: 'moneybag',
        code: '💰',
        keywords: [
            'dollar',
            'cream',
            'moneybag',
            'bag',
            'money',
        ],
    },
    {
        name: 'coin',
        code: '🪙',
        keywords: [
            'coin',
        ],
    },
    {
        name: 'yen',
        code: '💴',
        keywords: [
            'yen',
            'bank',
            'banknote',
            'bill',
            'currency',
            'money',
            'note',
        ],
    },
    {
        name: 'dollar',
        code: '💵',
        keywords: [
            'money',
            'dollar',
            'bank',
            'banknote',
            'bill',
            'currency',
            'note',
        ],
    },
    {
        name: 'euro',
        code: '💶',
        keywords: [
            'euro',
            'bank',
            'banknote',
            'bill',
            'currency',
            'money',
            'note',
        ],
    },
    {
        name: 'pound',
        code: '💷',
        keywords: [
            'pound',
            'bank',
            'banknote',
            'bill',
            'currency',
            'money',
            'note',
        ],
    },
    {
        name: 'money_with_wings',
        code: '💸',
        keywords: [
            'dollar',
            'money_with_wings',
            'bank',
            'banknote',
            'bill',
            'fly',
            'money',
            'note',
            'wings',
        ],
    },
    {
        name: 'credit_card',
        code: '💳',
        keywords: [
            'subscription',
            'credit_card',
            'bank',
            'card',
            'credit',
            'money',
        ],
    },
    {
        name: 'receipt',
        code: '🧾',
        keywords: [
            'receipt',
        ],
    },
    {
        name: 'chart',
        code: '💹',
        keywords: [
            'chart',
            'bank',
            'currency',
            'graph',
            'growth',
            'market',
            'money',
            'rise',
            'trend',
            'upward',
            'yen',
        ],
    },
    {
        name: 'envelope',
        code: '✉️',
        keywords: [
            'letter',
            'email',
            'envelope',
            'e-mail',
        ],
    },
    {
        name: 'email',
        code: '📧',
        keywords: [
            'email',
            'e-mail',
            'communication',
            'letter',
            'mail',
        ],
    },
    {
        name: 'incoming_envelope',
        code: '📨',
        keywords: [
            'incoming_envelope',
            'communication',
            'e-mail',
            'email',
            'envelope',
            'incoming',
            'letter',
            'mail',
            'receive',
        ],
    },
    {
        name: 'envelope_with_arrow',
        code: '📩',
        keywords: [
            'envelope_with_arrow',
            'arrow',
            'communication',
            'down',
            'e-mail',
            'email',
            'envelope',
            'letter',
            'mail',
            'outgoing',
            'sent',
        ],
    },
    {
        name: 'outbox_tray',
        code: '📤',
        keywords: [
            'outbox_tray',
            'box',
            'communication',
            'letter',
            'mail',
            'outbox',
            'sent',
            'tray',
        ],
    },
    {
        name: 'inbox_tray',
        code: '📥',
        keywords: [
            'inbox_tray',
            'box',
            'communication',
            'inbox',
            'letter',
            'mail',
            'receive',
            'tray',
        ],
    },
    {
        name: 'package',
        code: '📦',
        keywords: [
            'shipping',
            'package',
            'box',
            'communication',
            'parcel',
        ],
    },
    {
        name: 'mailbox',
        code: '📫',
        keywords: [
            'mailbox',
            'closed',
            'communication',
            'flag',
            'mail',
            'postbox',
        ],
    },
    {
        name: 'mailbox_closed',
        code: '📪',
        keywords: [
            'mailbox_closed',
            'closed',
            'communication',
            'flag',
            'lowered',
            'mail',
            'mailbox',
            'postbox',
        ],
    },
    {
        name: 'mailbox_with_mail',
        code: '📬',
        keywords: [
            'mailbox_with_mail',
            'communication',
            'flag',
            'mail',
            'mailbox',
            'open',
            'postbox',
        ],
    },
    {
        name: 'mailbox_with_no_mail',
        code: '📭',
        keywords: [
            'mailbox_with_no_mail',
            'communication',
            'flag',
            'lowered',
            'mail',
            'mailbox',
            'open',
            'postbox',
        ],
    },
    {
        name: 'postbox',
        code: '📮',
        keywords: [
            'postbox',
            'communication',
            'mail',
            'mailbox',
        ],
    },
    {
        name: 'ballot_box',
        code: '🗳️',
        keywords: [
            'ballot_box',
        ],
    },
    {
        name: 'pencil2',
        code: '✏️',
        keywords: [
            'pencil2',
        ],
    },
    {
        name: 'black_nib',
        code: '✒️',
        keywords: [
            'black_nib',
            'nib',
            'pen',
        ],
    },
    {
        name: 'fountain_pen',
        code: '🖋️',
        keywords: [
            'fountain_pen',
        ],
    },
    {
        name: 'pen',
        code: '🖊️',
        keywords: [
            'pen',
        ],
    },
    {
        name: 'paintbrush',
        code: '🖌️',
        keywords: [
            'paintbrush',
        ],
    },
    {
        name: 'crayon',
        code: '🖍️',
        keywords: [
            'crayon',
        ],
    },
    {
        name: 'memo',
        code: '📝',
        keywords: [
            'document',
            'note',
            'memo',
            'pencil',
            'communication',
        ],
    },
    {
        name: 'briefcase',
        code: '💼',
        keywords: [
            'business',
            'briefcase',
        ],
    },
    {
        name: 'file_folder',
        code: '📁',
        keywords: [
            'directory',
            'file_folder',
            'file',
            'folder',
        ],
    },
    {
        name: 'open_file_folder',
        code: '📂',
        keywords: [
            'open_file_folder',
            'file',
            'folder',
            'open',
        ],
    },
    {
        name: 'card_index_dividers',
        code: '🗂️',
        keywords: [
            'card_index_dividers',
        ],
    },
    {
        name: 'date',
        code: '📅',
        keywords: [
            'calendar',
            'schedule',
            'date',
        ],
    },
    {
        name: 'calendar',
        code: '📆',
        keywords: [
            'schedule',
            'calendar',
        ],
    },
    {
        name: 'spiral_notepad',
        code: '🗒️',
        keywords: [
            'spiral_notepad',
        ],
    },
    {
        name: 'spiral_calendar',
        code: '🗓️',
        keywords: [
            'spiral_calendar',
        ],
    },
    {
        name: 'card_index',
        code: '📇',
        keywords: [
            'card_index',
            'card',
            'index',
            'rolodex',
        ],
    },
    {
        name: 'chart_with_upwards_trend',
        code: '📈',
        keywords: [
            'graph',
            'metrics',
            'chart_with_upwards_trend',
            'chart',
            'growth',
            'trend',
            'upward',
        ],
    },
    {
        name: 'chart_with_downwards_trend',
        code: '📉',
        keywords: [
            'graph',
            'metrics',
            'chart_with_downwards_trend',
            'chart',
            'down',
            'trend',
        ],
    },
    {
        name: 'bar_chart',
        code: '📊',
        keywords: [
            'stats',
            'metrics',
            'bar_chart',
            'bar',
            'chart',
            'graph',
        ],
    },
    {
        name: 'clipboard',
        code: '📋',
        keywords: [
            'clipboard',
        ],
    },
    {
        name: 'pushpin',
        code: '📌',
        keywords: [
            'location',
            'pushpin',
            'pin',
        ],
    },
    {
        name: 'round_pushpin',
        code: '📍',
        keywords: [
            'location',
            'round_pushpin',
            'pin',
            'pushpin',
        ],
    },
    {
        name: 'paperclip',
        code: '📎',
        keywords: [
            'paperclip',
        ],
    },
    {
        name: 'paperclips',
        code: '🖇️',
        keywords: [
            'paperclips',
        ],
    },
    {
        name: 'straight_ruler',
        code: '📏',
        keywords: [
            'straight_ruler',
            'ruler',
            'straight edge',
        ],
    },
    {
        name: 'triangular_ruler',
        code: '📐',
        keywords: [
            'triangular_ruler',
            'ruler',
            'set',
            'triangle',
        ],
    },
    {
        name: 'scissors',
        code: '✂️',
        keywords: [
            'cut',
            'scissors',
            'tool',
        ],
    },
    {
        name: 'card_file_box',
        code: '🗃️',
        keywords: [
            'card_file_box',
        ],
    },
    {
        name: 'file_cabinet',
        code: '🗄️',
        keywords: [
            'file_cabinet',
        ],
    },
    {
        name: 'wastebasket',
        code: '🗑️',
        keywords: [
            'trash',
            'wastebasket',
        ],
    },
    {
        name: 'lock',
        code: '🔒',
        keywords: [
            'security',
            'private',
            'lock',
            'closed',
        ],
    },
    {
        name: 'unlock',
        code: '🔓',
        keywords: [
            'security',
            'unlock',
            'lock',
            'open',
        ],
    },
    {
        name: 'lock_with_ink_pen',
        code: '🔏',
        keywords: [
            'lock_with_ink_pen',
            'ink',
            'lock',
            'nib',
            'pen',
            'privacy',
        ],
    },
    {
        name: 'closed_lock_with_key',
        code: '🔐',
        keywords: [
            'security',
            'closed_lock_with_key',
            'closed',
            'key',
            'lock',
            'secure',
        ],
    },
    {
        name: 'key',
        code: '🔑',
        keywords: [
            'lock',
            'password',
            'key',
        ],
    },
    {
        name: 'old_key',
        code: '🗝️',
        keywords: [
            'old_key',
        ],
    },
    {
        name: 'hammer',
        code: '🔨',
        keywords: [
            'tool',
            'hammer',
        ],
    },
    {
        name: 'axe',
        code: '🪓',
        keywords: [
            'axe',
        ],
    },
    {
        name: 'pick',
        code: '⛏️',
        keywords: [
            'pick',
        ],
    },
    {
        name: 'hammer_and_pick',
        code: '⚒️',
        keywords: [
            'hammer_and_pick',
            'hammer',
            'pick',
            'tool',
        ],
    },
    {
        name: 'hammer_and_wrench',
        code: '🛠️',
        keywords: [
            'hammer_and_wrench',
        ],
    },
    {
        name: 'dagger',
        code: '🗡️',
        keywords: [
            'dagger',
        ],
    },
    {
        name: 'crossed_swords',
        code: '⚔️',
        keywords: [
            'crossed_swords',
            'crossed',
            'swords',
            'weapon',
        ],
    },
    {
        name: 'gun',
        code: '🔫',
        keywords: [
            'shoot',
            'weapon',
            'gun',
            'handgun',
            'pistol',
            'revolver',
            'tool',
        ],
    },
    {
        name: 'boomerang',
        code: '🪃',
        keywords: [
            'boomerang',
        ],
    },
    {
        name: 'bow_and_arrow',
        code: '🏹',
        keywords: [
            'archery',
            'bow_and_arrow',
            'archer',
            'arrow',
            'bow',
            'sagittarius',
            'tool',
            'weapon',
            'zodiac',
        ],
    },
    {
        name: 'shield',
        code: '🛡️',
        keywords: [
            'shield',
        ],
    },
    {
        name: 'carpentry_saw',
        code: '🪚',
        keywords: [
            'carpentry_saw',
        ],
    },
    {
        name: 'wrench',
        code: '🔧',
        keywords: [
            'tool',
            'wrench',
        ],
    },
    {
        name: 'screwdriver',
        code: '🪛',
        keywords: [
            'screwdriver',
        ],
    },
    {
        name: 'nut_and_bolt',
        code: '🔩',
        keywords: [
            'nut_and_bolt',
            'bolt',
            'nut',
            'tool',
        ],
    },
    {
        name: 'gear',
        code: '⚙️',
        keywords: [
            'gear',
            'tool',
        ],
    },
    {
        name: 'clamp',
        code: '🗜️',
        keywords: [
            'clamp',
        ],
    },
    {
        name: 'balance_scale',
        code: '⚖️',
        keywords: [
            'balance_scale',
            'balance',
            'justice',
            'libra',
            'scales',
            'tool',
            'weight',
            'zodiac',
        ],
    },
    {
        name: 'probing_cane',
        code: '🦯',
        keywords: [
            'probing_cane',
        ],
    },
    {
        name: 'link',
        code: '🔗',
        keywords: [
            'link',
        ],
    },
    {
        name: 'chains',
        code: '⛓️',
        keywords: [
            'chains',
        ],
    },
    {
        name: 'hook',
        code: '🪝',
        keywords: [
            'hook',
        ],
    },
    {
        name: 'toolbox',
        code: '🧰',
        keywords: [
            'toolbox',
        ],
    },
    {
        name: 'magnet',
        code: '🧲',
        keywords: [
            'magnet',
        ],
    },
    {
        name: 'ladder',
        code: '🪜',
        keywords: [
            'ladder',
        ],
    },
    {
        name: 'alembic',
        code: '⚗️',
        keywords: [
            'alembic',
            'chemistry',
            'tool',
        ],
    },
    {
        name: 'test_tube',
        code: '🧪',
        keywords: [
            'test_tube',
        ],
    },
    {
        name: 'petri_dish',
        code: '🧫',
        keywords: [
            'petri_dish',
        ],
    },
    {
        name: 'dna',
        code: '🧬',
        keywords: [
            'dna',
        ],
    },
    {
        name: 'microscope',
        code: '🔬',
        keywords: [
            'science',
            'laboratory',
            'investigate',
            'microscope',
            'tool',
        ],
    },
    {
        name: 'telescope',
        code: '🔭',
        keywords: [
            'telescope',
            'tool',
        ],
    },
    {
        name: 'satellite',
        code: '📡',
        keywords: [
            'signal',
            'satellite',
            'antenna',
            'communication',
            'dish',
        ],
    },
    {
        name: 'syringe',
        code: '💉',
        keywords: [
            'health',
            'hospital',
            'needle',
            'syringe',
            'doctor',
            'medicine',
            'shot',
            'sick',
            'tool',
        ],
    },
    {
        name: 'drop_of_blood',
        code: '🩸',
        keywords: [
            'drop_of_blood',
        ],
    },
    {
        name: 'pill',
        code: '💊',
        keywords: [
            'health',
            'medicine',
            'pill',
            'doctor',
            'sick',
        ],
    },
    {
        name: 'adhesive_bandage',
        code: '🩹',
        keywords: [
            'adhesive_bandage',
        ],
    },
    {
        name: 'stethoscope',
        code: '🩺',
        keywords: [
            'stethoscope',
        ],
    },
    {
        name: 'door',
        code: '🚪',
        keywords: [
            'door',
        ],
    },
    {
        name: 'elevator',
        code: '🛗',
        keywords: [
            'elevator',
        ],
    },
    {
        name: 'mirror',
        code: '🪞',
        keywords: [
            'mirror',
        ],
    },
    {
        name: 'window',
        code: '🪟',
        keywords: [
            'window',
        ],
    },
    {
        name: 'bed',
        code: '🛏️',
        keywords: [
            'bed',
        ],
    },
    {
        name: 'couch_and_lamp',
        code: '🛋️',
        keywords: [
            'couch_and_lamp',
        ],
    },
    {
        name: 'chair',
        code: '🪑',
        keywords: [
            'chair',
        ],
    },
    {
        name: 'toilet',
        code: '🚽',
        keywords: [
            'wc',
            'toilet',
        ],
    },
    {
        name: 'plunger',
        code: '🪠',
        keywords: [
            'plunger',
        ],
    },
    {
        name: 'shower',
        code: '🚿',
        keywords: [
            'bath',
            'shower',
            'water',
        ],
    },
    {
        name: 'bathtub',
        code: '🛁',
        keywords: [
            'bathtub',
            'bath',
        ],
    },
    {
        name: 'mouse_trap',
        code: '🪤',
        keywords: [
            'mouse_trap',
        ],
    },
    {
        name: 'razor',
        code: '🪒',
        keywords: [
            'razor',
        ],
    },
    {
        name: 'lotion_bottle',
        code: '🧴',
        keywords: [
            'lotion_bottle',
        ],
    },
    {
        name: 'safety_pin',
        code: '🧷',
        keywords: [
            'safety_pin',
        ],
    },
    {
        name: 'broom',
        code: '🧹',
        keywords: [
            'broom',
        ],
    },
    {
        name: 'basket',
        code: '🧺',
        keywords: [
            'basket',
        ],
    },
    {
        name: 'roll_of_paper',
        code: '🧻',
        keywords: [
            'toilet',
            'roll_of_paper',
        ],
    },
    {
        name: 'bucket',
        code: '🪣',
        keywords: [
            'bucket',
        ],
    },
    {
        name: 'soap',
        code: '🧼',
        keywords: [
            'soap',
        ],
    },
    {
        name: 'toothbrush',
        code: '🪥',
        keywords: [
            'toothbrush',
        ],
    },
    {
        name: 'sponge',
        code: '🧽',
        keywords: [
            'sponge',
        ],
    },
    {
        name: 'fire_extinguisher',
        code: '🧯',
        keywords: [
            'fire_extinguisher',
        ],
    },
    {
        name: 'shopping_cart',
        code: '🛒',
        keywords: [
            'shopping_cart',
            'cart',
            'shopping',
            'trolley',
        ],
    },
    {
        name: 'smoking',
        code: '🚬',
        keywords: [
            'cigarette',
            'smoking',
            'activity',
        ],
    },
    {
        name: 'coffin',
        code: '⚰️',
        keywords: [
            'funeral',
            'coffin',
        ],
    },
    {
        name: 'headstone',
        code: '🪦',
        keywords: [
            'headstone',
        ],
    },
    {
        name: 'funeral_urn',
        code: '⚱️',
        keywords: [
            'funeral_urn',
        ],
    },
    {
        name: 'moyai',
        code: '🗿',
        keywords: [
            'stone',
            'moyai',
            'face',
            'statue',
        ],
    },
    {
        name: 'placard',
        code: '🪧',
        keywords: [
            'placard',
        ],
    },
    {
        code: 'symbols',
        header: true,
    },
    {
        name: 'atm',
        code: '🏧',
        keywords: [
            'atm',
            'automated',
            'bank',
            'teller',
        ],
    },
    {
        name: 'put_litter_in_its_place',
        code: '🚮',
        keywords: [
            'put_litter_in_its_place',
            'litter',
            'litterbox',
        ],
    },
    {
        name: 'potable_water',
        code: '🚰',
        keywords: [
            'potable_water',
            'drink',
            'potable',
            'water',
        ],
    },
    {
        name: 'wheelchair',
        code: '♿',
        keywords: [
            'accessibility',
            'wheelchair',
            'access',
        ],
    },
    {
        name: 'mens',
        code: '🚹',
        keywords: [
            'mens',
            'lavatory',
            'man',
            'restroom',
            'wc',
        ],
    },
    {
        name: 'womens',
        code: '🚺',
        keywords: [
            'womens',
            'lavatory',
            'restroom',
            'wc',
            'woman',
        ],
    },
    {
        name: 'restroom',
        code: '🚻',
        keywords: [
            'toilet',
            'restroom',
            'lavatory',
            'wc',
        ],
    },
    {
        name: 'baby_symbol',
        code: '🚼',
        keywords: [
            'baby_symbol',
            'baby',
            'changing',
        ],
    },
    {
        name: 'wc',
        code: '🚾',
        keywords: [
            'toilet',
            'restroom',
            'wc',
            'closet',
            'lavatory',
            'water',
        ],
    },
    {
        name: 'passport_control',
        code: '🛂',
        keywords: [
            'passport_control',
            'control',
            'passport',
        ],
    },
    {
        name: 'customs',
        code: '🛃',
        keywords: [
            'customs',
        ],
    },
    {
        name: 'baggage_claim',
        code: '🛄',
        keywords: [
            'airport',
            'baggage_claim',
            'baggage',
            'claim',
        ],
    },
    {
        name: 'left_luggage',
        code: '🛅',
        keywords: [
            'left_luggage',
            'baggage',
            'left luggage',
            'locker',
            'luggage',
        ],
    },
    {
        name: 'warning',
        code: '⚠️',
        keywords: [
            'wip',
            'warning',
        ],
    },
    {
        name: 'children_crossing',
        code: '🚸',
        keywords: [
            'children_crossing',
            'child',
            'crossing',
            'pedestrian',
            'traffic',
        ],
    },
    {
        name: 'no_entry',
        code: '⛔',
        keywords: [
            'limit',
            'no_entry',
            'entry',
            'forbidden',
            'no',
            'not',
            'prohibited',
            'traffic',
        ],
    },
    {
        name: 'no_entry_sign',
        code: '🚫',
        keywords: [
            'block',
            'forbidden',
            'no_entry_sign',
            'entry',
            'no',
            'not',
            'prohibited',
        ],
    },
    {
        name: 'no_bicycles',
        code: '🚳',
        keywords: [
            'no_bicycles',
            'bicycle',
            'bike',
            'forbidden',
            'no',
            'not',
            'prohibited',
            'vehicle',
        ],
    },
    {
        name: 'no_smoking',
        code: '🚭',
        keywords: [
            'no_smoking',
            'forbidden',
            'no',
            'not',
            'prohibited',
            'smoking',
        ],
    },
    {
        name: 'do_not_litter',
        code: '🚯',
        keywords: [
            'do_not_litter',
            'forbidden',
            'litter',
            'no',
            'not',
            'prohibited',
        ],
    },
    {
        name: 'non-potable_water',
        code: '🚱',
        keywords: [
            'non-potable_water',
            'drink',
            'forbidden',
            'no',
            'not',
            'potable',
            'prohibited',
            'water',
        ],
    },
    {
        name: 'no_pedestrians',
        code: '🚷',
        keywords: [
            'no_pedestrians',
            'forbidden',
            'no',
            'not',
            'pedestrian',
            'prohibited',
        ],
    },
    {
        name: 'no_mobile_phones',
        code: '📵',
        keywords: [
            'no_mobile_phones',
            'cell',
            'communication',
            'forbidden',
            'mobile',
            'no',
            'not',
            'phone',
            'prohibited',
            'telephone',
        ],
    },
    {
        name: 'underage',
        code: '🔞',
        keywords: [
            'underage',
            '18',
            'age restriction',
            'eighteen',
            'forbidden',
            'no',
            'not',
            'prohibited',
        ],
    },
    {
        name: 'radioactive',
        code: '☢️',
        keywords: [
            'radioactive',
        ],
    },
    {
        name: 'biohazard',
        code: '☣️',
        keywords: [
            'biohazard',
        ],
    },
    {
        name: 'arrow_up',
        code: '⬆️',
        keywords: [
            'arrow_up',
        ],
    },
    {
        name: 'arrow_upper_right',
        code: '↗️',
        keywords: [
            'arrow_upper_right',
            'arrow',
            'direction',
            'intercardinal',
            'northeast',
        ],
    },
    {
        name: 'arrow_right',
        code: '➡️',
        keywords: [
            'arrow_right',
        ],
    },
    {
        name: 'arrow_lower_right',
        code: '↘️',
        keywords: [
            'arrow_lower_right',
            'arrow',
            'direction',
            'intercardinal',
            'southeast',
        ],
    },
    {
        name: 'arrow_down',
        code: '⬇️',
        keywords: [
            'arrow_down',
        ],
    },
    {
        name: 'arrow_lower_left',
        code: '↙️',
        keywords: [
            'arrow_lower_left',
            'arrow',
            'direction',
            'intercardinal',
            'southwest',
        ],
    },
    {
        name: 'arrow_left',
        code: '⬅️',
        keywords: [
            'arrow_left',
        ],
    },
    {
        name: 'arrow_upper_left',
        code: '↖️',
        keywords: [
            'arrow_upper_left',
            'arrow',
            'direction',
            'intercardinal',
            'northwest',
        ],
    },
    {
        name: 'arrow_up_down',
        code: '↕️',
        keywords: [
            'arrow_up_down',
            'arrow',
        ],
    },
    {
        name: 'left_right_arrow',
        code: '↔️',
        keywords: [
            'left_right_arrow',
            'arrow',
        ],
    },
    {
        name: 'leftwards_arrow_with_hook',
        code: '↩️',
        keywords: [
            'return',
            'leftwards_arrow_with_hook',
        ],
    },
    {
        name: 'arrow_right_hook',
        code: '↪️',
        keywords: [
            'arrow_right_hook',
        ],
    },
    {
        name: 'arrow_heading_up',
        code: '⤴️',
        keywords: [
            'arrow_heading_up',
            'arrow',
            'up',
        ],
    },
    {
        name: 'arrow_heading_down',
        code: '⤵️',
        keywords: [
            'arrow_heading_down',
            'arrow',
            'down',
        ],
    },
    {
        name: 'arrows_clockwise',
        code: '🔃',
        keywords: [
            'arrows_clockwise',
            'arrow',
            'clockwise',
            'reload',
        ],
    },
    {
        name: 'arrows_counterclockwise',
        code: '🔄',
        keywords: [
            'sync',
            'arrows_counterclockwise',
            'anticlockwise',
            'arrow',
            'counterclockwise',
            'withershins',
        ],
    },
    {
        name: 'back',
        code: '🔙',
        keywords: [
            'back',
            'arrow',
        ],
    },
    {
        name: 'end',
        code: '🔚',
        keywords: [
            'end',
            'arrow',
        ],
    },
    {
        name: 'on',
        code: '🔛',
        keywords: [
            'on',
            'arrow',
            'mark',
        ],
    },
    {
        name: 'soon',
        code: '🔜',
        keywords: [
            'soon',
            'arrow',
        ],
    },
    {
        name: 'top',
        code: '🔝',
        keywords: [
            'top',
            'arrow',
            'up',
        ],
    },
    {
        name: 'place_of_worship',
        code: '🛐',
        keywords: [
            'place_of_worship',
            'religion',
            'worship',
        ],
    },
    {
        name: 'atom_symbol',
        code: '⚛️',
        keywords: [
            'atom_symbol',
        ],
    },
    {
        name: 'om',
        code: '🕉️',
        keywords: [
            'om',
        ],
    },
    {
        name: 'star_of_david',
        code: '✡️',
        keywords: [
            'star_of_david',
            'david',
            'jew',
            'jewish',
            'religion',
            'star',
        ],
    },
    {
        name: 'wheel_of_dharma',
        code: '☸️',
        keywords: [
            'wheel_of_dharma',
            'buddhist',
            'dharma',
            'religion',
            'wheel',
        ],
    },
    {
        name: 'yin_yang',
        code: '☯️',
        keywords: [
            'yin_yang',
        ],
    },
    {
        name: 'latin_cross',
        code: '✝️',
        keywords: [
            'latin_cross',
        ],
    },
    {
        name: 'orthodox_cross',
        code: '☦️',
        keywords: [
            'orthodox_cross',
            'christian',
            'cross',
            'religion',
        ],
    },
    {
        name: 'star_and_crescent',
        code: '☪️',
        keywords: [
            'star_and_crescent',
        ],
    },
    {
        name: 'peace_symbol',
        code: '☮️',
        keywords: [
            'peace_symbol',
        ],
    },
    {
        name: 'menorah',
        code: '🕎',
        keywords: [
            'menorah',
            'candelabrum',
            'candlestick',
            'religion',
        ],
    },
    {
        name: 'six_pointed_star',
        code: '🔯',
        keywords: [
            'six_pointed_star',
            'fortune',
            'star',
        ],
    },
    {
        name: 'aries',
        code: '♈',
        keywords: [
            'aries',
            'ram',
            'zodiac',
        ],
    },
    {
        name: 'taurus',
        code: '♉',
        keywords: [
            'taurus',
            'bull',
            'ox',
            'zodiac',
        ],
    },
    {
        name: 'gemini',
        code: '♊',
        keywords: [
            'gemini',
            'twins',
            'zodiac',
        ],
    },
    {
        name: 'cancer',
        code: '♋',
        keywords: [
            'cancer',
            'crab',
            'zodiac',
        ],
    },
    {
        name: 'leo',
        code: '♌',
        keywords: [
            'leo',
            'lion',
            'zodiac',
        ],
    },
    {
        name: 'virgo',
        code: '♍',
        keywords: [
            'virgo',
            'maiden',
            'virgin',
            'zodiac',
        ],
    },
    {
        name: 'libra',
        code: '♎',
        keywords: [
            'libra',
            'balance',
            'justice',
            'scales',
            'zodiac',
        ],
    },
    {
        name: 'scorpius',
        code: '♏',
        keywords: [
            'scorpius',
            'scorpio',
            'scorpion',
            'zodiac',
        ],
    },
    {
        name: 'sagittarius',
        code: '♐',
        keywords: [
            'sagittarius',
            'archer',
            'zodiac',
        ],
    },
    {
        name: 'capricorn',
        code: '♑',
        keywords: [
            'capricorn',
            'goat',
            'zodiac',
        ],
    },
    {
        name: 'aquarius',
        code: '♒',
        keywords: [
            'aquarius',
            'bearer',
            'water',
            'zodiac',
        ],
    },
    {
        name: 'pisces',
        code: '♓',
        keywords: [
            'pisces',
            'fish',
            'zodiac',
        ],
    },
    {
        name: 'ophiuchus',
        code: '⛎',
        keywords: [
            'ophiuchus',
            'bearer',
            'serpent',
            'snake',
            'zodiac',
        ],
    },
    {
        name: 'twisted_rightwards_arrows',
        code: '🔀',
        keywords: [
            'shuffle',
            'twisted_rightwards_arrows',
            'arrow',
            'crossed',
        ],
    },
    {
        name: 'repeat',
        code: '🔁',
        keywords: [
            'loop',
            'repeat',
            'arrow',
            'clockwise',
        ],
    },
    {
        name: 'repeat_one',
        code: '🔂',
        keywords: [
            'repeat_one',
            'arrow',
            'clockwise',
            'once',
        ],
    },
    {
        name: 'arrow_forward',
        code: '▶️',
        keywords: [
            'arrow_forward',
        ],
    },
    {
        name: 'fast_forward',
        code: '⏩',
        keywords: [
            'fast_forward',
            'arrow',
            'double',
            'fast',
            'forward',
        ],
    },
    {
        name: 'next_track_button',
        code: '⏭️',
        keywords: [
            'next_track_button',
        ],
    },
    {
        name: 'play_or_pause_button',
        code: '⏯️',
        keywords: [
            'play_or_pause_button',
        ],
    },
    {
        name: 'arrow_backward',
        code: '◀️',
        keywords: [
            'arrow_backward',
        ],
    },
    {
        name: 'rewind',
        code: '⏪',
        keywords: [
            'rewind',
            'arrow',
            'double',
        ],
    },
    {
        name: 'previous_track_button',
        code: '⏮️',
        keywords: [
            'previous_track_button',
        ],
    },
    {
        name: 'arrow_up_small',
        code: '🔼',
        keywords: [
            'arrow_up_small',
            'arrow',
            'button',
            'red',
        ],
    },
    {
        name: 'arrow_double_up',
        code: '⏫',
        keywords: [
            'arrow_double_up',
            'arrow',
            'double',
        ],
    },
    {
        name: 'arrow_down_small',
        code: '🔽',
        keywords: [
            'arrow_down_small',
            'arrow',
            'button',
            'down',
            'red',
        ],
    },
    {
        name: 'arrow_double_down',
        code: '⏬',
        keywords: [
            'arrow_double_down',
            'arrow',
            'double',
            'down',
        ],
    },
    {
        name: 'pause_button',
        code: '⏸️',
        keywords: [
            'pause_button',
        ],
    },
    {
        name: 'stop_button',
        code: '⏹️',
        keywords: [
            'stop_button',
        ],
    },
    {
        name: 'record_button',
        code: '⏺️',
        keywords: [
            'record_button',
        ],
    },
    {
        name: 'eject_button',
        code: '⏏️',
        keywords: [
            'eject_button',
        ],
    },
    {
        name: 'cinema',
        code: '🎦',
        keywords: [
            'film',
            'movie',
            'cinema',
            'activity',
            'camera',
            'entertainment',
        ],
    },
    {
        name: 'low_brightness',
        code: '🔅',
        keywords: [
            'low_brightness',
            'brightness',
            'dim',
            'low',
        ],
    },
    {
        name: 'high_brightness',
        code: '🔆',
        keywords: [
            'high_brightness',
            'bright',
            'brightness',
        ],
    },
    {
        name: 'signal_strength',
        code: '📶',
        keywords: [
            'wifi',
            'signal_strength',
            'antenna',
            'bar',
            'cell',
            'communication',
            'mobile',
            'phone',
            'signal',
            'telephone',
        ],
    },
    {
        name: 'vibration_mode',
        code: '📳',
        keywords: [
            'vibration_mode',
            'cell',
            'communication',
            'mobile',
            'mode',
            'phone',
            'telephone',
            'vibration',
        ],
    },
    {
        name: 'mobile_phone_off',
        code: '📴',
        keywords: [
            'mute',
            'off',
            'mobile_phone_off',
            'cell',
            'communication',
            'mobile',
            'phone',
            'telephone',
        ],
    },
    {
        name: 'female_sign',
        code: '♀️',
        keywords: [
            'female_sign',
        ],
    },
    {
        name: 'male_sign',
        code: '♂️',
        keywords: [
            'male_sign',
        ],
    },
    {
        name: 'transgender_symbol',
        code: '⚧️',
        keywords: [
            'transgender_symbol',
        ],
    },
    {
        name: 'heavy_multiplication_x',
        code: '✖️',
        keywords: [
            'heavy_multiplication_x',
            'cancel',
            'multiplication',
            'multiply',
            'x',
        ],
    },
    {
        name: 'heavy_plus_sign',
        code: '➕',
        keywords: [
            'heavy_plus_sign',
            'math',
            'plus',
        ],
    },
    {
        name: 'heavy_minus_sign',
        code: '➖',
        keywords: [
            'heavy_minus_sign',
            'math',
            'minus',
        ],
    },
    {
        name: 'heavy_division_sign',
        code: '➗',
        keywords: [
            'heavy_division_sign',
            'division',
            'math',
        ],
    },
    {
        name: 'infinity',
        code: '♾️',
        keywords: [
            'infinity',
        ],
    },
    {
        name: 'bangbang',
        code: '‼️',
        keywords: [
            'bangbang',
        ],
    },
    {
        name: 'interrobang',
        code: '⁉️',
        keywords: [
            'interrobang',
            'exclamation',
            'mark',
            'punctuation',
            'question',
        ],
    },
    {
        name: 'question',
        code: '❓',
        keywords: [
            'confused',
            'question',
            'mark',
            'punctuation',
        ],
    },
    {
        name: 'grey_question',
        code: '❔',
        keywords: [
            'grey_question',
            'mark',
            'outlined',
            'punctuation',
            'question',
        ],
    },
    {
        name: 'grey_exclamation',
        code: '❕',
        keywords: [
            'grey_exclamation',
            'exclamation',
            'mark',
            'outlined',
            'punctuation',
        ],
    },
    {
        name: 'exclamation',
        code: '❗',
        keywords: [
            'bang',
            'exclamation',
            'heavy_exclamation_mark',
            'mark',
            'punctuation',
        ],
    },
    {
        name: 'wavy_dash',
        code: '〰️',
        keywords: [
            'wavy_dash',
            'dash',
            'punctuation',
            'wavy',
        ],
    },
    {
        name: 'currency_exchange',
        code: '💱',
        keywords: [
            'currency_exchange',
            'bank',
            'currency',
            'exchange',
            'money',
        ],
    },
    {
        name: 'heavy_dollar_sign',
        code: '💲',
        keywords: [
            'heavy_dollar_sign',
            'currency',
            'dollar',
            'money',
        ],
    },
    {
        name: 'medical_symbol',
        code: '⚕️',
        keywords: [
            'medical_symbol',
        ],
    },
    {
        name: 'recycle',
        code: '♻️',
        keywords: [
            'environment',
            'green',
            'recycle',
        ],
    },
    {
        name: 'fleur_de_lis',
        code: '⚜️',
        keywords: [
            'fleur_de_lis',
        ],
    },
    {
        name: 'trident',
        code: '🔱',
        keywords: [
            'trident',
            'anchor',
            'emblem',
            'ship',
            'tool',
        ],
    },
    {
        name: 'name_badge',
        code: '📛',
        keywords: [
            'name_badge',
            'badge',
            'name',
        ],
    },
    {
        name: 'beginner',
        code: '🔰',
        keywords: [
            'beginner',
            'chevron',
            'green',
            'japanese',
            'leaf',
            'tool',
            'yellow',
        ],
    },
    {
        name: 'o',
        code: '⭕',
        keywords: [
            'o',
            'circle',
        ],
    },
    {
        name: 'white_check_mark',
        code: '✅',
        keywords: [
            'white_check_mark',
            'check',
            'mark',
        ],
    },
    {
        name: 'ballot_box_with_check',
        code: '☑️',
        keywords: [
            'ballot_box_with_check',
            'ballot',
            'box',
            'check',
        ],
    },
    {
        name: 'heavy_check_mark',
        code: '✔️',
        keywords: [
            'heavy_check_mark',
            'check',
            'mark',
        ],
    },
    {
        name: 'x',
        code: '❌',
        keywords: [
            'x',
            'cancel',
            'mark',
            'multiplication',
            'multiply',
        ],
    },
    {
        name: 'negative_squared_cross_mark',
        code: '❎',
        keywords: [
            'negative_squared_cross_mark',
            'mark',
            'square',
        ],
    },
    {
        name: 'curly_loop',
        code: '➰',
        keywords: [
            'curly_loop',
            'curl',
            'loop',
        ],
    },
    {
        name: 'loop',
        code: '➿',
        keywords: [
            'loop',
            'curl',
            'double',
        ],
    },
    {
        name: 'part_alternation_mark',
        code: '〽️',
        keywords: [
            'part_alternation_mark',
        ],
    },
    {
        name: 'eight_spoked_asterisk',
        code: '✳️',
        keywords: [
            'eight_spoked_asterisk',
            'asterisk',
        ],
    },
    {
        name: 'eight_pointed_black_star',
        code: '✴️',
        keywords: [
            'eight_pointed_black_star',
            'star',
        ],
    },
    {
        name: 'sparkle',
        code: '❇️',
        keywords: [
            'sparkle',
        ],
    },
    {
        name: 'copyright',
        code: '©️',
        keywords: [
            'copyright',
        ],
    },
    {
        name: 'registered',
        code: '®️',
        keywords: [
            'registered',
        ],
    },
    {
        name: 'tm',
        code: '™️',
        keywords: [
            'trademark',
            'tm',
            'mark',
        ],
    },
    {
        name: 'hash',
        code: '#️⃣',
        keywords: [
            'number',
            'hash',
            'keycap',
            'pound',
        ],
    },
    {
        name: 'asterisk',
        code: '*️⃣',
        keywords: [
            'asterisk',
            'keycap',
            'star',
        ],
    },
    {
        name: 'zero',
        code: '0️⃣',
        keywords: [
            'zero',
            '0',
            'keycap',
        ],
    },
    {
        name: 'one',
        code: '1️⃣',
        keywords: [
            'one',
            '1',
            'keycap',
        ],
    },
    {
        name: 'two',
        code: '2️⃣',
        keywords: [
            'two',
            '2',
            'keycap',
        ],
    },
    {
        name: 'three',
        code: '3️⃣',
        keywords: [
            'three',
            '3',
            'keycap',
        ],
    },
    {
        name: 'four',
        code: '4️⃣',
        keywords: [
            'four',
            '4',
            'keycap',
        ],
    },
    {
        name: 'five',
        code: '5️⃣',
        keywords: [
            'five',
            '5',
            'keycap',
        ],
    },
    {
        name: 'six',
        code: '6️⃣',
        keywords: [
            'six',
            '6',
            'keycap',
        ],
    },
    {
        name: 'seven',
        code: '7️⃣',
        keywords: [
            'seven',
            '7',
            'keycap',
        ],
    },
    {
        name: 'eight',
        code: '8️⃣',
        keywords: [
            'eight',
            '8',
            'keycap',
        ],
    },
    {
        name: 'nine',
        code: '9️⃣',
        keywords: [
            'nine',
            '9',
            'keycap',
        ],
    },
    {
        name: 'keycap_ten',
        code: '🔟',
        keywords: [
            'keycap_ten',
            '10',
            'keycap',
            'ten',
        ],
    },
    {
        name: 'capital_abcd',
        code: '🔠',
        keywords: [
            'letters',
            'capital_abcd',
            'input',
            'latin',
            'uppercase',
        ],
    },
    {
        name: 'abcd',
        code: '🔡',
        keywords: [
            'abcd',
            'input',
            'latin',
            'letters',
            'lowercase',
        ],
    },
    {
        name: '1234',
        code: '🔢',
        keywords: [
            'numbers',
            '1234',
            'input',
        ],
    },
    {
        name: 'symbols',
        code: '🔣',
        keywords: [
            'symbols',
            'input',
        ],
    },
    {
        name: 'abc',
        code: '🔤',
        keywords: [
            'alphabet',
            'abc',
            'input',
            'latin',
            'letters',
        ],
    },
    {
        name: 'a',
        code: '🅰️',
        keywords: [
            'a',
        ],
    },
    {
        name: 'ab',
        code: '🆎',
        keywords: [
            'ab',
            'blood',
        ],
    },
    {
        name: 'b',
        code: '🅱️',
        keywords: [
            'b',
        ],
    },
    {
        name: 'cl',
        code: '🆑',
        keywords: [
            'cl',
        ],
    },
    {
        name: 'cool',
        code: '🆒',
        keywords: [
            'cool',
        ],
    },
    {
        name: 'free',
        code: '🆓',
        keywords: [
            'free',
        ],
    },
    {
        name: 'information_source',
        code: 'ℹ️',
        keywords: [
            'information_source',
            'i',
            'information',
        ],
    },
    {
        name: 'id',
        code: '🆔',
        keywords: [
            'id',
            'identity',
        ],
    },
    {
        name: 'm',
        code: 'Ⓜ️',
        keywords: [
            'm',
        ],
    },
    {
        name: 'new',
        code: '🆕',
        keywords: [
            'fresh',
            'new',
        ],
    },
    {
        name: 'ng',
        code: '🆖',
        keywords: [
            'ng',
        ],
    },
    {
        name: 'o2',
        code: '🅾️',
        keywords: [
            'o2',
        ],
    },
    {
        name: 'ok',
        code: '🆗',
        keywords: [
            'yes',
            'ok',
        ],
    },
    {
        name: 'parking',
        code: '🅿️',
        keywords: [
            'parking',
        ],
    },
    {
        name: 'sos',
        code: '🆘',
        keywords: [
            'help',
            'emergency',
            'sos',
        ],
    },
    {
        name: 'up',
        code: '🆙',
        keywords: [
            'up',
            'mark',
        ],
    },
    {
        name: 'vs',
        code: '🆚',
        keywords: [
            'vs',
            'versus',
        ],
    },
    {
        name: 'koko',
        code: '🈁',
        keywords: [
            'koko',
            'japanese',
        ],
    },
    {
        name: 'sa',
        code: '🈂️',
        keywords: [
            'sa',
        ],
    },
    {
        name: 'u6708',
        code: '🈷️',
        keywords: [
            'u6708',
        ],
    },
    {
        name: 'u6709',
        code: '🈶',
        keywords: [
            'u6709',
            'japanese',
        ],
    },
    {
        name: 'u6307',
        code: '🈯',
        keywords: [
            'u6307',
            'japanese',
        ],
    },
    {
        name: 'ideograph_advantage',
        code: '🉐',
        keywords: [
            'ideograph_advantage',
            'japanese',
        ],
    },
    {
        name: 'u5272',
        code: '🈹',
        keywords: [
            'u5272',
            'japanese',
        ],
    },
    {
        name: 'u7121',
        code: '🈚',
        keywords: [
            'u7121',
            'japanese',
        ],
    },
    {
        name: 'u7981',
        code: '🈲',
        keywords: [
            'u7981',
            'japanese',
        ],
    },
    {
        name: 'accept',
        code: '🉑',
        keywords: [
            'accept',
            'chinese',
        ],
    },
    {
        name: 'u7533',
        code: '🈸',
        keywords: [
            'u7533',
            'chinese',
        ],
    },
    {
        name: 'u5408',
        code: '🈴',
        keywords: [
            'u5408',
            'chinese',
        ],
    },
    {
        name: 'u7a7a',
        code: '🈳',
        keywords: [
            'u7a7a',
            'chinese',
        ],
    },
    {
        name: 'congratulations',
        code: '㊗️',
        keywords: [
            'congratulations',
            'chinese',
            'congratulation',
            'ideograph',
        ],
    },
    {
        name: 'secret',
        code: '㊙️',
        keywords: [
            'secret',
            'chinese',
            'ideograph',
        ],
    },
    {
        name: 'u55b6',
        code: '🈺',
        keywords: [
            'u55b6',
            'chinese',
        ],
    },
    {
        name: 'u6e80',
        code: '🈵',
        keywords: [
            'u6e80',
            'chinese',
        ],
    },
    {
        name: 'red_circle',
        code: '🔴',
        keywords: [
            'red_circle',
            'circle',
            'geometric',
            'red',
        ],
    },
    {
        name: 'orange_circle',
        code: '🟠',
        keywords: [
            'orange_circle',
        ],
    },
    {
        name: 'yellow_circle',
        code: '🟡',
        keywords: [
            'yellow_circle',
        ],
    },
    {
        name: 'green_circle',
        code: '🟢',
        keywords: [
            'green_circle',
        ],
    },
    {
        name: 'large_blue_circle',
        code: '🔵',
        keywords: [
            'large_blue_circle',
            'blue',
            'circle',
            'geometric',
        ],
    },
    {
        name: 'purple_circle',
        code: '🟣',
        keywords: [
            'purple_circle',
        ],
    },
    {
        name: 'brown_circle',
        code: '🟤',
        keywords: [
            'brown_circle',
        ],
    },
    {
        name: 'black_circle',
        code: '⚫',
        keywords: [
            'black_circle',
            'circle',
            'geometric',
        ],
    },
    {
        name: 'white_circle',
        code: '⚪',
        keywords: [
            'white_circle',
            'circle',
            'geometric',
        ],
    },
    {
        name: 'red_square',
        code: '🟥',
        keywords: [
            'red_square',
        ],
    },
    {
        name: 'orange_square',
        code: '🟧',
        keywords: [
            'orange_square',
        ],
    },
    {
        name: 'yellow_square',
        code: '🟨',
        keywords: [
            'yellow_square',
        ],
    },
    {
        name: 'green_square',
        code: '🟩',
        keywords: [
            'green_square',
        ],
    },
    {
        name: 'blue_square',
        code: '🟦',
        keywords: [
            'blue_square',
        ],
    },
    {
        name: 'purple_square',
        code: '🟪',
        keywords: [
            'purple_square',
        ],
    },
    {
        name: 'brown_square',
        code: '🟫',
        keywords: [
            'brown_square',
        ],
    },
    {
        name: 'black_large_square',
        code: '⬛',
        keywords: [
            'black_large_square',
            'geometric',
            'square',
        ],
    },
    {
        name: 'white_large_square',
        code: '⬜',
        keywords: [
            'white_large_square',
            'geometric',
            'square',
        ],
    },
    {
        name: 'black_medium_square',
        code: '◼️',
        keywords: [
            'black_medium_square',
        ],
    },
    {
        name: 'white_medium_square',
        code: '◻️',
        keywords: [
            'white_medium_square',
        ],
    },
    {
        name: 'black_medium_small_square',
        code: '◾',
        keywords: [
            'black_medium_small_square',
            'geometric',
            'square',
        ],
    },
    {
        name: 'white_medium_small_square',
        code: '◽',
        keywords: [
            'white_medium_small_square',
            'geometric',
            'square',
        ],
    },
    {
        name: 'black_small_square',
        code: '▪️',
        keywords: [
            'black_small_square',
        ],
    },
    {
        name: 'white_small_square',
        code: '▫️',
        keywords: [
            'white_small_square',
        ],
    },
    {
        name: 'large_orange_diamond',
        code: '🔶',
        keywords: [
            'large_orange_diamond',
            'diamond',
            'geometric',
            'orange',
        ],
    },
    {
        name: 'large_blue_diamond',
        code: '🔷',
        keywords: [
            'large_blue_diamond',
            'blue',
            'diamond',
            'geometric',
        ],
    },
    {
        name: 'small_orange_diamond',
        code: '🔸',
        keywords: [
            'small_orange_diamond',
            'diamond',
            'geometric',
            'orange',
        ],
    },
    {
        name: 'small_blue_diamond',
        code: '🔹',
        keywords: [
            'small_blue_diamond',
            'blue',
            'diamond',
            'geometric',
        ],
    },
    {
        name: 'small_red_triangle',
        code: '🔺',
        keywords: [
            'small_red_triangle',
            'geometric',
            'red',
        ],
    },
    {
        name: 'small_red_triangle_down',
        code: '🔻',
        keywords: [
            'small_red_triangle_down',
            'down',
            'geometric',
            'red',
        ],
    },
    {
        name: 'diamond_shape_with_a_dot_inside',
        code: '💠',
        keywords: [
            'diamond_shape_with_a_dot_inside',
            'comic',
            'diamond',
            'geometric',
            'inside',
        ],
    },
    {
        name: 'radio_button',
        code: '🔘',
        keywords: [
            'radio_button',
            'button',
            'geometric',
            'radio',
        ],
    },
    {
        name: 'white_square_button',
        code: '🔳',
        keywords: [
            'white_square_button',
            'button',
            'geometric',
            'outlined',
            'square',
        ],
    },
    {
        name: 'black_square_button',
        code: '🔲',
        keywords: [
            'black_square_button',
            'button',
            'geometric',
            'square',
        ],
    },
    {
        code: 'flags',
        header: true,
    },
    {
        name: 'checkered_flag',
        code: '🏁',
        keywords: [
            'milestone',
            'finish',
            'checkered_flag',
            'checkered',
            'chequered',
            'flag',
            'racing',
        ],
    },
    {
        name: 'triangular_flag_on_post',
        code: '🚩',
        keywords: [
            'triangular_flag_on_post',
            'flag',
            'post',
        ],
    },
    {
        name: 'crossed_flags',
        code: '🎌',
        keywords: [
            'crossed_flags',
            'activity',
            'celebration',
            'cross',
            'crossed',
            'flag',
            'japanese',
        ],
    },
    {
        name: 'black_flag',
        code: '🏴',
        keywords: [
            'black_flag',
            'flag',
            'waving',
        ],
    },
    {
        name: 'white_flag',
        code: '🏳️',
        keywords: [
            'white_flag',
        ],
    },
    {
        name: 'rainbow_flag',
        code: '🏳️‍🌈',
        keywords: [
            'pride',
            'rainbow_flag',
        ],
    },
    {
        name: 'transgender_flag',
        code: '🏳️‍⚧️',
        keywords: [
            'transgender_flag',
        ],
    },
    {
        name: 'pirate_flag',
        code: '🏴‍☠️',
        keywords: [
            'pirate_flag',
        ],
    },
    {
        name: 'ascension_island',
        code: '🇦🇨',
        keywords: [
            'ascension_island',
            'ascension',
            'flag',
            'island',
        ],
    },
    {
        name: 'andorra',
        code: '🇦🇩',
        keywords: [
            'andorra',
            'flag',
        ],
    },
    {
        name: 'united_arab_emirates',
        code: '🇦🇪',
        keywords: [
            'united_arab_emirates',
            'emirates',
            'flag',
            'uae',
            'united',
        ],
    },
    {
        name: 'afghanistan',
        code: '🇦🇫',
        keywords: [
            'afghanistan',
            'flag',
        ],
    },
    {
        name: 'antigua_barbuda',
        code: '🇦🇬',
        keywords: [
            'antigua_barbuda',
            'antigua',
            'barbuda',
            'flag',
        ],
    },
    {
        name: 'anguilla',
        code: '🇦🇮',
        keywords: [
            'anguilla',
            'flag',
        ],
    },
    {
        name: 'albania',
        code: '🇦🇱',
        keywords: [
            'albania',
            'flag',
        ],
    },
    {
        name: 'armenia',
        code: '🇦🇲',
        keywords: [
            'armenia',
            'flag',
        ],
    },
    {
        name: 'angola',
        code: '🇦🇴',
        keywords: [
            'angola',
            'flag',
        ],
    },
    {
        name: 'antarctica',
        code: '🇦🇶',
        keywords: [
            'antarctica',
            'flag',
        ],
    },
    {
        name: 'argentina',
        code: '🇦🇷',
        keywords: [
            'argentina',
            'flag',
        ],
    },
    {
        name: 'american_samoa',
        code: '🇦🇸',
        keywords: [
            'american_samoa',
            'american',
            'flag',
            'samoa',
        ],
    },
    {
        name: 'austria',
        code: '🇦🇹',
        keywords: [
            'austria',
            'flag',
        ],
    },
    {
        name: 'australia',
        code: '🇦🇺',
        keywords: [
            'australia',
            'flag',
        ],
    },
    {
        name: 'aruba',
        code: '🇦🇼',
        keywords: [
            'aruba',
            'flag',
        ],
    },
    {
        name: 'aland_islands',
        code: '🇦🇽',
        keywords: [
            'aland_islands',
            'åland',
            'flag',
        ],
    },
    {
        name: 'azerbaijan',
        code: '🇦🇿',
        keywords: [
            'azerbaijan',
            'flag',
        ],
    },
    {
        name: 'bosnia_herzegovina',
        code: '🇧🇦',
        keywords: [
            'bosnia_herzegovina',
            'bosnia',
            'flag',
            'herzegovina',
        ],
    },
    {
        name: 'barbados',
        code: '🇧🇧',
        keywords: [
            'barbados',
            'flag',
        ],
    },
    {
        name: 'bangladesh',
        code: '🇧🇩',
        keywords: [
            'bangladesh',
            'flag',
        ],
    },
    {
        name: 'belgium',
        code: '🇧🇪',
        keywords: [
            'belgium',
            'flag',
        ],
    },
    {
        name: 'burkina_faso',
        code: '🇧🇫',
        keywords: [
            'burkina_faso',
            'burkina faso',
            'flag',
        ],
    },
    {
        name: 'bulgaria',
        code: '🇧🇬',
        keywords: [
            'bulgaria',
            'flag',
        ],
    },
    {
        name: 'bahrain',
        code: '🇧🇭',
        keywords: [
            'bahrain',
            'flag',
        ],
    },
    {
        name: 'burundi',
        code: '🇧🇮',
        keywords: [
            'burundi',
            'flag',
        ],
    },
    {
        name: 'benin',
        code: '🇧🇯',
        keywords: [
            'benin',
            'flag',
        ],
    },
    {
        name: 'st_barthelemy',
        code: '🇧🇱',
        keywords: [
            'st_barthelemy',
            'barthelemy',
            'barthélemy',
            'flag',
            'saint',
        ],
    },
    {
        name: 'bermuda',
        code: '🇧🇲',
        keywords: [
            'bermuda',
            'flag',
        ],
    },
    {
        name: 'brunei',
        code: '🇧🇳',
        keywords: [
            'brunei',
            'darussalam',
            'flag',
        ],
    },
    {
        name: 'bolivia',
        code: '🇧🇴',
        keywords: [
            'bolivia',
            'flag',
        ],
    },
    {
        name: 'caribbean_netherlands',
        code: '🇧🇶',
        keywords: [
            'caribbean_netherlands',
            'bonaire',
            'caribbean',
            'eustatius',
            'flag',
            'netherlands',
            'saba',
            'sint',
        ],
    },
    {
        name: 'brazil',
        code: '🇧🇷',
        keywords: [
            'brazil',
            'flag',
        ],
    },
    {
        name: 'bahamas',
        code: '🇧🇸',
        keywords: [
            'bahamas',
            'flag',
        ],
    },
    {
        name: 'bhutan',
        code: '🇧🇹',
        keywords: [
            'bhutan',
            'flag',
        ],
    },
    {
        name: 'bouvet_island',
        code: '🇧🇻',
        keywords: [
            'bouvet_island',
            'bouvet',
            'flag',
            'island',
        ],
    },
    {
        name: 'botswana',
        code: '🇧🇼',
        keywords: [
            'botswana',
            'flag',
        ],
    },
    {
        name: 'belarus',
        code: '🇧🇾',
        keywords: [
            'belarus',
            'flag',
        ],
    },
    {
        name: 'belize',
        code: '🇧🇿',
        keywords: [
            'belize',
            'flag',
        ],
    },
    {
        name: 'canada',
        code: '🇨🇦',
        keywords: [
            'canada',
            'flag',
        ],
    },
    {
        name: 'cocos_islands',
        code: '🇨🇨',
        keywords: [
            'keeling',
            'cocos_islands',
            'cocos',
            'flag',
            'island',
        ],
    },
    {
        name: 'congo_kinshasa',
        code: '🇨🇩',
        keywords: [
            'congo_kinshasa',
            'congo',
            'congo-kinshasa',
            'democratic republic of congo',
            'drc',
            'flag',
            'kinshasa',
            'republic',
        ],
    },
    {
        name: 'central_african_republic',
        code: '🇨🇫',
        keywords: [
            'central_african_republic',
            'central african republic',
            'flag',
            'republic',
        ],
    },
    {
        name: 'congo_brazzaville',
        code: '🇨🇬',
        keywords: [
            'congo_brazzaville',
            'brazzaville',
            'congo',
            'congo republic',
            'congo-brazzaville',
            'flag',
            'republic',
            'republic of the congo',
        ],
    },
    {
        name: 'switzerland',
        code: '🇨🇭',
        keywords: [
            'switzerland',
            'flag',
        ],
    },
    {
        name: 'cote_divoire',
        code: '🇨🇮',
        keywords: [
            'ivory',
            'cote_divoire',
            'cote ivoire',
            'côte ivoire',
            'flag',
            'ivory coast',
        ],
    },
    {
        name: 'cook_islands',
        code: '🇨🇰',
        keywords: [
            'cook_islands',
            'cook',
            'flag',
            'island',
        ],
    },
    {
        name: 'chile',
        code: '🇨🇱',
        keywords: [
            'chile',
            'flag',
        ],
    },
    {
        name: 'cameroon',
        code: '🇨🇲',
        keywords: [
            'cameroon',
            'flag',
        ],
    },
    {
        name: 'cn',
        code: '🇨🇳',
        keywords: [
            'china',
            'cn',
            'flag',
        ],
    },
    {
        name: 'colombia',
        code: '🇨🇴',
        keywords: [
            'colombia',
            'flag',
        ],
    },
    {
        name: 'clipperton_island',
        code: '🇨🇵',
        keywords: [
            'clipperton_island',
            'clipperton',
            'flag',
            'island',
        ],
    },
    {
        name: 'costa_rica',
        code: '🇨🇷',
        keywords: [
            'costa_rica',
            'costa rica',
            'flag',
        ],
    },
    {
        name: 'cuba',
        code: '🇨🇺',
        keywords: [
            'cuba',
            'flag',
        ],
    },
    {
        name: 'cape_verde',
        code: '🇨🇻',
        keywords: [
            'cape_verde',
            'cabo',
            'cape',
            'flag',
            'verde',
        ],
    },
    {
        name: 'curacao',
        code: '🇨🇼',
        keywords: [
            'curacao',
            'antilles',
            'curaçao',
            'flag',
        ],
    },
    {
        name: 'christmas_island',
        code: '🇨🇽',
        keywords: [
            'christmas_island',
            'christmas',
            'flag',
            'island',
        ],
    },
    {
        name: 'cyprus',
        code: '🇨🇾',
        keywords: [
            'cyprus',
            'flag',
        ],
    },
    {
        name: 'czech_republic',
        code: '🇨🇿',
        keywords: [
            'czech_republic',
            'czech republic',
            'flag',
        ],
    },
    {
        name: 'de',
        code: '🇩🇪',
        keywords: [
            'flag',
            'germany',
            'de',
        ],
    },
    {
        name: 'diego_garcia',
        code: '🇩🇬',
        keywords: [
            'diego_garcia',
            'diego garcia',
            'flag',
        ],
    },
    {
        name: 'djibouti',
        code: '🇩🇯',
        keywords: [
            'djibouti',
            'flag',
        ],
    },
    {
        name: 'denmark',
        code: '🇩🇰',
        keywords: [
            'denmark',
            'flag',
        ],
    },
    {
        name: 'dominica',
        code: '🇩🇲',
        keywords: [
            'dominica',
            'flag',
        ],
    },
    {
        name: 'dominican_republic',
        code: '🇩🇴',
        keywords: [
            'dominican_republic',
            'dominican republic',
            'flag',
        ],
    },
    {
        name: 'algeria',
        code: '🇩🇿',
        keywords: [
            'algeria',
            'flag',
        ],
    },
    {
        name: 'ceuta_melilla',
        code: '🇪🇦',
        keywords: [
            'ceuta_melilla',
            'ceuta',
            'flag',
            'melilla',
        ],
    },
    {
        name: 'ecuador',
        code: '🇪🇨',
        keywords: [
            'ecuador',
            'flag',
        ],
    },
    {
        name: 'estonia',
        code: '🇪🇪',
        keywords: [
            'estonia',
            'flag',
        ],
    },
    {
        name: 'egypt',
        code: '🇪🇬',
        keywords: [
            'egypt',
            'flag',
        ],
    },
    {
        name: 'western_sahara',
        code: '🇪🇭',
        keywords: [
            'western_sahara',
            'flag',
            'sahara',
            'west',
            'western sahara',
        ],
    },
    {
        name: 'eritrea',
        code: '🇪🇷',
        keywords: [
            'eritrea',
            'flag',
        ],
    },
    {
        name: 'es',
        code: '🇪🇸',
        keywords: [
            'spain',
            'es',
            'flag',
        ],
    },
    {
        name: 'ethiopia',
        code: '🇪🇹',
        keywords: [
            'ethiopia',
            'flag',
        ],
    },
    {
        name: 'eu',
        code: '🇪🇺',
        keywords: [
            'eu',
            'european_union',
            'european union',
            'flag',
        ],
    },
    {
        name: 'finland',
        code: '🇫🇮',
        keywords: [
            'finland',
            'flag',
        ],
    },
    {
        name: 'fiji',
        code: '🇫🇯',
        keywords: [
            'fiji',
            'flag',
        ],
    },
    {
        name: 'falkland_islands',
        code: '🇫🇰',
        keywords: [
            'falkland_islands',
            'falkland',
            'falklands',
            'flag',
            'island',
            'islas',
            'malvinas',
        ],
    },
    {
        name: 'micronesia',
        code: '🇫🇲',
        keywords: [
            'micronesia',
            'flag',
        ],
    },
    {
        name: 'faroe_islands',
        code: '🇫🇴',
        keywords: [
            'faroe_islands',
            'faroe',
            'flag',
            'island',
        ],
    },
    {
        name: 'fr',
        code: '🇫🇷',
        keywords: [
            'france',
            'french',
            'fr',
            'flag',
        ],
    },
    {
        name: 'gabon',
        code: '🇬🇦',
        keywords: [
            'gabon',
            'flag',
        ],
    },
    {
        name: 'gb',
        code: '🇬🇧',
        keywords: [
            'flag',
            'british',
            'gb',
            'uk',
            'britain',
            'cornwall',
            'england',
            'great britain',
            'ireland',
            'northern ireland',
            'scotland',
            'union jack',
            'united',
            'united kingdom',
            'wales',
        ],
    },
    {
        name: 'grenada',
        code: '🇬🇩',
        keywords: [
            'grenada',
            'flag',
        ],
    },
    {
        name: 'georgia',
        code: '🇬🇪',
        keywords: [
            'georgia',
            'flag',
        ],
    },
    {
        name: 'french_guiana',
        code: '🇬🇫',
        keywords: [
            'french_guiana',
            'flag',
            'french',
            'guiana',
        ],
    },
    {
        name: 'guernsey',
        code: '🇬🇬',
        keywords: [
            'guernsey',
            'flag',
        ],
    },
    {
        name: 'ghana',
        code: '🇬🇭',
        keywords: [
            'ghana',
            'flag',
        ],
    },
    {
        name: 'gibraltar',
        code: '🇬🇮',
        keywords: [
            'gibraltar',
            'flag',
        ],
    },
    {
        name: 'greenland',
        code: '🇬🇱',
        keywords: [
            'greenland',
            'flag',
        ],
    },
    {
        name: 'gambia',
        code: '🇬🇲',
        keywords: [
            'gambia',
            'flag',
        ],
    },
    {
        name: 'guinea',
        code: '🇬🇳',
        keywords: [
            'guinea',
            'flag',
        ],
    },
    {
        name: 'guadeloupe',
        code: '🇬🇵',
        keywords: [
            'guadeloupe',
            'flag',
        ],
    },
    {
        name: 'equatorial_guinea',
        code: '🇬🇶',
        keywords: [
            'equatorial_guinea',
            'equatorial guinea',
            'flag',
            'guinea',
        ],
    },
    {
        name: 'greece',
        code: '🇬🇷',
        keywords: [
            'greece',
            'flag',
        ],
    },
    {
        name: 'south_georgia_south_sandwich_islands',
        code: '🇬🇸',
        keywords: [
            'south_georgia_south_sandwich_islands',
            'flag',
            'georgia',
            'island',
            'south',
            'south georgia',
            'south sandwich',
        ],
    },
    {
        name: 'guatemala',
        code: '🇬🇹',
        keywords: [
            'guatemala',
            'flag',
        ],
    },
    {
        name: 'guam',
        code: '🇬🇺',
        keywords: [
            'guam',
            'flag',
        ],
    },
    {
        name: 'guinea_bissau',
        code: '🇬🇼',
        keywords: [
            'guinea_bissau',
            'bissau',
            'flag',
            'guinea',
        ],
    },
    {
        name: 'guyana',
        code: '🇬🇾',
        keywords: [
            'guyana',
            'flag',
        ],
    },
    {
        name: 'hong_kong',
        code: '🇭🇰',
        keywords: [
            'hong_kong',
            'china',
            'flag',
            'hong kong',
        ],
    },
    {
        name: 'heard_mcdonald_islands',
        code: '🇭🇲',
        keywords: [
            'heard_mcdonald_islands',
            'flag',
            'heard',
            'island',
            'mcdonald',
        ],
    },
    {
        name: 'honduras',
        code: '🇭🇳',
        keywords: [
            'honduras',
            'flag',
        ],
    },
    {
        name: 'croatia',
        code: '🇭🇷',
        keywords: [
            'croatia',
            'flag',
        ],
    },
    {
        name: 'haiti',
        code: '🇭🇹',
        keywords: [
            'haiti',
            'flag',
        ],
    },
    {
        name: 'hungary',
        code: '🇭🇺',
        keywords: [
            'hungary',
            'flag',
        ],
    },
    {
        name: 'canary_islands',
        code: '🇮🇨',
        keywords: [
            'canary_islands',
            'canary',
            'flag',
            'island',
        ],
    },
    {
        name: 'indonesia',
        code: '🇮🇩',
        keywords: [
            'indonesia',
            'flag',
        ],
    },
    {
        name: 'ireland',
        code: '🇮🇪',
        keywords: [
            'ireland',
            'flag',
        ],
    },
    {
        name: 'israel',
        code: '🇮🇱',
        keywords: [
            'israel',
            'flag',
        ],
    },
    {
        name: 'isle_of_man',
        code: '🇮🇲',
        keywords: [
            'isle_of_man',
            'flag',
            'isle of man',
        ],
    },
    {
        name: 'india',
        code: '🇮🇳',
        keywords: [
            'india',
            'flag',
        ],
    },
    {
        name: 'british_indian_ocean_territory',
        code: '🇮🇴',
        keywords: [
            'british_indian_ocean_territory',
            'british',
            'chagos',
            'flag',
            'indian ocean',
            'island',
        ],
    },
    {
        name: 'iraq',
        code: '🇮🇶',
        keywords: [
            'iraq',
            'flag',
        ],
    },
    {
        name: 'iran',
        code: '🇮🇷',
        keywords: [
            'iran',
            'flag',
        ],
    },
    {
        name: 'iceland',
        code: '🇮🇸',
        keywords: [
            'iceland',
            'flag',
        ],
    },
    {
        name: 'it',
        code: '🇮🇹',
        keywords: [
            'italy',
            'it',
            'flag',
        ],
    },
    {
        name: 'jersey',
        code: '🇯🇪',
        keywords: [
            'jersey',
            'flag',
        ],
    },
    {
        name: 'jamaica',
        code: '🇯🇲',
        keywords: [
            'jamaica',
            'flag',
        ],
    },
    {
        name: 'jordan',
        code: '🇯🇴',
        keywords: [
            'jordan',
            'flag',
        ],
    },
    {
        name: 'jp',
        code: '🇯🇵',
        keywords: [
            'japan',
            'jp',
            'flag',
        ],
    },
    {
        name: 'kenya',
        code: '🇰🇪',
        keywords: [
            'kenya',
            'flag',
        ],
    },
    {
        name: 'kyrgyzstan',
        code: '🇰🇬',
        keywords: [
            'kyrgyzstan',
            'flag',
        ],
    },
    {
        name: 'cambodia',
        code: '🇰🇭',
        keywords: [
            'cambodia',
            'flag',
        ],
    },
    {
        name: 'kiribati',
        code: '🇰🇮',
        keywords: [
            'kiribati',
            'flag',
        ],
    },
    {
        name: 'comoros',
        code: '🇰🇲',
        keywords: [
            'comoros',
            'flag',
        ],
    },
    {
        name: 'st_kitts_nevis',
        code: '🇰🇳',
        keywords: [
            'st_kitts_nevis',
            'flag',
            'kitts',
            'nevis',
            'saint',
        ],
    },
    {
        name: 'north_korea',
        code: '🇰🇵',
        keywords: [
            'north_korea',
            'flag',
            'korea',
            'north',
            'north korea',
        ],
    },
    {
        name: 'kr',
        code: '🇰🇷',
        keywords: [
            'korea',
            'kr',
            'flag',
            'south',
            'south korea',
        ],
    },
    {
        name: 'kuwait',
        code: '🇰🇼',
        keywords: [
            'kuwait',
            'flag',
        ],
    },
    {
        name: 'cayman_islands',
        code: '🇰🇾',
        keywords: [
            'cayman_islands',
            'cayman',
            'flag',
            'island',
        ],
    },
    {
        name: 'kazakhstan',
        code: '🇰🇿',
        keywords: [
            'kazakhstan',
            'flag',
        ],
    },
    {
        name: 'laos',
        code: '🇱🇦',
        keywords: [
            'laos',
            'flag',
        ],
    },
    {
        name: 'lebanon',
        code: '🇱🇧',
        keywords: [
            'lebanon',
            'flag',
        ],
    },
    {
        name: 'st_lucia',
        code: '🇱🇨',
        keywords: [
            'st_lucia',
            'flag',
            'lucia',
            'saint',
        ],
    },
    {
        name: 'liechtenstein',
        code: '🇱🇮',
        keywords: [
            'liechtenstein',
            'flag',
        ],
    },
    {
        name: 'sri_lanka',
        code: '🇱🇰',
        keywords: [
            'sri_lanka',
            'flag',
            'sri lanka',
        ],
    },
    {
        name: 'liberia',
        code: '🇱🇷',
        keywords: [
            'liberia',
            'flag',
        ],
    },
    {
        name: 'lesotho',
        code: '🇱🇸',
        keywords: [
            'lesotho',
            'flag',
        ],
    },
    {
        name: 'lithuania',
        code: '🇱🇹',
        keywords: [
            'lithuania',
            'flag',
        ],
    },
    {
        name: 'luxembourg',
        code: '🇱🇺',
        keywords: [
            'luxembourg',
            'flag',
        ],
    },
    {
        name: 'latvia',
        code: '🇱🇻',
        keywords: [
            'latvia',
            'flag',
        ],
    },
    {
        name: 'libya',
        code: '🇱🇾',
        keywords: [
            'libya',
            'flag',
        ],
    },
    {
        name: 'morocco',
        code: '🇲🇦',
        keywords: [
            'morocco',
            'flag',
        ],
    },
    {
        name: 'monaco',
        code: '🇲🇨',
        keywords: [
            'monaco',
            'flag',
        ],
    },
    {
        name: 'moldova',
        code: '🇲🇩',
        keywords: [
            'moldova',
            'flag',
        ],
    },
    {
        name: 'montenegro',
        code: '🇲🇪',
        keywords: [
            'montenegro',
            'flag',
        ],
    },
    {
        name: 'st_martin',
        code: '🇲🇫',
        keywords: [
            'st_martin',
            'flag',
            'french',
            'martin',
            'saint',
        ],
    },
    {
        name: 'madagascar',
        code: '🇲🇬',
        keywords: [
            'madagascar',
            'flag',
        ],
    },
    {
        name: 'marshall_islands',
        code: '🇲🇭',
        keywords: [
            'marshall_islands',
            'flag',
            'island',
            'marshall',
        ],
    },
    {
        name: 'macedonia',
        code: '🇲🇰',
        keywords: [
            'macedonia',
            'flag',
        ],
    },
    {
        name: 'mali',
        code: '🇲🇱',
        keywords: [
            'mali',
            'flag',
        ],
    },
    {
        name: 'myanmar',
        code: '🇲🇲',
        keywords: [
            'burma',
            'myanmar',
            'flag',
        ],
    },
    {
        name: 'mongolia',
        code: '🇲🇳',
        keywords: [
            'mongolia',
            'flag',
        ],
    },
    {
        name: 'macau',
        code: '🇲🇴',
        keywords: [
            'macau',
            'china',
            'flag',
            'macao',
        ],
    },
    {
        name: 'northern_mariana_islands',
        code: '🇲🇵',
        keywords: [
            'northern_mariana_islands',
            'flag',
            'island',
            'mariana',
            'north',
            'northern mariana',
        ],
    },
    {
        name: 'martinique',
        code: '🇲🇶',
        keywords: [
            'martinique',
            'flag',
        ],
    },
    {
        name: 'mauritania',
        code: '🇲🇷',
        keywords: [
            'mauritania',
            'flag',
        ],
    },
    {
        name: 'montserrat',
        code: '🇲🇸',
        keywords: [
            'montserrat',
            'flag',
        ],
    },
    {
        name: 'malta',
        code: '🇲🇹',
        keywords: [
            'malta',
            'flag',
        ],
    },
    {
        name: 'mauritius',
        code: '🇲🇺',
        keywords: [
            'mauritius',
            'flag',
        ],
    },
    {
        name: 'maldives',
        code: '🇲🇻',
        keywords: [
            'maldives',
            'flag',
        ],
    },
    {
        name: 'malawi',
        code: '🇲🇼',
        keywords: [
            'malawi',
            'flag',
        ],
    },
    {
        name: 'mexico',
        code: '🇲🇽',
        keywords: [
            'mexico',
            'flag',
        ],
    },
    {
        name: 'malaysia',
        code: '🇲🇾',
        keywords: [
            'malaysia',
            'flag',
        ],
    },
    {
        name: 'mozambique',
        code: '🇲🇿',
        keywords: [
            'mozambique',
            'flag',
        ],
    },
    {
        name: 'namibia',
        code: '🇳🇦',
        keywords: [
            'namibia',
            'flag',
        ],
    },
    {
        name: 'new_caledonia',
        code: '🇳🇨',
        keywords: [
            'new_caledonia',
            'flag',
            'new',
            'new caledonia',
        ],
    },
    {
        name: 'niger',
        code: '🇳🇪',
        keywords: [
            'niger',
            'flag',
        ],
    },
    {
        name: 'norfolk_island',
        code: '🇳🇫',
        keywords: [
            'norfolk_island',
            'flag',
            'island',
            'norfolk',
        ],
    },
    {
        name: 'nigeria',
        code: '🇳🇬',
        keywords: [
            'nigeria',
            'flag',
        ],
    },
    {
        name: 'nicaragua',
        code: '🇳🇮',
        keywords: [
            'nicaragua',
            'flag',
        ],
    },
    {
        name: 'netherlands',
        code: '🇳🇱',
        keywords: [
            'netherlands',
            'flag',
        ],
    },
    {
        name: 'norway',
        code: '🇳🇴',
        keywords: [
            'norway',
            'flag',
        ],
    },
    {
        name: 'nepal',
        code: '🇳🇵',
        keywords: [
            'nepal',
            'flag',
        ],
    },
    {
        name: 'nauru',
        code: '🇳🇷',
        keywords: [
            'nauru',
            'flag',
        ],
    },
    {
        name: 'niue',
        code: '🇳🇺',
        keywords: [
            'niue',
            'flag',
        ],
    },
    {
        name: 'new_zealand',
        code: '🇳🇿',
        keywords: [
            'new_zealand',
            'flag',
            'new',
            'new zealand',
        ],
    },
    {
        name: 'oman',
        code: '🇴🇲',
        keywords: [
            'oman',
            'flag',
        ],
    },
    {
        name: 'panama',
        code: '🇵🇦',
        keywords: [
            'panama',
            'flag',
        ],
    },
    {
        name: 'peru',
        code: '🇵🇪',
        keywords: [
            'peru',
            'flag',
        ],
    },
    {
        name: 'french_polynesia',
        code: '🇵🇫',
        keywords: [
            'french_polynesia',
            'flag',
            'french',
            'polynesia',
        ],
    },
    {
        name: 'papua_new_guinea',
        code: '🇵🇬',
        keywords: [
            'papua_new_guinea',
            'flag',
            'guinea',
            'new',
            'papua new guinea',
        ],
    },
    {
        name: 'philippines',
        code: '🇵🇭',
        keywords: [
            'philippines',
            'flag',
        ],
    },
    {
        name: 'pakistan',
        code: '🇵🇰',
        keywords: [
            'pakistan',
            'flag',
        ],
    },
    {
        name: 'poland',
        code: '🇵🇱',
        keywords: [
            'poland',
            'flag',
        ],
    },
    {
        name: 'st_pierre_miquelon',
        code: '🇵🇲',
        keywords: [
            'st_pierre_miquelon',
            'flag',
            'miquelon',
            'pierre',
            'saint',
        ],
    },
    {
        name: 'pitcairn_islands',
        code: '🇵🇳',
        keywords: [
            'pitcairn_islands',
            'flag',
            'island',
            'pitcairn',
        ],
    },
    {
        name: 'puerto_rico',
        code: '🇵🇷',
        keywords: [
            'puerto_rico',
            'flag',
            'puerto rico',
        ],
    },
    {
        name: 'palestinian_territories',
        code: '🇵🇸',
        keywords: [
            'palestinian_territories',
            'flag',
            'palestine',
        ],
    },
    {
        name: 'portugal',
        code: '🇵🇹',
        keywords: [
            'portugal',
            'flag',
        ],
    },
    {
        name: 'palau',
        code: '🇵🇼',
        keywords: [
            'palau',
            'flag',
        ],
    },
    {
        name: 'paraguay',
        code: '🇵🇾',
        keywords: [
            'paraguay',
            'flag',
        ],
    },
    {
        name: 'qatar',
        code: '🇶🇦',
        keywords: [
            'qatar',
            'flag',
        ],
    },
    {
        name: 'reunion',
        code: '🇷🇪',
        keywords: [
            'reunion',
            'flag',
            'réunion',
        ],
    },
    {
        name: 'romania',
        code: '🇷🇴',
        keywords: [
            'romania',
            'flag',
        ],
    },
    {
        name: 'serbia',
        code: '🇷🇸',
        keywords: [
            'serbia',
            'flag',
        ],
    },
    {
        name: 'ru',
        code: '🇷🇺',
        keywords: [
            'russia',
            'ru',
            'flag',
        ],
    },
    {
        name: 'rwanda',
        code: '🇷🇼',
        keywords: [
            'rwanda',
            'flag',
        ],
    },
    {
        name: 'saudi_arabia',
        code: '🇸🇦',
        keywords: [
            'saudi_arabia',
            'flag',
            'saudi arabia',
        ],
    },
    {
        name: 'solomon_islands',
        code: '🇸🇧',
        keywords: [
            'solomon_islands',
            'flag',
            'island',
            'solomon',
        ],
    },
    {
        name: 'seychelles',
        code: '🇸🇨',
        keywords: [
            'seychelles',
            'flag',
        ],
    },
    {
        name: 'sudan',
        code: '🇸🇩',
        keywords: [
            'sudan',
            'flag',
        ],
    },
    {
        name: 'sweden',
        code: '🇸🇪',
        keywords: [
            'sweden',
            'flag',
        ],
    },
    {
        name: 'singapore',
        code: '🇸🇬',
        keywords: [
            'singapore',
            'flag',
        ],
    },
    {
        name: 'st_helena',
        code: '🇸🇭',
        keywords: [
            'st_helena',
            'flag',
            'helena',
            'saint',
        ],
    },
    {
        name: 'slovenia',
        code: '🇸🇮',
        keywords: [
            'slovenia',
            'flag',
        ],
    },
    {
        name: 'svalbard_jan_mayen',
        code: '🇸🇯',
        keywords: [
            'svalbard_jan_mayen',
            'flag',
            'jan mayen',
            'svalbard',
        ],
    },
    {
        name: 'slovakia',
        code: '🇸🇰',
        keywords: [
            'slovakia',
            'flag',
        ],
    },
    {
        name: 'sierra_leone',
        code: '🇸🇱',
        keywords: [
            'sierra_leone',
            'flag',
            'sierra leone',
        ],
    },
    {
        name: 'san_marino',
        code: '🇸🇲',
        keywords: [
            'san_marino',
            'flag',
            'san marino',
        ],
    },
    {
        name: 'senegal',
        code: '🇸🇳',
        keywords: [
            'senegal',
            'flag',
        ],
    },
    {
        name: 'somalia',
        code: '🇸🇴',
        keywords: [
            'somalia',
            'flag',
        ],
    },
    {
        name: 'suriname',
        code: '🇸🇷',
        keywords: [
            'suriname',
            'flag',
        ],
    },
    {
        name: 'south_sudan',
        code: '🇸🇸',
        keywords: [
            'south_sudan',
            'flag',
            'south',
            'south sudan',
            'sudan',
        ],
    },
    {
        name: 'sao_tome_principe',
        code: '🇸🇹',
        keywords: [
            'sao_tome_principe',
            'flag',
            'principe',
            'príncipe',
            'sao tome',
            'são tomé',
        ],
    },
    {
        name: 'el_salvador',
        code: '🇸🇻',
        keywords: [
            'el_salvador',
            'el salvador',
            'flag',
        ],
    },
    {
        name: 'sint_maarten',
        code: '🇸🇽',
        keywords: [
            'sint_maarten',
            'flag',
            'maarten',
            'sint',
        ],
    },
    {
        name: 'syria',
        code: '🇸🇾',
        keywords: [
            'syria',
            'flag',
        ],
    },
    {
        name: 'swaziland',
        code: '🇸🇿',
        keywords: [
            'swaziland',
            'flag',
        ],
    },
    {
        name: 'tristan_da_cunha',
        code: '🇹🇦',
        keywords: [
            'tristan_da_cunha',
            'flag',
            'tristan da cunha',
        ],
    },
    {
        name: 'turks_caicos_islands',
        code: '🇹🇨',
        keywords: [
            'turks_caicos_islands',
            'caicos',
            'flag',
            'island',
            'turks',
        ],
    },
    {
        name: 'chad',
        code: '🇹🇩',
        keywords: [
            'chad',
            'flag',
        ],
    },
    {
        name: 'french_southern_territories',
        code: '🇹🇫',
        keywords: [
            'french_southern_territories',
            'antarctic',
            'flag',
            'french',
        ],
    },
    {
        name: 'togo',
        code: '🇹🇬',
        keywords: [
            'togo',
            'flag',
        ],
    },
    {
        name: 'thailand',
        code: '🇹🇭',
        keywords: [
            'thailand',
            'flag',
        ],
    },
    {
        name: 'tajikistan',
        code: '🇹🇯',
        keywords: [
            'tajikistan',
            'flag',
        ],
    },
    {
        name: 'tokelau',
        code: '🇹🇰',
        keywords: [
            'tokelau',
            'flag',
        ],
    },
    {
        name: 'timor_leste',
        code: '🇹🇱',
        keywords: [
            'timor_leste',
            'east',
            'east timor',
            'flag',
            'timor-leste',
        ],
    },
    {
        name: 'turkmenistan',
        code: '🇹🇲',
        keywords: [
            'turkmenistan',
            'flag',
        ],
    },
    {
        name: 'tunisia',
        code: '🇹🇳',
        keywords: [
            'tunisia',
            'flag',
        ],
    },
    {
        name: 'tonga',
        code: '🇹🇴',
        keywords: [
            'tonga',
            'flag',
        ],
    },
    {
        name: 'tr',
        code: '🇹🇷',
        keywords: [
            'turkey',
            'tr',
            'flag',
        ],
    },
    {
        name: 'trinidad_tobago',
        code: '🇹🇹',
        keywords: [
            'trinidad_tobago',
            'flag',
            'tobago',
            'trinidad',
        ],
    },
    {
        name: 'tuvalu',
        code: '🇹🇻',
        keywords: [
            'tuvalu',
            'flag',
        ],
    },
    {
        name: 'taiwan',
        code: '🇹🇼',
        keywords: [
            'taiwan',
            'china',
            'flag',
        ],
    },
    {
        name: 'tanzania',
        code: '🇹🇿',
        keywords: [
            'tanzania',
            'flag',
        ],
    },
    {
        name: 'ukraine',
        code: '🇺🇦',
        keywords: [
            'ukraine',
            'flag',
        ],
    },
    {
        name: 'uganda',
        code: '🇺🇬',
        keywords: [
            'uganda',
            'flag',
        ],
    },
    {
        name: 'us_outlying_islands',
        code: '🇺🇲',
        keywords: [
            'us_outlying_islands',
            'america',
            'flag',
            'island',
            'minor outlying',
            'united',
            'united states',
            'us',
            'usa',
        ],
    },
    {
        name: 'united_nations',
        code: '🇺🇳',
        keywords: [
            'united_nations',
            'flag',
        ],
    },
    {
        name: 'us',
        code: '🇺🇸',
        keywords: [
            'flag',
            'united',
            'america',
            'us',
            'stars and stripes',
            'united states',
        ],
    },
    {
        name: 'uruguay',
        code: '🇺🇾',
        keywords: [
            'uruguay',
            'flag',
        ],
    },
    {
        name: 'uzbekistan',
        code: '🇺🇿',
        keywords: [
            'uzbekistan',
            'flag',
        ],
    },
    {
        name: 'vatican_city',
        code: '🇻🇦',
        keywords: [
            'vatican_city',
            'flag',
            'vatican',
        ],
    },
    {
        name: 'st_vincent_grenadines',
        code: '🇻🇨',
        keywords: [
            'st_vincent_grenadines',
            'flag',
            'grenadines',
            'saint',
            'vincent',
        ],
    },
    {
        name: 'venezuela',
        code: '🇻🇪',
        keywords: [
            'venezuela',
            'flag',
        ],
    },
    {
        name: 'british_virgin_islands',
        code: '🇻🇬',
        keywords: [
            'british_virgin_islands',
            'british',
            'flag',
            'island',
            'virgin',
        ],
    },
    {
        name: 'us_virgin_islands',
        code: '🇻🇮',
        keywords: [
            'us_virgin_islands',
            'america',
            'american',
            'flag',
            'island',
            'united',
            'united states',
            'us',
            'usa',
            'virgin',
        ],
    },
    {
        name: 'vietnam',
        code: '🇻🇳',
        keywords: [
            'vietnam',
            'flag',
            'viet nam',
        ],
    },
    {
        name: 'vanuatu',
        code: '🇻🇺',
        keywords: [
            'vanuatu',
            'flag',
        ],
    },
    {
        name: 'wallis_futuna',
        code: '🇼🇫',
        keywords: [
            'wallis_futuna',
            'flag',
            'futuna',
            'wallis',
        ],
    },
    {
        name: 'samoa',
        code: '🇼🇸',
        keywords: [
            'samoa',
            'flag',
        ],
    },
    {
        name: 'kosovo',
        code: '🇽🇰',
        keywords: [
            'kosovo',
            'flag',
        ],
    },
    {
        name: 'yemen',
        code: '🇾🇪',
        keywords: [
            'yemen',
            'flag',
        ],
    },
    {
        name: 'mayotte',
        code: '🇾🇹',
        keywords: [
            'mayotte',
            'flag',
        ],
    },
    {
        name: 'south_africa',
        code: '🇿🇦',
        keywords: [
            'south_africa',
            'flag',
            'south',
            'south africa',
        ],
    },
    {
        name: 'zambia',
        code: '🇿🇲',
        keywords: [
            'zambia',
            'flag',
        ],
    },
    {
        name: 'zimbabwe',
        code: '🇿🇼',
        keywords: [
            'zimbabwe',
            'flag',
        ],
    },
    {
        name: 'england',
        code: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        keywords: [
            'england',
            'flag',
        ],
    },
    {
        name: 'scotland',
        code: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        keywords: [
            'scotland',
            'flag',
        ],
    },
    {
        name: 'wales',
        code: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
        keywords: [
            'wales',
            'flag',
        ],
    },
];

export {skinTones};
export default emojis;
