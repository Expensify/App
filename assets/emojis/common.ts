import Smiley from '@assets/images/emoji.svg';
import Flags from '@assets/images/emojiCategoryIcons/flag.svg';
import FoodAndDrink from '@assets/images/emojiCategoryIcons/hamburger.svg';
import Objects from '@assets/images/emojiCategoryIcons/light-bulb.svg';
import Symbols from '@assets/images/emojiCategoryIcons/peace-sign.svg';
import TravelAndPlaces from '@assets/images/emojiCategoryIcons/plane.svg';
import AnimalsAndNature from '@assets/images/emojiCategoryIcons/plant.svg';
import Activities from '@assets/images/emojiCategoryIcons/soccer-ball.svg';
import FrequentlyUsed from '@assets/images/history.svg';
import type {HeaderEmoji, PickerEmojis} from './types';

const skinTones = [
    {
        code: '🖐',
        skinTone: -1,
    },
    {
        code: '🖐🏻',
        skinTone: 4,
    },
    {
        code: '🖐🏼',
        skinTone: 3,
    },
    {
        code: '🖐🏽',
        skinTone: 2,
    },
    {
        code: '🖐🏾',
        skinTone: 1,
    },
    {
        code: '🖐🏿',
        skinTone: 0,
    },
] as const;

