import CONST from '../src/CONST';

/*
 * This list is generated from the code here https://github.com/amurani/unicode-emoji-list
 * Each code is then converted to hex by replacing the "U+" with "0x"
 * Each hex is then converted to a string using this function (each section is defined as "emojis" in this function)
 * for (var i=0; i<emojis.length; i++) {
 *  newCode = '';
 *  emojis[i].code.forEach(codePiece => {
 *      newCode += String.fromCodePoint(codePiece);
 *  });
 *  emojis[i].code=newCode;
 *  //console.log(newCode);
 *  if (emojis[i].types) {
 *      newTypesArray = [];
 *      emojis[i].types.forEach(type => {
 *          typeCode = '';
 *          type.forEach(code => {
 *               typeCode += String.fromCodePoint(code);
 *          });
 *          newTypesArray.push(typeCode);
 *      });
 *      //console.log(newTypesArray);
 *      emojis[i].types = newTypesArray
 *  }
 * }
 */


// BEFORE YOU EDIT THIS, PLEASE SEE WARNINGS IN EmojiPickerMenu.js
const skinTones = [{
    code: '🖐',
    skinTone: 'default',
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
        code: 'Smileys & People',
        header: true,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: '😀',
        keywords: [
            'face',
            'grin',
        ],
    },
    {
        code: '😁',
        keywords: [
            'eye',
            'face',
            'grin',
            'smile',
        ],
    },
    {
        code: '😂',
        keywords: [
            'face',
            'joy',
            'laugh',
            'tear',
        ],
    },
    {
        code: '🤣',
        keywords: [
            'face',
            'floor',
            'laugh',
            'lol',
            'rofl',
            'rolling',
        ],
    },
    {
        code: '😃',
        keywords: [
            'face',
            'mouth',
            'open',
            'smile',
        ],
    },
    {
        code: '😄',
        keywords: [
            'eye',
            'face',
            'mouth',
            'open',
            'smile',
        ],
    },
    {
        code: '😅',
        keywords: [
            'cold',
            'face',
            'open',
            'smile',
            'sweat',
        ],
    },
    {
        code: '😆',
        keywords: [
            'face',
            'laugh',
            'mouth',
            'open',
            'satisfied',
            'smile',
        ],
    },
    {
        code: '😉',
        keywords: [
            'face',
            'wink',
        ],
    },
    {
        code: '😊',
        keywords: [
            'blush',
            'eye',
            'face',
            'smile',
        ],
    },
    {
        code: '😋',
        keywords: [
            'delicious',
            'face',
            'savouring',
            'smile',
            'um',
            'yum',
        ],
    },
    {
        code: '😎',
        keywords: [
            'bright',
            'cool',
            'eye',
            'eyewear',
            'face',
            'glasses',
            'smile',
            'sun',
            'sunglasses',
            'weather',
        ],
    },
    {
        code: '😍',
        keywords: [
            'eye',
            'face',
            'heart',
            'love',
            'smile',
        ],
    },
    {
        code: '😘',
        keywords: [
            'face',
            'heart',
            'kiss',
        ],
    },
    {
        code: '😗',
        keywords: [
            'face',
            'kiss',
        ],
    },
    {
        code: '😙',
        keywords: [
            'eye',
            'face',
            'kiss',
            'smile',
        ],
    },
    {
        code: '😚',
        keywords: [
            'closed',
            'eye',
            'face',
            'kiss',
        ],
    },
    {
        code: '🙂',
        keywords: [
            'face',
            'smile',
        ],
    },
    {
        code: '🤗',
        keywords: [
            'face',
            'hug',
            'hugging',
        ],
    },
    {
        code: '🤔',
        keywords: [
            'face',
            'thinking',
        ],
    },
    {
        code: '😐',
        keywords: [
            'deadpan',
            'face',
            'neutral',
        ],
    },
    {
        code: '😑',
        keywords: [
            'expressionless',
            'face',
            'inexpressive',
            'unexpressive',
        ],
    },
    {
        code: '😶',
        keywords: [
            'face',
            'mouth',
            'quiet',
            'silent',
        ],
    },
    {
        code: '🙄',
        keywords: [
            'eyes',
            'face',
            'rolling',
        ],
    },
    {
        code: '😏',
        keywords: [
            'face',
            'smirk',
        ],
    },
    {
        code: '😣',
        keywords: [
            'face',
            'persevere',
        ],
    },
    {
        code: '😥',
        keywords: [
            'disappointed',
            'face',
            'relieved',
            'whew',
        ],
    },
    {
        code: '😮',
        keywords: [
            'face',
            'mouth',
            'open',
            'sympathy',
        ],
    },
    {
        code: '🤐',
        keywords: [
            'face',
            'mouth',
            'zipper',
        ],
    },
    {
        code: '😯',
        keywords: [
            'face',
            'hushed',
            'stunned',
            'surprised',
        ],
    },
    {
        code: '😪',
        keywords: [
            'face',
            'sleep',
        ],
    },
    {
        code: '😫',
        keywords: [
            'face',
            'tired',
        ],
    },
    {
        code: '😴',
        keywords: [
            'face',
            'sleep',
            'zzz',
        ],
    },
    {
        code: '😌',
        keywords: [
            'face',
            'relieved',
        ],
    },
    {
        code: '🤓',
        keywords: [
            'face',
            'geek',
            'nerd',
        ],
    },
    {
        code: '😛',
        keywords: [
            'face',
            'tongue',
        ],
    },
    {
        code: '😜',
        keywords: [
            'eye',
            'face',
            'joke',
            'tongue',
            'wink',
        ],
    },
    {
        code: '😝',
        keywords: [
            'eye',
            'face',
            'horrible',
            'taste',
            'tongue',
        ],
    },
    {
        code: '🤤',
        keywords: [
            'drooling',
            'face',
        ],
    },
    {
        code: '😒',
        keywords: [
            'face',
            'unamused',
            'unhappy',
        ],
    },
    {
        code: '😓',
        keywords: [
            'cold',
            'face',
            'sweat',
        ],
    },
    {
        code: '😔',
        keywords: [
            'dejected',
            'face',
            'pensive',
        ],
    },
    {
        code: '😕',
        keywords: [
            'confused',
            'face',
        ],
    },
    {
        code: '🙃',
        keywords: [
            'face',
            'upside-down',
        ],
    },
    {
        code: '🤑',
        keywords: [
            'face',
            'money',
            'mouth',
        ],
    },
    {
        code: '😲',
        keywords: [
            'astonished',
            'face',
            'shocked',
            'totally',
        ],
    },
    {
        code: '🙁',
        keywords: [
            'face',
            'frown',
        ],
    },
    {
        code: '😖',
        keywords: [
            'confounded',
            'face',
        ],
    },
    {
        code: '😞',
        keywords: [
            'disappointed',
            'face',
        ],
    },
    {
        code: '😟',
        keywords: [
            'face',
            'worried',
        ],
    },
    {
        code: '😤',
        keywords: [
            'face',
            'triumph',
            'won',
        ],
    },
    {
        code: '😢',
        keywords: [
            'cry',
            'face',
            'sad',
            'tear',
        ],
    },
    {
        code: '😭',
        keywords: [
            'cry',
            'face',
            'sad',
            'sob',
            'tear',
        ],
    },
    {
        code: '😦',
        keywords: [
            'face',
            'frown',
            'mouth',
            'open',
        ],
    },
    {
        code: '😧',
        keywords: [
            'anguished',
            'face',
        ],
    },
    {
        code: '😨',
        keywords: [
            'face',
            'fear',
            'fearful',
            'scared',
        ],
    },
    {
        code: '😩',
        keywords: [
            'face',
            'tired',
            'weary',
        ],
    },
    {
        code: '😬',
        keywords: [
            'face',
            'grimace',
        ],
    },
    {
        code: '😰',
        keywords: [
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
        code: '😱',
        keywords: [
            'face',
            'fear',
            'fearful',
            'munch',
            'scared',
            'scream',
        ],
    },
    {
        code: '😳',
        keywords: [
            'dazed',
            'face',
            'flushed',
        ],
    },
    {
        code: '😵',
        keywords: [
            'dizzy',
            'face',
        ],
    },
    {
        code: '😡',
        keywords: [
            'angry',
            'face',
            'mad',
            'pouting',
            'rage',
            'red',
        ],
    },
    {
        code: '😠',
        keywords: [
            'angry',
            'face',
            'mad',
        ],
    },
    {
        code: '😇',
        keywords: [
            'angel',
            'face',
            'fairy tale',
            'fantasy',
            'halo',
            'innocent',
            'smile',
        ],
    },
    {
        code: '🤠',
        keywords: [
            'cowboy',
            'cowgirl',
            'face',
            'hat',
        ],
    },
    {
        code: '🤡',
        keywords: [
            'clown',
            'face',
        ],
    },
    {
        code: '🤥',
        keywords: [
            'face',
            'lie',
            'pinocchio',
        ],
    },
    {
        code: '😷',
        keywords: [
            'cold',
            'doctor',
            'face',
            'mask',
            'medicine',
            'sick',
        ],
    },
    {
        code: '🤒',
        keywords: [
            'face',
            'ill',
            'sick',
            'thermometer',
        ],
    },
    {
        code: '🤕',
        keywords: [
            'bandage',
            'face',
            'hurt',
            'injury',
        ],
    },
    {
        code: '🤢',
        keywords: [
            'face',
            'nauseated',
            'vomit',
        ],
    },
    {
        code: '🤧',
        keywords: [
            'face',
            'gesundheit',
            'sneeze',
        ],
    },
    {
        code: '😈',
        keywords: [
            'face',
            'fairy tale',
            'fantasy',
            'horns',
            'smile',
        ],
    },
    {
        code: '👿',
        keywords: [
            'demon',
            'devil',
            'face',
            'fairy tale',
            'fantasy',
            'imp',
        ],
    },
    {
        code: '👹',
        keywords: [
            'creature',
            'face',
            'fairy tale',
            'fantasy',
            'japanese',
            'monster',
            'ogre',
        ],
    },
    {
        code: '👺',
        keywords: [
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
        code: '💀',
        keywords: [
            'body',
            'death',
            'face',
            'fairy tale',
            'monster',
            'skull',
        ],
    },
    {
        code: '☠',
        keywords: [
            'body',
            'crossbones',
            'death',
            'face',
            'monster',
            'skull',
        ],
    },
    {
        code: '👻',
        keywords: [
            'creature',
            'face',
            'fairy tale',
            'fantasy',
            'ghost',
            'monster',
        ],
    },
    {
        code: '👽',
        keywords: [
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
        code: '👾',
        keywords: [
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
        code: '🤖',
        keywords: [
            'face',
            'monster',
            'robot',
        ],
    },
    {
        code: '💩',
        keywords: [
            'comic',
            'dung',
            'face',
            'monster',
            'poo',
            'poop',
        ],
    },
    {
        code: '😺',
        keywords: [
            'cat',
            'face',
            'mouth',
            'open',
            'smile',
        ],
    },
    {
        code: '😸',
        keywords: [
            'cat',
            'eye',
            'face',
            'grin',
            'smile',
        ],
    },
    {
        code: '😹',
        keywords: [
            'cat',
            'face',
            'joy',
            'tear',
        ],
    },
    {
        code: '😻',
        keywords: [
            'cat',
            'eye',
            'face',
            'heart',
            'love',
            'smile',
        ],
    },
    {
        code: '😼',
        keywords: [
            'cat',
            'face',
            'ironic',
            'smile',
            'wry',
        ],
    },
    {
        code: '😽',
        keywords: [
            'cat',
            'eye',
            'face',
            'kiss',
        ],
    },
    {
        code: '🙀',
        keywords: [
            'cat',
            'face',
            'oh',
            'surprised',
            'weary',
        ],
    },
    {
        code: '😿',
        keywords: [
            'cat',
            'cry',
            'face',
            'sad',
            'tear',
        ],
    },
    {
        code: '😾',
        keywords: [
            'cat',
            'face',
            'pouting',
        ],
    },
    {
        code: '🙈',
        keywords: [
            'evil',
            'face',
            'forbidden',
            'gesture',
            'monkey',
            'no',
            'not',
            'prohibited',
            'see',
        ],
    },
    {
        code: '🙉',
        keywords: [
            'evil',
            'face',
            'forbidden',
            'gesture',
            'hear',
            'monkey',
            'no',
            'not',
            'prohibited',
        ],
    },
    {
        code: '🙊',
        keywords: [
            'evil',
            'face',
            'forbidden',
            'gesture',
            'monkey',
            'no',
            'not',
            'prohibited',
            'speak',
        ],
    },
    {
        code: '👦',
        keywords: [
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
        code: '👧',
        keywords: [
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
        code: '👨',
        keywords: [
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
        code: '👩',
        keywords: [
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
        code: '👴',
        keywords: [
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
        code: '👵',
        keywords: [
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
        code: '👶',
        keywords: [
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
        code: '👱',
        keywords: [
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
        code: '👮',
        keywords: [
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
        code: '👲',
        keywords: [
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
        code: '👳',
        keywords: [
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
        code: '👷',
        keywords: [
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
        code: '👸',
        keywords: [
            'fairy tale',
            'fantasy',
            'princess',
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
        code: '🤴',
        keywords: [
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
        code: '🕵',
        keywords: [
            'detective',
            'sleuth',
            'spy',
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
        code: '🎅',
        keywords: [
            'activity',
            'celebration',
            'christmas',
            'fairy tale',
            'fantasy',
            'father',
            'santa',
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
        code: '🤶',
        keywords: [
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
        code: '👰',
        keywords: [
            'bride',
            'veil',
            'wedding',
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
        code: '🤵',
        keywords: [
            'groom',
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
        code: '💆',
        keywords: [
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
        code: '💇',
        keywords: [
            'barber',
            'beauty',
            'haircut',
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
        code: '🙍',
        keywords: [
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
        code: '🙎',
        keywords: [
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
        code: '🙅',
        keywords: [
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
        code: '🙆',
        keywords: [
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
        code: '💁',
        keywords: [
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
        code: '🤷',
        keywords: [
            'doubt',
            'ignorance',
            'indifference',
            'shrug',
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
        code: '🙋',
        keywords: [
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
        code: '🤦',
        keywords: [
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
        code: '🙇',
        keywords: [
            'apology',
            'bow',
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
        code: '🚶',
        keywords: [
            'hike',
            'pedestrian',
            'walk',
            'walking',
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
        code: '🏃',
        keywords: [
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
        code: '💃',
        keywords: [
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
        code: '🕺',
        keywords: [
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
        code: '🤰',
        keywords: [
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
        code: '👯',
        keywords: [
            'bunny',
            'dancer',
            'ear',
            'girl',
            'woman',
        ],
    },
    {
        code: '🕴',
        keywords: [
            'business',
            'man',
            'suit',
        ],
    },
    {
        code: '🗣',
        keywords: [
            'face',
            'head',
            'silhouette',
            'speak',
            'speaking',
        ],
    },
    {
        code: '👤',
        keywords: [
            'bust',
            'silhouette',
        ],
    },
    {
        code: '👥',
        keywords: [
            'bust',
            'silhouette',
        ],
    },
    {
        code: '👫',
        keywords: [
            'couple',
            'hand',
            'hold',
            'man',
            'woman',
        ],
    },
    {
        code: '👬',
        keywords: [
            'couple',
            'gemini',
            'hand',
            'hold',
            'man',
            'twins',
            'zodiac',
        ],
    },
    {
        code: '👭',
        keywords: [
            'couple',
            'hand',
            'hold',
            'woman',
        ],
    },
    {
        code: '💏',
        keywords: [
            'couple',
            'kiss',
            'romance',
        ],
    },
    {
        code: '💑',
        keywords: [
            'couple',
            'heart',
            'love',
            'romance',
        ],
    },
    {
        code: '👪',
        keywords: [
            'child',
            'family',
            'father',
            'mother',
        ],
    },
    {
        code: '👨‍👩‍👦',
        keywords: [
            'boy',
            'family',
            'man',
            'woman',
        ],
    },
    {
        code: '👨‍👩‍👧',
        keywords: [
            'family',
            'girl',
            'man',
            'woman',
        ],
    },
    {
        code: '👨‍👩‍👧‍👦',
        keywords: [
            'boy',
            'family',
            'girl',
            'man',
            'woman',
        ],
    },
    {
        code: '👨‍👩‍👦‍👦',
        keywords: [
            'boy',
            'family',
            'man',
            'woman',
        ],
    },
    {
        code: '👨‍👩‍👧‍👧',
        keywords: [
            'family',
            'girl',
            'man',
            'woman',
        ],
    },
    {
        code: '👨‍👨‍👦',
        keywords: [
            'boy',
            'family',
            'man',
        ],
    },
    {
        code: '👨‍👨‍👧',
        keywords: [
            'family',
            'girl',
            'man',
        ],
    },
    {
        code: '👨‍👨‍👧‍👦',
        keywords: [
            'boy',
            'family',
            'girl',
            'man',
        ],
    },
    {
        code: '👨‍👨‍👦‍👦',
        keywords: [
            'boy',
            'family',
            'man',
        ],
    },
    {
        code: '👨‍👨‍👧‍👧',
        keywords: [
            'family',
            'girl',
            'man',
        ],
    },
    {
        code: '👩‍👩‍👦',
        keywords: [
            'boy',
            'family',
            'woman',
        ],
    },
    {
        code: '👩‍👩‍👧',
        keywords: [
            'family',
            'girl',
            'woman',
        ],
    },
    {
        code: '👩‍👩‍👧‍👦',
        keywords: [
            'boy',
            'family',
            'girl',
            'woman',
        ],
    },
    {
        code: '👩‍👩‍👦‍👦',
        keywords: [
            'boy',
            'family',
            'woman',
        ],
    },
    {
        code: '👩‍👩‍👧‍👧',
        keywords: [
            'family',
            'girl',
            'woman',
        ],
    },
    {
        code: '💪',
        keywords: [
            'biceps',
            'body',
            'comic',
            'flex',
            'muscle',
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
        code: '🤳',
        keywords: [
            'camera',
            'phone',
            'selfie',
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
        code: '👈',
        keywords: [
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
        code: '👉',
        keywords: [
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
        code: '☝',
        keywords: [
            'body',
            'finger',
            'hand',
            'index',
            'point',
            'up',
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
        code: '👆',
        keywords: [
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
        code: '🖕',
        keywords: [
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
        code: '👇',
        keywords: [
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
        code: '✌',
        keywords: [
            'body',
            'hand',
            'v',
            'victory',
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
        code: '🤞',
        keywords: [
            'cross',
            'finger',
            'hand',
            'luck',
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
        code: '🖖',
        keywords: [
            'body',
            'finger',
            'hand',
            'spock',
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
        code: '🤘',
        keywords: [
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
        code: '🤙',
        keywords: [
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
        code: '🖐',
        keywords: [
            'body',
            'finger',
            'hand',
            'splayed',
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
        code: '✋',
        keywords: [
            'body',
            'hand',
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
        code: '👌',
        keywords: [
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
        code: '👍',
        keywords: [
            '+1',
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
        code: '👎',
        keywords: [
            '-1',
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
        code: '✊',
        keywords: [
            'body',
            'clenched',
            'fist',
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
        code: '👊',
        keywords: [
            'body',
            'clenched',
            'fist',
            'hand',
            'punch',
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
        code: '🤛',
        keywords: [
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
        code: '🤜',
        keywords: [
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
        code: '🤚',
        keywords: [
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
        code: '👋',
        keywords: [
            'body',
            'hand',
            'wave',
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
        code: '👏',
        keywords: [
            'body',
            'clap',
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
        code: '✍',
        keywords: [
            'body',
            'hand',
            'write',
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
        code: '👐',
        keywords: [
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
        code: '🙌',
        keywords: [
            'body',
            'celebration',
            'gesture',
            'hand',
            'hooray',
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
        code: '🙏',
        keywords: [
            'ask',
            'body',
            'bow',
            'folded',
            'gesture',
            'hand',
            'please',
            'pray',
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
        code: '🤝',
        keywords: [
            'agreement',
            'hand',
            'handshake',
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
        code: '💅',
        keywords: [
            'body',
            'care',
            'cosmetics',
            'manicure',
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
        code: '👂',
        keywords: [
            'body',
            'ear',
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
        code: '👃',
        keywords: [
            'body',
            'nose',
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
        code: '👣',
        keywords: [
            'body',
            'clothing',
            'footprint',
            'print',
        ],
    },
    {
        code: '👀',
        keywords: [
            'body',
            'eye',
            'face',
        ],
    },
    {
        code: '👁',
        keywords: [
            'body',
            'eye',
        ],
    },
    {
        code: '👁‍🗨',
        keywords: [
            'bubble',
            'eye',
            'speech',
            'witness',
        ],
    },
    {
        code: '👅',
        keywords: [
            'body',
            'tongue',
        ],
    },
    {
        code: '👄',
        keywords: [
            'body',
            'lips',
            'mouth',
        ],
    },
    {
        code: '💋',
        keywords: [
            'heart',
            'kiss',
            'lips',
            'mark',
            'romance',
        ],
    },
    {
        code: '💘',
        keywords: [
            'arrow',
            'cupid',
            'heart',
            'romance',
        ],
    },
    {
        code: '❤',
        keywords: [
            'heart',
        ],
    },
    {
        code: '💓',
        keywords: [
            'beating',
            'heart',
            'heartbeat',
            'pulsating',
        ],
    },
    {
        code: '💔',
        keywords: [
            'break',
            'broken',
            'heart',
        ],
    },
    {
        code: '💕',
        keywords: [
            'heart',
            'love',
        ],
    },
    {
        code: '💖',
        keywords: [
            'excited',
            'heart',
            'sparkle',
        ],
    },
    {
        code: '💗',
        keywords: [
            'excited',
            'growing',
            'heart',
            'heartpulse',
            'nervous',
        ],
    },
    {
        code: '💙',
        keywords: [
            'blue',
            'heart',
        ],
    },
    {
        code: '💚',
        keywords: [
            'green',
            'heart',
        ],
    },
    {
        code: '💛',
        keywords: [
            'heart',
            'yellow',
        ],
    },
    {
        code: '💜',
        keywords: [
            'heart',
            'purple',
        ],
    },
    {
        code: '🖤',
        keywords: [
            'black',
            'evil',
            'heart',
            'wicked',
        ],
    },
    {
        code: '💝',
        keywords: [
            'heart',
            'ribbon',
            'valentine',
        ],
    },
    {
        code: '💞',
        keywords: [
            'heart',
            'revolving',
        ],
    },
    {
        code: '💟',
        keywords: [
            'heart',
        ],
    },
    {
        code: '❣',
        keywords: [
            'exclamation',
            'heart',
            'mark',
            'punctuation',
        ],
    },
    {
        code: '💌',
        keywords: [
            'heart',
            'letter',
            'love',
            'mail',
            'romance',
        ],
    },
    {
        code: '💤',
        keywords: [
            'comic',
            'sleep',
            'zzz',
        ],
    },
    {
        code: '💢',
        keywords: [
            'angry',
            'comic',
            'mad',
        ],
    },
    {
        code: '💣',
        keywords: [
            'bomb',
            'comic',
        ],
    },
    {
        code: '💥',
        keywords: [
            'boom',
            'collision',
            'comic',
        ],
    },
    {
        code: '💦',
        keywords: [
            'comic',
            'splashing',
            'sweat',
        ],
    },
    {
        code: '💨',
        keywords: [
            'comic',
            'dash',
            'running',
        ],
    },
    {
        code: '💫',
        keywords: [
            'comic',
            'dizzy',
            'star',
        ],
    },
    {
        code: '💬',
        keywords: [
            'balloon',
            'bubble',
            'comic',
            'dialog',
            'speech',
        ],
    },
    {
        code: '🗨',
        keywords: [
            'dialog',
            'speech',
        ],
    },
    {
        code: '🗯',
        keywords: [
            'angry',
            'balloon',
            'bubble',
            'mad',
        ],
    },
    {
        code: '💭',
        keywords: [
            'balloon',
            'bubble',
            'comic',
            'thought',
        ],
    },
    {
        code: '🕳',
        keywords: [
            'hole',
        ],
    },
    {
        code: '👓',
        keywords: [
            'clothing',
            'eye',
            'eyeglasses',
            'eyewear',
            'glasses',
        ],
    },
    {
        code: '🕶',
        keywords: [
            'dark',
            'eye',
            'eyewear',
            'glasses',
            'sunglasses',
        ],
    },
    {
        code: '👔',
        keywords: [
            'clothing',
            'necktie',
        ],
    },
    {
        code: '👕',
        keywords: [
            'clothing',
            'shirt',
            'tshirt',
        ],
    },
    {
        code: '👖',
        keywords: [
            'clothing',
            'jeans',
            'pants',
            'trousers',
        ],
    },
    {
        code: '👗',
        keywords: [
            'clothing',
            'dress',
        ],
    },
    {
        code: '👘',
        keywords: [
            'clothing',
            'kimono',
        ],
    },
    {
        code: '👙',
        keywords: [
            'bikini',
            'clothing',
            'swim',
        ],
    },
    {
        code: '👚',
        keywords: [
            'clothing',
            'woman',
        ],
    },
    {
        code: '👛',
        keywords: [
            'clothing',
            'coin',
            'purse',
        ],
    },
    {
        code: '👜',
        keywords: [
            'bag',
            'clothing',
            'handbag',
        ],
    },
    {
        code: '👝',
        keywords: [
            'bag',
            'clothing',
            'pouch',
        ],
    },
    {
        code: '🛍',
        keywords: [
            'bag',
            'hotel',
            'shopping',
        ],
    },
    {
        code: '🎒',
        keywords: [
            'activity',
            'bag',
            'satchel',
            'school',
        ],
    },
    {
        code: '👞',
        keywords: [
            'clothing',
            'man',
            'shoe',
        ],
    },
    {
        code: '👟',
        keywords: [
            'athletic',
            'clothing',
            'shoe',
            'sneaker',
        ],
    },
    {
        code: '👠',
        keywords: [
            'clothing',
            'heel',
            'shoe',
            'woman',
        ],
    },
    {
        code: '👡',
        keywords: [
            'clothing',
            'sandal',
            'shoe',
            'woman',
        ],
    },
    {
        code: '👢',
        keywords: [
            'boot',
            'clothing',
            'shoe',
            'woman',
        ],
    },
    {
        code: '👑',
        keywords: [
            'clothing',
            'crown',
            'king',
            'queen',
        ],
    },
    {
        code: '👒',
        keywords: [
            'clothing',
            'hat',
            'woman',
        ],
    },
    {
        code: '🎩',
        keywords: [
            'activity',
            'clothing',
            'entertainment',
            'hat',
            'top',
            'tophat',
        ],
    },
    {
        code: '🎓',
        keywords: [
            'activity',
            'cap',
            'celebration',
            'clothing',
            'graduation',
            'hat',
        ],
    },
    {
        code: '⛑',
        keywords: [
            'aid',
            'cross',
            'face',
            'hat',
            'helmet',
        ],
    },
    {
        code: '📿',
        keywords: [
            'beads',
            'clothing',
            'necklace',
            'prayer',
            'religion',
        ],
    },
    {
        code: '💄',
        keywords: [
            'cosmetics',
            'lipstick',
            'makeup',
        ],
    },
    {
        code: '💍',
        keywords: [
            'diamond',
            'ring',
            'romance',
        ],
    },
    {
        code: '💎',
        keywords: [
            'diamond',
            'gem',
            'jewel',
            'romance',
        ],
    },
    {
        code: 'Animals & Nature',
        header: true,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: '🐵',
        keywords: [
            'face',
            'monkey',
        ],
    },
    {
        code: '🐒',
        keywords: [
            'monkey',
        ],
    },
    {
        code: '🦍',
        keywords: [
            'gorilla',
        ],
    },
    {
        code: '🐶',
        keywords: [
            'dog',
            'face',
            'pet',
        ],
    },
    {
        code: '🐕',
        keywords: [
            'dog',
            'pet',
        ],
    },
    {
        code: '🐩',
        keywords: [
            'dog',
            'poodle',
        ],
    },
    {
        code: '🐺',
        keywords: [
            'face',
            'wolf',
        ],
    },
    {
        code: '🦊',
        keywords: [
            'face',
            'fox',
        ],
    },
    {
        code: '🐱',
        keywords: [
            'cat',
            'face',
            'pet',
        ],
    },
    {
        code: '🐈',
        keywords: [
            'cat',
            'pet',
        ],
    },
    {
        code: '🦁',
        keywords: [
            'face',
            'leo',
            'lion',
            'zodiac',
        ],
    },
    {
        code: '🐯',
        keywords: [
            'face',
            'tiger',
        ],
    },
    {
        code: '🐅',
        keywords: [
            'tiger',
        ],
    },
    {
        code: '🐆',
        keywords: [
            'leopard',
        ],
    },
    {
        code: '🐴',
        keywords: [
            'face',
            'horse',
        ],
    },
    {
        code: '🐎',
        keywords: [
            'horse',
            'racehorse',
            'racing',
        ],
    },
    {
        code: '🦌',
        keywords: [
            'deer',
        ],
    },
    {
        code: '🦄',
        keywords: [
            'face',
            'unicorn',
        ],
    },
    {
        code: '🐮',
        keywords: [
            'cow',
            'face',
        ],
    },
    {
        code: '🐂',
        keywords: [
            'bull',
            'ox',
            'taurus',
            'zodiac',
        ],
    },
    {
        code: '🐃',
        keywords: [
            'buffalo',
            'water',
        ],
    },
    {
        code: '🐄',
        keywords: [
            'cow',
        ],
    },
    {
        code: '🐷',
        keywords: [
            'face',
            'pig',
        ],
    },
    {
        code: '🐖',
        keywords: [
            'pig',
            'sow',
        ],
    },
    {
        code: '🐗',
        keywords: [
            'boar',
            'pig',
        ],
    },
    {
        code: '🐽',
        keywords: [
            'face',
            'nose',
            'pig',
        ],
    },
    {
        code: '🐏',
        keywords: [
            'aries',
            'ram',
            'sheep',
            'zodiac',
        ],
    },
    {
        code: '🐑',
        keywords: [
            'ewe',
            'sheep',
        ],
    },
    {
        code: '🐐',
        keywords: [
            'capricorn',
            'goat',
            'zodiac',
        ],
    },
    {
        code: '🐪',
        keywords: [
            'camel',
            'dromedary',
            'hump',
        ],
    },
    {
        code: '🐫',
        keywords: [
            'bactrian',
            'camel',
            'hump',
        ],
    },
    {
        code: '🐘',
        keywords: [
            'elephant',
        ],
    },
    {
        code: '🦏',
        keywords: [
            'rhinoceros',
        ],
    },
    {
        code: '🐭',
        keywords: [
            'face',
            'mouse',
        ],
    },
    {
        code: '🐁',
        keywords: [
            'mouse',
        ],
    },
    {
        code: '🐀',
        keywords: [
            'rat',
        ],
    },
    {
        code: '🐹',
        keywords: [
            'face',
            'hamster',
            'pet',
        ],
    },
    {
        code: '🐰',
        keywords: [
            'bunny',
            'face',
            'pet',
            'rabbit',
        ],
    },
    {
        code: '🐇',
        keywords: [
            'bunny',
            'pet',
            'rabbit',
        ],
    },
    {
        code: '🐿',
        keywords: [
            'chipmunk',
        ],
    },
    {
        code: '🦇',
        keywords: [
            'bat',
            'vampire',
        ],
    },
    {
        code: '🐻',
        keywords: [
            'bear',
            'face',
        ],
    },
    {
        code: '🐨',
        keywords: [
            'bear',
            'koala',
        ],
    },
    {
        code: '🐼',
        keywords: [
            'face',
            'panda',
        ],
    },
    {
        code: '🐾',
        keywords: [
            'feet',
            'paw',
            'print',
        ],
    },
    {
        code: '🦃',
        keywords: [
            'turkey',
        ],
    },
    {
        code: '🐔',
        keywords: [
            'chicken',
        ],
    },
    {
        code: '🐓',
        keywords: [
            'rooster',
        ],
    },
    {
        code: '🐣',
        keywords: [
            'baby',
            'chick',
            'hatching',
        ],
    },
    {
        code: '🐤',
        keywords: [
            'baby',
            'chick',
        ],
    },
    {
        code: '🐥',
        keywords: [
            'baby',
            'chick',
        ],
    },
    {
        code: '🐦',
        keywords: [
            'bird',
        ],
    },
    {
        code: '🐧',
        keywords: [
            'penguin',
        ],
    },
    {
        code: '🕊',
        keywords: [
            'bird',
            'dove',
            'fly',
            'peace',
        ],
    },
    {
        code: '🦅',
        keywords: [
            'bird',
            'eagle',
        ],
    },
    {
        code: '🦆',
        keywords: [
            'bird',
            'duck',
        ],
    },
    {
        code: '🦉',
        keywords: [
            'bird',
            'owl',
            'wise',
        ],
    },
    {
        code: '🐸',
        keywords: [
            'face',
            'frog',
        ],
    },
    {
        code: '🐊',
        keywords: [
            'crocodile',
        ],
    },
    {
        code: '🐢',
        keywords: [
            'turtle',
        ],
    },
    {
        code: '🦎',
        keywords: [
            'lizard',
            'reptile',
        ],
    },
    {
        code: '🐍',
        keywords: [
            'bearer',
            'ophiuchus',
            'serpent',
            'snake',
            'zodiac',
        ],
    },
    {
        code: '🐲',
        keywords: [
            'dragon',
            'face',
            'fairy tale',
        ],
    },
    {
        code: '🐉',
        keywords: [
            'dragon',
            'fairy tale',
        ],
    },
    {
        code: '🐳',
        keywords: [
            'face',
            'spouting',
            'whale',
        ],
    },
    {
        code: '🐋',
        keywords: [
            'whale',
        ],
    },
    {
        code: '🐬',
        keywords: [
            'dolphin',
            'flipper',
        ],
    },
    {
        code: '🐟',
        keywords: [
            'fish',
            'pisces',
            'zodiac',
        ],
    },
    {
        code: '🐠',
        keywords: [
            'fish',
            'tropical',
        ],
    },
    {
        code: '🐡',
        keywords: [
            'blowfish',
            'fish',
        ],
    },
    {
        code: '🦈',
        keywords: [
            'fish',
            'shark',
        ],
    },
    {
        code: '🐙',
        keywords: [
            'octopus',
        ],
    },
    {
        code: '🐚',
        keywords: [
            'shell',
            'spiral',
        ],
    },
    {
        code: '🦀',
        keywords: [
            'cancer',
            'crab',
            'zodiac',
        ],
    },
    {
        code: '🦐',
        keywords: [
            'shellfish',
            'shrimp',
            'small',
        ],
    },
    {
        code: '🦑',
        keywords: [
            'molusc',
            'squid',
        ],
    },
    {
        code: '🦋',
        keywords: [
            'butterfly',
            'insect',
            'pretty',
        ],
    },
    {
        code: '🐌',
        keywords: [
            'snail',
        ],
    },
    {
        code: '🐛',
        keywords: [
            'bug',
            'insect',
        ],
    },
    {
        code: '🐜',
        keywords: [
            'ant',
            'insect',
        ],
    },
    {
        code: '🐝',
        keywords: [
            'bee',
            'honeybee',
            'insect',
        ],
    },
    {
        code: '🐞',
        keywords: [
            'beetle',
            'insect',
            'lady beetle',
            'ladybird',
            'ladybug',
        ],
    },
    {
        code: '🕷',
        keywords: [
            'insect',
            'spider',
        ],
    },
    {
        code: '🕸',
        keywords: [
            'spider',
            'web',
        ],
    },
    {
        code: '🦂',
        keywords: [
            'scorpio',
            'scorpion',
            'scorpius',
            'zodiac',
        ],
    },
    {
        code: '💐',
        keywords: [
            'bouquet',
            'flower',
            'plant',
            'romance',
        ],
    },
    {
        code: '🌸',
        keywords: [
            'blossom',
            'cherry',
            'flower',
            'plant',
        ],
    },
    {
        code: '💮',
        keywords: [
            'flower',
        ],
    },
    {
        code: '🏵',
        keywords: [
            'plant',
            'rosette',
        ],
    },
    {
        code: '🌹',
        keywords: [
            'flower',
            'plant',
            'rose',
        ],
    },
    {
        code: '🥀',
        keywords: [
            'flower',
            'wilted',
        ],
    },
    {
        code: '🌺',
        keywords: [
            'flower',
            'hibiscus',
            'plant',
        ],
    },
    {
        code: '🌻',
        keywords: [
            'flower',
            'plant',
            'sun',
            'sunflower',
        ],
    },
    {
        code: '🌼',
        keywords: [
            'blossom',
            'flower',
            'plant',
        ],
    },
    {
        code: '🌷',
        keywords: [
            'flower',
            'plant',
            'tulip',
        ],
    },
    {
        code: '🌱',
        keywords: [
            'plant',
            'seedling',
            'young',
        ],
    },
    {
        code: '🌲',
        keywords: [
            'evergreen',
            'plant',
            'tree',
        ],
    },
    {
        code: '🌳',
        keywords: [
            'deciduous',
            'plant',
            'shedding',
            'tree',
        ],
    },
    {
        code: '🌴',
        keywords: [
            'palm',
            'plant',
            'tree',
        ],
    },
    {
        code: '🌵',
        keywords: [
            'cactus',
            'plant',
        ],
    },
    {
        code: '🌾',
        keywords: [
            'ear',
            'plant',
            'rice',
        ],
    },
    {
        code: '🌿',
        keywords: [
            'herb',
            'leaf',
            'plant',
        ],
    },
    {
        code: '☘',
        keywords: [
            'plant',
            'shamrock',
        ],
    },
    {
        code: '🍀',
        keywords: [
            '4',
            'clover',
            'four',
            'leaf',
            'plant',
        ],
    },
    {
        code: '🍁',
        keywords: [
            'falling',
            'leaf',
            'maple',
            'plant',
        ],
    },
    {
        code: '🍂',
        keywords: [
            'falling',
            'leaf',
            'plant',
        ],
    },
    {
        code: '🍃',
        keywords: [
            'blow',
            'flutter',
            'leaf',
            'plant',
            'wind',
        ],
    },
    {
        code: '🍇',
        keywords: [
            'fruit',
            'grape',
            'plant',
        ],
    },
    {
        code: '🍈',
        keywords: [
            'fruit',
            'melon',
            'plant',
        ],
    },
    {
        code: '🍉',
        keywords: [
            'fruit',
            'plant',
            'watermelon',
        ],
    },
    {
        code: '🍊',
        keywords: [
            'fruit',
            'orange',
            'plant',
            'tangerine',
        ],
    },
    {
        code: '🍋',
        keywords: [
            'citrus',
            'fruit',
            'lemon',
            'plant',
        ],
    },
    {
        code: '🍌',
        keywords: [
            'banana',
            'fruit',
            'plant',
        ],
    },
    {
        code: '🍍',
        keywords: [
            'fruit',
            'pineapple',
            'plant',
        ],
    },
    {
        code: '🍎',
        keywords: [
            'apple',
            'fruit',
            'plant',
            'red',
        ],
    },
    {
        code: '🍏',
        keywords: [
            'apple',
            'fruit',
            'green',
            'plant',
        ],
    },
    {
        code: '🍐',
        keywords: [
            'fruit',
            'pear',
            'plant',
        ],
    },
    {
        code: '🍑',
        keywords: [
            'fruit',
            'peach',
            'plant',
        ],
    },
    {
        code: '🍒',
        keywords: [
            'cherry',
            'fruit',
            'plant',
        ],
    },
    {
        code: '🍓',
        keywords: [
            'berry',
            'fruit',
            'plant',
            'strawberry',
        ],
    },
    {
        code: '🍅',
        keywords: [
            'plant',
            'tomato',
            'vegetable',
        ],
    },
    {
        code: '🥝',
        keywords: [
            'fruit',
            'kiwi',
        ],
    },
    {
        code: '🥑',
        keywords: [
            'avocado',
            'fruit',
        ],
    },
    {
        code: '🍆',
        keywords: [
            'aubergine',
            'eggplant',
            'plant',
            'vegetable',
        ],
    },
    {
        code: '🥔',
        keywords: [
            'potato',
            'vegetable',
        ],
    },
    {
        code: '🥕',
        keywords: [
            'carrot',
            'vegetable',
        ],
    },
    {
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
        code: '🌶',
        keywords: [
            'hot',
            'pepper',
            'plant',
        ],
    },
    {
        code: '🥒',
        keywords: [
            'cucumber',
            'pickle',
            'vegetable',
        ],
    },
    {
        code: '🍄',
        keywords: [
            'mushroom',
            'plant',
        ],
    },
    {
        code: '🥜',
        keywords: [
            'nut',
            'peanut',
            'vegetable',
        ],
    },
    {
        code: '🌰',
        keywords: [
            'chestnut',
            'plant',
        ],
    },
    {
        code: '🍞',
        keywords: [
            'bread',
            'loaf',
        ],
    },
    {
        code: '🥐',
        keywords: [
            'bread',
            'crescent roll',
            'croissant',
            'french',
        ],
    },
    {
        code: '🥖',
        keywords: [
            'baguette',
            'bread',
            'french',
        ],
    },
    {
        code: '🥞',
        keywords: [
            'crêpe',
            'hotcake',
            'pancake',
        ],
    },
    {
        code: '🧀',
        keywords: [
            'cheese',
        ],
    },
    {
        code: '🍖',
        keywords: [
            'bone',
            'meat',
        ],
    },
    {
        code: '🍗',
        keywords: [
            'bone',
            'chicken',
            'leg',
            'poultry',
        ],
    },
    {
        code: '🥓',
        keywords: [
            'bacon',
            'meat',
        ],
    },
    {
        code: '🍔',
        keywords: [
            'burger',
            'hamburger',
        ],
    },
    {
        code: '🍟',
        keywords: [
            'french',
            'fries',
        ],
    },
    {
        code: '🍕',
        keywords: [
            'cheese',
            'pizza',
            'slice',
        ],
    },
    {
        code: '🌭',
        keywords: [
            'frankfurter',
            'hot dog',
            'hotdog',
            'sausage',
        ],
    },
    {
        code: '🌮',
        keywords: [
            'mexican',
            'taco',
        ],
    },
    {
        code: '🌯',
        keywords: [
            'burrito',
            'mexican',
        ],
    },
    {
        code: '🥙',
        keywords: [
            'falafel',
            'flatbread',
            'gyro',
            'kebab',
            'stuffed',
        ],
    },
    {
        code: '🥚',
        keywords: [
            'egg',
        ],
    },
    {
        code: '🍳',
        keywords: [
            'cooking',
            'egg',
            'frying',
            'pan',
        ],
    },
    {
        code: '🥘',
        keywords: [
            'casserole',
            'paella',
            'pan',
            'shallow',
        ],
    },
    {
        code: '🍲',
        keywords: [
            'pot',
            'stew',
        ],
    },
    {
        code: '🥗',
        keywords: [
            'green',
            'salad',
        ],
    },
    {
        code: '🍿',
        keywords: [
            'popcorn',
        ],
    },
    {
        code: '🍱',
        keywords: [
            'bento',
            'box',
        ],
    },
    {
        code: '🍘',
        keywords: [
            'cracker',
            'rice',
        ],
    },
    {
        code: '🍙',
        keywords: [
            'ball',
            'japanese',
            'rice',
        ],
    },
    {
        code: '🍚',
        keywords: [
            'cooked',
            'rice',
        ],
    },
    {
        code: '🍛',
        keywords: [
            'curry',
            'rice',
        ],
    },
    {
        code: '🍜',
        keywords: [
            'bowl',
            'noodle',
            'ramen',
            'steaming',
        ],
    },
    {
        code: '🍝',
        keywords: [
            'pasta',
            'spaghetti',
        ],
    },
    {
        code: '🍠',
        keywords: [
            'potato',
            'roasted',
            'sweet',
        ],
    },
    {
        code: '🍢',
        keywords: [
            'kebab',
            'oden',
            'seafood',
            'skewer',
            'stick',
        ],
    },
    {
        code: '🍣',
        keywords: [
            'sushi',
        ],
    },
    {
        code: '🍤',
        keywords: [
            'fried',
            'prawn',
            'shrimp',
            'tempura',
        ],
    },
    {
        code: '🍥',
        keywords: [
            'cake',
            'fish',
            'pastry',
            'swirl',
        ],
    },
    {
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
        code: '🍦',
        keywords: [
            'cream',
            'dessert',
            'ice',
            'icecream',
            'soft',
            'sweet',
        ],
    },
    {
        code: '🍧',
        keywords: [
            'dessert',
            'ice',
            'shaved',
            'sweet',
        ],
    },
    {
        code: '🍨',
        keywords: [
            'cream',
            'dessert',
            'ice',
            'sweet',
        ],
    },
    {
        code: '🍩',
        keywords: [
            'dessert',
            'donut',
            'doughnut',
            'sweet',
        ],
    },
    {
        code: '🍪',
        keywords: [
            'cookie',
            'dessert',
            'sweet',
        ],
    },
    {
        code: '🎂',
        keywords: [
            'birthday',
            'cake',
            'celebration',
            'dessert',
            'pastry',
            'sweet',
        ],
    },
    {
        code: '🍰',
        keywords: [
            'cake',
            'dessert',
            'pastry',
            'shortcake',
            'slice',
            'sweet',
        ],
    },
    {
        code: '🍫',
        keywords: [
            'bar',
            'chocolate',
            'dessert',
            'sweet',
        ],
    },
    {
        code: '🍬',
        keywords: [
            'candy',
            'dessert',
            'sweet',
        ],
    },
    {
        code: '🍭',
        keywords: [
            'candy',
            'dessert',
            'lollipop',
            'sweet',
        ],
    },
    {
        code: '🍮',
        keywords: [
            'custard',
            'dessert',
            'pudding',
            'sweet',
        ],
    },
    {
        code: '🍯',
        keywords: [
            'honey',
            'honeypot',
            'pot',
            'sweet',
        ],
    },
    {
        code: '🍼',
        keywords: [
            'baby',
            'bottle',
            'drink',
            'milk',
        ],
    },
    {
        code: '🥛',
        keywords: [
            'drink',
            'glass',
            'milk',
        ],
    },
    {
        code: '☕',
        keywords: [
            'beverage',
            'coffee',
            'drink',
            'hot',
            'steaming',
            'tea',
        ],
    },
    {
        code: '🍵',
        keywords: [
            'beverage',
            'cup',
            'drink',
            'tea',
            'teacup',
        ],
    },
    {
        code: '🍶',
        keywords: [
            'bar',
            'beverage',
            'bottle',
            'cup',
            'drink',
            'sake',
        ],
    },
    {
        code: '🍾',
        keywords: [
            'bar',
            'bottle',
            'cork',
            'drink',
            'popping',
        ],
    },
    {
        code: '🍷',
        keywords: [
            'bar',
            'beverage',
            'drink',
            'glass',
            'wine',
        ],
    },
    {
        code: '🍸',
        keywords: [
            'bar',
            'cocktail',
            'drink',
            'glass',
        ],
    },
    {
        code: '🍹',
        keywords: [
            'bar',
            'drink',
            'tropical',
        ],
    },
    {
        code: '🍺',
        keywords: [
            'bar',
            'beer',
            'drink',
            'mug',
        ],
    },
    {
        code: '🍻',
        keywords: [
            'bar',
            'beer',
            'clink',
            'drink',
            'mug',
        ],
    },
    {
        code: '🥂',
        keywords: [
            'celebrate',
            'clink',
            'drink',
            'glass',
        ],
    },
    {
        code: '🥃',
        keywords: [
            'glass',
            'liquor',
            'shot',
            'tumbler',
            'whisky',
        ],
    },
    {
        code: '🍽',
        keywords: [
            'cooking',
            'fork',
            'knife',
            'plate',
        ],
    },
    {
        code: '🍴',
        keywords: [
            'cooking',
            'fork',
            'knife',
        ],
    },
    {
        code: '🥄',
        keywords: [
            'spoon',
            'tableware',
        ],
    },
    {
        code: '🔪',
        keywords: [
            'cooking',
            'hocho',
            'knife',
            'tool',
            'weapon',
        ],
    },
    {
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
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: 'Travel & Places',
        header: true,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: '🌍',
        keywords: [
            'africa',
            'earth',
            'europe',
            'globe',
            'world',
        ],
    },
    {
        code: '🌎',
        keywords: [
            'americas',
            'earth',
            'globe',
            'world',
        ],
    },
    {
        code: '🌏',
        keywords: [
            'asia',
            'australia',
            'earth',
            'globe',
            'world',
        ],
    },
    {
        code: '🌐',
        keywords: [
            'earth',
            'globe',
            'meridians',
            'world',
        ],
    },
    {
        code: '🗺',
        keywords: [
            'map',
            'world',
        ],
    },
    {
        code: '🗾',
        keywords: [
            'japan',
            'map',
        ],
    },
    {
        code: '🏔',
        keywords: [
            'cold',
            'mountain',
            'snow',
        ],
    },
    {
        code: '⛰',
        keywords: [
            'mountain',
        ],
    },
    {
        code: '🌋',
        keywords: [
            'eruption',
            'mountain',
            'volcano',
            'weather',
        ],
    },
    {
        code: '🗻',
        keywords: [
            'fuji',
            'mountain',
        ],
    },
    {
        code: '🏕',
        keywords: [
            'camping',
        ],
    },
    {
        code: '🏖',
        keywords: [
            'beach',
            'umbrella',
        ],
    },
    {
        code: '🏜',
        keywords: [
            'desert',
        ],
    },
    {
        code: '🏝',
        keywords: [
            'desert',
            'island',
        ],
    },
    {
        code: '🏞',
        keywords: [
            'national park',
            'park',
        ],
    },
    {
        code: '🏟',
        keywords: [
            'stadium',
        ],
    },
    {
        code: '🏛',
        keywords: [
            'building',
            'classical',
        ],
    },
    {
        code: '🏗',
        keywords: [
            'building',
            'construction',
        ],
    },
    {
        code: '🏘',
        keywords: [
            'building',
            'house',
        ],
    },
    {
        code: '🏙',
        keywords: [
            'building',
            'city',
        ],
    },
    {
        code: '🏚',
        keywords: [
            'building',
            'derelict',
            'house',
        ],
    },
    {
        code: '🏠',
        keywords: [
            'building',
            'home',
            'house',
        ],
    },
    {
        code: '🏡',
        keywords: [
            'building',
            'garden',
            'home',
            'house',
        ],
    },
    {
        code: '🏢',
        keywords: [
            'building',
        ],
    },
    {
        code: '🏣',
        keywords: [
            'building',
            'japanese',
            'post',
        ],
    },
    {
        code: '🏤',
        keywords: [
            'building',
            'european',
            'post',
        ],
    },
    {
        code: '🏥',
        keywords: [
            'building',
            'doctor',
            'hospital',
            'medicine',
        ],
    },
    {
        code: '🏦',
        keywords: [
            'bank',
            'building',
        ],
    },
    {
        code: '🏨',
        keywords: [
            'building',
            'hotel',
        ],
    },
    {
        code: '🏩',
        keywords: [
            'building',
            'hotel',
            'love',
        ],
    },
    {
        code: '🏪',
        keywords: [
            'building',
            'convenience',
            'store',
        ],
    },
    {
        code: '🏫',
        keywords: [
            'building',
            'school',
        ],
    },
    {
        code: '🏬',
        keywords: [
            'building',
            'department',
            'store',
        ],
    },
    {
        code: '🏭',
        keywords: [
            'building',
            'factory',
        ],
    },
    {
        code: '🏯',
        keywords: [
            'building',
            'castle',
            'japanese',
        ],
    },
    {
        code: '🏰',
        keywords: [
            'building',
            'castle',
            'european',
        ],
    },
    {
        code: '💒',
        keywords: [
            'activity',
            'chapel',
            'romance',
            'wedding',
        ],
    },
    {
        code: '🗼',
        keywords: [
            'tokyo',
            'tower',
        ],
    },
    {
        code: '🗽',
        keywords: [
            'liberty',
            'statue',
        ],
    },
    {
        code: '⛪',
        keywords: [
            'building',
            'christian',
            'church',
            'cross',
            'religion',
        ],
    },
    {
        code: '🕌',
        keywords: [
            'islam',
            'mosque',
            'muslim',
            'religion',
        ],
    },
    {
        code: '🕍',
        keywords: [
            'jew',
            'jewish',
            'religion',
            'synagogue',
            'temple',
        ],
    },
    {
        code: '⛩',
        keywords: [
            'religion',
            'shinto',
            'shrine',
        ],
    },
    {
        code: '🕋',
        keywords: [
            'islam',
            'kaaba',
            'muslim',
            'religion',
        ],
    },
    {
        code: '⛲',
        keywords: [
            'fountain',
        ],
    },
    {
        code: '⛺',
        keywords: [
            'camping',
            'tent',
        ],
    },
    {
        code: '🌁',
        keywords: [
            'fog',
            'weather',
        ],
    },
    {
        code: '🌃',
        keywords: [
            'night',
            'star',
            'weather',
        ],
    },
    {
        code: '🌄',
        keywords: [
            'morning',
            'mountain',
            'sun',
            'sunrise',
            'weather',
        ],
    },
    {
        code: '🌅',
        keywords: [
            'morning',
            'sun',
            'sunrise',
            'weather',
        ],
    },
    {
        code: '🌆',
        keywords: [
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
        code: '🌇',
        keywords: [
            'building',
            'dusk',
            'sun',
            'sunset',
            'weather',
        ],
    },
    {
        code: '🌉',
        keywords: [
            'bridge',
            'night',
            'weather',
        ],
    },
    {
        code: '♨',
        keywords: [
            'hot',
            'hotsprings',
            'springs',
            'steaming',
        ],
    },
    {
        code: '🌌',
        keywords: [
            'milky way',
            'space',
            'weather',
        ],
    },
    {
        code: '🎠',
        keywords: [
            'activity',
            'carousel',
            'entertainment',
            'horse',
        ],
    },
    {
        code: '🎡',
        keywords: [
            'activity',
            'amusement park',
            'entertainment',
            'ferris',
            'wheel',
        ],
    },
    {
        code: '🎢',
        keywords: [
            'activity',
            'amusement park',
            'coaster',
            'entertainment',
            'roller',
        ],
    },
    {
        code: '💈',
        keywords: [
            'barber',
            'haircut',
            'pole',
        ],
    },
    {
        code: '🎪',
        keywords: [
            'activity',
            'circus',
            'entertainment',
            'tent',
        ],
    },
    {
        code: '🎭',
        keywords: [
            'activity',
            'art',
            'entertainment',
            'mask',
            'performing',
            'theater',
            'theatre',
        ],
    },
    {
        code: '🖼',
        keywords: [
            'art',
            'frame',
            'museum',
            'painting',
            'picture',
        ],
    },
    {
        code: '🎨',
        keywords: [
            'activity',
            'art',
            'entertainment',
            'museum',
            'painting',
            'palette',
        ],
    },
    {
        code: '🎰',
        keywords: [
            'activity',
            'game',
            'slot',
        ],
    },
    {
        code: '🚂',
        keywords: [
            'engine',
            'locomotive',
            'railway',
            'steam',
            'train',
            'vehicle',
        ],
    },
    {
        code: '🚃',
        keywords: [
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
        code: '🚄',
        keywords: [
            'railway',
            'shinkansen',
            'speed',
            'train',
            'vehicle',
        ],
    },
    {
        code: '🚅',
        keywords: [
            'bullet',
            'railway',
            'shinkansen',
            'speed',
            'train',
            'vehicle',
        ],
    },
    {
        code: '🚆',
        keywords: [
            'railway',
            'train',
            'vehicle',
        ],
    },
    {
        code: '🚇',
        keywords: [
            'metro',
            'subway',
            'vehicle',
        ],
    },
    {
        code: '🚈',
        keywords: [
            'railway',
            'vehicle',
        ],
    },
    {
        code: '🚉',
        keywords: [
            'railway',
            'station',
            'train',
            'vehicle',
        ],
    },
    {
        code: '🚊',
        keywords: [
            'tram',
            'trolleybus',
            'vehicle',
        ],
    },
    {
        code: '🚝',
        keywords: [
            'monorail',
            'vehicle',
        ],
    },
    {
        code: '🚞',
        keywords: [
            'car',
            'mountain',
            'railway',
            'vehicle',
        ],
    },
    {
        code: '🚋',
        keywords: [
            'car',
            'tram',
            'trolleybus',
            'vehicle',
        ],
    },
    {
        code: '🚌',
        keywords: [
            'bus',
            'vehicle',
        ],
    },
    {
        code: '🚍',
        keywords: [
            'bus',
            'oncoming',
            'vehicle',
        ],
    },
    {
        code: '🚎',
        keywords: [
            'bus',
            'tram',
            'trolley',
            'trolleybus',
            'vehicle',
        ],
    },
    {
        code: '🚏',
        keywords: [
            'bus',
            'busstop',
            'stop',
        ],
    },
    {
        code: '🚐',
        keywords: [
            'bus',
            'minibus',
            'vehicle',
        ],
    },
    {
        code: '🚑',
        keywords: [
            'ambulance',
            'vehicle',
        ],
    },
    {
        code: '🚒',
        keywords: [
            'engine',
            'fire',
            'truck',
            'vehicle',
        ],
    },
    {
        code: '🚓',
        keywords: [
            'car',
            'patrol',
            'police',
            'vehicle',
        ],
    },
    {
        code: '🚔',
        keywords: [
            'car',
            'oncoming',
            'police',
            'vehicle',
        ],
    },
    {
        code: '🚕',
        keywords: [
            'taxi',
            'vehicle',
        ],
    },
    {
        code: '🚖',
        keywords: [
            'oncoming',
            'taxi',
            'vehicle',
        ],
    },
    {
        code: '🚗',
        keywords: [
            'automobile',
            'car',
            'vehicle',
        ],
    },
    {
        code: '🚘',
        keywords: [
            'automobile',
            'car',
            'oncoming',
            'vehicle',
        ],
    },
    {
        code: '🚙',
        keywords: [
            'recreational',
            'rv',
            'vehicle',
        ],
    },
    {
        code: '🚚',
        keywords: [
            'delivery',
            'truck',
            'vehicle',
        ],
    },
    {
        code: '🚛',
        keywords: [
            'lorry',
            'semi',
            'truck',
            'vehicle',
        ],
    },
    {
        code: '🚜',
        keywords: [
            'tractor',
            'vehicle',
        ],
    },
    {
        code: '🚲',
        keywords: [
            'bicycle',
            'bike',
            'vehicle',
        ],
    },
    {
        code: '⛽',
        keywords: [
            'fuel',
            'fuelpump',
            'gas',
            'pump',
            'station',
        ],
    },
    {
        code: '🛣',
        keywords: [
            'highway',
            'motorway',
            'road',
        ],
    },
    {
        code: '🛤',
        keywords: [
            'railway',
            'train',
        ],
    },
    {
        code: '🚨',
        keywords: [
            'beacon',
            'car',
            'light',
            'police',
            'revolving',
            'vehicle',
        ],
    },
    {
        code: '🚥',
        keywords: [
            'light',
            'signal',
            'traffic',
        ],
    },
    {
        code: '🚦',
        keywords: [
            'light',
            'signal',
            'traffic',
        ],
    },
    {
        code: '🚧',
        keywords: [
            'barrier',
            'construction',
        ],
    },
    {
        code: '🛑',
        keywords: [
            'octagonal',
            'stop',
        ],
    },
    {
        code: '🛴',
        keywords: [
            'kick',
            'scooter',
        ],
    },
    {
        code: '🛵',
        keywords: [
            'motor',
            'scooter',
        ],
    },
    {
        code: '⚓',
        keywords: [
            'anchor',
            'ship',
            'tool',
        ],
    },
    {
        code: '⛵',
        keywords: [
            'boat',
            'resort',
            'sailboat',
            'sea',
            'vehicle',
            'yacht',
        ],
    },
    {
        code: '🚣',
        keywords: [
            'boat',
            'rowboat',
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
        code: '🛶',
        keywords: [
            'boat',
            'canoe',
        ],
    },
    {
        code: '🚤',
        keywords: [
            'boat',
            'speedboat',
            'vehicle',
        ],
    },
    {
        code: '🛳',
        keywords: [
            'passenger',
            'ship',
            'vehicle',
        ],
    },
    {
        code: '⛴',
        keywords: [
            'boat',
            'ferry',
        ],
    },
    {
        code: '🛥',
        keywords: [
            'boat',
            'motorboat',
            'vehicle',
        ],
    },
    {
        code: '🚢',
        keywords: [
            'ship',
            'vehicle',
        ],
    },
    {
        code: '✈',
        keywords: [
            'airplane',
            'vehicle',
        ],
    },
    {
        code: '🛩',
        keywords: [
            'airplane',
            'vehicle',
        ],
    },
    {
        code: '🛫',
        keywords: [
            'airplane',
            'check-in',
            'departure',
            'departures',
            'vehicle',
        ],
    },
    {
        code: '🛬',
        keywords: [
            'airplane',
            'arrivals',
            'arriving',
            'landing',
            'vehicle',
        ],
    },
    {
        code: '💺',
        keywords: [
            'chair',
            'seat',
        ],
    },
    {
        code: '🚁',
        keywords: [
            'helicopter',
            'vehicle',
        ],
    },
    {
        code: '🚟',
        keywords: [
            'railway',
            'suspension',
            'vehicle',
        ],
    },
    {
        code: '🚠',
        keywords: [
            'cable',
            'gondola',
            'mountain',
            'vehicle',
        ],
    },
    {
        code: '🚡',
        keywords: [
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
        code: '🚀',
        keywords: [
            'rocket',
            'space',
            'vehicle',
        ],
    },
    {
        code: '🛰',
        keywords: [
            'satellite',
            'space',
            'vehicle',
        ],
    },
    {
        code: '🛎',
        keywords: [
            'bell',
            'bellhop',
            'hotel',
        ],
    },
    {
        code: '🚪',
        keywords: [
            'door',
        ],
    },
    {
        code: '🛌',
        keywords: [
            'hotel',
            'sleep',
        ],
    },
    {
        code: '🛏',
        keywords: [
            'bed',
            'hotel',
            'sleep',
        ],
    },
    {
        code: '🛋',
        keywords: [
            'couch',
            'hotel',
            'lamp',
        ],
    },
    {
        code: '🚽',
        keywords: [
            'toilet',
        ],
    },
    {
        code: '🚿',
        keywords: [
            'shower',
            'water',
        ],
    },
    {
        code: '🛀',
        keywords: [
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
        code: '🛁',
        keywords: [
            'bath',
            'bathtub',
        ],
    },
    {
        code: '⌛',
        keywords: [
            'hourglass',
            'sand',
            'timer',
        ],
    },
    {
        code: '⏳',
        keywords: [
            'hourglass',
            'sand',
            'timer',
        ],
    },
    {
        code: '⌚',
        keywords: [
            'clock',
            'watch',
        ],
    },
    {
        code: '⏰',
        keywords: [
            'alarm',
            'clock',
        ],
    },
    {
        code: '⏱',
        keywords: [
            'clock',
            'stopwatch',
        ],
    },
    {
        code: '⏲',
        keywords: [
            'clock',
            'timer',
        ],
    },
    {
        code: '🕰',
        keywords: [
            'clock',
        ],
    },
    {
        code: '🕛',
        keywords: [
            '00',
            '12',
            '12:00',
            'clock',
            'o’clock',
            'twelve',
        ],
    },
    {
        code: '🕧',
        keywords: [
            '12',
            '12:30',
            '30',
            'clock',
            'thirty',
            'twelve',
        ],
    },
    {
        code: '🕐',
        keywords: [
            '00',
            '1',
            '1:00',
            'clock',
            'o’clock',
            'one',
        ],
    },
    {
        code: '🕜',
        keywords: [
            '1',
            '1:30',
            '30',
            'clock',
            'one',
            'thirty',
        ],
    },
    {
        code: '🕑',
        keywords: [
            '00',
            '2',
            '2:00',
            'clock',
            'o’clock',
            'two',
        ],
    },
    {
        code: '🕝',
        keywords: [
            '2',
            '2:30',
            '30',
            'clock',
            'thirty',
            'two',
        ],
    },
    {
        code: '🕒',
        keywords: [
            '00',
            '3',
            '3:00',
            'clock',
            'o’clock',
            'three',
        ],
    },
    {
        code: '🕞',
        keywords: [
            '3',
            '3:30',
            '30',
            'clock',
            'thirty',
            'three',
        ],
    },
    {
        code: '🕓',
        keywords: [
            '00',
            '4',
            '4:00',
            'clock',
            'four',
            'o’clock',
        ],
    },
    {
        code: '🕟',
        keywords: [
            '30',
            '4',
            '4:30',
            'clock',
            'four',
            'thirty',
        ],
    },
    {
        code: '🕔',
        keywords: [
            '00',
            '5',
            '5:00',
            'clock',
            'five',
            'o’clock',
        ],
    },
    {
        code: '🕠',
        keywords: [
            '30',
            '5',
            '5:30',
            'clock',
            'five',
            'thirty',
        ],
    },
    {
        code: '🕕',
        keywords: [
            '00',
            '6',
            '6:00',
            'clock',
            'o’clock',
            'six',
        ],
    },
    {
        code: '🕡',
        keywords: [
            '30',
            '6',
            '6:30',
            'clock',
            'six',
            'thirty',
        ],
    },
    {
        code: '🕖',
        keywords: [
            '00',
            '7',
            '7:00',
            'clock',
            'o’clock',
            'seven',
        ],
    },
    {
        code: '🕢',
        keywords: [
            '30',
            '7',
            '7:30',
            'clock',
            'seven',
            'thirty',
        ],
    },
    {
        code: '🕗',
        keywords: [
            '00',
            '8',
            '8:00',
            'clock',
            'eight',
            'o’clock',
        ],
    },
    {
        code: '🕣',
        keywords: [
            '30',
            '8',
            '8:30',
            'clock',
            'eight',
            'thirty',
        ],
    },
    {
        code: '🕘',
        keywords: [
            '00',
            '9',
            '9:00',
            'clock',
            'nine',
            'o’clock',
        ],
    },
    {
        code: '🕤',
        keywords: [
            '30',
            '9',
            '9:30',
            'clock',
            'nine',
            'thirty',
        ],
    },
    {
        code: '🕙',
        keywords: [
            '00',
            '10',
            '10:00',
            'clock',
            'o’clock',
            'ten',
        ],
    },
    {
        code: '🕥',
        keywords: [
            '10',
            '10:30',
            '30',
            'clock',
            'ten',
            'thirty',
        ],
    },
    {
        code: '🕚',
        keywords: [
            '00',
            '11',
            '11:00',
            'clock',
            'eleven',
            'o’clock',
        ],
    },
    {
        code: '🕦',
        keywords: [
            '11',
            '11:30',
            '30',
            'clock',
            'eleven',
            'thirty',
        ],
    },
    {
        code: '🌑',
        keywords: [
            'dark',
            'moon',
            'space',
            'weather',
        ],
    },
    {
        code: '🌒',
        keywords: [
            'crescent',
            'moon',
            'space',
            'waxing',
            'weather',
        ],
    },
    {
        code: '🌓',
        keywords: [
            'moon',
            'quarter',
            'space',
            'weather',
        ],
    },
    {
        code: '🌔',
        keywords: [
            'gibbous',
            'moon',
            'space',
            'waxing',
            'weather',
        ],
    },
    {
        code: '🌕',
        keywords: [
            'full',
            'moon',
            'space',
            'weather',
        ],
    },
    {
        code: '🌖',
        keywords: [
            'gibbous',
            'moon',
            'space',
            'waning',
            'weather',
        ],
    },
    {
        code: '🌗',
        keywords: [
            'moon',
            'quarter',
            'space',
            'weather',
        ],
    },
    {
        code: '🌘',
        keywords: [
            'crescent',
            'moon',
            'space',
            'waning',
            'weather',
        ],
    },
    {
        code: '🌙',
        keywords: [
            'crescent',
            'moon',
            'space',
            'weather',
        ],
    },
    {
        code: '🌚',
        keywords: [
            'face',
            'moon',
            'space',
            'weather',
        ],
    },
    {
        code: '🌛',
        keywords: [
            'face',
            'moon',
            'quarter',
            'space',
            'weather',
        ],
    },
    {
        code: '🌜',
        keywords: [
            'face',
            'moon',
            'quarter',
            'space',
            'weather',
        ],
    },
    {
        code: '🌡',
        keywords: [
            'thermometer',
            'weather',
        ],
    },
    {
        code: '☀',
        keywords: [
            'bright',
            'rays',
            'space',
            'sun',
            'sunny',
            'weather',
        ],
    },
    {
        code: '🌝',
        keywords: [
            'bright',
            'face',
            'full',
            'moon',
            'space',
            'weather',
        ],
    },
    {
        code: '🌞',
        keywords: [
            'bright',
            'face',
            'space',
            'sun',
            'weather',
        ],
    },
    {
        code: '⭐',
        keywords: [
            'star',
        ],
    },
    {
        code: '🌟',
        keywords: [
            'glittery',
            'glow',
            'shining',
            'sparkle',
            'star',
        ],
    },
    {
        code: '🌠',
        keywords: [
            'activity',
            'falling',
            'shooting',
            'space',
            'star',
        ],
    },
    {
        code: '☁',
        keywords: [
            'cloud',
            'weather',
        ],
    },
    {
        code: '⛅',
        keywords: [
            'cloud',
            'sun',
            'weather',
        ],
    },
    {
        code: '⛈',
        keywords: [
            'cloud',
            'rain',
            'thunder',
            'weather',
        ],
    },
    {
        code: '🌤',
        keywords: [
            'cloud',
            'sun',
            'weather',
        ],
    },
    {
        code: '🌥',
        keywords: [
            'cloud',
            'sun',
            'weather',
        ],
    },
    {
        code: '🌦',
        keywords: [
            'cloud',
            'rain',
            'sun',
            'weather',
        ],
    },
    {
        code: '🌧',
        keywords: [
            'cloud',
            'rain',
            'weather',
        ],
    },
    {
        code: '🌨',
        keywords: [
            'cloud',
            'cold',
            'snow',
            'weather',
        ],
    },
    {
        code: '🌩',
        keywords: [
            'cloud',
            'lightning',
            'weather',
        ],
    },
    {
        code: '🌪',
        keywords: [
            'cloud',
            'tornado',
            'weather',
            'whirlwind',
        ],
    },
    {
        code: '🌫',
        keywords: [
            'cloud',
            'fog',
            'weather',
        ],
    },
    {
        code: '🌬',
        keywords: [
            'blow',
            'cloud',
            'face',
            'weather',
            'wind',
        ],
    },
    {
        code: '🌀',
        keywords: [
            'cyclone',
            'dizzy',
            'twister',
            'typhoon',
            'weather',
        ],
    },
    {
        code: '🌈',
        keywords: [
            'rain',
            'rainbow',
            'weather',
        ],
    },
    {
        code: '🌂',
        keywords: [
            'clothing',
            'rain',
            'umbrella',
            'weather',
        ],
    },
    {
        code: '☂',
        keywords: [
            'clothing',
            'rain',
            'umbrella',
            'weather',
        ],
    },
    {
        code: '☔',
        keywords: [
            'clothing',
            'drop',
            'rain',
            'umbrella',
            'weather',
        ],
    },
    {
        code: '⛱',
        keywords: [
            'rain',
            'sun',
            'umbrella',
            'weather',
        ],
    },
    {
        code: '⚡',
        keywords: [
            'danger',
            'electric',
            'electricity',
            'lightning',
            'voltage',
            'zap',
        ],
    },
    {
        code: '❄',
        keywords: [
            'cold',
            'snow',
            'snowflake',
            'weather',
        ],
    },
    {
        code: '☃',
        keywords: [
            'cold',
            'snow',
            'snowman',
            'weather',
        ],
    },
    {
        code: '⛄',
        keywords: [
            'cold',
            'snow',
            'snowman',
            'weather',
        ],
    },
    {
        code: '☄',
        keywords: [
            'comet',
            'space',
        ],
    },
    {
        code: '🔥',
        keywords: [
            'fire',
            'flame',
            'tool',
        ],
    },
    {
        code: '💧',
        keywords: [
            'cold',
            'comic',
            'drop',
            'sweat',
            'weather',
        ],
    },
    {
        code: '🌊',
        keywords: [
            'ocean',
            'water',
            'wave',
            'weather',
        ],
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: 'Activities',
        header: true,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: '🎃',
        keywords: [
            'activity',
            'celebration',
            'entertainment',
            'halloween',
            'jack',
            'lantern',
        ],
    },
    {
        code: '🎄',
        keywords: [
            'activity',
            'celebration',
            'christmas',
            'entertainment',
            'tree',
        ],
    },
    {
        code: '🎆',
        keywords: [
            'activity',
            'celebration',
            'entertainment',
            'fireworks',
        ],
    },
    {
        code: '🎇',
        keywords: [
            'activity',
            'celebration',
            'entertainment',
            'fireworks',
            'sparkle',
        ],
    },
    {
        code: '✨',
        keywords: [
            'entertainment',
            'sparkle',
            'star',
        ],
    },
    {
        code: '🎈',
        keywords: [
            'activity',
            'balloon',
            'celebration',
            'entertainment',
        ],
    },
    {
        code: '🎉',
        keywords: [
            'activity',
            'celebration',
            'entertainment',
            'party',
            'popper',
            'tada',
        ],
    },
    {
        code: '🎊',
        keywords: [
            'activity',
            'ball',
            'celebration',
            'confetti',
            'entertainment',
        ],
    },
    {
        code: '🎋',
        keywords: [
            'activity',
            'banner',
            'celebration',
            'entertainment',
            'japanese',
            'tree',
        ],
    },
    {
        code: '🎍',
        keywords: [
            'activity',
            'bamboo',
            'celebration',
            'japanese',
            'pine',
            'plant',
        ],
    },
    {
        code: '🎎',
        keywords: [
            'activity',
            'celebration',
            'doll',
            'entertainment',
            'festival',
            'japanese',
        ],
    },
    {
        code: '🎏',
        keywords: [
            'activity',
            'carp',
            'celebration',
            'entertainment',
            'flag',
            'streamer',
        ],
    },
    {
        code: '🎐',
        keywords: [
            'activity',
            'bell',
            'celebration',
            'chime',
            'entertainment',
            'wind',
        ],
    },
    {
        code: '🎑',
        keywords: [
            'activity',
            'celebration',
            'ceremony',
            'entertainment',
            'moon',
        ],
    },
    {
        code: '🎀',
        keywords: [
            'celebration',
            'ribbon',
        ],
    },
    {
        code: '🎁',
        keywords: [
            'box',
            'celebration',
            'entertainment',
            'gift',
            'present',
            'wrapped',
        ],
    },
    {
        code: '🎗',
        keywords: [
            'celebration',
            'reminder',
            'ribbon',
        ],
    },
    {
        code: '🎟',
        keywords: [
            'admission',
            'entertainment',
            'ticket',
        ],
    },
    {
        code: '🎫',
        keywords: [
            'activity',
            'admission',
            'entertainment',
            'ticket',
        ],
    },
    {
        code: '🎖',
        keywords: [
            'celebration',
            'medal',
            'military',
        ],
    },
    {
        code: '🏆',
        keywords: [
            'prize',
            'trophy',
        ],
    },
    {
        code: '🏅',
        keywords: [
            'medal',
        ],
    },
    {
        code: '🥇',
        keywords: [
            'first',
            'gold',
            'medal',
        ],
    },
    {
        code: '🥈',
        keywords: [
            'medal',
            'second',
            'silver',
        ],
    },
    {
        code: '🥉',
        keywords: [
            'bronze',
            'medal',
            'third',
        ],
    },
    {
        code: '⚽',
        keywords: [
            'ball',
            'soccer',
        ],
    },
    {
        code: '⚾',
        keywords: [
            'ball',
            'baseball',
        ],
    },
    {
        code: '🏀',
        keywords: [
            'ball',
            'basketball',
            'hoop',
        ],
    },
    {
        code: '🏐',
        keywords: [
            'ball',
            'game',
            'volleyball',
        ],
    },
    {
        code: '🏈',
        keywords: [
            'american',
            'ball',
            'football',
        ],
    },
    {
        code: '🏉',
        keywords: [
            'ball',
            'football',
            'rugby',
        ],
    },
    {
        code: '🎾',
        keywords: [
            'ball',
            'racquet',
            'tennis',
        ],
    },
    {
        code: '🎱',
        keywords: [
            '8',
            '8 ball',
            'ball',
            'billiard',
            'eight',
            'game',
        ],
    },
    {
        code: '🎳',
        keywords: [
            'ball',
            'bowling',
            'game',
        ],
    },
    {
        code: '🏏',
        keywords: [
            'ball',
            'bat',
            'cricket',
            'game',
        ],
    },
    {
        code: '🏑',
        keywords: [
            'ball',
            'field',
            'game',
            'hockey',
            'stick',
        ],
    },
    {
        code: '🏒',
        keywords: [
            'game',
            'hockey',
            'ice',
            'puck',
            'stick',
        ],
    },
    {
        code: '🏓',
        keywords: [
            'ball',
            'bat',
            'game',
            'paddle',
            'table tennis',
        ],
    },
    {
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
        code: '🥊',
        keywords: [
            'boxing',
            'glove',
        ],
    },
    {
        code: '🥋',
        keywords: [
            'judo',
            'karate',
            'martial arts',
            'taekwondo',
            'uniform',
        ],
    },
    {
        code: '⛳',
        keywords: [
            'flag',
            'golf',
            'hole',
        ],
    },
    {
        code: '🏌',
        keywords: [
            'ball',
            'golf',
        ],
    },
    {
        code: '⛸',
        keywords: [
            'ice',
            'skate',
        ],
    },
    {
        code: '🎣',
        keywords: [
            'entertainment',
            'fish',
            'pole',
        ],
    },
    {
        code: '🎽',
        keywords: [
            'running',
            'sash',
            'shirt',
        ],
    },
    {
        code: '🎿',
        keywords: [
            'ski',
            'snow',
        ],
    },
    {
        code: '⛷',
        keywords: [
            'ski',
            'snow',
        ],
    },
    {
        code: '🏂',
        keywords: [
            'ski',
            'snow',
            'snowboard',
        ],
    },
    {
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
        code: '🏇',
        keywords: [
            'horse',
            'jockey',
            'racehorse',
            'racing',
        ],
    },
    {
        code: '🏊',
        keywords: [
            'swim',
            'swimmer',
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
        code: '⛹',
        keywords: [
            'ball',
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
        code: '🏋',
        keywords: [
            'lifter',
            'weight',
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
        code: '🚴',
        keywords: [
            'bicycle',
            'bicyclist',
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
        code: '🚵',
        keywords: [
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
        code: '🏎',
        keywords: [
            'car',
            'racing',
        ],
    },
    {
        code: '🏍',
        keywords: [
            'motorcycle',
            'racing',
        ],
    },
    {
        code: '🤸',
        keywords: [
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
        code: '🤼',
        keywords: [
            'wrestle',
            'wrestler',
        ],
        types: [
            '🤼🏿',
            '🤼🏾',
            '🤼🏽',
            '🤼🏼',
            '🤼🏻',
        ],
    },
    {
        code: '🤽',
        keywords: [
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
        code: '🤾',
        keywords: [
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
        code: '🤺',
        keywords: [
            'fencer',
            'fencing',
            'sword',
        ],
    },
    {
        code: '🥅',
        keywords: [
            'goal',
            'net',
        ],
    },
    {
        code: '🤹',
        keywords: [
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
        code: '🎯',
        keywords: [
            'activity',
            'bull',
            'bullseye',
            'dart',
            'entertainment',
            'eye',
            'game',
            'hit',
            'target',
        ],
    },
    {
        code: '🎮',
        keywords: [
            'controller',
            'entertainment',
            'game',
            'video game',
        ],
    },
    {
        code: '🕹',
        keywords: [
            'entertainment',
            'game',
            'joystick',
            'video game',
        ],
    },
    {
        code: '🎲',
        keywords: [
            'dice',
            'die',
            'entertainment',
            'game',
        ],
    },
    {
        code: '♠',
        keywords: [
            'card',
            'game',
            'spade',
            'suit',
        ],
    },
    {
        code: '♥',
        keywords: [
            'card',
            'game',
            'heart',
            'hearts',
            'suit',
        ],
    },
    {
        code: '♦',
        keywords: [
            'card',
            'diamond',
            'diamonds',
            'game',
            'suit',
        ],
    },
    {
        code: '♣',
        keywords: [
            'card',
            'club',
            'clubs',
            'game',
            'suit',
        ],
    },
    {
        code: '🃏',
        keywords: [
            'card',
            'entertainment',
            'game',
            'joker',
            'playing',
        ],
    },
    {
        code: '🀄',
        keywords: [
            'game',
            'mahjong',
            'red',
        ],
    },
    {
        code: '🎴',
        keywords: [
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
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: 'Objects',
        header: true,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: '🔇',
        keywords: [
            'mute',
            'quiet',
            'silent',
            'speaker',
            'volume',
        ],
    },
    {
        code: '🔈',
        keywords: [
            'speaker',
            'volume',
        ],
    },
    {
        code: '🔉',
        keywords: [
            'low',
            'speaker',
            'volume',
            'wave',
        ],
    },
    {
        code: '🔊',
        keywords: [
            '3',
            'entertainment',
            'high',
            'loud',
            'speaker',
            'three',
            'volume',
        ],
    },
    {
        code: '📢',
        keywords: [
            'communication',
            'loud',
            'loudspeaker',
            'public address',
        ],
    },
    {
        code: '📣',
        keywords: [
            'cheering',
            'communication',
            'megaphone',
        ],
    },
    {
        code: '📯',
        keywords: [
            'communication',
            'entertainment',
            'horn',
            'post',
            'postal',
        ],
    },
    {
        code: '🔔',
        keywords: [
            'bell',
        ],
    },
    {
        code: '🔕',
        keywords: [
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
        code: '🎼',
        keywords: [
            'activity',
            'entertainment',
            'music',
            'score',
        ],
    },
    {
        code: '🎵',
        keywords: [
            'activity',
            'entertainment',
            'music',
            'note',
        ],
    },
    {
        code: '🎶',
        keywords: [
            'activity',
            'entertainment',
            'music',
            'note',
            'notes',
        ],
    },
    {
        code: '🎙',
        keywords: [
            'mic',
            'microphone',
            'music',
            'studio',
        ],
    },
    {
        code: '🎚',
        keywords: [
            'level',
            'music',
            'slider',
        ],
    },
    {
        code: '🎛',
        keywords: [
            'control',
            'knobs',
            'music',
        ],
    },
    {
        code: '🎤',
        keywords: [
            'activity',
            'entertainment',
            'karaoke',
            'mic',
            'microphone',
        ],
    },
    {
        code: '🎧',
        keywords: [
            'activity',
            'earbud',
            'entertainment',
            'headphone',
        ],
    },
    {
        code: '📻',
        keywords: [
            'entertainment',
            'radio',
            'video',
        ],
    },
    {
        code: '🎷',
        keywords: [
            'activity',
            'entertainment',
            'instrument',
            'music',
            'sax',
            'saxophone',
        ],
    },
    {
        code: '🎸',
        keywords: [
            'activity',
            'entertainment',
            'guitar',
            'instrument',
            'music',
        ],
    },
    {
        code: '🎹',
        keywords: [
            'activity',
            'entertainment',
            'instrument',
            'keyboard',
            'music',
            'piano',
        ],
    },
    {
        code: '🎺',
        keywords: [
            'activity',
            'entertainment',
            'instrument',
            'music',
            'trumpet',
        ],
    },
    {
        code: '🎻',
        keywords: [
            'activity',
            'entertainment',
            'instrument',
            'music',
            'violin',
        ],
    },
    {
        code: '🥁',
        keywords: [
            'drum',
            'drumsticks',
            'music',
        ],
    },
    {
        code: '📱',
        keywords: [
            'cell',
            'communication',
            'mobile',
            'phone',
            'telephone',
        ],
    },
    {
        code: '📲',
        keywords: [
            'arrow',
            'call',
            'cell',
            'communication',
            'mobile',
            'phone',
            'receive',
            'telephone',
        ],
    },
    {
        code: '☎',
        keywords: [
            'phone',
            'telephone',
        ],
    },
    {
        code: '📞',
        keywords: [
            'communication',
            'phone',
            'receiver',
            'telephone',
        ],
    },
    {
        code: '📟',
        keywords: [
            'communication',
            'pager',
        ],
    },
    {
        code: '📠',
        keywords: [
            'communication',
            'fax',
        ],
    },
    {
        code: '🔋',
        keywords: [
            'battery',
        ],
    },
    {
        code: '🔌',
        keywords: [
            'electric',
            'electricity',
            'plug',
        ],
    },
    {
        code: '💻',
        keywords: [
            'computer',
            'pc',
            'personal',
        ],
    },
    {
        code: '🖥',
        keywords: [
            'computer',
            'desktop',
        ],
    },
    {
        code: '🖨',
        keywords: [
            'computer',
            'printer',
        ],
    },
    {
        code: '⌨',
        keywords: [
            'computer',
            'keyboard',
        ],
    },
    {
        code: '🖱',
        keywords: [
            '3',
            'button',
            'computer',
            'mouse',
            'three',
        ],
    },
    {
        code: '🖲',
        keywords: [
            'computer',
            'trackball',
        ],
    },
    {
        code: '💽',
        keywords: [
            'computer',
            'disk',
            'entertainment',
            'minidisk',
            'optical',
        ],
    },
    {
        code: '💾',
        keywords: [
            'computer',
            'disk',
            'floppy',
        ],
    },
    {
        code: '💿',
        keywords: [
            'blu-ray',
            'cd',
            'computer',
            'disk',
            'dvd',
            'optical',
        ],
    },
    {
        code: '📀',
        keywords: [
            'blu-ray',
            'cd',
            'computer',
            'disk',
            'dvd',
            'entertainment',
            'optical',
        ],
    },
    {
        code: '🎥',
        keywords: [
            'activity',
            'camera',
            'cinema',
            'entertainment',
            'movie',
        ],
    },
    {
        code: '🎞',
        keywords: [
            'cinema',
            'entertainment',
            'film',
            'frames',
            'movie',
        ],
    },
    {
        code: '📽',
        keywords: [
            'cinema',
            'entertainment',
            'film',
            'movie',
            'projector',
            'video',
        ],
    },
    {
        code: '🎬',
        keywords: [
            'activity',
            'clapper',
            'entertainment',
            'movie',
        ],
    },
    {
        code: '📺',
        keywords: [
            'entertainment',
            'television',
            'tv',
            'video',
        ],
    },
    {
        code: '📷',
        keywords: [
            'camera',
            'entertainment',
            'video',
        ],
    },
    {
        code: '📸',
        keywords: [
            'camera',
            'flash',
            'video',
        ],
    },
    {
        code: '📹',
        keywords: [
            'camera',
            'entertainment',
            'video',
        ],
    },
    {
        code: '📼',
        keywords: [
            'entertainment',
            'tape',
            'vhs',
            'video',
            'videocassette',
        ],
    },
    {
        code: '🔍',
        keywords: [
            'glass',
            'magnifying',
            'search',
            'tool',
        ],
    },
    {
        code: '🔎',
        keywords: [
            'glass',
            'magnifying',
            'search',
            'tool',
        ],
    },
    {
        code: '🔬',
        keywords: [
            'microscope',
            'tool',
        ],
    },
    {
        code: '🔭',
        keywords: [
            'telescope',
            'tool',
        ],
    },
    {
        code: '📡',
        keywords: [
            'antenna',
            'communication',
            'dish',
            'satellite',
        ],
    },
    {
        code: '🕯',
        keywords: [
            'candle',
            'light',
        ],
    },
    {
        code: '💡',
        keywords: [
            'bulb',
            'comic',
            'electric',
            'idea',
            'light',
        ],
    },
    {
        code: '🔦',
        keywords: [
            'electric',
            'flashlight',
            'light',
            'tool',
            'torch',
        ],
    },
    {
        code: '🏮',
        keywords: [
            'bar',
            'japanese',
            'lantern',
            'light',
            'red',
        ],
    },
    {
        code: '📔',
        keywords: [
            'book',
            'cover',
            'decorated',
            'notebook',
        ],
    },
    {
        code: '📕',
        keywords: [
            'book',
            'closed',
        ],
    },
    {
        code: '📖',
        keywords: [
            'book',
            'open',
        ],
    },
    {
        code: '📗',
        keywords: [
            'book',
            'green',
        ],
    },
    {
        code: '📘',
        keywords: [
            'blue',
            'book',
        ],
    },
    {
        code: '📙',
        keywords: [
            'book',
            'orange',
        ],
    },
    {
        code: '📚',
        keywords: [
            'book',
            'books',
        ],
    },
    {
        code: '📓',
        keywords: [
            'notebook',
        ],
    },
    {
        code: '📒',
        keywords: [
            'ledger',
            'notebook',
        ],
    },
    {
        code: '📃',
        keywords: [
            'curl',
            'document',
            'page',
        ],
    },
    {
        code: '📜',
        keywords: [
            'paper',
            'scroll',
        ],
    },
    {
        code: '📄',
        keywords: [
            'document',
            'page',
        ],
    },
    {
        code: '📰',
        keywords: [
            'communication',
            'news',
            'newspaper',
            'paper',
        ],
    },
    {
        code: '🗞',
        keywords: [
            'news',
            'newspaper',
            'paper',
            'rolled',
        ],
    },
    {
        code: '📑',
        keywords: [
            'bookmark',
            'mark',
            'marker',
            'tabs',
        ],
    },
    {
        code: '🔖',
        keywords: [
            'bookmark',
            'mark',
        ],
    },
    {
        code: '🏷',
        keywords: [
            'label',
        ],
    },
    {
        code: '💰',
        keywords: [
            'bag',
            'dollar',
            'money',
            'moneybag',
        ],
    },
    {
        code: '💴',
        keywords: [
            'bank',
            'banknote',
            'bill',
            'currency',
            'money',
            'note',
            'yen',
        ],
    },
    {
        code: '💵',
        keywords: [
            'bank',
            'banknote',
            'bill',
            'currency',
            'dollar',
            'money',
            'note',
        ],
    },
    {
        code: '💶',
        keywords: [
            'bank',
            'banknote',
            'bill',
            'currency',
            'euro',
            'money',
            'note',
        ],
    },
    {
        code: '💷',
        keywords: [
            'bank',
            'banknote',
            'bill',
            'currency',
            'money',
            'note',
            'pound',
        ],
    },
    {
        code: '💸',
        keywords: [
            'bank',
            'banknote',
            'bill',
            'dollar',
            'fly',
            'money',
            'note',
            'wings',
        ],
    },
    {
        code: '💳',
        keywords: [
            'bank',
            'card',
            'credit',
            'money',
        ],
    },
    {
        code: '💹',
        keywords: [
            'bank',
            'chart',
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
        code: '💱',
        keywords: [
            'bank',
            'currency',
            'exchange',
            'money',
        ],
    },
    {
        code: '💲',
        keywords: [
            'currency',
            'dollar',
            'money',
        ],
    },
    {
        code: '✉',
        keywords: [
            'e-mail',
            'email',
            'envelope',
        ],
    },
    {
        code: '📧',
        keywords: [
            'communication',
            'e-mail',
            'email',
            'letter',
            'mail',
        ],
    },
    {
        code: '📨',
        keywords: [
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
        code: '📩',
        keywords: [
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
        code: '📤',
        keywords: [
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
        code: '📥',
        keywords: [
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
        code: '📦',
        keywords: [
            'box',
            'communication',
            'package',
            'parcel',
        ],
    },
    {
        code: '📫',
        keywords: [
            'closed',
            'communication',
            'flag',
            'mail',
            'mailbox',
            'postbox',
        ],
    },
    {
        code: '📪',
        keywords: [
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
        code: '📬',
        keywords: [
            'communication',
            'flag',
            'mail',
            'mailbox',
            'open',
            'postbox',
        ],
    },
    {
        code: '📭',
        keywords: [
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
        code: '📮',
        keywords: [
            'communication',
            'mail',
            'mailbox',
            'postbox',
        ],
    },
    {
        code: '🗳',
        keywords: [
            'ballot',
            'box',
        ],
    },
    {
        code: '✏',
        keywords: [
            'pencil',
        ],
    },
    {
        code: '✒',
        keywords: [
            'nib',
            'pen',
        ],
    },
    {
        code: '🖋',
        keywords: [
            'communication',
            'fountain',
            'pen',
        ],
    },
    {
        code: '🖊',
        keywords: [
            'ballpoint',
            'communication',
            'pen',
        ],
    },
    {
        code: '🖌',
        keywords: [
            'communication',
            'paintbrush',
            'painting',
        ],
    },
    {
        code: '🖍',
        keywords: [
            'communication',
            'crayon',
        ],
    },
    {
        code: '📝',
        keywords: [
            'communication',
            'memo',
            'pencil',
        ],
    },
    {
        code: '💼',
        keywords: [
            'briefcase',
        ],
    },
    {
        code: '📁',
        keywords: [
            'file',
            'folder',
        ],
    },
    {
        code: '📂',
        keywords: [
            'file',
            'folder',
            'open',
        ],
    },
    {
        code: '🗂',
        keywords: [
            'card',
            'dividers',
            'index',
        ],
    },
    {
        code: '📅',
        keywords: [
            'calendar',
            'date',
        ],
    },
    {
        code: '📆',
        keywords: [
            'calendar',
        ],
    },
    {
        code: '🗒',
        keywords: [
            'note',
            'pad',
            'spiral',
        ],
    },
    {
        code: '🗓',
        keywords: [
            'calendar',
            'pad',
            'spiral',
        ],
    },
    {
        code: '📇',
        keywords: [
            'card',
            'index',
            'rolodex',
        ],
    },
    {
        code: '📈',
        keywords: [
            'chart',
            'graph',
            'growth',
            'trend',
            'upward',
        ],
    },
    {
        code: '📉',
        keywords: [
            'chart',
            'down',
            'graph',
            'trend',
        ],
    },
    {
        code: '📊',
        keywords: [
            'bar',
            'chart',
            'graph',
        ],
    },
    {
        code: '📋',
        keywords: [
            'clipboard',
        ],
    },
    {
        code: '📌',
        keywords: [
            'pin',
            'pushpin',
        ],
    },
    {
        code: '📍',
        keywords: [
            'pin',
            'pushpin',
        ],
    },
    {
        code: '📎',
        keywords: [
            'paperclip',
        ],
    },
    {
        code: '🖇',
        keywords: [
            'communication',
            'link',
            'paperclip',
        ],
    },
    {
        code: '📏',
        keywords: [
            'ruler',
            'straight edge',
        ],
    },
    {
        code: '📐',
        keywords: [
            'ruler',
            'set',
            'triangle',
        ],
    },
    {
        code: '✂',
        keywords: [
            'scissors',
            'tool',
        ],
    },
    {
        code: '🗃',
        keywords: [
            'box',
            'card',
            'file',
        ],
    },
    {
        code: '🗄',
        keywords: [
            'cabinet',
            'file',
        ],
    },
    {
        code: '🗑',
        keywords: [
            'wastebasket',
        ],
    },
    {
        code: '🔒',
        keywords: [
            'closed',
            'lock',
        ],
    },
    {
        code: '🔓',
        keywords: [
            'lock',
            'open',
            'unlock',
        ],
    },
    {
        code: '🔏',
        keywords: [
            'ink',
            'lock',
            'nib',
            'pen',
            'privacy',
        ],
    },
    {
        code: '🔐',
        keywords: [
            'closed',
            'key',
            'lock',
            'secure',
        ],
    },
    {
        code: '🔑',
        keywords: [
            'key',
            'lock',
            'password',
        ],
    },
    {
        code: '🗝',
        keywords: [
            'clue',
            'key',
            'lock',
            'old',
        ],
    },
    {
        code: '🔨',
        keywords: [
            'hammer',
            'tool',
        ],
    },
    {
        code: '⛏',
        keywords: [
            'mining',
            'pick',
            'tool',
        ],
    },
    {
        code: '⚒',
        keywords: [
            'hammer',
            'pick',
            'tool',
        ],
    },
    {
        code: '🛠',
        keywords: [
            'hammer',
            'tool',
            'wrench',
        ],
    },
    {
        code: '🗡',
        keywords: [
            'dagger',
            'knife',
            'weapon',
        ],
    },
    {
        code: '⚔',
        keywords: [
            'crossed',
            'swords',
            'weapon',
        ],
    },
    {
        code: '🔫',
        keywords: [
            'gun',
            'handgun',
            'pistol',
            'revolver',
            'tool',
            'weapon',
        ],
    },
    {
        code: '🏹',
        keywords: [
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
        code: '🛡',
        keywords: [
            'shield',
            'weapon',
        ],
    },
    {
        code: '🔧',
        keywords: [
            'tool',
            'wrench',
        ],
    },
    {
        code: '🔩',
        keywords: [
            'bolt',
            'nut',
            'tool',
        ],
    },
    {
        code: '⚙',
        keywords: [
            'gear',
            'tool',
        ],
    },
    {
        code: '🗜',
        keywords: [
            'compression',
            'tool',
            'vice',
        ],
    },
    {
        code: '⚗',
        keywords: [
            'alembic',
            'chemistry',
            'tool',
        ],
    },
    {
        code: '⚖',
        keywords: [
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
        code: '🔗',
        keywords: [
            'link',
        ],
    },
    {
        code: '⛓',
        keywords: [
            'chain',
        ],
    },
    {
        code: '💉',
        keywords: [
            'doctor',
            'medicine',
            'needle',
            'shot',
            'sick',
            'syringe',
            'tool',
        ],
    },
    {
        code: '💊',
        keywords: [
            'doctor',
            'medicine',
            'pill',
            'sick',
        ],
    },
    {
        code: '🚬',
        keywords: [
            'activity',
            'smoking',
        ],
    },
    {
        code: '⚰',
        keywords: [
            'coffin',
            'death',
        ],
    },
    {
        code: '⚱',
        keywords: [
            'death',
            'funeral',
            'urn',
        ],
    },
    {
        code: '🗿',
        keywords: [
            'face',
            'moyai',
            'statue',
        ],
    },
    {
        code: '🛢',
        keywords: [
            'drum',
            'oil',
        ],
    },
    {
        code: '🔮',
        keywords: [
            'ball',
            'crystal',
            'fairy tale',
            'fantasy',
            'fortune',
            'tool',
        ],
    },
    {
        code: '🛒',
        keywords: [
            'cart',
            'shopping',
            'trolley',
        ],
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: 'Symbols',
        header: true,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: '🏧',
        keywords: [
            'atm',
            'automated',
            'bank',
            'teller',
        ],
    },
    {
        code: '🚮',
        keywords: [
            'litter',
            'litterbox',
        ],
    },
    {
        code: '🚰',
        keywords: [
            'drink',
            'potable',
            'water',
        ],
    },
    {
        code: '♿',
        keywords: [
            'access',
            'wheelchair',
        ],
    },
    {
        code: '🚹',
        keywords: [
            'lavatory',
            'man',
            'restroom',
            'wc',
        ],
    },
    {
        code: '🚺',
        keywords: [
            'lavatory',
            'restroom',
            'wc',
            'woman',
        ],
    },
    {
        code: '🚻',
        keywords: [
            'lavatory',
            'restroom',
            'wc',
        ],
    },
    {
        code: '🚼',
        keywords: [
            'baby',
            'changing',
        ],
    },
    {
        code: '🚾',
        keywords: [
            'closet',
            'lavatory',
            'restroom',
            'water',
            'wc',
        ],
    },
    {
        code: '🛂',
        keywords: [
            'control',
            'passport',
        ],
    },
    {
        code: '🛃',
        keywords: [
            'customs',
        ],
    },
    {
        code: '🛄',
        keywords: [
            'baggage',
            'claim',
        ],
    },
    {
        code: '🛅',
        keywords: [
            'baggage',
            'left luggage',
            'locker',
            'luggage',
        ],
    },
    {
        code: '⚠',
        keywords: [
            'warning',
        ],
    },
    {
        code: '🚸',
        keywords: [
            'child',
            'crossing',
            'pedestrian',
            'traffic',
        ],
    },
    {
        code: '⛔',
        keywords: [
            'entry',
            'forbidden',
            'no',
            'not',
            'prohibited',
            'traffic',
        ],
    },
    {
        code: '🚫',
        keywords: [
            'entry',
            'forbidden',
            'no',
            'not',
            'prohibited',
        ],
    },
    {
        code: '🚳',
        keywords: [
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
        code: '🚭',
        keywords: [
            'forbidden',
            'no',
            'not',
            'prohibited',
            'smoking',
        ],
    },
    {
        code: '🚯',
        keywords: [
            'forbidden',
            'litter',
            'no',
            'not',
            'prohibited',
        ],
    },
    {
        code: '🚱',
        keywords: [
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
        code: '🚷',
        keywords: [
            'forbidden',
            'no',
            'not',
            'pedestrian',
            'prohibited',
        ],
    },
    {
        code: '📵',
        keywords: [
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
        code: '🔞',
        keywords: [
            '18',
            'age restriction',
            'eighteen',
            'forbidden',
            'no',
            'not',
            'prohibited',
            'underage',
        ],
    },
    {
        code: '☢',
        keywords: [
            'radioactive',
        ],
    },
    {
        code: '☣',
        keywords: [
            'biohazard',
        ],
    },
    {
        code: '⬆',
        keywords: [
            'arrow',
            'cardinal',
            'direction',
            'north',
        ],
    },
    {
        code: '↗',
        keywords: [
            'arrow',
            'direction',
            'intercardinal',
            'northeast',
        ],
    },
    {
        code: '➡',
        keywords: [
            'arrow',
            'cardinal',
            'direction',
            'east',
        ],
    },
    {
        code: '↘',
        keywords: [
            'arrow',
            'direction',
            'intercardinal',
            'southeast',
        ],
    },
    {
        code: '⬇',
        keywords: [
            'arrow',
            'cardinal',
            'direction',
            'down',
            'south',
        ],
    },
    {
        code: '↙',
        keywords: [
            'arrow',
            'direction',
            'intercardinal',
            'southwest',
        ],
    },
    {
        code: '⬅',
        keywords: [
            'arrow',
            'cardinal',
            'direction',
            'west',
        ],
    },
    {
        code: '↖',
        keywords: [
            'arrow',
            'direction',
            'intercardinal',
            'northwest',
        ],
    },
    {
        code: '↕',
        keywords: [
            'arrow',
        ],
    },
    {
        code: '↔',
        keywords: [
            'arrow',
        ],
    },
    {
        code: '↩',
        keywords: [
            'arrow',
        ],
    },
    {
        code: '↪',
        keywords: [
            'arrow',
        ],
    },
    {
        code: '⤴',
        keywords: [
            'arrow',
        ],
    },
    {
        code: '⤵',
        keywords: [
            'arrow',
            'down',
        ],
    },
    {
        code: '🔃',
        keywords: [
            'arrow',
            'clockwise',
            'reload',
        ],
    },
    {
        code: '🔄',
        keywords: [
            'anticlockwise',
            'arrow',
            'counterclockwise',
            'withershins',
        ],
    },
    {
        code: '🔙',
        keywords: [
            'arrow',
            'back',
        ],
    },
    {
        code: '🔚',
        keywords: [
            'arrow',
            'end',
        ],
    },
    {
        code: '🔛',
        keywords: [
            'arrow',
            'mark',
            'on',
        ],
    },
    {
        code: '🔜',
        keywords: [
            'arrow',
            'soon',
        ],
    },
    {
        code: '🔝',
        keywords: [
            'arrow',
            'top',
            'up',
        ],
    },
    {
        code: '🛐',
        keywords: [
            'religion',
            'worship',
        ],
    },
    {
        code: '⚛',
        keywords: [
            'atheist',
            'atom',
        ],
    },
    {
        code: '🕉',
        keywords: [
            'hindu',
            'om',
            'religion',
        ],
    },
    {
        code: '✡',
        keywords: [
            'david',
            'jew',
            'jewish',
            'religion',
            'star',
        ],
    },
    {
        code: '☸',
        keywords: [
            'buddhist',
            'dharma',
            'religion',
            'wheel',
        ],
    },
    {
        code: '☯',
        keywords: [
            'religion',
            'tao',
            'taoist',
            'yang',
            'yin',
        ],
    },
    {
        code: '✝',
        keywords: [
            'christian',
            'cross',
            'religion',
        ],
    },
    {
        code: '☦',
        keywords: [
            'christian',
            'cross',
            'religion',
        ],
    },
    {
        code: '☪',
        keywords: [
            'islam',
            'muslim',
            'religion',
        ],
    },
    {
        code: '☮',
        keywords: [
            'peace',
        ],
    },
    {
        code: '🕎',
        keywords: [
            'candelabrum',
            'candlestick',
            'menorah',
            'religion',
        ],
    },
    {
        code: '🔯',
        keywords: [
            'fortune',
            'star',
        ],
    },
    {
        code: '♻',
        keywords: [
            'recycle',
        ],
    },
    {
        code: '📛',
        keywords: [
            'badge',
            'name',
        ],
    },
    {
        code: '⚜',
        keywords: [
            'fleur-de-lis',
        ],
    },
    {
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
        code: '🔱',
        keywords: [
            'anchor',
            'emblem',
            'ship',
            'tool',
            'trident',
        ],
    },
    {
        code: '⭕',
        keywords: [
            'circle',
            'o',
        ],
    },
    {
        code: '✅',
        keywords: [
            'check',
            'mark',
        ],
    },
    {
        code: '☑',
        keywords: [
            'ballot',
            'box',
            'check',
        ],
    },
    {
        code: '✔',
        keywords: [
            'check',
            'mark',
        ],
    },
    {
        code: '✖',
        keywords: [
            'cancel',
            'multiplication',
            'multiply',
            'x',
        ],
    },
    {
        code: '❌',
        keywords: [
            'cancel',
            'mark',
            'multiplication',
            'multiply',
            'x',
        ],
    },
    {
        code: '❎',
        keywords: [
            'mark',
            'square',
        ],
    },
    {
        code: '➕',
        keywords: [
            'math',
            'plus',
        ],
    },
    {
        code: '➖',
        keywords: [
            'math',
            'minus',
        ],
    },
    {
        code: '➗',
        keywords: [
            'division',
            'math',
        ],
    },
    {
        code: '➰',
        keywords: [
            'curl',
            'loop',
        ],
    },
    {
        code: '➿',
        keywords: [
            'curl',
            'double',
            'loop',
        ],
    },
    {
        code: '〽',
        keywords: [
            'mark',
            'part',
        ],
    },
    {
        code: '✳',
        keywords: [
            'asterisk',
        ],
    },
    {
        code: '✴',
        keywords: [
            'star',
        ],
    },
    {
        code: '❇',
        keywords: [
            'sparkle',
        ],
    },
    {
        code: '‼',
        keywords: [
            'bangbang',
            'exclamation',
            'mark',
            'punctuation',
        ],
    },
    {
        code: '⁉',
        keywords: [
            'exclamation',
            'interrobang',
            'mark',
            'punctuation',
            'question',
        ],
    },
    {
        code: '❓',
        keywords: [
            'mark',
            'punctuation',
            'question',
        ],
    },
    {
        code: '❔',
        keywords: [
            'mark',
            'outlined',
            'punctuation',
            'question',
        ],
    },
    {
        code: '❕',
        keywords: [
            'exclamation',
            'mark',
            'outlined',
            'punctuation',
        ],
    },
    {
        code: '❗',
        keywords: [
            'exclamation',
            'mark',
            'punctuation',
        ],
    },
    {
        code: '〰',
        keywords: [
            'dash',
            'punctuation',
            'wavy',
        ],
    },
    {
        code: '©',
        keywords: [
            'copyright',
        ],
    },
    {
        code: '®',
        keywords: [
            'registered',
        ],
    },
    {
        code: '™',
        keywords: [
            'mark',
            'tm',
            'trademark',
        ],
    },
    {
        code: '♈',
        keywords: [
            'aries',
            'ram',
            'zodiac',
        ],
    },
    {
        code: '♉',
        keywords: [
            'bull',
            'ox',
            'taurus',
            'zodiac',
        ],
    },
    {
        code: '♊',
        keywords: [
            'gemini',
            'twins',
            'zodiac',
        ],
    },
    {
        code: '♋',
        keywords: [
            'cancer',
            'crab',
            'zodiac',
        ],
    },
    {
        code: '♌',
        keywords: [
            'leo',
            'lion',
            'zodiac',
        ],
    },
    {
        code: '♍',
        keywords: [
            'maiden',
            'virgin',
            'virgo',
            'zodiac',
        ],
    },
    {
        code: '♎',
        keywords: [
            'balance',
            'justice',
            'libra',
            'scales',
            'zodiac',
        ],
    },
    {
        code: '♏',
        keywords: [
            'scorpio',
            'scorpion',
            'scorpius',
            'zodiac',
        ],
    },
    {
        code: '♐',
        keywords: [
            'archer',
            'sagittarius',
            'zodiac',
        ],
    },
    {
        code: '♑',
        keywords: [
            'capricorn',
            'goat',
            'zodiac',
        ],
    },
    {
        code: '♒',
        keywords: [
            'aquarius',
            'bearer',
            'water',
            'zodiac',
        ],
    },
    {
        code: '♓',
        keywords: [
            'fish',
            'pisces',
            'zodiac',
        ],
    },
    {
        code: '⛎',
        keywords: [
            'bearer',
            'ophiuchus',
            'serpent',
            'snake',
            'zodiac',
        ],
    },
    {
        code: '🔀',
        keywords: [
            'arrow',
            'crossed',
        ],
    },
    {
        code: '🔁',
        keywords: [
            'arrow',
            'clockwise',
            'repeat',
        ],
    },
    {
        code: '🔂',
        keywords: [
            'arrow',
            'clockwise',
            'once',
        ],
    },
    {
        code: '▶',
        keywords: [
            'arrow',
            'play',
            'right',
            'triangle',
        ],
    },
    {
        code: '⏩',
        keywords: [
            'arrow',
            'double',
            'fast',
            'forward',
        ],
    },
    {
        code: '⏭',
        keywords: [
            'arrow',
            'next scene',
            'next track',
            'triangle',
        ],
    },
    {
        code: '⏯',
        keywords: [
            'arrow',
            'pause',
            'play',
            'right',
            'triangle',
        ],
    },
    {
        code: '◀',
        keywords: [
            'arrow',
            'left',
            'reverse',
            'triangle',
        ],
    },
    {
        code: '⏪',
        keywords: [
            'arrow',
            'double',
            'rewind',
        ],
    },
    {
        code: '⏮',
        keywords: [
            'arrow',
            'previous scene',
            'previous track',
            'triangle',
        ],
    },
    {
        code: '🔼',
        keywords: [
            'arrow',
            'button',
            'red',
        ],
    },
    {
        code: '⏫',
        keywords: [
            'arrow',
            'double',
        ],
    },
    {
        code: '🔽',
        keywords: [
            'arrow',
            'button',
            'down',
            'red',
        ],
    },
    {
        code: '⏬',
        keywords: [
            'arrow',
            'double',
            'down',
        ],
    },
    {
        code: '⏸',
        keywords: [
            'bar',
            'double',
            'pause',
            'vertical',
        ],
    },
    {
        code: '⏹',
        keywords: [
            'square',
            'stop',
        ],
    },
    {
        code: '⏺',
        keywords: [
            'circle',
            'record',
        ],
    },
    {
        code: '⏏',
        keywords: [
            'eject',
        ],
    },
    {
        code: '🎦',
        keywords: [
            'activity',
            'camera',
            'cinema',
            'entertainment',
            'film',
            'movie',
        ],
    },
    {
        code: '🔅',
        keywords: [
            'brightness',
            'dim',
            'low',
        ],
    },
    {
        code: '🔆',
        keywords: [
            'bright',
            'brightness',
        ],
    },
    {
        code: '📶',
        keywords: [
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
        code: '📳',
        keywords: [
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
        code: '📴',
        keywords: [
            'cell',
            'communication',
            'mobile',
            'off',
            'phone',
            'telephone',
        ],
    },
    {
        code: '#️⃣',
        keywords: [
            'hash',
            'keycap',
            'pound',
        ],
    },
    {
        code: '*️⃣',
        keywords: [
            'asterisk',
            'keycap',
            'star',
        ],
    },
    {
        code: '0️⃣',
        keywords: [
            '0',
            'keycap',
            'zero',
        ],
    },
    {
        code: '1️⃣',
        keywords: [
            '1',
            'keycap',
            'one',
        ],
    },
    {
        code: '2️⃣',
        keywords: [
            '2',
            'keycap',
            'two',
        ],
    },
    {
        code: '3️⃣',
        keywords: [
            '3',
            'keycap',
            'three',
        ],
    },
    {
        code: '4️⃣',
        keywords: [
            '4',
            'four',
            'keycap',
        ],
    },
    {
        code: '5️⃣',
        keywords: [
            '5',
            'five',
            'keycap',
        ],
    },
    {
        code: '6️⃣',
        keywords: [
            '6',
            'keycap',
            'six',
        ],
    },
    {
        code: '7️⃣',
        keywords: [
            '7',
            'keycap',
            'seven',
        ],
    },
    {
        code: '8️⃣',
        keywords: [
            '8',
            'eight',
            'keycap',
        ],
    },
    {
        code: '9️⃣',
        keywords: [
            '9',
            'keycap',
            'nine',
        ],
    },
    {
        code: '🔟',
        keywords: [
            '10',
            'keycap',
            'ten',
        ],
    },
    {
        code: '💯',
        keywords: [
            '100',
            'full',
            'hundred',
            'score',
        ],
    },
    {
        code: '🔠',
        keywords: [
            'input',
            'latin',
            'letters',
            'uppercase',
        ],
    },
    {
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
        code: '🔢',
        keywords: [
            '1234',
            'input',
            'numbers',
        ],
    },
    {
        code: '🔣',
        keywords: [
            'input',
        ],
    },
    {
        code: '🔤',
        keywords: [
            'abc',
            'alphabet',
            'input',
            'latin',
            'letters',
        ],
    },
    {
        code: '🅰',
        keywords: [
            'a',
            'blood',
        ],
    },
    {
        code: '🆎',
        keywords: [
            'ab',
            'blood',
        ],
    },
    {
        code: '🅱',
        keywords: [
            'b',
            'blood',
        ],
    },
    {
        code: '🆑',
        keywords: [
            'cl',
        ],
    },
    {
        code: '🆒',
        keywords: [
            'cool',
        ],
    },
    {
        code: '🆓',
        keywords: [
            'free',
        ],
    },
    {
        code: 'ℹ',
        keywords: [
            'i',
            'information',
        ],
    },
    {
        code: '🆔',
        keywords: [
            'id',
            'identity',
        ],
    },
    {
        code: 'Ⓜ',
        keywords: [
            'circle',
            'm',
        ],
    },
    {
        code: '🆕',
        keywords: [
            'new',
        ],
    },
    {
        code: '🆖',
        keywords: [
            'ng',
        ],
    },
    {
        code: '🅾',
        keywords: [
            'blood',
            'o',
        ],
    },
    {
        code: '🆗',
        keywords: [
            'ok',
        ],
    },
    {
        code: '🅿',
        keywords: [
            'parking',
        ],
    },
    {
        code: '🆘',
        keywords: [
            'help',
            'sos',
        ],
    },
    {
        code: '🆙',
        keywords: [
            'mark',
            'up',
        ],
    },
    {
        code: '🆚',
        keywords: [
            'versus',
            'vs',
        ],
    },
    {
        code: '🈁',
        keywords: [
            'japanese',
        ],
    },
    {
        code: '🈂',
        keywords: [
            'japanese',
        ],
    },
    {
        code: '🈷',
        keywords: [
            'japanese',
        ],
    },
    {
        code: '🈶',
        keywords: [
            'japanese',
        ],
    },
    {
        code: '🈯',
        keywords: [
            'japanese',
        ],
    },
    {
        code: '🉐',
        keywords: [
            'japanese',
        ],
    },
    {
        code: '🈹',
        keywords: [
            'japanese',
        ],
    },
    {
        code: '🈚',
        keywords: [
            'japanese',
        ],
    },
    {
        code: '🈲',
        keywords: [
            'japanese',
        ],
    },
    {
        code: '🉑',
        keywords: [
            'chinese',
        ],
    },
    {
        code: '🈸',
        keywords: [
            'chinese',
        ],
    },
    {
        code: '🈴',
        keywords: [
            'chinese',
        ],
    },
    {
        code: '🈳',
        keywords: [
            'chinese',
        ],
    },
    {
        code: '㊗',
        keywords: [
            'chinese',
            'congratulation',
            'congratulations',
            'ideograph',
        ],
    },
    {
        code: '㊙',
        keywords: [
            'chinese',
            'ideograph',
            'secret',
        ],
    },
    {
        code: '🈺',
        keywords: [
            'chinese',
        ],
    },
    {
        code: '🈵',
        keywords: [
            'chinese',
        ],
    },
    {
        code: '▪',
        keywords: [
            'geometric',
            'square',
        ],
    },
    {
        code: '▫',
        keywords: [
            'geometric',
            'square',
        ],
    },
    {
        code: '◻',
        keywords: [
            'geometric',
            'square',
        ],
    },
    {
        code: '◼',
        keywords: [
            'geometric',
            'square',
        ],
    },
    {
        code: '◽',
        keywords: [
            'geometric',
            'square',
        ],
    },
    {
        code: '◾',
        keywords: [
            'geometric',
            'square',
        ],
    },
    {
        code: '⬛',
        keywords: [
            'geometric',
            'square',
        ],
    },
    {
        code: '⬜',
        keywords: [
            'geometric',
            'square',
        ],
    },
    {
        code: '🔶',
        keywords: [
            'diamond',
            'geometric',
            'orange',
        ],
    },
    {
        code: '🔷',
        keywords: [
            'blue',
            'diamond',
            'geometric',
        ],
    },
    {
        code: '🔸',
        keywords: [
            'diamond',
            'geometric',
            'orange',
        ],
    },
    {
        code: '🔹',
        keywords: [
            'blue',
            'diamond',
            'geometric',
        ],
    },
    {
        code: '🔺',
        keywords: [
            'geometric',
            'red',
        ],
    },
    {
        code: '🔻',
        keywords: [
            'down',
            'geometric',
            'red',
        ],
    },
    {
        code: '💠',
        keywords: [
            'comic',
            'diamond',
            'geometric',
            'inside',
        ],
    },
    {
        code: '🔘',
        keywords: [
            'button',
            'geometric',
            'radio',
        ],
    },
    {
        code: '🔲',
        keywords: [
            'button',
            'geometric',
            'square',
        ],
    },
    {
        code: '🔳',
        keywords: [
            'button',
            'geometric',
            'outlined',
            'square',
        ],
    },
    {
        code: '⚪',
        keywords: [
            'circle',
            'geometric',
        ],
    },
    {
        code: '⚫',
        keywords: [
            'circle',
            'geometric',
        ],
    },
    {
        code: '🔴',
        keywords: [
            'circle',
            'geometric',
            'red',
        ],
    },
    {
        code: '🔵',
        keywords: [
            'blue',
            'circle',
            'geometric',
        ],
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: 'Flags',
        header: true,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: CONST.EMOJI_SPACER,
    },
    {
        code: '🏁',
        keywords: [
            'checkered',
            'chequered',
            'flag',
            'racing',
        ],
    },
    {
        code: '🚩',
        keywords: [
            'flag',
            'post',
        ],
    },
    {
        code: '🎌',
        keywords: [
            'activity',
            'celebration',
            'cross',
            'crossed',
            'flag',
            'japanese',
        ],
    },
    {
        code: '🏴',
        keywords: [
            'flag',
            'waving',
        ],
    },
    {
        code: '🏳',
        keywords: [
            'flag',
            'waving',
        ],
    },
    {
        code: '🇦🇨',
        keywords: [
            'ascension',
            'flag',
            'island',
        ],
    },
    {
        code: '🇦🇩',
        keywords: [
            'andorra',
            'flag',
        ],
    },
    {
        code: '🇦🇪',
        keywords: [
            'emirates',
            'flag',
            'uae',
            'united',
        ],
    },
    {
        code: '🇦🇫',
        keywords: [
            'afghanistan',
            'flag',
        ],
    },
    {
        code: '🇦🇬',
        keywords: [
            'antigua',
            'barbuda',
            'flag',
        ],
    },
    {
        code: '🇦🇮',
        keywords: [
            'anguilla',
            'flag',
        ],
    },
    {
        code: '🇦🇱',
        keywords: [
            'albania',
            'flag',
        ],
    },
    {
        code: '🇦🇲',
        keywords: [
            'armenia',
            'flag',
        ],
    },
    {
        code: '🇦🇴',
        keywords: [
            'angola',
            'flag',
        ],
    },
    {
        code: '🇦🇶',
        keywords: [
            'antarctica',
            'flag',
        ],
    },
    {
        code: '🇦🇷',
        keywords: [
            'argentina',
            'flag',
        ],
    },
    {
        code: '🇦🇸',
        keywords: [
            'american',
            'flag',
            'samoa',
        ],
    },
    {
        code: '🇦🇹',
        keywords: [
            'austria',
            'flag',
        ],
    },
    {
        code: '🇦🇺',
        keywords: [
            'australia',
            'flag',
        ],
    },
    {
        code: '🇦🇼',
        keywords: [
            'aruba',
            'flag',
        ],
    },
    {
        code: '🇦🇽',
        keywords: [
            'åland',
            'flag',
        ],
    },
    {
        code: '🇦🇿',
        keywords: [
            'azerbaijan',
            'flag',
        ],
    },
    {
        code: '🇧🇦',
        keywords: [
            'bosnia',
            'flag',
            'herzegovina',
        ],
    },
    {
        code: '🇧🇧',
        keywords: [
            'barbados',
            'flag',
        ],
    },
    {
        code: '🇧🇩',
        keywords: [
            'bangladesh',
            'flag',
        ],
    },
    {
        code: '🇧🇪',
        keywords: [
            'belgium',
            'flag',
        ],
    },
    {
        code: '🇧🇫',
        keywords: [
            'burkina faso',
            'flag',
        ],
    },
    {
        code: '🇧🇬',
        keywords: [
            'bulgaria',
            'flag',
        ],
    },
    {
        code: '🇧🇭',
        keywords: [
            'bahrain',
            'flag',
        ],
    },
    {
        code: '🇧🇮',
        keywords: [
            'burundi',
            'flag',
        ],
    },
    {
        code: '🇧🇯',
        keywords: [
            'benin',
            'flag',
        ],
    },
    {
        code: '🇧🇱',
        keywords: [
            'barthelemy',
            'barthélemy',
            'flag',
            'saint',
        ],
    },
    {
        code: '🇧🇲',
        keywords: [
            'bermuda',
            'flag',
        ],
    },
    {
        code: '🇧🇳',
        keywords: [
            'brunei',
            'darussalam',
            'flag',
        ],
    },
    {
        code: '🇧🇴',
        keywords: [
            'bolivia',
            'flag',
        ],
    },
    {
        code: '🇧🇶',
        keywords: [
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
        code: '🇧🇷',
        keywords: [
            'brazil',
            'flag',
        ],
    },
    {
        code: '🇧🇸',
        keywords: [
            'bahamas',
            'flag',
        ],
    },
    {
        code: '🇧🇹',
        keywords: [
            'bhutan',
            'flag',
        ],
    },
    {
        code: '🇧🇻',
        keywords: [
            'bouvet',
            'flag',
            'island',
        ],
    },
    {
        code: '🇧🇼',
        keywords: [
            'botswana',
            'flag',
        ],
    },
    {
        code: '🇧🇾',
        keywords: [
            'belarus',
            'flag',
        ],
    },
    {
        code: '🇧🇿',
        keywords: [
            'belize',
            'flag',
        ],
    },
    {
        code: '🇨🇦',
        keywords: [
            'canada',
            'flag',
        ],
    },
    {
        code: '🇨🇨',
        keywords: [
            'cocos',
            'flag',
            'island',
            'keeling',
        ],
    },
    {
        code: '🇨🇩',
        keywords: [
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
        code: '🇨🇫',
        keywords: [
            'central african republic',
            'flag',
            'republic',
        ],
    },
    {
        code: '🇨🇬',
        keywords: [
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
        code: '🇨🇭',
        keywords: [
            'flag',
            'switzerland',
        ],
    },
    {
        code: '🇨🇮',
        keywords: [
            'cote ivoire',
            'côte ivoire',
            'flag',
            'ivory coast',
        ],
    },
    {
        code: '🇨🇰',
        keywords: [
            'cook',
            'flag',
            'island',
        ],
    },
    {
        code: '🇨🇱',
        keywords: [
            'chile',
            'flag',
        ],
    },
    {
        code: '🇨🇲',
        keywords: [
            'cameroon',
            'flag',
        ],
    },
    {
        code: '🇨🇳',
        keywords: [
            'china',
            'flag',
        ],
    },
    {
        code: '🇨🇴',
        keywords: [
            'colombia',
            'flag',
        ],
    },
    {
        code: '🇨🇵',
        keywords: [
            'clipperton',
            'flag',
            'island',
        ],
    },
    {
        code: '🇨🇷',
        keywords: [
            'costa rica',
            'flag',
        ],
    },
    {
        code: '🇨🇺',
        keywords: [
            'cuba',
            'flag',
        ],
    },
    {
        code: '🇨🇻',
        keywords: [
            'cabo',
            'cape',
            'flag',
            'verde',
        ],
    },
    {
        code: '🇨🇼',
        keywords: [
            'antilles',
            'curacao',
            'curaçao',
            'flag',
        ],
    },
    {
        code: '🇨🇽',
        keywords: [
            'christmas',
            'flag',
            'island',
        ],
    },
    {
        code: '🇨🇾',
        keywords: [
            'cyprus',
            'flag',
        ],
    },
    {
        code: '🇨🇿',
        keywords: [
            'czech republic',
            'flag',
        ],
    },
    {
        code: '🇩🇪',
        keywords: [
            'flag',
            'germany',
        ],
    },
    {
        code: '🇩🇬',
        keywords: [
            'diego garcia',
            'flag',
        ],
    },
    {
        code: '🇩🇯',
        keywords: [
            'djibouti',
            'flag',
        ],
    },
    {
        code: '🇩🇰',
        keywords: [
            'denmark',
            'flag',
        ],
    },
    {
        code: '🇩🇲',
        keywords: [
            'dominica',
            'flag',
        ],
    },
    {
        code: '🇩🇴',
        keywords: [
            'dominican republic',
            'flag',
        ],
    },
    {
        code: '🇩🇿',
        keywords: [
            'algeria',
            'flag',
        ],
    },
    {
        code: '🇪🇦',
        keywords: [
            'ceuta',
            'flag',
            'melilla',
        ],
    },
    {
        code: '🇪🇨',
        keywords: [
            'ecuador',
            'flag',
        ],
    },
    {
        code: '🇪🇪',
        keywords: [
            'estonia',
            'flag',
        ],
    },
    {
        code: '🇪🇬',
        keywords: [
            'egypt',
            'flag',
        ],
    },
    {
        code: '🇪🇭',
        keywords: [
            'flag',
            'sahara',
            'west',
            'western sahara',
        ],
    },
    {
        code: '🇪🇷',
        keywords: [
            'eritrea',
            'flag',
        ],
    },
    {
        code: '🇪🇸',
        keywords: [
            'flag',
            'spain',
        ],
    },
    {
        code: '🇪🇹',
        keywords: [
            'ethiopia',
            'flag',
        ],
    },
    {
        code: '🇪🇺',
        keywords: [
            'european union',
            'flag',
        ],
    },
    {
        code: '🇫🇮',
        keywords: [
            'finland',
            'flag',
        ],
    },
    {
        code: '🇫🇯',
        keywords: [
            'fiji',
            'flag',
        ],
    },
    {
        code: '🇫🇰',
        keywords: [
            'falkland',
            'falklands',
            'flag',
            'island',
            'islas',
            'malvinas',
        ],
    },
    {
        code: '🇫🇲',
        keywords: [
            'flag',
            'micronesia',
        ],
    },
    {
        code: '🇫🇴',
        keywords: [
            'faroe',
            'flag',
            'island',
        ],
    },
    {
        code: '🇫🇷',
        keywords: [
            'flag',
            'france',
        ],
    },
    {
        code: '🇬🇦',
        keywords: [
            'flag',
            'gabon',
        ],
    },
    {
        code: '🇬🇧',
        keywords: [
            'britain',
            'british',
            'cornwall',
            'england',
            'flag',
            'great britain',
            'ireland',
            'northern ireland',
            'scotland',
            'uk',
            'union jack',
            'united',
            'united kingdom',
            'wales',
        ],
    },
    {
        code: '🇬🇩',
        keywords: [
            'flag',
            'grenada',
        ],
    },
    {
        code: '🇬🇪',
        keywords: [
            'flag',
            'georgia',
        ],
    },
    {
        code: '🇬🇫',
        keywords: [
            'flag',
            'french',
            'guiana',
        ],
    },
    {
        code: '🇬🇬',
        keywords: [
            'flag',
            'guernsey',
        ],
    },
    {
        code: '🇬🇭',
        keywords: [
            'flag',
            'ghana',
        ],
    },
    {
        code: '🇬🇮',
        keywords: [
            'flag',
            'gibraltar',
        ],
    },
    {
        code: '🇬🇱',
        keywords: [
            'flag',
            'greenland',
        ],
    },
    {
        code: '🇬🇲',
        keywords: [
            'flag',
            'gambia',
        ],
    },
    {
        code: '🇬🇳',
        keywords: [
            'flag',
            'guinea',
        ],
    },
    {
        code: '🇬🇵',
        keywords: [
            'flag',
            'guadeloupe',
        ],
    },
    {
        code: '🇬🇶',
        keywords: [
            'equatorial guinea',
            'flag',
            'guinea',
        ],
    },
    {
        code: '🇬🇷',
        keywords: [
            'flag',
            'greece',
        ],
    },
    {
        code: '🇬🇸',
        keywords: [
            'flag',
            'georgia',
            'island',
            'south',
            'south georgia',
            'south sandwich',
        ],
    },
    {
        code: '🇬🇹',
        keywords: [
            'flag',
            'guatemala',
        ],
    },
    {
        code: '🇬🇺',
        keywords: [
            'flag',
            'guam',
        ],
    },
    {
        code: '🇬🇼',
        keywords: [
            'bissau',
            'flag',
            'guinea',
        ],
    },
    {
        code: '🇬🇾',
        keywords: [
            'flag',
            'guyana',
        ],
    },
    {
        code: '🇭🇰',
        keywords: [
            'china',
            'flag',
            'hong kong',
        ],
    },
    {
        code: '🇭🇲',
        keywords: [
            'flag',
            'heard',
            'island',
            'mcdonald',
        ],
    },
    {
        code: '🇭🇳',
        keywords: [
            'flag',
            'honduras',
        ],
    },
    {
        code: '🇭🇷',
        keywords: [
            'croatia',
            'flag',
        ],
    },
    {
        code: '🇭🇹',
        keywords: [
            'flag',
            'haiti',
        ],
    },
    {
        code: '🇭🇺',
        keywords: [
            'flag',
            'hungary',
        ],
    },
    {
        code: '🇮🇨',
        keywords: [
            'canary',
            'flag',
            'island',
        ],
    },
    {
        code: '🇮🇩',
        keywords: [
            'flag',
            'indonesia',
        ],
    },
    {
        code: '🇮🇪',
        keywords: [
            'flag',
            'ireland',
        ],
    },
    {
        code: '🇮🇱',
        keywords: [
            'flag',
            'israel',
        ],
    },
    {
        code: '🇮🇲',
        keywords: [
            'flag',
            'isle of man',
        ],
    },
    {
        code: '🇮🇳',
        keywords: [
            'flag',
            'india',
        ],
    },
    {
        code: '🇮🇴',
        keywords: [
            'british',
            'chagos',
            'flag',
            'indian ocean',
            'island',
        ],
    },
    {
        code: '🇮🇶',
        keywords: [
            'flag',
            'iraq',
        ],
    },
    {
        code: '🇮🇷',
        keywords: [
            'flag',
            'iran',
        ],
    },
    {
        code: '🇮🇸',
        keywords: [
            'flag',
            'iceland',
        ],
    },
    {
        code: '🇮🇹',
        keywords: [
            'flag',
            'italy',
        ],
    },
    {
        code: '🇯🇪',
        keywords: [
            'flag',
            'jersey',
        ],
    },
    {
        code: '🇯🇲',
        keywords: [
            'flag',
            'jamaica',
        ],
    },
    {
        code: '🇯🇴',
        keywords: [
            'flag',
            'jordan',
        ],
    },
    {
        code: '🇯🇵',
        keywords: [
            'flag',
            'japan',
        ],
    },
    {
        code: '🇰🇪',
        keywords: [
            'flag',
            'kenya',
        ],
    },
    {
        code: '🇰🇬',
        keywords: [
            'flag',
            'kyrgyzstan',
        ],
    },
    {
        code: '🇰🇭',
        keywords: [
            'cambodia',
            'flag',
        ],
    },
    {
        code: '🇰🇮',
        keywords: [
            'flag',
            'kiribati',
        ],
    },
    {
        code: '🇰🇲',
        keywords: [
            'comoros',
            'flag',
        ],
    },
    {
        code: '🇰🇳',
        keywords: [
            'flag',
            'kitts',
            'nevis',
            'saint',
        ],
    },
    {
        code: '🇰🇵',
        keywords: [
            'flag',
            'korea',
            'north',
            'north korea',
        ],
    },
    {
        code: '🇰🇷',
        keywords: [
            'flag',
            'korea',
            'south',
            'south korea',
        ],
    },
    {
        code: '🇰🇼',
        keywords: [
            'flag',
            'kuwait',
        ],
    },
    {
        code: '🇰🇾',
        keywords: [
            'cayman',
            'flag',
            'island',
        ],
    },
    {
        code: '🇰🇿',
        keywords: [
            'flag',
            'kazakhstan',
        ],
    },
    {
        code: '🇱🇦',
        keywords: [
            'flag',
            'laos',
        ],
    },
    {
        code: '🇱🇧',
        keywords: [
            'flag',
            'lebanon',
        ],
    },
    {
        code: '🇱🇨',
        keywords: [
            'flag',
            'lucia',
            'saint',
        ],
    },
    {
        code: '🇱🇮',
        keywords: [
            'flag',
            'liechtenstein',
        ],
    },
    {
        code: '🇱🇰',
        keywords: [
            'flag',
            'sri lanka',
        ],
    },
    {
        code: '🇱🇷',
        keywords: [
            'flag',
            'liberia',
        ],
    },
    {
        code: '🇱🇸',
        keywords: [
            'flag',
            'lesotho',
        ],
    },
    {
        code: '🇱🇹',
        keywords: [
            'flag',
            'lithuania',
        ],
    },
    {
        code: '🇱🇺',
        keywords: [
            'flag',
            'luxembourg',
        ],
    },
    {
        code: '🇱🇻',
        keywords: [
            'flag',
            'latvia',
        ],
    },
    {
        code: '🇱🇾',
        keywords: [
            'flag',
            'libya',
        ],
    },
    {
        code: '🇲🇦',
        keywords: [
            'flag',
            'morocco',
        ],
    },
    {
        code: '🇲🇨',
        keywords: [
            'flag',
            'monaco',
        ],
    },
    {
        code: '🇲🇩',
        keywords: [
            'flag',
            'moldova',
        ],
    },
    {
        code: '🇲🇪',
        keywords: [
            'flag',
            'montenegro',
        ],
    },
    {
        code: '🇲🇫',
        keywords: [
            'flag',
            'french',
            'martin',
            'saint',
        ],
    },
    {
        code: '🇲🇬',
        keywords: [
            'flag',
            'madagascar',
        ],
    },
    {
        code: '🇲🇭',
        keywords: [
            'flag',
            'island',
            'marshall',
        ],
    },
    {
        code: '🇲🇰',
        keywords: [
            'flag',
            'macedonia',
        ],
    },
    {
        code: '🇲🇱',
        keywords: [
            'flag',
            'mali',
        ],
    },
    {
        code: '🇲🇲',
        keywords: [
            'burma',
            'flag',
            'myanmar',
        ],
    },
    {
        code: '🇲🇳',
        keywords: [
            'flag',
            'mongolia',
        ],
    },
    {
        code: '🇲🇴',
        keywords: [
            'china',
            'flag',
            'macao',
            'macau',
        ],
    },
    {
        code: '🇲🇵',
        keywords: [
            'flag',
            'island',
            'mariana',
            'north',
            'northern mariana',
        ],
    },
    {
        code: '🇲🇶',
        keywords: [
            'flag',
            'martinique',
        ],
    },
    {
        code: '🇲🇷',
        keywords: [
            'flag',
            'mauritania',
        ],
    },
    {
        code: '🇲🇸',
        keywords: [
            'flag',
            'montserrat',
        ],
    },
    {
        code: '🇲🇹',
        keywords: [
            'flag',
            'malta',
        ],
    },
    {
        code: '🇲🇺',
        keywords: [
            'flag',
            'mauritius',
        ],
    },
    {
        code: '🇲🇻',
        keywords: [
            'flag',
            'maldives',
        ],
    },
    {
        code: '🇲🇼',
        keywords: [
            'flag',
            'malawi',
        ],
    },
    {
        code: '🇲🇽',
        keywords: [
            'flag',
            'mexico',
        ],
    },
    {
        code: '🇲🇾',
        keywords: [
            'flag',
            'malaysia',
        ],
    },
    {
        code: '🇲🇿',
        keywords: [
            'flag',
            'mozambique',
        ],
    },
    {
        code: '🇳🇦',
        keywords: [
            'flag',
            'namibia',
        ],
    },
    {
        code: '🇳🇨',
        keywords: [
            'flag',
            'new',
            'new caledonia',
        ],
    },
    {
        code: '🇳🇪',
        keywords: [
            'flag',
            'niger',
        ],
    },
    {
        code: '🇳🇫',
        keywords: [
            'flag',
            'island',
            'norfolk',
        ],
    },
    {
        code: '🇳🇬',
        keywords: [
            'flag',
            'nigeria',
        ],
    },
    {
        code: '🇳🇮',
        keywords: [
            'flag',
            'nicaragua',
        ],
    },
    {
        code: '🇳🇱',
        keywords: [
            'flag',
            'netherlands',
        ],
    },
    {
        code: '🇳🇴',
        keywords: [
            'flag',
            'norway',
        ],
    },
    {
        code: '🇳🇵',
        keywords: [
            'flag',
            'nepal',
        ],
    },
    {
        code: '🇳🇷',
        keywords: [
            'flag',
            'nauru',
        ],
    },
    {
        code: '🇳🇺',
        keywords: [
            'flag',
            'niue',
        ],
    },
    {
        code: '🇳🇿',
        keywords: [
            'flag',
            'new',
            'new zealand',
        ],
    },
    {
        code: '🇴🇲',
        keywords: [
            'flag',
            'oman',
        ],
    },
    {
        code: '🇵🇦',
        keywords: [
            'flag',
            'panama',
        ],
    },
    {
        code: '🇵🇪',
        keywords: [
            'flag',
            'peru',
        ],
    },
    {
        code: '🇵🇫',
        keywords: [
            'flag',
            'french',
            'polynesia',
        ],
    },
    {
        code: '🇵🇬',
        keywords: [
            'flag',
            'guinea',
            'new',
            'papua new guinea',
        ],
    },
    {
        code: '🇵🇭',
        keywords: [
            'flag',
            'philippines',
        ],
    },
    {
        code: '🇵🇰',
        keywords: [
            'flag',
            'pakistan',
        ],
    },
    {
        code: '🇵🇱',
        keywords: [
            'flag',
            'poland',
        ],
    },
    {
        code: '🇵🇲',
        keywords: [
            'flag',
            'miquelon',
            'pierre',
            'saint',
        ],
    },
    {
        code: '🇵🇳',
        keywords: [
            'flag',
            'island',
            'pitcairn',
        ],
    },
    {
        code: '🇵🇷',
        keywords: [
            'flag',
            'puerto rico',
        ],
    },
    {
        code: '🇵🇸',
        keywords: [
            'flag',
            'palestine',
        ],
    },
    {
        code: '🇵🇹',
        keywords: [
            'flag',
            'portugal',
        ],
    },
    {
        code: '🇵🇼',
        keywords: [
            'flag',
            'palau',
        ],
    },
    {
        code: '🇵🇾',
        keywords: [
            'flag',
            'paraguay',
        ],
    },
    {
        code: '🇶🇦',
        keywords: [
            'flag',
            'qatar',
        ],
    },
    {
        code: '🇷🇪',
        keywords: [
            'flag',
            'reunion',
            'réunion',
        ],
    },
    {
        code: '🇷🇴',
        keywords: [
            'flag',
            'romania',
        ],
    },
    {
        code: '🇷🇸',
        keywords: [
            'flag',
            'serbia',
        ],
    },
    {
        code: '🇷🇺',
        keywords: [
            'flag',
            'russia',
        ],
    },
    {
        code: '🇷🇼',
        keywords: [
            'flag',
            'rwanda',
        ],
    },
    {
        code: '🇸🇦',
        keywords: [
            'flag',
            'saudi arabia',
        ],
    },
    {
        code: '🇸🇧',
        keywords: [
            'flag',
            'island',
            'solomon',
        ],
    },
    {
        code: '🇸🇨',
        keywords: [
            'flag',
            'seychelles',
        ],
    },
    {
        code: '🇸🇩',
        keywords: [
            'flag',
            'sudan',
        ],
    },
    {
        code: '🇸🇪',
        keywords: [
            'flag',
            'sweden',
        ],
    },
    {
        code: '🇸🇬',
        keywords: [
            'flag',
            'singapore',
        ],
    },
    {
        code: '🇸🇭',
        keywords: [
            'flag',
            'helena',
            'saint',
        ],
    },
    {
        code: '🇸🇮',
        keywords: [
            'flag',
            'slovenia',
        ],
    },
    {
        code: '🇸🇯',
        keywords: [
            'flag',
            'jan mayen',
            'svalbard',
        ],
    },
    {
        code: '🇸🇰',
        keywords: [
            'flag',
            'slovakia',
        ],
    },
    {
        code: '🇸🇱',
        keywords: [
            'flag',
            'sierra leone',
        ],
    },
    {
        code: '🇸🇲',
        keywords: [
            'flag',
            'san marino',
        ],
    },
    {
        code: '🇸🇳',
        keywords: [
            'flag',
            'senegal',
        ],
    },
    {
        code: '🇸🇴',
        keywords: [
            'flag',
            'somalia',
        ],
    },
    {
        code: '🇸🇷',
        keywords: [
            'flag',
            'suriname',
        ],
    },
    {
        code: '🇸🇸',
        keywords: [
            'flag',
            'south',
            'south sudan',
            'sudan',
        ],
    },
    {
        code: '🇸🇹',
        keywords: [
            'flag',
            'principe',
            'príncipe',
            'sao tome',
            'são tomé',
        ],
    },
    {
        code: '🇸🇻',
        keywords: [
            'el salvador',
            'flag',
        ],
    },
    {
        code: '🇸🇽',
        keywords: [
            'flag',
            'maarten',
            'sint',
        ],
    },
    {
        code: '🇸🇾',
        keywords: [
            'flag',
            'syria',
        ],
    },
    {
        code: '🇸🇿',
        keywords: [
            'flag',
            'swaziland',
        ],
    },
    {
        code: '🇹🇦',
        keywords: [
            'flag',
            'tristan da cunha',
        ],
    },
    {
        code: '🇹🇨',
        keywords: [
            'caicos',
            'flag',
            'island',
            'turks',
        ],
    },
    {
        code: '🇹🇩',
        keywords: [
            'chad',
            'flag',
        ],
    },
    {
        code: '🇹🇫',
        keywords: [
            'antarctic',
            'flag',
            'french',
        ],
    },
    {
        code: '🇹🇬',
        keywords: [
            'flag',
            'togo',
        ],
    },
    {
        code: '🇹🇭',
        keywords: [
            'flag',
            'thailand',
        ],
    },
    {
        code: '🇹🇯',
        keywords: [
            'flag',
            'tajikistan',
        ],
    },
    {
        code: '🇹🇰',
        keywords: [
            'flag',
            'tokelau',
        ],
    },
    {
        code: '🇹🇱',
        keywords: [
            'east',
            'east timor',
            'flag',
            'timor-leste',
        ],
    },
    {
        code: '🇹🇲',
        keywords: [
            'flag',
            'turkmenistan',
        ],
    },
    {
        code: '🇹🇳',
        keywords: [
            'flag',
            'tunisia',
        ],
    },
    {
        code: '🇹🇴',
        keywords: [
            'flag',
            'tonga',
        ],
    },
    {
        code: '🇹🇷',
        keywords: [
            'flag',
            'turkey',
        ],
    },
    {
        code: '🇹🇹',
        keywords: [
            'flag',
            'tobago',
            'trinidad',
        ],
    },
    {
        code: '🇹🇻',
        keywords: [
            'flag',
            'tuvalu',
        ],
    },
    {
        code: '🇹🇼',
        keywords: [
            'china',
            'flag',
            'taiwan',
        ],
    },
    {
        code: '🇹🇿',
        keywords: [
            'flag',
            'tanzania',
        ],
    },
    {
        code: '🇺🇦',
        keywords: [
            'flag',
            'ukraine',
        ],
    },
    {
        code: '🇺🇬',
        keywords: [
            'flag',
            'uganda',
        ],
    },
    {
        code: '🇺🇲',
        keywords: [
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
        code: '🇺🇸',
        keywords: [
            'america',
            'flag',
            'stars and stripes',
            'united',
            'united states',
        ],
    },
    {
        code: '🇺🇾',
        keywords: [
            'flag',
            'uruguay',
        ],
    },
    {
        code: '🇺🇿',
        keywords: [
            'flag',
            'uzbekistan',
        ],
    },
    {
        code: '🇻🇦',
        keywords: [
            'flag',
            'vatican',
        ],
    },
    {
        code: '🇻🇨',
        keywords: [
            'flag',
            'grenadines',
            'saint',
            'vincent',
        ],
    },
    {
        code: '🇻🇪',
        keywords: [
            'flag',
            'venezuela',
        ],
    },
    {
        code: '🇻🇬',
        keywords: [
            'british',
            'flag',
            'island',
            'virgin',
        ],
    },
    {
        code: '🇻🇮',
        keywords: [
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
        code: '🇻🇳',
        keywords: [
            'flag',
            'viet nam',
            'vietnam',
        ],
    },
    {
        code: '🇻🇺',
        keywords: [
            'flag',
            'vanuatu',
        ],
    },
    {
        code: '🇼🇫',
        keywords: [
            'flag',
            'futuna',
            'wallis',
        ],
    },
    {
        code: '🇼🇸',
        keywords: [
            'flag',
            'samoa',
        ],
    },
    {
        code: '🇽🇰',
        keywords: [
            'flag',
            'kosovo',
        ],
    },
    {
        code: '🇾🇪',
        keywords: [
            'flag',
            'yemen',
        ],
    },
    {
        code: '🇾🇹',
        keywords: [
            'flag',
            'mayotte',
        ],
    },
    {
        code: '🇿🇦',
        keywords: [
            'flag',
            'south',
            'south africa',
        ],
    },
    {
        code: '🇿🇲',
        keywords: [
            'flag',
            'zambia',
        ],
    },
    {
        code: '🇿🇼',
        keywords: [
            'flag',
            'zimbabwe',
        ],
    },
];

export {skinTones};
export default emojis;
