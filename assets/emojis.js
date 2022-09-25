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
 *              emojiRow.types = skinTones.map(skinTone => 
 *                  String.fromCodePoint(parseInt(getEmojiUnicode(emoji.emoji), 16), parseInt(skinTone, 16)));
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

const emojis = [{
	"code": "smileysAndEmotion",
	"header": true
}, {
	"code": "😀",
	"keywords": ["smile", "happy", "grinning", "face", "grin"]
}, {
	"code": "😃",
	"keywords": ["happy", "joy", "haha", "smiley", "face", "mouth", "open", "smile"]
}, {
	"code": "😄",
	"keywords": ["happy", "joy", "laugh", "pleased", "smile", "eye", "face", "mouth", "open"]
}, {
	"code": "😁",
	"keywords": ["grin", "eye", "face", "smile"]
}, {
	"code": "😆",
	"keywords": ["happy", "haha", "laughing", "satisfied", "face", "laugh", "mouth", "open", "smile"]
}, {
	"code": "😅",
	"keywords": ["hot", "sweat_smile", "cold", "face", "open", "smile", "sweat"]
}, {
	"code": "🤣",
	"keywords": ["lol", "laughing", "rofl", "face", "floor", "laugh", "rolling"]
}, {
	"code": "😂",
	"keywords": ["tears", "joy", "face", "laugh", "tear"]
}, {
	"code": "🙂",
	"keywords": ["slightly_smiling_face", "face", "smile"]
}, {
	"code": "🙃",
	"keywords": ["upside_down_face", "face", "upside-down"]
}, {
	"code": "😉",
	"keywords": ["flirt", "wink", "face"]
}, {
	"code": "😊",
	"keywords": ["proud", "blush", "eye", "face", "smile"]
}, {
	"code": "😇",
	"keywords": ["angel", "innocent", "face", "fairy tale", "fantasy", "halo", "smile"]
}, {
	"code": "🥰",
	"keywords": ["love", "smiling_face_with_three_hearts"]
}, {
	"code": "😍",
	"keywords": ["love", "crush", "heart_eyes", "eye", "face", "heart", "smile"]
}, {
	"code": "🤩",
	"keywords": ["eyes", "star_struck"]
}, {
	"code": "😘",
	"keywords": ["flirt", "kissing_heart", "face", "heart", "kiss"]
}, {
	"code": "😗",
	"keywords": ["kissing", "face", "kiss"]
}, {
	"code": "☺️",
	"keywords": ["blush", "pleased", "relaxed"]
}, {
	"code": "😚",
	"keywords": ["kissing_closed_eyes", "closed", "eye", "face", "kiss"]
}, {
	"code": "😙",
	"keywords": ["kissing_smiling_eyes", "eye", "face", "kiss", "smile"]
}, {
	"code": "🥲",
	"keywords": ["smiling_face_with_tear"]
}, {
	"code": "😋",
	"keywords": ["tongue", "lick", "yum", "delicious", "face", "savouring", "smile", "um"]
}, {
	"code": "😛",
	"keywords": ["stuck_out_tongue", "face", "tongue"]
}, {
	"code": "😜",
	"keywords": ["prank", "silly", "stuck_out_tongue_winking_eye", "eye", "face", "joke", "tongue", "wink"]
}, {
	"code": "🤪",
	"keywords": ["goofy", "wacky", "zany_face"]
}, {
	"code": "😝",
	"keywords": ["prank", "stuck_out_tongue_closed_eyes", "eye", "face", "horrible", "taste", "tongue"]
}, {
	"code": "🤑",
	"keywords": ["rich", "money_mouth_face", "face", "money", "mouth"]
}, {
	"code": "🤗",
	"keywords": ["hugs", "face", "hug", "hugging"]
}, {
	"code": "🤭",
	"keywords": ["quiet", "whoops", "hand_over_mouth"]
}, {
	"code": "🤫",
	"keywords": ["silence", "quiet", "shushing_face"]
}, {
	"code": "🤔",
	"keywords": ["thinking", "face"]
}, {
	"code": "🤐",
	"keywords": ["silence", "hush", "zipper_mouth_face", "face", "mouth", "zipper"]
}, {
	"code": "🤨",
	"keywords": ["suspicious", "raised_eyebrow"]
}, {
	"code": "😐",
	"keywords": ["meh", "neutral_face", "deadpan", "face", "neutral"]
}, {
	"code": "😑",
	"keywords": ["expressionless", "face", "inexpressive", "unexpressive"]
}, {
	"code": "😶",
	"keywords": ["mute", "silence", "no_mouth", "face", "mouth", "quiet", "silent"]
}, {
	"code": "😶‍🌫️",
	"keywords": ["face_in_clouds"]
}, {
	"code": "😏",
	"keywords": ["smug", "smirk", "face"]
}, {
	"code": "😒",
	"keywords": ["meh", "unamused", "face", "unhappy"]
}, {
	"code": "🙄",
	"keywords": ["roll_eyes", "eyes", "face", "rolling"]
}, {
	"code": "😬",
	"keywords": ["grimacing", "face", "grimace"]
}, {
	"code": "😮‍💨",
	"keywords": ["face_exhaling"]
}, {
	"code": "🤥",
	"keywords": ["liar", "lying_face", "face", "lie", "pinocchio"]
}, {
	"code": "😌",
	"keywords": ["whew", "relieved", "face"]
}, {
	"code": "😔",
	"keywords": ["pensive", "dejected", "face"]
}, {
	"code": "😪",
	"keywords": ["tired", "sleepy", "face", "sleep"]
}, {
	"code": "🤤",
	"keywords": ["drooling_face", "drooling", "face"]
}, {
	"code": "😴",
	"keywords": ["zzz", "sleeping", "face", "sleep"]
}, {
	"code": "😷",
	"keywords": ["sick", "ill", "mask", "cold", "doctor", "face", "medicine"]
}, {
	"code": "🤒",
	"keywords": ["sick", "face_with_thermometer", "face", "ill", "thermometer"]
}, {
	"code": "🤕",
	"keywords": ["hurt", "face_with_head_bandage", "bandage", "face", "injury"]
}, {
	"code": "🤢",
	"keywords": ["sick", "barf", "disgusted", "nauseated_face", "face", "nauseated", "vomit"]
}, {
	"code": "🤮",
	"keywords": ["barf", "sick", "vomiting_face"]
}, {
	"code": "🤧",
	"keywords": ["achoo", "sick", "sneezing_face", "face", "gesundheit", "sneeze"]
}, {
	"code": "🥵",
	"keywords": ["heat", "sweating", "hot_face"]
}, {
	"code": "🥶",
	"keywords": ["freezing", "ice", "cold_face"]
}, {
	"code": "🥴",
	"keywords": ["groggy", "woozy_face"]
}, {
	"code": "😵",
	"keywords": ["dizzy_face", "dizzy", "face"]
}, {
	"code": "😵‍💫",
	"keywords": ["face_with_spiral_eyes"]
}, {
	"code": "🤯",
	"keywords": ["mind", "blown", "exploding_head"]
}, {
	"code": "🤠",
	"keywords": ["cowboy_hat_face", "cowboy", "cowgirl", "face", "hat"]
}, {
	"code": "🥳",
	"keywords": ["celebration", "birthday", "partying_face"]
}, {
	"code": "🥸",
	"keywords": ["disguised_face"]
}, {
	"code": "😎",
	"keywords": ["cool", "sunglasses", "bright", "eye", "eyewear", "face", "glasses", "smile", "sun", "weather"]
}, {
	"code": "🤓",
	"keywords": ["geek", "glasses", "nerd_face", "face", "nerd"]
}, {
	"code": "🧐",
	"keywords": ["monocle_face"]
}, {
	"code": "😕",
	"keywords": ["confused", "face"]
}, {
	"code": "😟",
	"keywords": ["nervous", "worried", "face"]
}, {
	"code": "🙁",
	"keywords": ["slightly_frowning_face", "face", "frown"]
}, {
	"code": "☹️",
	"keywords": ["frowning_face"]
}, {
	"code": "😮",
	"keywords": ["surprise", "impressed", "wow", "open_mouth", "face", "mouth", "open", "sympathy"]
}, {
	"code": "😯",
	"keywords": ["silence", "speechless", "hushed", "face", "stunned", "surprised"]
}, {
	"code": "😲",
	"keywords": ["amazed", "gasp", "astonished", "face", "shocked", "totally"]
}, {
	"code": "😳",
	"keywords": ["flushed", "dazed", "face"]
}, {
	"code": "🥺",
	"keywords": ["puppy", "eyes", "pleading_face"]
}, {
	"code": "😦",
	"keywords": ["frowning", "face", "frown", "mouth", "open"]
}, {
	"code": "😧",
	"keywords": ["stunned", "anguished", "face"]
}, {
	"code": "😨",
	"keywords": ["scared", "shocked", "oops", "fearful", "face", "fear"]
}, {
	"code": "😰",
	"keywords": ["nervous", "cold_sweat", "blue", "cold", "face", "mouth", "open", "rushed", "sweat"]
}, {
	"code": "😥",
	"keywords": ["phew", "sweat", "nervous", "disappointed_relieved", "disappointed", "face", "relieved", "whew"]
}, {
	"code": "😢",
	"keywords": ["sad", "tear", "cry", "face"]
}, {
	"code": "😭",
	"keywords": ["sad", "cry", "bawling", "sob", "face", "tear"]
}, {
	"code": "😱",
	"keywords": ["horror", "shocked", "scream", "face", "fear", "fearful", "munch", "scared"]
}, {
	"code": "😖",
	"keywords": ["confounded", "face"]
}, {
	"code": "😣",
	"keywords": ["struggling", "persevere", "face"]
}, {
	"code": "😞",
	"keywords": ["sad", "disappointed", "face"]
}, {
	"code": "😓",
	"keywords": ["sweat", "cold", "face"]
}, {
	"code": "😩",
	"keywords": ["tired", "weary", "face"]
}, {
	"code": "😫",
	"keywords": ["upset", "whine", "tired_face", "face", "tired"]
}, {
	"code": "🥱",
	"keywords": ["yawning_face"]
}, {
	"code": "😤",
	"keywords": ["smug", "triumph", "face", "won"]
}, {
	"code": "😡",
	"keywords": ["angry", "rage", "pout", "face", "mad", "pouting", "red"]
}, {
	"code": "😠",
	"keywords": ["mad", "annoyed", "angry", "face"]
}, {
	"code": "🤬",
	"keywords": ["foul", "cursing_face"]
}, {
	"code": "😈",
	"keywords": ["devil", "evil", "horns", "smiling_imp", "face", "fairy tale", "fantasy", "smile"]
}, {
	"code": "👿",
	"keywords": ["angry", "devil", "evil", "horns", "imp", "demon", "face", "fairy tale", "fantasy"]
}, {
	"code": "💀",
	"keywords": ["dead", "danger", "poison", "skull", "body", "death", "face", "fairy tale", "monster"]
}, {
	"code": "☠️",
	"keywords": ["danger", "pirate", "skull_and_crossbones", "body", "crossbones", "death", "face", "monster", "skull"]
}, {
	"code": "💩",
	"keywords": ["crap", "hankey", "poop", "shit", "comic", "dung", "face", "monster", "poo"]
}, {
	"code": "🤡",
	"keywords": ["clown_face", "clown", "face"]
}, {
	"code": "👹",
	"keywords": ["monster", "japanese_ogre", "creature", "face", "fairy tale", "fantasy", "japanese", "ogre"]
}, {
	"code": "👺",
	"keywords": ["japanese_goblin", "creature", "face", "fairy tale", "fantasy", "goblin", "japanese", "monster"]
}, {
	"code": "👻",
	"keywords": ["halloween", "ghost", "creature", "face", "fairy tale", "fantasy", "monster"]
}, {
	"code": "👽",
	"keywords": ["ufo", "alien", "creature", "extraterrestrial", "face", "fairy tale", "fantasy", "monster", "space"]
}, {
	"code": "👾",
	"keywords": ["game", "retro", "space_invader", "alien", "creature", "extraterrestrial", "face", "fairy tale", "fantasy", "monster", "space", "ufo"]
}, {
	"code": "🤖",
	"keywords": ["robot", "face", "monster"]
}, {
	"code": "😺",
	"keywords": ["smiley_cat", "cat", "face", "mouth", "open", "smile"]
}, {
	"code": "😸",
	"keywords": ["smile_cat", "cat", "eye", "face", "grin", "smile"]
}, {
	"code": "😹",
	"keywords": ["joy_cat", "cat", "face", "joy", "tear"]
}, {
	"code": "😻",
	"keywords": ["heart_eyes_cat", "cat", "eye", "face", "heart", "love", "smile"]
}, {
	"code": "😼",
	"keywords": ["smirk_cat", "cat", "face", "ironic", "smile", "wry"]
}, {
	"code": "😽",
	"keywords": ["kissing_cat", "cat", "eye", "face", "kiss"]
}, {
	"code": "🙀",
	"keywords": ["horror", "scream_cat", "cat", "face", "oh", "surprised", "weary"]
}, {
	"code": "😿",
	"keywords": ["sad", "tear", "crying_cat_face", "cat", "cry", "face"]
}, {
	"code": "😾",
	"keywords": ["pouting_cat", "cat", "face", "pouting"]
}, {
	"code": "🙈",
	"keywords": ["monkey", "blind", "ignore", "see_no_evil", "evil", "face", "forbidden", "gesture", "no", "not", "prohibited", "see"]
}, {
	"code": "🙉",
	"keywords": ["monkey", "deaf", "hear_no_evil", "evil", "face", "forbidden", "gesture", "hear", "no", "not", "prohibited"]
}, {
	"code": "🙊",
	"keywords": ["monkey", "mute", "hush", "speak_no_evil", "evil", "face", "forbidden", "gesture", "no", "not", "prohibited", "speak"]
}, {
	"code": "💋",
	"keywords": ["lipstick", "kiss", "heart", "lips", "mark", "romance"]
}, {
	"code": "💌",
	"keywords": ["email", "envelope", "love_letter", "heart", "letter", "love", "mail", "romance"]
}, {
	"code": "💘",
	"keywords": ["love", "heart", "cupid", "arrow", "romance"]
}, {
	"code": "💝",
	"keywords": ["chocolates", "gift_heart", "heart", "ribbon", "valentine"]
}, {
	"code": "💖",
	"keywords": ["sparkling_heart", "excited", "heart", "sparkle"]
}, {
	"code": "💗",
	"keywords": ["heartpulse", "excited", "growing", "heart", "nervous"]
}, {
	"code": "💓",
	"keywords": ["heartbeat", "beating", "heart", "pulsating"]
}, {
	"code": "💞",
	"keywords": ["revolving_hearts", "heart", "revolving"]
}, {
	"code": "💕",
	"keywords": ["two_hearts", "heart", "love"]
}, {
	"code": "💟",
	"keywords": ["heart_decoration", "heart"]
}, {
	"code": "❣️",
	"keywords": ["heavy_heart_exclamation", "exclamation", "heart", "mark", "punctuation"]
}, {
	"code": "💔",
	"keywords": ["broken_heart", "break", "broken", "heart"]
}, {
	"code": "❤️‍🔥",
	"keywords": ["heart_on_fire"]
}, {
	"code": "❤️‍🩹",
	"keywords": ["mending_heart"]
}, {
	"code": "❤️",
	"keywords": ["love", "heart"]
}, {
	"code": "🧡",
	"keywords": ["orange_heart"]
}, {
	"code": "💛",
	"keywords": ["yellow_heart", "heart", "yellow"]
}, {
	"code": "💚",
	"keywords": ["green_heart", "green", "heart"]
}, {
	"code": "💙",
	"keywords": ["blue_heart", "blue", "heart"]
}, {
	"code": "💜",
	"keywords": ["purple_heart", "heart", "purple"]
}, {
	"code": "🤎",
	"keywords": ["brown_heart"]
}, {
	"code": "🖤",
	"keywords": ["black_heart", "black", "evil", "heart", "wicked"]
}, {
	"code": "🤍",
	"keywords": ["white_heart"]
}, {
	"code": "💯",
	"keywords": ["score", "perfect", "100", "full", "hundred"]
}, {
	"code": "💢",
	"keywords": ["angry", "anger", "comic", "mad"]
}, {
	"code": "💥",
	"keywords": ["explode", "boom", "collision", "comic"]
}, {
	"code": "💫",
	"keywords": ["star", "dizzy", "comic"]
}, {
	"code": "💦",
	"keywords": ["water", "workout", "sweat_drops", "comic", "splashing", "sweat"]
}, {
	"code": "💨",
	"keywords": ["wind", "blow", "fast", "dash", "comic", "running"]
}, {
	"code": "🕳️",
	"keywords": ["hole"]
}, {
	"code": "💣",
	"keywords": ["boom", "bomb", "comic"]
}, {
	"code": "💬",
	"keywords": ["comment", "speech_balloon", "balloon", "bubble", "comic", "dialog", "speech"]
}, {
	"code": "👁️‍🗨️",
	"keywords": ["eye_speech_bubble"]
}, {
	"code": "🗨️",
	"keywords": ["left_speech_bubble"]
}, {
	"code": "🗯️",
	"keywords": ["right_anger_bubble"]
}, {
	"code": "💭",
	"keywords": ["thinking", "thought_balloon", "balloon", "bubble", "comic", "thought"]
}, {
	"code": "💤",
	"keywords": ["sleeping", "zzz", "comic", "sleep"]
}, {
	"code": "peopleAndBody",
	"header": true
}, {
	"code": "👋",
	"keywords": ["goodbye", "wave", "body", "hand", "waving"],
	"types": ["👋🏻", "👋🏼", "👋🏽", "👋🏾", "👋🏿"]
}, {
	"code": "🤚",
	"keywords": ["raised_back_of_hand", "backhand", "raised"],
	"types": ["🤚🏻", "🤚🏼", "🤚🏽", "🤚🏾", "🤚🏿"]
}, {
	"code": "🖐️",
	"keywords": ["raised_hand_with_fingers_splayed"],
	"types": ["🖐🏻", "🖐🏼", "🖐🏽", "🖐🏾", "🖐🏿"]
}, {
	"code": "✋",
	"keywords": ["highfive", "stop", "hand", "raised_hand", "body"],
	"types": ["✋🏻", "✋🏼", "✋🏽", "✋🏾", "✋🏿"]
}, {
	"code": "🖖",
	"keywords": ["prosper", "spock", "vulcan_salute", "body", "finger", "hand", "vulcan"],
	"types": ["🖖🏻", "🖖🏼", "🖖🏽", "🖖🏾", "🖖🏿"]
}, {
	"code": "👌",
	"keywords": ["ok_hand", "body", "hand", "ok"],
	"types": ["👌🏻", "👌🏼", "👌🏽", "👌🏾", "👌🏿"]
}, {
	"code": "🤌",
	"keywords": ["pinched_fingers"],
	"types": ["🤌🏻", "🤌🏼", "🤌🏽", "🤌🏾", "🤌🏿"]
}, {
	"code": "🤏",
	"keywords": ["pinching_hand"],
	"types": ["🤏🏻", "🤏🏼", "🤏🏽", "🤏🏾", "🤏🏿"]
}, {
	"code": "✌️",
	"keywords": ["victory", "peace", "v"],
	"types": ["✌🏻", "✌🏼", "✌🏽", "✌🏾", "✌🏿"]
}, {
	"code": "🤞",
	"keywords": ["luck", "hopeful", "crossed_fingers", "cross", "finger", "hand"],
	"types": ["🤞🏻", "🤞🏼", "🤞🏽", "🤞🏾", "🤞🏿"]
}, {
	"code": "🤟",
	"keywords": ["love_you_gesture"],
	"types": ["🤟🏻", "🤟🏼", "🤟🏽", "🤟🏾", "🤟🏿"]
}, {
	"code": "🤘",
	"keywords": ["metal", "body", "finger", "hand", "horns", "rock-on"],
	"types": ["🤘🏻", "🤘🏼", "🤘🏽", "🤘🏾", "🤘🏿"]
}, {
	"code": "🤙",
	"keywords": ["call_me_hand", "call", "hand"],
	"types": ["🤙🏻", "🤙🏼", "🤙🏽", "🤙🏾", "🤙🏿"]
}, {
	"code": "👈",
	"keywords": ["point_left", "backhand", "body", "finger", "hand", "index", "point"],
	"types": ["👈🏻", "👈🏼", "👈🏽", "👈🏾", "👈🏿"]
}, {
	"code": "👉",
	"keywords": ["point_right", "backhand", "body", "finger", "hand", "index", "point"],
	"types": ["👉🏻", "👉🏼", "👉🏽", "👉🏾", "👉🏿"]
}, {
	"code": "👆",
	"keywords": ["point_up_2", "backhand", "body", "finger", "hand", "index", "point", "up"],
	"types": ["👆🏻", "👆🏼", "👆🏽", "👆🏾", "👆🏿"]
}, {
	"code": "🖕",
	"keywords": ["middle_finger", "fu", "body", "finger", "hand", "middle finger"],
	"types": ["🖕🏻", "🖕🏼", "🖕🏽", "🖕🏾", "🖕🏿"]
}, {
	"code": "👇",
	"keywords": ["point_down", "backhand", "body", "down", "finger", "hand", "index", "point"],
	"types": ["👇🏻", "👇🏼", "👇🏽", "👇🏾", "👇🏿"]
}, {
	"code": "☝️",
	"keywords": ["point_up"],
	"types": ["☝🏻", "☝🏼", "☝🏽", "☝🏾", "☝🏿"]
}, {
	"code": "👍",
	"keywords": ["approve", "ok", "+1", "thumbsup", "body", "hand", "thumb", "thumbs up", "up"],
	"types": ["👍🏻", "👍🏼", "👍🏽", "👍🏾", "👍🏿"]
}, {
	"code": "👎",
	"keywords": ["disapprove", "bury", "-1", "thumbsdown", "body", "down", "hand", "thumb", "thumbs down"],
	"types": ["👎🏻", "👎🏼", "👎🏽", "👎🏾", "👎🏿"]
}, {
	"code": "✊",
	"keywords": ["power", "fist_raised", "fist", "body", "clenched", "hand", "punch"],
	"types": ["✊🏻", "✊🏼", "✊🏽", "✊🏾", "✊🏿"]
}, {
	"code": "👊",
	"keywords": ["attack", "fist_oncoming", "facepunch", "punch", "body", "clenched", "fist", "hand"],
	"types": ["👊🏻", "👊🏼", "👊🏽", "👊🏾", "👊🏿"]
}, {
	"code": "🤛",
	"keywords": ["fist_left", "fist", "leftwards"],
	"types": ["🤛🏻", "🤛🏼", "🤛🏽", "🤛🏾", "🤛🏿"]
}, {
	"code": "🤜",
	"keywords": ["fist_right", "fist", "rightwards"],
	"types": ["🤜🏻", "🤜🏼", "🤜🏽", "🤜🏾", "🤜🏿"]
}, {
	"code": "👏",
	"keywords": ["praise", "applause", "clap", "body", "hand"],
	"types": ["👏🏻", "👏🏼", "👏🏽", "👏🏾", "👏🏿"]
}, {
	"code": "🙌",
	"keywords": ["hooray", "raised_hands", "body", "celebration", "gesture", "hand", "raised"],
	"types": ["🙌🏻", "🙌🏼", "🙌🏽", "🙌🏾", "🙌🏿"]
}, {
	"code": "👐",
	"keywords": ["open_hands", "body", "hand", "open"],
	"types": ["👐🏻", "👐🏼", "👐🏽", "👐🏾", "👐🏿"]
}, {
	"code": "🤲",
	"keywords": ["palms_up_together"],
	"types": ["🤲🏻", "🤲🏼", "🤲🏽", "🤲🏾", "🤲🏿"]
}, {
	"code": "🤝",
	"keywords": ["deal", "handshake", "agreement", "hand", "meeting", "shake"]
}, {
	"code": "🙏",
	"keywords": ["please", "hope", "wish", "pray", "ask", "body", "bow", "folded", "gesture", "hand", "thanks"],
	"types": ["🙏🏻", "🙏🏼", "🙏🏽", "🙏🏾", "🙏🏿"]
}, {
	"code": "✍️",
	"keywords": ["writing_hand"],
	"types": ["✍🏻", "✍🏼", "✍🏽", "✍🏾", "✍🏿"]
}, {
	"code": "💅",
	"keywords": ["beauty", "manicure", "nail_care", "body", "care", "cosmetics", "nail", "polish"],
	"types": ["💅🏻", "💅🏼", "💅🏽", "💅🏾", "💅🏿"]
}, {
	"code": "🤳",
	"keywords": ["selfie", "camera", "phone"],
	"types": ["🤳🏻", "🤳🏼", "🤳🏽", "🤳🏾", "🤳🏿"]
}, {
	"code": "💪",
	"keywords": ["flex", "bicep", "strong", "workout", "muscle", "biceps", "body", "comic"],
	"types": ["💪🏻", "💪🏼", "💪🏽", "💪🏾", "💪🏿"]
}, {
	"code": "🦾",
	"keywords": ["mechanical_arm"]
}, {
	"code": "🦿",
	"keywords": ["mechanical_leg"]
}, {
	"code": "🦵",
	"keywords": ["leg"],
	"types": ["🦵🏻", "🦵🏼", "🦵🏽", "🦵🏾", "🦵🏿"]
}, {
	"code": "🦶",
	"keywords": ["foot"],
	"types": ["🦶🏻", "🦶🏼", "🦶🏽", "🦶🏾", "🦶🏿"]
}, {
	"code": "👂",
	"keywords": ["hear", "sound", "listen", "ear", "body"],
	"types": ["👂🏻", "👂🏼", "👂🏽", "👂🏾", "👂🏿"]
}, {
	"code": "🦻",
	"keywords": ["ear_with_hearing_aid"],
	"types": ["🦻🏻", "🦻🏼", "🦻🏽", "🦻🏾", "🦻🏿"]
}, {
	"code": "👃",
	"keywords": ["smell", "nose", "body"],
	"types": ["👃🏻", "👃🏼", "👃🏽", "👃🏾", "👃🏿"]
}, {
	"code": "🧠",
	"keywords": ["brain"]
}, {
	"code": "🫀",
	"keywords": ["anatomical_heart"]
}, {
	"code": "🫁",
	"keywords": ["lungs"]
}, {
	"code": "🦷",
	"keywords": ["tooth"]
}, {
	"code": "🦴",
	"keywords": ["bone"]
}, {
	"code": "👀",
	"keywords": ["look", "see", "watch", "eyes", "body", "eye", "face"]
}, {
	"code": "👁️",
	"keywords": ["eye"]
}, {
	"code": "👅",
	"keywords": ["taste", "tongue", "body"]
}, {
	"code": "👄",
	"keywords": ["kiss", "lips", "body", "mouth"]
}, {
	"code": "👶",
	"keywords": ["child", "newborn", "baby"],
	"types": ["👶🏻", "👶🏼", "👶🏽", "👶🏾", "👶🏿"]
}, {
	"code": "🧒",
	"keywords": ["child"],
	"types": ["🧒🏻", "🧒🏼", "🧒🏽", "🧒🏾", "🧒🏿"]
}, {
	"code": "👦",
	"keywords": ["child", "boy"],
	"types": ["👦🏻", "👦🏼", "👦🏽", "👦🏾", "👦🏿"]
}, {
	"code": "👧",
	"keywords": ["child", "girl", "maiden", "virgin", "virgo", "zodiac"],
	"types": ["👧🏻", "👧🏼", "👧🏽", "👧🏾", "👧🏿"]
}, {
	"code": "🧑",
	"keywords": ["adult"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👱",
	"keywords": ["blond_haired_person", "blond"],
	"types": ["👱🏻", "👱🏼", "👱🏽", "👱🏾", "👱🏿"]
}, {
	"code": "👨",
	"keywords": ["mustache", "father", "dad", "man"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "🧔",
	"keywords": ["bearded_person"],
	"types": ["🧔🏻", "🧔🏼", "🧔🏽", "🧔🏾", "🧔🏿"]
}, {
	"code": "🧔‍♂️",
	"keywords": ["man_beard"],
	"types": ["🧔🏻", "🧔🏼", "🧔🏽", "🧔🏾", "🧔🏿"]
}, {
	"code": "🧔‍♀️",
	"keywords": ["woman_beard"],
	"types": ["🧔🏻", "🧔🏼", "🧔🏽", "🧔🏾", "🧔🏿"]
}, {
	"code": "👨‍🦰",
	"keywords": ["red_haired_man"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👨‍🦱",
	"keywords": ["curly_haired_man"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👨‍🦳",
	"keywords": ["white_haired_man"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👨‍🦲",
	"keywords": ["bald_man"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩",
	"keywords": ["girls", "woman"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "👩‍🦰",
	"keywords": ["red_haired_woman"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🦰",
	"keywords": ["person_red_hair"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👩‍🦱",
	"keywords": ["curly_haired_woman"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🦱",
	"keywords": ["person_curly_hair"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👩‍🦳",
	"keywords": ["white_haired_woman"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🦳",
	"keywords": ["person_white_hair"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👩‍🦲",
	"keywords": ["bald_woman"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🦲",
	"keywords": ["person_bald"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👱‍♀️",
	"keywords": ["blond_haired_woman", "blonde_woman"],
	"types": ["👱🏻", "👱🏼", "👱🏽", "👱🏾", "👱🏿"]
}, {
	"code": "👱‍♂️",
	"keywords": ["blond_haired_man"],
	"types": ["👱🏻", "👱🏼", "👱🏽", "👱🏾", "👱🏿"]
}, {
	"code": "🧓",
	"keywords": ["older_adult"],
	"types": ["🧓🏻", "🧓🏼", "🧓🏽", "🧓🏾", "🧓🏿"]
}, {
	"code": "👴",
	"keywords": ["older_man", "man", "old"],
	"types": ["👴🏻", "👴🏼", "👴🏽", "👴🏾", "👴🏿"]
}, {
	"code": "👵",
	"keywords": ["older_woman", "old", "woman"],
	"types": ["👵🏻", "👵🏼", "👵🏽", "👵🏾", "👵🏿"]
}, {
	"code": "🙍",
	"keywords": ["frowning_person", "frown", "gesture"],
	"types": ["🙍🏻", "🙍🏼", "🙍🏽", "🙍🏾", "🙍🏿"]
}, {
	"code": "🙍‍♂️",
	"keywords": ["frowning_man"],
	"types": ["🙍🏻", "🙍🏼", "🙍🏽", "🙍🏾", "🙍🏿"]
}, {
	"code": "🙍‍♀️",
	"keywords": ["frowning_woman"],
	"types": ["🙍🏻", "🙍🏼", "🙍🏽", "🙍🏾", "🙍🏿"]
}, {
	"code": "🙎",
	"keywords": ["pouting_face", "gesture", "pouting"],
	"types": ["🙎🏻", "🙎🏼", "🙎🏽", "🙎🏾", "🙎🏿"]
}, {
	"code": "🙎‍♂️",
	"keywords": ["pouting_man"],
	"types": ["🙎🏻", "🙎🏼", "🙎🏽", "🙎🏾", "🙎🏿"]
}, {
	"code": "🙎‍♀️",
	"keywords": ["pouting_woman"],
	"types": ["🙎🏻", "🙎🏼", "🙎🏽", "🙎🏾", "🙎🏿"]
}, {
	"code": "🙅",
	"keywords": ["stop", "halt", "denied", "no_good", "forbidden", "gesture", "hand", "no", "not", "prohibited"],
	"types": ["🙅🏻", "🙅🏼", "🙅🏽", "🙅🏾", "🙅🏿"]
}, {
	"code": "🙅‍♂️",
	"keywords": ["stop", "halt", "denied", "no_good_man", "ng_man"],
	"types": ["🙅🏻", "🙅🏼", "🙅🏽", "🙅🏾", "🙅🏿"]
}, {
	"code": "🙅‍♀️",
	"keywords": ["stop", "halt", "denied", "no_good_woman", "ng_woman"],
	"types": ["🙅🏻", "🙅🏼", "🙅🏽", "🙅🏾", "🙅🏿"]
}, {
	"code": "🙆",
	"keywords": ["ok_person", "gesture", "hand", "ok"],
	"types": ["🙆🏻", "🙆🏼", "🙆🏽", "🙆🏾", "🙆🏿"]
}, {
	"code": "🙆‍♂️",
	"keywords": ["ok_man"],
	"types": ["🙆🏻", "🙆🏼", "🙆🏽", "🙆🏾", "🙆🏿"]
}, {
	"code": "🙆‍♀️",
	"keywords": ["ok_woman"],
	"types": ["🙆🏻", "🙆🏼", "🙆🏽", "🙆🏾", "🙆🏿"]
}, {
	"code": "💁",
	"keywords": ["tipping_hand_person", "information_desk_person", "hand", "help", "information", "sassy"],
	"types": ["💁🏻", "💁🏼", "💁🏽", "💁🏾", "💁🏿"]
}, {
	"code": "💁‍♂️",
	"keywords": ["information", "tipping_hand_man", "sassy_man"],
	"types": ["💁🏻", "💁🏼", "💁🏽", "💁🏾", "💁🏿"]
}, {
	"code": "💁‍♀️",
	"keywords": ["information", "tipping_hand_woman", "sassy_woman"],
	"types": ["💁🏻", "💁🏼", "💁🏽", "💁🏾", "💁🏿"]
}, {
	"code": "🙋",
	"keywords": ["raising_hand", "gesture", "hand", "happy", "raised"],
	"types": ["🙋🏻", "🙋🏼", "🙋🏽", "🙋🏾", "🙋🏿"]
}, {
	"code": "🙋‍♂️",
	"keywords": ["raising_hand_man"],
	"types": ["🙋🏻", "🙋🏼", "🙋🏽", "🙋🏾", "🙋🏿"]
}, {
	"code": "🙋‍♀️",
	"keywords": ["raising_hand_woman"],
	"types": ["🙋🏻", "🙋🏼", "🙋🏽", "🙋🏾", "🙋🏿"]
}, {
	"code": "🧏",
	"keywords": ["deaf_person"],
	"types": ["🧏🏻", "🧏🏼", "🧏🏽", "🧏🏾", "🧏🏿"]
}, {
	"code": "🧏‍♂️",
	"keywords": ["deaf_man"],
	"types": ["🧏🏻", "🧏🏼", "🧏🏽", "🧏🏾", "🧏🏿"]
}, {
	"code": "🧏‍♀️",
	"keywords": ["deaf_woman"],
	"types": ["🧏🏻", "🧏🏼", "🧏🏽", "🧏🏾", "🧏🏿"]
}, {
	"code": "🙇",
	"keywords": ["respect", "thanks", "bow", "apology", "gesture", "sorry"],
	"types": ["🙇🏻", "🙇🏼", "🙇🏽", "🙇🏾", "🙇🏿"]
}, {
	"code": "🙇‍♂️",
	"keywords": ["respect", "thanks", "bowing_man"],
	"types": ["🙇🏻", "🙇🏼", "🙇🏽", "🙇🏾", "🙇🏿"]
}, {
	"code": "🙇‍♀️",
	"keywords": ["respect", "thanks", "bowing_woman"],
	"types": ["🙇🏻", "🙇🏼", "🙇🏽", "🙇🏾", "🙇🏿"]
}, {
	"code": "🤦",
	"keywords": ["facepalm", "disbelief", "exasperation", "face", "palm"],
	"types": ["🤦🏻", "🤦🏼", "🤦🏽", "🤦🏾", "🤦🏿"]
}, {
	"code": "🤦‍♂️",
	"keywords": ["man_facepalming"],
	"types": ["🤦🏻", "🤦🏼", "🤦🏽", "🤦🏾", "🤦🏿"]
}, {
	"code": "🤦‍♀️",
	"keywords": ["woman_facepalming"],
	"types": ["🤦🏻", "🤦🏼", "🤦🏽", "🤦🏾", "🤦🏿"]
}, {
	"code": "🤷",
	"keywords": ["shrug", "doubt", "ignorance", "indifference"],
	"types": ["🤷🏻", "🤷🏼", "🤷🏽", "🤷🏾", "🤷🏿"]
}, {
	"code": "🤷‍♂️",
	"keywords": ["man_shrugging"],
	"types": ["🤷🏻", "🤷🏼", "🤷🏽", "🤷🏾", "🤷🏿"]
}, {
	"code": "🤷‍♀️",
	"keywords": ["woman_shrugging"],
	"types": ["🤷🏻", "🤷🏼", "🤷🏽", "🤷🏾", "🤷🏿"]
}, {
	"code": "🧑‍⚕️",
	"keywords": ["health_worker"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍⚕️",
	"keywords": ["doctor", "nurse", "man_health_worker"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍⚕️",
	"keywords": ["doctor", "nurse", "woman_health_worker"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🎓",
	"keywords": ["student"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🎓",
	"keywords": ["graduation", "man_student"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🎓",
	"keywords": ["graduation", "woman_student"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🏫",
	"keywords": ["teacher"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🏫",
	"keywords": ["school", "professor", "man_teacher"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🏫",
	"keywords": ["school", "professor", "woman_teacher"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍⚖️",
	"keywords": ["judge"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍⚖️",
	"keywords": ["justice", "man_judge"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍⚖️",
	"keywords": ["justice", "woman_judge"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🌾",
	"keywords": ["farmer"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🌾",
	"keywords": ["man_farmer"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🌾",
	"keywords": ["woman_farmer"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🍳",
	"keywords": ["cook"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🍳",
	"keywords": ["chef", "man_cook"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🍳",
	"keywords": ["chef", "woman_cook"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🔧",
	"keywords": ["mechanic"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🔧",
	"keywords": ["man_mechanic"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🔧",
	"keywords": ["woman_mechanic"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🏭",
	"keywords": ["factory_worker"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🏭",
	"keywords": ["man_factory_worker"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🏭",
	"keywords": ["woman_factory_worker"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍💼",
	"keywords": ["office_worker"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍💼",
	"keywords": ["business", "man_office_worker"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍💼",
	"keywords": ["business", "woman_office_worker"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🔬",
	"keywords": ["scientist"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🔬",
	"keywords": ["research", "man_scientist"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🔬",
	"keywords": ["research", "woman_scientist"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍💻",
	"keywords": ["technologist"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍💻",
	"keywords": ["coder", "man_technologist"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍💻",
	"keywords": ["coder", "woman_technologist"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🎤",
	"keywords": ["singer"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🎤",
	"keywords": ["rockstar", "man_singer"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🎤",
	"keywords": ["rockstar", "woman_singer"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🎨",
	"keywords": ["artist"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🎨",
	"keywords": ["painter", "man_artist"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🎨",
	"keywords": ["painter", "woman_artist"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍✈️",
	"keywords": ["pilot"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍✈️",
	"keywords": ["man_pilot"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍✈️",
	"keywords": ["woman_pilot"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🚀",
	"keywords": ["astronaut"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🚀",
	"keywords": ["space", "man_astronaut"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🚀",
	"keywords": ["space", "woman_astronaut"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🚒",
	"keywords": ["firefighter"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🚒",
	"keywords": ["man_firefighter"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🚒",
	"keywords": ["woman_firefighter"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "👮",
	"keywords": ["law", "police_officer", "cop", "officer", "police"],
	"types": ["👮🏻", "👮🏼", "👮🏽", "👮🏾", "👮🏿"]
}, {
	"code": "👮‍♂️",
	"keywords": ["law", "cop", "policeman"],
	"types": ["👮🏻", "👮🏼", "👮🏽", "👮🏾", "👮🏿"]
}, {
	"code": "👮‍♀️",
	"keywords": ["law", "cop", "policewoman"],
	"types": ["👮🏻", "👮🏼", "👮🏽", "👮🏾", "👮🏿"]
}, {
	"code": "🕵️",
	"keywords": ["sleuth", "detective"],
	"types": ["🕵🏻", "🕵🏼", "🕵🏽", "🕵🏾", "🕵🏿"]
}, {
	"code": "🕵️‍♂️",
	"keywords": ["sleuth", "male_detective"],
	"types": ["🕵🏻", "🕵🏼", "🕵🏽", "🕵🏾", "🕵🏿"]
}, {
	"code": "🕵️‍♀️",
	"keywords": ["sleuth", "female_detective"],
	"types": ["🕵🏻", "🕵🏼", "🕵🏽", "🕵🏾", "🕵🏿"]
}, {
	"code": "💂",
	"keywords": ["guard", "guardsman"],
	"types": ["💂🏻", "💂🏼", "💂🏽", "💂🏾", "💂🏿"]
}, {
	"code": "💂‍♂️",
	"keywords": ["guardsman"],
	"types": ["💂🏻", "💂🏼", "💂🏽", "💂🏾", "💂🏿"]
}, {
	"code": "💂‍♀️",
	"keywords": ["guardswoman"],
	"types": ["💂🏻", "💂🏼", "💂🏽", "💂🏾", "💂🏿"]
}, {
	"code": "🥷",
	"keywords": ["ninja"],
	"types": ["🥷🏻", "🥷🏼", "🥷🏽", "🥷🏾", "🥷🏿"]
}, {
	"code": "👷",
	"keywords": ["helmet", "construction_worker", "construction", "hat", "worker"],
	"types": ["👷🏻", "👷🏼", "👷🏽", "👷🏾", "👷🏿"]
}, {
	"code": "👷‍♂️",
	"keywords": ["helmet", "construction_worker_man"],
	"types": ["👷🏻", "👷🏼", "👷🏽", "👷🏾", "👷🏿"]
}, {
	"code": "👷‍♀️",
	"keywords": ["helmet", "construction_worker_woman"],
	"types": ["👷🏻", "👷🏼", "👷🏽", "👷🏾", "👷🏿"]
}, {
	"code": "🤴",
	"keywords": ["crown", "royal", "prince"],
	"types": ["🤴🏻", "🤴🏼", "🤴🏽", "🤴🏾", "🤴🏿"]
}, {
	"code": "👸",
	"keywords": ["crown", "royal", "princess", "fairy tale", "fantasy"],
	"types": ["👸🏻", "👸🏼", "👸🏽", "👸🏾", "👸🏿"]
}, {
	"code": "👳",
	"keywords": ["person_with_turban", "man", "turban"],
	"types": ["👳🏻", "👳🏼", "👳🏽", "👳🏾", "👳🏿"]
}, {
	"code": "👳‍♂️",
	"keywords": ["man_with_turban"],
	"types": ["👳🏻", "👳🏼", "👳🏽", "👳🏾", "👳🏿"]
}, {
	"code": "👳‍♀️",
	"keywords": ["woman_with_turban"],
	"types": ["👳🏻", "👳🏼", "👳🏽", "👳🏾", "👳🏿"]
}, {
	"code": "👲",
	"keywords": ["man_with_gua_pi_mao", "gua pi mao", "hat", "man"],
	"types": ["👲🏻", "👲🏼", "👲🏽", "👲🏾", "👲🏿"]
}, {
	"code": "🧕",
	"keywords": ["hijab", "woman_with_headscarf"],
	"types": ["🧕🏻", "🧕🏼", "🧕🏽", "🧕🏾", "🧕🏿"]
}, {
	"code": "🤵",
	"keywords": ["groom", "marriage", "wedding", "person_in_tuxedo", "man", "tuxedo"],
	"types": ["🤵🏻", "🤵🏼", "🤵🏽", "🤵🏾", "🤵🏿"]
}, {
	"code": "🤵‍♂️",
	"keywords": ["man_in_tuxedo"],
	"types": ["🤵🏻", "🤵🏼", "🤵🏽", "🤵🏾", "🤵🏿"]
}, {
	"code": "🤵‍♀️",
	"keywords": ["woman_in_tuxedo"],
	"types": ["🤵🏻", "🤵🏼", "🤵🏽", "🤵🏾", "🤵🏿"]
}, {
	"code": "👰",
	"keywords": ["marriage", "wedding", "person_with_veil", "bride", "veil"],
	"types": ["👰🏻", "👰🏼", "👰🏽", "👰🏾", "👰🏿"]
}, {
	"code": "👰‍♂️",
	"keywords": ["man_with_veil"],
	"types": ["👰🏻", "👰🏼", "👰🏽", "👰🏾", "👰🏿"]
}, {
	"code": "👰‍♀️",
	"keywords": ["woman_with_veil", "bride_with_veil"],
	"types": ["👰🏻", "👰🏼", "👰🏽", "👰🏾", "👰🏿"]
}, {
	"code": "🤰",
	"keywords": ["pregnant_woman", "pregnant", "woman"],
	"types": ["🤰🏻", "🤰🏼", "🤰🏽", "🤰🏾", "🤰🏿"]
}, {
	"code": "🤱",
	"keywords": ["nursing", "breast_feeding"],
	"types": ["🤱🏻", "🤱🏼", "🤱🏽", "🤱🏾", "🤱🏿"]
}, {
	"code": "👩‍🍼",
	"keywords": ["woman_feeding_baby"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "👨‍🍼",
	"keywords": ["man_feeding_baby"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "🧑‍🍼",
	"keywords": ["person_feeding_baby"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👼",
	"keywords": ["angel", "baby", "face", "fairy tale", "fantasy"],
	"types": ["👼🏻", "👼🏼", "👼🏽", "👼🏾", "👼🏿"]
}, {
	"code": "🎅",
	"keywords": ["christmas", "santa", "activity", "celebration", "fairy tale", "fantasy", "father"],
	"types": ["🎅🏻", "🎅🏼", "🎅🏽", "🎅🏾", "🎅🏿"]
}, {
	"code": "🤶",
	"keywords": ["santa", "mrs_claus", "christmas", "mother", "mrs. claus"],
	"types": ["🤶🏻", "🤶🏼", "🤶🏽", "🤶🏾", "🤶🏿"]
}, {
	"code": "🧑‍🎄",
	"keywords": ["mx_claus"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "🦸",
	"keywords": ["superhero"],
	"types": ["🦸🏻", "🦸🏼", "🦸🏽", "🦸🏾", "🦸🏿"]
}, {
	"code": "🦸‍♂️",
	"keywords": ["superhero_man"],
	"types": ["🦸🏻", "🦸🏼", "🦸🏽", "🦸🏾", "🦸🏿"]
}, {
	"code": "🦸‍♀️",
	"keywords": ["superhero_woman"],
	"types": ["🦸🏻", "🦸🏼", "🦸🏽", "🦸🏾", "🦸🏿"]
}, {
	"code": "🦹",
	"keywords": ["supervillain"],
	"types": ["🦹🏻", "🦹🏼", "🦹🏽", "🦹🏾", "🦹🏿"]
}, {
	"code": "🦹‍♂️",
	"keywords": ["supervillain_man"],
	"types": ["🦹🏻", "🦹🏼", "🦹🏽", "🦹🏾", "🦹🏿"]
}, {
	"code": "🦹‍♀️",
	"keywords": ["supervillain_woman"],
	"types": ["🦹🏻", "🦹🏼", "🦹🏽", "🦹🏾", "🦹🏿"]
}, {
	"code": "🧙",
	"keywords": ["wizard", "mage"],
	"types": ["🧙🏻", "🧙🏼", "🧙🏽", "🧙🏾", "🧙🏿"]
}, {
	"code": "🧙‍♂️",
	"keywords": ["wizard", "mage_man"],
	"types": ["🧙🏻", "🧙🏼", "🧙🏽", "🧙🏾", "🧙🏿"]
}, {
	"code": "🧙‍♀️",
	"keywords": ["wizard", "mage_woman"],
	"types": ["🧙🏻", "🧙🏼", "🧙🏽", "🧙🏾", "🧙🏿"]
}, {
	"code": "🧚",
	"keywords": ["fairy"],
	"types": ["🧚🏻", "🧚🏼", "🧚🏽", "🧚🏾", "🧚🏿"]
}, {
	"code": "🧚‍♂️",
	"keywords": ["fairy_man"],
	"types": ["🧚🏻", "🧚🏼", "🧚🏽", "🧚🏾", "🧚🏿"]
}, {
	"code": "🧚‍♀️",
	"keywords": ["fairy_woman"],
	"types": ["🧚🏻", "🧚🏼", "🧚🏽", "🧚🏾", "🧚🏿"]
}, {
	"code": "🧛",
	"keywords": ["vampire"],
	"types": ["🧛🏻", "🧛🏼", "🧛🏽", "🧛🏾", "🧛🏿"]
}, {
	"code": "🧛‍♂️",
	"keywords": ["vampire_man"],
	"types": ["🧛🏻", "🧛🏼", "🧛🏽", "🧛🏾", "🧛🏿"]
}, {
	"code": "🧛‍♀️",
	"keywords": ["vampire_woman"],
	"types": ["🧛🏻", "🧛🏼", "🧛🏽", "🧛🏾", "🧛🏿"]
}, {
	"code": "🧜",
	"keywords": ["merperson"],
	"types": ["🧜🏻", "🧜🏼", "🧜🏽", "🧜🏾", "🧜🏿"]
}, {
	"code": "🧜‍♂️",
	"keywords": ["merman"],
	"types": ["🧜🏻", "🧜🏼", "🧜🏽", "🧜🏾", "🧜🏿"]
}, {
	"code": "🧜‍♀️",
	"keywords": ["mermaid"],
	"types": ["🧜🏻", "🧜🏼", "🧜🏽", "🧜🏾", "🧜🏿"]
}, {
	"code": "🧝",
	"keywords": ["elf"],
	"types": ["🧝🏻", "🧝🏼", "🧝🏽", "🧝🏾", "🧝🏿"]
}, {
	"code": "🧝‍♂️",
	"keywords": ["elf_man"],
	"types": ["🧝🏻", "🧝🏼", "🧝🏽", "🧝🏾", "🧝🏿"]
}, {
	"code": "🧝‍♀️",
	"keywords": ["elf_woman"],
	"types": ["🧝🏻", "🧝🏼", "🧝🏽", "🧝🏾", "🧝🏿"]
}, {
	"code": "🧞",
	"keywords": ["genie"]
}, {
	"code": "🧞‍♂️",
	"keywords": ["genie_man"]
}, {
	"code": "🧞‍♀️",
	"keywords": ["genie_woman"]
}, {
	"code": "🧟",
	"keywords": ["zombie"]
}, {
	"code": "🧟‍♂️",
	"keywords": ["zombie_man"]
}, {
	"code": "🧟‍♀️",
	"keywords": ["zombie_woman"]
}, {
	"code": "💆",
	"keywords": ["spa", "massage", "salon"],
	"types": ["💆🏻", "💆🏼", "💆🏽", "💆🏾", "💆🏿"]
}, {
	"code": "💆‍♂️",
	"keywords": ["spa", "massage_man"],
	"types": ["💆🏻", "💆🏼", "💆🏽", "💆🏾", "💆🏿"]
}, {
	"code": "💆‍♀️",
	"keywords": ["spa", "massage_woman"],
	"types": ["💆🏻", "💆🏼", "💆🏽", "💆🏾", "💆🏿"]
}, {
	"code": "💇",
	"keywords": ["beauty", "haircut", "barber", "parlor"],
	"types": ["💇🏻", "💇🏼", "💇🏽", "💇🏾", "💇🏿"]
}, {
	"code": "💇‍♂️",
	"keywords": ["haircut_man"],
	"types": ["💇🏻", "💇🏼", "💇🏽", "💇🏾", "💇🏿"]
}, {
	"code": "💇‍♀️",
	"keywords": ["haircut_woman"],
	"types": ["💇🏻", "💇🏼", "💇🏽", "💇🏾", "💇🏿"]
}, {
	"code": "🚶",
	"keywords": ["walking", "hike", "pedestrian", "walk"],
	"types": ["🚶🏻", "🚶🏼", "🚶🏽", "🚶🏾", "🚶🏿"]
}, {
	"code": "🚶‍♂️",
	"keywords": ["walking_man"],
	"types": ["🚶🏻", "🚶🏼", "🚶🏽", "🚶🏾", "🚶🏿"]
}, {
	"code": "🚶‍♀️",
	"keywords": ["walking_woman"],
	"types": ["🚶🏻", "🚶🏼", "🚶🏽", "🚶🏾", "🚶🏿"]
}, {
	"code": "🧍",
	"keywords": ["standing_person"],
	"types": ["🧍🏻", "🧍🏼", "🧍🏽", "🧍🏾", "🧍🏿"]
}, {
	"code": "🧍‍♂️",
	"keywords": ["standing_man"],
	"types": ["🧍🏻", "🧍🏼", "🧍🏽", "🧍🏾", "🧍🏿"]
}, {
	"code": "🧍‍♀️",
	"keywords": ["standing_woman"],
	"types": ["🧍🏻", "🧍🏼", "🧍🏽", "🧍🏾", "🧍🏿"]
}, {
	"code": "🧎",
	"keywords": ["kneeling_person"],
	"types": ["🧎🏻", "🧎🏼", "🧎🏽", "🧎🏾", "🧎🏿"]
}, {
	"code": "🧎‍♂️",
	"keywords": ["kneeling_man"],
	"types": ["🧎🏻", "🧎🏼", "🧎🏽", "🧎🏾", "🧎🏿"]
}, {
	"code": "🧎‍♀️",
	"keywords": ["kneeling_woman"],
	"types": ["🧎🏻", "🧎🏼", "🧎🏽", "🧎🏾", "🧎🏿"]
}, {
	"code": "🧑‍🦯",
	"keywords": ["person_with_probing_cane"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🦯",
	"keywords": ["man_with_probing_cane"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🦯",
	"keywords": ["woman_with_probing_cane"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🦼",
	"keywords": ["person_in_motorized_wheelchair"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🦼",
	"keywords": ["man_in_motorized_wheelchair"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🦼",
	"keywords": ["woman_in_motorized_wheelchair"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🧑‍🦽",
	"keywords": ["person_in_manual_wheelchair"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👨‍🦽",
	"keywords": ["man_in_manual_wheelchair"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍🦽",
	"keywords": ["woman_in_manual_wheelchair"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "🏃",
	"keywords": ["exercise", "workout", "marathon", "runner", "running"],
	"types": ["🏃🏻", "🏃🏼", "🏃🏽", "🏃🏾", "🏃🏿"]
}, {
	"code": "🏃‍♂️",
	"keywords": ["exercise", "workout", "marathon", "running_man"],
	"types": ["🏃🏻", "🏃🏼", "🏃🏽", "🏃🏾", "🏃🏿"]
}, {
	"code": "🏃‍♀️",
	"keywords": ["exercise", "workout", "marathon", "running_woman"],
	"types": ["🏃🏻", "🏃🏼", "🏃🏽", "🏃🏾", "🏃🏿"]
}, {
	"code": "💃",
	"keywords": ["dress", "woman_dancing", "dancer"],
	"types": ["💃🏻", "💃🏼", "💃🏽", "💃🏾", "💃🏿"]
}, {
	"code": "🕺",
	"keywords": ["dancer", "man_dancing", "dance", "man"],
	"types": ["🕺🏻", "🕺🏼", "🕺🏽", "🕺🏾", "🕺🏿"]
}, {
	"code": "🕴️",
	"keywords": ["business_suit_levitating"],
	"types": ["🕴🏻", "🕴🏼", "🕴🏽", "🕴🏾", "🕴🏿"]
}, {
	"code": "👯",
	"keywords": ["bunny", "dancers", "dancer", "ear", "girl", "woman"]
}, {
	"code": "👯‍♂️",
	"keywords": ["bunny", "dancing_men"]
}, {
	"code": "👯‍♀️",
	"keywords": ["bunny", "dancing_women"]
}, {
	"code": "🧖",
	"keywords": ["steamy", "sauna_person"],
	"types": ["🧖🏻", "🧖🏼", "🧖🏽", "🧖🏾", "🧖🏿"]
}, {
	"code": "🧖‍♂️",
	"keywords": ["steamy", "sauna_man"],
	"types": ["🧖🏻", "🧖🏼", "🧖🏽", "🧖🏾", "🧖🏿"]
}, {
	"code": "🧖‍♀️",
	"keywords": ["steamy", "sauna_woman"],
	"types": ["🧖🏻", "🧖🏼", "🧖🏽", "🧖🏾", "🧖🏿"]
}, {
	"code": "🧗",
	"keywords": ["bouldering", "climbing"],
	"types": ["🧗🏻", "🧗🏼", "🧗🏽", "🧗🏾", "🧗🏿"]
}, {
	"code": "🧗‍♂️",
	"keywords": ["bouldering", "climbing_man"],
	"types": ["🧗🏻", "🧗🏼", "🧗🏽", "🧗🏾", "🧗🏿"]
}, {
	"code": "🧗‍♀️",
	"keywords": ["bouldering", "climbing_woman"],
	"types": ["🧗🏻", "🧗🏼", "🧗🏽", "🧗🏾", "🧗🏿"]
}, {
	"code": "🤺",
	"keywords": ["person_fencing", "fencer", "fencing", "sword"]
}, {
	"code": "🏇",
	"keywords": ["horse_racing", "horse", "jockey", "racehorse", "racing"],
	"types": ["🏇🏻", "🏇🏼", "🏇🏽", "🏇🏾", "🏇🏿"]
}, {
	"code": "⛷️",
	"keywords": ["skier"]
}, {
	"code": "🏂",
	"keywords": ["snowboarder", "ski", "snow", "snowboard"],
	"types": ["🏂🏻", "🏂🏼", "🏂🏽", "🏂🏾", "🏂🏿"]
}, {
	"code": "🏌️",
	"keywords": ["golfing"],
	"types": ["🏌🏻", "🏌🏼", "🏌🏽", "🏌🏾", "🏌🏿"]
}, {
	"code": "🏌️‍♂️",
	"keywords": ["golfing_man"],
	"types": ["🏌🏻", "🏌🏼", "🏌🏽", "🏌🏾", "🏌🏿"]
}, {
	"code": "🏌️‍♀️",
	"keywords": ["golfing_woman"],
	"types": ["🏌🏻", "🏌🏼", "🏌🏽", "🏌🏾", "🏌🏿"]
}, {
	"code": "🏄",
	"keywords": ["surfer", "surfing"],
	"types": ["🏄🏻", "🏄🏼", "🏄🏽", "🏄🏾", "🏄🏿"]
}, {
	"code": "🏄‍♂️",
	"keywords": ["surfing_man"],
	"types": ["🏄🏻", "🏄🏼", "🏄🏽", "🏄🏾", "🏄🏿"]
}, {
	"code": "🏄‍♀️",
	"keywords": ["surfing_woman"],
	"types": ["🏄🏻", "🏄🏼", "🏄🏽", "🏄🏾", "🏄🏿"]
}, {
	"code": "🚣",
	"keywords": ["rowboat", "boat", "vehicle"],
	"types": ["🚣🏻", "🚣🏼", "🚣🏽", "🚣🏾", "🚣🏿"]
}, {
	"code": "🚣‍♂️",
	"keywords": ["rowing_man"],
	"types": ["🚣🏻", "🚣🏼", "🚣🏽", "🚣🏾", "🚣🏿"]
}, {
	"code": "🚣‍♀️",
	"keywords": ["rowing_woman"],
	"types": ["🚣🏻", "🚣🏼", "🚣🏽", "🚣🏾", "🚣🏿"]
}, {
	"code": "🏊",
	"keywords": ["swimmer", "swim"],
	"types": ["🏊🏻", "🏊🏼", "🏊🏽", "🏊🏾", "🏊🏿"]
}, {
	"code": "🏊‍♂️",
	"keywords": ["swimming_man"],
	"types": ["🏊🏻", "🏊🏼", "🏊🏽", "🏊🏾", "🏊🏿"]
}, {
	"code": "🏊‍♀️",
	"keywords": ["swimming_woman"],
	"types": ["🏊🏻", "🏊🏼", "🏊🏽", "🏊🏾", "🏊🏿"]
}, {
	"code": "⛹️",
	"keywords": ["basketball", "bouncing_ball_person"],
	"types": ["⛹🏻", "⛹🏼", "⛹🏽", "⛹🏾", "⛹🏿"]
}, {
	"code": "⛹️‍♂️",
	"keywords": ["bouncing_ball_man", "basketball_man"],
	"types": ["⛹🏻", "⛹🏼", "⛹🏽", "⛹🏾", "⛹🏿"]
}, {
	"code": "⛹️‍♀️",
	"keywords": ["bouncing_ball_woman", "basketball_woman"],
	"types": ["⛹🏻", "⛹🏼", "⛹🏽", "⛹🏾", "⛹🏿"]
}, {
	"code": "🏋️",
	"keywords": ["gym", "workout", "weight_lifting"],
	"types": ["🏋🏻", "🏋🏼", "🏋🏽", "🏋🏾", "🏋🏿"]
}, {
	"code": "🏋️‍♂️",
	"keywords": ["gym", "workout", "weight_lifting_man"],
	"types": ["🏋🏻", "🏋🏼", "🏋🏽", "🏋🏾", "🏋🏿"]
}, {
	"code": "🏋️‍♀️",
	"keywords": ["gym", "workout", "weight_lifting_woman"],
	"types": ["🏋🏻", "🏋🏼", "🏋🏽", "🏋🏾", "🏋🏿"]
}, {
	"code": "🚴",
	"keywords": ["bicyclist", "bicycle", "bike", "cyclist"],
	"types": ["🚴🏻", "🚴🏼", "🚴🏽", "🚴🏾", "🚴🏿"]
}, {
	"code": "🚴‍♂️",
	"keywords": ["biking_man"],
	"types": ["🚴🏻", "🚴🏼", "🚴🏽", "🚴🏾", "🚴🏿"]
}, {
	"code": "🚴‍♀️",
	"keywords": ["biking_woman"],
	"types": ["🚴🏻", "🚴🏼", "🚴🏽", "🚴🏾", "🚴🏿"]
}, {
	"code": "🚵",
	"keywords": ["mountain_bicyclist", "bicycle", "bicyclist", "bike", "cyclist", "mountain"],
	"types": ["🚵🏻", "🚵🏼", "🚵🏽", "🚵🏾", "🚵🏿"]
}, {
	"code": "🚵‍♂️",
	"keywords": ["mountain_biking_man"],
	"types": ["🚵🏻", "🚵🏼", "🚵🏽", "🚵🏾", "🚵🏿"]
}, {
	"code": "🚵‍♀️",
	"keywords": ["mountain_biking_woman"],
	"types": ["🚵🏻", "🚵🏼", "🚵🏽", "🚵🏾", "🚵🏿"]
}, {
	"code": "🤸",
	"keywords": ["cartwheeling", "cartwheel", "gymnastics"],
	"types": ["🤸🏻", "🤸🏼", "🤸🏽", "🤸🏾", "🤸🏿"]
}, {
	"code": "🤸‍♂️",
	"keywords": ["man_cartwheeling"],
	"types": ["🤸🏻", "🤸🏼", "🤸🏽", "🤸🏾", "🤸🏿"]
}, {
	"code": "🤸‍♀️",
	"keywords": ["woman_cartwheeling"],
	"types": ["🤸🏻", "🤸🏼", "🤸🏽", "🤸🏾", "🤸🏿"]
}, {
	"code": "🤼",
	"keywords": ["wrestling", "wrestle", "wrestler"]
}, {
	"code": "🤼‍♂️",
	"keywords": ["men_wrestling"]
}, {
	"code": "🤼‍♀️",
	"keywords": ["women_wrestling"]
}, {
	"code": "🤽",
	"keywords": ["water_polo", "polo", "water"],
	"types": ["🤽🏻", "🤽🏼", "🤽🏽", "🤽🏾", "🤽🏿"]
}, {
	"code": "🤽‍♂️",
	"keywords": ["man_playing_water_polo"],
	"types": ["🤽🏻", "🤽🏼", "🤽🏽", "🤽🏾", "🤽🏿"]
}, {
	"code": "🤽‍♀️",
	"keywords": ["woman_playing_water_polo"],
	"types": ["🤽🏻", "🤽🏼", "🤽🏽", "🤽🏾", "🤽🏿"]
}, {
	"code": "🤾",
	"keywords": ["handball_person", "ball", "handball"],
	"types": ["🤾🏻", "🤾🏼", "🤾🏽", "🤾🏾", "🤾🏿"]
}, {
	"code": "🤾‍♂️",
	"keywords": ["man_playing_handball"],
	"types": ["🤾🏻", "🤾🏼", "🤾🏽", "🤾🏾", "🤾🏿"]
}, {
	"code": "🤾‍♀️",
	"keywords": ["woman_playing_handball"],
	"types": ["🤾🏻", "🤾🏼", "🤾🏽", "🤾🏾", "🤾🏿"]
}, {
	"code": "🤹",
	"keywords": ["juggling_person", "balance", "juggle", "multitask", "skill"],
	"types": ["🤹🏻", "🤹🏼", "🤹🏽", "🤹🏾", "🤹🏿"]
}, {
	"code": "🤹‍♂️",
	"keywords": ["man_juggling"],
	"types": ["🤹🏻", "🤹🏼", "🤹🏽", "🤹🏾", "🤹🏿"]
}, {
	"code": "🤹‍♀️",
	"keywords": ["woman_juggling"],
	"types": ["🤹🏻", "🤹🏼", "🤹🏽", "🤹🏾", "🤹🏿"]
}, {
	"code": "🧘",
	"keywords": ["meditation", "lotus_position"],
	"types": ["🧘🏻", "🧘🏼", "🧘🏽", "🧘🏾", "🧘🏿"]
}, {
	"code": "🧘‍♂️",
	"keywords": ["meditation", "lotus_position_man"],
	"types": ["🧘🏻", "🧘🏼", "🧘🏽", "🧘🏾", "🧘🏿"]
}, {
	"code": "🧘‍♀️",
	"keywords": ["meditation", "lotus_position_woman"],
	"types": ["🧘🏻", "🧘🏼", "🧘🏽", "🧘🏾", "🧘🏿"]
}, {
	"code": "🛀",
	"keywords": ["shower", "bath", "bathtub"],
	"types": ["🛀🏻", "🛀🏼", "🛀🏽", "🛀🏾", "🛀🏿"]
}, {
	"code": "🛌",
	"keywords": ["sleeping_bed", "hotel", "sleep"],
	"types": ["🛌🏻", "🛌🏼", "🛌🏽", "🛌🏾", "🛌🏿"]
}, {
	"code": "🧑‍🤝‍🧑",
	"keywords": ["couple", "date", "people_holding_hands"],
	"types": ["🧑🏻", "🧑🏼", "🧑🏽", "🧑🏾", "🧑🏿"]
}, {
	"code": "👭",
	"keywords": ["couple", "date", "two_women_holding_hands", "hand", "hold", "woman"],
	"types": ["👭🏻", "👭🏼", "👭🏽", "👭🏾", "👭🏿"]
}, {
	"code": "👫",
	"keywords": ["date", "couple", "hand", "hold", "man", "woman"],
	"types": ["👫🏻", "👫🏼", "👫🏽", "👫🏾", "👫🏿"]
}, {
	"code": "👬",
	"keywords": ["couple", "date", "two_men_holding_hands", "gemini", "hand", "hold", "man", "twins", "zodiac"],
	"types": ["👬🏻", "👬🏼", "👬🏽", "👬🏾", "👬🏿"]
}, {
	"code": "💏",
	"keywords": ["couplekiss", "couple", "kiss", "romance"],
	"types": ["💏🏻", "💏🏼", "💏🏽", "💏🏾", "💏🏿"]
}, {
	"code": "👩‍❤️‍💋‍👨",
	"keywords": ["couplekiss_man_woman"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "👨‍❤️‍💋‍👨",
	"keywords": ["couplekiss_man_man"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍❤️‍💋‍👩",
	"keywords": ["couplekiss_woman_woman"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "💑",
	"keywords": ["couple_with_heart", "couple", "heart", "love", "romance"],
	"types": ["💑🏻", "💑🏼", "💑🏽", "💑🏾", "💑🏿"]
}, {
	"code": "👩‍❤️‍👨",
	"keywords": ["couple_with_heart_woman_man"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "👨‍❤️‍👨",
	"keywords": ["couple_with_heart_man_man"],
	"types": ["👨🏻", "👨🏼", "👨🏽", "👨🏾", "👨🏿"]
}, {
	"code": "👩‍❤️‍👩",
	"keywords": ["couple_with_heart_woman_woman"],
	"types": ["👩🏻", "👩🏼", "👩🏽", "👩🏾", "👩🏿"]
}, {
	"code": "👪",
	"keywords": ["home", "parents", "child", "family", "father", "mother"]
}, {
	"code": "👨‍👩‍👦",
	"keywords": ["family_man_woman_boy", "boy", "family", "man", "woman"]
}, {
	"code": "👨‍👩‍👧",
	"keywords": ["family_man_woman_girl", "family", "girl", "man", "woman"]
}, {
	"code": "👨‍👩‍👧‍👦",
	"keywords": ["family_man_woman_girl_boy", "boy", "family", "girl", "man", "woman"]
}, {
	"code": "👨‍👩‍👦‍👦",
	"keywords": ["family_man_woman_boy_boy", "boy", "family", "man", "woman"]
}, {
	"code": "👨‍👩‍👧‍👧",
	"keywords": ["family_man_woman_girl_girl", "family", "girl", "man", "woman"]
}, {
	"code": "👨‍👨‍👦",
	"keywords": ["family_man_man_boy", "boy", "family", "man"]
}, {
	"code": "👨‍👨‍👧",
	"keywords": ["family_man_man_girl", "family", "girl", "man"]
}, {
	"code": "👨‍👨‍👧‍👦",
	"keywords": ["family_man_man_girl_boy", "boy", "family", "girl", "man"]
}, {
	"code": "👨‍👨‍👦‍👦",
	"keywords": ["family_man_man_boy_boy", "boy", "family", "man"]
}, {
	"code": "👨‍👨‍👧‍👧",
	"keywords": ["family_man_man_girl_girl", "family", "girl", "man"]
}, {
	"code": "👩‍👩‍👦",
	"keywords": ["family_woman_woman_boy", "boy", "family", "woman"]
}, {
	"code": "👩‍👩‍👧",
	"keywords": ["family_woman_woman_girl", "family", "girl", "woman"]
}, {
	"code": "👩‍👩‍👧‍👦",
	"keywords": ["family_woman_woman_girl_boy", "boy", "family", "girl", "woman"]
}, {
	"code": "👩‍👩‍👦‍👦",
	"keywords": ["family_woman_woman_boy_boy", "boy", "family", "woman"]
}, {
	"code": "👩‍👩‍👧‍👧",
	"keywords": ["family_woman_woman_girl_girl", "family", "girl", "woman"]
}, {
	"code": "👨‍👦",
	"keywords": ["family_man_boy"]
}, {
	"code": "👨‍👦‍👦",
	"keywords": ["family_man_boy_boy"]
}, {
	"code": "👨‍👧",
	"keywords": ["family_man_girl"]
}, {
	"code": "👨‍👧‍👦",
	"keywords": ["family_man_girl_boy"]
}, {
	"code": "👨‍👧‍👧",
	"keywords": ["family_man_girl_girl"]
}, {
	"code": "👩‍👦",
	"keywords": ["family_woman_boy"]
}, {
	"code": "👩‍👦‍👦",
	"keywords": ["family_woman_boy_boy"]
}, {
	"code": "👩‍👧",
	"keywords": ["family_woman_girl"]
}, {
	"code": "👩‍👧‍👦",
	"keywords": ["family_woman_girl_boy"]
}, {
	"code": "👩‍👧‍👧",
	"keywords": ["family_woman_girl_girl"]
}, {
	"code": "🗣️",
	"keywords": ["speaking_head"]
}, {
	"code": "👤",
	"keywords": ["user", "bust_in_silhouette", "bust", "silhouette"]
}, {
	"code": "👥",
	"keywords": ["users", "group", "team", "busts_in_silhouette", "bust", "silhouette"]
}, {
	"code": "🫂",
	"keywords": ["people_hugging"]
}, {
	"code": "👣",
	"keywords": ["feet", "tracks", "footprints", "body", "clothing", "footprint", "print"]
}, {
	"code": "animalsAndNature",
	"header": true
}, {
	"code": "🐵",
	"keywords": ["monkey_face", "face", "monkey"]
}, {
	"code": "🐒",
	"keywords": ["monkey"]
}, {
	"code": "🦍",
	"keywords": ["gorilla"]
}, {
	"code": "🦧",
	"keywords": ["orangutan"]
}, {
	"code": "🐶",
	"keywords": ["pet", "dog", "face"]
}, {
	"code": "🐕",
	"keywords": ["dog2", "dog", "pet"]
}, {
	"code": "🦮",
	"keywords": ["guide_dog"]
}, {
	"code": "🐕‍🦺",
	"keywords": ["service_dog"]
}, {
	"code": "🐩",
	"keywords": ["dog", "poodle"]
}, {
	"code": "🐺",
	"keywords": ["wolf", "face"]
}, {
	"code": "🦊",
	"keywords": ["fox_face", "face", "fox"]
}, {
	"code": "🦝",
	"keywords": ["raccoon"]
}, {
	"code": "🐱",
	"keywords": ["pet", "cat", "face"]
}, {
	"code": "🐈",
	"keywords": ["cat2", "cat", "pet"]
}, {
	"code": "🐈‍⬛",
	"keywords": ["black_cat"]
}, {
	"code": "🦁",
	"keywords": ["lion", "face", "leo", "zodiac"]
}, {
	"code": "🐯",
	"keywords": ["tiger", "face"]
}, {
	"code": "🐅",
	"keywords": ["tiger2", "tiger"]
}, {
	"code": "🐆",
	"keywords": ["leopard"]
}, {
	"code": "🐴",
	"keywords": ["horse", "face"]
}, {
	"code": "🐎",
	"keywords": ["speed", "racehorse", "horse", "racing"]
}, {
	"code": "🦄",
	"keywords": ["unicorn", "face"]
}, {
	"code": "🦓",
	"keywords": ["zebra"]
}, {
	"code": "🦌",
	"keywords": ["deer"]
}, {
	"code": "🦬",
	"keywords": ["bison"]
}, {
	"code": "🐮",
	"keywords": ["cow", "face"]
}, {
	"code": "🐂",
	"keywords": ["ox", "bull", "taurus", "zodiac"]
}, {
	"code": "🐃",
	"keywords": ["water_buffalo", "buffalo", "water"]
}, {
	"code": "🐄",
	"keywords": ["cow2", "cow"]
}, {
	"code": "🐷",
	"keywords": ["pig", "face"]
}, {
	"code": "🐖",
	"keywords": ["pig2", "pig", "sow"]
}, {
	"code": "🐗",
	"keywords": ["boar", "pig"]
}, {
	"code": "🐽",
	"keywords": ["pig_nose", "face", "nose", "pig"]
}, {
	"code": "🐏",
	"keywords": ["ram", "aries", "sheep", "zodiac"]
}, {
	"code": "🐑",
	"keywords": ["sheep", "ewe"]
}, {
	"code": "🐐",
	"keywords": ["goat", "capricorn", "zodiac"]
}, {
	"code": "🐪",
	"keywords": ["desert", "dromedary_camel", "camel", "dromedary", "hump"]
}, {
	"code": "🐫",
	"keywords": ["camel", "bactrian", "hump"]
}, {
	"code": "🦙",
	"keywords": ["llama"]
}, {
	"code": "🦒",
	"keywords": ["giraffe"]
}, {
	"code": "🐘",
	"keywords": ["elephant"]
}, {
	"code": "🦣",
	"keywords": ["mammoth"]
}, {
	"code": "🦏",
	"keywords": ["rhinoceros"]
}, {
	"code": "🦛",
	"keywords": ["hippopotamus"]
}, {
	"code": "🐭",
	"keywords": ["mouse", "face"]
}, {
	"code": "🐁",
	"keywords": ["mouse2", "mouse"]
}, {
	"code": "🐀",
	"keywords": ["rat"]
}, {
	"code": "🐹",
	"keywords": ["pet", "hamster", "face"]
}, {
	"code": "🐰",
	"keywords": ["bunny", "rabbit", "face", "pet"]
}, {
	"code": "🐇",
	"keywords": ["rabbit2", "bunny", "pet", "rabbit"]
}, {
	"code": "🐿️",
	"keywords": ["chipmunk"]
}, {
	"code": "🦫",
	"keywords": ["beaver"]
}, {
	"code": "🦔",
	"keywords": ["hedgehog"]
}, {
	"code": "🦇",
	"keywords": ["bat", "vampire"]
}, {
	"code": "🐻",
	"keywords": ["bear", "face"]
}, {
	"code": "🐻‍❄️",
	"keywords": ["polar_bear"]
}, {
	"code": "🐨",
	"keywords": ["koala", "bear"]
}, {
	"code": "🐼",
	"keywords": ["panda_face", "face", "panda"]
}, {
	"code": "🦥",
	"keywords": ["sloth"]
}, {
	"code": "🦦",
	"keywords": ["otter"]
}, {
	"code": "🦨",
	"keywords": ["skunk"]
}, {
	"code": "🦘",
	"keywords": ["kangaroo"]
}, {
	"code": "🦡",
	"keywords": ["badger"]
}, {
	"code": "🐾",
	"keywords": ["feet", "paw_prints", "paw", "print"]
}, {
	"code": "🦃",
	"keywords": ["thanksgiving", "turkey"]
}, {
	"code": "🐔",
	"keywords": ["chicken"]
}, {
	"code": "🐓",
	"keywords": ["rooster"]
}, {
	"code": "🐣",
	"keywords": ["hatching_chick", "baby", "chick", "hatching"]
}, {
	"code": "🐤",
	"keywords": ["baby_chick", "baby", "chick"]
}, {
	"code": "🐥",
	"keywords": ["hatched_chick", "baby", "chick"]
}, {
	"code": "🐦",
	"keywords": ["bird"]
}, {
	"code": "🐧",
	"keywords": ["penguin"]
}, {
	"code": "🕊️",
	"keywords": ["peace", "dove"]
}, {
	"code": "🦅",
	"keywords": ["eagle", "bird"]
}, {
	"code": "🦆",
	"keywords": ["duck", "bird"]
}, {
	"code": "🦢",
	"keywords": ["swan"]
}, {
	"code": "🦉",
	"keywords": ["owl", "bird", "wise"]
}, {
	"code": "🦤",
	"keywords": ["dodo"]
}, {
	"code": "🪶",
	"keywords": ["feather"]
}, {
	"code": "🦩",
	"keywords": ["flamingo"]
}, {
	"code": "🦚",
	"keywords": ["peacock"]
}, {
	"code": "🦜",
	"keywords": ["parrot"]
}, {
	"code": "🐸",
	"keywords": ["frog", "face"]
}, {
	"code": "🐊",
	"keywords": ["crocodile"]
}, {
	"code": "🐢",
	"keywords": ["slow", "turtle"]
}, {
	"code": "🦎",
	"keywords": ["lizard", "reptile"]
}, {
	"code": "🐍",
	"keywords": ["snake", "bearer", "ophiuchus", "serpent", "zodiac"]
}, {
	"code": "🐲",
	"keywords": ["dragon_face", "dragon", "face", "fairy tale"]
}, {
	"code": "🐉",
	"keywords": ["dragon", "fairy tale"]
}, {
	"code": "🦕",
	"keywords": ["dinosaur", "sauropod"]
}, {
	"code": "🦖",
	"keywords": ["dinosaur", "t-rex"]
}, {
	"code": "🐳",
	"keywords": ["sea", "whale", "face", "spouting"]
}, {
	"code": "🐋",
	"keywords": ["whale2", "whale"]
}, {
	"code": "🐬",
	"keywords": ["dolphin", "flipper"]
}, {
	"code": "🦭",
	"keywords": ["seal"]
}, {
	"code": "🐟",
	"keywords": ["fish", "pisces", "zodiac"]
}, {
	"code": "🐠",
	"keywords": ["tropical_fish", "fish", "tropical"]
}, {
	"code": "🐡",
	"keywords": ["blowfish", "fish"]
}, {
	"code": "🦈",
	"keywords": ["shark", "fish"]
}, {
	"code": "🐙",
	"keywords": ["octopus"]
}, {
	"code": "🐚",
	"keywords": ["sea", "beach", "shell", "spiral"]
}, {
	"code": "🐌",
	"keywords": ["slow", "snail"]
}, {
	"code": "🦋",
	"keywords": ["butterfly", "insect", "pretty"]
}, {
	"code": "🐛",
	"keywords": ["bug", "insect"]
}, {
	"code": "🐜",
	"keywords": ["ant", "insect"]
}, {
	"code": "🐝",
	"keywords": ["bee", "honeybee", "insect"]
}, {
	"code": "🪲",
	"keywords": ["beetle"]
}, {
	"code": "🐞",
	"keywords": ["bug", "lady_beetle", "beetle", "insect", "lady beetle", "ladybird", "ladybug"]
}, {
	"code": "🦗",
	"keywords": ["cricket"]
}, {
	"code": "🪳",
	"keywords": ["cockroach"]
}, {
	"code": "🕷️",
	"keywords": ["spider"]
}, {
	"code": "🕸️",
	"keywords": ["spider_web"]
}, {
	"code": "🦂",
	"keywords": ["scorpion", "scorpio", "scorpius", "zodiac"]
}, {
	"code": "🦟",
	"keywords": ["mosquito"]
}, {
	"code": "🪰",
	"keywords": ["fly"]
}, {
	"code": "🪱",
	"keywords": ["worm"]
}, {
	"code": "🦠",
	"keywords": ["germ", "microbe"]
}, {
	"code": "💐",
	"keywords": ["flowers", "bouquet", "flower", "plant", "romance"]
}, {
	"code": "🌸",
	"keywords": ["flower", "spring", "cherry_blossom", "blossom", "cherry", "plant"]
}, {
	"code": "💮",
	"keywords": ["white_flower", "flower"]
}, {
	"code": "🏵️",
	"keywords": ["rosette"]
}, {
	"code": "🌹",
	"keywords": ["flower", "rose", "plant"]
}, {
	"code": "🥀",
	"keywords": ["wilted_flower", "flower", "wilted"]
}, {
	"code": "🌺",
	"keywords": ["hibiscus", "flower", "plant"]
}, {
	"code": "🌻",
	"keywords": ["sunflower", "flower", "plant", "sun"]
}, {
	"code": "🌼",
	"keywords": ["blossom", "flower", "plant"]
}, {
	"code": "🌷",
	"keywords": ["flower", "tulip", "plant"]
}, {
	"code": "🌱",
	"keywords": ["plant", "seedling", "young"]
}, {
	"code": "🪴",
	"keywords": ["potted_plant"]
}, {
	"code": "🌲",
	"keywords": ["wood", "evergreen_tree", "evergreen", "plant", "tree"]
}, {
	"code": "🌳",
	"keywords": ["wood", "deciduous_tree", "deciduous", "plant", "shedding", "tree"]
}, {
	"code": "🌴",
	"keywords": ["palm_tree", "palm", "plant", "tree"]
}, {
	"code": "🌵",
	"keywords": ["cactus", "plant"]
}, {
	"code": "🌾",
	"keywords": ["ear_of_rice", "ear", "plant", "rice"]
}, {
	"code": "🌿",
	"keywords": ["herb", "leaf", "plant"]
}, {
	"code": "☘️",
	"keywords": ["shamrock", "plant"]
}, {
	"code": "🍀",
	"keywords": ["luck", "four_leaf_clover", "4", "clover", "four", "leaf", "plant"]
}, {
	"code": "🍁",
	"keywords": ["canada", "maple_leaf", "falling", "leaf", "maple", "plant"]
}, {
	"code": "🍂",
	"keywords": ["autumn", "fallen_leaf", "falling", "leaf", "plant"]
}, {
	"code": "🍃",
	"keywords": ["leaf", "leaves", "blow", "flutter", "plant", "wind"]
}, {
	"code": "foodAndDrink",
	"header": true
}, {
	"code": "🍇",
	"keywords": ["grapes", "fruit", "grape", "plant"]
}, {
	"code": "🍈",
	"keywords": ["melon", "fruit", "plant"]
}, {
	"code": "🍉",
	"keywords": ["watermelon", "fruit", "plant"]
}, {
	"code": "🍊",
	"keywords": ["tangerine", "orange", "mandarin", "fruit", "plant"]
}, {
	"code": "🍋",
	"keywords": ["lemon", "citrus", "fruit", "plant"]
}, {
	"code": "🍌",
	"keywords": ["fruit", "banana", "plant"]
}, {
	"code": "🍍",
	"keywords": ["pineapple", "fruit", "plant"]
}, {
	"code": "🥭",
	"keywords": ["mango"]
}, {
	"code": "🍎",
	"keywords": ["apple", "fruit", "plant", "red"]
}, {
	"code": "🍏",
	"keywords": ["fruit", "green_apple", "apple", "green", "plant"]
}, {
	"code": "🍐",
	"keywords": ["pear", "fruit", "plant"]
}, {
	"code": "🍑",
	"keywords": ["peach", "fruit", "plant"]
}, {
	"code": "🍒",
	"keywords": ["fruit", "cherries", "cherry", "plant"]
}, {
	"code": "🍓",
	"keywords": ["fruit", "strawberry", "berry", "plant"]
}, {
	"code": "🫐",
	"keywords": ["blueberries"]
}, {
	"code": "🥝",
	"keywords": ["kiwi_fruit", "fruit", "kiwi"]
}, {
	"code": "🍅",
	"keywords": ["tomato", "plant", "vegetable"]
}, {
	"code": "🫒",
	"keywords": ["olive"]
}, {
	"code": "🥥",
	"keywords": ["coconut"]
}, {
	"code": "🥑",
	"keywords": ["avocado", "fruit"]
}, {
	"code": "🍆",
	"keywords": ["aubergine", "eggplant", "plant", "vegetable"]
}, {
	"code": "🥔",
	"keywords": ["potato", "vegetable"]
}, {
	"code": "🥕",
	"keywords": ["carrot", "vegetable"]
}, {
	"code": "🌽",
	"keywords": ["corn", "ear", "maize", "maze", "plant"]
}, {
	"code": "🌶️",
	"keywords": ["spicy", "hot_pepper"]
}, {
	"code": "🫑",
	"keywords": ["bell_pepper"]
}, {
	"code": "🥒",
	"keywords": ["cucumber", "pickle", "vegetable"]
}, {
	"code": "🥬",
	"keywords": ["leafy_green"]
}, {
	"code": "🥦",
	"keywords": ["broccoli"]
}, {
	"code": "🧄",
	"keywords": ["garlic"]
}, {
	"code": "🧅",
	"keywords": ["onion"]
}, {
	"code": "🍄",
	"keywords": ["mushroom", "plant"]
}, {
	"code": "🥜",
	"keywords": ["peanuts", "nut", "peanut", "vegetable"]
}, {
	"code": "🌰",
	"keywords": ["chestnut", "plant"]
}, {
	"code": "🍞",
	"keywords": ["toast", "bread", "loaf"]
}, {
	"code": "🥐",
	"keywords": ["croissant", "bread", "crescent roll", "french"]
}, {
	"code": "🥖",
	"keywords": ["baguette_bread", "baguette", "bread", "french"]
}, {
	"code": "🫓",
	"keywords": ["flatbread"]
}, {
	"code": "🥨",
	"keywords": ["pretzel"]
}, {
	"code": "🥯",
	"keywords": ["bagel"]
}, {
	"code": "🥞",
	"keywords": ["pancakes", "crêpe", "hotcake", "pancake"]
}, {
	"code": "🧇",
	"keywords": ["waffle"]
}, {
	"code": "🧀",
	"keywords": ["cheese"]
}, {
	"code": "🍖",
	"keywords": ["meat_on_bone", "bone", "meat"]
}, {
	"code": "🍗",
	"keywords": ["meat", "chicken", "poultry_leg", "bone", "leg", "poultry"]
}, {
	"code": "🥩",
	"keywords": ["cut_of_meat"]
}, {
	"code": "🥓",
	"keywords": ["bacon", "meat"]
}, {
	"code": "🍔",
	"keywords": ["burger", "hamburger"]
}, {
	"code": "🍟",
	"keywords": ["fries", "french"]
}, {
	"code": "🍕",
	"keywords": ["pizza", "cheese", "slice"]
}, {
	"code": "🌭",
	"keywords": ["hotdog", "frankfurter", "hot dog", "sausage"]
}, {
	"code": "🥪",
	"keywords": ["sandwich"]
}, {
	"code": "🌮",
	"keywords": ["taco", "mexican"]
}, {
	"code": "🌯",
	"keywords": ["burrito", "mexican"]
}, {
	"code": "🫔",
	"keywords": ["tamale"]
}, {
	"code": "🥙",
	"keywords": ["stuffed_flatbread", "falafel", "flatbread", "gyro", "kebab", "stuffed"]
}, {
	"code": "🧆",
	"keywords": ["falafel"]
}, {
	"code": "🥚",
	"keywords": ["egg"]
}, {
	"code": "🍳",
	"keywords": ["breakfast", "fried_egg", "cooking", "egg", "frying", "pan"]
}, {
	"code": "🥘",
	"keywords": ["paella", "curry", "shallow_pan_of_food", "casserole", "pan", "shallow"]
}, {
	"code": "🍲",
	"keywords": ["stew", "pot"]
}, {
	"code": "🫕",
	"keywords": ["fondue"]
}, {
	"code": "🥣",
	"keywords": ["bowl_with_spoon"]
}, {
	"code": "🥗",
	"keywords": ["green_salad", "green", "salad"]
}, {
	"code": "🍿",
	"keywords": ["popcorn"]
}, {
	"code": "🧈",
	"keywords": ["butter"]
}, {
	"code": "🧂",
	"keywords": ["salt"]
}, {
	"code": "🥫",
	"keywords": ["canned_food"]
}, {
	"code": "🍱",
	"keywords": ["bento", "box"]
}, {
	"code": "🍘",
	"keywords": ["rice_cracker", "cracker", "rice"]
}, {
	"code": "🍙",
	"keywords": ["rice_ball", "ball", "japanese", "rice"]
}, {
	"code": "🍚",
	"keywords": ["rice", "cooked"]
}, {
	"code": "🍛",
	"keywords": ["curry", "rice"]
}, {
	"code": "🍜",
	"keywords": ["noodle", "ramen", "bowl", "steaming"]
}, {
	"code": "🍝",
	"keywords": ["pasta", "spaghetti"]
}, {
	"code": "🍠",
	"keywords": ["sweet_potato", "potato", "roasted", "sweet"]
}, {
	"code": "🍢",
	"keywords": ["oden", "kebab", "seafood", "skewer", "stick"]
}, {
	"code": "🍣",
	"keywords": ["sushi"]
}, {
	"code": "🍤",
	"keywords": ["tempura", "fried_shrimp", "fried", "prawn", "shrimp"]
}, {
	"code": "🍥",
	"keywords": ["fish_cake", "cake", "fish", "pastry", "swirl"]
}, {
	"code": "🥮",
	"keywords": ["moon_cake"]
}, {
	"code": "🍡",
	"keywords": ["dango", "dessert", "japanese", "skewer", "stick", "sweet"]
}, {
	"code": "🥟",
	"keywords": ["dumpling"]
}, {
	"code": "🥠",
	"keywords": ["fortune_cookie"]
}, {
	"code": "🥡",
	"keywords": ["takeout_box"]
}, {
	"code": "🦀",
	"keywords": ["crab", "cancer", "zodiac"]
}, {
	"code": "🦞",
	"keywords": ["lobster"]
}, {
	"code": "🦐",
	"keywords": ["shrimp", "shellfish", "small"]
}, {
	"code": "🦑",
	"keywords": ["squid", "molusc"]
}, {
	"code": "🦪",
	"keywords": ["oyster"]
}, {
	"code": "🍦",
	"keywords": ["icecream", "cream", "dessert", "ice", "soft", "sweet"]
}, {
	"code": "🍧",
	"keywords": ["shaved_ice", "dessert", "ice", "shaved", "sweet"]
}, {
	"code": "🍨",
	"keywords": ["ice_cream", "cream", "dessert", "ice", "sweet"]
}, {
	"code": "🍩",
	"keywords": ["doughnut", "dessert", "donut", "sweet"]
}, {
	"code": "🍪",
	"keywords": ["cookie", "dessert", "sweet"]
}, {
	"code": "🎂",
	"keywords": ["party", "birthday", "cake", "celebration", "dessert", "pastry", "sweet"]
}, {
	"code": "🍰",
	"keywords": ["dessert", "cake", "pastry", "shortcake", "slice", "sweet"]
}, {
	"code": "🧁",
	"keywords": ["cupcake"]
}, {
	"code": "🥧",
	"keywords": ["pie"]
}, {
	"code": "🍫",
	"keywords": ["chocolate_bar", "bar", "chocolate", "dessert", "sweet"]
}, {
	"code": "🍬",
	"keywords": ["sweet", "candy", "dessert"]
}, {
	"code": "🍭",
	"keywords": ["lollipop", "candy", "dessert", "sweet"]
}, {
	"code": "🍮",
	"keywords": ["custard", "dessert", "pudding", "sweet"]
}, {
	"code": "🍯",
	"keywords": ["honey_pot", "honey", "honeypot", "pot", "sweet"]
}, {
	"code": "🍼",
	"keywords": ["milk", "baby_bottle", "baby", "bottle", "drink"]
}, {
	"code": "🥛",
	"keywords": ["milk_glass", "drink", "glass", "milk"]
}, {
	"code": "☕",
	"keywords": ["cafe", "espresso", "coffee", "beverage", "drink", "hot", "steaming", "tea"]
}, {
	"code": "🫖",
	"keywords": ["teapot"]
}, {
	"code": "🍵",
	"keywords": ["green", "breakfast", "tea", "beverage", "cup", "drink", "teacup"]
}, {
	"code": "🍶",
	"keywords": ["sake", "bar", "beverage", "bottle", "cup", "drink"]
}, {
	"code": "🍾",
	"keywords": ["bottle", "bubbly", "celebration", "champagne", "bar", "cork", "drink", "popping"]
}, {
	"code": "🍷",
	"keywords": ["wine_glass", "bar", "beverage", "drink", "glass", "wine"]
}, {
	"code": "🍸",
	"keywords": ["drink", "cocktail", "bar", "glass"]
}, {
	"code": "🍹",
	"keywords": ["summer", "vacation", "tropical_drink", "bar", "drink", "tropical"]
}, {
	"code": "🍺",
	"keywords": ["drink", "beer", "bar", "mug"]
}, {
	"code": "🍻",
	"keywords": ["drinks", "beers", "bar", "beer", "clink", "drink", "mug"]
}, {
	"code": "🥂",
	"keywords": ["cheers", "toast", "clinking_glasses", "celebrate", "clink", "drink", "glass"]
}, {
	"code": "🥃",
	"keywords": ["whisky", "tumbler_glass", "glass", "liquor", "shot", "tumbler"]
}, {
	"code": "🥤",
	"keywords": ["cup_with_straw"]
}, {
	"code": "🧋",
	"keywords": ["bubble_tea"]
}, {
	"code": "🧃",
	"keywords": ["beverage_box"]
}, {
	"code": "🧉",
	"keywords": ["mate"]
}, {
	"code": "🧊",
	"keywords": ["ice_cube"]
}, {
	"code": "🥢",
	"keywords": ["chopsticks"]
}, {
	"code": "🍽️",
	"keywords": ["dining", "dinner", "plate_with_cutlery"]
}, {
	"code": "🍴",
	"keywords": ["cutlery", "fork_and_knife", "cooking", "fork", "knife"]
}, {
	"code": "🥄",
	"keywords": ["spoon", "tableware"]
}, {
	"code": "🔪",
	"keywords": ["cut", "chop", "hocho", "knife", "cooking", "tool", "weapon"]
}, {
	"code": "🏺",
	"keywords": ["amphora", "aquarius", "cooking", "drink", "jug", "tool", "weapon", "zodiac"]
}, {
	"code": "travelAndPlaces",
	"header": true
}, {
	"code": "🌍",
	"keywords": ["globe", "world", "international", "earth_africa", "africa", "earth", "europe"]
}, {
	"code": "🌎",
	"keywords": ["globe", "world", "international", "earth_americas", "americas", "earth"]
}, {
	"code": "🌏",
	"keywords": ["globe", "world", "international", "earth_asia", "asia", "australia", "earth"]
}, {
	"code": "🌐",
	"keywords": ["world", "global", "international", "globe_with_meridians", "earth", "globe", "meridians"]
}, {
	"code": "🗺️",
	"keywords": ["travel", "world_map"]
}, {
	"code": "🗾",
	"keywords": ["japan", "map"]
}, {
	"code": "🧭",
	"keywords": ["compass"]
}, {
	"code": "🏔️",
	"keywords": ["mountain_snow"]
}, {
	"code": "⛰️",
	"keywords": ["mountain"]
}, {
	"code": "🌋",
	"keywords": ["volcano", "eruption", "mountain", "weather"]
}, {
	"code": "🗻",
	"keywords": ["mount_fuji", "fuji", "mountain"]
}, {
	"code": "🏕️",
	"keywords": ["camping"]
}, {
	"code": "🏖️",
	"keywords": ["beach_umbrella"]
}, {
	"code": "🏜️",
	"keywords": ["desert"]
}, {
	"code": "🏝️",
	"keywords": ["desert_island"]
}, {
	"code": "🏞️",
	"keywords": ["national_park"]
}, {
	"code": "🏟️",
	"keywords": ["stadium"]
}, {
	"code": "🏛️",
	"keywords": ["classical_building"]
}, {
	"code": "🏗️",
	"keywords": ["building_construction"]
}, {
	"code": "🧱",
	"keywords": ["bricks"]
}, {
	"code": "🪨",
	"keywords": ["rock"]
}, {
	"code": "🪵",
	"keywords": ["wood"]
}, {
	"code": "🛖",
	"keywords": ["hut"]
}, {
	"code": "🏘️",
	"keywords": ["houses"]
}, {
	"code": "🏚️",
	"keywords": ["derelict_house"]
}, {
	"code": "🏠",
	"keywords": ["house", "building", "home"]
}, {
	"code": "🏡",
	"keywords": ["house_with_garden", "building", "garden", "home", "house"]
}, {
	"code": "🏢",
	"keywords": ["office", "building"]
}, {
	"code": "🏣",
	"keywords": ["post_office", "building", "japanese", "post"]
}, {
	"code": "🏤",
	"keywords": ["european_post_office", "building", "european", "post"]
}, {
	"code": "🏥",
	"keywords": ["hospital", "building", "doctor", "medicine"]
}, {
	"code": "🏦",
	"keywords": ["bank", "building"]
}, {
	"code": "🏨",
	"keywords": ["hotel", "building"]
}, {
	"code": "🏩",
	"keywords": ["love_hotel", "building", "hotel", "love"]
}, {
	"code": "🏪",
	"keywords": ["convenience_store", "building", "convenience", "store"]
}, {
	"code": "🏫",
	"keywords": ["school", "building"]
}, {
	"code": "🏬",
	"keywords": ["department_store", "building", "department", "store"]
}, {
	"code": "🏭",
	"keywords": ["factory", "building"]
}, {
	"code": "🏯",
	"keywords": ["japanese_castle", "building", "castle", "japanese"]
}, {
	"code": "🏰",
	"keywords": ["european_castle", "building", "castle", "european"]
}, {
	"code": "💒",
	"keywords": ["marriage", "wedding", "activity", "chapel", "romance"]
}, {
	"code": "🗼",
	"keywords": ["tokyo_tower", "tokyo", "tower"]
}, {
	"code": "🗽",
	"keywords": ["statue_of_liberty", "liberty", "statue"]
}, {
	"code": "⛪",
	"keywords": ["church", "building", "christian", "cross", "religion"]
}, {
	"code": "🕌",
	"keywords": ["mosque", "islam", "muslim", "religion"]
}, {
	"code": "🛕",
	"keywords": ["hindu_temple"]
}, {
	"code": "🕍",
	"keywords": ["synagogue", "jew", "jewish", "religion", "temple"]
}, {
	"code": "⛩️",
	"keywords": ["shinto_shrine"]
}, {
	"code": "🕋",
	"keywords": ["kaaba", "islam", "muslim", "religion"]
}, {
	"code": "⛲",
	"keywords": ["fountain"]
}, {
	"code": "⛺",
	"keywords": ["camping", "tent"]
}, {
	"code": "🌁",
	"keywords": ["karl", "foggy", "fog", "weather"]
}, {
	"code": "🌃",
	"keywords": ["night_with_stars", "night", "star", "weather"]
}, {
	"code": "🏙️",
	"keywords": ["skyline", "cityscape"]
}, {
	"code": "🌄",
	"keywords": ["sunrise_over_mountains", "morning", "mountain", "sun", "sunrise", "weather"]
}, {
	"code": "🌅",
	"keywords": ["sunrise", "morning", "sun", "weather"]
}, {
	"code": "🌆",
	"keywords": ["city_sunset", "building", "city", "dusk", "evening", "landscape", "sun", "sunset", "weather"]
}, {
	"code": "🌇",
	"keywords": ["city_sunrise", "building", "dusk", "sun", "sunset", "weather"]
}, {
	"code": "🌉",
	"keywords": ["bridge_at_night", "bridge", "night", "weather"]
}, {
	"code": "♨️",
	"keywords": ["hotsprings", "hot", "springs", "steaming"]
}, {
	"code": "🎠",
	"keywords": ["carousel_horse", "activity", "carousel", "entertainment", "horse"]
}, {
	"code": "🎡",
	"keywords": ["ferris_wheel", "activity", "amusement park", "entertainment", "ferris", "wheel"]
}, {
	"code": "🎢",
	"keywords": ["roller_coaster", "activity", "amusement park", "coaster", "entertainment", "roller"]
}, {
	"code": "💈",
	"keywords": ["barber", "haircut", "pole"]
}, {
	"code": "🎪",
	"keywords": ["circus_tent", "activity", "circus", "entertainment", "tent"]
}, {
	"code": "🚂",
	"keywords": ["train", "steam_locomotive", "engine", "locomotive", "railway", "steam", "vehicle"]
}, {
	"code": "🚃",
	"keywords": ["railway_car", "car", "electric", "railway", "train", "tram", "trolleybus", "vehicle"]
}, {
	"code": "🚄",
	"keywords": ["train", "bullettrain_side", "railway", "shinkansen", "speed", "vehicle"]
}, {
	"code": "🚅",
	"keywords": ["train", "bullettrain_front", "bullet", "railway", "shinkansen", "speed", "vehicle"]
}, {
	"code": "🚆",
	"keywords": ["train2", "railway", "train", "vehicle"]
}, {
	"code": "🚇",
	"keywords": ["metro", "subway", "vehicle"]
}, {
	"code": "🚈",
	"keywords": ["light_rail", "railway", "vehicle"]
}, {
	"code": "🚉",
	"keywords": ["station", "railway", "train", "vehicle"]
}, {
	"code": "🚊",
	"keywords": ["tram", "trolleybus", "vehicle"]
}, {
	"code": "🚝",
	"keywords": ["monorail", "vehicle"]
}, {
	"code": "🚞",
	"keywords": ["mountain_railway", "car", "mountain", "railway", "vehicle"]
}, {
	"code": "🚋",
	"keywords": ["train", "car", "tram", "trolleybus", "vehicle"]
}, {
	"code": "🚌",
	"keywords": ["bus", "vehicle"]
}, {
	"code": "🚍",
	"keywords": ["oncoming_bus", "bus", "oncoming", "vehicle"]
}, {
	"code": "🚎",
	"keywords": ["trolleybus", "bus", "tram", "trolley", "vehicle"]
}, {
	"code": "🚐",
	"keywords": ["minibus", "bus", "vehicle"]
}, {
	"code": "🚑",
	"keywords": ["ambulance", "vehicle"]
}, {
	"code": "🚒",
	"keywords": ["fire_engine", "engine", "fire", "truck", "vehicle"]
}, {
	"code": "🚓",
	"keywords": ["police_car", "car", "patrol", "police", "vehicle"]
}, {
	"code": "🚔",
	"keywords": ["oncoming_police_car", "car", "oncoming", "police", "vehicle"]
}, {
	"code": "🚕",
	"keywords": ["taxi", "vehicle"]
}, {
	"code": "🚖",
	"keywords": ["oncoming_taxi", "oncoming", "taxi", "vehicle"]
}, {
	"code": "🚗",
	"keywords": ["car", "red_car", "automobile", "vehicle"]
}, {
	"code": "🚘",
	"keywords": ["oncoming_automobile", "automobile", "car", "oncoming", "vehicle"]
}, {
	"code": "🚙",
	"keywords": ["blue_car", "recreational", "rv", "vehicle"]
}, {
	"code": "🛻",
	"keywords": ["pickup_truck"]
}, {
	"code": "🚚",
	"keywords": ["truck", "delivery", "vehicle"]
}, {
	"code": "🚛",
	"keywords": ["articulated_lorry", "lorry", "semi", "truck", "vehicle"]
}, {
	"code": "🚜",
	"keywords": ["tractor", "vehicle"]
}, {
	"code": "🏎️",
	"keywords": ["racing_car"]
}, {
	"code": "🏍️",
	"keywords": ["motorcycle"]
}, {
	"code": "🛵",
	"keywords": ["motor_scooter", "motor", "scooter"]
}, {
	"code": "🦽",
	"keywords": ["manual_wheelchair"]
}, {
	"code": "🦼",
	"keywords": ["motorized_wheelchair"]
}, {
	"code": "🛺",
	"keywords": ["auto_rickshaw"]
}, {
	"code": "🚲",
	"keywords": ["bicycle", "bike", "vehicle"]
}, {
	"code": "🛴",
	"keywords": ["kick_scooter", "kick", "scooter"]
}, {
	"code": "🛹",
	"keywords": ["skateboard"]
}, {
	"code": "🛼",
	"keywords": ["roller_skate"]
}, {
	"code": "🚏",
	"keywords": ["busstop", "bus", "stop"]
}, {
	"code": "🛣️",
	"keywords": ["motorway"]
}, {
	"code": "🛤️",
	"keywords": ["railway_track"]
}, {
	"code": "🛢️",
	"keywords": ["oil_drum"]
}, {
	"code": "⛽",
	"keywords": ["fuelpump", "fuel", "gas", "pump", "station"]
}, {
	"code": "🚨",
	"keywords": ["911", "emergency", "rotating_light", "beacon", "car", "light", "police", "revolving", "vehicle"]
}, {
	"code": "🚥",
	"keywords": ["traffic_light", "light", "signal", "traffic"]
}, {
	"code": "🚦",
	"keywords": ["semaphore", "vertical_traffic_light", "light", "signal", "traffic"]
}, {
	"code": "🛑",
	"keywords": ["stop_sign", "octagonal", "stop"]
}, {
	"code": "🚧",
	"keywords": ["wip", "construction", "barrier"]
}, {
	"code": "⚓",
	"keywords": ["ship", "anchor", "tool"]
}, {
	"code": "⛵",
	"keywords": ["boat", "sailboat", "resort", "sea", "vehicle", "yacht"]
}, {
	"code": "🛶",
	"keywords": ["canoe", "boat"]
}, {
	"code": "🚤",
	"keywords": ["ship", "speedboat", "boat", "vehicle"]
}, {
	"code": "🛳️",
	"keywords": ["cruise", "passenger_ship"]
}, {
	"code": "⛴️",
	"keywords": ["ferry"]
}, {
	"code": "🛥️",
	"keywords": ["motor_boat"]
}, {
	"code": "🚢",
	"keywords": ["ship", "vehicle"]
}, {
	"code": "✈️",
	"keywords": ["flight", "airplane", "vehicle"]
}, {
	"code": "🛩️",
	"keywords": ["flight", "small_airplane"]
}, {
	"code": "🛫",
	"keywords": ["flight_departure", "airplane", "check-in", "departure", "departures", "vehicle"]
}, {
	"code": "🛬",
	"keywords": ["flight_arrival", "airplane", "arrivals", "arriving", "landing", "vehicle"]
}, {
	"code": "🪂",
	"keywords": ["parachute"]
}, {
	"code": "💺",
	"keywords": ["seat", "chair"]
}, {
	"code": "🚁",
	"keywords": ["helicopter", "vehicle"]
}, {
	"code": "🚟",
	"keywords": ["suspension_railway", "railway", "suspension", "vehicle"]
}, {
	"code": "🚠",
	"keywords": ["mountain_cableway", "cable", "gondola", "mountain", "vehicle"]
}, {
	"code": "🚡",
	"keywords": ["aerial_tramway", "aerial", "cable", "car", "gondola", "ropeway", "tramway", "vehicle"]
}, {
	"code": "🛰️",
	"keywords": ["orbit", "space", "artificial_satellite"]
}, {
	"code": "🚀",
	"keywords": ["ship", "launch", "rocket", "space", "vehicle"]
}, {
	"code": "🛸",
	"keywords": ["ufo", "flying_saucer"]
}, {
	"code": "🛎️",
	"keywords": ["bellhop_bell"]
}, {
	"code": "🧳",
	"keywords": ["luggage"]
}, {
	"code": "⌛",
	"keywords": ["time", "hourglass", "sand", "timer"]
}, {
	"code": "⏳",
	"keywords": ["time", "hourglass_flowing_sand", "hourglass", "sand", "timer"]
}, {
	"code": "⌚",
	"keywords": ["time", "watch", "clock"]
}, {
	"code": "⏰",
	"keywords": ["morning", "alarm_clock", "alarm", "clock"]
}, {
	"code": "⏱️",
	"keywords": ["stopwatch"]
}, {
	"code": "⏲️",
	"keywords": ["timer_clock"]
}, {
	"code": "🕰️",
	"keywords": ["mantelpiece_clock"]
}, {
	"code": "🕛",
	"keywords": ["clock12", "00", "12", "12:00", "clock", "o’clock", "twelve"]
}, {
	"code": "🕧",
	"keywords": ["clock1230", "12", "12:30", "30", "clock", "thirty", "twelve"]
}, {
	"code": "🕐",
	"keywords": ["clock1", "00", "1", "1:00", "clock", "o’clock", "one"]
}, {
	"code": "🕜",
	"keywords": ["clock130", "1", "1:30", "30", "clock", "one", "thirty"]
}, {
	"code": "🕑",
	"keywords": ["clock2", "00", "2", "2:00", "clock", "o’clock", "two"]
}, {
	"code": "🕝",
	"keywords": ["clock230", "2", "2:30", "30", "clock", "thirty", "two"]
}, {
	"code": "🕒",
	"keywords": ["clock3", "00", "3", "3:00", "clock", "o’clock", "three"]
}, {
	"code": "🕞",
	"keywords": ["clock330", "3", "3:30", "30", "clock", "thirty", "three"]
}, {
	"code": "🕓",
	"keywords": ["clock4", "00", "4", "4:00", "clock", "four", "o’clock"]
}, {
	"code": "🕟",
	"keywords": ["clock430", "30", "4", "4:30", "clock", "four", "thirty"]
}, {
	"code": "🕔",
	"keywords": ["clock5", "00", "5", "5:00", "clock", "five", "o’clock"]
}, {
	"code": "🕠",
	"keywords": ["clock530", "30", "5", "5:30", "clock", "five", "thirty"]
}, {
	"code": "🕕",
	"keywords": ["clock6", "00", "6", "6:00", "clock", "o’clock", "six"]
}, {
	"code": "🕡",
	"keywords": ["clock630", "30", "6", "6:30", "clock", "six", "thirty"]
}, {
	"code": "🕖",
	"keywords": ["clock7", "00", "7", "7:00", "clock", "o’clock", "seven"]
}, {
	"code": "🕢",
	"keywords": ["clock730", "30", "7", "7:30", "clock", "seven", "thirty"]
}, {
	"code": "🕗",
	"keywords": ["clock8", "00", "8", "8:00", "clock", "eight", "o’clock"]
}, {
	"code": "🕣",
	"keywords": ["clock830", "30", "8", "8:30", "clock", "eight", "thirty"]
}, {
	"code": "🕘",
	"keywords": ["clock9", "00", "9", "9:00", "clock", "nine", "o’clock"]
}, {
	"code": "🕤",
	"keywords": ["clock930", "30", "9", "9:30", "clock", "nine", "thirty"]
}, {
	"code": "🕙",
	"keywords": ["clock10", "00", "10", "10:00", "clock", "o’clock", "ten"]
}, {
	"code": "🕥",
	"keywords": ["clock1030", "10", "10:30", "30", "clock", "ten", "thirty"]
}, {
	"code": "🕚",
	"keywords": ["clock11", "00", "11", "11:00", "clock", "eleven", "o’clock"]
}, {
	"code": "🕦",
	"keywords": ["clock1130", "11", "11:30", "30", "clock", "eleven", "thirty"]
}, {
	"code": "🌑",
	"keywords": ["new_moon", "dark", "moon", "space", "weather"]
}, {
	"code": "🌒",
	"keywords": ["waxing_crescent_moon", "crescent", "moon", "space", "waxing", "weather"]
}, {
	"code": "🌓",
	"keywords": ["first_quarter_moon", "moon", "quarter", "space", "weather"]
}, {
	"code": "🌔",
	"keywords": ["moon", "waxing_gibbous_moon", "gibbous", "space", "waxing", "weather"]
}, {
	"code": "🌕",
	"keywords": ["full_moon", "full", "moon", "space", "weather"]
}, {
	"code": "🌖",
	"keywords": ["waning_gibbous_moon", "gibbous", "moon", "space", "waning", "weather"]
}, {
	"code": "🌗",
	"keywords": ["last_quarter_moon", "moon", "quarter", "space", "weather"]
}, {
	"code": "🌘",
	"keywords": ["waning_crescent_moon", "crescent", "moon", "space", "waning", "weather"]
}, {
	"code": "🌙",
	"keywords": ["night", "crescent_moon", "crescent", "moon", "space", "weather"]
}, {
	"code": "🌚",
	"keywords": ["new_moon_with_face", "face", "moon", "space", "weather"]
}, {
	"code": "🌛",
	"keywords": ["first_quarter_moon_with_face", "face", "moon", "quarter", "space", "weather"]
}, {
	"code": "🌜",
	"keywords": ["last_quarter_moon_with_face", "face", "moon", "quarter", "space", "weather"]
}, {
	"code": "🌡️",
	"keywords": ["thermometer"]
}, {
	"code": "☀️",
	"keywords": ["weather", "sunny", "bright", "rays", "space", "sun"]
}, {
	"code": "🌝",
	"keywords": ["full_moon_with_face", "bright", "face", "full", "moon", "space", "weather"]
}, {
	"code": "🌞",
	"keywords": ["summer", "sun_with_face", "bright", "face", "space", "sun", "weather"]
}, {
	"code": "🪐",
	"keywords": ["ringed_planet"]
}, {
	"code": "⭐",
	"keywords": ["star"]
}, {
	"code": "🌟",
	"keywords": ["star2", "glittery", "glow", "shining", "sparkle", "star"]
}, {
	"code": "🌠",
	"keywords": ["stars", "activity", "falling", "shooting", "space", "star"]
}, {
	"code": "🌌",
	"keywords": ["milky_way", "milky way", "space", "weather"]
}, {
	"code": "☁️",
	"keywords": ["cloud", "weather"]
}, {
	"code": "⛅",
	"keywords": ["weather", "cloud", "partly_sunny", "sun"]
}, {
	"code": "⛈️",
	"keywords": ["cloud_with_lightning_and_rain"]
}, {
	"code": "🌤️",
	"keywords": ["sun_behind_small_cloud"]
}, {
	"code": "🌥️",
	"keywords": ["sun_behind_large_cloud"]
}, {
	"code": "🌦️",
	"keywords": ["sun_behind_rain_cloud"]
}, {
	"code": "🌧️",
	"keywords": ["cloud_with_rain"]
}, {
	"code": "🌨️",
	"keywords": ["cloud_with_snow"]
}, {
	"code": "🌩️",
	"keywords": ["cloud_with_lightning"]
}, {
	"code": "🌪️",
	"keywords": ["tornado"]
}, {
	"code": "🌫️",
	"keywords": ["fog"]
}, {
	"code": "🌬️",
	"keywords": ["wind_face"]
}, {
	"code": "🌀",
	"keywords": ["swirl", "cyclone", "dizzy", "twister", "typhoon", "weather"]
}, {
	"code": "🌈",
	"keywords": ["rainbow", "rain", "weather"]
}, {
	"code": "🌂",
	"keywords": ["weather", "rain", "closed_umbrella", "clothing", "umbrella"]
}, {
	"code": "☂️",
	"keywords": ["open_umbrella", "clothing", "rain", "umbrella", "weather"]
}, {
	"code": "☔",
	"keywords": ["rain", "weather", "umbrella", "clothing", "drop"]
}, {
	"code": "⛱️",
	"keywords": ["beach_umbrella", "parasol_on_ground"]
}, {
	"code": "⚡",
	"keywords": ["lightning", "thunder", "zap", "danger", "electric", "electricity", "voltage"]
}, {
	"code": "❄️",
	"keywords": ["winter", "cold", "weather", "snowflake", "snow"]
}, {
	"code": "☃️",
	"keywords": ["winter", "christmas", "snowman_with_snow", "cold", "snow", "snowman", "weather"]
}, {
	"code": "⛄",
	"keywords": ["winter", "snowman", "cold", "snow", "weather"]
}, {
	"code": "☄️",
	"keywords": ["comet", "space"]
}, {
	"code": "🔥",
	"keywords": ["burn", "fire", "flame", "tool"]
}, {
	"code": "💧",
	"keywords": ["water", "droplet", "cold", "comic", "drop", "sweat", "weather"]
}, {
	"code": "🌊",
	"keywords": ["sea", "ocean", "water", "wave", "weather"]
}, {
	"code": "activities",
	"header": true
}, {
	"code": "🎃",
	"keywords": ["halloween", "jack_o_lantern", "activity", "celebration", "entertainment", "jack", "lantern"]
}, {
	"code": "🎄",
	"keywords": ["christmas_tree", "activity", "celebration", "christmas", "entertainment", "tree"]
}, {
	"code": "🎆",
	"keywords": ["festival", "celebration", "fireworks", "activity", "entertainment"]
}, {
	"code": "🎇",
	"keywords": ["sparkler", "activity", "celebration", "entertainment", "fireworks", "sparkle"]
}, {
	"code": "🧨",
	"keywords": ["firecracker"]
}, {
	"code": "✨",
	"keywords": ["shiny", "sparkles", "entertainment", "sparkle", "star"]
}, {
	"code": "🎈",
	"keywords": ["party", "birthday", "balloon", "activity", "celebration", "entertainment"]
}, {
	"code": "🎉",
	"keywords": ["hooray", "party", "tada", "activity", "celebration", "entertainment", "popper"]
}, {
	"code": "🎊",
	"keywords": ["confetti_ball", "activity", "ball", "celebration", "confetti", "entertainment"]
}, {
	"code": "🎋",
	"keywords": ["tanabata_tree", "activity", "banner", "celebration", "entertainment", "japanese", "tree"]
}, {
	"code": "🎍",
	"keywords": ["bamboo", "activity", "celebration", "japanese", "pine", "plant"]
}, {
	"code": "🎎",
	"keywords": ["dolls", "activity", "celebration", "doll", "entertainment", "festival", "japanese"]
}, {
	"code": "🎏",
	"keywords": ["flags", "activity", "carp", "celebration", "entertainment", "flag", "streamer"]
}, {
	"code": "🎐",
	"keywords": ["wind_chime", "activity", "bell", "celebration", "chime", "entertainment", "wind"]
}, {
	"code": "🎑",
	"keywords": ["rice_scene", "activity", "celebration", "ceremony", "entertainment", "moon"]
}, {
	"code": "🧧",
	"keywords": ["red_envelope"]
}, {
	"code": "🎀",
	"keywords": ["ribbon", "celebration"]
}, {
	"code": "🎁",
	"keywords": ["present", "birthday", "christmas", "gift", "box", "celebration", "entertainment", "wrapped"]
}, {
	"code": "🎗️",
	"keywords": ["reminder_ribbon"]
}, {
	"code": "🎟️",
	"keywords": ["tickets"]
}, {
	"code": "🎫",
	"keywords": ["ticket", "activity", "admission", "entertainment"]
}, {
	"code": "🎖️",
	"keywords": ["medal_military"]
}, {
	"code": "🏆",
	"keywords": ["award", "contest", "winner", "trophy", "prize"]
}, {
	"code": "🏅",
	"keywords": ["gold", "winner", "medal_sports", "medal"]
}, {
	"code": "🥇",
	"keywords": ["gold", "1st_place_medal", "first", "medal"]
}, {
	"code": "🥈",
	"keywords": ["silver", "2nd_place_medal", "medal", "second"]
}, {
	"code": "🥉",
	"keywords": ["bronze", "3rd_place_medal", "medal", "third"]
}, {
	"code": "⚽",
	"keywords": ["sports", "soccer", "ball"]
}, {
	"code": "⚾",
	"keywords": ["sports", "baseball", "ball"]
}, {
	"code": "🥎",
	"keywords": ["softball"]
}, {
	"code": "🏀",
	"keywords": ["sports", "basketball", "ball", "hoop"]
}, {
	"code": "🏐",
	"keywords": ["volleyball", "ball", "game"]
}, {
	"code": "🏈",
	"keywords": ["sports", "football", "american", "ball"]
}, {
	"code": "🏉",
	"keywords": ["rugby_football", "ball", "football", "rugby"]
}, {
	"code": "🎾",
	"keywords": ["sports", "tennis", "ball", "racquet"]
}, {
	"code": "🥏",
	"keywords": ["flying_disc"]
}, {
	"code": "🎳",
	"keywords": ["bowling", "ball", "game"]
}, {
	"code": "🏏",
	"keywords": ["cricket_game", "ball", "bat", "cricket", "game"]
}, {
	"code": "🏑",
	"keywords": ["field_hockey", "ball", "field", "game", "hockey", "stick"]
}, {
	"code": "🏒",
	"keywords": ["ice_hockey", "game", "hockey", "ice", "puck", "stick"]
}, {
	"code": "🥍",
	"keywords": ["lacrosse"]
}, {
	"code": "🏓",
	"keywords": ["ping_pong", "ball", "bat", "game", "paddle", "table tennis"]
}, {
	"code": "🏸",
	"keywords": ["badminton", "birdie", "game", "racquet", "shuttlecock"]
}, {
	"code": "🥊",
	"keywords": ["boxing_glove", "boxing", "glove"]
}, {
	"code": "🥋",
	"keywords": ["martial_arts_uniform", "judo", "karate", "martial arts", "taekwondo", "uniform"]
}, {
	"code": "🥅",
	"keywords": ["goal_net", "goal", "net"]
}, {
	"code": "⛳",
	"keywords": ["golf", "flag", "hole"]
}, {
	"code": "⛸️",
	"keywords": ["skating", "ice_skate"]
}, {
	"code": "🎣",
	"keywords": ["fishing_pole_and_fish", "entertainment", "fish", "pole"]
}, {
	"code": "🤿",
	"keywords": ["diving_mask"]
}, {
	"code": "🎽",
	"keywords": ["marathon", "running_shirt_with_sash", "running", "sash", "shirt"]
}, {
	"code": "🎿",
	"keywords": ["ski", "snow"]
}, {
	"code": "🛷",
	"keywords": ["sled"]
}, {
	"code": "🥌",
	"keywords": ["curling_stone"]
}, {
	"code": "🎯",
	"keywords": ["target", "dart", "activity", "bull", "bullseye", "entertainment", "eye", "game", "hit"]
}, {
	"code": "🪀",
	"keywords": ["yo_yo"]
}, {
	"code": "🪁",
	"keywords": ["kite"]
}, {
	"code": "🎱",
	"keywords": ["pool", "billiards", "8ball", "8", "8 ball", "ball", "billiard", "eight", "game"]
}, {
	"code": "🔮",
	"keywords": ["fortune", "crystal_ball", "ball", "crystal", "fairy tale", "fantasy", "tool"]
}, {
	"code": "🪄",
	"keywords": ["magic_wand"]
}, {
	"code": "🧿",
	"keywords": ["nazar_amulet"]
}, {
	"code": "🎮",
	"keywords": ["play", "controller", "console", "video_game", "entertainment", "game", "video game"]
}, {
	"code": "🕹️",
	"keywords": ["joystick"]
}, {
	"code": "🎰",
	"keywords": ["slot_machine", "activity", "game", "slot"]
}, {
	"code": "🎲",
	"keywords": ["dice", "gambling", "game_die", "die", "entertainment", "game"]
}, {
	"code": "🧩",
	"keywords": ["jigsaw"]
}, {
	"code": "🧸",
	"keywords": ["teddy_bear"]
}, {
	"code": "🪅",
	"keywords": ["pinata"]
}, {
	"code": "🪆",
	"keywords": ["nesting_dolls"]
}, {
	"code": "♠️",
	"keywords": ["spades", "card", "game", "spade", "suit"]
}, {
	"code": "♥️",
	"keywords": ["hearts", "card", "game", "heart", "suit"]
}, {
	"code": "♦️",
	"keywords": ["diamonds", "card", "diamond", "game", "suit"]
}, {
	"code": "♣️",
	"keywords": ["clubs", "card", "club", "game", "suit"]
}, {
	"code": "♟️",
	"keywords": ["chess_pawn"]
}, {
	"code": "🃏",
	"keywords": ["black_joker", "card", "entertainment", "game", "joker", "playing"]
}, {
	"code": "🀄",
	"keywords": ["mahjong", "game", "red"]
}, {
	"code": "🎴",
	"keywords": ["flower_playing_cards", "activity", "card", "entertainment", "flower", "game", "japanese", "playing"]
}, {
	"code": "🎭",
	"keywords": ["theater", "drama", "performing_arts", "activity", "art", "entertainment", "mask", "performing", "theatre"]
}, {
	"code": "🖼️",
	"keywords": ["framed_picture"]
}, {
	"code": "🎨",
	"keywords": ["design", "paint", "art", "activity", "entertainment", "museum", "painting", "palette"]
}, {
	"code": "🧵",
	"keywords": ["thread"]
}, {
	"code": "🪡",
	"keywords": ["sewing_needle"]
}, {
	"code": "🧶",
	"keywords": ["yarn"]
}, {
	"code": "🪢",
	"keywords": ["knot"]
}, {
	"code": "objects",
	"header": true
}, {
	"code": "👓",
	"keywords": ["glasses", "eyeglasses", "clothing", "eye", "eyewear"]
}, {
	"code": "🕶️",
	"keywords": ["dark_sunglasses"]
}, {
	"code": "🥽",
	"keywords": ["goggles"]
}, {
	"code": "🥼",
	"keywords": ["lab_coat"]
}, {
	"code": "🦺",
	"keywords": ["safety_vest"]
}, {
	"code": "👔",
	"keywords": ["shirt", "formal", "necktie", "clothing"]
}, {
	"code": "👕",
	"keywords": ["shirt", "tshirt", "clothing"]
}, {
	"code": "👖",
	"keywords": ["pants", "jeans", "clothing", "trousers"]
}, {
	"code": "🧣",
	"keywords": ["scarf"]
}, {
	"code": "🧤",
	"keywords": ["gloves"]
}, {
	"code": "🧥",
	"keywords": ["coat"]
}, {
	"code": "🧦",
	"keywords": ["socks"]
}, {
	"code": "👗",
	"keywords": ["dress", "clothing"]
}, {
	"code": "👘",
	"keywords": ["kimono", "clothing"]
}, {
	"code": "🥻",
	"keywords": ["sari"]
}, {
	"code": "🩱",
	"keywords": ["one_piece_swimsuit"]
}, {
	"code": "🩲",
	"keywords": ["swim_brief"]
}, {
	"code": "🩳",
	"keywords": ["shorts"]
}, {
	"code": "👙",
	"keywords": ["beach", "bikini", "clothing", "swim"]
}, {
	"code": "👚",
	"keywords": ["womans_clothes", "clothing", "woman"]
}, {
	"code": "👛",
	"keywords": ["purse", "clothing", "coin"]
}, {
	"code": "👜",
	"keywords": ["bag", "handbag", "clothing"]
}, {
	"code": "👝",
	"keywords": ["bag", "pouch", "clothing"]
}, {
	"code": "🛍️",
	"keywords": ["bags", "shopping"]
}, {
	"code": "🎒",
	"keywords": ["school_satchel", "activity", "bag", "satchel", "school"]
}, {
	"code": "🩴",
	"keywords": ["thong_sandal"]
}, {
	"code": "👞",
	"keywords": ["mans_shoe", "shoe", "clothing", "man"]
}, {
	"code": "👟",
	"keywords": ["sneaker", "sport", "running", "athletic_shoe", "athletic", "clothing", "shoe"]
}, {
	"code": "🥾",
	"keywords": ["hiking_boot"]
}, {
	"code": "🥿",
	"keywords": ["flat_shoe"]
}, {
	"code": "👠",
	"keywords": ["shoe", "high_heel", "clothing", "heel", "woman"]
}, {
	"code": "👡",
	"keywords": ["shoe", "sandal", "clothing", "woman"]
}, {
	"code": "🩰",
	"keywords": ["ballet_shoes"]
}, {
	"code": "👢",
	"keywords": ["boot", "clothing", "shoe", "woman"]
}, {
	"code": "👑",
	"keywords": ["king", "queen", "royal", "crown", "clothing"]
}, {
	"code": "👒",
	"keywords": ["womans_hat", "clothing", "hat", "woman"]
}, {
	"code": "🎩",
	"keywords": ["hat", "classy", "tophat", "activity", "clothing", "entertainment", "top"]
}, {
	"code": "🎓",
	"keywords": ["education", "college", "university", "graduation", "mortar_board", "activity", "cap", "celebration", "clothing", "hat"]
}, {
	"code": "🧢",
	"keywords": ["billed_cap"]
}, {
	"code": "🪖",
	"keywords": ["military_helmet"]
}, {
	"code": "⛑️",
	"keywords": ["rescue_worker_helmet"]
}, {
	"code": "📿",
	"keywords": ["prayer_beads", "beads", "clothing", "necklace", "prayer", "religion"]
}, {
	"code": "💄",
	"keywords": ["makeup", "lipstick", "cosmetics"]
}, {
	"code": "💍",
	"keywords": ["wedding", "marriage", "engaged", "ring", "diamond", "romance"]
}, {
	"code": "💎",
	"keywords": ["diamond", "gem", "jewel", "romance"]
}, {
	"code": "🔇",
	"keywords": ["sound", "volume", "mute", "quiet", "silent", "speaker"]
}, {
	"code": "🔈",
	"keywords": ["speaker", "volume"]
}, {
	"code": "🔉",
	"keywords": ["volume", "sound", "low", "speaker", "wave"]
}, {
	"code": "🔊",
	"keywords": ["volume", "loud_sound", "3", "entertainment", "high", "loud", "speaker", "three"]
}, {
	"code": "📢",
	"keywords": ["announcement", "loudspeaker", "communication", "loud", "public address"]
}, {
	"code": "📣",
	"keywords": ["mega", "cheering", "communication", "megaphone"]
}, {
	"code": "📯",
	"keywords": ["postal_horn", "communication", "entertainment", "horn", "post", "postal"]
}, {
	"code": "🔔",
	"keywords": ["sound", "notification", "bell"]
}, {
	"code": "🔕",
	"keywords": ["volume", "off", "no_bell", "bell", "forbidden", "mute", "no", "not", "prohibited", "quiet", "silent"]
}, {
	"code": "🎼",
	"keywords": ["musical_score", "activity", "entertainment", "music", "score"]
}, {
	"code": "🎵",
	"keywords": ["musical_note", "activity", "entertainment", "music", "note"]
}, {
	"code": "🎶",
	"keywords": ["music", "notes", "activity", "entertainment", "note"]
}, {
	"code": "🎙️",
	"keywords": ["podcast", "studio_microphone"]
}, {
	"code": "🎚️",
	"keywords": ["level_slider"]
}, {
	"code": "🎛️",
	"keywords": ["control_knobs"]
}, {
	"code": "🎤",
	"keywords": ["sing", "microphone", "activity", "entertainment", "karaoke", "mic"]
}, {
	"code": "🎧",
	"keywords": ["music", "earphones", "headphones", "activity", "earbud", "entertainment", "headphone"]
}, {
	"code": "📻",
	"keywords": ["podcast", "radio", "entertainment", "video"]
}, {
	"code": "🎷",
	"keywords": ["saxophone", "activity", "entertainment", "instrument", "music", "sax"]
}, {
	"code": "🪗",
	"keywords": ["accordion"]
}, {
	"code": "🎸",
	"keywords": ["rock", "guitar", "activity", "entertainment", "instrument", "music"]
}, {
	"code": "🎹",
	"keywords": ["piano", "musical_keyboard", "activity", "entertainment", "instrument", "keyboard", "music"]
}, {
	"code": "🎺",
	"keywords": ["trumpet", "activity", "entertainment", "instrument", "music"]
}, {
	"code": "🎻",
	"keywords": ["violin", "activity", "entertainment", "instrument", "music"]
}, {
	"code": "🪕",
	"keywords": ["banjo"]
}, {
	"code": "🥁",
	"keywords": ["drum", "drumsticks", "music"]
}, {
	"code": "🪘",
	"keywords": ["long_drum"]
}, {
	"code": "📱",
	"keywords": ["smartphone", "mobile", "iphone", "cell", "communication", "phone", "telephone"]
}, {
	"code": "📲",
	"keywords": ["call", "incoming", "calling", "arrow", "cell", "communication", "mobile", "phone", "receive", "telephone"]
}, {
	"code": "☎️",
	"keywords": ["phone", "telephone"]
}, {
	"code": "📞",
	"keywords": ["phone", "call", "telephone_receiver", "communication", "receiver", "telephone"]
}, {
	"code": "📟",
	"keywords": ["pager", "communication"]
}, {
	"code": "📠",
	"keywords": ["fax", "communication"]
}, {
	"code": "🔋",
	"keywords": ["power", "battery"]
}, {
	"code": "🔌",
	"keywords": ["electric_plug", "electric", "electricity", "plug"]
}, {
	"code": "💻",
	"keywords": ["desktop", "screen", "computer", "pc", "personal"]
}, {
	"code": "🖥️",
	"keywords": ["desktop_computer"]
}, {
	"code": "🖨️",
	"keywords": ["printer"]
}, {
	"code": "⌨️",
	"keywords": ["keyboard", "computer"]
}, {
	"code": "🖱️",
	"keywords": ["computer_mouse"]
}, {
	"code": "🖲️",
	"keywords": ["trackball"]
}, {
	"code": "💽",
	"keywords": ["minidisc", "computer", "disk", "entertainment", "minidisk", "optical"]
}, {
	"code": "💾",
	"keywords": ["save", "floppy_disk", "computer", "disk", "floppy"]
}, {
	"code": "💿",
	"keywords": ["cd", "blu-ray", "computer", "disk", "dvd", "optical"]
}, {
	"code": "📀",
	"keywords": ["dvd", "blu-ray", "cd", "computer", "disk", "entertainment", "optical"]
}, {
	"code": "🧮",
	"keywords": ["abacus"]
}, {
	"code": "🎥",
	"keywords": ["film", "video", "movie_camera", "activity", "camera", "cinema", "entertainment", "movie"]
}, {
	"code": "🎞️",
	"keywords": ["film_strip"]
}, {
	"code": "📽️",
	"keywords": ["film_projector"]
}, {
	"code": "🎬",
	"keywords": ["film", "clapper", "activity", "entertainment", "movie"]
}, {
	"code": "📺",
	"keywords": ["tv", "entertainment", "television", "video"]
}, {
	"code": "📷",
	"keywords": ["photo", "camera", "entertainment", "video"]
}, {
	"code": "📸",
	"keywords": ["photo", "camera_flash", "camera", "flash", "video"]
}, {
	"code": "📹",
	"keywords": ["video_camera", "camera", "entertainment", "video"]
}, {
	"code": "📼",
	"keywords": ["vhs", "entertainment", "tape", "video", "videocassette"]
}, {
	"code": "🔍",
	"keywords": ["search", "zoom", "mag", "glass", "magnifying", "tool"]
}, {
	"code": "🔎",
	"keywords": ["mag_right", "glass", "magnifying", "search", "tool"]
}, {
	"code": "🕯️",
	"keywords": ["candle"]
}, {
	"code": "💡",
	"keywords": ["idea", "light", "bulb", "comic", "electric"]
}, {
	"code": "🔦",
	"keywords": ["flashlight", "electric", "light", "tool", "torch"]
}, {
	"code": "🏮",
	"keywords": ["izakaya_lantern", "lantern", "bar", "japanese", "light", "red"]
}, {
	"code": "🪔",
	"keywords": ["diya_lamp"]
}, {
	"code": "📔",
	"keywords": ["notebook_with_decorative_cover", "book", "cover", "decorated", "notebook"]
}, {
	"code": "📕",
	"keywords": ["closed_book", "book", "closed"]
}, {
	"code": "📖",
	"keywords": ["book", "open_book", "open"]
}, {
	"code": "📗",
	"keywords": ["green_book", "book", "green"]
}, {
	"code": "📘",
	"keywords": ["blue_book", "blue", "book"]
}, {
	"code": "📙",
	"keywords": ["orange_book", "book", "orange"]
}, {
	"code": "📚",
	"keywords": ["library", "books", "book"]
}, {
	"code": "📓",
	"keywords": ["notebook"]
}, {
	"code": "📒",
	"keywords": ["ledger", "notebook"]
}, {
	"code": "📃",
	"keywords": ["page_with_curl", "curl", "document", "page"]
}, {
	"code": "📜",
	"keywords": ["document", "scroll", "paper"]
}, {
	"code": "📄",
	"keywords": ["document", "page_facing_up", "page"]
}, {
	"code": "📰",
	"keywords": ["press", "newspaper", "communication", "news", "paper"]
}, {
	"code": "🗞️",
	"keywords": ["press", "newspaper_roll"]
}, {
	"code": "📑",
	"keywords": ["bookmark_tabs", "bookmark", "mark", "marker", "tabs"]
}, {
	"code": "🔖",
	"keywords": ["bookmark", "mark"]
}, {
	"code": "🏷️",
	"keywords": ["tag", "label"]
}, {
	"code": "💰",
	"keywords": ["dollar", "cream", "moneybag", "bag", "money"]
}, {
	"code": "🪙",
	"keywords": ["coin"]
}, {
	"code": "💴",
	"keywords": ["yen", "bank", "banknote", "bill", "currency", "money", "note"]
}, {
	"code": "💵",
	"keywords": ["money", "dollar", "bank", "banknote", "bill", "currency", "note"]
}, {
	"code": "💶",
	"keywords": ["euro", "bank", "banknote", "bill", "currency", "money", "note"]
}, {
	"code": "💷",
	"keywords": ["pound", "bank", "banknote", "bill", "currency", "money", "note"]
}, {
	"code": "💸",
	"keywords": ["dollar", "money_with_wings", "bank", "banknote", "bill", "fly", "money", "note", "wings"]
}, {
	"code": "💳",
	"keywords": ["subscription", "credit_card", "bank", "card", "credit", "money"]
}, {
	"code": "🧾",
	"keywords": ["receipt"]
}, {
	"code": "💹",
	"keywords": ["chart", "bank", "currency", "graph", "growth", "market", "money", "rise", "trend", "upward", "yen"]
}, {
	"code": "✉️",
	"keywords": ["letter", "email", "envelope", "e-mail"]
}, {
	"code": "📧",
	"keywords": ["email", "e-mail", "communication", "letter", "mail"]
}, {
	"code": "📨",
	"keywords": ["incoming_envelope", "communication", "e-mail", "email", "envelope", "incoming", "letter", "mail", "receive"]
}, {
	"code": "📩",
	"keywords": ["envelope_with_arrow", "arrow", "communication", "down", "e-mail", "email", "envelope", "letter", "mail", "outgoing", "sent"]
}, {
	"code": "📤",
	"keywords": ["outbox_tray", "box", "communication", "letter", "mail", "outbox", "sent", "tray"]
}, {
	"code": "📥",
	"keywords": ["inbox_tray", "box", "communication", "inbox", "letter", "mail", "receive", "tray"]
}, {
	"code": "📦",
	"keywords": ["shipping", "package", "box", "communication", "parcel"]
}, {
	"code": "📫",
	"keywords": ["mailbox", "closed", "communication", "flag", "mail", "postbox"]
}, {
	"code": "📪",
	"keywords": ["mailbox_closed", "closed", "communication", "flag", "lowered", "mail", "mailbox", "postbox"]
}, {
	"code": "📬",
	"keywords": ["mailbox_with_mail", "communication", "flag", "mail", "mailbox", "open", "postbox"]
}, {
	"code": "📭",
	"keywords": ["mailbox_with_no_mail", "communication", "flag", "lowered", "mail", "mailbox", "open", "postbox"]
}, {
	"code": "📮",
	"keywords": ["postbox", "communication", "mail", "mailbox"]
}, {
	"code": "🗳️",
	"keywords": ["ballot_box"]
}, {
	"code": "✏️",
	"keywords": ["pencil2"]
}, {
	"code": "✒️",
	"keywords": ["black_nib", "nib", "pen"]
}, {
	"code": "🖋️",
	"keywords": ["fountain_pen"]
}, {
	"code": "🖊️",
	"keywords": ["pen"]
}, {
	"code": "🖌️",
	"keywords": ["paintbrush"]
}, {
	"code": "🖍️",
	"keywords": ["crayon"]
}, {
	"code": "📝",
	"keywords": ["document", "note", "memo", "pencil", "communication"]
}, {
	"code": "💼",
	"keywords": ["business", "briefcase"]
}, {
	"code": "📁",
	"keywords": ["directory", "file_folder", "file", "folder"]
}, {
	"code": "📂",
	"keywords": ["open_file_folder", "file", "folder", "open"]
}, {
	"code": "🗂️",
	"keywords": ["card_index_dividers"]
}, {
	"code": "📅",
	"keywords": ["calendar", "schedule", "date"]
}, {
	"code": "📆",
	"keywords": ["schedule", "calendar"]
}, {
	"code": "🗒️",
	"keywords": ["spiral_notepad"]
}, {
	"code": "🗓️",
	"keywords": ["spiral_calendar"]
}, {
	"code": "📇",
	"keywords": ["card_index", "card", "index", "rolodex"]
}, {
	"code": "📈",
	"keywords": ["graph", "metrics", "chart_with_upwards_trend", "chart", "growth", "trend", "upward"]
}, {
	"code": "📉",
	"keywords": ["graph", "metrics", "chart_with_downwards_trend", "chart", "down", "trend"]
}, {
	"code": "📊",
	"keywords": ["stats", "metrics", "bar_chart", "bar", "chart", "graph"]
}, {
	"code": "📋",
	"keywords": ["clipboard"]
}, {
	"code": "📌",
	"keywords": ["location", "pushpin", "pin"]
}, {
	"code": "📍",
	"keywords": ["location", "round_pushpin", "pin", "pushpin"]
}, {
	"code": "📎",
	"keywords": ["paperclip"]
}, {
	"code": "🖇️",
	"keywords": ["paperclips"]
}, {
	"code": "📏",
	"keywords": ["straight_ruler", "ruler", "straight edge"]
}, {
	"code": "📐",
	"keywords": ["triangular_ruler", "ruler", "set", "triangle"]
}, {
	"code": "✂️",
	"keywords": ["cut", "scissors", "tool"]
}, {
	"code": "🗃️",
	"keywords": ["card_file_box"]
}, {
	"code": "🗄️",
	"keywords": ["file_cabinet"]
}, {
	"code": "🗑️",
	"keywords": ["trash", "wastebasket"]
}, {
	"code": "🔒",
	"keywords": ["security", "private", "lock", "closed"]
}, {
	"code": "🔓",
	"keywords": ["security", "unlock", "lock", "open"]
}, {
	"code": "🔏",
	"keywords": ["lock_with_ink_pen", "ink", "lock", "nib", "pen", "privacy"]
}, {
	"code": "🔐",
	"keywords": ["security", "closed_lock_with_key", "closed", "key", "lock", "secure"]
}, {
	"code": "🔑",
	"keywords": ["lock", "password", "key"]
}, {
	"code": "🗝️",
	"keywords": ["old_key"]
}, {
	"code": "🔨",
	"keywords": ["tool", "hammer"]
}, {
	"code": "🪓",
	"keywords": ["axe"]
}, {
	"code": "⛏️",
	"keywords": ["pick"]
}, {
	"code": "⚒️",
	"keywords": ["hammer_and_pick", "hammer", "pick", "tool"]
}, {
	"code": "🛠️",
	"keywords": ["hammer_and_wrench"]
}, {
	"code": "🗡️",
	"keywords": ["dagger"]
}, {
	"code": "⚔️",
	"keywords": ["crossed_swords", "crossed", "swords", "weapon"]
}, {
	"code": "🔫",
	"keywords": ["shoot", "weapon", "gun", "handgun", "pistol", "revolver", "tool"]
}, {
	"code": "🪃",
	"keywords": ["boomerang"]
}, {
	"code": "🏹",
	"keywords": ["archery", "bow_and_arrow", "archer", "arrow", "bow", "sagittarius", "tool", "weapon", "zodiac"]
}, {
	"code": "🛡️",
	"keywords": ["shield"]
}, {
	"code": "🪚",
	"keywords": ["carpentry_saw"]
}, {
	"code": "🔧",
	"keywords": ["tool", "wrench"]
}, {
	"code": "🪛",
	"keywords": ["screwdriver"]
}, {
	"code": "🔩",
	"keywords": ["nut_and_bolt", "bolt", "nut", "tool"]
}, {
	"code": "⚙️",
	"keywords": ["gear", "tool"]
}, {
	"code": "🗜️",
	"keywords": ["clamp"]
}, {
	"code": "⚖️",
	"keywords": ["balance_scale", "balance", "justice", "libra", "scales", "tool", "weight", "zodiac"]
}, {
	"code": "🦯",
	"keywords": ["probing_cane"]
}, {
	"code": "🔗",
	"keywords": ["link"]
}, {
	"code": "⛓️",
	"keywords": ["chains"]
}, {
	"code": "🪝",
	"keywords": ["hook"]
}, {
	"code": "🧰",
	"keywords": ["toolbox"]
}, {
	"code": "🧲",
	"keywords": ["magnet"]
}, {
	"code": "🪜",
	"keywords": ["ladder"]
}, {
	"code": "⚗️",
	"keywords": ["alembic", "chemistry", "tool"]
}, {
	"code": "🧪",
	"keywords": ["test_tube"]
}, {
	"code": "🧫",
	"keywords": ["petri_dish"]
}, {
	"code": "🧬",
	"keywords": ["dna"]
}, {
	"code": "🔬",
	"keywords": ["science", "laboratory", "investigate", "microscope", "tool"]
}, {
	"code": "🔭",
	"keywords": ["telescope", "tool"]
}, {
	"code": "📡",
	"keywords": ["signal", "satellite", "antenna", "communication", "dish"]
}, {
	"code": "💉",
	"keywords": ["health", "hospital", "needle", "syringe", "doctor", "medicine", "shot", "sick", "tool"]
}, {
	"code": "🩸",
	"keywords": ["drop_of_blood"]
}, {
	"code": "💊",
	"keywords": ["health", "medicine", "pill", "doctor", "sick"]
}, {
	"code": "🩹",
	"keywords": ["adhesive_bandage"]
}, {
	"code": "🩺",
	"keywords": ["stethoscope"]
}, {
	"code": "🚪",
	"keywords": ["door"]
}, {
	"code": "🛗",
	"keywords": ["elevator"]
}, {
	"code": "🪞",
	"keywords": ["mirror"]
}, {
	"code": "🪟",
	"keywords": ["window"]
}, {
	"code": "🛏️",
	"keywords": ["bed"]
}, {
	"code": "🛋️",
	"keywords": ["couch_and_lamp"]
}, {
	"code": "🪑",
	"keywords": ["chair"]
}, {
	"code": "🚽",
	"keywords": ["wc", "toilet"]
}, {
	"code": "🪠",
	"keywords": ["plunger"]
}, {
	"code": "🚿",
	"keywords": ["bath", "shower", "water"]
}, {
	"code": "🛁",
	"keywords": ["bathtub", "bath"]
}, {
	"code": "🪤",
	"keywords": ["mouse_trap"]
}, {
	"code": "🪒",
	"keywords": ["razor"]
}, {
	"code": "🧴",
	"keywords": ["lotion_bottle"]
}, {
	"code": "🧷",
	"keywords": ["safety_pin"]
}, {
	"code": "🧹",
	"keywords": ["broom"]
}, {
	"code": "🧺",
	"keywords": ["basket"]
}, {
	"code": "🧻",
	"keywords": ["toilet", "roll_of_paper"]
}, {
	"code": "🪣",
	"keywords": ["bucket"]
}, {
	"code": "🧼",
	"keywords": ["soap"]
}, {
	"code": "🪥",
	"keywords": ["toothbrush"]
}, {
	"code": "🧽",
	"keywords": ["sponge"]
}, {
	"code": "🧯",
	"keywords": ["fire_extinguisher"]
}, {
	"code": "🛒",
	"keywords": ["shopping_cart", "cart", "shopping", "trolley"]
}, {
	"code": "🚬",
	"keywords": ["cigarette", "smoking", "activity"]
}, {
	"code": "⚰️",
	"keywords": ["funeral", "coffin"]
}, {
	"code": "🪦",
	"keywords": ["headstone"]
}, {
	"code": "⚱️",
	"keywords": ["funeral_urn"]
}, {
	"code": "🗿",
	"keywords": ["stone", "moyai", "face", "statue"]
}, {
	"code": "🪧",
	"keywords": ["placard"]
}, {
	"code": "symbols",
	"header": true
}, {
	"code": "🏧",
	"keywords": ["atm", "automated", "bank", "teller"]
}, {
	"code": "🚮",
	"keywords": ["put_litter_in_its_place", "litter", "litterbox"]
}, {
	"code": "🚰",
	"keywords": ["potable_water", "drink", "potable", "water"]
}, {
	"code": "♿",
	"keywords": ["accessibility", "wheelchair", "access"]
}, {
	"code": "🚹",
	"keywords": ["mens", "lavatory", "man", "restroom", "wc"]
}, {
	"code": "🚺",
	"keywords": ["womens", "lavatory", "restroom", "wc", "woman"]
}, {
	"code": "🚻",
	"keywords": ["toilet", "restroom", "lavatory", "wc"]
}, {
	"code": "🚼",
	"keywords": ["baby_symbol", "baby", "changing"]
}, {
	"code": "🚾",
	"keywords": ["toilet", "restroom", "wc", "closet", "lavatory", "water"]
}, {
	"code": "🛂",
	"keywords": ["passport_control", "control", "passport"]
}, {
	"code": "🛃",
	"keywords": ["customs"]
}, {
	"code": "🛄",
	"keywords": ["airport", "baggage_claim", "baggage", "claim"]
}, {
	"code": "🛅",
	"keywords": ["left_luggage", "baggage", "left luggage", "locker", "luggage"]
}, {
	"code": "⚠️",
	"keywords": ["wip", "warning"]
}, {
	"code": "🚸",
	"keywords": ["children_crossing", "child", "crossing", "pedestrian", "traffic"]
}, {
	"code": "⛔",
	"keywords": ["limit", "no_entry", "entry", "forbidden", "no", "not", "prohibited", "traffic"]
}, {
	"code": "🚫",
	"keywords": ["block", "forbidden", "no_entry_sign", "entry", "no", "not", "prohibited"]
}, {
	"code": "🚳",
	"keywords": ["no_bicycles", "bicycle", "bike", "forbidden", "no", "not", "prohibited", "vehicle"]
}, {
	"code": "🚭",
	"keywords": ["no_smoking", "forbidden", "no", "not", "prohibited", "smoking"]
}, {
	"code": "🚯",
	"keywords": ["do_not_litter", "forbidden", "litter", "no", "not", "prohibited"]
}, {
	"code": "🚱",
	"keywords": ["non-potable_water", "drink", "forbidden", "no", "not", "potable", "prohibited", "water"]
}, {
	"code": "🚷",
	"keywords": ["no_pedestrians", "forbidden", "no", "not", "pedestrian", "prohibited"]
}, {
	"code": "📵",
	"keywords": ["no_mobile_phones", "cell", "communication", "forbidden", "mobile", "no", "not", "phone", "prohibited", "telephone"]
}, {
	"code": "🔞",
	"keywords": ["underage", "18", "age restriction", "eighteen", "forbidden", "no", "not", "prohibited"]
}, {
	"code": "☢️",
	"keywords": ["radioactive"]
}, {
	"code": "☣️",
	"keywords": ["biohazard"]
}, {
	"code": "⬆️",
	"keywords": ["arrow_up"]
}, {
	"code": "↗️",
	"keywords": ["arrow_upper_right", "arrow", "direction", "intercardinal", "northeast"]
}, {
	"code": "➡️",
	"keywords": ["arrow_right"]
}, {
	"code": "↘️",
	"keywords": ["arrow_lower_right", "arrow", "direction", "intercardinal", "southeast"]
}, {
	"code": "⬇️",
	"keywords": ["arrow_down"]
}, {
	"code": "↙️",
	"keywords": ["arrow_lower_left", "arrow", "direction", "intercardinal", "southwest"]
}, {
	"code": "⬅️",
	"keywords": ["arrow_left"]
}, {
	"code": "↖️",
	"keywords": ["arrow_upper_left", "arrow", "direction", "intercardinal", "northwest"]
}, {
	"code": "↕️",
	"keywords": ["arrow_up_down", "arrow"]
}, {
	"code": "↔️",
	"keywords": ["left_right_arrow", "arrow"]
}, {
	"code": "↩️",
	"keywords": ["return", "leftwards_arrow_with_hook"]
}, {
	"code": "↪️",
	"keywords": ["arrow_right_hook"]
}, {
	"code": "⤴️",
	"keywords": ["arrow_heading_up", "arrow", "up"]
}, {
	"code": "⤵️",
	"keywords": ["arrow_heading_down", "arrow", "down"]
}, {
	"code": "🔃",
	"keywords": ["arrows_clockwise", "arrow", "clockwise", "reload"]
}, {
	"code": "🔄",
	"keywords": ["sync", "arrows_counterclockwise", "anticlockwise", "arrow", "counterclockwise", "withershins"]
}, {
	"code": "🔙",
	"keywords": ["back", "arrow"]
}, {
	"code": "🔚",
	"keywords": ["end", "arrow"]
}, {
	"code": "🔛",
	"keywords": ["on", "arrow", "mark"]
}, {
	"code": "🔜",
	"keywords": ["soon", "arrow"]
}, {
	"code": "🔝",
	"keywords": ["top", "arrow", "up"]
}, {
	"code": "🛐",
	"keywords": ["place_of_worship", "religion", "worship"]
}, {
	"code": "⚛️",
	"keywords": ["atom_symbol"]
}, {
	"code": "🕉️",
	"keywords": ["om"]
}, {
	"code": "✡️",
	"keywords": ["star_of_david", "david", "jew", "jewish", "religion", "star"]
}, {
	"code": "☸️",
	"keywords": ["wheel_of_dharma", "buddhist", "dharma", "religion", "wheel"]
}, {
	"code": "☯️",
	"keywords": ["yin_yang"]
}, {
	"code": "✝️",
	"keywords": ["latin_cross"]
}, {
	"code": "☦️",
	"keywords": ["orthodox_cross", "christian", "cross", "religion"]
}, {
	"code": "☪️",
	"keywords": ["star_and_crescent"]
}, {
	"code": "☮️",
	"keywords": ["peace_symbol"]
}, {
	"code": "🕎",
	"keywords": ["menorah", "candelabrum", "candlestick", "religion"]
}, {
	"code": "🔯",
	"keywords": ["six_pointed_star", "fortune", "star"]
}, {
	"code": "♈",
	"keywords": ["aries", "ram", "zodiac"]
}, {
	"code": "♉",
	"keywords": ["taurus", "bull", "ox", "zodiac"]
}, {
	"code": "♊",
	"keywords": ["gemini", "twins", "zodiac"]
}, {
	"code": "♋",
	"keywords": ["cancer", "crab", "zodiac"]
}, {
	"code": "♌",
	"keywords": ["leo", "lion", "zodiac"]
}, {
	"code": "♍",
	"keywords": ["virgo", "maiden", "virgin", "zodiac"]
}, {
	"code": "♎",
	"keywords": ["libra", "balance", "justice", "scales", "zodiac"]
}, {
	"code": "♏",
	"keywords": ["scorpius", "scorpio", "scorpion", "zodiac"]
}, {
	"code": "♐",
	"keywords": ["sagittarius", "archer", "zodiac"]
}, {
	"code": "♑",
	"keywords": ["capricorn", "goat", "zodiac"]
}, {
	"code": "♒",
	"keywords": ["aquarius", "bearer", "water", "zodiac"]
}, {
	"code": "♓",
	"keywords": ["pisces", "fish", "zodiac"]
}, {
	"code": "⛎",
	"keywords": ["ophiuchus", "bearer", "serpent", "snake", "zodiac"]
}, {
	"code": "🔀",
	"keywords": ["shuffle", "twisted_rightwards_arrows", "arrow", "crossed"]
}, {
	"code": "🔁",
	"keywords": ["loop", "repeat", "arrow", "clockwise"]
}, {
	"code": "🔂",
	"keywords": ["repeat_one", "arrow", "clockwise", "once"]
}, {
	"code": "▶️",
	"keywords": ["arrow_forward"]
}, {
	"code": "⏩",
	"keywords": ["fast_forward", "arrow", "double", "fast", "forward"]
}, {
	"code": "⏭️",
	"keywords": ["next_track_button"]
}, {
	"code": "⏯️",
	"keywords": ["play_or_pause_button"]
}, {
	"code": "◀️",
	"keywords": ["arrow_backward"]
}, {
	"code": "⏪",
	"keywords": ["rewind", "arrow", "double"]
}, {
	"code": "⏮️",
	"keywords": ["previous_track_button"]
}, {
	"code": "🔼",
	"keywords": ["arrow_up_small", "arrow", "button", "red"]
}, {
	"code": "⏫",
	"keywords": ["arrow_double_up", "arrow", "double"]
}, {
	"code": "🔽",
	"keywords": ["arrow_down_small", "arrow", "button", "down", "red"]
}, {
	"code": "⏬",
	"keywords": ["arrow_double_down", "arrow", "double", "down"]
}, {
	"code": "⏸️",
	"keywords": ["pause_button"]
}, {
	"code": "⏹️",
	"keywords": ["stop_button"]
}, {
	"code": "⏺️",
	"keywords": ["record_button"]
}, {
	"code": "⏏️",
	"keywords": ["eject_button"]
}, {
	"code": "🎦",
	"keywords": ["film", "movie", "cinema", "activity", "camera", "entertainment"]
}, {
	"code": "🔅",
	"keywords": ["low_brightness", "brightness", "dim", "low"]
}, {
	"code": "🔆",
	"keywords": ["high_brightness", "bright", "brightness"]
}, {
	"code": "📶",
	"keywords": ["wifi", "signal_strength", "antenna", "bar", "cell", "communication", "mobile", "phone", "signal", "telephone"]
}, {
	"code": "📳",
	"keywords": ["vibration_mode", "cell", "communication", "mobile", "mode", "phone", "telephone", "vibration"]
}, {
	"code": "📴",
	"keywords": ["mute", "off", "mobile_phone_off", "cell", "communication", "mobile", "phone", "telephone"]
}, {
	"code": "♀️",
	"keywords": ["female_sign"]
}, {
	"code": "♂️",
	"keywords": ["male_sign"]
}, {
	"code": "⚧️",
	"keywords": ["transgender_symbol"]
}, {
	"code": "✖️",
	"keywords": ["heavy_multiplication_x", "cancel", "multiplication", "multiply", "x"]
}, {
	"code": "➕",
	"keywords": ["heavy_plus_sign", "math", "plus"]
}, {
	"code": "➖",
	"keywords": ["heavy_minus_sign", "math", "minus"]
}, {
	"code": "➗",
	"keywords": ["heavy_division_sign", "division", "math"]
}, {
	"code": "♾️",
	"keywords": ["infinity"]
}, {
	"code": "‼️",
	"keywords": ["bangbang"]
}, {
	"code": "⁉️",
	"keywords": ["interrobang", "exclamation", "mark", "punctuation", "question"]
}, {
	"code": "❓",
	"keywords": ["confused", "question", "mark", "punctuation"]
}, {
	"code": "❔",
	"keywords": ["grey_question", "mark", "outlined", "punctuation", "question"]
}, {
	"code": "❕",
	"keywords": ["grey_exclamation", "exclamation", "mark", "outlined", "punctuation"]
}, {
	"code": "❗",
	"keywords": ["bang", "exclamation", "heavy_exclamation_mark", "mark", "punctuation"]
}, {
	"code": "〰️",
	"keywords": ["wavy_dash", "dash", "punctuation", "wavy"]
}, {
	"code": "💱",
	"keywords": ["currency_exchange", "bank", "currency", "exchange", "money"]
}, {
	"code": "💲",
	"keywords": ["heavy_dollar_sign", "currency", "dollar", "money"]
}, {
	"code": "⚕️",
	"keywords": ["medical_symbol"]
}, {
	"code": "♻️",
	"keywords": ["environment", "green", "recycle"]
}, {
	"code": "⚜️",
	"keywords": ["fleur_de_lis"]
}, {
	"code": "🔱",
	"keywords": ["trident", "anchor", "emblem", "ship", "tool"]
}, {
	"code": "📛",
	"keywords": ["name_badge", "badge", "name"]
}, {
	"code": "🔰",
	"keywords": ["beginner", "chevron", "green", "japanese", "leaf", "tool", "yellow"]
}, {
	"code": "⭕",
	"keywords": ["o", "circle"]
}, {
	"code": "✅",
	"keywords": ["white_check_mark", "check", "mark"]
}, {
	"code": "☑️",
	"keywords": ["ballot_box_with_check", "ballot", "box", "check"]
}, {
	"code": "✔️",
	"keywords": ["heavy_check_mark", "check", "mark"]
}, {
	"code": "❌",
	"keywords": ["x", "cancel", "mark", "multiplication", "multiply"]
}, {
	"code": "❎",
	"keywords": ["negative_squared_cross_mark", "mark", "square"]
}, {
	"code": "➰",
	"keywords": ["curly_loop", "curl", "loop"]
}, {
	"code": "➿",
	"keywords": ["loop", "curl", "double"]
}, {
	"code": "〽️",
	"keywords": ["part_alternation_mark"]
}, {
	"code": "✳️",
	"keywords": ["eight_spoked_asterisk", "asterisk"]
}, {
	"code": "✴️",
	"keywords": ["eight_pointed_black_star", "star"]
}, {
	"code": "❇️",
	"keywords": ["sparkle"]
}, {
	"code": "©️",
	"keywords": ["copyright"]
}, {
	"code": "®️",
	"keywords": ["registered"]
}, {
	"code": "™️",
	"keywords": ["trademark", "tm", "mark"]
}, {
	"code": "#️⃣",
	"keywords": ["number", "hash", "keycap", "pound"]
}, {
	"code": "*️⃣",
	"keywords": ["asterisk", "keycap", "star"]
}, {
	"code": "0️⃣",
	"keywords": ["zero", "0", "keycap"]
}, {
	"code": "1️⃣",
	"keywords": ["one", "1", "keycap"]
}, {
	"code": "2️⃣",
	"keywords": ["two", "2", "keycap"]
}, {
	"code": "3️⃣",
	"keywords": ["three", "3", "keycap"]
}, {
	"code": "4️⃣",
	"keywords": ["four", "4", "keycap"]
}, {
	"code": "5️⃣",
	"keywords": ["five", "5", "keycap"]
}, {
	"code": "6️⃣",
	"keywords": ["six", "6", "keycap"]
}, {
	"code": "7️⃣",
	"keywords": ["seven", "7", "keycap"]
}, {
	"code": "8️⃣",
	"keywords": ["eight", "8", "keycap"]
}, {
	"code": "9️⃣",
	"keywords": ["nine", "9", "keycap"]
}, {
	"code": "🔟",
	"keywords": ["keycap_ten", "10", "keycap", "ten"]
}, {
	"code": "🔠",
	"keywords": ["letters", "capital_abcd", "input", "latin", "uppercase"]
}, {
	"code": "🔡",
	"keywords": ["abcd", "input", "latin", "letters", "lowercase"]
}, {
	"code": "🔢",
	"keywords": ["numbers", "1234", "input"]
}, {
	"code": "🔣",
	"keywords": ["symbols", "input"]
}, {
	"code": "🔤",
	"keywords": ["alphabet", "abc", "input", "latin", "letters"]
}, {
	"code": "🅰️",
	"keywords": ["a"]
}, {
	"code": "🆎",
	"keywords": ["ab", "blood"]
}, {
	"code": "🅱️",
	"keywords": ["b"]
}, {
	"code": "🆑",
	"keywords": ["cl"]
}, {
	"code": "🆒",
	"keywords": ["cool"]
}, {
	"code": "🆓",
	"keywords": ["free"]
}, {
	"code": "ℹ️",
	"keywords": ["information_source", "i", "information"]
}, {
	"code": "🆔",
	"keywords": ["id", "identity"]
}, {
	"code": "Ⓜ️",
	"keywords": ["m"]
}, {
	"code": "🆕",
	"keywords": ["fresh", "new"]
}, {
	"code": "🆖",
	"keywords": ["ng"]
}, {
	"code": "🅾️",
	"keywords": ["o2"]
}, {
	"code": "🆗",
	"keywords": ["yes", "ok"]
}, {
	"code": "🅿️",
	"keywords": ["parking"]
}, {
	"code": "🆘",
	"keywords": ["help", "emergency", "sos"]
}, {
	"code": "🆙",
	"keywords": ["up", "mark"]
}, {
	"code": "🆚",
	"keywords": ["vs", "versus"]
}, {
	"code": "🈁",
	"keywords": ["koko", "japanese"]
}, {
	"code": "🈂️",
	"keywords": ["sa"]
}, {
	"code": "🈷️",
	"keywords": ["u6708"]
}, {
	"code": "🈶",
	"keywords": ["u6709", "japanese"]
}, {
	"code": "🈯",
	"keywords": ["u6307", "japanese"]
}, {
	"code": "🉐",
	"keywords": ["ideograph_advantage", "japanese"]
}, {
	"code": "🈹",
	"keywords": ["u5272", "japanese"]
}, {
	"code": "🈚",
	"keywords": ["u7121", "japanese"]
}, {
	"code": "🈲",
	"keywords": ["u7981", "japanese"]
}, {
	"code": "🉑",
	"keywords": ["accept", "chinese"]
}, {
	"code": "🈸",
	"keywords": ["u7533", "chinese"]
}, {
	"code": "🈴",
	"keywords": ["u5408", "chinese"]
}, {
	"code": "🈳",
	"keywords": ["u7a7a", "chinese"]
}, {
	"code": "㊗️",
	"keywords": ["congratulations", "chinese", "congratulation", "ideograph"]
}, {
	"code": "㊙️",
	"keywords": ["secret", "chinese", "ideograph"]
}, {
	"code": "🈺",
	"keywords": ["u55b6", "chinese"]
}, {
	"code": "🈵",
	"keywords": ["u6e80", "chinese"]
}, {
	"code": "🔴",
	"keywords": ["red_circle", "circle", "geometric", "red"]
}, {
	"code": "🟠",
	"keywords": ["orange_circle"]
}, {
	"code": "🟡",
	"keywords": ["yellow_circle"]
}, {
	"code": "🟢",
	"keywords": ["green_circle"]
}, {
	"code": "🔵",
	"keywords": ["large_blue_circle", "blue", "circle", "geometric"]
}, {
	"code": "🟣",
	"keywords": ["purple_circle"]
}, {
	"code": "🟤",
	"keywords": ["brown_circle"]
}, {
	"code": "⚫",
	"keywords": ["black_circle", "circle", "geometric"]
}, {
	"code": "⚪",
	"keywords": ["white_circle", "circle", "geometric"]
}, {
	"code": "🟥",
	"keywords": ["red_square"]
}, {
	"code": "🟧",
	"keywords": ["orange_square"]
}, {
	"code": "🟨",
	"keywords": ["yellow_square"]
}, {
	"code": "🟩",
	"keywords": ["green_square"]
}, {
	"code": "🟦",
	"keywords": ["blue_square"]
}, {
	"code": "🟪",
	"keywords": ["purple_square"]
}, {
	"code": "🟫",
	"keywords": ["brown_square"]
}, {
	"code": "⬛",
	"keywords": ["black_large_square", "geometric", "square"]
}, {
	"code": "⬜",
	"keywords": ["white_large_square", "geometric", "square"]
}, {
	"code": "◼️",
	"keywords": ["black_medium_square"]
}, {
	"code": "◻️",
	"keywords": ["white_medium_square"]
}, {
	"code": "◾",
	"keywords": ["black_medium_small_square", "geometric", "square"]
}, {
	"code": "◽",
	"keywords": ["white_medium_small_square", "geometric", "square"]
}, {
	"code": "▪️",
	"keywords": ["black_small_square"]
}, {
	"code": "▫️",
	"keywords": ["white_small_square"]
}, {
	"code": "🔶",
	"keywords": ["large_orange_diamond", "diamond", "geometric", "orange"]
}, {
	"code": "🔷",
	"keywords": ["large_blue_diamond", "blue", "diamond", "geometric"]
}, {
	"code": "🔸",
	"keywords": ["small_orange_diamond", "diamond", "geometric", "orange"]
}, {
	"code": "🔹",
	"keywords": ["small_blue_diamond", "blue", "diamond", "geometric"]
}, {
	"code": "🔺",
	"keywords": ["small_red_triangle", "geometric", "red"]
}, {
	"code": "🔻",
	"keywords": ["small_red_triangle_down", "down", "geometric", "red"]
}, {
	"code": "💠",
	"keywords": ["diamond_shape_with_a_dot_inside", "comic", "diamond", "geometric", "inside"]
}, {
	"code": "🔘",
	"keywords": ["radio_button", "button", "geometric", "radio"]
}, {
	"code": "🔳",
	"keywords": ["white_square_button", "button", "geometric", "outlined", "square"]
}, {
	"code": "🔲",
	"keywords": ["black_square_button", "button", "geometric", "square"]
}, {
	"code": "flags",
	"header": true
}, {
	"code": "🏁",
	"keywords": ["milestone", "finish", "checkered_flag", "checkered", "chequered", "flag", "racing"]
}, {
	"code": "🚩",
	"keywords": ["triangular_flag_on_post", "flag", "post"]
}, {
	"code": "🎌",
	"keywords": ["crossed_flags", "activity", "celebration", "cross", "crossed", "flag", "japanese"]
}, {
	"code": "🏴",
	"keywords": ["black_flag", "flag", "waving"]
}, {
	"code": "🏳️",
	"keywords": ["white_flag", "flag"]
}, {
	"code": "🏳️‍🌈",
	"keywords": ["pride", "rainbow_flag"]
}, {
	"code": "🏳️‍⚧️",
	"keywords": ["transgender_flag", "flag"]
}, {
	"code": "🏴‍☠️",
	"keywords": ["pirate_flag", "flag"]
}, {
	"code": "🇦🇨",
	"keywords": ["ascension_island", "ascension", "flag", "island"]
}, {
	"code": "🇦🇩",
	"keywords": ["andorra", "flag"]
}, {
	"code": "🇦🇪",
	"keywords": ["united_arab_emirates", "emirates", "flag", "uae", "united"]
}, {
	"code": "🇦🇫",
	"keywords": ["afghanistan", "flag"]
}, {
	"code": "🇦🇬",
	"keywords": ["antigua_barbuda", "antigua", "barbuda", "flag"]
}, {
	"code": "🇦🇮",
	"keywords": ["anguilla", "flag"]
}, {
	"code": "🇦🇱",
	"keywords": ["albania", "flag"]
}, {
	"code": "🇦🇲",
	"keywords": ["armenia", "flag"]
}, {
	"code": "🇦🇴",
	"keywords": ["angola", "flag"]
}, {
	"code": "🇦🇶",
	"keywords": ["antarctica", "flag"]
}, {
	"code": "🇦🇷",
	"keywords": ["argentina", "flag"]
}, {
	"code": "🇦🇸",
	"keywords": ["american_samoa", "american", "flag", "samoa"]
}, {
	"code": "🇦🇹",
	"keywords": ["austria", "flag"]
}, {
	"code": "🇦🇺",
	"keywords": ["australia", "flag"]
}, {
	"code": "🇦🇼",
	"keywords": ["aruba", "flag"]
}, {
	"code": "🇦🇽",
	"keywords": ["aland_islands", "åland", "flag"]
}, {
	"code": "🇦🇿",
	"keywords": ["azerbaijan", "flag"]
}, {
	"code": "🇧🇦",
	"keywords": ["bosnia_herzegovina", "bosnia", "flag", "herzegovina"]
}, {
	"code": "🇧🇧",
	"keywords": ["barbados", "flag"]
}, {
	"code": "🇧🇩",
	"keywords": ["bangladesh", "flag"]
}, {
	"code": "🇧🇪",
	"keywords": ["belgium", "flag"]
}, {
	"code": "🇧🇫",
	"keywords": ["burkina_faso", "burkina faso", "flag"]
}, {
	"code": "🇧🇬",
	"keywords": ["bulgaria", "flag"]
}, {
	"code": "🇧🇭",
	"keywords": ["bahrain", "flag"]
}, {
	"code": "🇧🇮",
	"keywords": ["burundi", "flag"]
}, {
	"code": "🇧🇯",
	"keywords": ["benin", "flag"]
}, {
	"code": "🇧🇱",
	"keywords": ["st_barthelemy", "barthelemy", "barthélemy", "flag", "saint"]
}, {
	"code": "🇧🇲",
	"keywords": ["bermuda", "flag"]
}, {
	"code": "🇧🇳",
	"keywords": ["brunei", "darussalam", "flag"]
}, {
	"code": "🇧🇴",
	"keywords": ["bolivia", "flag"]
}, {
	"code": "🇧🇶",
	"keywords": ["caribbean_netherlands", "bonaire", "caribbean", "eustatius", "flag", "netherlands", "saba", "sint"]
}, {
	"code": "🇧🇷",
	"keywords": ["brazil", "flag"]
}, {
	"code": "🇧🇸",
	"keywords": ["bahamas", "flag"]
}, {
	"code": "🇧🇹",
	"keywords": ["bhutan", "flag"]
}, {
	"code": "🇧🇻",
	"keywords": ["bouvet_island", "bouvet", "flag", "island"]
}, {
	"code": "🇧🇼",
	"keywords": ["botswana", "flag"]
}, {
	"code": "🇧🇾",
	"keywords": ["belarus", "flag"]
}, {
	"code": "🇧🇿",
	"keywords": ["belize", "flag"]
}, {
	"code": "🇨🇦",
	"keywords": ["canada", "flag"]
}, {
	"code": "🇨🇨",
	"keywords": ["keeling", "cocos_islands", "cocos", "flag", "island"]
}, {
	"code": "🇨🇩",
	"keywords": ["congo_kinshasa", "congo", "congo-kinshasa", "democratic republic of congo", "drc", "flag", "kinshasa", "republic"]
}, {
	"code": "🇨🇫",
	"keywords": ["central_african_republic", "central african republic", "flag", "republic"]
}, {
	"code": "🇨🇬",
	"keywords": ["congo_brazzaville", "brazzaville", "congo", "congo republic", "congo-brazzaville", "flag", "republic", "republic of the congo"]
}, {
	"code": "🇨🇭",
	"keywords": ["switzerland", "flag"]
}, {
	"code": "🇨🇮",
	"keywords": ["ivory", "cote_divoire", "cote ivoire", "côte ivoire", "flag", "ivory coast"]
}, {
	"code": "🇨🇰",
	"keywords": ["cook_islands", "cook", "flag", "island"]
}, {
	"code": "🇨🇱",
	"keywords": ["chile", "flag"]
}, {
	"code": "🇨🇲",
	"keywords": ["cameroon", "flag"]
}, {
	"code": "🇨🇳",
	"keywords": ["china", "cn", "flag"]
}, {
	"code": "🇨🇴",
	"keywords": ["colombia", "flag"]
}, {
	"code": "🇨🇵",
	"keywords": ["clipperton_island", "clipperton", "flag", "island"]
}, {
	"code": "🇨🇷",
	"keywords": ["costa_rica", "costa rica", "flag"]
}, {
	"code": "🇨🇺",
	"keywords": ["cuba", "flag"]
}, {
	"code": "🇨🇻",
	"keywords": ["cape_verde", "cabo", "cape", "flag", "verde"]
}, {
	"code": "🇨🇼",
	"keywords": ["curacao", "antilles", "curaçao", "flag"]
}, {
	"code": "🇨🇽",
	"keywords": ["christmas_island", "christmas", "flag", "island"]
}, {
	"code": "🇨🇾",
	"keywords": ["cyprus", "flag"]
}, {
	"code": "🇨🇿",
	"keywords": ["czech_republic", "czech republic", "flag"]
}, {
	"code": "🇩🇪",
	"keywords": ["flag", "germany", "de"]
}, {
	"code": "🇩🇬",
	"keywords": ["diego_garcia", "diego garcia", "flag"]
}, {
	"code": "🇩🇯",
	"keywords": ["djibouti", "flag"]
}, {
	"code": "🇩🇰",
	"keywords": ["denmark", "flag"]
}, {
	"code": "🇩🇲",
	"keywords": ["dominica", "flag"]
}, {
	"code": "🇩🇴",
	"keywords": ["dominican_republic", "dominican republic", "flag"]
}, {
	"code": "🇩🇿",
	"keywords": ["algeria", "flag"]
}, {
	"code": "🇪🇦",
	"keywords": ["ceuta_melilla", "ceuta", "flag", "melilla"]
}, {
	"code": "🇪🇨",
	"keywords": ["ecuador", "flag"]
}, {
	"code": "🇪🇪",
	"keywords": ["estonia", "flag"]
}, {
	"code": "🇪🇬",
	"keywords": ["egypt", "flag"]
}, {
	"code": "🇪🇭",
	"keywords": ["western_sahara", "flag", "sahara", "west", "western sahara"]
}, {
	"code": "🇪🇷",
	"keywords": ["eritrea", "flag"]
}, {
	"code": "🇪🇸",
	"keywords": ["spain", "es", "flag"]
}, {
	"code": "🇪🇹",
	"keywords": ["ethiopia", "flag"]
}, {
	"code": "🇪🇺",
	"keywords": ["eu", "european_union", "european union", "flag"]
}, {
	"code": "🇫🇮",
	"keywords": ["finland", "flag"]
}, {
	"code": "🇫🇯",
	"keywords": ["fiji", "flag"]
}, {
	"code": "🇫🇰",
	"keywords": ["falkland_islands", "falkland", "falklands", "flag", "island", "islas", "malvinas"]
}, {
	"code": "🇫🇲",
	"keywords": ["micronesia", "flag"]
}, {
	"code": "🇫🇴",
	"keywords": ["faroe_islands", "faroe", "flag", "island"]
}, {
	"code": "🇫🇷",
	"keywords": ["france", "french", "fr", "flag"]
}, {
	"code": "🇬🇦",
	"keywords": ["gabon", "flag"]
}, {
	"code": "🇬🇧",
	"keywords": ["flag", "british", "gb", "uk", "britain", "cornwall", "england", "great britain", "ireland", "northern ireland", "scotland", "union jack", "united", "united kingdom", "wales"]
}, {
	"code": "🇬🇩",
	"keywords": ["grenada", "flag"]
}, {
	"code": "🇬🇪",
	"keywords": ["georgia", "flag"]
}, {
	"code": "🇬🇫",
	"keywords": ["french_guiana", "flag", "french", "guiana"]
}, {
	"code": "🇬🇬",
	"keywords": ["guernsey", "flag"]
}, {
	"code": "🇬🇭",
	"keywords": ["ghana", "flag"]
}, {
	"code": "🇬🇮",
	"keywords": ["gibraltar", "flag"]
}, {
	"code": "🇬🇱",
	"keywords": ["greenland", "flag"]
}, {
	"code": "🇬🇲",
	"keywords": ["gambia", "flag"]
}, {
	"code": "🇬🇳",
	"keywords": ["guinea", "flag"]
}, {
	"code": "🇬🇵",
	"keywords": ["guadeloupe", "flag"]
}, {
	"code": "🇬🇶",
	"keywords": ["equatorial_guinea", "equatorial guinea", "flag", "guinea"]
}, {
	"code": "🇬🇷",
	"keywords": ["greece", "flag"]
}, {
	"code": "🇬🇸",
	"keywords": ["south_georgia_south_sandwich_islands", "flag", "georgia", "island", "south", "south georgia", "south sandwich"]
}, {
	"code": "🇬🇹",
	"keywords": ["guatemala", "flag"]
}, {
	"code": "🇬🇺",
	"keywords": ["guam", "flag"]
}, {
	"code": "🇬🇼",
	"keywords": ["guinea_bissau", "bissau", "flag", "guinea"]
}, {
	"code": "🇬🇾",
	"keywords": ["guyana", "flag"]
}, {
	"code": "🇭🇰",
	"keywords": ["hong_kong", "china", "flag", "hong kong"]
}, {
	"code": "🇭🇲",
	"keywords": ["heard_mcdonald_islands", "flag", "heard", "island", "mcdonald"]
}, {
	"code": "🇭🇳",
	"keywords": ["honduras", "flag"]
}, {
	"code": "🇭🇷",
	"keywords": ["croatia", "flag"]
}, {
	"code": "🇭🇹",
	"keywords": ["haiti", "flag"]
}, {
	"code": "🇭🇺",
	"keywords": ["hungary", "flag"]
}, {
	"code": "🇮🇨",
	"keywords": ["canary_islands", "canary", "flag", "island"]
}, {
	"code": "🇮🇩",
	"keywords": ["indonesia", "flag"]
}, {
	"code": "🇮🇪",
	"keywords": ["ireland", "flag"]
}, {
	"code": "🇮🇱",
	"keywords": ["israel", "flag"]
}, {
	"code": "🇮🇲",
	"keywords": ["isle_of_man", "flag", "isle of man"]
}, {
	"code": "🇮🇳",
	"keywords": ["india", "flag"]
}, {
	"code": "🇮🇴",
	"keywords": ["british_indian_ocean_territory", "british", "chagos", "flag", "indian ocean", "island"]
}, {
	"code": "🇮🇶",
	"keywords": ["iraq", "flag"]
}, {
	"code": "🇮🇷",
	"keywords": ["iran", "flag"]
}, {
	"code": "🇮🇸",
	"keywords": ["iceland", "flag"]
}, {
	"code": "🇮🇹",
	"keywords": ["italy", "it", "flag"]
}, {
	"code": "🇯🇪",
	"keywords": ["jersey", "flag"]
}, {
	"code": "🇯🇲",
	"keywords": ["jamaica", "flag"]
}, {
	"code": "🇯🇴",
	"keywords": ["jordan", "flag"]
}, {
	"code": "🇯🇵",
	"keywords": ["japan", "jp", "flag"]
}, {
	"code": "🇰🇪",
	"keywords": ["kenya", "flag"]
}, {
	"code": "🇰🇬",
	"keywords": ["kyrgyzstan", "flag"]
}, {
	"code": "🇰🇭",
	"keywords": ["cambodia", "flag"]
}, {
	"code": "🇰🇮",
	"keywords": ["kiribati", "flag"]
}, {
	"code": "🇰🇲",
	"keywords": ["comoros", "flag"]
}, {
	"code": "🇰🇳",
	"keywords": ["st_kitts_nevis", "flag", "kitts", "nevis", "saint"]
}, {
	"code": "🇰🇵",
	"keywords": ["north_korea", "flag", "korea", "north", "north korea"]
}, {
	"code": "🇰🇷",
	"keywords": ["korea", "kr", "flag", "south", "south korea"]
}, {
	"code": "🇰🇼",
	"keywords": ["kuwait", "flag"]
}, {
	"code": "🇰🇾",
	"keywords": ["cayman_islands", "cayman", "flag", "island"]
}, {
	"code": "🇰🇿",
	"keywords": ["kazakhstan", "flag"]
}, {
	"code": "🇱🇦",
	"keywords": ["laos", "flag"]
}, {
	"code": "🇱🇧",
	"keywords": ["lebanon", "flag"]
}, {
	"code": "🇱🇨",
	"keywords": ["st_lucia", "flag", "lucia", "saint"]
}, {
	"code": "🇱🇮",
	"keywords": ["liechtenstein", "flag"]
}, {
	"code": "🇱🇰",
	"keywords": ["sri_lanka", "flag", "sri lanka"]
}, {
	"code": "🇱🇷",
	"keywords": ["liberia", "flag"]
}, {
	"code": "🇱🇸",
	"keywords": ["lesotho", "flag"]
}, {
	"code": "🇱🇹",
	"keywords": ["lithuania", "flag"]
}, {
	"code": "🇱🇺",
	"keywords": ["luxembourg", "flag"]
}, {
	"code": "🇱🇻",
	"keywords": ["latvia", "flag"]
}, {
	"code": "🇱🇾",
	"keywords": ["libya", "flag"]
}, {
	"code": "🇲🇦",
	"keywords": ["morocco", "flag"]
}, {
	"code": "🇲🇨",
	"keywords": ["monaco", "flag"]
}, {
	"code": "🇲🇩",
	"keywords": ["moldova", "flag"]
}, {
	"code": "🇲🇪",
	"keywords": ["montenegro", "flag"]
}, {
	"code": "🇲🇫",
	"keywords": ["st_martin", "flag", "french", "martin", "saint"]
}, {
	"code": "🇲🇬",
	"keywords": ["madagascar", "flag"]
}, {
	"code": "🇲🇭",
	"keywords": ["marshall_islands", "flag", "island", "marshall"]
}, {
	"code": "🇲🇰",
	"keywords": ["macedonia", "flag"]
}, {
	"code": "🇲🇱",
	"keywords": ["mali", "flag"]
}, {
	"code": "🇲🇲",
	"keywords": ["burma", "myanmar", "flag"]
}, {
	"code": "🇲🇳",
	"keywords": ["mongolia", "flag"]
}, {
	"code": "🇲🇴",
	"keywords": ["macau", "china", "flag", "macao"]
}, {
	"code": "🇲🇵",
	"keywords": ["northern_mariana_islands", "flag", "island", "mariana", "north", "northern mariana"]
}, {
	"code": "🇲🇶",
	"keywords": ["martinique", "flag"]
}, {
	"code": "🇲🇷",
	"keywords": ["mauritania", "flag"]
}, {
	"code": "🇲🇸",
	"keywords": ["montserrat", "flag"]
}, {
	"code": "🇲🇹",
	"keywords": ["malta", "flag"]
}, {
	"code": "🇲🇺",
	"keywords": ["mauritius", "flag"]
}, {
	"code": "🇲🇻",
	"keywords": ["maldives", "flag"]
}, {
	"code": "🇲🇼",
	"keywords": ["malawi", "flag"]
}, {
	"code": "🇲🇽",
	"keywords": ["mexico", "flag"]
}, {
	"code": "🇲🇾",
	"keywords": ["malaysia", "flag"]
}, {
	"code": "🇲🇿",
	"keywords": ["mozambique", "flag"]
}, {
	"code": "🇳🇦",
	"keywords": ["namibia", "flag"]
}, {
	"code": "🇳🇨",
	"keywords": ["new_caledonia", "flag", "new", "new caledonia"]
}, {
	"code": "🇳🇪",
	"keywords": ["niger", "flag"]
}, {
	"code": "🇳🇫",
	"keywords": ["norfolk_island", "flag", "island", "norfolk"]
}, {
	"code": "🇳🇬",
	"keywords": ["nigeria", "flag"]
}, {
	"code": "🇳🇮",
	"keywords": ["nicaragua", "flag"]
}, {
	"code": "🇳🇱",
	"keywords": ["netherlands", "flag"]
}, {
	"code": "🇳🇴",
	"keywords": ["norway", "flag"]
}, {
	"code": "🇳🇵",
	"keywords": ["nepal", "flag"]
}, {
	"code": "🇳🇷",
	"keywords": ["nauru", "flag"]
}, {
	"code": "🇳🇺",
	"keywords": ["niue", "flag"]
}, {
	"code": "🇳🇿",
	"keywords": ["new_zealand", "flag", "new", "new zealand"]
}, {
	"code": "🇴🇲",
	"keywords": ["oman", "flag"]
}, {
	"code": "🇵🇦",
	"keywords": ["panama", "flag"]
}, {
	"code": "🇵🇪",
	"keywords": ["peru", "flag"]
}, {
	"code": "🇵🇫",
	"keywords": ["french_polynesia", "flag", "french", "polynesia"]
}, {
	"code": "🇵🇬",
	"keywords": ["papua_new_guinea", "flag", "guinea", "new", "papua new guinea"]
}, {
	"code": "🇵🇭",
	"keywords": ["philippines", "flag"]
}, {
	"code": "🇵🇰",
	"keywords": ["pakistan", "flag"]
}, {
	"code": "🇵🇱",
	"keywords": ["poland", "flag"]
}, {
	"code": "🇵🇲",
	"keywords": ["st_pierre_miquelon", "flag", "miquelon", "pierre", "saint"]
}, {
	"code": "🇵🇳",
	"keywords": ["pitcairn_islands", "flag", "island", "pitcairn"]
}, {
	"code": "🇵🇷",
	"keywords": ["puerto_rico", "flag", "puerto rico"]
}, {
	"code": "🇵🇸",
	"keywords": ["palestinian_territories", "flag", "palestine"]
}, {
	"code": "🇵🇹",
	"keywords": ["portugal", "flag"]
}, {
	"code": "🇵🇼",
	"keywords": ["palau", "flag"]
}, {
	"code": "🇵🇾",
	"keywords": ["paraguay", "flag"]
}, {
	"code": "🇶🇦",
	"keywords": ["qatar", "flag"]
}, {
	"code": "🇷🇪",
	"keywords": ["reunion", "flag", "réunion"]
}, {
	"code": "🇷🇴",
	"keywords": ["romania", "flag"]
}, {
	"code": "🇷🇸",
	"keywords": ["serbia", "flag"]
}, {
	"code": "🇷🇺",
	"keywords": ["russia", "ru", "flag"]
}, {
	"code": "🇷🇼",
	"keywords": ["rwanda", "flag"]
}, {
	"code": "🇸🇦",
	"keywords": ["saudi_arabia", "flag", "saudi arabia"]
}, {
	"code": "🇸🇧",
	"keywords": ["solomon_islands", "flag", "island", "solomon"]
}, {
	"code": "🇸🇨",
	"keywords": ["seychelles", "flag"]
}, {
	"code": "🇸🇩",
	"keywords": ["sudan", "flag"]
}, {
	"code": "🇸🇪",
	"keywords": ["sweden", "flag"]
}, {
	"code": "🇸🇬",
	"keywords": ["singapore", "flag"]
}, {
	"code": "🇸🇭",
	"keywords": ["st_helena", "flag", "helena", "saint"]
}, {
	"code": "🇸🇮",
	"keywords": ["slovenia", "flag"]
}, {
	"code": "🇸🇯",
	"keywords": ["svalbard_jan_mayen", "flag", "jan mayen", "svalbard"]
}, {
	"code": "🇸🇰",
	"keywords": ["slovakia", "flag"]
}, {
	"code": "🇸🇱",
	"keywords": ["sierra_leone", "flag", "sierra leone"]
}, {
	"code": "🇸🇲",
	"keywords": ["san_marino", "flag", "san marino"]
}, {
	"code": "🇸🇳",
	"keywords": ["senegal", "flag"]
}, {
	"code": "🇸🇴",
	"keywords": ["somalia", "flag"]
}, {
	"code": "🇸🇷",
	"keywords": ["suriname", "flag"]
}, {
	"code": "🇸🇸",
	"keywords": ["south_sudan", "flag", "south", "south sudan", "sudan"]
}, {
	"code": "🇸🇹",
	"keywords": ["sao_tome_principe", "flag", "principe", "príncipe", "sao tome", "são tomé"]
}, {
	"code": "🇸🇻",
	"keywords": ["el_salvador", "el salvador", "flag"]
}, {
	"code": "🇸🇽",
	"keywords": ["sint_maarten", "flag", "maarten", "sint"]
}, {
	"code": "🇸🇾",
	"keywords": ["syria", "flag"]
}, {
	"code": "🇸🇿",
	"keywords": ["swaziland", "flag"]
}, {
	"code": "🇹🇦",
	"keywords": ["tristan_da_cunha", "flag", "tristan da cunha"]
}, {
	"code": "🇹🇨",
	"keywords": ["turks_caicos_islands", "caicos", "flag", "island", "turks"]
}, {
	"code": "🇹🇩",
	"keywords": ["chad", "flag"]
}, {
	"code": "🇹🇫",
	"keywords": ["french_southern_territories", "antarctic", "flag", "french"]
}, {
	"code": "🇹🇬",
	"keywords": ["togo", "flag"]
}, {
	"code": "🇹🇭",
	"keywords": ["thailand", "flag"]
}, {
	"code": "🇹🇯",
	"keywords": ["tajikistan", "flag"]
}, {
	"code": "🇹🇰",
	"keywords": ["tokelau", "flag"]
}, {
	"code": "🇹🇱",
	"keywords": ["timor_leste", "east", "east timor", "flag", "timor-leste"]
}, {
	"code": "🇹🇲",
	"keywords": ["turkmenistan", "flag"]
}, {
	"code": "🇹🇳",
	"keywords": ["tunisia", "flag"]
}, {
	"code": "🇹🇴",
	"keywords": ["tonga", "flag"]
}, {
	"code": "🇹🇷",
	"keywords": ["turkey", "tr", "flag"]
}, {
	"code": "🇹🇹",
	"keywords": ["trinidad_tobago", "flag", "tobago", "trinidad"]
}, {
	"code": "🇹🇻",
	"keywords": ["tuvalu", "flag"]
}, {
	"code": "🇹🇼",
	"keywords": ["taiwan", "china", "flag"]
}, {
	"code": "🇹🇿",
	"keywords": ["tanzania", "flag"]
}, {
	"code": "🇺🇦",
	"keywords": ["ukraine", "flag"]
}, {
	"code": "🇺🇬",
	"keywords": ["uganda", "flag"]
}, {
	"code": "🇺🇲",
	"keywords": ["us_outlying_islands", "america", "flag", "island", "minor outlying", "united", "united states", "us", "usa"]
}, {
	"code": "🇺🇳",
	"keywords": ["united_nations"]
}, {
	"code": "🇺🇸",
	"keywords": ["flag", "united", "america", "us", "stars and stripes", "united states"]
}, {
	"code": "🇺🇾",
	"keywords": ["uruguay", "flag"]
}, {
	"code": "🇺🇿",
	"keywords": ["uzbekistan", "flag"]
}, {
	"code": "🇻🇦",
	"keywords": ["vatican_city", "flag", "vatican"]
}, {
	"code": "🇻🇨",
	"keywords": ["st_vincent_grenadines", "flag", "grenadines", "saint", "vincent"]
}, {
	"code": "🇻🇪",
	"keywords": ["venezuela", "flag"]
}, {
	"code": "🇻🇬",
	"keywords": ["british_virgin_islands", "british", "flag", "island", "virgin"]
}, {
	"code": "🇻🇮",
	"keywords": ["us_virgin_islands", "america", "american", "flag", "island", "united", "united states", "us", "usa", "virgin"]
}, {
	"code": "🇻🇳",
	"keywords": ["vietnam", "flag", "viet nam"]
}, {
	"code": "🇻🇺",
	"keywords": ["vanuatu", "flag"]
}, {
	"code": "🇼🇫",
	"keywords": ["wallis_futuna", "flag", "futuna", "wallis"]
}, {
	"code": "🇼🇸",
	"keywords": ["samoa", "flag"]
}, {
	"code": "🇽🇰",
	"keywords": ["kosovo", "flag"]
}, {
	"code": "🇾🇪",
	"keywords": ["yemen", "flag"]
}, {
	"code": "🇾🇹",
	"keywords": ["mayotte", "flag"]
}, {
	"code": "🇿🇦",
	"keywords": ["south_africa", "flag", "south", "south africa"]
}, {
	"code": "🇿🇲",
	"keywords": ["zambia", "flag"]
}, {
	"code": "🇿🇼",
	"keywords": ["zimbabwe", "flag"]
}, {
	"code": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
	"keywords": ["england", "flag"]
}, {
	"code": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
	"keywords": ["scotland", "flag"]
}, {
	"code": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
	"keywords": ["wales", "flag"]
}];

export {skinTones};
export default emojis;