const emojis: PickerEmojis = [
    {
        header: true,
        icon: Smiley,
        code: 'smileysAndEmotion',
    },
    {
        name: 'grinning',
        code: '😀',
    },
    {
        name: 'smiley',
        code: '😃',
    },
    {
        name: 'smile',
        code: '😄',
    },
    {
        name: 'grin',
        code: '😁',
    },
    {
        name: 'laughing',
        code: '😆',
    },
    {
        name: 'sweat_smile',
        code: '😅',
    },
    {
        name: 'rofl',
        code: '🤣',
    },
    {
        name: 'joy',
        code: '😂',
    },
    {
        name: 'slightly_smiling_face',
        code: '🙂',
    },
    {
        name: 'upside_down_face',
        code: '🙃',
    },
    {
        name: 'wink',
        code: '😉',
    },
    {
        name: 'blush',
        code: '😊',
    },
    {
        name: 'innocent',
        code: '😇',
    },
    {
        name: 'smiling_face_with_three_hearts',
        code: '🥰',
    },
    {
        name: 'heart_eyes',
        code: '😍',
    },
    {
        name: 'star_struck',
        code: '🤩',
    },
    {
        name: 'kissing_heart',
        code: '😘',
    },
    {
        name: 'kissing',
        code: '😗',
    },
    {
        name: 'relaxed',
        code: '☺️',
    },
    {
        name: 'kissing_closed_eyes',
        code: '😚',
    },
    {
        name: 'kissing_smiling_eyes',
        code: '😙',
    },
    {
        name: 'smiling_face_with_tear',
        code: '🥲',
    },
    {
        name: 'yum',
        code: '😋',
    },
    {
        name: 'stuck_out_tongue',
        code: '😛',
    },
    {
        name: 'stuck_out_tongue_winking_eye',
        code: '😜',
    },
    {
        name: 'zany_face',
        code: '🤪',
    },
    {
        name: 'stuck_out_tongue_closed_eyes',
        code: '😝',
    },
    {
        name: 'money_mouth_face',
        code: '🤑',
    },
    {
        name: 'hugs',
        code: '🤗',
    },
    {
        name: 'hand_over_mouth',
        code: '🤭',
    },
    {
        name: 'face_with_open_eyes_and_hand_over_mouth',
        code: '🫢',
    },
    {
        name: 'saluting_face',
        code: '🫡',
    },
    {
        name: 'shushing_face',
        code: '🤫',
    },
    {
        name: 'face_with_peeking_eye',
        code: '🫣',
    },
    {
        name: 'melting_face',
        code: '🫠',
    },
    {
        name: 'thinking',
        code: '🤔',
    },
    {
        name: 'zipper_mouth_face',
        code: '🤐',
    },
    {
        name: 'dotted_line_face',
        code: '🫥',
    },
    {
        name: 'raised_eyebrow',
        code: '🤨',
    },
    {
        name: 'neutral_face',
        code: '😐',
    },
    {
        name: 'face_with_diagonal_mouth',
        code: '🫤',
    },
    {
        name: 'expressionless',
        code: '😑',
    },
    {
        name: 'shaking_face',
        code: '🫨',
    },
    {
        name: 'no_mouth',
        code: '😶',
    },
    {
        name: 'face_in_clouds',
        code: '😶‍🌫️',
    },
    {
        name: 'smirk',
        code: '😏',
    },
    {
        name: 'unamused',
        code: '😒',
    },
    {
        name: 'roll_eyes',
        code: '🙄',
    },
    {
        name: 'grimacing',
        code: '😬',
    },
    {
        name: 'face_exhaling',
        code: '😮‍💨',
    },
    {
        name: 'lying_face',
        code: '🤥',
    },
    {
        name: 'relieved',
        code: '😌',
    },
    {
        name: 'pensive',
        code: '😔',
    },
    {
        name: 'sleepy',
        code: '😪',
    },
    {
        name: 'drooling_face',
        code: '🤤',
    },
    {
        name: 'sleeping',
        code: '😴',
    },
    {
        name: 'mask',
        code: '😷',
    },
    {
        name: 'face_with_thermometer',
        code: '🤒',
    },
    {
        name: 'face_with_head_bandage',
        code: '🤕',
    },
    {
        name: 'nauseated_face',
        code: '🤢',
    },
    {
        name: 'vomiting_face',
        code: '🤮',
    },
    {
        name: 'sneezing_face',
        code: '🤧',
    },
    {
        name: 'hot_face',
        code: '🥵',
    },
    {
        name: 'cold_face',
        code: '🥶',
    },
    {
        name: 'woozy_face',
        code: '🥴',
    },
    {
        name: 'dizzy_face',
        code: '😵',
    },
    {
        name: 'face_with_spiral_eyes',
        code: '😵‍💫',
    },
    {
        name: 'exploding_head',
        code: '🤯',
    },
    {
        name: 'cowboy_hat_face',
        code: '🤠',
    },
    {
        name: 'partying_face',
        code: '🥳',
    },
    {
        name: 'disguised_face',
        code: '🥸',
    },
    {
        name: 'sunglasses',
        code: '😎',
    },
    {
        name: 'nerd_face',
        code: '🤓',
    },
    {
        name: 'monocle_face',
        code: '🧐',
    },
    {
        name: 'confused',
        code: '😕',
    },
    {
        name: 'worried',
        code: '😟',
    },
    {
        name: 'slightly_frowning_face',
        code: '🙁',
    },
    {
        name: 'frowning_face',
        code: '☹️',
    },
    {
        name: 'open_mouth',
        code: '😮',
    },
    {
        name: 'hushed',
        code: '😯',
    },
    {
        name: 'astonished',
        code: '😲',
    },
    {
        name: 'flushed',
        code: '😳',
    },
    {
        name: 'pleading_face',
        code: '🥺',
    },
    {
        name: 'frowning',
        code: '😦',
    },
    {
        name: 'anguished',
        code: '😧',
    },
    {
        name: 'fearful',
        code: '😨',
    },
    {
        name: 'cold_sweat',
        code: '😰',
    },
    {
        name: 'face_holding_back_tears',
        code: '🥹',
    },
    {
        name: 'disappointed_relieved',
        code: '😥',
    },
    {
        name: 'cry',
        code: '😢',
    },
    {
        name: 'sob',
        code: '😭',
    },
    {
        name: 'scream',
        code: '😱',
    },
    {
        name: 'confounded',
        code: '😖',
    },
    {
        name: 'persevere',
        code: '😣',
    },
    {
        name: 'disappointed',
        code: '😞',
    },
    {
        name: 'sweat',
        code: '😓',
    },
    {
        name: 'weary',
        code: '😩',
    },
    {
        name: 'tired_face',
        code: '😫',
    },
    {
        name: 'yawning_face',
        code: '🥱',
    },
    {
        name: 'triumph',
        code: '😤',
    },
    {
        name: 'rage',
        code: '😡',
    },
    {
        name: 'angry',
        code: '😠',
    },
    {
        name: 'cursing_face',
        code: '🤬',
    },
    {
        name: 'smiling_imp',
        code: '😈',
    },
    {
        name: 'imp',
        code: '👿',
    },
    {
        name: 'skull',
        code: '💀',
    },
    {
        name: 'skull_and_crossbones',
        code: '☠️',
    },
    {
        name: 'hankey',
        code: '💩',
    },
    {
        name: 'clown_face',
        code: '🤡',
    },
    {
        name: 'japanese_ogre',
        code: '👹',
    },
    {
        name: 'japanese_goblin',
        code: '👺',
    },
    {
        name: 'ghost',
        code: '👻',
    },
    {
        name: 'alien',
        code: '👽',
    },
    {
        name: 'space_invader',
        code: '👾',
    },
    {
        name: 'robot',
        code: '🤖',
    },
    {
        name: 'smiley_cat',
        code: '😺',
    },
    {
        name: 'smile_cat',
        code: '😸',
    },
    {
        name: 'joy_cat',
        code: '😹',
    },
    {
        name: 'heart_eyes_cat',
        code: '😻',
    },
    {
        name: 'smirk_cat',
        code: '😼',
    },
    {
        name: 'kissing_cat',
        code: '😽',
    },
    {
        name: 'scream_cat',
        code: '🙀',
    },
    {
        name: 'crying_cat_face',
        code: '😿',
    },
    {
        name: 'pouting_cat',
        code: '😾',
    },
    {
        name: 'see_no_evil',
        code: '🙈',
    },
    {
        name: 'hear_no_evil',
        code: '🙉',
    },
    {
        name: 'speak_no_evil',
        code: '🙊',
    },
    {
        name: 'kiss',
        code: '💋',
    },
    {
        name: 'love_letter',
        code: '💌',
    },
    {
        name: 'cupid',
        code: '💘',
    },
    {
        name: 'gift_heart',
        code: '💝',
    },
    {
        name: 'sparkling_heart',
        code: '💖',
    },
    {
        name: 'heartpulse',
        code: '💗',
    },
    {
        name: 'heartbeat',
        code: '💓',
    },
    {
        name: 'revolving_hearts',
        code: '💞',
    },
    {
        name: 'two_hearts',
        code: '💕',
    },
    {
        name: 'heart_decoration',
        code: '💟',
    },
    {
        name: 'heavy_heart_exclamation',
        code: '❣️',
    },
    {
        name: 'broken_heart',
        code: '💔',
    },
    {
        name: 'heart_on_fire',
        code: '❤️‍🔥',
    },
    {
        name: 'mending_heart',
        code: '❤️‍🩹',
    },
    {
        name: 'heart',
        code: '❤️',
    },
    {
        name: 'pink_heart',
        code: '🩷',
    },
    {
        name: 'light_blue_heart',
        code: '🩵',
    },
    {
        name: 'grey_heart',
        code: '🩶',
    },
    {
        name: 'orange_heart',
        code: '🧡',
    },
    {
        name: 'yellow_heart',
        code: '💛',
    },
    {
        name: 'green_heart',
        code: '💚',
    },
    {
        name: 'blue_heart',
        code: '💙',
    },
    {
        name: 'purple_heart',
        code: '💜',
    },
    {
        name: 'brown_heart',
        code: '🤎',
    },
    {
        name: 'black_heart',
        code: '🖤',
    },
    {
        name: 'white_heart',
        code: '🤍',
    },
    {
        name: '100',
        code: '💯',
    },
    {
        name: 'anger',
        code: '💢',
    },
    {
        name: 'boom',
        code: '💥',
    },
    {
        name: 'dizzy',
        code: '💫',
    },
    {
        name: 'sweat_drops',
        code: '💦',
    },
    {
        name: 'bubbles',
        code: '🫧',
    },
    {
        name: 'dash',
        code: '💨',
    },
    {
        name: 'hole',
        code: '🕳️',
    },
    {
        name: 'bomb',
        code: '💣',
    },
    {
        name: 'speech_balloon',
        code: '💬',
    },
    {
        name: 'eye_speech_bubble',
        code: '👁️‍🗨️',
    },
    {
        name: 'left_speech_bubble',
        code: '🗨️',
    },
    {
        name: 'right_anger_bubble',
        code: '🗯️',
    },
    {
        name: 'thought_balloon',
        code: '💭',
    },
    {
        name: 'zzz',
        code: '💤',
    },
    {
        name: 'wave',
        code: '👋',
        types: ['👋🏿', '👋🏾', '👋🏽', '👋🏼', '👋🏻'],
    },
    {
        name: 'raised_back_of_hand',
        code: '🤚',
        types: ['🤚🏿', '🤚🏾', '🤚🏽', '🤚🏼', '🤚🏻'],
    },
    {
        name: 'raised_hand_with_fingers_splayed',
        code: '🖐️',
        types: ['🖐🏿', '🖐🏾', '🖐🏽', '🖐🏼', '🖐🏻'],
    },
    {
        name: 'hand',
        code: '✋',
        types: ['✋🏿', '✋🏾', '✋🏽', '✋🏼', '✋🏻'],
    },
    {
        name: 'vulcan_salute',
        code: '🖖',
        types: ['🖖🏿', '🖖🏾', '🖖🏽', '🖖🏼', '🖖🏻'],
    },
    {
        name: 'ok_hand',
        code: '👌',
        types: ['👌🏿', '👌🏾', '👌🏽', '👌🏼', '👌🏻'],
    },
    {
        name: 'pinched_fingers',
        code: '🤌',
        types: ['🤌🏿', '🤌🏾', '🤌🏽', '🤌🏼', '🤌🏻'],
    },
    {
        name: 'pinching_hand',
        code: '🤏',
        types: ['🤏🏿', '🤏🏾', '🤏🏽', '🤏🏼', '🤏🏻'],
    },
    {
        name: 'palm_down_hand',
        code: '🫳',
        types: ['🫳🏿', '🫳🏾', '🫳🏽', '🫳🏼', '🫳🏻'],
    },
    {
        name: 'palm_up_hand',
        code: '🫴',
        types: ['🫴🏿', '🫴🏾', '🫴🏽', '🫴🏼', '🫴🏻'],
    },
    {
        name: 'v',
        code: '✌️',
        types: ['✌🏿', '✌🏾', '✌🏽', '✌🏼', '✌🏻'],
    },
    {
        name: 'crossed_fingers',
        code: '🤞',
        types: ['🤞🏿', '🤞🏾', '🤞🏽', '🤞🏼', '🤞🏻'],
    },
    {
        name: 'love_you_gesture',
        code: '🤟',
        types: ['🤟🏿', '🤟🏾', '🤟🏽', '🤟🏼', '🤟🏻'],
    },
    {
        name: 'metal',
        code: '🤘',
        types: ['🤘🏿', '🤘🏾', '🤘🏽', '🤘🏼', '🤘🏻'],
    },
    {
        name: 'call_me_hand',
        code: '🤙',
        types: ['🤙🏿', '🤙🏾', '🤙🏽', '🤙🏼', '🤙🏻'],
    },
    {
        name: 'rightwards_hand',
        code: '🫱',
        types: ['🫱🏿', '🫱🏾', '🫱🏽', '🫱🏼', '🫱🏻'],
    },
    {
        name: 'leftwards_hand',
        code: '🫲',
        types: ['🫲🏿', '🫲🏾', '🫲🏽', '🫲🏼', '🫲🏻'],
    },
    {
        name: 'point_left',
        code: '👈',
        types: ['👈🏿', '👈🏾', '👈🏽', '👈🏼', '👈🏻'],
    },
    {
        name: 'point_right',
        code: '👉',
        types: ['👉🏿', '👉🏾', '👉🏽', '👉🏼', '👉🏻'],
    },
    {
        name: 'point_up_2',
        code: '👆',
        types: ['👆🏿', '👆🏾', '👆🏽', '👆🏼', '👆🏻'],
    },
    {
        name: 'middle_finger',
        code: '🖕',
        types: ['🖕🏿', '🖕🏾', '🖕🏽', '🖕🏼', '🖕🏻'],
    },
    {
        name: 'point_down',
        code: '👇',
        types: ['👇🏿', '👇🏾', '👇🏽', '👇🏼', '👇🏻'],
    },
    {
        name: 'point_up',
        code: '☝️',
        types: ['☝🏿', '☝🏾', '☝🏽', '☝🏼', '☝🏻'],
    },
    {
        name: '+1',
        code: '👍',
        types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
    },
    {
        name: '-1',
        code: '👎',
        types: ['👎🏿', '👎🏾', '👎🏽', '👎🏼', '👎🏻'],
    },
    {
        name: 'hand_with_index_finger_and_thumb_crossed',
        code: '🫰',
        types: ['🫰🏿', '🫰🏾', '🫰🏽', '🫰🏼', '🫰🏻'],
    },
    {
        name: 'fist_raised',
        code: '✊',
        types: ['✊🏿', '✊🏾', '✊🏽', '✊🏼', '✊🏻'],
    },
    {
        name: 'fist_oncoming',
        code: '👊',
        types: ['👊🏿', '👊🏾', '👊🏽', '👊🏼', '👊🏻'],
    },
    {
        name: 'fist_left',
        code: '🤛',
        types: ['🤛🏿', '🤛🏾', '🤛🏽', '🤛🏼', '🤛🏻'],
    },
    {
        name: 'fist_right',
        code: '🤜',
        types: ['🤜🏿', '🤜🏾', '🤜🏽', '🤜🏼', '🤜🏻'],
    },
    {
        name: 'leftwards_pushing_hand',
        code: '🫷',
        types: ['🫷🏿', '🫷🏾', '🫷🏽', '🫷🏼', '🫷🏻'],
    },
    {
        name: 'rightwards_pushing_hand',
        code: '🫸',
        types: ['🫸🏿', '🫸🏾', '🫸🏽', '🫸🏼', '🫸🏻'],
    },
    {
        name: 'clap',
        code: '👏',
        types: ['👏🏿', '👏🏾', '👏🏽', '👏🏼', '👏🏻'],
    },
    {
        name: 'raised_hands',
        code: '🙌',
        types: ['🙌🏿', '🙌🏾', '🙌🏽', '🙌🏼', '🙌🏻'],
    },
    {
        name: 'heart_hands',
        code: '🫶',
        types: ['🫶🏿', '🫶🏾', '🫶🏽', '🫶🏼', '🫶🏻'],
    },
    {
        name: 'open_hands',
        code: '👐',
        types: ['👐🏿', '👐🏾', '👐🏽', '👐🏼', '👐🏻'],
    },
    {
        name: 'palms_up_together',
        code: '🤲',
        types: ['🤲🏿', '🤲🏾', '🤲🏽', '🤲🏼', '🤲🏻'],
    },
    {
        name: 'handshake',
        code: '🤝',
        types: ['🤝🏿', '🤝🏾', '🤝🏽', '🤝🏼', '🤝🏻'],
    },
    {
        name: 'pray',
        code: '🙏',
        types: ['🙏🏿', '🙏🏾', '🙏🏽', '🙏🏼', '🙏🏻'],
    },
    {
        name: 'index_pointing_at_the_viewer',
        code: '🫵',
        types: ['🫵🏿', '🫵🏾', '🫵🏽', '🫵🏼', '🫵🏻'],
    },
    {
        name: 'writing_hand',
        code: '✍️',
        types: ['✍🏿', '✍🏾', '✍🏽', '✍🏼', '✍🏻'],
    },
    {
        name: 'nail_care',
        code: '💅',
        types: ['💅🏿', '💅🏾', '💅🏽', '💅🏼', '💅🏻'],
    },
    {
        name: 'selfie',
        code: '🤳',
        types: ['🤳🏿', '🤳🏾', '🤳🏽', '🤳🏼', '🤳🏻'],
    },
    {
        name: 'muscle',
        code: '💪',
        types: ['💪🏿', '💪🏾', '💪🏽', '💪🏼', '💪🏻'],
    },
    {
        name: 'mechanical_arm',
        code: '🦾',
    },
    {
        name: 'mechanical_leg',
        code: '🦿',
    },
    {
        name: 'leg',
        code: '🦵',
        types: ['🦵🏿', '🦵🏾', '🦵🏽', '🦵🏼', '🦵🏻'],
    },
    {
        name: 'foot',
        code: '🦶',
        types: ['🦶🏿', '🦶🏾', '🦶🏽', '🦶🏼', '🦶🏻'],
    },
    {
        name: 'ear',
        code: '👂',
        types: ['👂🏿', '👂🏾', '👂🏽', '👂🏼', '👂🏻'],
    },
    {
        name: 'ear_with_hearing_aid',
        code: '🦻',
        types: ['🦻🏿', '🦻🏾', '🦻🏽', '🦻🏼', '🦻🏻'],
    },
    {
        name: 'nose',
        code: '👃',
        types: ['👃🏿', '👃🏾', '👃🏽', '👃🏼', '👃🏻'],
    },
    {
        name: 'brain',
        code: '🧠',
    },
    {
        name: 'anatomical_heart',
        code: '🫀',
    },
    {
        name: 'lungs',
        code: '🫁',
    },
    {
        name: 'tooth',
        code: '🦷',
    },
    {
        name: 'bone',
        code: '🦴',
    },
    {
        name: 'eyes',
        code: '👀',
    },
    {
        name: 'eye',
        code: '👁️',
    },
    {
        name: 'tongue',
        code: '👅',
    },
    {
        name: 'lips',
        code: '👄',
    },
    {
        name: 'biting_lip',
        code: '🫦',
    },
    {
        name: 'baby',
        code: '👶',
        types: ['👶🏿', '👶🏾', '👶🏽', '👶🏼', '👶🏻'],
    },
    {
        name: 'child',
        code: '🧒',
        types: ['🧒🏿', '🧒🏾', '🧒🏽', '🧒🏼', '🧒🏻'],
    },
    {
        name: 'boy',
        code: '👦',
        types: ['👦🏿', '👦🏾', '👦🏽', '👦🏼', '👦🏻'],
    },
    {
        name: 'girl',
        code: '👧',
        types: ['👧🏿', '👧🏾', '👧🏽', '👧🏼', '👧🏻'],
    },
    {
        name: 'adult',
        code: '🧑',
        types: ['🧑🏿', '🧑🏾', '🧑🏽', '🧑🏼', '🧑🏻'],
    },
    {
        name: 'blond_haired_person',
        code: '👱',
        types: ['👱🏿', '👱🏾', '👱🏽', '👱🏼', '👱🏻'],
    },
    {
        name: 'man',
        code: '👨',
        types: ['👨🏿', '👨🏾', '👨🏽', '👨🏼', '👨🏻'],
    },
    {
        name: 'bearded_person',
        code: '🧔',
        types: ['🧔🏿', '🧔🏾', '🧔🏽', '🧔🏼', '🧔🏻'],
    },
    {
        name: 'man_beard',
        code: '🧔‍♂️',
        types: ['🧔🏿‍♂️', '🧔🏾‍♂️', '🧔🏽‍♂️', '🧔🏼‍♂️', '🧔🏻‍♂️'],
    },
    {
        name: 'woman_beard',
        code: '🧔‍♀️',
        types: ['🧔🏿‍♀️', '🧔🏾‍♀️', '🧔🏽‍♀️', '🧔🏼‍♀️', '🧔🏻‍♀️'],
    },
    {
        name: 'red_haired_man',
        code: '👨‍🦰',
        types: ['👨🏿‍🦰', '👨🏾‍🦰', '👨🏽‍🦰', '👨🏼‍🦰', '👨🏻‍🦰'],
    },
    {
        name: 'curly_haired_man',
        code: '👨‍🦱',
        types: ['👨🏿‍🦱', '👨🏾‍🦱', '👨🏽‍🦱', '👨🏼‍🦱', '👨🏻‍🦱'],
    },
    {
        name: 'white_haired_man',
        code: '👨‍🦳',
        types: ['👨🏿‍🦳', '👨🏾‍🦳', '👨🏽‍🦳', '👨🏼‍🦳', '👨🏻‍🦳'],
    },
    {
        name: 'bald_man',
        code: '👨‍🦲',
        types: ['👨🏿‍🦲', '👨🏾‍🦲', '👨🏽‍🦲', '👨🏼‍🦲', '👨🏻‍🦲'],
    },
    {
        name: 'woman',
        code: '👩',
        types: ['👩🏿', '👩🏾', '👩🏽', '👩🏼', '👩🏻'],
    },
    {
        name: 'red_haired_woman',
        code: '👩‍🦰',
        types: ['👩🏿‍🦰', '👩🏾‍🦰', '👩🏽‍🦰', '👩🏼‍🦰', '👩🏻‍🦰'],
    },
    {
        name: 'person_red_hair',
        code: '🧑‍🦰',
        types: ['🧑🏿‍🦰', '🧑🏾‍🦰', '🧑🏽‍🦰', '🧑🏼‍🦰', '🧑🏻‍🦰'],
    },
    {
        name: 'curly_haired_woman',
        code: '👩‍🦱',
        types: ['👩🏿‍🦱', '👩🏾‍🦱', '👩🏽‍🦱', '👩🏼‍🦱', '👩🏻‍🦱'],
    },
    {
        name: 'person_curly_hair',
        code: '🧑‍🦱',
        types: ['🧑🏿‍🦱', '🧑🏾‍🦱', '🧑🏽‍🦱', '🧑🏼‍🦱', '🧑🏻‍🦱'],
    },
    {
        name: 'white_haired_woman',
        code: '👩‍🦳',
        types: ['👩🏿‍🦳', '👩🏾‍🦳', '👩🏽‍🦳', '👩🏼‍🦳', '👩🏻‍🦳'],
    },
    {
        name: 'person_white_hair',
        code: '🧑‍🦳',
        types: ['🧑🏿‍🦳', '🧑🏾‍🦳', '🧑🏽‍🦳', '🧑🏼‍🦳', '🧑🏻‍🦳'],
    },
    {
        name: 'bald_woman',
        code: '👩‍🦲',
        types: ['👩🏿‍🦲', '👩🏾‍🦲', '👩🏽‍🦲', '👩🏼‍🦲', '👩🏻‍🦲'],
    },
    {
        name: 'person_bald',
        code: '🧑‍🦲',
        types: ['🧑🏿‍🦲', '🧑🏾‍🦲', '🧑🏽‍🦲', '🧑🏼‍🦲', '🧑🏻‍🦲'],
    },
    {
        name: 'blond_haired_woman',
        code: '👱‍♀️',
        types: ['👱🏿‍♀️', '👱🏾‍♀️', '👱🏽‍♀️', '👱🏼‍♀️', '👱🏻‍♀️'],
    },
    {
        name: 'blond_haired_man',
        code: '👱‍♂️',
        types: ['👱🏿‍♂️', '👱🏾‍♂️', '👱🏽‍♂️', '👱🏼‍♂️', '👱🏻‍♂️'],
    },
    {
        name: 'older_adult',
        code: '🧓',
        types: ['🧓🏿', '🧓🏾', '🧓🏽', '🧓🏼', '🧓🏻'],
    },
    {
        name: 'older_man',
        code: '👴',
        types: ['👴🏿', '👴🏾', '👴🏽', '👴🏼', '👴🏻'],
    },
    {
        name: 'older_woman',
        code: '👵',
        types: ['👵🏿', '👵🏾', '👵🏽', '👵🏼', '👵🏻'],
    },
    {
        name: 'frowning_person',
        code: '🙍',
        types: ['🙍🏿', '🙍🏾', '🙍🏽', '🙍🏼', '🙍🏻'],
    },
    {
        name: 'frowning_man',
        code: '🙍‍♂️',
        types: ['🙍🏿‍♂️', '🙍🏾‍♂️', '🙍🏽‍♂️', '🙍🏼‍♂️', '🙍🏻‍♂️'],
    },
    {
        name: 'frowning_woman',
        code: '🙍‍♀️',
        types: ['🙍🏿‍♀️', '🙍🏾‍♀️', '🙍🏽‍♀️', '🙍🏼‍♀️', '🙍🏻‍♀️'],
    },
    {
        name: 'pouting_face',
        code: '🙎',
        types: ['🙎🏿', '🙎🏾', '🙎🏽', '🙎🏼', '🙎🏻'],
    },
    {
        name: 'pouting_man',
        code: '🙎‍♂️',
        types: ['🙎🏿‍♂️', '🙎🏾‍♂️', '🙎🏽‍♂️', '🙎🏼‍♂️', '🙎🏻‍♂️'],
    },
    {
        name: 'pouting_woman',
        code: '🙎‍♀️',
        types: ['🙎🏿‍♀️', '🙎🏾‍♀️', '🙎🏽‍♀️', '🙎🏼‍♀️', '🙎🏻‍♀️'],
    },
    {
        name: 'no_good',
        code: '🙅',
        types: ['🙅🏿', '🙅🏾', '🙅🏽', '🙅🏼', '🙅🏻'],
    },
    {
        name: 'no_good_man',
        code: '🙅‍♂️',
        types: ['🙅🏿‍♂️', '🙅🏾‍♂️', '🙅🏽‍♂️', '🙅🏼‍♂️', '🙅🏻‍♂️'],
    },
    {
        name: 'no_good_woman',
        code: '🙅‍♀️',
        types: ['🙅🏿‍♀️', '🙅🏾‍♀️', '🙅🏽‍♀️', '🙅🏼‍♀️', '🙅🏻‍♀️'],
    },
    {
        name: 'ok_person',
        code: '🙆',
        types: ['🙆🏿', '🙆🏾', '🙆🏽', '🙆🏼', '🙆🏻'],
    },
    {
        name: 'ok_man',
        code: '🙆‍♂️',
        types: ['🙆🏿‍♂️', '🙆🏾‍♂️', '🙆🏽‍♂️', '🙆🏼‍♂️', '🙆🏻‍♂️'],
    },
    {
        name: 'ok_woman',
        code: '🙆‍♀️',
        types: ['🙆🏿‍♀️', '🙆🏾‍♀️', '🙆🏽‍♀️', '🙆🏼‍♀️', '🙆🏻‍♀️'],
    },
    {
        name: 'tipping_hand_person',
        code: '💁',
        types: ['💁🏿', '💁🏾', '💁🏽', '💁🏼', '💁🏻'],
    },
    {
        name: 'tipping_hand_man',
        code: '💁‍♂️',
        types: ['💁🏿‍♂️', '💁🏾‍♂️', '💁🏽‍♂️', '💁🏼‍♂️', '💁🏻‍♂️'],
    },
    {
        name: 'tipping_hand_woman',
        code: '💁‍♀️',
        types: ['💁🏿‍♀️', '💁🏾‍♀️', '💁🏽‍♀️', '💁🏼‍♀️', '💁🏻‍♀️'],
    },
    {
        name: 'raising_hand',
        code: '🙋',
        types: ['🙋🏿', '🙋🏾', '🙋🏽', '🙋🏼', '🙋🏻'],
    },
    {
        name: 'raising_hand_man',
        code: '🙋‍♂️',
        types: ['🙋🏿‍♂️', '🙋🏾‍♂️', '🙋🏽‍♂️', '🙋🏼‍♂️', '🙋🏻‍♂️'],
    },
    {
        name: 'raising_hand_woman',
        code: '🙋‍♀️',
        types: ['🙋🏿‍♀️', '🙋🏾‍♀️', '🙋🏽‍♀️', '🙋🏼‍♀️', '🙋🏻‍♀️'],
    },
    {
        name: 'deaf_person',
        code: '🧏',
        types: ['🧏🏿', '🧏🏾', '🧏🏽', '🧏🏼', '🧏🏻'],
    },
    {
        name: 'deaf_man',
        code: '🧏‍♂️',
        types: ['🧏🏿‍♂️', '🧏🏾‍♂️', '🧏🏽‍♂️', '🧏🏼‍♂️', '🧏🏻‍♂️'],
    },
    {
        name: 'deaf_woman',
        code: '🧏‍♀️',
        types: ['🧏🏿‍♀️', '🧏🏾‍♀️', '🧏🏽‍♀️', '🧏🏼‍♀️', '🧏🏻‍♀️'],
    },
    {
        name: 'bow',
        code: '🙇',
        types: ['🙇🏿', '🙇🏾', '🙇🏽', '🙇🏼', '🙇🏻'],
    },
    {
        name: 'bowing_man',
        code: '🙇‍♂️',
        types: ['🙇🏿‍♂️', '🙇🏾‍♂️', '🙇🏽‍♂️', '🙇🏼‍♂️', '🙇🏻‍♂️'],
    },
    {
        name: 'bowing_woman',
        code: '🙇‍♀️',
        types: ['🙇🏿‍♀️', '🙇🏾‍♀️', '🙇🏽‍♀️', '🙇🏼‍♀️', '🙇🏻‍♀️'],
    },
    {
        name: 'facepalm',
        code: '🤦',
        types: ['🤦🏿', '🤦🏾', '🤦🏽', '🤦🏼', '🤦🏻'],
    },
    {
        name: 'man_facepalming',
        code: '🤦‍♂️',
        types: ['🤦🏿‍♂️', '🤦🏾‍♂️', '🤦🏽‍♂️', '🤦🏼‍♂️', '🤦🏻‍♂️'],
    },
    {
        name: 'woman_facepalming',
        code: '🤦‍♀️',
        types: ['🤦🏿‍♀️', '🤦🏾‍♀️', '🤦🏽‍♀️', '🤦🏼‍♀️', '🤦🏻‍♀️'],
    },
    {
        name: 'shrug',
        code: '🤷',
        types: ['🤷🏿', '🤷🏾', '🤷🏽', '🤷🏼', '🤷🏻'],
    },
    {
        name: 'man_shrugging',
        code: '🤷‍♂️',
        types: ['🤷🏿‍♂️', '🤷🏾‍♂️', '🤷🏽‍♂️', '🤷🏼‍♂️', '🤷🏻‍♂️'],
    },
    {
        name: 'woman_shrugging',
        code: '🤷‍♀️',
        types: ['🤷🏿‍♀️', '🤷🏾‍♀️', '🤷🏽‍♀️', '🤷🏼‍♀️', '🤷🏻‍♀️'],
    },
    {
        name: 'health_worker',
        code: '🧑‍⚕️',
        types: ['🧑🏿‍⚕️', '🧑🏾‍⚕️', '🧑🏽‍⚕️', '🧑🏼‍⚕️', '🧑🏻‍⚕️'],
    },
    {
        name: 'man_health_worker',
        code: '👨‍⚕️',
        types: ['👨🏿‍⚕️', '👨🏾‍⚕️', '👨🏽‍⚕️', '👨🏼‍⚕️', '👨🏻‍⚕️'],
    },
    {
        name: 'woman_health_worker',
        code: '👩‍⚕️',
        types: ['👩🏿‍⚕️', '👩🏾‍⚕️', '👩🏽‍⚕️', '👩🏼‍⚕️', '👩🏻‍⚕️'],
    },
    {
        name: 'student',
        code: '🧑‍🎓',
        types: ['🧑🏿‍🎓', '🧑🏾‍🎓', '🧑🏽‍🎓', '🧑🏼‍🎓', '🧑🏻‍🎓'],
    },
    {
        name: 'man_student',
        code: '👨‍🎓',
        types: ['👨🏿‍🎓', '👨🏾‍🎓', '👨🏽‍🎓', '👨🏼‍🎓', '👨🏻‍🎓'],
    },
    {
        name: 'woman_student',
        code: '👩‍🎓',
        types: ['👩🏿‍🎓', '👩🏾‍🎓', '👩🏽‍🎓', '👩🏼‍🎓', '👩🏻‍🎓'],
    },
    {
        name: 'teacher',
        code: '🧑‍🏫',
        types: ['🧑🏿‍🏫', '🧑🏾‍🏫', '🧑🏽‍🏫', '🧑🏼‍🏫', '🧑🏻‍🏫'],
    },
    {
        name: 'man_teacher',
        code: '👨‍🏫',
        types: ['👨🏿‍🏫', '👨🏾‍🏫', '👨🏽‍🏫', '👨🏼‍🏫', '👨🏻‍🏫'],
    },
    {
        name: 'woman_teacher',
        code: '👩‍🏫',
        types: ['👩🏿‍🏫', '👩🏾‍🏫', '👩🏽‍🏫', '👩🏼‍🏫', '👩🏻‍🏫'],
    },
    {
        name: 'judge',
        code: '🧑‍⚖️',
        types: ['🧑🏿‍⚖️', '🧑🏾‍⚖️', '🧑🏽‍⚖️', '🧑🏼‍⚖️', '🧑🏻‍⚖️'],
    },
    {
        name: 'man_judge',
        code: '👨‍⚖️',
        types: ['👨🏿‍⚖️', '👨🏾‍⚖️', '👨🏽‍⚖️', '👨🏼‍⚖️', '👨🏻‍⚖️'],
    },
    {
        name: 'woman_judge',
        code: '👩‍⚖️',
        types: ['👩🏿‍⚖️', '👩🏾‍⚖️', '👩🏽‍⚖️', '👩🏼‍⚖️', '👩🏻‍⚖️'],
    },
    {
        name: 'farmer',
        code: '🧑‍🌾',
        types: ['🧑🏿‍🌾', '🧑🏾‍🌾', '🧑🏽‍🌾', '🧑🏼‍🌾', '🧑🏻‍🌾'],
    },
    {
        name: 'man_farmer',
        code: '👨‍🌾',
        types: ['👨🏿‍🌾', '👨🏾‍🌾', '👨🏽‍🌾', '👨🏼‍🌾', '👨🏻‍🌾'],
    },
    {
        name: 'woman_farmer',
        code: '👩‍🌾',
        types: ['👩🏿‍🌾', '👩🏾‍🌾', '👩🏽‍🌾', '👩🏼‍🌾', '👩🏻‍🌾'],
    },
    {
        name: 'cook',
        code: '🧑‍🍳',
        types: ['🧑🏿‍🍳', '🧑🏾‍🍳', '🧑🏽‍🍳', '🧑🏼‍🍳', '🧑🏻‍🍳'],
    },
    {
        name: 'man_cook',
        code: '👨‍🍳',
        types: ['👨🏿‍🍳', '👨🏾‍🍳', '👨🏽‍🍳', '👨🏼‍🍳', '👨🏻‍🍳'],
    },
    {
        name: 'woman_cook',
        code: '👩‍🍳',
        types: ['👩🏿‍🍳', '👩🏾‍🍳', '👩🏽‍🍳', '👩🏼‍🍳', '👩🏻‍🍳'],
    },
    {
        name: 'mechanic',
        code: '🧑‍🔧',
        types: ['🧑🏿‍🔧', '🧑🏾‍🔧', '🧑🏽‍🔧', '🧑🏼‍🔧', '🧑🏻‍🔧'],
    },
    {
        name: 'man_mechanic',
        code: '👨‍🔧',
        types: ['👨🏿‍🔧', '👨🏾‍🔧', '👨🏽‍🔧', '👨🏼‍🔧', '👨🏻‍🔧'],
    },
    {
        name: 'woman_mechanic',
        code: '👩‍🔧',
        types: ['👩🏿‍🔧', '👩🏾‍🔧', '👩🏽‍🔧', '👩🏼‍🔧', '👩🏻‍🔧'],
    },
    {
        name: 'factory_worker',
        code: '🧑‍🏭',
        types: ['🧑🏿‍🏭', '🧑🏾‍🏭', '🧑🏽‍🏭', '🧑🏼‍🏭', '🧑🏻‍🏭'],
    },
    {
        name: 'man_factory_worker',
        code: '👨‍🏭',
        types: ['👨🏿‍🏭', '👨🏾‍🏭', '👨🏽‍🏭', '👨🏼‍🏭', '👨🏻‍🏭'],
    },
    {
        name: 'woman_factory_worker',
        code: '👩‍🏭',
        types: ['👩🏿‍🏭', '👩🏾‍🏭', '👩🏽‍🏭', '👩🏼‍🏭', '👩🏻‍🏭'],
    },
    {
        name: 'office_worker',
        code: '🧑‍💼',
        types: ['🧑🏿‍💼', '🧑🏾‍💼', '🧑🏽‍💼', '🧑🏼‍💼', '🧑🏻‍💼'],
    },
    {
        name: 'man_office_worker',
        code: '👨‍💼',
        types: ['👨🏿‍💼', '👨🏾‍💼', '👨🏽‍💼', '👨🏼‍💼', '👨🏻‍💼'],
    },
    {
        name: 'woman_office_worker',
        code: '👩‍💼',
        types: ['👩🏿‍💼', '👩🏾‍💼', '👩🏽‍💼', '👩🏼‍💼', '👩🏻‍💼'],
    },
    {
        name: 'scientist',
        code: '🧑‍🔬',
        types: ['🧑🏿‍🔬', '🧑🏾‍🔬', '🧑🏽‍🔬', '🧑🏼‍🔬', '🧑🏻‍🔬'],
    },
    {
        name: 'man_scientist',
        code: '👨‍🔬',
        types: ['👨🏿‍🔬', '👨🏾‍🔬', '👨🏽‍🔬', '👨🏼‍🔬', '👨🏻‍🔬'],
    },
    {
        name: 'woman_scientist',
        code: '👩‍🔬',
        types: ['👩🏿‍🔬', '👩🏾‍🔬', '👩🏽‍🔬', '👩🏼‍🔬', '👩🏻‍🔬'],
    },
    {
        name: 'technologist',
        code: '🧑‍💻',
        types: ['🧑🏿‍💻', '🧑🏾‍💻', '🧑🏽‍💻', '🧑🏼‍💻', '🧑🏻‍💻'],
    },
    {
        name: 'man_technologist',
        code: '👨‍💻',
        types: ['👨🏿‍💻', '👨🏾‍💻', '👨🏽‍💻', '👨🏼‍💻', '👨🏻‍💻'],
    },
    {
        name: 'woman_technologist',
        code: '👩‍💻',
        types: ['👩🏿‍💻', '👩🏾‍💻', '👩🏽‍💻', '👩🏼‍💻', '👩🏻‍💻'],
    },
    {
        name: 'singer',
        code: '🧑‍🎤',
        types: ['🧑🏿‍🎤', '🧑🏾‍🎤', '🧑🏽‍🎤', '🧑🏼‍🎤', '🧑🏻‍🎤'],
    },
    {
        name: 'man_singer',
        code: '👨‍🎤',
        types: ['👨🏿‍🎤', '👨🏾‍🎤', '👨🏽‍🎤', '👨🏼‍🎤', '👨🏻‍🎤'],
    },
    {
        name: 'woman_singer',
        code: '👩‍🎤',
        types: ['👩🏿‍🎤', '👩🏾‍🎤', '👩🏽‍🎤', '👩🏼‍🎤', '👩🏻‍🎤'],
    },
    {
        name: 'artist',
        code: '🧑‍🎨',
        types: ['🧑🏿‍🎨', '🧑🏾‍🎨', '🧑🏽‍🎨', '🧑🏼‍🎨', '🧑🏻‍🎨'],
    },
    {
        name: 'man_artist',
        code: '👨‍🎨',
        types: ['👨🏿‍🎨', '👨🏾‍🎨', '👨🏽‍🎨', '👨🏼‍🎨', '👨🏻‍🎨'],
    },
    {
        name: 'woman_artist',
        code: '👩‍🎨',
        types: ['👩🏿‍🎨', '👩🏾‍🎨', '👩🏽‍🎨', '👩🏼‍🎨', '👩🏻‍🎨'],
    },
    {
        name: 'pilot',
        code: '🧑‍✈️',
        types: ['🧑🏿‍✈️', '🧑🏾‍✈️', '🧑🏽‍✈️', '🧑🏼‍✈️', '🧑🏻‍✈️'],
    },
    {
        name: 'man_pilot',
        code: '👨‍✈️',
        types: ['👨🏿‍✈️', '👨🏾‍✈️', '👨🏽‍✈️', '👨🏼‍✈️', '👨🏻‍✈️'],
    },
    {
        name: 'woman_pilot',
        code: '👩‍✈️',
        types: ['👩🏿‍✈️', '👩🏾‍✈️', '👩🏽‍✈️', '👩🏼‍✈️', '👩🏻‍✈️'],
    },
    {
        name: 'astronaut',
        code: '🧑‍🚀',
        types: ['🧑🏿‍🚀', '🧑🏾‍🚀', '🧑🏽‍🚀', '🧑🏼‍🚀', '🧑🏻‍🚀'],
    },
    {
        name: 'man_astronaut',
        code: '👨‍🚀',
        types: ['👨🏿‍🚀', '👨🏾‍🚀', '👨🏽‍🚀', '👨🏼‍🚀', '👨🏻‍🚀'],
    },
    {
        name: 'woman_astronaut',
        code: '👩‍🚀',
        types: ['👩🏿‍🚀', '👩🏾‍🚀', '👩🏽‍🚀', '👩🏼‍🚀', '👩🏻‍🚀'],
    },
    {
        name: 'firefighter',
        code: '🧑‍🚒',
        types: ['🧑🏿‍🚒', '🧑🏾‍🚒', '🧑🏽‍🚒', '🧑🏼‍🚒', '🧑🏻‍🚒'],
    },
    {
        name: 'man_firefighter',
        code: '👨‍🚒',
        types: ['👨🏿‍🚒', '👨🏾‍🚒', '👨🏽‍🚒', '👨🏼‍🚒', '👨🏻‍🚒'],
    },
    {
        name: 'woman_firefighter',
        code: '👩‍🚒',
        types: ['👩🏿‍🚒', '👩🏾‍🚒', '👩🏽‍🚒', '👩🏼‍🚒', '👩🏻‍🚒'],
    },
    {
        name: 'police_officer',
        code: '👮',
        types: ['👮🏿', '👮🏾', '👮🏽', '👮🏼', '👮🏻'],
    },
    {
        name: 'policeman',
        code: '👮‍♂️',
        types: ['👮🏿‍♂️', '👮🏾‍♂️', '👮🏽‍♂️', '👮🏼‍♂️', '👮🏻‍♂️'],
    },
    {
        name: 'policewoman',
        code: '👮‍♀️',
        types: ['👮🏿‍♀️', '👮🏾‍♀️', '👮🏽‍♀️', '👮🏼‍♀️', '👮🏻‍♀️'],
    },
    {
        name: 'detective',
        code: '🕵️',
        types: ['🕵🏿', '🕵🏾', '🕵🏽', '🕵🏼', '🕵🏻'],
    },
    {
        name: 'male_detective',
        code: '🕵️‍♂️',
        types: ['🕵🏿‍♂️', '🕵🏾‍♂️', '🕵🏽‍♂️', '🕵🏼‍♂️', '🕵🏻‍♂️'],
    },
    {
        name: 'female_detective',
        code: '🕵️‍♀️',
        types: ['🕵🏿‍♀️', '🕵🏾‍♀️', '🕵🏽‍♀️', '🕵🏼‍♀️', '🕵🏻‍♀️'],
    },
    {
        name: 'guard',
        code: '💂',
        types: ['💂🏿', '💂🏾', '💂🏽', '💂🏼', '💂🏻'],
    },
    {
        name: 'guardsman',
        code: '💂‍♂️',
        types: ['💂🏿‍♂️', '💂🏾‍♂️', '💂🏽‍♂️', '💂🏼‍♂️', '💂🏻‍♂️'],
    },
    {
        name: 'guardswoman',
        code: '💂‍♀️',
        types: ['💂🏿‍♀️', '💂🏾‍♀️', '💂🏽‍♀️', '💂🏼‍♀️', '💂🏻‍♀️'],
    },
    {
        name: 'ninja',
        code: '🥷',
        types: ['🥷🏿', '🥷🏾', '🥷🏽', '🥷🏼', '🥷🏻'],
    },
    {
        name: 'construction_worker',
        code: '👷',
        types: ['👷🏿', '👷🏾', '👷🏽', '👷🏼', '👷🏻'],
    },
    {
        name: 'construction_worker_man',
        code: '👷‍♂️',
        types: ['👷🏿‍♂️', '👷🏾‍♂️', '👷🏽‍♂️', '👷🏼‍♂️', '👷🏻‍♂️'],
    },
    {
        name: 'construction_worker_woman',
        code: '👷‍♀️',
        types: ['👷🏿‍♀️', '👷🏾‍♀️', '👷🏽‍♀️', '👷🏼‍♀️', '👷🏻‍♀️'],
    },
    {
        name: 'prince',
        code: '🤴',
        types: ['🤴🏿', '🤴🏾', '🤴🏽', '🤴🏼', '🤴🏻'],
    },
    {
        name: 'person_with_crown',
        code: '🫅',
        types: ['🫅🏿', '🫅🏾', '🫅🏽', '🫅🏼', '🫅🏻'],
    },
    {
        name: 'princess',
        code: '👸',
        types: ['👸🏿', '👸🏾', '👸🏽', '👸🏼', '👸🏻'],
    },
    {
        name: 'person_with_turban',
        code: '👳',
        types: ['👳🏿', '👳🏾', '👳🏽', '👳🏼', '👳🏻'],
    },
    {
        name: 'man_with_turban',
        code: '👳‍♂️',
        types: ['👳🏿‍♂️', '👳🏾‍♂️', '👳🏽‍♂️', '👳🏼‍♂️', '👳🏻‍♂️'],
    },
    {
        name: 'woman_with_turban',
        code: '👳‍♀️',
        types: ['👳🏿‍♀️', '👳🏾‍♀️', '👳🏽‍♀️', '👳🏼‍♀️', '👳🏻‍♀️'],
    },
    {
        name: 'man_with_gua_pi_mao',
        code: '👲',
        types: ['👲🏿', '👲🏾', '👲🏽', '👲🏼', '👲🏻'],
    },
    {
        name: 'woman_with_headscarf',
        code: '🧕',
        types: ['🧕🏿', '🧕🏾', '🧕🏽', '🧕🏼', '🧕🏻'],
    },
    {
        name: 'person_in_tuxedo',
        code: '🤵',
        types: ['🤵🏿', '🤵🏾', '🤵🏽', '🤵🏼', '🤵🏻'],
    },
    {
        name: 'man_in_tuxedo',
        code: '🤵‍♂️',
        types: ['🤵🏿‍♂️', '🤵🏾‍♂️', '🤵🏽‍♂️', '🤵🏼‍♂️', '🤵🏻‍♂️'],
    },
    {
        name: 'woman_in_tuxedo',
        code: '🤵‍♀️',
        types: ['🤵🏿‍♀️', '🤵🏾‍♀️', '🤵🏽‍♀️', '🤵🏼‍♀️', '🤵🏻‍♀️'],
    },
    {
        name: 'person_with_veil',
        code: '👰',
        types: ['👰🏿', '👰🏾', '👰🏽', '👰🏼', '👰🏻'],
    },
    {
        name: 'man_with_veil',
        code: '👰‍♂️',
        types: ['👰🏿‍♂️', '👰🏾‍♂️', '👰🏽‍♂️', '👰🏼‍♂️', '👰🏻‍♂️'],
    },
    {
        name: 'woman_with_veil',
        code: '👰‍♀️',
        types: ['👰🏿‍♀️', '👰🏾‍♀️', '👰🏽‍♀️', '👰🏼‍♀️', '👰🏻‍♀️'],
    },
    {
        name: 'pregnant_woman',
        code: '🤰',
        types: ['🤰🏿', '🤰🏾', '🤰🏽', '🤰🏼', '🤰🏻'],
    },
    {
        name: 'pregnant_person',
        code: '🫄',
        types: ['🫄🏿', '🫄🏾', '🫄🏽', '🫄🏼', '🫄🏻'],
    },
    {
        name: 'pregnant_man',
        code: '🫃',
        types: ['🫃🏿', '🫃🏾', '🫃🏽', '🫃🏼', '🫃🏻'],
    },
    {
        name: 'breast_feeding',
        code: '🤱',
        types: ['🤱🏿', '🤱🏾', '🤱🏽', '🤱🏼', '🤱🏻'],
    },
    {
        name: 'woman_feeding_baby',
        code: '👩‍🍼',
        types: ['👩🏿‍🍼', '👩🏾‍🍼', '👩🏽‍🍼', '👩🏼‍🍼', '👩🏻‍🍼'],
    },
    {
        name: 'man_feeding_baby',
        code: '👨‍🍼',
        types: ['👨🏿‍🍼', '👨🏾‍🍼', '👨🏽‍🍼', '👨🏼‍🍼', '👨🏻‍🍼'],
    },
    {
        name: 'person_feeding_baby',
        code: '🧑‍🍼',
        types: ['🧑🏿‍🍼', '🧑🏾‍🍼', '🧑🏽‍🍼', '🧑🏼‍🍼', '🧑🏻‍🍼'],
    },
    {
        name: 'angel',
        code: '👼',
        types: ['👼🏿', '👼🏾', '👼🏽', '👼🏼', '👼🏻'],
    },
    {
        name: 'santa',
        code: '🎅',
        types: ['🎅🏿', '🎅🏾', '🎅🏽', '🎅🏼', '🎅🏻'],
    },
    {
        name: 'mrs_claus',
        code: '🤶',
        types: ['🤶🏿', '🤶🏾', '🤶🏽', '🤶🏼', '🤶🏻'],
    },
    {
        name: 'mx_claus',
        code: '🧑‍🎄',
        types: ['🧑🏿‍🎄', '🧑🏾‍🎄', '🧑🏽‍🎄', '🧑🏼‍🎄', '🧑🏻‍🎄'],
    },
    {
        name: 'superhero',
        code: '🦸',
        types: ['🦸🏿', '🦸🏾', '🦸🏽', '🦸🏼', '🦸🏻'],
    },
    {
        name: 'superhero_man',
        code: '🦸‍♂️',
        types: ['🦸🏿‍♂️', '🦸🏾‍♂️', '🦸🏽‍♂️', '🦸🏼‍♂️', '🦸🏻‍♂️'],
    },
    {
        name: 'superhero_woman',
        code: '🦸‍♀️',
        types: ['🦸🏿‍♀️', '🦸🏾‍♀️', '🦸🏽‍♀️', '🦸🏼‍♀️', '🦸🏻‍♀️'],
    },
    {
        name: 'supervillain',
        code: '🦹',
        types: ['🦹🏿', '🦹🏾', '🦹🏽', '🦹🏼', '🦹🏻'],
    },
    {
        name: 'supervillain_man',
        code: '🦹‍♂️',
        types: ['🦹🏿‍♂️', '🦹🏾‍♂️', '🦹🏽‍♂️', '🦹🏼‍♂️', '🦹🏻‍♂️'],
    },
    {
        name: 'supervillain_woman',
        code: '🦹‍♀️',
        types: ['🦹🏿‍♀️', '🦹🏾‍♀️', '🦹🏽‍♀️', '🦹🏼‍♀️', '🦹🏻‍♀️'],
    },
    {
        name: 'mage',
        code: '🧙',
        types: ['🧙🏿', '🧙🏾', '🧙🏽', '🧙🏼', '🧙🏻'],
    },
    {
        name: 'mage_man',
        code: '🧙‍♂️',
        types: ['🧙🏿‍♂️', '🧙🏾‍♂️', '🧙🏽‍♂️', '🧙🏼‍♂️', '🧙🏻‍♂️'],
    },
    {
        name: 'mage_woman',
        code: '🧙‍♀️',
        types: ['🧙🏿‍♀️', '🧙🏾‍♀️', '🧙🏽‍♀️', '🧙🏼‍♀️', '🧙🏻‍♀️'],
    },
    {
        name: 'fairy',
        code: '🧚',
        types: ['🧚🏿', '🧚🏾', '🧚🏽', '🧚🏼', '🧚🏻'],
    },
    {
        name: 'fairy_man',
        code: '🧚‍♂️',
        types: ['🧚🏿‍♂️', '🧚🏾‍♂️', '🧚🏽‍♂️', '🧚🏼‍♂️', '🧚🏻‍♂️'],
    },
    {
        name: 'fairy_woman',
        code: '🧚‍♀️',
        types: ['🧚🏿‍♀️', '🧚🏾‍♀️', '🧚🏽‍♀️', '🧚🏼‍♀️', '🧚🏻‍♀️'],
    },
    {
        name: 'vampire',
        code: '🧛',
        types: ['🧛🏿', '🧛🏾', '🧛🏽', '🧛🏼', '🧛🏻'],
    },
    {
        name: 'vampire_man',
        code: '🧛‍♂️',
        types: ['🧛🏿‍♂️', '🧛🏾‍♂️', '🧛🏽‍♂️', '🧛🏼‍♂️', '🧛🏻‍♂️'],
    },
    {
        name: 'vampire_woman',
        code: '🧛‍♀️',
        types: ['🧛🏿‍♀️', '🧛🏾‍♀️', '🧛🏽‍♀️', '🧛🏼‍♀️', '🧛🏻‍♀️'],
    },
    {
        name: 'merperson',
        code: '🧜',
        types: ['🧜🏿', '🧜🏾', '🧜🏽', '🧜🏼', '🧜🏻'],
    },
    {
        name: 'merman',
        code: '🧜‍♂️',
        types: ['🧜🏿‍♂️', '🧜🏾‍♂️', '🧜🏽‍♂️', '🧜🏼‍♂️', '🧜🏻‍♂️'],
    },
    {
        name: 'mermaid',
        code: '🧜‍♀️',
        types: ['🧜🏿‍♀️', '🧜🏾‍♀️', '🧜🏽‍♀️', '🧜🏼‍♀️', '🧜🏻‍♀️'],
    },
    {
        name: 'elf',
        code: '🧝',
        types: ['🧝🏿', '🧝🏾', '🧝🏽', '🧝🏼', '🧝🏻'],
    },
    {
        name: 'elf_man',
        code: '🧝‍♂️',
        types: ['🧝🏿‍♂️', '🧝🏾‍♂️', '🧝🏽‍♂️', '🧝🏼‍♂️', '🧝🏻‍♂️'],
    },
    {
        name: 'elf_woman',
        code: '🧝‍♀️',
        types: ['🧝🏿‍♀️', '🧝🏾‍♀️', '🧝🏽‍♀️', '🧝🏼‍♀️', '🧝🏻‍♀️'],
    },
    {
        name: 'troll',
        code: '🧌',
    },
    {
        name: 'genie',
        code: '🧞',
    },
    {
        name: 'genie_man',
        code: '🧞‍♂️',
    },
    {
        name: 'genie_woman',
        code: '🧞‍♀️',
    },
    {
        name: 'zombie',
        code: '🧟',
    },
    {
        name: 'zombie_man',
        code: '🧟‍♂️',
    },
    {
        name: 'zombie_woman',
        code: '🧟‍♀️',
    },
    {
        name: 'massage',
        code: '💆',
        types: ['💆🏿', '💆🏾', '💆🏽', '💆🏼', '💆🏻'],
    },
    {
        name: 'massage_man',
        code: '💆‍♂️',
        types: ['💆🏿‍♂️', '💆🏾‍♂️', '💆🏽‍♂️', '💆🏼‍♂️', '💆🏻‍♂️'],
    },
    {
        name: 'massage_woman',
        code: '💆‍♀️',
        types: ['💆🏿‍♀️', '💆🏾‍♀️', '💆🏽‍♀️', '💆🏼‍♀️', '💆🏻‍♀️'],
    },
    {
        name: 'haircut',
        code: '💇',
        types: ['💇🏿', '💇🏾', '💇🏽', '💇🏼', '💇🏻'],
    },
    {
        name: 'haircut_man',
        code: '💇‍♂️',
        types: ['💇🏿‍♂️', '💇🏾‍♂️', '💇🏽‍♂️', '💇🏼‍♂️', '💇🏻‍♂️'],
    },
    {
        name: 'haircut_woman',
        code: '💇‍♀️',
        types: ['💇🏿‍♀️', '💇🏾‍♀️', '💇🏽‍♀️', '💇🏼‍♀️', '💇🏻‍♀️'],
    },
    {
        name: 'walking',
        code: '🚶',
        types: ['🚶🏿', '🚶🏾', '🚶🏽', '🚶🏼', '🚶🏻'],
    },
    {
        name: 'walking_man',
        code: '🚶‍♂️',
        types: ['🚶🏿‍♂️', '🚶🏾‍♂️', '🚶🏽‍♂️', '🚶🏼‍♂️', '🚶🏻‍♂️'],
    },
    {
        name: 'walking_woman',
        code: '🚶‍♀️',
        types: ['🚶🏿‍♀️', '🚶🏾‍♀️', '🚶🏽‍♀️', '🚶🏼‍♀️', '🚶🏻‍♀️'],
    },
    {
        name: 'standing_person',
        code: '🧍',
        types: ['🧍🏿', '🧍🏾', '🧍🏽', '🧍🏼', '🧍🏻'],
    },
    {
        name: 'standing_man',
        code: '🧍‍♂️',
        types: ['🧍🏿‍♂️', '🧍🏾‍♂️', '🧍🏽‍♂️', '🧍🏼‍♂️', '🧍🏻‍♂️'],
    },
    {
        name: 'standing_woman',
        code: '🧍‍♀️',
        types: ['🧍🏿‍♀️', '🧍🏾‍♀️', '🧍🏽‍♀️', '🧍🏼‍♀️', '🧍🏻‍♀️'],
    },
    {
        name: 'kneeling_person',
        code: '🧎',
        types: ['🧎🏿', '🧎🏾', '🧎🏽', '🧎🏼', '🧎🏻'],
    },
    {
        name: 'kneeling_man',
        code: '🧎‍♂️',
        types: ['🧎🏿‍♂️', '🧎🏾‍♂️', '🧎🏽‍♂️', '🧎🏼‍♂️', '🧎🏻‍♂️'],
    },
    {
        name: 'kneeling_woman',
        code: '🧎‍♀️',
        types: ['🧎🏿‍♀️', '🧎🏾‍♀️', '🧎🏽‍♀️', '🧎🏼‍♀️', '🧎🏻‍♀️'],
    },
    {
        name: 'person_with_probing_cane',
        code: '🧑‍🦯',
        types: ['🧑🏿‍🦯', '🧑🏾‍🦯', '🧑🏽‍🦯', '🧑🏼‍🦯', '🧑🏻‍🦯'],
    },
    {
        name: 'man_with_probing_cane',
        code: '👨‍🦯',
        types: ['👨🏿‍🦯', '👨🏾‍🦯', '👨🏽‍🦯', '👨🏼‍🦯', '👨🏻‍🦯'],
    },
    {
        name: 'woman_with_probing_cane',
        code: '👩‍🦯',
        types: ['👩🏿‍🦯', '👩🏾‍🦯', '👩🏽‍🦯', '👩🏼‍🦯', '👩🏻‍🦯'],
    },
    {
        name: 'person_in_motorized_wheelchair',
        code: '🧑‍🦼',
        types: ['🧑🏿‍🦼', '🧑🏾‍🦼', '🧑🏽‍🦼', '🧑🏼‍🦼', '🧑🏻‍🦼'],
    },
    {
        name: 'man_in_motorized_wheelchair',
        code: '👨‍🦼',
        types: ['👨🏿‍🦼', '👨🏾‍🦼', '👨🏽‍🦼', '👨🏼‍🦼', '👨🏻‍🦼'],
    },
    {
        name: 'woman_in_motorized_wheelchair',
        code: '👩‍🦼',
        types: ['👩🏿‍🦼', '👩🏾‍🦼', '👩🏽‍🦼', '👩🏼‍🦼', '👩🏻‍🦼'],
    },
    {
        name: 'person_in_manual_wheelchair',
        code: '🧑‍🦽',
        types: ['🧑🏿‍🦽', '🧑🏾‍🦽', '🧑🏽‍🦽', '🧑🏼‍🦽', '🧑🏻‍🦽'],
    },
    {
        name: 'man_in_manual_wheelchair',
        code: '👨‍🦽',
        types: ['👨🏿‍🦽', '👨🏾‍🦽', '👨🏽‍🦽', '👨🏼‍🦽', '👨🏻‍🦽'],
    },
    {
        name: 'woman_in_manual_wheelchair',
        code: '👩‍🦽',
        types: ['👩🏿‍🦽', '👩🏾‍🦽', '👩🏽‍🦽', '👩🏼‍🦽', '👩🏻‍🦽'],
    },
    {
        name: 'runner',
        code: '🏃',
        types: ['🏃🏿', '🏃🏾', '🏃🏽', '🏃🏼', '🏃🏻'],
    },
    {
        name: 'running_man',
        code: '🏃‍♂️',
        types: ['🏃🏿‍♂️', '🏃🏾‍♂️', '🏃🏽‍♂️', '🏃🏼‍♂️', '🏃🏻‍♂️'],
    },
    {
        name: 'running_woman',
        code: '🏃‍♀️',
        types: ['🏃🏿‍♀️', '🏃🏾‍♀️', '🏃🏽‍♀️', '🏃🏼‍♀️', '🏃🏻‍♀️'],
    },
    {
        name: 'woman_dancing',
        code: '💃',
        types: ['💃🏿', '💃🏾', '💃🏽', '💃🏼', '💃🏻'],
    },
    {
        name: 'man_dancing',
        code: '🕺',
        types: ['🕺🏿', '🕺🏾', '🕺🏽', '🕺🏼', '🕺🏻'],
    },
    {
        name: 'business_suit_levitating',
        code: '🕴️',
        types: ['🕴🏿', '🕴🏾', '🕴🏽', '🕴🏼', '🕴🏻'],
    },
    {
        name: 'dancers',
        code: '👯',
    },
    {
        name: 'dancing_men',
        code: '👯‍♂️',
    },
    {
        name: 'dancing_women',
        code: '👯‍♀️',
    },
    {
        name: 'sauna_person',
        code: '🧖',
        types: ['🧖🏿', '🧖🏾', '🧖🏽', '🧖🏼', '🧖🏻'],
    },
    {
        name: 'sauna_man',
        code: '🧖‍♂️',
        types: ['🧖🏿‍♂️', '🧖🏾‍♂️', '🧖🏽‍♂️', '🧖🏼‍♂️', '🧖🏻‍♂️'],
    },
    {
        name: 'sauna_woman',
        code: '🧖‍♀️',
        types: ['🧖🏿‍♀️', '🧖🏾‍♀️', '🧖🏽‍♀️', '🧖🏼‍♀️', '🧖🏻‍♀️'],
    },
    {
        name: 'climbing',
        code: '🧗',
        types: ['🧗🏿', '🧗🏾', '🧗🏽', '🧗🏼', '🧗🏻'],
    },
    {
        name: 'climbing_man',
        code: '🧗‍♂️',
        types: ['🧗🏿‍♂️', '🧗🏾‍♂️', '🧗🏽‍♂️', '🧗🏼‍♂️', '🧗🏻‍♂️'],
    },
    {
        name: 'climbing_woman',
        code: '🧗‍♀️',
        types: ['🧗🏿‍♀️', '🧗🏾‍♀️', '🧗🏽‍♀️', '🧗🏼‍♀️', '🧗🏻‍♀️'],
    },
    {
        name: 'person_fencing',
        code: '🤺',
    },
    {
        name: 'horse_racing',
        code: '🏇',
        types: ['🏇🏿', '🏇🏾', '🏇🏽', '🏇🏼', '🏇🏻'],
    },
    {
        name: 'skier',
        code: '⛷️',
    },
    {
        name: 'snowboarder',
        code: '🏂',
        types: ['🏂🏿', '🏂🏾', '🏂🏽', '🏂🏼', '🏂🏻'],
    },
    {
        name: 'golfing',
        code: '🏌️',
        types: ['🏌🏿', '🏌🏾', '🏌🏽', '🏌🏼', '🏌🏻'],
    },
    {
        name: 'golfing_man',
        code: '🏌️‍♂️',
        types: ['🏌🏿‍♂️', '🏌🏾‍♂️', '🏌🏽‍♂️', '🏌🏼‍♂️', '🏌🏻‍♂️'],
    },
    {
        name: 'golfing_woman',
        code: '🏌️‍♀️',
        types: ['🏌🏿‍♀️', '🏌🏾‍♀️', '🏌🏽‍♀️', '🏌🏼‍♀️', '🏌🏻‍♀️'],
    },
    {
        name: 'surfer',
        code: '🏄',
        types: ['🏄🏿', '🏄🏾', '🏄🏽', '🏄🏼', '🏄🏻'],
    },
    {
        name: 'surfing_man',
        code: '🏄‍♂️',
        types: ['🏄🏿‍♂️', '🏄🏾‍♂️', '🏄🏽‍♂️', '🏄🏼‍♂️', '🏄🏻‍♂️'],
    },
    {
        name: 'surfing_woman',
        code: '🏄‍♀️',
        types: ['🏄🏿‍♀️', '🏄🏾‍♀️', '🏄🏽‍♀️', '🏄🏼‍♀️', '🏄🏻‍♀️'],
    },
    {
        name: 'rowboat',
        code: '🚣',
        types: ['🚣🏿', '🚣🏾', '🚣🏽', '🚣🏼', '🚣🏻'],
    },
    {
        name: 'rowing_man',
        code: '🚣‍♂️',
        types: ['🚣🏿‍♂️', '🚣🏾‍♂️', '🚣🏽‍♂️', '🚣🏼‍♂️', '🚣🏻‍♂️'],
    },
    {
        name: 'rowing_woman',
        code: '🚣‍♀️',
        types: ['🚣🏿‍♀️', '🚣🏾‍♀️', '🚣🏽‍♀️', '🚣🏼‍♀️', '🚣🏻‍♀️'],
    },
    {
        name: 'swimmer',
        code: '🏊',
        types: ['🏊🏿', '🏊🏾', '🏊🏽', '🏊🏼', '🏊🏻'],
    },
    {
        name: 'swimming_man',
        code: '🏊‍♂️',
        types: ['🏊🏿‍♂️', '🏊🏾‍♂️', '🏊🏽‍♂️', '🏊🏼‍♂️', '🏊🏻‍♂️'],
    },
    {
        name: 'swimming_woman',
        code: '🏊‍♀️',
        types: ['🏊🏿‍♀️', '🏊🏾‍♀️', '🏊🏽‍♀️', '🏊🏼‍♀️', '🏊🏻‍♀️'],
    },
    {
        name: 'bouncing_ball_person',
        code: '⛹️',
        types: ['⛹🏿', '⛹🏾', '⛹🏽', '⛹🏼', '⛹🏻'],
    },
    {
        name: 'bouncing_ball_man',
        code: '⛹️‍♂️',
        types: ['⛹🏿‍♂️', '⛹🏾‍♂️', '⛹🏽‍♂️', '⛹🏼‍♂️', '⛹🏻‍♂️'],
    },
    {
        name: 'bouncing_ball_woman',
        code: '⛹️‍♀️',
        types: ['⛹🏿‍♀️', '⛹🏾‍♀️', '⛹🏽‍♀️', '⛹🏼‍♀️', '⛹🏻‍♀️'],
    },
    {
        name: 'weight_lifting',
        code: '🏋️',
        types: ['🏋🏿', '🏋🏾', '🏋🏽', '🏋🏼', '🏋🏻'],
    },
    {
        name: 'weight_lifting_man',
        code: '🏋️‍♂️',
        types: ['🏋🏿‍♂️', '🏋🏾‍♂️', '🏋🏽‍♂️', '🏋🏼‍♂️', '🏋🏻‍♂️'],
    },
    {
        name: 'weight_lifting_woman',
        code: '🏋️‍♀️',
        types: ['🏋🏿‍♀️', '🏋🏾‍♀️', '🏋🏽‍♀️', '🏋🏼‍♀️', '🏋🏻‍♀️'],
    },
    {
        name: 'bicyclist',
        code: '🚴',
        types: ['🚴🏿', '🚴🏾', '🚴🏽', '🚴🏼', '🚴🏻'],
    },
    {
        name: 'biking_man',
        code: '🚴‍♂️',
        types: ['🚴🏿‍♂️', '🚴🏾‍♂️', '🚴🏽‍♂️', '🚴🏼‍♂️', '🚴🏻‍♂️'],
    },
    {
        name: 'biking_woman',
        code: '🚴‍♀️',
        types: ['🚴🏿‍♀️', '🚴🏾‍♀️', '🚴🏽‍♀️', '🚴🏼‍♀️', '🚴🏻‍♀️'],
    },
    {
        name: 'mountain_bicyclist',
        code: '🚵',
        types: ['🚵🏿', '🚵🏾', '🚵🏽', '🚵🏼', '🚵🏻'],
    },
    {
        name: 'mountain_biking_man',
        code: '🚵‍♂️',
        types: ['🚵🏿‍♂️', '🚵🏾‍♂️', '🚵🏽‍♂️', '🚵🏼‍♂️', '🚵🏻‍♂️'],
    },
    {
        name: 'mountain_biking_woman',
        code: '🚵‍♀️',
        types: ['🚵🏿‍♀️', '🚵🏾‍♀️', '🚵🏽‍♀️', '🚵🏼‍♀️', '🚵🏻‍♀️'],
    },
    {
        name: 'cartwheeling',
        code: '🤸',
        types: ['🤸🏿', '🤸🏾', '🤸🏽', '🤸🏼', '🤸🏻'],
    },
    {
        name: 'man_cartwheeling',
        code: '🤸‍♂️',
        types: ['🤸🏿‍♂️', '🤸🏾‍♂️', '🤸🏽‍♂️', '🤸🏼‍♂️', '🤸🏻‍♂️'],
    },
    {
        name: 'woman_cartwheeling',
        code: '🤸‍♀️',
        types: ['🤸🏿‍♀️', '🤸🏾‍♀️', '🤸🏽‍♀️', '🤸🏼‍♀️', '🤸🏻‍♀️'],
    },
    {
        name: 'wrestling',
        code: '🤼',
    },
    {
        name: 'men_wrestling',
        code: '🤼‍♂️',
    },
    {
        name: 'women_wrestling',
        code: '🤼‍♀️',
    },
    {
        name: 'water_polo',
        code: '🤽',
        types: ['🤽🏿', '🤽🏾', '🤽🏽', '🤽🏼', '🤽🏻'],
    },
    {
        name: 'man_playing_water_polo',
        code: '🤽‍♂️',
        types: ['🤽🏿‍♂️', '🤽🏾‍♂️', '🤽🏽‍♂️', '🤽🏼‍♂️', '🤽🏻‍♂️'],
    },
    {
        name: 'woman_playing_water_polo',
        code: '🤽‍♀️',
        types: ['🤽🏿‍♀️', '🤽🏾‍♀️', '🤽🏽‍♀️', '🤽🏼‍♀️', '🤽🏻‍♀️'],
    },
    {
        name: 'handball_person',
        code: '🤾',
        types: ['🤾🏿', '🤾🏾', '🤾🏽', '🤾🏼', '🤾🏻'],
    },
    {
        name: 'man_playing_handball',
        code: '🤾‍♂️',
        types: ['🤾🏿‍♂️', '🤾🏾‍♂️', '🤾🏽‍♂️', '🤾🏼‍♂️', '🤾🏻‍♂️'],
    },
    {
        name: 'woman_playing_handball',
        code: '🤾‍♀️',
        types: ['🤾🏿‍♀️', '🤾🏾‍♀️', '🤾🏽‍♀️', '🤾🏼‍♀️', '🤾🏻‍♀️'],
    },
    {
        name: 'juggling_person',
        code: '🤹',
        types: ['🤹🏿', '🤹🏾', '🤹🏽', '🤹🏼', '🤹🏻'],
    },
    {
        name: 'man_juggling',
        code: '🤹‍♂️',
        types: ['🤹🏿‍♂️', '🤹🏾‍♂️', '🤹🏽‍♂️', '🤹🏼‍♂️', '🤹🏻‍♂️'],
    },
    {
        name: 'woman_juggling',
        code: '🤹‍♀️',
        types: ['🤹🏿‍♀️', '🤹🏾‍♀️', '🤹🏽‍♀️', '🤹🏼‍♀️', '🤹🏻‍♀️'],
    },
    {
        name: 'lotus_position',
        code: '🧘',
        types: ['🧘🏿', '🧘🏾', '🧘🏽', '🧘🏼', '🧘🏻'],
    },
    {
        name: 'lotus_position_man',
        code: '🧘‍♂️',
        types: ['🧘🏿‍♂️', '🧘🏾‍♂️', '🧘🏽‍♂️', '🧘🏼‍♂️', '🧘🏻‍♂️'],
    },
    {
        name: 'lotus_position_woman',
        code: '🧘‍♀️',
        types: ['🧘🏿‍♀️', '🧘🏾‍♀️', '🧘🏽‍♀️', '🧘🏼‍♀️', '🧘🏻‍♀️'],
    },
    {
        name: 'bath',
        code: '🛀',
        types: ['🛀🏿', '🛀🏾', '🛀🏽', '🛀🏼', '🛀🏻'],
    },
    {
        name: 'sleeping_bed',
        code: '🛌',
        types: ['🛌🏿', '🛌🏾', '🛌🏽', '🛌🏼', '🛌🏻'],
    },
    {
        name: 'people_holding_hands',
        code: '🧑‍🤝‍🧑',
        types: ['🧑🏿‍🤝‍🧑🏿', '🧑🏾‍🤝‍🧑🏾', '🧑🏽‍🤝‍🧑🏽', '🧑🏼‍🤝‍🧑🏼', '🧑🏻‍🤝‍🧑🏻'],
    },
    {
        name: 'two_women_holding_hands',
        code: '👭',
        types: ['👭🏿', '👭🏾', '👭🏽', '👭🏼', '👭🏻'],
    },
    {
        name: 'couple',
        code: '👫',
        types: ['👫🏿', '👫🏾', '👫🏽', '👫🏼', '👫🏻'],
    },
    {
        name: 'two_men_holding_hands',
        code: '👬',
        types: ['👬🏿', '👬🏾', '👬🏽', '👬🏼', '👬🏻'],
    },
    {
        name: 'couplekiss',
        code: '💏',
        types: ['💏🏿', '💏🏾', '💏🏽', '💏🏼', '💏🏻'],
    },
    {
        name: 'couplekiss_man_woman',
        code: '👩‍❤️‍💋‍👨',
        types: ['👩🏿‍❤️‍💋‍👨🏿', '👩🏾‍❤️‍💋‍👨🏾', '👩🏽‍❤️‍💋‍👨🏽', '👩🏼‍❤️‍💋‍👨🏼', '👩🏻‍❤️‍💋‍👨🏻'],
    },
    {
        name: 'couplekiss_man_man',
        code: '👨‍❤️‍💋‍👨',
        types: ['👨🏿‍❤️‍💋‍👨🏿', '👨🏾‍❤️‍💋‍👨🏾', '👨🏽‍❤️‍💋‍👨🏽', '👨🏼‍❤️‍💋‍👨🏼', '👨🏻‍❤️‍💋‍👨🏻'],
    },
    {
        name: 'couplekiss_woman_woman',
        code: '👩‍❤️‍💋‍👩',
        types: ['👩🏿‍❤️‍💋‍👩🏿', '👩🏾‍❤️‍💋‍👩🏾', '👩🏽‍❤️‍💋‍👩🏽', '👩🏼‍❤️‍💋‍👩🏼', '👩🏻‍❤️‍💋‍👩🏻'],
    },
    {
        name: 'couple_with_heart',
        code: '💑',
        types: ['💑🏿', '💑🏾', '💑🏽', '💑🏼', '💑🏻'],
    },
    {
        name: 'couple_with_heart_woman_man',
        code: '👩‍❤️‍👨',
        types: ['👩🏿‍❤️‍👨🏿', '👩🏾‍❤️‍👨🏾', '👩🏽‍❤️‍👨🏽', '👩🏼‍❤️‍👨🏼', '👩🏻‍❤️‍👨🏻'],
    },
    {
        name: 'couple_with_heart_man_man',
        code: '👨‍❤️‍👨',
        types: ['👨🏿‍❤️‍👨🏿', '👨🏾‍❤️‍👨🏾', '👨🏽‍❤️‍👨🏽', '👨🏼‍❤️‍👨🏼', '👨🏻‍❤️‍👨🏻'],
    },
    {
        name: 'couple_with_heart_woman_woman',
        code: '👩‍❤️‍👩',
        types: ['👩🏿‍❤️‍👩🏿', '👩🏾‍❤️‍👩🏾', '👩🏽‍❤️‍👩🏽', '👩🏼‍❤️‍👩🏼', '👩🏻‍❤️‍👩🏻'],
    },
    {
        name: 'family',
        code: '👪',
    },
    {
        name: 'family_man_woman_boy',
        code: '👨‍👩‍👦',
    },
    {
        name: 'family_man_woman_girl',
        code: '👨‍👩‍👧',
    },
    {
        name: 'family_man_woman_girl_boy',
        code: '👨‍👩‍👧‍👦',
    },
    {
        name: 'family_man_woman_boy_boy',
        code: '👨‍👩‍👦‍👦',
    },
    {
        name: 'family_man_woman_girl_girl',
        code: '👨‍👩‍👧‍👧',
    },
    {
        name: 'family_man_man_boy',
        code: '👨‍👨‍👦',
    },
    {
        name: 'family_man_man_girl',
        code: '👨‍👨‍👧',
    },
    {
        name: 'family_man_man_girl_boy',
        code: '👨‍👨‍👧‍👦',
    },
    {
        name: 'family_man_man_boy_boy',
        code: '👨‍👨‍👦‍👦',
    },
    {
        name: 'family_man_man_girl_girl',
        code: '👨‍👨‍👧‍👧',
    },
    {
        name: 'family_woman_woman_boy',
        code: '👩‍👩‍👦',
    },
    {
        name: 'family_woman_woman_girl',
        code: '👩‍👩‍👧',
    },
    {
        name: 'family_woman_woman_girl_boy',
        code: '👩‍👩‍👧‍👦',
    },
    {
        name: 'family_woman_woman_boy_boy',
        code: '👩‍👩‍👦‍👦',
    },
    {
        name: 'family_woman_woman_girl_girl',
        code: '👩‍👩‍👧‍👧',
    },
    {
        name: 'family_man_boy',
        code: '👨‍👦',
    },
    {
        name: 'family_man_boy_boy',
        code: '👨‍👦‍👦',
    },
    {
        name: 'family_man_girl',
        code: '👨‍👧',
    },
    {
        name: 'family_man_girl_boy',
        code: '👨‍👧‍👦',
    },
    {
        name: 'family_man_girl_girl',
        code: '👨‍👧‍👧',
    },
    {
        name: 'family_woman_boy',
        code: '👩‍👦',
    },
    {
        name: 'family_woman_boy_boy',
        code: '👩‍👦‍👦',
    },
    {
        name: 'family_woman_girl',
        code: '👩‍👧',
    },
    {
        name: 'family_woman_girl_boy',
        code: '👩‍👧‍👦',
    },
    {
        name: 'family_woman_girl_girl',
        code: '👩‍👧‍👧',
    },
    {
        name: 'speaking_head',
        code: '🗣️',
    },
    {
        name: 'bust_in_silhouette',
        code: '👤',
    },
    {
        name: 'busts_in_silhouette',
        code: '👥',
    },
    {
        name: 'people_hugging',
        code: '🫂',
    },
    {
        name: 'footprints',
        code: '👣',
    },
    {
        header: true,
        icon: AnimalsAndNature,
        code: 'animalsAndNature',
    },
    {
        name: 'monkey_face',
        code: '🐵',
    },
    {
        name: 'monkey',
        code: '🐒',
    },
    {
        name: 'gorilla',
        code: '🦍',
    },
    {
        name: 'orangutan',
        code: '🦧',
    },
    {
        name: 'dog',
        code: '🐶',
    },
    {
        name: 'dog2',
        code: '🐕',
    },
    {
        name: 'guide_dog',
        code: '🦮',
    },
    {
        name: 'service_dog',
        code: '🐕‍🦺',
    },
    {
        name: 'poodle',
        code: '🐩',
    },
    {
        name: 'wolf',
        code: '🐺',
    },
    {
        name: 'fox_face',
        code: '🦊',
    },
    {
        name: 'raccoon',
        code: '🦝',
    },
    {
        name: 'cat',
        code: '🐱',
    },
    {
        name: 'cat2',
        code: '🐈',
    },
    {
        name: 'black_cat',
        code: '🐈‍⬛',
    },
    {
        name: 'lion',
        code: '🦁',
    },
    {
        name: 'tiger',
        code: '🐯',
    },
    {
        name: 'tiger2',
        code: '🐅',
    },
    {
        name: 'leopard',
        code: '🐆',
    },
    {
        name: 'horse',
        code: '🐴',
    },
    {
        name: 'racehorse',
        code: '🐎',
    },
    {
        name: 'unicorn',
        code: '🦄',
    },
    {
        name: 'moose',
        code: '🫎',
    },
    {
        name: 'donkey',
        code: '🫏',
    },
    {
        name: 'wing',
        code: '🪽',
    },
    {
        name: 'black_bird',
        code: '🐦‍⬛',
    },
    {
        name: 'goose',
        code: '🪿',
    },
    {
        name: 'jellyfish',
        code: '🪼',
    },
    {
        name: 'zebra',
        code: '🦓',
    },
    {
        name: 'deer',
        code: '🦌',
    },
    {
        name: 'bison',
        code: '🦬',
    },
    {
        name: 'cow',
        code: '🐮',
    },
    {
        name: 'ox',
        code: '🐂',
    },
    {
        name: 'water_buffalo',
        code: '🐃',
    },
    {
        name: 'cow2',
        code: '🐄',
    },
    {
        name: 'pig',
        code: '🐷',
    },
    {
        name: 'pig2',
        code: '🐖',
    },
    {
        name: 'boar',
        code: '🐗',
    },
    {
        name: 'pig_nose',
        code: '🐽',
    },
    {
        name: 'ram',
        code: '🐏',
    },
    {
        name: 'sheep',
        code: '🐑',
    },
    {
        name: 'goat',
        code: '🐐',
    },
    {
        name: 'dromedary_camel',
        code: '🐪',
    },
    {
        name: 'camel',
        code: '🐫',
    },
    {
        name: 'llama',
        code: '🦙',
    },
    {
        name: 'giraffe',
        code: '🦒',
    },
    {
        name: 'elephant',
        code: '🐘',
    },
    {
        name: 'mammoth',
        code: '🦣',
    },
    {
        name: 'rhinoceros',
        code: '🦏',
    },
    {
        name: 'hippopotamus',
        code: '🦛',
    },
    {
        name: 'mouse',
        code: '🐭',
    },
    {
        name: 'mouse2',
        code: '🐁',
    },
    {
        name: 'rat',
        code: '🐀',
    },
    {
        name: 'hamster',
        code: '🐹',
    },
    {
        name: 'rabbit',
        code: '🐰',
    },
    {
        name: 'rabbit2',
        code: '🐇',
    },
    {
        name: 'chipmunk',
        code: '🐿️',
    },
    {
        name: 'beaver',
        code: '🦫',
    },
    {
        name: 'hedgehog',
        code: '🦔',
    },
    {
        name: 'bat',
        code: '🦇',
    },
    {
        name: 'bear',
        code: '🐻',
    },
    {
        name: 'polar_bear',
        code: '🐻‍❄️',
    },
    {
        name: 'koala',
        code: '🐨',
    },
    {
        name: 'panda_face',
        code: '🐼',
    },
    {
        name: 'sloth',
        code: '🦥',
    },
    {
        name: 'otter',
        code: '🦦',
    },
    {
        name: 'skunk',
        code: '🦨',
    },
    {
        name: 'kangaroo',
        code: '🦘',
    },
    {
        name: 'badger',
        code: '🦡',
    },
    {
        name: 'feet',
        code: '🐾',
    },
    {
        name: 'turkey',
        code: '🦃',
    },
    {
        name: 'chicken',
        code: '🐔',
    },
    {
        name: 'rooster',
        code: '🐓',
    },
    {
        name: 'hatching_chick',
        code: '🐣',
    },
    {
        name: 'baby_chick',
        code: '🐤',
    },
    {
        name: 'hatched_chick',
        code: '🐥',
    },
    {
        name: 'bird',
        code: '🐦',
    },
    {
        name: 'penguin',
        code: '🐧',
    },
    {
        name: 'dove',
        code: '🕊️',
    },
    {
        name: 'eagle',
        code: '🦅',
    },
    {
        name: 'duck',
        code: '🦆',
    },
    {
        name: 'swan',
        code: '🦢',
    },
    {
        name: 'owl',
        code: '🦉',
    },
    {
        name: 'dodo',
        code: '🦤',
    },
    {
        name: 'feather',
        code: '🪶',
    },
    {
        name: 'flamingo',
        code: '🦩',
    },
    {
        name: 'peacock',
        code: '🦚',
    },
    {
        name: 'parrot',
        code: '🦜',
    },
    {
        name: 'frog',
        code: '🐸',
    },
    {
        name: 'crocodile',
        code: '🐊',
    },
    {
        name: 'turtle',
        code: '🐢',
    },
    {
        name: 'lizard',
        code: '🦎',
    },
    {
        name: 'snake',
        code: '🐍',
    },
    {
        name: 'dragon_face',
        code: '🐲',
    },
    {
        name: 'dragon',
        code: '🐉',
    },
    {
        name: 'sauropod',
        code: '🦕',
    },
    {
        name: 't-rex',
        code: '🦖',
    },
    {
        name: 'whale',
        code: '🐳',
    },
    {
        name: 'whale2',
        code: '🐋',
    },
    {
        name: 'dolphin',
        code: '🐬',
    },
    {
        name: 'seal',
        code: '🦭',
    },
    {
        name: 'fish',
        code: '🐟',
    },
    {
        name: 'tropical_fish',
        code: '🐠',
    },
    {
        name: 'blowfish',
        code: '🐡',
    },
    {
        name: 'shark',
        code: '🦈',
    },
    {
        name: 'octopus',
        code: '🐙',
    },
    {
        name: 'shell',
        code: '🐚',
    },
    {
        name: 'coral',
        code: '🪸',
    },
    {
        name: 'snail',
        code: '🐌',
    },
    {
        name: 'butterfly',
        code: '🦋',
    },
    {
        name: 'bug',
        code: '🐛',
    },
    {
        name: 'ant',
        code: '🐜',
    },
    {
        name: 'bee',
        code: '🐝',
    },
    {
        name: 'beetle',
        code: '🪲',
    },
    {
        name: 'lady_beetle',
        code: '🐞',
    },
    {
        name: 'cricket',
        code: '🦗',
    },
    {
        name: 'cockroach',
        code: '🪳',
    },
    {
        name: 'spider',
        code: '🕷️',
    },
    {
        name: 'spider_web',
        code: '🕸️',
    },
    {
        name: 'scorpion',
        code: '🦂',
    },
    {
        name: 'mosquito',
        code: '🦟',
    },
    {
        name: 'fly',
        code: '🪰',
    },
    {
        name: 'worm',
        code: '🪱',
    },
    {
        name: 'microbe',
        code: '🦠',
    },
    {
        name: 'bouquet',
        code: '💐',
    },
    {
        name: 'cherry_blossom',
        code: '🌸',
    },
    {
        name: 'white_flower',
        code: '💮',
    },
    {
        name: 'rosette',
        code: '🏵️',
    },
    {
        name: 'rose',
        code: '🌹',
    },
    {
        name: 'wilted_flower',
        code: '🥀',
    },
    {
        name: 'hyacinth',
        code: '🪻',
    },
    {
        name: 'lotus',
        code: '🪷',
    },
    {
        name: 'hibiscus',
        code: '🌺',
    },
    {
        name: 'sunflower',
        code: '🌻',
    },
    {
        name: 'blossom',
        code: '🌼',
    },
    {
        name: 'tulip',
        code: '🌷',
    },
    {
        name: 'seedling',
        code: '🌱',
    },
    {
        name: 'potted_plant',
        code: '🪴',
    },
    {
        name: 'evergreen_tree',
        code: '🌲',
    },
    {
        name: 'deciduous_tree',
        code: '🌳',
    },
    {
        name: 'palm_tree',
        code: '🌴',
    },
    {
        name: 'cactus',
        code: '🌵',
    },
    {
        name: 'ear_of_rice',
        code: '🌾',
    },
    {
        name: 'herb',
        code: '🌿',
    },
    {
        name: 'shamrock',
        code: '☘️',
    },
    {
        name: 'four_leaf_clover',
        code: '🍀',
    },
    {
        name: 'maple_leaf',
        code: '🍁',
    },
    {
        name: 'fallen_leaf',
        code: '🍂',
    },
    {
        name: 'leaves',
        code: '🍃',
    },
    {
        name: 'nest_with_eggs',
        code: '🪺',
    },
    {
        name: 'empty_nest',
        code: '🪹',
    },
    {
        header: true,
        icon: FoodAndDrink,
        code: 'foodAndDrink',
    },
    {
        name: 'grapes',
        code: '🍇',
    },
    {
        name: 'melon',
        code: '🍈',
    },
    {
        name: 'watermelon',
        code: '🍉',
    },
    {
        name: 'tangerine',
        code: '🍊',
    },
    {
        name: 'lemon',
        code: '🍋',
    },
    {
        name: 'banana',
        code: '🍌',
    },
    {
        name: 'pineapple',
        code: '🍍',
    },
    {
        name: 'mango',
        code: '🥭',
    },
    {
        name: 'apple',
        code: '🍎',
    },
    {
        name: 'green_apple',
        code: '🍏',
    },
    {
        name: 'pear',
        code: '🍐',
    },
    {
        name: 'peach',
        code: '🍑',
    },
    {
        name: 'cherries',
        code: '🍒',
    },
    {
        name: 'strawberry',
        code: '🍓',
    },
    {
        name: 'blueberries',
        code: '🫐',
    },
    {
        name: 'kiwi_fruit',
        code: '🥝',
    },
    {
        name: 'tomato',
        code: '🍅',
    },
    {
        name: 'olive',
        code: '🫒',
    },
    {
        name: 'coconut',
        code: '🥥',
    },
    {
        name: 'avocado',
        code: '🥑',
    },
    {
        name: 'eggplant',
        code: '🍆',
    },
    {
        name: 'potato',
        code: '🥔',
    },
    {
        name: 'carrot',
        code: '🥕',
    },
    {
        name: 'corn',
        code: '🌽',
    },
    {
        name: 'hot_pepper',
        code: '🌶️',
    },
    {
        name: 'bell_pepper',
        code: '🫑',
    },
    {
        name: 'cucumber',
        code: '🥒',
    },
    {
        name: 'leafy_green',
        code: '🥬',
    },
    {
        name: 'broccoli',
        code: '🥦',
    },
    {
        name: 'garlic',
        code: '🧄',
    },
    {
        name: 'onion',
        code: '🧅',
    },
    {
        name: 'mushroom',
        code: '🍄',
    },
    {
        name: 'peanuts',
        code: '🥜',
    },
    {
        name: 'beans',
        code: '🫘',
    },
    {
        name: 'chestnut',
        code: '🌰',
    },
    {
        name: 'bread',
        code: '🍞',
    },
    {
        name: 'croissant',
        code: '🥐',
    },
    {
        name: 'baguette_bread',
        code: '🥖',
    },
    {
        name: 'flatbread',
        code: '🫓',
    },
    {
        name: 'pretzel',
        code: '🥨',
    },
    {
        name: 'bagel',
        code: '🥯',
    },
    {
        name: 'pancakes',
        code: '🥞',
    },
    {
        name: 'waffle',
        code: '🧇',
    },
    {
        name: 'cheese',
        code: '🧀',
    },
    {
        name: 'meat_on_bone',
        code: '🍖',
    },
    {
        name: 'poultry_leg',
        code: '🍗',
    },
    {
        name: 'cut_of_meat',
        code: '🥩',
    },
    {
        name: 'bacon',
        code: '🥓',
    },
    {
        name: 'hamburger',
        code: '🍔',
    },
    {
        name: 'fries',
        code: '🍟',
    },
    {
        name: 'pizza',
        code: '🍕',
    },
    {
        name: 'hotdog',
        code: '🌭',
    },
    {
        name: 'sandwich',
        code: '🥪',
    },
    {
        name: 'taco',
        code: '🌮',
    },
    {
        name: 'burrito',
        code: '🌯',
    },
    {
        name: 'tamale',
        code: '🫔',
    },
    {
        name: 'stuffed_flatbread',
        code: '🥙',
    },
    {
        name: 'falafel',
        code: '🧆',
    },
    {
        name: 'egg',
        code: '🥚',
    },
    {
        name: 'fried_egg',
        code: '🍳',
    },
    {
        name: 'shallow_pan_of_food',
        code: '🥘',
    },
    {
        name: 'stew',
        code: '🍲',
    },
    {
        name: 'fondue',
        code: '🫕',
    },
    {
        name: 'bowl_with_spoon',
        code: '🥣',
    },
    {
        name: 'green_salad',
        code: '🥗',
    },
    {
        name: 'popcorn',
        code: '🍿',
    },
    {
        name: 'butter',
        code: '🧈',
    },
    {
        name: 'salt',
        code: '🧂',
    },
    {
        name: 'canned_food',
        code: '🥫',
    },
    {
        name: 'jar',
        code: '🫙',
    },
    {
        name: 'bento',
        code: '🍱',
    },
    {
        name: 'rice_cracker',
        code: '🍘',
    },
    {
        name: 'rice_ball',
        code: '🍙',
    },
    {
        name: 'rice',
        code: '🍚',
    },
    {
        name: 'curry',
        code: '🍛',
    },
    {
        name: 'ramen',
        code: '🍜',
    },
    {
        name: 'spaghetti',
        code: '🍝',
    },
    {
        name: 'sweet_potato',
        code: '🍠',
    },
    {
        name: 'ginger',
        code: '🫚',
    },
    {
        name: 'pea_pod',
        code: '🫛',
    },
    {
        name: 'oden',
        code: '🍢',
    },
    {
        name: 'sushi',
        code: '🍣',
    },
    {
        name: 'fried_shrimp',
        code: '🍤',
    },
    {
        name: 'fish_cake',
        code: '🍥',
    },
    {
        name: 'moon_cake',
        code: '🥮',
    },
    {
        name: 'dango',
        code: '🍡',
    },
    {
        name: 'dumpling',
        code: '🥟',
    },
    {
        name: 'fortune_cookie',
        code: '🥠',
    },
    {
        name: 'takeout_box',
        code: '🥡',
    },
    {
        name: 'crab',
        code: '🦀',
    },
    {
        name: 'lobster',
        code: '🦞',
    },
    {
        name: 'shrimp',
        code: '🦐',
    },
    {
        name: 'squid',
        code: '🦑',
    },
    {
        name: 'oyster',
        code: '🦪',
    },
    {
        name: 'icecream',
        code: '🍦',
    },
    {
        name: 'shaved_ice',
        code: '🍧',
    },
    {
        name: 'ice_cream',
        code: '🍨',
    },
    {
        name: 'doughnut',
        code: '🍩',
    },
    {
        name: 'cookie',
        code: '🍪',
    },
    {
        name: 'birthday',
        code: '🎂',
    },
    {
        name: 'cake',
        code: '🍰',
    },
    {
        name: 'cupcake',
        code: '🧁',
    },
    {
        name: 'pie',
        code: '🥧',
    },
    {
        name: 'chocolate_bar',
        code: '🍫',
    },
    {
        name: 'candy',
        code: '🍬',
    },
    {
        name: 'lollipop',
        code: '🍭',
    },
    {
        name: 'custard',
        code: '🍮',
    },
    {
        name: 'honey_pot',
        code: '🍯',
    },
    {
        name: 'baby_bottle',
        code: '🍼',
    },
    {
        name: 'milk_glass',
        code: '🥛',
    },
    {
        name: 'pouring_liquid',
        code: '🫗',
    },
    {
        name: 'coffee',
        code: '☕',
    },
    {
        name: 'teapot',
        code: '🫖',
    },
    {
        name: 'tea',
        code: '🍵',
    },
    {
        name: 'sake',
        code: '🍶',
    },
    {
        name: 'champagne',
        code: '🍾',
    },
    {
        name: 'wine_glass',
        code: '🍷',
    },
    {
        name: 'cocktail',
        code: '🍸',
    },
    {
        name: 'tropical_drink',
        code: '🍹',
    },
    {
        name: 'beer',
        code: '🍺',
    },
    {
        name: 'beers',
        code: '🍻',
    },
    {
        name: 'clinking_glasses',
        code: '🥂',
    },
    {
        name: 'tumbler_glass',
        code: '🥃',
    },
    {
        name: 'cup_with_straw',
        code: '🥤',
    },
    {
        name: 'bubble_tea',
        code: '🧋',
    },
    {
        name: 'beverage_box',
        code: '🧃',
    },
    {
        name: 'mate',
        code: '🧉',
    },
    {
        name: 'ice_cube',
        code: '🧊',
    },
    {
        name: 'chopsticks',
        code: '🥢',
    },
    {
        name: 'plate_with_cutlery',
        code: '🍽️',
    },
    {
        name: 'fork_and_knife',
        code: '🍴',
    },
    {
        name: 'spoon',
        code: '🥄',
    },
    {
        name: 'hocho',
        code: '🔪',
    },
    {
        name: 'amphora',
        code: '🏺',
    },
    {
        header: true,
        icon: TravelAndPlaces,
        code: 'travelAndPlaces',
    },
    {
        name: 'earth_africa',
        code: '🌍',
    },
    {
        name: 'earth_americas',
        code: '🌎',
    },
    {
        name: 'earth_asia',
        code: '🌏',
    },
    {
        name: 'globe_with_meridians',
        code: '🌐',
    },
    {
        name: 'world_map',
        code: '🗺️',
    },
    {
        name: 'japan',
        code: '🗾',
    },
    {
        name: 'compass',
        code: '🧭',
    },
    {
        name: 'mountain_snow',
        code: '🏔️',
    },
    {
        name: 'mountain',
        code: '⛰️',
    },
    {
        name: 'volcano',
        code: '🌋',
    },
    {
        name: 'mount_fuji',
        code: '🗻',
    },
    {
        name: 'camping',
        code: '🏕️',
    },
    {
        name: 'beach_umbrella',
        code: '🏖️',
    },
    {
        name: 'desert',
        code: '🏜️',
    },
    {
        name: 'desert_island',
        code: '🏝️',
    },
    {
        name: 'national_park',
        code: '🏞️',
    },
    {
        name: 'stadium',
        code: '🏟️',
    },
    {
        name: 'classical_building',
        code: '🏛️',
    },
    {
        name: 'building_construction',
        code: '🏗️',
    },
    {
        name: 'bricks',
        code: '🧱',
    },
    {
        name: 'rock',
        code: '🪨',
    },
    {
        name: 'wood',
        code: '🪵',
    },
    {
        name: 'hut',
        code: '🛖',
    },
    {
        name: 'houses',
        code: '🏘️',
    },
    {
        name: 'derelict_house',
        code: '🏚️',
    },
    {
        name: 'house',
        code: '🏠',
    },
    {
        name: 'house_with_garden',
        code: '🏡',
    },
    {
        name: 'office',
        code: '🏢',
    },
    {
        name: 'post_office',
        code: '🏣',
    },
    {
        name: 'european_post_office',
        code: '🏤',
    },
    {
        name: 'hospital',
        code: '🏥',
    },
    {
        name: 'bank',
        code: '🏦',
    },
    {
        name: 'hotel',
        code: '🏨',
    },
    {
        name: 'love_hotel',
        code: '🏩',
    },
    {
        name: 'convenience_store',
        code: '🏪',
    },
    {
        name: 'school',
        code: '🏫',
    },
    {
        name: 'department_store',
        code: '🏬',
    },
    {
        name: 'factory',
        code: '🏭',
    },
    {
        name: 'japanese_castle',
        code: '🏯',
    },
    {
        name: 'european_castle',
        code: '🏰',
    },
    {
        name: 'wedding',
        code: '💒',
    },
    {
        name: 'tokyo_tower',
        code: '🗼',
    },
    {
        name: 'statue_of_liberty',
        code: '🗽',
    },
    {
        name: 'church',
        code: '⛪',
    },
    {
        name: 'mosque',
        code: '🕌',
    },
    {
        name: 'hindu_temple',
        code: '🛕',
    },
    {
        name: 'synagogue',
        code: '🕍',
    },
    {
        name: 'shinto_shrine',
        code: '⛩️',
    },
    {
        name: 'kaaba',
        code: '🕋',
    },
    {
        name: 'fountain',
        code: '⛲',
    },
    {
        name: 'tent',
        code: '⛺',
    },
    {
        name: 'foggy',
        code: '🌁',
    },
    {
        name: 'night_with_stars',
        code: '🌃',
    },
    {
        name: 'cityscape',
        code: '🏙️',
    },
    {
        name: 'sunrise_over_mountains',
        code: '🌄',
    },
    {
        name: 'sunrise',
        code: '🌅',
    },
    {
        name: 'city_sunset',
        code: '🌆',
    },
    {
        name: 'city_sunrise',
        code: '🌇',
    },
    {
        name: 'bridge_at_night',
        code: '🌉',
    },
    {
        name: 'hotsprings',
        code: '♨️',
    },
    {
        name: 'carousel_horse',
        code: '🎠',
    },
    {
        name: 'ferris_wheel',
        code: '🎡',
    },
    {
        name: 'roller_coaster',
        code: '🎢',
    },
    {
        name: 'barber',
        code: '💈',
    },
    {
        name: 'circus_tent',
        code: '🎪',
    },
    {
        name: 'steam_locomotive',
        code: '🚂',
    },
    {
        name: 'railway_car',
        code: '🚃',
    },
    {
        name: 'bullettrain_side',
        code: '🚄',
    },
    {
        name: 'bullettrain_front',
        code: '🚅',
    },
    {
        name: 'train2',
        code: '🚆',
    },
    {
        name: 'metro',
        code: '🚇',
    },
    {
        name: 'light_rail',
        code: '🚈',
    },
    {
        name: 'station',
        code: '🚉',
    },
    {
        name: 'tram',
        code: '🚊',
    },
    {
        name: 'monorail',
        code: '🚝',
    },
    {
        name: 'mountain_railway',
        code: '🚞',
    },
    {
        name: 'train',
        code: '🚋',
    },
    {
        name: 'bus',
        code: '🚌',
    },
    {
        name: 'oncoming_bus',
        code: '🚍',
    },
    {
        name: 'trolleybus',
        code: '🚎',
    },
    {
        name: 'minibus',
        code: '🚐',
    },
    {
        name: 'ambulance',
        code: '🚑',
    },
    {
        name: 'fire_engine',
        code: '🚒',
    },
    {
        name: 'police_car',
        code: '🚓',
    },
    {
        name: 'oncoming_police_car',
        code: '🚔',
    },
    {
        name: 'taxi',
        code: '🚕',
    },
    {
        name: 'oncoming_taxi',
        code: '🚖',
    },
    {
        name: 'car',
        code: '🚗',
    },
    {
        name: 'oncoming_automobile',
        code: '🚘',
    },
    {
        name: 'blue_car',
        code: '🚙',
    },
    {
        name: 'pickup_truck',
        code: '🛻',
    },
    {
        name: 'truck',
        code: '🚚',
    },
    {
        name: 'articulated_lorry',
        code: '🚛',
    },
    {
        name: 'tractor',
        code: '🚜',
    },
    {
        name: 'racing_car',
        code: '🏎️',
    },
    {
        name: 'motorcycle',
        code: '🏍️',
    },
    {
        name: 'motor_scooter',
        code: '🛵',
    },
    {
        name: 'manual_wheelchair',
        code: '🦽',
    },
    {
        name: 'motorized_wheelchair',
        code: '🦼',
    },
    {
        name: 'crutch',
        code: '🩼',
    },
    {
        name: 'auto_rickshaw',
        code: '🛺',
    },
    {
        name: 'bike',
        code: '🚲',
    },
    {
        name: 'kick_scooter',
        code: '🛴',
    },
    {
        name: 'skateboard',
        code: '🛹',
    },
    {
        name: 'roller_skate',
        code: '🛼',
    },
    {
        name: 'wheel',
        code: '🛞',
    },
    {
        name: 'busstop',
        code: '🚏',
    },
    {
        name: 'motorway',
        code: '🛣️',
    },
    {
        name: 'railway_track',
        code: '🛤️',
    },
    {
        name: 'oil_drum',
        code: '🛢️',
    },
    {
        name: 'fuelpump',
        code: '⛽',
    },
    {
        name: 'rotating_light',
        code: '🚨',
    },
    {
        name: 'traffic_light',
        code: '🚥',
    },
    {
        name: 'vertical_traffic_light',
        code: '🚦',
    },
    {
        name: 'stop_sign',
        code: '🛑',
    },
    {
        name: 'construction',
        code: '🚧',
    },
    {
        name: 'anchor',
        code: '⚓',
    },
    {
        name: 'boat',
        code: '⛵',
    },
    {
        name: 'canoe',
        code: '🛶',
    },
    {
        name: 'speedboat',
        code: '🚤',
    },
    {
        name: 'passenger_ship',
        code: '🛳️',
    },
    {
        name: 'ferry',
        code: '⛴️',
    },
    {
        name: 'motor_boat',
        code: '🛥️',
    },
    {
        name: 'ship',
        code: '🚢',
    },
    {
        name: 'ring_buoy',
        code: '🛟',
    },
    {
        name: 'airplane',
        code: '✈️',
    },
    {
        name: 'small_airplane',
        code: '🛩️',
    },
    {
        name: 'flight_departure',
        code: '🛫',
    },
    {
        name: 'flight_arrival',
        code: '🛬',
    },
    {
        name: 'parachute',
        code: '🪂',
    },
    {
        name: 'seat',
        code: '💺',
    },
    {
        name: 'helicopter',
        code: '🚁',
    },
    {
        name: 'suspension_railway',
        code: '🚟',
    },
    {
        name: 'mountain_cableway',
        code: '🚠',
    },
    {
        name: 'aerial_tramway',
        code: '🚡',
    },
    {
        name: 'artificial_satellite',
        code: '🛰️',
    },
    {
        name: 'rocket',
        code: '🚀',
    },
    {
        name: 'flying_saucer',
        code: '🛸',
    },
    {
        name: 'bellhop_bell',
        code: '🛎️',
    },
    {
        name: 'luggage',
        code: '🧳',
    },
    {
        name: 'hourglass',
        code: '⌛',
    },
    {
        name: 'hourglass_flowing_sand',
        code: '⏳',
    },
    {
        name: 'watch',
        code: '⌚',
    },
    {
        name: 'alarm_clock',
        code: '⏰',
    },
    {
        name: 'stopwatch',
        code: '⏱️',
    },
    {
        name: 'timer_clock',
        code: '⏲️',
    },
    {
        name: 'mantelpiece_clock',
        code: '🕰️',
    },
    {
        name: 'clock12',
        code: '🕛',
    },
    {
        name: 'clock1230',
        code: '🕧',
    },
    {
        name: 'clock1',
        code: '🕐',
    },
    {
        name: 'clock130',
        code: '🕜',
    },
    {
        name: 'clock2',
        code: '🕑',
    },
    {
        name: 'clock230',
        code: '🕝',
    },
    {
        name: 'clock3',
        code: '🕒',
    },
    {
        name: 'clock330',
        code: '🕞',
    },
    {
        name: 'clock4',
        code: '🕓',
    },
    {
        name: 'clock430',
        code: '🕟',
    },
    {
        name: 'clock5',
        code: '🕔',
    },
    {
        name: 'clock530',
        code: '🕠',
    },
    {
        name: 'clock6',
        code: '🕕',
    },
    {
        name: 'clock630',
        code: '🕡',
    },
    {
        name: 'clock7',
        code: '🕖',
    },
    {
        name: 'clock730',
        code: '🕢',
    },
    {
        name: 'clock8',
        code: '🕗',
    },
    {
        name: 'clock830',
        code: '🕣',
    },
    {
        name: 'clock9',
        code: '🕘',
    },
    {
        name: 'clock930',
        code: '🕤',
    },
    {
        name: 'clock10',
        code: '🕙',
    },
    {
        name: 'clock1030',
        code: '🕥',
    },
    {
        name: 'clock11',
        code: '🕚',
    },
    {
        name: 'clock1130',
        code: '🕦',
    },
    {
        name: 'new_moon',
        code: '🌑',
    },
    {
        name: 'waxing_crescent_moon',
        code: '🌒',
    },
    {
        name: 'first_quarter_moon',
        code: '🌓',
    },
    {
        name: 'moon',
        code: '🌔',
    },
    {
        name: 'full_moon',
        code: '🌕',
    },
    {
        name: 'waning_gibbous_moon',
        code: '🌖',
    },
    {
        name: 'last_quarter_moon',
        code: '🌗',
    },
    {
        name: 'waning_crescent_moon',
        code: '🌘',
    },
    {
        name: 'crescent_moon',
        code: '🌙',
    },
    {
        name: 'new_moon_with_face',
        code: '🌚',
    },
    {
        name: 'first_quarter_moon_with_face',
        code: '🌛',
    },
    {
        name: 'last_quarter_moon_with_face',
        code: '🌜',
    },
    {
        name: 'thermometer',
        code: '🌡️',
    },
    {
        name: 'sunny',
        code: '☀️',
    },
    {
        name: 'full_moon_with_face',
        code: '🌝',
    },
    {
        name: 'sun_with_face',
        code: '🌞',
    },
    {
        name: 'ringed_planet',
        code: '🪐',
    },
    {
        name: 'star',
        code: '⭐',
    },
    {
        name: 'star2',
        code: '🌟',
    },
    {
        name: 'stars',
        code: '🌠',
    },
    {
        name: 'milky_way',
        code: '🌌',
    },
    {
        name: 'cloud',
        code: '☁️',
    },
    {
        name: 'partly_sunny',
        code: '⛅',
    },
    {
        name: 'cloud_with_lightning_and_rain',
        code: '⛈️',
    },
    {
        name: 'sun_behind_small_cloud',
        code: '🌤️',
    },
    {
        name: 'sun_behind_large_cloud',
        code: '🌥️',
    },
    {
        name: 'sun_behind_rain_cloud',
        code: '🌦️',
    },
    {
        name: 'cloud_with_rain',
        code: '🌧️',
    },
    {
        name: 'cloud_with_snow',
        code: '🌨️',
    },
    {
        name: 'cloud_with_lightning',
        code: '🌩️',
    },
    {
        name: 'tornado',
        code: '🌪️',
    },
    {
        name: 'fog',
        code: '🌫️',
    },
    {
        name: 'wind_face',
        code: '🌬️',
    },
    {
        name: 'cyclone',
        code: '🌀',
    },
    {
        name: 'rainbow',
        code: '🌈',
    },
    {
        name: 'closed_umbrella',
        code: '🌂',
    },
    {
        name: 'open_umbrella',
        code: '☂️',
    },
    {
        name: 'umbrella',
        code: '☔',
    },
    {
        name: 'parasol_on_ground',
        code: '⛱️',
    },
    {
        name: 'zap',
        code: '⚡',
    },
    {
        name: 'snowflake',
        code: '❄️',
    },
    {
        name: 'snowman_with_snow',
        code: '☃️',
    },
    {
        name: 'snowman',
        code: '⛄',
    },
    {
        name: 'comet',
        code: '☄️',
    },
    {
        name: 'fire',
        code: '🔥',
    },
    {
        name: 'droplet',
        code: '💧',
    },
    {
        name: 'ocean',
        code: '🌊',
    },
    {
        header: true,
        icon: Activities,
        code: 'activities',
    },
    {
        name: 'jack_o_lantern',
        code: '🎃',
    },
    {
        name: 'christmas_tree',
        code: '🎄',
    },
    {
        name: 'fireworks',
        code: '🎆',
    },
    {
        name: 'sparkler',
        code: '🎇',
    },
    {
        name: 'firecracker',
        code: '🧨',
    },
    {
        name: 'sparkles',
        code: '✨',
    },
    {
        name: 'balloon',
        code: '🎈',
    },
    {
        name: 'tada',
        code: '🎉',
    },
    {
        name: 'confetti_ball',
        code: '🎊',
    },
    {
        name: 'tanabata_tree',
        code: '🎋',
    },
    {
        name: 'bamboo',
        code: '🎍',
    },
    {
        name: 'dolls',
        code: '🎎',
    },
    {
        name: 'folding_hand_fan',
        code: '🪭',
    },
    {
        name: 'flags',
        code: '🎏',
    },
    {
        name: 'wind_chime',
        code: '🎐',
    },
    {
        name: 'mirror_ball',
        code: '🪩',
    },
    {
        name: 'rice_scene',
        code: '🎑',
    },
    {
        name: 'red_envelope',
        code: '🧧',
    },
    {
        name: 'ribbon',
        code: '🎀',
    },
    {
        name: 'gift',
        code: '🎁',
    },
    {
        name: 'reminder_ribbon',
        code: '🎗️',
    },
    {
        name: 'tickets',
        code: '🎟️',
    },
    {
        name: 'ticket',
        code: '🎫',
    },
    {
        name: 'medal_military',
        code: '🎖️',
    },
    {
        name: 'trophy',
        code: '🏆',
    },
    {
        name: 'medal_sports',
        code: '🏅',
    },
    {
        name: '1st_place_medal',
        code: '🥇',
    },
    {
        name: '2nd_place_medal',
        code: '🥈',
    },
    {
        name: '3rd_place_medal',
        code: '🥉',
    },
    {
        name: 'soccer',
        code: '⚽',
    },
    {
        name: 'baseball',
        code: '⚾',
    },
    {
        name: 'softball',
        code: '🥎',
    },
    {
        name: 'basketball',
        code: '🏀',
    },
    {
        name: 'volleyball',
        code: '🏐',
    },
    {
        name: 'football',
        code: '🏈',
    },
    {
        name: 'rugby_football',
        code: '🏉',
    },
    {
        name: 'tennis',
        code: '🎾',
    },
    {
        name: 'flying_disc',
        code: '🥏',
    },
    {
        name: 'bowling',
        code: '🎳',
    },
    {
        name: 'cricket_game',
        code: '🏏',
    },
    {
        name: 'field_hockey',
        code: '🏑',
    },
    {
        name: 'ice_hockey',
        code: '🏒',
    },
    {
        name: 'lacrosse',
        code: '🥍',
    },
    {
        name: 'ping_pong',
        code: '🏓',
    },
    {
        name: 'badminton',
        code: '🏸',
    },
    {
        name: 'boxing_glove',
        code: '🥊',
    },
    {
        name: 'martial_arts_uniform',
        code: '🥋',
    },
    {
        name: 'goal_net',
        code: '🥅',
    },
    {
        name: 'golf',
        code: '⛳',
    },
    {
        name: 'ice_skate',
        code: '⛸️',
    },
    {
        name: 'fishing_pole_and_fish',
        code: '🎣',
    },
    {
        name: 'diving_mask',
        code: '🤿',
    },
    {
        name: 'running_shirt_with_sash',
        code: '🎽',
    },
    {
        name: 'ski',
        code: '🎿',
    },
    {
        name: 'sled',
        code: '🛷',
    },
    {
        name: 'curling_stone',
        code: '🥌',
    },
    {
        name: 'dart',
        code: '🎯',
    },
    {
        name: 'yo_yo',
        code: '🪀',
    },
    {
        name: 'kite',
        code: '🪁',
    },
    {
        name: 'playground_slide',
        code: '🛝',
    },
    {
        name: '8ball',
        code: '🎱',
    },
    {
        name: 'crystal_ball',
        code: '🔮',
    },
    {
        name: 'magic_wand',
        code: '🪄',
    },
    {
        name: 'nazar_amulet',
        code: '🧿',
    },
    {
        name: 'hamsa',
        code: '🪬',
    },
    {
        name: 'video_game',
        code: '🎮',
    },
    {
        name: 'joystick',
        code: '🕹️',
    },
    {
        name: 'slot_machine',
        code: '🎰',
    },
    {
        name: 'game_die',
        code: '🎲',
    },
    {
        name: 'jigsaw',
        code: '🧩',
    },
    {
        name: 'teddy_bear',
        code: '🧸',
    },
    {
        name: 'pinata',
        code: '🪅',
    },
    {
        name: 'nesting_dolls',
        code: '🪆',
    },
    {
        name: 'spades',
        code: '♠️',
    },
    {
        name: 'hearts',
        code: '♥️',
    },
    {
        name: 'diamonds',
        code: '♦️',
    },
    {
        name: 'clubs',
        code: '♣️',
    },
    {
        name: 'chess_pawn',
        code: '♟️',
    },
    {
        name: 'black_joker',
        code: '🃏',
    },
    {
        name: 'mahjong',
        code: '🀄',
    },
    {
        name: 'flower_playing_cards',
        code: '🎴',
    },
    {
        name: 'performing_arts',
        code: '🎭',
    },
    {
        name: 'framed_picture',
        code: '🖼️',
    },
    {
        name: 'art',
        code: '🎨',
    },
    {
        name: 'thread',
        code: '🧵',
    },
    {
        name: 'sewing_needle',
        code: '🪡',
    },
    {
        name: 'yarn',
        code: '🧶',
    },
    {
        name: 'knot',
        code: '🪢',
    },
    {
        header: true,
        icon: Objects,
        code: 'objects',
    },
    {
        name: 'eyeglasses',
        code: '👓',
    },
    {
        name: 'dark_sunglasses',
        code: '🕶️',
    },
    {
        name: 'goggles',
        code: '🥽',
    },
    {
        name: 'lab_coat',
        code: '🥼',
    },
    {
        name: 'safety_vest',
        code: '🦺',
    },
    {
        name: 'necktie',
        code: '👔',
    },
    {
        name: 'shirt',
        code: '👕',
    },
    {
        name: 'jeans',
        code: '👖',
    },
    {
        name: 'scarf',
        code: '🧣',
    },
    {
        name: 'gloves',
        code: '🧤',
    },
    {
        name: 'coat',
        code: '🧥',
    },
    {
        name: 'socks',
        code: '🧦',
    },
    {
        name: 'dress',
        code: '👗',
    },
    {
        name: 'kimono',
        code: '👘',
    },
    {
        name: 'sari',
        code: '🥻',
    },
    {
        name: 'one_piece_swimsuit',
        code: '🩱',
    },
    {
        name: 'swim_brief',
        code: '🩲',
    },
    {
        name: 'shorts',
        code: '🩳',
    },
    {
        name: 'bikini',
        code: '👙',
    },
    {
        name: 'womans_clothes',
        code: '👚',
    },
    {
        name: 'purse',
        code: '👛',
    },
    {
        name: 'handbag',
        code: '👜',
    },
    {
        name: 'pouch',
        code: '👝',
    },
    {
        name: 'shopping',
        code: '🛍️',
    },
    {
        name: 'school_satchel',
        code: '🎒',
    },
    {
        name: 'thong_sandal',
        code: '🩴',
    },
    {
        name: 'mans_shoe',
        code: '👞',
    },
    {
        name: 'athletic_shoe',
        code: '👟',
    },
    {
        name: 'hiking_boot',
        code: '🥾',
    },
    {
        name: 'flat_shoe',
        code: '🥿',
    },
    {
        name: 'high_heel',
        code: '👠',
    },
    {
        name: 'sandal',
        code: '👡',
    },
    {
        name: 'ballet_shoes',
        code: '🩰',
    },
    {
        name: 'boot',
        code: '👢',
    },
    {
        name: 'crown',
        code: '👑',
    },
    {
        name: 'womans_hat',
        code: '👒',
    },
    {
        name: 'tophat',
        code: '🎩',
    },
    {
        name: 'mortar_board',
        code: '🎓',
    },
    {
        name: 'billed_cap',
        code: '🧢',
    },
    {
        name: 'military_helmet',
        code: '🪖',
    },
    {
        name: 'rescue_worker_helmet',
        code: '⛑️',
    },
    {
        name: 'prayer_beads',
        code: '📿',
    },
    {
        name: 'lipstick',
        code: '💄',
    },
    {
        name: 'ring',
        code: '💍',
    },
    {
        name: 'gem',
        code: '💎',
    },
    {
        name: 'mute',
        code: '🔇',
    },
    {
        name: 'speaker',
        code: '🔈',
    },
    {
        name: 'sound',
        code: '🔉',
    },
    {
        name: 'loud_sound',
        code: '🔊',
    },
    {
        name: 'loudspeaker',
        code: '📢',
    },
    {
        name: 'mega',
        code: '📣',
    },
    {
        name: 'postal_horn',
        code: '📯',
    },
    {
        name: 'bell',
        code: '🔔',
    },
    {
        name: 'no_bell',
        code: '🔕',
    },
    {
        name: 'musical_score',
        code: '🎼',
    },
    {
        name: 'musical_note',
        code: '🎵',
    },
    {
        name: 'notes',
        code: '🎶',
    },
    {
        name: 'studio_microphone',
        code: '🎙️',
    },
    {
        name: 'level_slider',
        code: '🎚️',
    },
    {
        name: 'control_knobs',
        code: '🎛️',
    },
    {
        name: 'microphone',
        code: '🎤',
    },
    {
        name: 'headphones',
        code: '🎧',
    },
    {
        name: 'radio',
        code: '📻',
    },
    {
        name: 'saxophone',
        code: '🎷',
    },
    {
        name: 'accordion',
        code: '🪗',
    },
    {
        name: 'guitar',
        code: '🎸',
    },
    {
        name: 'musical_keyboard',
        code: '🎹',
    },
    {
        name: 'maracas',
        code: '🪇',
    },
    {
        name: 'trumpet',
        code: '🎺',
    },
    {
        name: 'violin',
        code: '🎻',
    },
    {
        name: 'flute',
        code: '🪈',
    },
    {
        name: 'banjo',
        code: '🪕',
    },
    {
        name: 'drum',
        code: '🥁',
    },
    {
        name: 'long_drum',
        code: '🪘',
    },
    {
        name: 'iphone',
        code: '📱',
    },
    {
        name: 'calling',
        code: '📲',
    },
    {
        name: 'phone',
        code: '☎️',
    },
    {
        name: 'telephone_receiver',
        code: '📞',
    },
    {
        name: 'pager',
        code: '📟',
    },
    {
        name: 'fax',
        code: '📠',
    },
    {
        name: 'battery',
        code: '🔋',
    },
    {
        name: 'low_battery',
        code: '🪫',
    },
    {
        name: 'electric_plug',
        code: '🔌',
    },
    {
        name: 'computer',
        code: '💻',
    },
    {
        name: 'desktop_computer',
        code: '🖥️',
    },
    {
        name: 'printer',
        code: '🖨️',
    },
    {
        name: 'keyboard',
        code: '⌨️',
    },
    {
        name: 'computer_mouse',
        code: '🖱️',
    },
    {
        name: 'trackball',
        code: '🖲️',
    },
    {
        name: 'minidisc',
        code: '💽',
    },
    {
        name: 'floppy_disk',
        code: '💾',
    },
    {
        name: 'cd',
        code: '💿',
    },
    {
        name: 'dvd',
        code: '📀',
    },
    {
        name: 'abacus',
        code: '🧮',
    },
    {
        name: 'movie_camera',
        code: '🎥',
    },
    {
        name: 'film_strip',
        code: '🎞️',
    },
    {
        name: 'film_projector',
        code: '📽️',
    },
    {
        name: 'clapper',
        code: '🎬',
    },
    {
        name: 'tv',
        code: '📺',
    },
    {
        name: 'camera',
        code: '📷',
    },
    {
        name: 'camera_flash',
        code: '📸',
    },
    {
        name: 'video_camera',
        code: '📹',
    },
    {
        name: 'vhs',
        code: '📼',
    },
    {
        name: 'mag',
        code: '🔍',
    },
    {
        name: 'mag_right',
        code: '🔎',
    },
    {
        name: 'candle',
        code: '🕯️',
    },
    {
        name: 'bulb',
        code: '💡',
    },
    {
        name: 'flashlight',
        code: '🔦',
    },
    {
        name: 'izakaya_lantern',
        code: '🏮',
    },
    {
        name: 'diya_lamp',
        code: '🪔',
    },
    {
        name: 'notebook_with_decorative_cover',
        code: '📔',
    },
    {
        name: 'closed_book',
        code: '📕',
    },
    {
        name: 'book',
        code: '📖',
    },
    {
        name: 'green_book',
        code: '📗',
    },
    {
        name: 'blue_book',
        code: '📘',
    },
    {
        name: 'orange_book',
        code: '📙',
    },
    {
        name: 'books',
        code: '📚',
    },
    {
        name: 'notebook',
        code: '📓',
    },
    {
        name: 'ledger',
        code: '📒',
    },
    {
        name: 'page_with_curl',
        code: '📃',
    },
    {
        name: 'scroll',
        code: '📜',
    },
    {
        name: 'page_facing_up',
        code: '📄',
    },
    {
        name: 'newspaper',
        code: '📰',
    },
    {
        name: 'newspaper_roll',
        code: '🗞️',
    },
    {
        name: 'bookmark_tabs',
        code: '📑',
    },
    {
        name: 'bookmark',
        code: '🔖',
    },
    {
        name: 'label',
        code: '🏷️',
    },
    {
        name: 'moneybag',
        code: '💰',
    },
    {
        name: 'coin',
        code: '🪙',
    },
    {
        name: 'yen',
        code: '💴',
    },
    {
        name: 'dollar',
        code: '💵',
    },
    {
        name: 'euro',
        code: '💶',
    },
    {
        name: 'pound',
        code: '💷',
    },
    {
        name: 'money_with_wings',
        code: '💸',
    },
    {
        name: 'credit_card',
        code: '💳',
    },
    {
        name: 'identification_card',
        code: '🪪',
    },
    {
        name: 'receipt',
        code: '🧾',
    },
    {
        name: 'chart',
        code: '💹',
    },
    {
        name: 'envelope',
        code: '✉️',
    },
    {
        name: 'email',
        code: '📧',
    },
    {
        name: 'incoming_envelope',
        code: '📨',
    },
    {
        name: 'envelope_with_arrow',
        code: '📩',
    },
    {
        name: 'outbox_tray',
        code: '📤',
    },
    {
        name: 'inbox_tray',
        code: '📥',
    },
    {
        name: 'package',
        code: '📦',
    },
    {
        name: 'mailbox',
        code: '📫',
    },
    {
        name: 'mailbox_closed',
        code: '📪',
    },
    {
        name: 'mailbox_with_mail',
        code: '📬',
    },
    {
        name: 'mailbox_with_no_mail',
        code: '📭',
    },
    {
        name: 'postbox',
        code: '📮',
    },
    {
        name: 'ballot_box',
        code: '🗳️',
    },
    {
        name: 'pencil2',
        code: '✏️',
    },
    {
        name: 'black_nib',
        code: '✒️',
    },
    {
        name: 'fountain_pen',
        code: '🖋️',
    },
    {
        name: 'pen',
        code: '🖊️',
    },
    {
        name: 'paintbrush',
        code: '🖌️',
    },
    {
        name: 'crayon',
        code: '🖍️',
    },
    {
        name: 'memo',
        code: '📝',
    },
    {
        name: 'briefcase',
        code: '💼',
    },
    {
        name: 'file_folder',
        code: '📁',
    },
    {
        name: 'open_file_folder',
        code: '📂',
    },
    {
        name: 'card_index_dividers',
        code: '🗂️',
    },
    {
        name: 'date',
        code: '📅',
    },
    {
        name: 'calendar',
        code: '📆',
    },
    {
        name: 'spiral_notepad',
        code: '🗒️',
    },
    {
        name: 'spiral_calendar',
        code: '🗓️',
    },
    {
        name: 'card_index',
        code: '📇',
    },
    {
        name: 'chart_with_upwards_trend',
        code: '📈',
    },
    {
        name: 'chart_with_downwards_trend',
        code: '📉',
    },
    {
        name: 'bar_chart',
        code: '📊',
    },
    {
        name: 'clipboard',
        code: '📋',
    },
    {
        name: 'pushpin',
        code: '📌',
    },
    {
        name: 'round_pushpin',
        code: '📍',
    },
    {
        name: 'paperclip',
        code: '📎',
    },
    {
        name: 'paperclips',
        code: '🖇️',
    },
    {
        name: 'straight_ruler',
        code: '📏',
    },
    {
        name: 'triangular_ruler',
        code: '📐',
    },
    {
        name: 'scissors',
        code: '✂️',
    },
    {
        name: 'card_file_box',
        code: '🗃️',
    },
    {
        name: 'file_cabinet',
        code: '🗄️',
    },
    {
        name: 'wastebasket',
        code: '🗑️',
    },
    {
        name: 'lock',
        code: '🔒',
    },
    {
        name: 'unlock',
        code: '🔓',
    },
    {
        name: 'lock_with_ink_pen',
        code: '🔏',
    },
    {
        name: 'closed_lock_with_key',
        code: '🔐',
    },
    {
        name: 'key',
        code: '🔑',
    },
    {
        name: 'old_key',
        code: '🗝️',
    },
    {
        name: 'hammer',
        code: '🔨',
    },
    {
        name: 'axe',
        code: '🪓',
    },
    {
        name: 'pick',
        code: '⛏️',
    },
    {
        name: 'hammer_and_pick',
        code: '⚒️',
    },
    {
        name: 'hammer_and_wrench',
        code: '🛠️',
    },
    {
        name: 'dagger',
        code: '🗡️',
    },
    {
        name: 'crossed_swords',
        code: '⚔️',
    },
    {
        name: 'gun',
        code: '🔫',
    },
    {
        name: 'boomerang',
        code: '🪃',
    },
    {
        name: 'bow_and_arrow',
        code: '🏹',
    },
    {
        name: 'shield',
        code: '🛡️',
    },
    {
        name: 'carpentry_saw',
        code: '🪚',
    },
    {
        name: 'wrench',
        code: '🔧',
    },
    {
        name: 'screwdriver',
        code: '🪛',
    },
    {
        name: 'nut_and_bolt',
        code: '🔩',
    },
    {
        name: 'gear',
        code: '⚙️',
    },
    {
        name: 'clamp',
        code: '🗜️',
    },
    {
        name: 'balance_scale',
        code: '⚖️',
    },
    {
        name: 'probing_cane',
        code: '🦯',
    },
    {
        name: 'link',
        code: '🔗',
    },
    {
        name: 'chains',
        code: '⛓️',
    },
    {
        name: 'hook',
        code: '🪝',
    },
    {
        name: 'toolbox',
        code: '🧰',
    },
    {
        name: 'magnet',
        code: '🧲',
    },
    {
        name: 'ladder',
        code: '🪜',
    },
    {
        name: 'alembic',
        code: '⚗️',
    },
    {
        name: 'test_tube',
        code: '🧪',
    },
    {
        name: 'petri_dish',
        code: '🧫',
    },
    {
        name: 'dna',
        code: '🧬',
    },
    {
        name: 'microscope',
        code: '🔬',
    },
    {
        name: 'telescope',
        code: '🔭',
    },
    {
        name: 'x_ray',
        code: '🩻',
    },
    {
        name: 'satellite',
        code: '📡',
    },
    {
        name: 'syringe',
        code: '💉',
    },
    {
        name: 'drop_of_blood',
        code: '🩸',
    },
    {
        name: 'pill',
        code: '💊',
    },
    {
        name: 'adhesive_bandage',
        code: '🩹',
    },
    {
        name: 'stethoscope',
        code: '🩺',
    },
    {
        name: 'door',
        code: '🚪',
    },
    {
        name: 'elevator',
        code: '🛗',
    },
    {
        name: 'mirror',
        code: '🪞',
    },
    {
        name: 'window',
        code: '🪟',
    },
    {
        name: 'bed',
        code: '🛏️',
    },
    {
        name: 'couch_and_lamp',
        code: '🛋️',
    },
    {
        name: 'chair',
        code: '🪑',
    },
    {
        name: 'toilet',
        code: '🚽',
    },
    {
        name: 'plunger',
        code: '🪠',
    },
    {
        name: 'shower',
        code: '🚿',
    },
    {
        name: 'bathtub',
        code: '🛁',
    },
    {
        name: 'mouse_trap',
        code: '🪤',
    },
    {
        name: 'razor',
        code: '🪒',
    },
    {
        name: 'hair_pick',
        code: '🪮',
    },
    {
        name: 'lotion_bottle',
        code: '🧴',
    },
    {
        name: 'safety_pin',
        code: '🧷',
    },
    {
        name: 'broom',
        code: '🧹',
    },
    {
        name: 'basket',
        code: '🧺',
    },
    {
        name: 'roll_of_paper',
        code: '🧻',
    },
    {
        name: 'bucket',
        code: '🪣',
    },
    {
        name: 'soap',
        code: '🧼',
    },
    {
        name: 'toothbrush',
        code: '🪥',
    },
    {
        name: 'sponge',
        code: '🧽',
    },
    {
        name: 'fire_extinguisher',
        code: '🧯',
    },
    {
        name: 'shopping_cart',
        code: '🛒',
    },
    {
        name: 'smoking',
        code: '🚬',
    },
    {
        name: 'coffin',
        code: '⚰️',
    },
    {
        name: 'headstone',
        code: '🪦',
    },
    {
        name: 'funeral_urn',
        code: '⚱️',
    },
    {
        name: 'moyai',
        code: '🗿',
    },
    {
        name: 'placard',
        code: '🪧',
    },
    {
        header: true,
        icon: Symbols,
        code: 'symbols',
    },
    {
        name: 'atm',
        code: '🏧',
    },
    {
        name: 'put_litter_in_its_place',
        code: '🚮',
    },
    {
        name: 'potable_water',
        code: '🚰',
    },
    {
        name: 'wheelchair',
        code: '♿',
    },
    {
        name: 'mens',
        code: '🚹',
    },
    {
        name: 'womens',
        code: '🚺',
    },
    {
        name: 'restroom',
        code: '🚻',
    },
    {
        name: 'baby_symbol',
        code: '🚼',
    },
    {
        name: 'wc',
        code: '🚾',
    },
    {
        name: 'passport_control',
        code: '🛂',
    },
    {
        name: 'customs',
        code: '🛃',
    },
    {
        name: 'baggage_claim',
        code: '🛄',
    },
    {
        name: 'left_luggage',
        code: '🛅',
    },
    {
        name: 'wireless',
        code: '🛜',
    },
    {
        name: 'warning',
        code: '⚠️',
    },
    {
        name: 'children_crossing',
        code: '🚸',
    },
    {
        name: 'no_entry',
        code: '⛔',
    },
    {
        name: 'no_entry_sign',
        code: '🚫',
    },
    {
        name: 'no_bicycles',
        code: '🚳',
    },
    {
        name: 'no_smoking',
        code: '🚭',
    },
    {
        name: 'do_not_litter',
        code: '🚯',
    },
    {
        name: 'non-potable_water',
        code: '🚱',
    },
    {
        name: 'no_pedestrians',
        code: '🚷',
    },
    {
        name: 'no_mobile_phones',
        code: '📵',
    },
    {
        name: 'underage',
        code: '🔞',
    },
    {
        name: 'radioactive',
        code: '☢️',
    },
    {
        name: 'biohazard',
        code: '☣️',
    },
    {
        name: 'arrow_up',
        code: '⬆️',
    },
    {
        name: 'arrow_upper_right',
        code: '↗️',
    },
    {
        name: 'arrow_right',
        code: '➡️',
    },
    {
        name: 'arrow_lower_right',
        code: '↘️',
    },
    {
        name: 'arrow_down',
        code: '⬇️',
    },
    {
        name: 'arrow_lower_left',
        code: '↙️',
    },
    {
        name: 'arrow_left',
        code: '⬅️',
    },
    {
        name: 'arrow_upper_left',
        code: '↖️',
    },
    {
        name: 'arrow_up_down',
        code: '↕️',
    },
    {
        name: 'left_right_arrow',
        code: '↔️',
    },
    {
        name: 'leftwards_arrow_with_hook',
        code: '↩️',
    },
    {
        name: 'arrow_right_hook',
        code: '↪️',
    },
    {
        name: 'arrow_heading_up',
        code: '⤴️',
    },
    {
        name: 'arrow_heading_down',
        code: '⤵️',
    },
    {
        name: 'arrows_clockwise',
        code: '🔃',
    },
    {
        name: 'arrows_counterclockwise',
        code: '🔄',
    },
    {
        name: 'back',
        code: '🔙',
    },
    {
        name: 'end',
        code: '🔚',
    },
    {
        name: 'on',
        code: '🔛',
    },
    {
        name: 'soon',
        code: '🔜',
    },
    {
        name: 'top',
        code: '🔝',
    },
    {
        name: 'place_of_worship',
        code: '🛐',
    },
    {
        name: 'atom_symbol',
        code: '⚛️',
    },
    {
        name: 'om',
        code: '🕉️',
    },
    {
        name: 'star_of_david',
        code: '✡️',
    },
    {
        name: 'wheel_of_dharma',
        code: '☸️',
    },
    {
        name: 'khanda',
        code: '🪯',
    },
    {
        name: 'yin_yang',
        code: '☯️',
    },
    {
        name: 'latin_cross',
        code: '✝️',
    },
    {
        name: 'orthodox_cross',
        code: '☦️',
    },
    {
        name: 'star_and_crescent',
        code: '☪️',
    },
    {
        name: 'peace_symbol',
        code: '☮️',
    },
    {
        name: 'menorah',
        code: '🕎',
    },
    {
        name: 'six_pointed_star',
        code: '🔯',
    },
    {
        name: 'aries',
        code: '♈',
    },
    {
        name: 'taurus',
        code: '♉',
    },
    {
        name: 'gemini',
        code: '♊',
    },
    {
        name: 'cancer',
        code: '♋',
    },
    {
        name: 'leo',
        code: '♌',
    },
    {
        name: 'virgo',
        code: '♍',
    },
    {
        name: 'libra',
        code: '♎',
    },
    {
        name: 'scorpius',
        code: '♏',
    },
    {
        name: 'sagittarius',
        code: '♐',
    },
    {
        name: 'capricorn',
        code: '♑',
    },
    {
        name: 'aquarius',
        code: '♒',
    },
    {
        name: 'pisces',
        code: '♓',
    },
    {
        name: 'ophiuchus',
        code: '⛎',
    },
    {
        name: 'twisted_rightwards_arrows',
        code: '🔀',
    },
    {
        name: 'repeat',
        code: '🔁',
    },
    {
        name: 'repeat_one',
        code: '🔂',
    },
    {
        name: 'arrow_forward',
        code: '▶️',
    },
    {
        name: 'fast_forward',
        code: '⏩',
    },
    {
        name: 'next_track_button',
        code: '⏭️',
    },
    {
        name: 'play_or_pause_button',
        code: '⏯️',
    },
    {
        name: 'arrow_backward',
        code: '◀️',
    },
    {
        name: 'rewind',
        code: '⏪',
    },
    {
        name: 'previous_track_button',
        code: '⏮️',
    },
    {
        name: 'arrow_up_small',
        code: '🔼',
    },
    {
        name: 'arrow_double_up',
        code: '⏫',
    },
    {
        name: 'arrow_down_small',
        code: '🔽',
    },
    {
        name: 'arrow_double_down',
        code: '⏬',
    },
    {
        name: 'pause_button',
        code: '⏸️',
    },
    {
        name: 'stop_button',
        code: '⏹️',
    },
    {
        name: 'record_button',
        code: '⏺️',
    },
    {
        name: 'eject_button',
        code: '⏏️',
    },
    {
        name: 'cinema',
        code: '🎦',
    },
    {
        name: 'low_brightness',
        code: '🔅',
    },
    {
        name: 'high_brightness',
        code: '🔆',
    },
    {
        name: 'signal_strength',
        code: '📶',
    },
    {
        name: 'vibration_mode',
        code: '📳',
    },
    {
        name: 'mobile_phone_off',
        code: '📴',
    },
    {
        name: 'female_sign',
        code: '♀️',
    },
    {
        name: 'male_sign',
        code: '♂️',
    },
    {
        name: 'transgender_symbol',
        code: '⚧️',
    },
    {
        name: 'heavy_multiplication_x',
        code: '✖️',
    },
    {
        name: 'heavy_plus_sign',
        code: '➕',
    },
    {
        name: 'heavy_minus_sign',
        code: '➖',
    },
    {
        name: 'heavy_division_sign',
        code: '➗',
    },
    {
        name: 'heavy_equals_sign',
        code: '🟰',
    },
    {
        name: 'infinity',
        code: '♾️',
    },
    {
        name: 'bangbang',
        code: '‼️',
    },
    {
        name: 'interrobang',
        code: '⁉️',
    },
    {
        name: 'question',
        code: '❓',
    },
    {
        name: 'grey_question',
        code: '❔',
    },
    {
        name: 'grey_exclamation',
        code: '❕',
    },
    {
        name: 'exclamation',
        code: '❗',
    },
    {
        name: 'wavy_dash',
        code: '〰️',
    },
    {
        name: 'currency_exchange',
        code: '💱',
    },
    {
        name: 'heavy_dollar_sign',
        code: '💲',
    },
    {
        name: 'medical_symbol',
        code: '⚕️',
    },
    {
        name: 'recycle',
        code: '♻️',
    },
    {
        name: 'fleur_de_lis',
        code: '⚜️',
    },
    {
        name: 'trident',
        code: '🔱',
    },
    {
        name: 'name_badge',
        code: '📛',
    },
    {
        name: 'beginner',
        code: '🔰',
    },
    {
        name: 'o',
        code: '⭕',
    },
    {
        name: 'white_check_mark',
        code: '✅',
    },
    {
        name: 'ballot_box_with_check',
        code: '☑️',
    },
    {
        name: 'heavy_check_mark',
        code: '✔️',
    },
    {
        name: 'x',
        code: '❌',
    },
    {
        name: 'negative_squared_cross_mark',
        code: '❎',
    },
    {
        name: 'curly_loop',
        code: '➰',
    },
    {
        name: 'loop',
        code: '➿',
    },
    {
        name: 'part_alternation_mark',
        code: '〽️',
    },
    {
        name: 'eight_spoked_asterisk',
        code: '✳️',
    },
    {
        name: 'eight_pointed_black_star',
        code: '✴️',
    },
    {
        name: 'sparkle',
        code: '❇️',
    },
    {
        name: 'copyright',
        code: '©️',
    },
    {
        name: 'registered',
        code: '®️',
    },
    {
        name: 'tm',
        code: '™️',
    },
    {
        name: 'hash',
        code: '#️⃣',
    },
    {
        name: 'asterisk',
        code: '*️⃣',
    },
    {
        name: 'zero',
        code: '0️⃣',
    },
    {
        name: 'one',
        code: '1️⃣',
    },
    {
        name: 'two',
        code: '2️⃣',
    },
    {
        name: 'three',
        code: '3️⃣',
    },
    {
        name: 'four',
        code: '4️⃣',
    },
    {
        name: 'five',
        code: '5️⃣',
    },
    {
        name: 'six',
        code: '6️⃣',
    },
    {
        name: 'seven',
        code: '7️⃣',
    },
    {
        name: 'eight',
        code: '8️⃣',
    },
    {
        name: 'nine',
        code: '9️⃣',
    },
    {
        name: 'keycap_ten',
        code: '🔟',
    },
    {
        name: 'capital_abcd',
        code: '🔠',
    },
    {
        name: 'abcd',
        code: '🔡',
    },
    {
        name: '1234',
        code: '🔢',
    },
    {
        name: 'symbols',
        code: '🔣',
    },
    {
        name: 'abc',
        code: '🔤',
    },
    {
        name: 'a',
        code: '🅰️',
    },
    {
        name: 'ab',
        code: '🆎',
    },
    {
        name: 'b',
        code: '🅱️',
    },
    {
        name: 'cl',
        code: '🆑',
    },
    {
        name: 'cool',
        code: '🆒',
    },
    {
        name: 'free',
        code: '🆓',
    },
    {
        name: 'information_source',
        code: 'ℹ️',
    },
    {
        name: 'id',
        code: '🆔',
    },
    {
        name: 'm',
        code: 'Ⓜ️',
    },
    {
        name: 'new',
        code: '🆕',
    },
    {
        name: 'ng',
        code: '🆖',
    },
    {
        name: 'o2',
        code: '🅾️',
    },
    {
        name: 'ok',
        code: '🆗',
    },
    {
        name: 'parking',
        code: '🅿️',
    },
    {
        name: 'sos',
        code: '🆘',
    },
    {
        name: 'up',
        code: '🆙',
    },
    {
        name: 'vs',
        code: '🆚',
    },
    {
        name: 'koko',
        code: '🈁',
    },
    {
        name: 'sa',
        code: '🈂️',
    },
    {
        name: 'u6708',
        code: '🈷️',
    },
    {
        name: 'u6709',
        code: '🈶',
    },
    {
        name: 'u6307',
        code: '🈯',
    },
    {
        name: 'ideograph_advantage',
        code: '🉐',
    },
    {
        name: 'u5272',
        code: '🈹',
    },
    {
        name: 'u7121',
        code: '🈚',
    },
    {
        name: 'u7981',
        code: '🈲',
    },
    {
        name: 'accept',
        code: '🉑',
    },
    {
        name: 'u7533',
        code: '🈸',
    },
    {
        name: 'u5408',
        code: '🈴',
    },
    {
        name: 'u7a7a',
        code: '🈳',
    },
    {
        name: 'congratulations',
        code: '㊗️',
    },
    {
        name: 'secret',
        code: '㊙️',
    },
    {
        name: 'u55b6',
        code: '🈺',
    },
    {
        name: 'u6e80',
        code: '🈵',
    },
    {
        name: 'red_circle',
        code: '🔴',
    },
    {
        name: 'orange_circle',
        code: '🟠',
    },
    {
        name: 'yellow_circle',
        code: '🟡',
    },
    {
        name: 'green_circle',
        code: '🟢',
    },
    {
        name: 'large_blue_circle',
        code: '🔵',
    },
    {
        name: 'purple_circle',
        code: '🟣',
    },
    {
        name: 'brown_circle',
        code: '🟤',
    },
    {
        name: 'black_circle',
        code: '⚫',
    },
    {
        name: 'white_circle',
        code: '⚪',
    },
    {
        name: 'red_square',
        code: '🟥',
    },
    {
        name: 'orange_square',
        code: '🟧',
    },
    {
        name: 'yellow_square',
        code: '🟨',
    },
    {
        name: 'green_square',
        code: '🟩',
    },
    {
        name: 'blue_square',
        code: '🟦',
    },
    {
        name: 'purple_square',
        code: '🟪',
    },
    {
        name: 'brown_square',
        code: '🟫',
    },
    {
        name: 'black_large_square',
        code: '⬛',
    },
    {
        name: 'white_large_square',
        code: '⬜',
    },
    {
        name: 'black_medium_square',
        code: '◼️',
    },
    {
        name: 'white_medium_square',
        code: '◻️',
    },
    {
        name: 'black_medium_small_square',
        code: '◾',
    },
    {
        name: 'white_medium_small_square',
        code: '◽',
    },
    {
        name: 'black_small_square',
        code: '▪️',
    },
    {
        name: 'white_small_square',
        code: '▫️',
    },
    {
        name: 'large_orange_diamond',
        code: '🔶',
    },
    {
        name: 'large_blue_diamond',
        code: '🔷',
    },
    {
        name: 'small_orange_diamond',
        code: '🔸',
    },
    {
        name: 'small_blue_diamond',
        code: '🔹',
    },
    {
        name: 'small_red_triangle',
        code: '🔺',
    },
    {
        name: 'small_red_triangle_down',
        code: '🔻',
    },
    {
        name: 'diamond_shape_with_a_dot_inside',
        code: '💠',
    },
    {
        name: 'radio_button',
        code: '🔘',
    },
    {
        name: 'white_square_button',
        code: '🔳',
    },
    {
        name: 'black_square_button',
        code: '🔲',
    },
    {
        header: true,
        icon: Flags,
        code: 'flags',
    },
    {
        name: 'checkered_flag',
        code: '🏁',
    },
    {
        name: 'triangular_flag_on_post',
        code: '🚩',
    },
    {
        name: 'crossed_flags',
        code: '🎌',
    },
    {
        name: 'black_flag',
        code: '🏴',
    },
    {
        name: 'white_flag',
        code: '🏳️',
    },
    {
        name: 'rainbow_flag',
        code: '🏳️‍🌈',
    },
    {
        name: 'transgender_flag',
        code: '🏳️‍⚧️',
    },
    {
        name: 'pirate_flag',
        code: '🏴‍☠️',
    },
    {
        name: 'ascension_island',
        code: '🇦🇨',
    },
    {
        name: 'andorra',
        code: '🇦🇩',
    },
    {
        name: 'united_arab_emirates',
        code: '🇦🇪',
    },
    {
        name: 'afghanistan',
        code: '🇦🇫',
    },
    {
        name: 'antigua_barbuda',
        code: '🇦🇬',
    },
    {
        name: 'anguilla',
        code: '🇦🇮',
    },
    {
        name: 'albania',
        code: '🇦🇱',
    },
    {
        name: 'armenia',
        code: '🇦🇲',
    },
    {
        name: 'angola',
        code: '🇦🇴',
    },
    {
        name: 'antarctica',
        code: '🇦🇶',
    },
    {
        name: 'argentina',
        code: '🇦🇷',
    },
    {
        name: 'american_samoa',
        code: '🇦🇸',
    },
    {
        name: 'austria',
        code: '🇦🇹',
    },
    {
        name: 'australia',
        code: '🇦🇺',
    },
    {
        name: 'aruba',
        code: '🇦🇼',
    },
    {
        name: 'aland_islands',
        code: '🇦🇽',
    },
    {
        name: 'azerbaijan',
        code: '🇦🇿',
    },
    {
        name: 'bosnia_herzegovina',
        code: '🇧🇦',
    },
    {
        name: 'barbados',
        code: '🇧🇧',
    },
    {
        name: 'bangladesh',
        code: '🇧🇩',
    },
    {
        name: 'belgium',
        code: '🇧🇪',
    },
    {
        name: 'burkina_faso',
        code: '🇧🇫',
    },
    {
        name: 'bulgaria',
        code: '🇧🇬',
    },
    {
        name: 'bahrain',
        code: '🇧🇭',
    },
    {
        name: 'burundi',
        code: '🇧🇮',
    },
    {
        name: 'benin',
        code: '🇧🇯',
    },
    {
        name: 'st_barthelemy',
        code: '🇧🇱',
    },
    {
        name: 'bermuda',
        code: '🇧🇲',
    },
    {
        name: 'brunei',
        code: '🇧🇳',
    },
    {
        name: 'bolivia',
        code: '🇧🇴',
    },
    {
        name: 'caribbean_netherlands',
        code: '🇧🇶',
    },
    {
        name: 'brazil',
        code: '🇧🇷',
    },
    {
        name: 'bahamas',
        code: '🇧🇸',
    },
    {
        name: 'bhutan',
        code: '🇧🇹',
    },
    {
        name: 'bouvet_island',
        code: '🇧🇻',
    },
    {
        name: 'botswana',
        code: '🇧🇼',
    },
    {
        name: 'belarus',
        code: '🇧🇾',
    },
    {
        name: 'belize',
        code: '🇧🇿',
    },
    {
        name: 'canada',
        code: '🇨🇦',
    },
    {
        name: 'cocos_islands',
        code: '🇨🇨',
    },
    {
        name: 'congo_kinshasa',
        code: '🇨🇩',
    },
    {
        name: 'central_african_republic',
        code: '🇨🇫',
    },
    {
        name: 'congo_brazzaville',
        code: '🇨🇬',
    },
    {
        name: 'switzerland',
        code: '🇨🇭',
    },
    {
        name: 'cote_divoire',
        code: '🇨🇮',
    },
    {
        name: 'cook_islands',
        code: '🇨🇰',
    },
    {
        name: 'chile',
        code: '🇨🇱',
    },
    {
        name: 'cameroon',
        code: '🇨🇲',
    },
    {
        name: 'cn',
        code: '🇨🇳',
    },
    {
        name: 'colombia',
        code: '🇨🇴',
    },
    {
        name: 'clipperton_island',
        code: '🇨🇵',
    },
    {
        name: 'costa_rica',
        code: '🇨🇷',
    },
    {
        name: 'cuba',
        code: '🇨🇺',
    },
    {
        name: 'cape_verde',
        code: '🇨🇻',
    },
    {
        name: 'curacao',
        code: '🇨🇼',
    },
    {
        name: 'christmas_island',
        code: '🇨🇽',
    },
    {
        name: 'cyprus',
        code: '🇨🇾',
    },
    {
        name: 'czech_republic',
        code: '🇨🇿',
    },
    {
        name: 'de',
        code: '🇩🇪',
    },
    {
        name: 'diego_garcia',
        code: '🇩🇬',
    },
    {
        name: 'djibouti',
        code: '🇩🇯',
    },
    {
        name: 'denmark',
        code: '🇩🇰',
    },
    {
        name: 'dominica',
        code: '🇩🇲',
    },
    {
        name: 'dominican_republic',
        code: '🇩🇴',
    },
    {
        name: 'algeria',
        code: '🇩🇿',
    },
    {
        name: 'ceuta_melilla',
        code: '🇪🇦',
    },
    {
        name: 'ecuador',
        code: '🇪🇨',
    },
    {
        name: 'estonia',
        code: '🇪🇪',
    },
    {
        name: 'egypt',
        code: '🇪🇬',
    },
    {
        name: 'western_sahara',
        code: '🇪🇭',
    },
    {
        name: 'eritrea',
        code: '🇪🇷',
    },
    {
        name: 'es',
        code: '🇪🇸',
    },
    {
        name: 'ethiopia',
        code: '🇪🇹',
    },
    {
        name: 'eu',
        code: '🇪🇺',
    },
    {
        name: 'finland',
        code: '🇫🇮',
    },
    {
        name: 'fiji',
        code: '🇫🇯',
    },
    {
        name: 'falkland_islands',
        code: '🇫🇰',
    },
    {
        name: 'micronesia',
        code: '🇫🇲',
    },
    {
        name: 'faroe_islands',
        code: '🇫🇴',
    },
    {
        name: 'fr',
        code: '🇫🇷',
    },
    {
        name: 'gabon',
        code: '🇬🇦',
    },
    {
        name: 'gb',
        code: '🇬🇧',
    },
    {
        name: 'grenada',
        code: '🇬🇩',
    },
    {
        name: 'georgia',
        code: '🇬🇪',
    },
    {
        name: 'french_guiana',
        code: '🇬🇫',
    },
    {
        name: 'guernsey',
        code: '🇬🇬',
    },
    {
        name: 'ghana',
        code: '🇬🇭',
    },
    {
        name: 'gibraltar',
        code: '🇬🇮',
    },
    {
        name: 'greenland',
        code: '🇬🇱',
    },
    {
        name: 'gambia',
        code: '🇬🇲',
    },
    {
        name: 'guinea',
        code: '🇬🇳',
    },
    {
        name: 'guadeloupe',
        code: '🇬🇵',
    },
    {
        name: 'equatorial_guinea',
        code: '🇬🇶',
    },
    {
        name: 'greece',
        code: '🇬🇷',
    },
    {
        name: 'south_georgia_south_sandwich_islands',
        code: '🇬🇸',
    },
    {
        name: 'guatemala',
        code: '🇬🇹',
    },
    {
        name: 'guam',
        code: '🇬🇺',
    },
    {
        name: 'guinea_bissau',
        code: '🇬🇼',
    },
    {
        name: 'guyana',
        code: '🇬🇾',
    },
    {
        name: 'hong_kong',
        code: '🇭🇰',
    },
    {
        name: 'heard_mcdonald_islands',
        code: '🇭🇲',
    },
    {
        name: 'honduras',
        code: '🇭🇳',
    },
    {
        name: 'croatia',
        code: '🇭🇷',
    },
    {
        name: 'haiti',
        code: '🇭🇹',
    },
    {
        name: 'hungary',
        code: '🇭🇺',
    },
    {
        name: 'canary_islands',
        code: '🇮🇨',
    },
    {
        name: 'indonesia',
        code: '🇮🇩',
    },
    {
        name: 'ireland',
        code: '🇮🇪',
    },
    {
        name: 'israel',
        code: '🇮🇱',
    },
    {
        name: 'isle_of_man',
        code: '🇮🇲',
    },
    {
        name: 'india',
        code: '🇮🇳',
    },
    {
        name: 'british_indian_ocean_territory',
        code: '🇮🇴',
    },
    {
        name: 'iraq',
        code: '🇮🇶',
    },
    {
        name: 'iran',
        code: '🇮🇷',
    },
    {
        name: 'iceland',
        code: '🇮🇸',
    },
    {
        name: 'it',
        code: '🇮🇹',
    },
    {
        name: 'jersey',
        code: '🇯🇪',
    },
    {
        name: 'jamaica',
        code: '🇯🇲',
    },
    {
        name: 'jordan',
        code: '🇯🇴',
    },
    {
        name: 'jp',
        code: '🇯🇵',
    },
    {
        name: 'kenya',
        code: '🇰🇪',
    },
    {
        name: 'kyrgyzstan',
        code: '🇰🇬',
    },
    {
        name: 'cambodia',
        code: '🇰🇭',
    },
    {
        name: 'kiribati',
        code: '🇰🇮',
    },
    {
        name: 'comoros',
        code: '🇰🇲',
    },
    {
        name: 'st_kitts_nevis',
        code: '🇰🇳',
    },
    {
        name: 'north_korea',
        code: '🇰🇵',
    },
    {
        name: 'kr',
        code: '🇰🇷',
    },
    {
        name: 'kuwait',
        code: '🇰🇼',
    },
    {
        name: 'cayman_islands',
        code: '🇰🇾',
    },
    {
        name: 'kazakhstan',
        code: '🇰🇿',
    },
    {
        name: 'laos',
        code: '🇱🇦',
    },
    {
        name: 'lebanon',
        code: '🇱🇧',
    },
    {
        name: 'st_lucia',
        code: '🇱🇨',
    },
    {
        name: 'liechtenstein',
        code: '🇱🇮',
    },
    {
        name: 'sri_lanka',
        code: '🇱🇰',
    },
    {
        name: 'liberia',
        code: '🇱🇷',
    },
    {
        name: 'lesotho',
        code: '🇱🇸',
    },
    {
        name: 'lithuania',
        code: '🇱🇹',
    },
    {
        name: 'luxembourg',
        code: '🇱🇺',
    },
    {
        name: 'latvia',
        code: '🇱🇻',
    },
    {
        name: 'libya',
        code: '🇱🇾',
    },
    {
        name: 'morocco',
        code: '🇲🇦',
    },
    {
        name: 'monaco',
        code: '🇲🇨',
    },
    {
        name: 'moldova',
        code: '🇲🇩',
    },
    {
        name: 'montenegro',
        code: '🇲🇪',
    },
    {
        name: 'st_martin',
        code: '🇲🇫',
    },
    {
        name: 'madagascar',
        code: '🇲🇬',
    },
    {
        name: 'marshall_islands',
        code: '🇲🇭',
    },
    {
        name: 'macedonia',
        code: '🇲🇰',
    },
    {
        name: 'mali',
        code: '🇲🇱',
    },
    {
        name: 'myanmar',
        code: '🇲🇲',
    },
    {
        name: 'mongolia',
        code: '🇲🇳',
    },
    {
        name: 'macau',
        code: '🇲🇴',
    },
    {
        name: 'northern_mariana_islands',
        code: '🇲🇵',
    },
    {
        name: 'martinique',
        code: '🇲🇶',
    },
    {
        name: 'mauritania',
        code: '🇲🇷',
    },
    {
        name: 'montserrat',
        code: '🇲🇸',
    },
    {
        name: 'malta',
        code: '🇲🇹',
    },
    {
        name: 'mauritius',
        code: '🇲🇺',
    },
    {
        name: 'maldives',
        code: '🇲🇻',
    },
    {
        name: 'malawi',
        code: '🇲🇼',
    },
    {
        name: 'mexico',
        code: '🇲🇽',
    },
    {
        name: 'malaysia',
        code: '🇲🇾',
    },
    {
        name: 'mozambique',
        code: '🇲🇿',
    },
    {
        name: 'namibia',
        code: '🇳🇦',
    },
    {
        name: 'new_caledonia',
        code: '🇳🇨',
    },
    {
        name: 'niger',
        code: '🇳🇪',
    },
    {
        name: 'norfolk_island',
        code: '🇳🇫',
    },
    {
        name: 'nigeria',
        code: '🇳🇬',
    },
    {
        name: 'nicaragua',
        code: '🇳🇮',
    },
    {
        name: 'netherlands',
        code: '🇳🇱',
    },
    {
        name: 'norway',
        code: '🇳🇴',
    },
    {
        name: 'nepal',
        code: '🇳🇵',
    },
    {
        name: 'nauru',
        code: '🇳🇷',
    },
    {
        name: 'niue',
        code: '🇳🇺',
    },
    {
        name: 'new_zealand',
        code: '🇳🇿',
    },
    {
        name: 'oman',
        code: '🇴🇲',
    },
    {
        name: 'panama',
        code: '🇵🇦',
    },
    {
        name: 'peru',
        code: '🇵🇪',
    },
    {
        name: 'french_polynesia',
        code: '🇵🇫',
    },
    {
        name: 'papua_new_guinea',
        code: '🇵🇬',
    },
    {
        name: 'philippines',
        code: '🇵🇭',
    },
    {
        name: 'pakistan',
        code: '🇵🇰',
    },
    {
        name: 'poland',
        code: '🇵🇱',
    },
    {
        name: 'st_pierre_miquelon',
        code: '🇵🇲',
    },
    {
        name: 'pitcairn_islands',
        code: '🇵🇳',
    },
    {
        name: 'puerto_rico',
        code: '🇵🇷',
    },
    {
        name: 'palestinian_territories',
        code: '🇵🇸',
    },
    {
        name: 'portugal',
        code: '🇵🇹',
    },
    {
        name: 'palau',
        code: '🇵🇼',
    },
    {
        name: 'paraguay',
        code: '🇵🇾',
    },
    {
        name: 'qatar',
        code: '🇶🇦',
    },
    {
        name: 'reunion',
        code: '🇷🇪',
    },
    {
        name: 'romania',
        code: '🇷🇴',
    },
    {
        name: 'serbia',
        code: '🇷🇸',
    },
    {
        name: 'ru',
        code: '🇷🇺',
    },
    {
        name: 'rwanda',
        code: '🇷🇼',
    },
    {
        name: 'saudi_arabia',
        code: '🇸🇦',
    },
    {
        name: 'solomon_islands',
        code: '🇸🇧',
    },
    {
        name: 'seychelles',
        code: '🇸🇨',
    },
    {
        name: 'sudan',
        code: '🇸🇩',
    },
    {
        name: 'sweden',
        code: '🇸🇪',
    },
    {
        name: 'singapore',
        code: '🇸🇬',
    },
    {
        name: 'st_helena',
        code: '🇸🇭',
    },
    {
        name: 'slovenia',
        code: '🇸🇮',
    },
    {
        name: 'svalbard_jan_mayen',
        code: '🇸🇯',
    },
    {
        name: 'slovakia',
        code: '🇸🇰',
    },
    {
        name: 'sierra_leone',
        code: '🇸🇱',
    },
    {
        name: 'san_marino',
        code: '🇸🇲',
    },
    {
        name: 'senegal',
        code: '🇸🇳',
    },
    {
        name: 'somalia',
        code: '🇸🇴',
    },
    {
        name: 'suriname',
        code: '🇸🇷',
    },
    {
        name: 'south_sudan',
        code: '🇸🇸',
    },
    {
        name: 'sao_tome_principe',
        code: '🇸🇹',
    },
    {
        name: 'el_salvador',
        code: '🇸🇻',
    },
    {
        name: 'sint_maarten',
        code: '🇸🇽',
    },
    {
        name: 'syria',
        code: '🇸🇾',
    },
    {
        name: 'swaziland',
        code: '🇸🇿',
    },
    {
        name: 'tristan_da_cunha',
        code: '🇹🇦',
    },
    {
        name: 'turks_caicos_islands',
        code: '🇹🇨',
    },
    {
        name: 'chad',
        code: '🇹🇩',
    },
    {
        name: 'french_southern_territories',
        code: '🇹🇫',
    },
    {
        name: 'togo',
        code: '🇹🇬',
    },
    {
        name: 'thailand',
        code: '🇹🇭',
    },
    {
        name: 'tajikistan',
        code: '🇹🇯',
    },
    {
        name: 'tokelau',
        code: '🇹🇰',
    },
    {
        name: 'timor_leste',
        code: '🇹🇱',
    },
    {
        name: 'turkmenistan',
        code: '🇹🇲',
    },
    {
        name: 'tunisia',
        code: '🇹🇳',
    },
    {
        name: 'tonga',
        code: '🇹🇴',
    },
    {
        name: 'tr',
        code: '🇹🇷',
    },
    {
        name: 'trinidad_tobago',
        code: '🇹🇹',
    },
    {
        name: 'tuvalu',
        code: '🇹🇻',
    },
    {
        name: 'taiwan',
        code: '🇹🇼',
    },
    {
        name: 'tanzania',
        code: '🇹🇿',
    },
    {
        name: 'ukraine',
        code: '🇺🇦',
    },
    {
        name: 'uganda',
        code: '🇺🇬',
    },
    {
        name: 'us_outlying_islands',
        code: '🇺🇲',
    },
    {
        name: 'united_nations',
        code: '🇺🇳',
    },
    {
        name: 'us',
        code: '🇺🇸',
    },
    {
        name: 'uruguay',
        code: '🇺🇾',
    },
    {
        name: 'uzbekistan',
        code: '🇺🇿',
    },
    {
        name: 'vatican_city',
        code: '🇻🇦',
    },
    {
        name: 'st_vincent_grenadines',
        code: '🇻🇨',
    },
    {
        name: 'venezuela',
        code: '🇻🇪',
    },
    {
        name: 'british_virgin_islands',
        code: '🇻🇬',
    },
    {
        name: 'us_virgin_islands',
        code: '🇻🇮',
    },
    {
        name: 'vietnam',
        code: '🇻🇳',
    },
    {
        name: 'vanuatu',
        code: '🇻🇺',
    },
    {
        name: 'wallis_futuna',
        code: '🇼🇫',
    },
    {
        name: 'samoa',
        code: '🇼🇸',
    },
    {
        name: 'kosovo',
        code: '🇽🇰',
    },
    {
        name: 'yemen',
        code: '🇾🇪',
    },
    {
        name: 'mayotte',
        code: '🇾🇹',
    },
    {
        name: 'south_africa',
        code: '🇿🇦',
    },
    {
        name: 'zambia',
        code: '🇿🇲',
    },
    {
        name: 'zimbabwe',
        code: '🇿🇼',
    },
    {
        name: 'england',
        code: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    },
    {
        name: 'scotland',
        code: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    },
    {
        name: 'wales',
        code: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    },
];

const categoryFrequentlyUsed: HeaderEmoji = {
    header: true,
    code: 'frequentlyUsed',
    icon: FrequentlyUsed,
};

export {skinTones, categoryFrequentlyUsed};
export default emojis;
