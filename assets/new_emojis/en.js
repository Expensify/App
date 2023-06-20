const enEmojis = {
    '😀': {
        name: 'grinning',
        keywords: ['smile', 'happy', 'face', 'grin'],
    },
    '😃': {
        name: 'smiley',
        keywords: ['happy', 'joy', 'haha', 'face', 'mouth', 'open', 'smile'],
    },
    '😄': {
        name: 'smile',
        keywords: ['happy', 'joy', 'laugh', 'pleased', 'eye', 'face', 'mouth', 'open'],
    },
    '😁': {
        name: 'grin',
        keywords: ['eye', 'face', 'smile'],
    },
    '😆': {
        name: 'laughing',
        keywords: ['happy', 'haha', 'satisfied', 'face', 'laugh', 'mouth', 'open', 'smile'],
    },
    '😅': {
        name: 'sweat_smile',
        keywords: ['hot', 'cold', 'face', 'open', 'smile', 'sweat'],
    },
    '🤣': {
        name: 'rofl',
        keywords: ['lol', 'laughing', 'face', 'floor', 'laugh', 'rolling'],
    },
    '😂': {
        name: 'joy',
        keywords: ['tears', 'face', 'laugh', 'tear'],
    },
    '🙂': {
        name: 'slightly_smiling_face',
        keywords: ['face', 'smile'],
    },
    '🙃': {
        name: 'upside_down_face',
        keywords: ['face', 'upside-down'],
    },
    '😉': {
        name: 'wink',
        keywords: ['flirt', 'face'],
    },
    '😊': {
        name: 'blush',
        keywords: ['proud', 'eye', 'face', 'smile'],
    },
    '😇': {
        name: 'innocent',
        keywords: ['angel', 'face', 'fairy tale', 'fantasy', 'halo', 'smile'],
    },
    '🥰': {
        name: 'smiling_face_with_three_hearts',
        keywords: ['love'],
    },
    '😍': {
        name: 'heart_eyes',
        keywords: ['love', 'crush', 'eye', 'face', 'heart', 'smile'],
    },
    '🤩': {
        name: 'star_struck',
        keywords: ['eyes'],
    },
    '😘': {
        name: 'kissing_heart',
        keywords: ['flirt', 'face', 'heart', 'kiss'],
    },
    '😗': {
        name: 'kissing',
        keywords: ['face', 'kiss'],
    },
    '☺️': {
        name: 'relaxed',
        keywords: ['blush', 'pleased'],
    },
    '😚': {
        name: 'kissing_closed_eyes',
        keywords: ['closed', 'eye', 'face', 'kiss'],
    },
    '😙': {
        name: 'kissing_smiling_eyes',
        keywords: ['eye', 'face', 'kiss', 'smile'],
    },
    '🥲': {
        name: 'smiling_face_with_tear',
        keywords: [],
    },
    '😋': {
        name: 'yum',
        keywords: ['tongue', 'lick', 'delicious', 'face', 'savouring', 'smile', 'um'],
    },
    '😛': {
        name: 'stuck_out_tongue',
        keywords: ['face', 'tongue'],
    },
    '😜': {
        name: 'stuck_out_tongue_winking_eye',
        keywords: ['prank', 'silly', 'eye', 'face', 'joke', 'tongue', 'wink'],
    },
    '🤪': {
        name: 'zany_face',
        keywords: ['goofy', 'wacky'],
    },
    '😝': {
        name: 'stuck_out_tongue_closed_eyes',
        keywords: ['prank', 'eye', 'face', 'horrible', 'taste', 'tongue'],
    },
    '🤑': {
        name: 'money_mouth_face',
        keywords: ['rich', 'face', 'money', 'mouth'],
    },
    '🤗': {
        name: 'hugs',
        keywords: ['face', 'hug', 'hugging'],
    },
    '🤭': {
        name: 'hand_over_mouth',
        keywords: ['quiet', 'whoops'],
    },
    '🤫': {
        name: 'shushing_face',
        keywords: ['silence', 'quiet'],
    },
    '🤔': {
        name: 'thinking',
        keywords: ['face'],
    },
    '🤐': {
        name: 'zipper_mouth_face',
        keywords: ['silence', 'hush', 'face', 'mouth', 'zipper'],
    },
    '🤨': {
        name: 'raised_eyebrow',
        keywords: ['suspicious'],
    },
    '😐': {
        name: 'neutral_face',
        keywords: ['meh', 'deadpan', 'face', 'neutral'],
    },
    '😑': {
        name: 'expressionless',
        keywords: ['face', 'inexpressive', 'unexpressive'],
    },
    '😶': {
        name: 'no_mouth',
        keywords: ['mute', 'silence', 'face', 'mouth', 'quiet', 'silent'],
    },
    '😶‍🌫️': {
        name: 'face_in_clouds',
        keywords: [],
    },
    '😏': {
        name: 'smirk',
        keywords: ['smug', 'face'],
    },
    '😒': {
        name: 'unamused',
        keywords: ['meh', 'face', 'unhappy'],
    },
    '🙄': {
        name: 'roll_eyes',
        keywords: ['eyes', 'face', 'rolling'],
    },
    '😬': {
        name: 'grimacing',
        keywords: ['face', 'grimace'],
    },
    '😮‍💨': {
        name: 'face_exhaling',
        keywords: [],
    },
    '🤥': {
        name: 'lying_face',
        keywords: ['liar', 'face', 'lie', 'pinocchio'],
    },
    '😌': {
        name: 'relieved',
        keywords: ['whew', 'face'],
    },
    '😔': {
        name: 'pensive',
        keywords: ['dejected', 'face'],
    },
    '😪': {
        name: 'sleepy',
        keywords: ['tired', 'face', 'sleep'],
    },
    '🤤': {
        name: 'drooling_face',
        keywords: ['drooling', 'face'],
    },
    '😴': {
        name: 'sleeping',
        keywords: ['zzz', 'face', 'sleep'],
    },
    '😷': {
        name: 'mask',
        keywords: ['sick', 'ill', 'cold', 'doctor', 'face', 'medicine'],
    },
    '🤒': {
        name: 'face_with_thermometer',
        keywords: ['sick', 'face', 'ill', 'thermometer'],
    },
    '🤕': {
        name: 'face_with_head_bandage',
        keywords: ['hurt', 'bandage', 'face', 'injury'],
    },
    '🤢': {
        name: 'nauseated_face',
        keywords: ['sick', 'barf', 'disgusted', 'face', 'nauseated', 'vomit'],
    },
    '🤮': {
        name: 'vomiting_face',
        keywords: ['barf', 'sick'],
    },
    '🤧': {
        name: 'sneezing_face',
        keywords: ['achoo', 'sick', 'face', 'gesundheit', 'sneeze'],
    },
    '🥵': {
        name: 'hot_face',
        keywords: ['heat', 'sweating'],
    },
    '🥶': {
        name: 'cold_face',
        keywords: ['freezing', 'ice'],
    },
    '🥴': {
        name: 'woozy_face',
        keywords: ['groggy'],
    },
    '😵': {
        name: 'dizzy_face',
        keywords: ['dizzy', 'face'],
    },
    '😵‍💫': {
        name: 'face_with_spiral_eyes',
        keywords: [],
    },
    '🤯': {
        name: 'exploding_head',
        keywords: ['mind', 'blown'],
    },
    '🤠': {
        name: 'cowboy_hat_face',
        keywords: ['cowboy', 'cowgirl', 'face', 'hat'],
    },
    '🥳': {
        name: 'partying_face',
        keywords: ['celebration', 'birthday'],
    },
    '🥸': {
        name: 'disguised_face',
        keywords: [],
    },
    '😎': {
        name: 'sunglasses',
        keywords: ['cool', 'bright', 'eye', 'eyewear', 'face', 'glasses', 'smile', 'sun', 'weather'],
    },
    '🤓': {
        name: 'nerd_face',
        keywords: ['geek', 'glasses', 'face', 'nerd'],
    },
    '🧐': {
        name: 'monocle_face',
        keywords: [],
    },
    '😕': {
        name: 'confused',
        keywords: ['face'],
    },
    '😟': {
        name: 'worried',
        keywords: ['nervous', 'face'],
    },
    '🙁': {
        name: 'slightly_frowning_face',
        keywords: ['face', 'frown'],
    },
    '☹️': {
        name: 'frowning_face',
        keywords: [],
    },
    '😮': {
        name: 'open_mouth',
        keywords: ['surprise', 'impressed', 'wow', 'face', 'mouth', 'open', 'sympathy'],
    },
    '😯': {
        name: 'hushed',
        keywords: ['silence', 'speechless', 'face', 'stunned', 'surprised'],
    },
    '😲': {
        name: 'astonished',
        keywords: ['amazed', 'gasp', 'face', 'shocked', 'totally'],
    },
    '😳': {
        name: 'flushed',
        keywords: ['dazed', 'face'],
    },
    '🥺': {
        name: 'pleading_face',
        keywords: ['puppy', 'eyes'],
    },
    '😦': {
        name: 'frowning',
        keywords: ['face', 'frown', 'mouth', 'open'],
    },
    '😧': {
        name: 'anguished',
        keywords: ['stunned', 'face'],
    },
    '😨': {
        name: 'fearful',
        keywords: ['scared', 'shocked', 'oops', 'face', 'fear'],
    },
    '😰': {
        name: 'cold_sweat',
        keywords: ['nervous', 'blue', 'cold', 'face', 'mouth', 'open', 'rushed', 'sweat'],
    },
    '😥': {
        name: 'disappointed_relieved',
        keywords: ['phew', 'sweat', 'nervous', 'disappointed', 'face', 'relieved', 'whew'],
    },
    '😢': {
        name: 'cry',
        keywords: ['sad', 'tear', 'face'],
    },
    '😭': {
        name: 'sob',
        keywords: ['sad', 'cry', 'bawling', 'face', 'tear'],
    },
    '😱': {
        name: 'scream',
        keywords: ['horror', 'shocked', 'face', 'fear', 'fearful', 'munch', 'scared'],
    },
    '😖': {
        name: 'confounded',
        keywords: ['face'],
    },
    '😣': {
        name: 'persevere',
        keywords: ['struggling', 'face'],
    },
    '😞': {
        name: 'disappointed',
        keywords: ['sad', 'face'],
    },
    '😓': {
        name: 'sweat',
        keywords: ['cold', 'face'],
    },
    '😩': {
        name: 'weary',
        keywords: ['tired', 'face'],
    },
    '😫': {
        name: 'tired_face',
        keywords: ['upset', 'whine', 'face', 'tired'],
    },
    '🥱': {
        name: 'yawning_face',
        keywords: [],
    },
    '😤': {
        name: 'triumph',
        keywords: ['smug', 'face', 'won'],
    },
    '😡': {
        name: 'rage',
        keywords: ['angry', 'pout', 'face', 'mad', 'pouting', 'red'],
    },
    '😠': {
        name: 'angry',
        keywords: ['mad', 'annoyed', 'face'],
    },
    '🤬': {
        name: 'cursing_face',
        keywords: ['foul'],
    },
    '😈': {
        name: 'smiling_imp',
        keywords: ['devil', 'evil', 'horns', 'face', 'fairy tale', 'fantasy', 'smile'],
    },
    '👿': {
        name: 'imp',
        keywords: ['angry', 'devil', 'evil', 'horns', 'demon', 'face', 'fairy tale', 'fantasy'],
    },
    '💀': {
        name: 'skull',
        keywords: ['dead', 'danger', 'poison', 'body', 'death', 'face', 'fairy tale', 'monster'],
    },
    '☠️': {
        name: 'skull_and_crossbones',
        keywords: ['danger', 'pirate', 'body', 'crossbones', 'death', 'face', 'monster', 'skull'],
    },
    '💩': {
        name: 'hankey',
        keywords: ['crap', 'poop', 'shit', 'comic', 'dung', 'face', 'monster', 'poo'],
    },
    '🤡': {
        name: 'clown_face',
        keywords: ['clown', 'face'],
    },
    '👹': {
        name: 'japanese_ogre',
        keywords: ['monster', 'creature', 'face', 'fairy tale', 'fantasy', 'japanese', 'ogre'],
    },
    '👺': {
        name: 'japanese_goblin',
        keywords: ['creature', 'face', 'fairy tale', 'fantasy', 'goblin', 'japanese', 'monster'],
    },
    '👻': {
        name: 'ghost',
        keywords: ['halloween', 'creature', 'face', 'fairy tale', 'fantasy', 'monster'],
    },
    '👽': {
        name: 'alien',
        keywords: ['ufo', 'creature', 'extraterrestrial', 'face', 'fairy tale', 'fantasy', 'monster', 'space'],
    },
    '👾': {
        name: 'space_invader',
        keywords: ['game', 'retro', 'alien', 'creature', 'extraterrestrial', 'face', 'fairy tale', 'fantasy', 'monster', 'space', 'ufo'],
    },
    '🤖': {
        name: 'robot',
        keywords: ['face', 'monster'],
    },
    '😺': {
        name: 'smiley_cat',
        keywords: ['cat', 'face', 'mouth', 'open', 'smile'],
    },
    '😸': {
        name: 'smile_cat',
        keywords: ['cat', 'eye', 'face', 'grin', 'smile'],
    },
    '😹': {
        name: 'joy_cat',
        keywords: ['cat', 'face', 'joy', 'tear'],
    },
    '😻': {
        name: 'heart_eyes_cat',
        keywords: ['cat', 'eye', 'face', 'heart', 'love', 'smile'],
    },
    '😼': {
        name: 'smirk_cat',
        keywords: ['cat', 'face', 'ironic', 'smile', 'wry'],
    },
    '😽': {
        name: 'kissing_cat',
        keywords: ['cat', 'eye', 'face', 'kiss'],
    },
    '🙀': {
        name: 'scream_cat',
        keywords: ['horror', 'cat', 'face', 'oh', 'surprised', 'weary'],
    },
    '😿': {
        name: 'crying_cat_face',
        keywords: ['sad', 'tear', 'cat', 'cry', 'face'],
    },
    '😾': {
        name: 'pouting_cat',
        keywords: ['cat', 'face', 'pouting'],
    },
    '🙈': {
        name: 'see_no_evil',
        keywords: ['monkey', 'blind', 'ignore', 'evil', 'face', 'forbidden', 'gesture', 'no', 'not', 'prohibited', 'see'],
    },
    '🙉': {
        name: 'hear_no_evil',
        keywords: ['monkey', 'deaf', 'evil', 'face', 'forbidden', 'gesture', 'hear', 'no', 'not', 'prohibited'],
    },
    '🙊': {
        name: 'speak_no_evil',
        keywords: ['monkey', 'mute', 'hush', 'evil', 'face', 'forbidden', 'gesture', 'no', 'not', 'prohibited', 'speak'],
    },
    '💋': {
        name: 'kiss',
        keywords: ['lipstick', 'heart', 'lips', 'mark', 'romance'],
    },
    '💌': {
        name: 'love_letter',
        keywords: ['email', 'envelope', 'heart', 'letter', 'love', 'mail', 'romance'],
    },
    '💘': {
        name: 'cupid',
        keywords: ['love', 'heart', 'arrow', 'romance'],
    },
    '💝': {
        name: 'gift_heart',
        keywords: ['chocolates', 'heart', 'ribbon', 'valentine'],
    },
    '💖': {
        name: 'sparkling_heart',
        keywords: ['excited', 'heart', 'sparkle'],
    },
    '💗': {
        name: 'heartpulse',
        keywords: ['excited', 'growing', 'heart', 'nervous'],
    },
    '💓': {
        name: 'heartbeat',
        keywords: ['beating', 'heart', 'pulsating'],
    },
    '💞': {
        name: 'revolving_hearts',
        keywords: ['heart', 'revolving'],
    },
    '💕': {
        name: 'two_hearts',
        keywords: ['heart', 'love'],
    },
    '💟': {
        name: 'heart_decoration',
        keywords: ['heart'],
    },
    '❣️': {
        name: 'heavy_heart_exclamation',
        keywords: ['exclamation', 'heart', 'mark', 'punctuation'],
    },
    '💔': {
        name: 'broken_heart',
        keywords: ['break', 'broken', 'heart'],
    },
    '❤️‍🔥': {
        name: 'heart_on_fire',
        keywords: [],
    },
    '❤️‍🩹': {
        name: 'mending_heart',
        keywords: [],
    },
    '❤️': {
        name: 'heart',
        keywords: ['love'],
    },
    '🧡': {
        name: 'orange_heart',
        keywords: [],
    },
    '💛': {
        name: 'yellow_heart',
        keywords: ['heart', 'yellow'],
    },
    '💚': {
        name: 'green_heart',
        keywords: ['green', 'heart'],
    },
    '💙': {
        name: 'blue_heart',
        keywords: ['blue', 'heart'],
    },
    '💜': {
        name: 'purple_heart',
        keywords: ['heart', 'purple'],
    },
    '🤎': {
        name: 'brown_heart',
        keywords: [],
    },
    '🖤': {
        name: 'black_heart',
        keywords: ['black', 'evil', 'heart', 'wicked'],
    },
    '🤍': {
        name: 'white_heart',
        keywords: [],
    },
    '💯': {
        name: '100',
        keywords: ['score', 'perfect', 'full', 'hundred'],
    },
    '💢': {
        name: 'anger',
        keywords: ['angry', 'comic', 'mad'],
    },
    '💥': {
        name: 'boom',
        keywords: ['explode', 'collision', 'comic'],
    },
    '💫': {
        name: 'dizzy',
        keywords: ['star', 'comic'],
    },
    '💦': {
        name: 'sweat_drops',
        keywords: ['water', 'workout', 'comic', 'splashing', 'sweat'],
    },
    '💨': {
        name: 'dash',
        keywords: ['wind', 'blow', 'fast', 'comic', 'running'],
    },
    '🕳️': {
        name: 'hole',
        keywords: [],
    },
    '💣': {
        name: 'bomb',
        keywords: ['boom', 'comic'],
    },
    '💬': {
        name: 'speech_balloon',
        keywords: ['comment', 'balloon', 'bubble', 'comic', 'dialog', 'speech'],
    },
    '👁️‍🗨️': {
        name: 'eye_speech_bubble',
        keywords: [],
    },
    '🗨️': {
        name: 'left_speech_bubble',
        keywords: [],
    },
    '🗯️': {
        name: 'right_anger_bubble',
        keywords: [],
    },
    '💭': {
        name: 'thought_balloon',
        keywords: ['thinking', 'balloon', 'bubble', 'comic', 'thought'],
    },
    '💤': {
        name: 'zzz',
        keywords: ['sleeping', 'comic', 'sleep'],
    },
    '👋': {
        name: 'wave',
        keywords: ['goodbye', 'body', 'hand', 'waving'],
    },
    '🤚': {
        name: 'raised_back_of_hand',
        keywords: ['backhand', 'raised'],
    },
    '🖐️': {
        name: 'raised_hand_with_fingers_splayed',
        keywords: [],
    },
    '✋': {
        name: 'hand',
        keywords: ['highfive', 'stop', 'raised_hand', 'body'],
    },
    '🖖': {
        name: 'vulcan_salute',
        keywords: ['prosper', 'spock', 'body', 'finger', 'hand', 'vulcan'],
    },
    '👌': {
        name: 'ok_hand',
        keywords: ['body', 'hand', 'ok'],
    },
    '🤌': {
        name: 'pinched_fingers',
        keywords: [],
    },
    '🤏': {
        name: 'pinching_hand',
        keywords: [],
    },
    '✌️': {
        name: 'v',
        keywords: ['victory', 'peace'],
    },
    '🤞': {
        name: 'crossed_fingers',
        keywords: ['luck', 'hopeful', 'cross', 'finger', 'hand'],
    },
    '🤟': {
        name: 'love_you_gesture',
        keywords: [],
    },
    '🤘': {
        name: 'metal',
        keywords: ['body', 'finger', 'hand', 'horns', 'rock-on'],
    },
    '🤙': {
        name: 'call_me_hand',
        keywords: ['call', 'hand', 'shaka'],
    },
    '👈': {
        name: 'point_left',
        keywords: ['backhand', 'body', 'finger', 'hand', 'index', 'point'],
    },
    '👉': {
        name: 'point_right',
        keywords: ['backhand', 'body', 'finger', 'hand', 'index', 'point'],
    },
    '👆': {
        name: 'point_up_2',
        keywords: ['backhand', 'body', 'finger', 'hand', 'index', 'point', 'up'],
    },
    '🖕': {
        name: 'middle_finger',
        keywords: ['fu', 'body', 'finger', 'hand', 'middle finger'],
    },
    '👇': {
        name: 'point_down',
        keywords: ['backhand', 'body', 'down', 'finger', 'hand', 'index', 'point'],
    },
    '☝️': {
        name: 'point_up',
        keywords: [],
    },
    '👍': {
        name: '+1',
        keywords: ['approve', 'ok', 'thumbsup', 'body', 'hand', 'thumb', 'thumbs up', 'up'],
    },
    '👎': {
        name: '-1',
        keywords: ['disapprove', 'bury', 'thumbsdown', 'body', 'down', 'hand', 'thumb', 'thumbs down'],
    },
    '✊': {
        name: 'fist_raised',
        keywords: ['power', 'fist', 'body', 'clenched', 'hand', 'punch'],
    },
    '👊': {
        name: 'fist_oncoming',
        keywords: ['attack', 'facepunch', 'punch', 'body', 'clenched', 'fist', 'hand'],
    },
    '🤛': {
        name: 'fist_left',
        keywords: ['fist', 'leftwards'],
    },
    '🤜': {
        name: 'fist_right',
        keywords: ['fist', 'rightwards'],
    },
    '👏': {
        name: 'clap',
        keywords: ['praise', 'applause', 'body', 'hand'],
    },
    '🙌': {
        name: 'raised_hands',
        keywords: ['hooray', 'body', 'celebration', 'gesture', 'hand', 'raised'],
    },
    '👐': {
        name: 'open_hands',
        keywords: ['body', 'hand', 'open'],
    },
    '🤲': {
        name: 'palms_up_together',
        keywords: [],
    },
    '🤝': {
        name: 'handshake',
        keywords: ['deal', 'agreement', 'hand', 'meeting', 'shake'],
    },
    '🙏': {
        name: 'pray',
        keywords: ['please', 'hope', 'wish', 'ask', 'body', 'bow', 'folded', 'gesture', 'hand', 'thanks'],
    },
    '✍️': {
        name: 'writing_hand',
        keywords: [],
    },
    '💅': {
        name: 'nail_care',
        keywords: ['beauty', 'manicure', 'body', 'care', 'cosmetics', 'nail', 'polish'],
    },
    '🤳': {
        name: 'selfie',
        keywords: ['camera', 'phone'],
    },
    '💪': {
        name: 'muscle',
        keywords: ['flex', 'bicep', 'strong', 'workout', 'biceps', 'body', 'comic'],
    },
    '🦾': {
        name: 'mechanical_arm',
        keywords: [],
    },
    '🦿': {
        name: 'mechanical_leg',
        keywords: [],
    },
    '🦵': {
        name: 'leg',
        keywords: [],
    },
    '🦶': {
        name: 'foot',
        keywords: [],
    },
    '👂': {
        name: 'ear',
        keywords: ['hear', 'sound', 'listen', 'body'],
    },
    '🦻': {
        name: 'ear_with_hearing_aid',
        keywords: [],
    },
    '👃': {
        name: 'nose',
        keywords: ['smell', 'body'],
    },
    '🧠': {
        name: 'brain',
        keywords: [],
    },
    '🫀': {
        name: 'anatomical_heart',
        keywords: [],
    },
    '🫁': {
        name: 'lungs',
        keywords: [],
    },
    '🦷': {
        name: 'tooth',
        keywords: [],
    },
    '🦴': {
        name: 'bone',
        keywords: [],
    },
    '👀': {
        name: 'eyes',
        keywords: ['look', 'see', 'watch', 'body', 'eye', 'face'],
    },
    '👁️': {
        name: 'eye',
        keywords: [],
    },
    '👅': {
        name: 'tongue',
        keywords: ['taste', 'body'],
    },
    '👄': {
        name: 'lips',
        keywords: ['kiss', 'body', 'mouth'],
    },
    '👶': {
        name: 'baby',
        keywords: ['child', 'newborn'],
    },
    '🧒': {
        name: 'child',
        keywords: [],
    },
    '👦': {
        name: 'boy',
        keywords: ['child'],
    },
    '👧': {
        name: 'girl',
        keywords: ['child', 'maiden', 'virgin', 'virgo', 'zodiac'],
    },
    '🧑': {
        name: 'adult',
        keywords: [],
    },
    '👱': {
        name: 'blond_haired_person',
        keywords: ['blond'],
    },
    '👨': {
        name: 'man',
        keywords: ['mustache', 'father', 'dad'],
    },
    '🧔': {
        name: 'bearded_person',
        keywords: [],
    },
    '🧔‍♂️': {
        name: 'man_beard',
        keywords: [],
    },
    '🧔‍♀️': {
        name: 'woman_beard',
        keywords: [],
    },
    '👨‍🦰': {
        name: 'red_haired_man',
        keywords: [],
    },
    '👨‍🦱': {
        name: 'curly_haired_man',
        keywords: [],
    },
    '👨‍🦳': {
        name: 'white_haired_man',
        keywords: [],
    },
    '👨‍🦲': {
        name: 'bald_man',
        keywords: [],
    },
    '👩': {
        name: 'woman',
        keywords: ['girls'],
    },
    '👩‍🦰': {
        name: 'red_haired_woman',
        keywords: [],
    },
    '🧑‍🦰': {
        name: 'person_red_hair',
        keywords: [],
    },
    '👩‍🦱': {
        name: 'curly_haired_woman',
        keywords: [],
    },
    '🧑‍🦱': {
        name: 'person_curly_hair',
        keywords: [],
    },
    '👩‍🦳': {
        name: 'white_haired_woman',
        keywords: [],
    },
    '🧑‍🦳': {
        name: 'person_white_hair',
        keywords: [],
    },
    '👩‍🦲': {
        name: 'bald_woman',
        keywords: [],
    },
    '🧑‍🦲': {
        name: 'person_bald',
        keywords: [],
    },
    '👱‍♀️': {
        name: 'blond_haired_woman',
        keywords: ['blonde_woman'],
    },
    '👱‍♂️': {
        name: 'blond_haired_man',
        keywords: [],
    },
    '🧓': {
        name: 'older_adult',
        keywords: [],
    },
    '👴': {
        name: 'older_man',
        keywords: ['man', 'old'],
    },
    '👵': {
        name: 'older_woman',
        keywords: ['old', 'woman'],
    },
    '🙍': {
        name: 'frowning_person',
        keywords: ['frown', 'gesture'],
    },
    '🙍‍♂️': {
        name: 'frowning_man',
        keywords: [],
    },
    '🙍‍♀️': {
        name: 'frowning_woman',
        keywords: [],
    },
    '🙎': {
        name: 'pouting_face',
        keywords: ['gesture', 'pouting'],
    },
    '🙎‍♂️': {
        name: 'pouting_man',
        keywords: [],
    },
    '🙎‍♀️': {
        name: 'pouting_woman',
        keywords: [],
    },
    '🙅': {
        name: 'no_good',
        keywords: ['stop', 'halt', 'denied', 'forbidden', 'gesture', 'hand', 'no', 'not', 'prohibited'],
    },
    '🙅‍♂️': {
        name: 'no_good_man',
        keywords: ['stop', 'halt', 'denied', 'ng_man'],
    },
    '🙅‍♀️': {
        name: 'no_good_woman',
        keywords: ['stop', 'halt', 'denied', 'ng_woman'],
    },
    '🙆': {
        name: 'ok_person',
        keywords: ['gesture', 'hand', 'ok'],
    },
    '🙆‍♂️': {
        name: 'ok_man',
        keywords: [],
    },
    '🙆‍♀️': {
        name: 'ok_woman',
        keywords: [],
    },
    '💁': {
        name: 'tipping_hand_person',
        keywords: ['information_desk_person', 'hand', 'help', 'information', 'sassy'],
    },
    '💁‍♂️': {
        name: 'tipping_hand_man',
        keywords: ['information', 'sassy_man'],
    },
    '💁‍♀️': {
        name: 'tipping_hand_woman',
        keywords: ['information', 'sassy_woman'],
    },
    '🙋': {
        name: 'raising_hand',
        keywords: ['gesture', 'hand', 'happy', 'raised'],
    },
    '🙋‍♂️': {
        name: 'raising_hand_man',
        keywords: [],
    },
    '🙋‍♀️': {
        name: 'raising_hand_woman',
        keywords: [],
    },
    '🧏': {
        name: 'deaf_person',
        keywords: [],
    },
    '🧏‍♂️': {
        name: 'deaf_man',
        keywords: [],
    },
    '🧏‍♀️': {
        name: 'deaf_woman',
        keywords: [],
    },
    '🙇': {
        name: 'bow',
        keywords: ['respect', 'thanks', 'apology', 'gesture', 'sorry'],
    },
    '🙇‍♂️': {
        name: 'bowing_man',
        keywords: ['respect', 'thanks'],
    },
    '🙇‍♀️': {
        name: 'bowing_woman',
        keywords: ['respect', 'thanks'],
    },
    '🤦': {
        name: 'facepalm',
        keywords: ['disbelief', 'exasperation', 'face', 'palm'],
    },
    '🤦‍♂️': {
        name: 'man_facepalming',
        keywords: [],
    },
    '🤦‍♀️': {
        name: 'woman_facepalming',
        keywords: [],
    },
    '🤷': {
        name: 'shrug',
        keywords: ['doubt', 'ignorance', 'indifference'],
    },
    '🤷‍♂️': {
        name: 'man_shrugging',
        keywords: [],
    },
    '🤷‍♀️': {
        name: 'woman_shrugging',
        keywords: [],
    },
    '🧑‍⚕️': {
        name: 'health_worker',
        keywords: [],
    },
    '👨‍⚕️': {
        name: 'man_health_worker',
        keywords: ['doctor', 'nurse'],
    },
    '👩‍⚕️': {
        name: 'woman_health_worker',
        keywords: ['doctor', 'nurse'],
    },
    '🧑‍🎓': {
        name: 'student',
        keywords: [],
    },
    '👨‍🎓': {
        name: 'man_student',
        keywords: ['graduation'],
    },
    '👩‍🎓': {
        name: 'woman_student',
        keywords: ['graduation'],
    },
    '🧑‍🏫': {
        name: 'teacher',
        keywords: [],
    },
    '👨‍🏫': {
        name: 'man_teacher',
        keywords: ['school', 'professor'],
    },
    '👩‍🏫': {
        name: 'woman_teacher',
        keywords: ['school', 'professor'],
    },
    '🧑‍⚖️': {
        name: 'judge',
        keywords: [],
    },
    '👨‍⚖️': {
        name: 'man_judge',
        keywords: ['justice'],
    },
    '👩‍⚖️': {
        name: 'woman_judge',
        keywords: ['justice'],
    },
    '🧑‍🌾': {
        name: 'farmer',
        keywords: [],
    },
    '👨‍🌾': {
        name: 'man_farmer',
        keywords: [],
    },
    '👩‍🌾': {
        name: 'woman_farmer',
        keywords: [],
    },
    '🧑‍🍳': {
        name: 'cook',
        keywords: [],
    },
    '👨‍🍳': {
        name: 'man_cook',
        keywords: ['chef'],
    },
    '👩‍🍳': {
        name: 'woman_cook',
        keywords: ['chef'],
    },
    '🧑‍🔧': {
        name: 'mechanic',
        keywords: [],
    },
    '👨‍🔧': {
        name: 'man_mechanic',
        keywords: [],
    },
    '👩‍🔧': {
        name: 'woman_mechanic',
        keywords: [],
    },
    '🧑‍🏭': {
        name: 'factory_worker',
        keywords: [],
    },
    '👨‍🏭': {
        name: 'man_factory_worker',
        keywords: [],
    },
    '👩‍🏭': {
        name: 'woman_factory_worker',
        keywords: [],
    },
    '🧑‍💼': {
        name: 'office_worker',
        keywords: [],
    },
    '👨‍💼': {
        name: 'man_office_worker',
        keywords: ['business'],
    },
    '👩‍💼': {
        name: 'woman_office_worker',
        keywords: ['business'],
    },
    '🧑‍🔬': {
        name: 'scientist',
        keywords: [],
    },
    '👨‍🔬': {
        name: 'man_scientist',
        keywords: ['research'],
    },
    '👩‍🔬': {
        name: 'woman_scientist',
        keywords: ['research'],
    },
    '🧑‍💻': {
        name: 'technologist',
        keywords: [],
    },
    '👨‍💻': {
        name: 'man_technologist',
        keywords: ['coder'],
    },
    '👩‍💻': {
        name: 'woman_technologist',
        keywords: ['coder'],
    },
    '🧑‍🎤': {
        name: 'singer',
        keywords: [],
    },
    '👨‍🎤': {
        name: 'man_singer',
        keywords: ['rockstar'],
    },
    '👩‍🎤': {
        name: 'woman_singer',
        keywords: ['rockstar'],
    },
    '🧑‍🎨': {
        name: 'artist',
        keywords: [],
    },
    '👨‍🎨': {
        name: 'man_artist',
        keywords: ['painter'],
    },
    '👩‍🎨': {
        name: 'woman_artist',
        keywords: ['painter'],
    },
    '🧑‍✈️': {
        name: 'pilot',
        keywords: [],
    },
    '👨‍✈️': {
        name: 'man_pilot',
        keywords: [],
    },
    '👩‍✈️': {
        name: 'woman_pilot',
        keywords: [],
    },
    '🧑‍🚀': {
        name: 'astronaut',
        keywords: [],
    },
    '👨‍🚀': {
        name: 'man_astronaut',
        keywords: ['space'],
    },
    '👩‍🚀': {
        name: 'woman_astronaut',
        keywords: ['space'],
    },
    '🧑‍🚒': {
        name: 'firefighter',
        keywords: [],
    },
    '👨‍🚒': {
        name: 'man_firefighter',
        keywords: [],
    },
    '👩‍🚒': {
        name: 'woman_firefighter',
        keywords: [],
    },
    '👮': {
        name: 'police_officer',
        keywords: ['law', 'cop', 'officer', 'police'],
    },
    '👮‍♂️': {
        name: 'policeman',
        keywords: ['law', 'cop'],
    },
    '👮‍♀️': {
        name: 'policewoman',
        keywords: ['law', 'cop'],
    },
    '🕵️': {
        name: 'detective',
        keywords: ['sleuth'],
    },
    '🕵️‍♂️': {
        name: 'male_detective',
        keywords: ['sleuth'],
    },
    '🕵️‍♀️': {
        name: 'female_detective',
        keywords: ['sleuth'],
    },
    '💂': {
        name: 'guard',
        keywords: ['guardsman'],
    },
    '💂‍♂️': {
        name: 'guardsman',
        keywords: [],
    },
    '💂‍♀️': {
        name: 'guardswoman',
        keywords: [],
    },
    '🥷': {
        name: 'ninja',
        keywords: [],
    },
    '👷': {
        name: 'construction_worker',
        keywords: ['helmet', 'construction', 'hat', 'worker'],
    },
    '👷‍♂️': {
        name: 'construction_worker_man',
        keywords: ['helmet'],
    },
    '👷‍♀️': {
        name: 'construction_worker_woman',
        keywords: ['helmet'],
    },
    '🤴': {
        name: 'prince',
        keywords: ['crown', 'royal'],
    },
    '👸': {
        name: 'princess',
        keywords: ['crown', 'royal', 'fairy tale', 'fantasy'],
    },
    '👳': {
        name: 'person_with_turban',
        keywords: ['man', 'turban'],
    },
    '👳‍♂️': {
        name: 'man_with_turban',
        keywords: [],
    },
    '👳‍♀️': {
        name: 'woman_with_turban',
        keywords: [],
    },
    '👲': {
        name: 'man_with_gua_pi_mao',
        keywords: ['gua pi mao', 'hat', 'man'],
    },
    '🧕': {
        name: 'woman_with_headscarf',
        keywords: ['hijab'],
    },
    '🤵': {
        name: 'person_in_tuxedo',
        keywords: ['groom', 'marriage', 'wedding', 'man', 'tuxedo'],
    },
    '🤵‍♂️': {
        name: 'man_in_tuxedo',
        keywords: [],
    },
    '🤵‍♀️': {
        name: 'woman_in_tuxedo',
        keywords: [],
    },
    '👰': {
        name: 'person_with_veil',
        keywords: ['marriage', 'wedding', 'bride', 'veil'],
    },
    '👰‍♂️': {
        name: 'man_with_veil',
        keywords: [],
    },
    '👰‍♀️': {
        name: 'woman_with_veil',
        keywords: ['bride_with_veil'],
    },
    '🤰': {
        name: 'pregnant_woman',
        keywords: ['pregnant', 'woman'],
    },
    '🤱': {
        name: 'breast_feeding',
        keywords: ['nursing'],
    },
    '👩‍🍼': {
        name: 'woman_feeding_baby',
        keywords: [],
    },
    '👨‍🍼': {
        name: 'man_feeding_baby',
        keywords: [],
    },
    '🧑‍🍼': {
        name: 'person_feeding_baby',
        keywords: [],
    },
    '👼': {
        name: 'angel',
        keywords: ['baby', 'face', 'fairy tale', 'fantasy'],
    },
    '🎅': {
        name: 'santa',
        keywords: ['christmas', 'activity', 'celebration', 'fairy tale', 'fantasy', 'father'],
    },
    '🤶': {
        name: 'mrs_claus',
        keywords: ['santa', 'christmas', 'mother', 'mrs. claus'],
    },
    '🧑‍🎄': {
        name: 'mx_claus',
        keywords: [],
    },
    '🦸': {
        name: 'superhero',
        keywords: [],
    },
    '🦸‍♂️': {
        name: 'superhero_man',
        keywords: [],
    },
    '🦸‍♀️': {
        name: 'superhero_woman',
        keywords: [],
    },
    '🦹': {
        name: 'supervillain',
        keywords: [],
    },
    '🦹‍♂️': {
        name: 'supervillain_man',
        keywords: [],
    },
    '🦹‍♀️': {
        name: 'supervillain_woman',
        keywords: [],
    },
    '🧙': {
        name: 'mage',
        keywords: ['wizard'],
    },
    '🧙‍♂️': {
        name: 'mage_man',
        keywords: ['wizard'],
    },
    '🧙‍♀️': {
        name: 'mage_woman',
        keywords: ['wizard'],
    },
    '🧚': {
        name: 'fairy',
        keywords: [],
    },
    '🧚‍♂️': {
        name: 'fairy_man',
        keywords: [],
    },
    '🧚‍♀️': {
        name: 'fairy_woman',
        keywords: [],
    },
    '🧛': {
        name: 'vampire',
        keywords: [],
    },
    '🧛‍♂️': {
        name: 'vampire_man',
        keywords: [],
    },
    '🧛‍♀️': {
        name: 'vampire_woman',
        keywords: [],
    },
    '🧜': {
        name: 'merperson',
        keywords: [],
    },
    '🧜‍♂️': {
        name: 'merman',
        keywords: [],
    },
    '🧜‍♀️': {
        name: 'mermaid',
        keywords: [],
    },
    '🧝': {
        name: 'elf',
        keywords: [],
    },
    '🧝‍♂️': {
        name: 'elf_man',
        keywords: [],
    },
    '🧝‍♀️': {
        name: 'elf_woman',
        keywords: [],
    },
    '🧞': {
        name: 'genie',
        keywords: [],
    },
    '🧞‍♂️': {
        name: 'genie_man',
        keywords: [],
    },
    '🧞‍♀️': {
        name: 'genie_woman',
        keywords: [],
    },
    '🧟': {
        name: 'zombie',
        keywords: [],
    },
    '🧟‍♂️': {
        name: 'zombie_man',
        keywords: [],
    },
    '🧟‍♀️': {
        name: 'zombie_woman',
        keywords: [],
    },
    '💆': {
        name: 'massage',
        keywords: ['spa', 'salon'],
    },
    '💆‍♂️': {
        name: 'massage_man',
        keywords: ['spa'],
    },
    '💆‍♀️': {
        name: 'massage_woman',
        keywords: ['spa'],
    },
    '💇': {
        name: 'haircut',
        keywords: ['beauty', 'barber', 'parlor'],
    },
    '💇‍♂️': {
        name: 'haircut_man',
        keywords: [],
    },
    '💇‍♀️': {
        name: 'haircut_woman',
        keywords: [],
    },
    '🚶': {
        name: 'walking',
        keywords: ['hike', 'pedestrian', 'walk'],
    },
    '🚶‍♂️': {
        name: 'walking_man',
        keywords: [],
    },
    '🚶‍♀️': {
        name: 'walking_woman',
        keywords: [],
    },
    '🧍': {
        name: 'standing_person',
        keywords: [],
    },
    '🧍‍♂️': {
        name: 'standing_man',
        keywords: [],
    },
    '🧍‍♀️': {
        name: 'standing_woman',
        keywords: [],
    },
    '🧎': {
        name: 'kneeling_person',
        keywords: [],
    },
    '🧎‍♂️': {
        name: 'kneeling_man',
        keywords: [],
    },
    '🧎‍♀️': {
        name: 'kneeling_woman',
        keywords: [],
    },
    '🧑‍🦯': {
        name: 'person_with_probing_cane',
        keywords: [],
    },
    '👨‍🦯': {
        name: 'man_with_probing_cane',
        keywords: [],
    },
    '👩‍🦯': {
        name: 'woman_with_probing_cane',
        keywords: [],
    },
    '🧑‍🦼': {
        name: 'person_in_motorized_wheelchair',
        keywords: [],
    },
    '👨‍🦼': {
        name: 'man_in_motorized_wheelchair',
        keywords: [],
    },
    '👩‍🦼': {
        name: 'woman_in_motorized_wheelchair',
        keywords: [],
    },
    '🧑‍🦽': {
        name: 'person_in_manual_wheelchair',
        keywords: [],
    },
    '👨‍🦽': {
        name: 'man_in_manual_wheelchair',
        keywords: [],
    },
    '👩‍🦽': {
        name: 'woman_in_manual_wheelchair',
        keywords: [],
    },
    '🏃': {
        name: 'runner',
        keywords: ['exercise', 'workout', 'marathon', 'running'],
    },
    '🏃‍♂️': {
        name: 'running_man',
        keywords: ['exercise', 'workout', 'marathon'],
    },
    '🏃‍♀️': {
        name: 'running_woman',
        keywords: ['exercise', 'workout', 'marathon'],
    },
    '💃': {
        name: 'woman_dancing',
        keywords: ['dress', 'dancer'],
    },
    '🕺': {
        name: 'man_dancing',
        keywords: ['dancer', 'dance', 'man'],
    },
    '🕴️': {
        name: 'business_suit_levitating',
        keywords: [],
    },
    '👯': {
        name: 'dancers',
        keywords: ['bunny', 'dancer', 'ear', 'girl', 'woman'],
    },
    '👯‍♂️': {
        name: 'dancing_men',
        keywords: ['bunny'],
    },
    '👯‍♀️': {
        name: 'dancing_women',
        keywords: ['bunny'],
    },
    '🧖': {
        name: 'sauna_person',
        keywords: ['steamy'],
    },
    '🧖‍♂️': {
        name: 'sauna_man',
        keywords: ['steamy'],
    },
    '🧖‍♀️': {
        name: 'sauna_woman',
        keywords: ['steamy'],
    },
    '🧗': {
        name: 'climbing',
        keywords: ['bouldering'],
    },
    '🧗‍♂️': {
        name: 'climbing_man',
        keywords: ['bouldering'],
    },
    '🧗‍♀️': {
        name: 'climbing_woman',
        keywords: ['bouldering'],
    },
    '🤺': {
        name: 'person_fencing',
        keywords: ['fencer', 'fencing', 'sword'],
    },
    '🏇': {
        name: 'horse_racing',
        keywords: ['horse', 'jockey', 'racehorse', 'racing'],
    },
    '⛷️': {
        name: 'skier',
        keywords: [],
    },
    '🏂': {
        name: 'snowboarder',
        keywords: ['ski', 'snow', 'snowboard'],
    },
    '🏌️': {
        name: 'golfing',
        keywords: [],
    },
    '🏌️‍♂️': {
        name: 'golfing_man',
        keywords: [],
    },
    '🏌️‍♀️': {
        name: 'golfing_woman',
        keywords: [],
    },
    '🏄': {
        name: 'surfer',
        keywords: ['surfing'],
    },
    '🏄‍♂️': {
        name: 'surfing_man',
        keywords: [],
    },
    '🏄‍♀️': {
        name: 'surfing_woman',
        keywords: [],
    },
    '🚣': {
        name: 'rowboat',
        keywords: ['boat', 'vehicle'],
    },
    '🚣‍♂️': {
        name: 'rowing_man',
        keywords: [],
    },
    '🚣‍♀️': {
        name: 'rowing_woman',
        keywords: [],
    },
    '🏊': {
        name: 'swimmer',
        keywords: ['swim'],
    },
    '🏊‍♂️': {
        name: 'swimming_man',
        keywords: [],
    },
    '🏊‍♀️': {
        name: 'swimming_woman',
        keywords: [],
    },
    '⛹️': {
        name: 'bouncing_ball_person',
        keywords: ['basketball'],
    },
    '⛹️‍♂️': {
        name: 'bouncing_ball_man',
        keywords: ['basketball_man'],
    },
    '⛹️‍♀️': {
        name: 'bouncing_ball_woman',
        keywords: ['basketball_woman'],
    },
    '🏋️': {
        name: 'weight_lifting',
        keywords: ['gym', 'workout'],
    },
    '🏋️‍♂️': {
        name: 'weight_lifting_man',
        keywords: ['gym', 'workout'],
    },
    '🏋️‍♀️': {
        name: 'weight_lifting_woman',
        keywords: ['gym', 'workout'],
    },
    '🚴': {
        name: 'bicyclist',
        keywords: ['bicycle', 'bike', 'cyclist'],
    },
    '🚴‍♂️': {
        name: 'biking_man',
        keywords: [],
    },
    '🚴‍♀️': {
        name: 'biking_woman',
        keywords: [],
    },
    '🚵': {
        name: 'mountain_bicyclist',
        keywords: ['bicycle', 'bicyclist', 'bike', 'cyclist', 'mountain'],
    },
    '🚵‍♂️': {
        name: 'mountain_biking_man',
        keywords: [],
    },
    '🚵‍♀️': {
        name: 'mountain_biking_woman',
        keywords: [],
    },
    '🤸': {
        name: 'cartwheeling',
        keywords: ['cartwheel', 'gymnastics'],
    },
    '🤸‍♂️': {
        name: 'man_cartwheeling',
        keywords: [],
    },
    '🤸‍♀️': {
        name: 'woman_cartwheeling',
        keywords: [],
    },
    '🤼': {
        name: 'wrestling',
        keywords: ['wrestle', 'wrestler'],
    },
    '🤼‍♂️': {
        name: 'men_wrestling',
        keywords: [],
    },
    '🤼‍♀️': {
        name: 'women_wrestling',
        keywords: [],
    },
    '🤽': {
        name: 'water_polo',
        keywords: ['polo', 'water'],
    },
    '🤽‍♂️': {
        name: 'man_playing_water_polo',
        keywords: [],
    },
    '🤽‍♀️': {
        name: 'woman_playing_water_polo',
        keywords: [],
    },
    '🤾': {
        name: 'handball_person',
        keywords: ['ball', 'handball'],
    },
    '🤾‍♂️': {
        name: 'man_playing_handball',
        keywords: [],
    },
    '🤾‍♀️': {
        name: 'woman_playing_handball',
        keywords: [],
    },
    '🤹': {
        name: 'juggling_person',
        keywords: ['balance', 'juggle', 'multitask', 'skill'],
    },
    '🤹‍♂️': {
        name: 'man_juggling',
        keywords: [],
    },
    '🤹‍♀️': {
        name: 'woman_juggling',
        keywords: [],
    },
    '🧘': {
        name: 'lotus_position',
        keywords: ['meditation'],
    },
    '🧘‍♂️': {
        name: 'lotus_position_man',
        keywords: ['meditation'],
    },
    '🧘‍♀️': {
        name: 'lotus_position_woman',
        keywords: ['meditation'],
    },
    '🛀': {
        name: 'bath',
        keywords: ['shower', 'bathtub'],
    },
    '🛌': {
        name: 'sleeping_bed',
        keywords: ['hotel', 'sleep'],
    },
    '🧑‍🤝‍🧑': {
        name: 'people_holding_hands',
        keywords: ['couple', 'date'],
    },
    '👭': {
        name: 'two_women_holding_hands',
        keywords: ['couple', 'date', 'hand', 'hold', 'woman'],
    },
    '👫': {
        name: 'couple',
        keywords: ['date', 'hand', 'hold', 'man', 'woman'],
    },
    '👬': {
        name: 'two_men_holding_hands',
        keywords: ['couple', 'date', 'gemini', 'hand', 'hold', 'man', 'twins', 'zodiac'],
    },
    '💏': {
        name: 'couplekiss',
        keywords: ['couple', 'kiss', 'romance'],
    },
    '👩‍❤️‍💋‍👨': {
        name: 'couplekiss_man_woman',
        keywords: [],
    },
    '👨‍❤️‍💋‍👨': {
        name: 'couplekiss_man_man',
        keywords: [],
    },
    '👩‍❤️‍💋‍👩': {
        name: 'couplekiss_woman_woman',
        keywords: [],
    },
    '💑': {
        name: 'couple_with_heart',
        keywords: ['couple', 'heart', 'love', 'romance'],
    },
    '👩‍❤️‍👨': {
        name: 'couple_with_heart_woman_man',
        keywords: [],
    },
    '👨‍❤️‍👨': {
        name: 'couple_with_heart_man_man',
        keywords: [],
    },
    '👩‍❤️‍👩': {
        name: 'couple_with_heart_woman_woman',
        keywords: [],
    },
    '👪': {
        name: 'family',
        keywords: ['home', 'parents', 'child', 'father', 'mother'],
    },
    '👨‍👩‍👦': {
        name: 'family_man_woman_boy',
        keywords: ['boy', 'family', 'man', 'woman'],
    },
    '👨‍👩‍👧': {
        name: 'family_man_woman_girl',
        keywords: ['family', 'girl', 'man', 'woman'],
    },
    '👨‍👩‍👧‍👦': {
        name: 'family_man_woman_girl_boy',
        keywords: ['boy', 'family', 'girl', 'man', 'woman'],
    },
    '👨‍👩‍👦‍👦': {
        name: 'family_man_woman_boy_boy',
        keywords: ['boy', 'family', 'man', 'woman'],
    },
    '👨‍👩‍👧‍👧': {
        name: 'family_man_woman_girl_girl',
        keywords: ['family', 'girl', 'man', 'woman'],
    },
    '👨‍👨‍👦': {
        name: 'family_man_man_boy',
        keywords: ['boy', 'family', 'man'],
    },
    '👨‍👨‍👧': {
        name: 'family_man_man_girl',
        keywords: ['family', 'girl', 'man'],
    },
    '👨‍👨‍👧‍👦': {
        name: 'family_man_man_girl_boy',
        keywords: ['boy', 'family', 'girl', 'man'],
    },
    '👨‍👨‍👦‍👦': {
        name: 'family_man_man_boy_boy',
        keywords: ['boy', 'family', 'man'],
    },
    '👨‍👨‍👧‍👧': {
        name: 'family_man_man_girl_girl',
        keywords: ['family', 'girl', 'man'],
    },
    '👩‍👩‍👦': {
        name: 'family_woman_woman_boy',
        keywords: ['boy', 'family', 'woman'],
    },
    '👩‍👩‍👧': {
        name: 'family_woman_woman_girl',
        keywords: ['family', 'girl', 'woman'],
    },
    '👩‍👩‍👧‍👦': {
        name: 'family_woman_woman_girl_boy',
        keywords: ['boy', 'family', 'girl', 'woman'],
    },
    '👩‍👩‍👦‍👦': {
        name: 'family_woman_woman_boy_boy',
        keywords: ['boy', 'family', 'woman'],
    },
    '👩‍👩‍👧‍👧': {
        name: 'family_woman_woman_girl_girl',
        keywords: ['family', 'girl', 'woman'],
    },
    '👨‍👦': {
        name: 'family_man_boy',
        keywords: [],
    },
    '👨‍👦‍👦': {
        name: 'family_man_boy_boy',
        keywords: [],
    },
    '👨‍👧': {
        name: 'family_man_girl',
        keywords: [],
    },
    '👨‍👧‍👦': {
        name: 'family_man_girl_boy',
        keywords: [],
    },
    '👨‍👧‍👧': {
        name: 'family_man_girl_girl',
        keywords: [],
    },
    '👩‍👦': {
        name: 'family_woman_boy',
        keywords: [],
    },
    '👩‍👦‍👦': {
        name: 'family_woman_boy_boy',
        keywords: [],
    },
    '👩‍👧': {
        name: 'family_woman_girl',
        keywords: [],
    },
    '👩‍👧‍👦': {
        name: 'family_woman_girl_boy',
        keywords: [],
    },
    '👩‍👧‍👧': {
        name: 'family_woman_girl_girl',
        keywords: [],
    },
    '🗣️': {
        name: 'speaking_head',
        keywords: [],
    },
    '👤': {
        name: 'bust_in_silhouette',
        keywords: ['user', 'bust', 'silhouette'],
    },
    '👥': {
        name: 'busts_in_silhouette',
        keywords: ['users', 'group', 'team', 'bust', 'silhouette'],
    },
    '🫂': {
        name: 'people_hugging',
        keywords: [],
    },
    '👣': {
        name: 'footprints',
        keywords: ['feet', 'tracks', 'body', 'clothing', 'footprint', 'print'],
    },
    '🐵': {
        name: 'monkey_face',
        keywords: ['face', 'monkey'],
    },
    '🐒': {
        name: 'monkey',
        keywords: [],
    },
    '🦍': {
        name: 'gorilla',
        keywords: [],
    },
    '🦧': {
        name: 'orangutan',
        keywords: [],
    },
    '🐶': {
        name: 'dog',
        keywords: ['pet', 'face'],
    },
    '🐕': {
        name: 'dog2',
        keywords: ['dog', 'pet'],
    },
    '🦮': {
        name: 'guide_dog',
        keywords: [],
    },
    '🐕‍🦺': {
        name: 'service_dog',
        keywords: [],
    },
    '🐩': {
        name: 'poodle',
        keywords: ['dog'],
    },
    '🐺': {
        name: 'wolf',
        keywords: ['face'],
    },
    '🦊': {
        name: 'fox_face',
        keywords: ['face', 'fox'],
    },
    '🦝': {
        name: 'raccoon',
        keywords: [],
    },
    '🐱': {
        name: 'cat',
        keywords: ['pet', 'face'],
    },
    '🐈': {
        name: 'cat2',
        keywords: ['cat', 'pet'],
    },
    '🐈‍⬛': {
        name: 'black_cat',
        keywords: [],
    },
    '🦁': {
        name: 'lion',
        keywords: ['face', 'leo', 'zodiac'],
    },
    '🐯': {
        name: 'tiger',
        keywords: ['face'],
    },
    '🐅': {
        name: 'tiger2',
        keywords: ['tiger'],
    },
    '🐆': {
        name: 'leopard',
        keywords: [],
    },
    '🐴': {
        name: 'horse',
        keywords: ['face'],
    },
    '🐎': {
        name: 'racehorse',
        keywords: ['speed', 'horse', 'racing'],
    },
    '🦄': {
        name: 'unicorn',
        keywords: ['face'],
    },
    '🦓': {
        name: 'zebra',
        keywords: [],
    },
    '🦌': {
        name: 'deer',
        keywords: [],
    },
    '🦬': {
        name: 'bison',
        keywords: [],
    },
    '🐮': {
        name: 'cow',
        keywords: ['face'],
    },
    '🐂': {
        name: 'ox',
        keywords: ['bull', 'taurus', 'zodiac'],
    },
    '🐃': {
        name: 'water_buffalo',
        keywords: ['buffalo', 'water'],
    },
    '🐄': {
        name: 'cow2',
        keywords: ['cow'],
    },
    '🐷': {
        name: 'pig',
        keywords: ['face'],
    },
    '🐖': {
        name: 'pig2',
        keywords: ['pig', 'sow'],
    },
    '🐗': {
        name: 'boar',
        keywords: ['pig'],
    },
    '🐽': {
        name: 'pig_nose',
        keywords: ['face', 'nose', 'pig'],
    },
    '🐏': {
        name: 'ram',
        keywords: ['aries', 'sheep', 'zodiac'],
    },
    '🐑': {
        name: 'sheep',
        keywords: ['ewe'],
    },
    '🐐': {
        name: 'goat',
        keywords: ['capricorn', 'zodiac'],
    },
    '🐪': {
        name: 'dromedary_camel',
        keywords: ['desert', 'camel', 'dromedary', 'hump'],
    },
    '🐫': {
        name: 'camel',
        keywords: ['bactrian', 'hump'],
    },
    '🦙': {
        name: 'llama',
        keywords: [],
    },
    '🦒': {
        name: 'giraffe',
        keywords: [],
    },
    '🐘': {
        name: 'elephant',
        keywords: [],
    },
    '🦣': {
        name: 'mammoth',
        keywords: [],
    },
    '🦏': {
        name: 'rhinoceros',
        keywords: [],
    },
    '🦛': {
        name: 'hippopotamus',
        keywords: [],
    },
    '🐭': {
        name: 'mouse',
        keywords: ['face'],
    },
    '🐁': {
        name: 'mouse2',
        keywords: ['mouse'],
    },
    '🐀': {
        name: 'rat',
        keywords: [],
    },
    '🐹': {
        name: 'hamster',
        keywords: ['pet', 'face'],
    },
    '🐰': {
        name: 'rabbit',
        keywords: ['bunny', 'face', 'pet'],
    },
    '🐇': {
        name: 'rabbit2',
        keywords: ['bunny', 'pet', 'rabbit'],
    },
    '🐿️': {
        name: 'chipmunk',
        keywords: [],
    },
    '🦫': {
        name: 'beaver',
        keywords: [],
    },
    '🦔': {
        name: 'hedgehog',
        keywords: [],
    },
    '🦇': {
        name: 'bat',
        keywords: ['vampire'],
    },
    '🐻': {
        name: 'bear',
        keywords: ['face'],
    },
    '🐻‍❄️': {
        name: 'polar_bear',
        keywords: [],
    },
    '🐨': {
        name: 'koala',
        keywords: ['bear'],
    },
    '🐼': {
        name: 'panda_face',
        keywords: ['face', 'panda'],
    },
    '🦥': {
        name: 'sloth',
        keywords: [],
    },
    '🦦': {
        name: 'otter',
        keywords: [],
    },
    '🦨': {
        name: 'skunk',
        keywords: [],
    },
    '🦘': {
        name: 'kangaroo',
        keywords: [],
    },
    '🦡': {
        name: 'badger',
        keywords: [],
    },
    '🐾': {
        name: 'feet',
        keywords: ['paw_prints', 'paw', 'print'],
    },
    '🦃': {
        name: 'turkey',
        keywords: ['thanksgiving'],
    },
    '🐔': {
        name: 'chicken',
        keywords: [],
    },
    '🐓': {
        name: 'rooster',
        keywords: [],
    },
    '🐣': {
        name: 'hatching_chick',
        keywords: ['baby', 'chick', 'hatching'],
    },
    '🐤': {
        name: 'baby_chick',
        keywords: ['baby', 'chick'],
    },
    '🐥': {
        name: 'hatched_chick',
        keywords: ['baby', 'chick'],
    },
    '🐦': {
        name: 'bird',
        keywords: [],
    },
    '🐧': {
        name: 'penguin',
        keywords: [],
    },
    '🕊️': {
        name: 'dove',
        keywords: ['peace'],
    },
    '🦅': {
        name: 'eagle',
        keywords: ['bird'],
    },
    '🦆': {
        name: 'duck',
        keywords: ['bird'],
    },
    '🦢': {
        name: 'swan',
        keywords: [],
    },
    '🦉': {
        name: 'owl',
        keywords: ['bird', 'wise'],
    },
    '🦤': {
        name: 'dodo',
        keywords: [],
    },
    '🪶': {
        name: 'feather',
        keywords: [],
    },
    '🦩': {
        name: 'flamingo',
        keywords: [],
    },
    '🦚': {
        name: 'peacock',
        keywords: [],
    },
    '🦜': {
        name: 'parrot',
        keywords: [],
    },
    '🐸': {
        name: 'frog',
        keywords: ['face'],
    },
    '🐊': {
        name: 'crocodile',
        keywords: [],
    },
    '🐢': {
        name: 'turtle',
        keywords: ['slow'],
    },
    '🦎': {
        name: 'lizard',
        keywords: ['reptile'],
    },
    '🐍': {
        name: 'snake',
        keywords: ['bearer', 'ophiuchus', 'serpent', 'zodiac'],
    },
    '🐲': {
        name: 'dragon_face',
        keywords: ['dragon', 'face', 'fairy tale'],
    },
    '🐉': {
        name: 'dragon',
        keywords: ['fairy tale'],
    },
    '🦕': {
        name: 'sauropod',
        keywords: ['dinosaur'],
    },
    '🦖': {
        name: 't-rex',
        keywords: ['dinosaur'],
    },
    '🐳': {
        name: 'whale',
        keywords: ['sea', 'face', 'spouting'],
    },
    '🐋': {
        name: 'whale2',
        keywords: ['whale'],
    },
    '🐬': {
        name: 'dolphin',
        keywords: ['flipper'],
    },
    '🦭': {
        name: 'seal',
        keywords: [],
    },
    '🐟': {
        name: 'fish',
        keywords: ['pisces', 'zodiac'],
    },
    '🐠': {
        name: 'tropical_fish',
        keywords: ['fish', 'tropical'],
    },
    '🐡': {
        name: 'blowfish',
        keywords: ['fish'],
    },
    '🦈': {
        name: 'shark',
        keywords: ['fish'],
    },
    '🐙': {
        name: 'octopus',
        keywords: [],
    },
    '🐚': {
        name: 'shell',
        keywords: ['sea', 'beach', 'spiral'],
    },
    '🐌': {
        name: 'snail',
        keywords: ['slow'],
    },
    '🦋': {
        name: 'butterfly',
        keywords: ['insect', 'pretty'],
    },
    '🐛': {
        name: 'bug',
        keywords: ['insect'],
    },
    '🐜': {
        name: 'ant',
        keywords: ['insect'],
    },
    '🐝': {
        name: 'bee',
        keywords: ['honeybee', 'insect'],
    },
    '🪲': {
        name: 'beetle',
        keywords: [],
    },
    '🐞': {
        name: 'lady_beetle',
        keywords: ['bug', 'beetle', 'insect', 'lady beetle', 'ladybird', 'ladybug'],
    },
    '🦗': {
        name: 'cricket',
        keywords: [],
    },
    '🪳': {
        name: 'cockroach',
        keywords: [],
    },
    '🕷️': {
        name: 'spider',
        keywords: [],
    },
    '🕸️': {
        name: 'spider_web',
        keywords: [],
    },
    '🦂': {
        name: 'scorpion',
        keywords: ['scorpio', 'scorpius', 'zodiac'],
    },
    '🦟': {
        name: 'mosquito',
        keywords: [],
    },
    '🪰': {
        name: 'fly',
        keywords: [],
    },
    '🪱': {
        name: 'worm',
        keywords: [],
    },
    '🦠': {
        name: 'microbe',
        keywords: ['germ'],
    },
    '💐': {
        name: 'bouquet',
        keywords: ['flowers', 'flower', 'plant', 'romance'],
    },
    '🌸': {
        name: 'cherry_blossom',
        keywords: ['flower', 'spring', 'blossom', 'cherry', 'plant'],
    },
    '💮': {
        name: 'white_flower',
        keywords: ['flower'],
    },
    '🏵️': {
        name: 'rosette',
        keywords: [],
    },
    '🌹': {
        name: 'rose',
        keywords: ['flower', 'plant'],
    },
    '🥀': {
        name: 'wilted_flower',
        keywords: ['flower', 'wilted'],
    },
    '🌺': {
        name: 'hibiscus',
        keywords: ['flower', 'plant'],
    },
    '🌻': {
        name: 'sunflower',
        keywords: ['flower', 'plant', 'sun'],
    },
    '🌼': {
        name: 'blossom',
        keywords: ['flower', 'plant'],
    },
    '🌷': {
        name: 'tulip',
        keywords: ['flower', 'plant'],
    },
    '🌱': {
        name: 'seedling',
        keywords: ['plant', 'young'],
    },
    '🪴': {
        name: 'potted_plant',
        keywords: [],
    },
    '🌲': {
        name: 'evergreen_tree',
        keywords: ['wood', 'evergreen', 'plant', 'tree'],
    },
    '🌳': {
        name: 'deciduous_tree',
        keywords: ['wood', 'deciduous', 'plant', 'shedding', 'tree'],
    },
    '🌴': {
        name: 'palm_tree',
        keywords: ['palm', 'plant', 'tree'],
    },
    '🌵': {
        name: 'cactus',
        keywords: ['plant'],
    },
    '🌾': {
        name: 'ear_of_rice',
        keywords: ['ear', 'plant', 'rice'],
    },
    '🌿': {
        name: 'herb',
        keywords: ['leaf', 'plant'],
    },
    '☘️': {
        name: 'shamrock',
        keywords: ['plant'],
    },
    '🍀': {
        name: 'four_leaf_clover',
        keywords: ['luck', '4', 'clover', 'four', 'leaf', 'plant'],
    },
    '🍁': {
        name: 'maple_leaf',
        keywords: ['canada', 'falling', 'leaf', 'maple', 'plant'],
    },
    '🍂': {
        name: 'fallen_leaf',
        keywords: ['autumn', 'falling', 'leaf', 'plant'],
    },
    '🍃': {
        name: 'leaves',
        keywords: ['leaf', 'blow', 'flutter', 'plant', 'wind'],
    },
    '🍇': {
        name: 'grapes',
        keywords: ['fruit', 'grape', 'plant'],
    },
    '🍈': {
        name: 'melon',
        keywords: ['fruit', 'plant'],
    },
    '🍉': {
        name: 'watermelon',
        keywords: ['fruit', 'plant'],
    },
    '🍊': {
        name: 'tangerine',
        keywords: ['orange', 'mandarin', 'fruit', 'plant'],
    },
    '🍋': {
        name: 'lemon',
        keywords: ['citrus', 'fruit', 'plant'],
    },
    '🍌': {
        name: 'banana',
        keywords: ['fruit', 'plant'],
    },
    '🍍': {
        name: 'pineapple',
        keywords: ['fruit', 'plant'],
    },
    '🥭': {
        name: 'mango',
        keywords: [],
    },
    '🍎': {
        name: 'apple',
        keywords: ['fruit', 'plant', 'red'],
    },
    '🍏': {
        name: 'green_apple',
        keywords: ['fruit', 'apple', 'green', 'plant'],
    },
    '🍐': {
        name: 'pear',
        keywords: ['fruit', 'plant'],
    },
    '🍑': {
        name: 'peach',
        keywords: ['fruit', 'plant'],
    },
    '🍒': {
        name: 'cherries',
        keywords: ['fruit', 'cherry', 'plant'],
    },
    '🍓': {
        name: 'strawberry',
        keywords: ['fruit', 'berry', 'plant'],
    },
    '🫐': {
        name: 'blueberries',
        keywords: [],
    },
    '🥝': {
        name: 'kiwi_fruit',
        keywords: ['fruit', 'kiwi'],
    },
    '🍅': {
        name: 'tomato',
        keywords: ['plant', 'vegetable'],
    },
    '🫒': {
        name: 'olive',
        keywords: [],
    },
    '🥥': {
        name: 'coconut',
        keywords: [],
    },
    '🥑': {
        name: 'avocado',
        keywords: ['fruit'],
    },
    '🍆': {
        name: 'eggplant',
        keywords: ['aubergine', 'plant', 'vegetable'],
    },
    '🥔': {
        name: 'potato',
        keywords: ['vegetable'],
    },
    '🥕': {
        name: 'carrot',
        keywords: ['vegetable'],
    },
    '🌽': {
        name: 'corn',
        keywords: ['ear', 'maize', 'maze', 'plant'],
    },
    '🌶️': {
        name: 'hot_pepper',
        keywords: ['spicy'],
    },
    '🫑': {
        name: 'bell_pepper',
        keywords: [],
    },
    '🥒': {
        name: 'cucumber',
        keywords: ['pickle', 'vegetable'],
    },
    '🥬': {
        name: 'leafy_green',
        keywords: [],
    },
    '🥦': {
        name: 'broccoli',
        keywords: [],
    },
    '🧄': {
        name: 'garlic',
        keywords: [],
    },
    '🧅': {
        name: 'onion',
        keywords: [],
    },
    '🍄': {
        name: 'mushroom',
        keywords: ['plant'],
    },
    '🥜': {
        name: 'peanuts',
        keywords: ['nut', 'peanut', 'vegetable'],
    },
    '🌰': {
        name: 'chestnut',
        keywords: ['plant'],
    },
    '🍞': {
        name: 'bread',
        keywords: ['toast', 'loaf'],
    },
    '🥐': {
        name: 'croissant',
        keywords: ['bread', 'crescent roll', 'french'],
    },
    '🥖': {
        name: 'baguette_bread',
        keywords: ['baguette', 'bread', 'french'],
    },
    '🫓': {
        name: 'flatbread',
        keywords: [],
    },
    '🥨': {
        name: 'pretzel',
        keywords: [],
    },
    '🥯': {
        name: 'bagel',
        keywords: [],
    },
    '🥞': {
        name: 'pancakes',
        keywords: ['crêpe', 'hotcake', 'pancake'],
    },
    '🧇': {
        name: 'waffle',
        keywords: [],
    },
    '🧀': {
        name: 'cheese',
        keywords: [],
    },
    '🍖': {
        name: 'meat_on_bone',
        keywords: ['bone', 'meat'],
    },
    '🍗': {
        name: 'poultry_leg',
        keywords: ['meat', 'chicken', 'bone', 'leg', 'poultry'],
    },
    '🥩': {
        name: 'cut_of_meat',
        keywords: [],
    },
    '🥓': {
        name: 'bacon',
        keywords: ['meat'],
    },
    '🍔': {
        name: 'hamburger',
        keywords: ['burger'],
    },
    '🍟': {
        name: 'fries',
        keywords: ['french'],
    },
    '🍕': {
        name: 'pizza',
        keywords: ['cheese', 'slice'],
    },
    '🌭': {
        name: 'hotdog',
        keywords: ['frankfurter', 'hot dog', 'sausage'],
    },
    '🥪': {
        name: 'sandwich',
        keywords: [],
    },
    '🌮': {
        name: 'taco',
        keywords: ['mexican'],
    },
    '🌯': {
        name: 'burrito',
        keywords: ['mexican'],
    },
    '🫔': {
        name: 'tamale',
        keywords: [],
    },
    '🥙': {
        name: 'stuffed_flatbread',
        keywords: ['falafel', 'flatbread', 'gyro', 'kebab', 'stuffed'],
    },
    '🧆': {
        name: 'falafel',
        keywords: [],
    },
    '🥚': {
        name: 'egg',
        keywords: [],
    },
    '🍳': {
        name: 'fried_egg',
        keywords: ['breakfast', 'cooking', 'egg', 'frying', 'pan'],
    },
    '🥘': {
        name: 'shallow_pan_of_food',
        keywords: ['paella', 'curry', 'casserole', 'pan', 'shallow'],
    },
    '🍲': {
        name: 'stew',
        keywords: ['pot'],
    },
    '🫕': {
        name: 'fondue',
        keywords: [],
    },
    '🥣': {
        name: 'bowl_with_spoon',
        keywords: [],
    },
    '🥗': {
        name: 'green_salad',
        keywords: ['green', 'salad'],
    },
    '🍿': {
        name: 'popcorn',
        keywords: [],
    },
    '🧈': {
        name: 'butter',
        keywords: [],
    },
    '🧂': {
        name: 'salt',
        keywords: [],
    },
    '🥫': {
        name: 'canned_food',
        keywords: [],
    },
    '🍱': {
        name: 'bento',
        keywords: ['box'],
    },
    '🍘': {
        name: 'rice_cracker',
        keywords: ['cracker', 'rice'],
    },
    '🍙': {
        name: 'rice_ball',
        keywords: ['ball', 'japanese', 'rice'],
    },
    '🍚': {
        name: 'rice',
        keywords: ['cooked'],
    },
    '🍛': {
        name: 'curry',
        keywords: ['rice'],
    },
    '🍜': {
        name: 'ramen',
        keywords: ['noodle', 'bowl', 'steaming'],
    },
    '🍝': {
        name: 'spaghetti',
        keywords: ['pasta'],
    },
    '🍠': {
        name: 'sweet_potato',
        keywords: ['potato', 'roasted', 'sweet'],
    },
    '🍢': {
        name: 'oden',
        keywords: ['kebab', 'seafood', 'skewer', 'stick'],
    },
    '🍣': {
        name: 'sushi',
        keywords: [],
    },
    '🍤': {
        name: 'fried_shrimp',
        keywords: ['tempura', 'fried', 'prawn', 'shrimp'],
    },
    '🍥': {
        name: 'fish_cake',
        keywords: ['cake', 'fish', 'pastry', 'swirl'],
    },
    '🥮': {
        name: 'moon_cake',
        keywords: [],
    },
    '🍡': {
        name: 'dango',
        keywords: ['dessert', 'japanese', 'skewer', 'stick', 'sweet'],
    },
    '🥟': {
        name: 'dumpling',
        keywords: [],
    },
    '🥠': {
        name: 'fortune_cookie',
        keywords: [],
    },
    '🥡': {
        name: 'takeout_box',
        keywords: [],
    },
    '🦀': {
        name: 'crab',
        keywords: ['cancer', 'zodiac'],
    },
    '🦞': {
        name: 'lobster',
        keywords: [],
    },
    '🦐': {
        name: 'shrimp',
        keywords: ['shellfish', 'small'],
    },
    '🦑': {
        name: 'squid',
        keywords: ['molusc'],
    },
    '🦪': {
        name: 'oyster',
        keywords: [],
    },
    '🍦': {
        name: 'icecream',
        keywords: ['cream', 'dessert', 'ice', 'soft', 'sweet'],
    },
    '🍧': {
        name: 'shaved_ice',
        keywords: ['dessert', 'ice', 'shaved', 'sweet'],
    },
    '🍨': {
        name: 'ice_cream',
        keywords: ['cream', 'dessert', 'ice', 'sweet'],
    },
    '🍩': {
        name: 'doughnut',
        keywords: ['dessert', 'donut', 'sweet'],
    },
    '🍪': {
        name: 'cookie',
        keywords: ['dessert', 'sweet'],
    },
    '🎂': {
        name: 'birthday',
        keywords: ['party', 'cake', 'celebration', 'dessert', 'pastry', 'sweet'],
    },
    '🍰': {
        name: 'cake',
        keywords: ['dessert', 'pastry', 'shortcake', 'slice', 'sweet'],
    },
    '🧁': {
        name: 'cupcake',
        keywords: [],
    },
    '🥧': {
        name: 'pie',
        keywords: [],
    },
    '🍫': {
        name: 'chocolate_bar',
        keywords: ['bar', 'chocolate', 'dessert', 'sweet'],
    },
    '🍬': {
        name: 'candy',
        keywords: ['sweet', 'dessert'],
    },
    '🍭': {
        name: 'lollipop',
        keywords: ['candy', 'dessert', 'sweet'],
    },
    '🍮': {
        name: 'custard',
        keywords: ['dessert', 'pudding', 'sweet'],
    },
    '🍯': {
        name: 'honey_pot',
        keywords: ['honey', 'honeypot', 'pot', 'sweet'],
    },
    '🍼': {
        name: 'baby_bottle',
        keywords: ['milk', 'baby', 'bottle', 'drink'],
    },
    '🥛': {
        name: 'milk_glass',
        keywords: ['drink', 'glass', 'milk'],
    },
    '☕': {
        name: 'coffee',
        keywords: ['cafe', 'espresso', 'beverage', 'drink', 'hot', 'steaming', 'tea'],
    },
    '🫖': {
        name: 'teapot',
        keywords: [],
    },
    '🍵': {
        name: 'tea',
        keywords: ['green', 'breakfast', 'beverage', 'cup', 'drink', 'teacup'],
    },
    '🍶': {
        name: 'sake',
        keywords: ['bar', 'beverage', 'bottle', 'cup', 'drink'],
    },
    '🍾': {
        name: 'champagne',
        keywords: ['bottle', 'bubbly', 'celebration', 'bar', 'cork', 'drink', 'popping'],
    },
    '🍷': {
        name: 'wine_glass',
        keywords: ['bar', 'beverage', 'drink', 'glass', 'wine'],
    },
    '🍸': {
        name: 'cocktail',
        keywords: ['drink', 'bar', 'glass'],
    },
    '🍹': {
        name: 'tropical_drink',
        keywords: ['summer', 'vacation', 'bar', 'drink', 'tropical'],
    },
    '🍺': {
        name: 'beer',
        keywords: ['drink', 'bar', 'mug'],
    },
    '🍻': {
        name: 'beers',
        keywords: ['drinks', 'bar', 'beer', 'clink', 'drink', 'mug'],
    },
    '🥂': {
        name: 'clinking_glasses',
        keywords: ['cheers', 'toast', 'celebrate', 'clink', 'drink', 'glass'],
    },
    '🥃': {
        name: 'tumbler_glass',
        keywords: ['whisky', 'glass', 'liquor', 'shot', 'tumbler'],
    },
    '🥤': {
        name: 'cup_with_straw',
        keywords: [],
    },
    '🧋': {
        name: 'bubble_tea',
        keywords: [],
    },
    '🧃': {
        name: 'beverage_box',
        keywords: [],
    },
    '🧉': {
        name: 'mate',
        keywords: [],
    },
    '🧊': {
        name: 'ice_cube',
        keywords: [],
    },
    '🥢': {
        name: 'chopsticks',
        keywords: [],
    },
    '🍽️': {
        name: 'plate_with_cutlery',
        keywords: ['dining', 'dinner'],
    },
    '🍴': {
        name: 'fork_and_knife',
        keywords: ['cutlery', 'cooking', 'fork', 'knife'],
    },
    '🥄': {
        name: 'spoon',
        keywords: ['tableware'],
    },
    '🔪': {
        name: 'hocho',
        keywords: ['cut', 'chop', 'knife', 'cooking', 'tool', 'weapon'],
    },
    '🏺': {
        name: 'amphora',
        keywords: ['aquarius', 'cooking', 'drink', 'jug', 'tool', 'weapon', 'zodiac'],
    },
    '🌍': {
        name: 'earth_africa',
        keywords: ['globe', 'world', 'international', 'africa', 'earth', 'europe'],
    },
    '🌎': {
        name: 'earth_americas',
        keywords: ['globe', 'world', 'international', 'americas', 'earth'],
    },
    '🌏': {
        name: 'earth_asia',
        keywords: ['globe', 'world', 'international', 'asia', 'australia', 'earth'],
    },
    '🌐': {
        name: 'globe_with_meridians',
        keywords: ['world', 'global', 'international', 'earth', 'globe', 'meridians'],
    },
    '🗺️': {
        name: 'world_map',
        keywords: ['travel'],
    },
    '🗾': {
        name: 'japan',
        keywords: ['map'],
    },
    '🧭': {
        name: 'compass',
        keywords: [],
    },
    '🏔️': {
        name: 'mountain_snow',
        keywords: [],
    },
    '⛰️': {
        name: 'mountain',
        keywords: [],
    },
    '🌋': {
        name: 'volcano',
        keywords: ['eruption', 'mountain', 'weather'],
    },
    '🗻': {
        name: 'mount_fuji',
        keywords: ['fuji', 'mountain'],
    },
    '🏕️': {
        name: 'camping',
        keywords: [],
    },
    '🏖️': {
        name: 'beach_umbrella',
        keywords: [],
    },
    '🏜️': {
        name: 'desert',
        keywords: [],
    },
    '🏝️': {
        name: 'desert_island',
        keywords: [],
    },
    '🏞️': {
        name: 'national_park',
        keywords: [],
    },
    '🏟️': {
        name: 'stadium',
        keywords: [],
    },
    '🏛️': {
        name: 'classical_building',
        keywords: [],
    },
    '🏗️': {
        name: 'building_construction',
        keywords: [],
    },
    '🧱': {
        name: 'bricks',
        keywords: [],
    },
    '🪨': {
        name: 'rock',
        keywords: [],
    },
    '🪵': {
        name: 'wood',
        keywords: [],
    },
    '🛖': {
        name: 'hut',
        keywords: [],
    },
    '🏘️': {
        name: 'houses',
        keywords: [],
    },
    '🏚️': {
        name: 'derelict_house',
        keywords: [],
    },
    '🏠': {
        name: 'house',
        keywords: ['building', 'home'],
    },
    '🏡': {
        name: 'house_with_garden',
        keywords: ['building', 'garden', 'home', 'house'],
    },
    '🏢': {
        name: 'office',
        keywords: ['building'],
    },
    '🏣': {
        name: 'post_office',
        keywords: ['building', 'japanese', 'post'],
    },
    '🏤': {
        name: 'european_post_office',
        keywords: ['building', 'european', 'post'],
    },
    '🏥': {
        name: 'hospital',
        keywords: ['building', 'doctor', 'medicine'],
    },
    '🏦': {
        name: 'bank',
        keywords: ['building'],
    },
    '🏨': {
        name: 'hotel',
        keywords: ['building'],
    },
    '🏩': {
        name: 'love_hotel',
        keywords: ['building', 'hotel', 'love'],
    },
    '🏪': {
        name: 'convenience_store',
        keywords: ['building', 'convenience', 'store'],
    },
    '🏫': {
        name: 'school',
        keywords: ['building'],
    },
    '🏬': {
        name: 'department_store',
        keywords: ['building', 'department', 'store'],
    },
    '🏭': {
        name: 'factory',
        keywords: ['building'],
    },
    '🏯': {
        name: 'japanese_castle',
        keywords: ['building', 'castle', 'japanese'],
    },
    '🏰': {
        name: 'european_castle',
        keywords: ['building', 'castle', 'european'],
    },
    '💒': {
        name: 'wedding',
        keywords: ['marriage', 'activity', 'chapel', 'romance'],
    },
    '🗼': {
        name: 'tokyo_tower',
        keywords: ['tokyo', 'tower'],
    },
    '🗽': {
        name: 'statue_of_liberty',
        keywords: ['liberty', 'statue'],
    },
    '⛪': {
        name: 'church',
        keywords: ['building', 'christian', 'cross', 'religion'],
    },
    '🕌': {
        name: 'mosque',
        keywords: ['islam', 'muslim', 'religion'],
    },
    '🛕': {
        name: 'hindu_temple',
        keywords: [],
    },
    '🕍': {
        name: 'synagogue',
        keywords: ['jew', 'jewish', 'religion', 'temple'],
    },
    '⛩️': {
        name: 'shinto_shrine',
        keywords: [],
    },
    '🕋': {
        name: 'kaaba',
        keywords: ['islam', 'muslim', 'religion'],
    },
    '⛲': {
        name: 'fountain',
        keywords: [],
    },
    '⛺': {
        name: 'tent',
        keywords: ['camping'],
    },
    '🌁': {
        name: 'foggy',
        keywords: ['karl', 'fog', 'weather'],
    },
    '🌃': {
        name: 'night_with_stars',
        keywords: ['night', 'star', 'weather'],
    },
    '🏙️': {
        name: 'cityscape',
        keywords: ['skyline'],
    },
    '🌄': {
        name: 'sunrise_over_mountains',
        keywords: ['morning', 'mountain', 'sun', 'sunrise', 'weather'],
    },
    '🌅': {
        name: 'sunrise',
        keywords: ['morning', 'sun', 'weather'],
    },
    '🌆': {
        name: 'city_sunset',
        keywords: ['building', 'city', 'dusk', 'evening', 'landscape', 'sun', 'sunset', 'weather'],
    },
    '🌇': {
        name: 'city_sunrise',
        keywords: ['building', 'dusk', 'sun', 'sunset', 'weather'],
    },
    '🌉': {
        name: 'bridge_at_night',
        keywords: ['bridge', 'night', 'weather'],
    },
    '♨️': {
        name: 'hotsprings',
        keywords: ['hot', 'springs', 'steaming'],
    },
    '🎠': {
        name: 'carousel_horse',
        keywords: ['activity', 'carousel', 'entertainment', 'horse'],
    },
    '🎡': {
        name: 'ferris_wheel',
        keywords: ['activity', 'amusement park', 'entertainment', 'ferris', 'wheel'],
    },
    '🎢': {
        name: 'roller_coaster',
        keywords: ['activity', 'amusement park', 'coaster', 'entertainment', 'roller'],
    },
    '💈': {
        name: 'barber',
        keywords: ['haircut', 'pole'],
    },
    '🎪': {
        name: 'circus_tent',
        keywords: ['activity', 'circus', 'entertainment', 'tent'],
    },
    '🚂': {
        name: 'steam_locomotive',
        keywords: ['train', 'engine', 'locomotive', 'railway', 'steam', 'vehicle'],
    },
    '🚃': {
        name: 'railway_car',
        keywords: ['car', 'electric', 'railway', 'train', 'tram', 'trolleybus', 'vehicle'],
    },
    '🚄': {
        name: 'bullettrain_side',
        keywords: ['train', 'railway', 'shinkansen', 'speed', 'vehicle'],
    },
    '🚅': {
        name: 'bullettrain_front',
        keywords: ['train', 'bullet', 'railway', 'shinkansen', 'speed', 'vehicle'],
    },
    '🚆': {
        name: 'train2',
        keywords: ['railway', 'train', 'vehicle'],
    },
    '🚇': {
        name: 'metro',
        keywords: ['subway', 'vehicle'],
    },
    '🚈': {
        name: 'light_rail',
        keywords: ['railway', 'vehicle'],
    },
    '🚉': {
        name: 'station',
        keywords: ['railway', 'train', 'vehicle'],
    },
    '🚊': {
        name: 'tram',
        keywords: ['trolleybus', 'vehicle'],
    },
    '🚝': {
        name: 'monorail',
        keywords: ['vehicle'],
    },
    '🚞': {
        name: 'mountain_railway',
        keywords: ['car', 'mountain', 'railway', 'vehicle'],
    },
    '🚋': {
        name: 'train',
        keywords: ['car', 'tram', 'trolleybus', 'vehicle'],
    },
    '🚌': {
        name: 'bus',
        keywords: ['vehicle'],
    },
    '🚍': {
        name: 'oncoming_bus',
        keywords: ['bus', 'oncoming', 'vehicle'],
    },
    '🚎': {
        name: 'trolleybus',
        keywords: ['bus', 'tram', 'trolley', 'vehicle'],
    },
    '🚐': {
        name: 'minibus',
        keywords: ['bus', 'vehicle'],
    },
    '🚑': {
        name: 'ambulance',
        keywords: ['vehicle'],
    },
    '🚒': {
        name: 'fire_engine',
        keywords: ['engine', 'fire', 'truck', 'vehicle'],
    },
    '🚓': {
        name: 'police_car',
        keywords: ['car', 'patrol', 'police', 'vehicle'],
    },
    '🚔': {
        name: 'oncoming_police_car',
        keywords: ['car', 'oncoming', 'police', 'vehicle'],
    },
    '🚕': {
        name: 'taxi',
        keywords: ['vehicle'],
    },
    '🚖': {
        name: 'oncoming_taxi',
        keywords: ['oncoming', 'taxi', 'vehicle'],
    },
    '🚗': {
        name: 'car',
        keywords: ['red_car', 'automobile', 'vehicle'],
    },
    '🚘': {
        name: 'oncoming_automobile',
        keywords: ['automobile', 'car', 'oncoming', 'vehicle'],
    },
    '🚙': {
        name: 'blue_car',
        keywords: ['recreational', 'rv', 'vehicle'],
    },
    '🛻': {
        name: 'pickup_truck',
        keywords: [],
    },
    '🚚': {
        name: 'truck',
        keywords: ['delivery', 'vehicle'],
    },
    '🚛': {
        name: 'articulated_lorry',
        keywords: ['lorry', 'semi', 'truck', 'vehicle'],
    },
    '🚜': {
        name: 'tractor',
        keywords: ['vehicle'],
    },
    '🏎️': {
        name: 'racing_car',
        keywords: [],
    },
    '🏍️': {
        name: 'motorcycle',
        keywords: [],
    },
    '🛵': {
        name: 'motor_scooter',
        keywords: ['motor', 'scooter'],
    },
    '🦽': {
        name: 'manual_wheelchair',
        keywords: [],
    },
    '🦼': {
        name: 'motorized_wheelchair',
        keywords: [],
    },
    '🛺': {
        name: 'auto_rickshaw',
        keywords: [],
    },
    '🚲': {
        name: 'bike',
        keywords: ['bicycle', 'vehicle'],
    },
    '🛴': {
        name: 'kick_scooter',
        keywords: ['kick', 'scooter'],
    },
    '🛹': {
        name: 'skateboard',
        keywords: [],
    },
    '🛼': {
        name: 'roller_skate',
        keywords: [],
    },
    '🚏': {
        name: 'busstop',
        keywords: ['bus', 'stop'],
    },
    '🛣️': {
        name: 'motorway',
        keywords: [],
    },
    '🛤️': {
        name: 'railway_track',
        keywords: [],
    },
    '🛢️': {
        name: 'oil_drum',
        keywords: [],
    },
    '⛽': {
        name: 'fuelpump',
        keywords: ['fuel', 'gas', 'pump', 'station'],
    },
    '🚨': {
        name: 'rotating_light',
        keywords: ['911', 'emergency', 'beacon', 'car', 'light', 'police', 'revolving', 'vehicle'],
    },
    '🚥': {
        name: 'traffic_light',
        keywords: ['light', 'signal', 'traffic'],
    },
    '🚦': {
        name: 'vertical_traffic_light',
        keywords: ['semaphore', 'light', 'signal', 'traffic'],
    },
    '🛑': {
        name: 'stop_sign',
        keywords: ['octagonal', 'stop'],
    },
    '🚧': {
        name: 'construction',
        keywords: ['wip', 'barrier'],
    },
    '⚓': {
        name: 'anchor',
        keywords: ['ship', 'tool'],
    },
    '⛵': {
        name: 'boat',
        keywords: ['sailboat', 'resort', 'sea', 'vehicle', 'yacht'],
    },
    '🛶': {
        name: 'canoe',
        keywords: ['boat'],
    },
    '🚤': {
        name: 'speedboat',
        keywords: ['ship', 'boat', 'vehicle'],
    },
    '🛳️': {
        name: 'passenger_ship',
        keywords: ['cruise'],
    },
    '⛴️': {
        name: 'ferry',
        keywords: [],
    },
    '🛥️': {
        name: 'motor_boat',
        keywords: [],
    },
    '🚢': {
        name: 'ship',
        keywords: ['vehicle'],
    },
    '✈️': {
        name: 'airplane',
        keywords: ['flight', 'vehicle'],
    },
    '🛩️': {
        name: 'small_airplane',
        keywords: ['flight'],
    },
    '🛫': {
        name: 'flight_departure',
        keywords: ['airplane', 'check-in', 'departure', 'departures', 'vehicle'],
    },
    '🛬': {
        name: 'flight_arrival',
        keywords: ['airplane', 'arrivals', 'arriving', 'landing', 'vehicle'],
    },
    '🪂': {
        name: 'parachute',
        keywords: [],
    },
    '💺': {
        name: 'seat',
        keywords: ['chair'],
    },
    '🚁': {
        name: 'helicopter',
        keywords: ['vehicle'],
    },
    '🚟': {
        name: 'suspension_railway',
        keywords: ['railway', 'suspension', 'vehicle'],
    },
    '🚠': {
        name: 'mountain_cableway',
        keywords: ['cable', 'gondola', 'mountain', 'vehicle'],
    },
    '🚡': {
        name: 'aerial_tramway',
        keywords: ['aerial', 'cable', 'car', 'gondola', 'ropeway', 'tramway', 'vehicle'],
    },
    '🛰️': {
        name: 'artificial_satellite',
        keywords: ['orbit', 'space'],
    },
    '🚀': {
        name: 'rocket',
        keywords: ['ship', 'launch', 'space', 'vehicle'],
    },
    '🛸': {
        name: 'flying_saucer',
        keywords: ['ufo'],
    },
    '🛎️': {
        name: 'bellhop_bell',
        keywords: [],
    },
    '🧳': {
        name: 'luggage',
        keywords: [],
    },
    '⌛': {
        name: 'hourglass',
        keywords: ['time', 'sand', 'timer'],
    },
    '⏳': {
        name: 'hourglass_flowing_sand',
        keywords: ['time', 'hourglass', 'sand', 'timer'],
    },
    '⌚': {
        name: 'watch',
        keywords: ['time', 'clock'],
    },
    '⏰': {
        name: 'alarm_clock',
        keywords: ['morning', 'alarm', 'clock'],
    },
    '⏱️': {
        name: 'stopwatch',
        keywords: [],
    },
    '⏲️': {
        name: 'timer_clock',
        keywords: [],
    },
    '🕰️': {
        name: 'mantelpiece_clock',
        keywords: [],
    },
    '🕛': {
        name: 'clock12',
        keywords: ['00', '12', '12:00', 'clock', 'o’clock', 'twelve'],
    },
    '🕧': {
        name: 'clock1230',
        keywords: ['12', '12:30', '30', 'clock', 'thirty', 'twelve'],
    },
    '🕐': {
        name: 'clock1',
        keywords: ['00', '1', '1:00', 'clock', 'o’clock', 'one'],
    },
    '🕜': {
        name: 'clock130',
        keywords: ['1', '1:30', '30', 'clock', 'one', 'thirty'],
    },
    '🕑': {
        name: 'clock2',
        keywords: ['00', '2', '2:00', 'clock', 'o’clock', 'two'],
    },
    '🕝': {
        name: 'clock230',
        keywords: ['2', '2:30', '30', 'clock', 'thirty', 'two'],
    },
    '🕒': {
        name: 'clock3',
        keywords: ['00', '3', '3:00', 'clock', 'o’clock', 'three'],
    },
    '🕞': {
        name: 'clock330',
        keywords: ['3', '3:30', '30', 'clock', 'thirty', 'three'],
    },
    '🕓': {
        name: 'clock4',
        keywords: ['00', '4', '4:00', 'clock', 'four', 'o’clock'],
    },
    '🕟': {
        name: 'clock430',
        keywords: ['30', '4', '4:30', 'clock', 'four', 'thirty'],
    },
    '🕔': {
        name: 'clock5',
        keywords: ['00', '5', '5:00', 'clock', 'five', 'o’clock'],
    },
    '🕠': {
        name: 'clock530',
        keywords: ['30', '5', '5:30', 'clock', 'five', 'thirty'],
    },
    '🕕': {
        name: 'clock6',
        keywords: ['00', '6', '6:00', 'clock', 'o’clock', 'six'],
    },
    '🕡': {
        name: 'clock630',
        keywords: ['30', '6', '6:30', 'clock', 'six', 'thirty'],
    },
    '🕖': {
        name: 'clock7',
        keywords: ['00', '7', '7:00', 'clock', 'o’clock', 'seven'],
    },
    '🕢': {
        name: 'clock730',
        keywords: ['30', '7', '7:30', 'clock', 'seven', 'thirty'],
    },
    '🕗': {
        name: 'clock8',
        keywords: ['00', '8', '8:00', 'clock', 'eight', 'o’clock'],
    },
    '🕣': {
        name: 'clock830',
        keywords: ['30', '8', '8:30', 'clock', 'eight', 'thirty'],
    },
    '🕘': {
        name: 'clock9',
        keywords: ['00', '9', '9:00', 'clock', 'nine', 'o’clock'],
    },
    '🕤': {
        name: 'clock930',
        keywords: ['30', '9', '9:30', 'clock', 'nine', 'thirty'],
    },
    '🕙': {
        name: 'clock10',
        keywords: ['00', '10', '10:00', 'clock', 'o’clock', 'ten'],
    },
    '🕥': {
        name: 'clock1030',
        keywords: ['10', '10:30', '30', 'clock', 'ten', 'thirty'],
    },
    '🕚': {
        name: 'clock11',
        keywords: ['00', '11', '11:00', 'clock', 'eleven', 'o’clock'],
    },
    '🕦': {
        name: 'clock1130',
        keywords: ['11', '11:30', '30', 'clock', 'eleven', 'thirty'],
    },
    '🌑': {
        name: 'new_moon',
        keywords: ['dark', 'moon', 'space', 'weather'],
    },
    '🌒': {
        name: 'waxing_crescent_moon',
        keywords: ['crescent', 'moon', 'space', 'waxing', 'weather'],
    },
    '🌓': {
        name: 'first_quarter_moon',
        keywords: ['moon', 'quarter', 'space', 'weather'],
    },
    '🌔': {
        name: 'moon',
        keywords: ['waxing_gibbous_moon', 'gibbous', 'space', 'waxing', 'weather'],
    },
    '🌕': {
        name: 'full_moon',
        keywords: ['full', 'moon', 'space', 'weather'],
    },
    '🌖': {
        name: 'waning_gibbous_moon',
        keywords: ['gibbous', 'moon', 'space', 'waning', 'weather'],
    },
    '🌗': {
        name: 'last_quarter_moon',
        keywords: ['moon', 'quarter', 'space', 'weather'],
    },
    '🌘': {
        name: 'waning_crescent_moon',
        keywords: ['crescent', 'moon', 'space', 'waning', 'weather'],
    },
    '🌙': {
        name: 'crescent_moon',
        keywords: ['night', 'crescent', 'moon', 'space', 'weather'],
    },
    '🌚': {
        name: 'new_moon_with_face',
        keywords: ['face', 'moon', 'space', 'weather'],
    },
    '🌛': {
        name: 'first_quarter_moon_with_face',
        keywords: ['face', 'moon', 'quarter', 'space', 'weather'],
    },
    '🌜': {
        name: 'last_quarter_moon_with_face',
        keywords: ['face', 'moon', 'quarter', 'space', 'weather'],
    },
    '🌡️': {
        name: 'thermometer',
        keywords: [],
    },
    '☀️': {
        name: 'sunny',
        keywords: ['weather', 'bright', 'rays', 'space', 'sun'],
    },
    '🌝': {
        name: 'full_moon_with_face',
        keywords: ['bright', 'face', 'full', 'moon', 'space', 'weather'],
    },
    '🌞': {
        name: 'sun_with_face',
        keywords: ['summer', 'bright', 'face', 'space', 'sun', 'weather'],
    },
    '🪐': {
        name: 'ringed_planet',
        keywords: [],
    },
    '⭐': {
        name: 'star',
        keywords: [],
    },
    '🌟': {
        name: 'star2',
        keywords: ['glittery', 'glow', 'shining', 'sparkle', 'star'],
    },
    '🌠': {
        name: 'stars',
        keywords: ['activity', 'falling', 'shooting', 'space', 'star'],
    },
    '🌌': {
        name: 'milky_way',
        keywords: ['milky way', 'space', 'weather'],
    },
    '☁️': {
        name: 'cloud',
        keywords: ['weather'],
    },
    '⛅': {
        name: 'partly_sunny',
        keywords: ['weather', 'cloud', 'sun'],
    },
    '⛈️': {
        name: 'cloud_with_lightning_and_rain',
        keywords: [],
    },
    '🌤️': {
        name: 'sun_behind_small_cloud',
        keywords: [],
    },
    '🌥️': {
        name: 'sun_behind_large_cloud',
        keywords: [],
    },
    '🌦️': {
        name: 'sun_behind_rain_cloud',
        keywords: [],
    },
    '🌧️': {
        name: 'cloud_with_rain',
        keywords: [],
    },
    '🌨️': {
        name: 'cloud_with_snow',
        keywords: [],
    },
    '🌩️': {
        name: 'cloud_with_lightning',
        keywords: [],
    },
    '🌪️': {
        name: 'tornado',
        keywords: [],
    },
    '🌫️': {
        name: 'fog',
        keywords: [],
    },
    '🌬️': {
        name: 'wind_face',
        keywords: [],
    },
    '🌀': {
        name: 'cyclone',
        keywords: ['swirl', 'dizzy', 'twister', 'typhoon', 'weather'],
    },
    '🌈': {
        name: 'rainbow',
        keywords: ['rain', 'weather'],
    },
    '🌂': {
        name: 'closed_umbrella',
        keywords: ['weather', 'rain', 'clothing', 'umbrella'],
    },
    '☂️': {
        name: 'open_umbrella',
        keywords: ['clothing', 'rain', 'umbrella', 'weather'],
    },
    '☔': {
        name: 'umbrella',
        keywords: ['rain', 'weather', 'clothing', 'drop'],
    },
    '⛱️': {
        name: 'parasol_on_ground',
        keywords: ['beach_umbrella'],
    },
    '⚡': {
        name: 'zap',
        keywords: ['lightning', 'thunder', 'danger', 'electric', 'electricity', 'voltage'],
    },
    '❄️': {
        name: 'snowflake',
        keywords: ['winter', 'cold', 'weather', 'snow'],
    },
    '☃️': {
        name: 'snowman_with_snow',
        keywords: ['winter', 'christmas', 'cold', 'snow', 'snowman', 'weather'],
    },
    '⛄': {
        name: 'snowman',
        keywords: ['winter', 'cold', 'snow', 'weather'],
    },
    '☄️': {
        name: 'comet',
        keywords: ['space'],
    },
    '🔥': {
        name: 'fire',
        keywords: ['burn', 'flame', 'tool'],
    },
    '💧': {
        name: 'droplet',
        keywords: ['water', 'cold', 'comic', 'drop', 'sweat', 'weather'],
    },
    '🌊': {
        name: 'ocean',
        keywords: ['sea', 'water', 'wave', 'weather'],
    },
    '🎃': {
        name: 'jack_o_lantern',
        keywords: ['halloween', 'activity', 'celebration', 'entertainment', 'jack', 'lantern'],
    },
    '🎄': {
        name: 'christmas_tree',
        keywords: ['activity', 'celebration', 'christmas', 'entertainment', 'tree'],
    },
    '🎆': {
        name: 'fireworks',
        keywords: ['festival', 'celebration', 'activity', 'entertainment'],
    },
    '🎇': {
        name: 'sparkler',
        keywords: ['activity', 'celebration', 'entertainment', 'fireworks', 'sparkle'],
    },
    '🧨': {
        name: 'firecracker',
        keywords: [],
    },
    '✨': {
        name: 'sparkles',
        keywords: ['shiny', 'entertainment', 'sparkle', 'star'],
    },
    '🎈': {
        name: 'balloon',
        keywords: ['party', 'birthday', 'activity', 'celebration', 'entertainment'],
    },
    '🎉': {
        name: 'tada',
        keywords: ['hooray', 'party', 'activity', 'celebration', 'entertainment', 'popper'],
    },
    '🎊': {
        name: 'confetti_ball',
        keywords: ['activity', 'ball', 'celebration', 'confetti', 'entertainment'],
    },
    '🎋': {
        name: 'tanabata_tree',
        keywords: ['activity', 'banner', 'celebration', 'entertainment', 'japanese', 'tree'],
    },
    '🎍': {
        name: 'bamboo',
        keywords: ['activity', 'celebration', 'japanese', 'pine', 'plant'],
    },
    '🎎': {
        name: 'dolls',
        keywords: ['activity', 'celebration', 'doll', 'entertainment', 'festival', 'japanese'],
    },
    '🎏': {
        name: 'flags',
        keywords: ['activity', 'carp', 'celebration', 'entertainment', 'flag', 'streamer'],
    },
    '🎐': {
        name: 'wind_chime',
        keywords: ['activity', 'bell', 'celebration', 'chime', 'entertainment', 'wind'],
    },
    '🎑': {
        name: 'rice_scene',
        keywords: ['activity', 'celebration', 'ceremony', 'entertainment', 'moon'],
    },
    '🧧': {
        name: 'red_envelope',
        keywords: [],
    },
    '🎀': {
        name: 'ribbon',
        keywords: ['celebration'],
    },
    '🎁': {
        name: 'gift',
        keywords: ['present', 'birthday', 'christmas', 'box', 'celebration', 'entertainment', 'wrapped'],
    },
    '🎗️': {
        name: 'reminder_ribbon',
        keywords: [],
    },
    '🎟️': {
        name: 'tickets',
        keywords: [],
    },
    '🎫': {
        name: 'ticket',
        keywords: ['activity', 'admission', 'entertainment'],
    },
    '🎖️': {
        name: 'medal_military',
        keywords: [],
    },
    '🏆': {
        name: 'trophy',
        keywords: ['award', 'contest', 'winner', 'prize'],
    },
    '🏅': {
        name: 'medal_sports',
        keywords: ['gold', 'winner', 'medal'],
    },
    '🥇': {
        name: '1st_place_medal',
        keywords: ['gold', 'first', 'medal'],
    },
    '🥈': {
        name: '2nd_place_medal',
        keywords: ['silver', 'medal', 'second'],
    },
    '🥉': {
        name: '3rd_place_medal',
        keywords: ['bronze', 'medal', 'third'],
    },
    '⚽': {
        name: 'soccer',
        keywords: ['sports', 'ball'],
    },
    '⚾': {
        name: 'baseball',
        keywords: ['sports', 'ball'],
    },
    '🥎': {
        name: 'softball',
        keywords: [],
    },
    '🏀': {
        name: 'basketball',
        keywords: ['sports', 'ball', 'hoop'],
    },
    '🏐': {
        name: 'volleyball',
        keywords: ['ball', 'game'],
    },
    '🏈': {
        name: 'football',
        keywords: ['sports', 'american', 'ball'],
    },
    '🏉': {
        name: 'rugby_football',
        keywords: ['ball', 'football', 'rugby'],
    },
    '🎾': {
        name: 'tennis',
        keywords: ['sports', 'ball', 'racquet'],
    },
    '🥏': {
        name: 'flying_disc',
        keywords: [],
    },
    '🎳': {
        name: 'bowling',
        keywords: ['ball', 'game'],
    },
    '🏏': {
        name: 'cricket_game',
        keywords: ['ball', 'bat', 'cricket', 'game'],
    },
    '🏑': {
        name: 'field_hockey',
        keywords: ['ball', 'field', 'game', 'hockey', 'stick'],
    },
    '🏒': {
        name: 'ice_hockey',
        keywords: ['game', 'hockey', 'ice', 'puck', 'stick'],
    },
    '🥍': {
        name: 'lacrosse',
        keywords: [],
    },
    '🏓': {
        name: 'ping_pong',
        keywords: ['ball', 'bat', 'game', 'paddle', 'table tennis'],
    },
    '🏸': {
        name: 'badminton',
        keywords: ['birdie', 'game', 'racquet', 'shuttlecock'],
    },
    '🥊': {
        name: 'boxing_glove',
        keywords: ['boxing', 'glove'],
    },
    '🥋': {
        name: 'martial_arts_uniform',
        keywords: ['judo', 'karate', 'martial arts', 'taekwondo', 'uniform'],
    },
    '🥅': {
        name: 'goal_net',
        keywords: ['goal', 'net'],
    },
    '⛳': {
        name: 'golf',
        keywords: ['flag', 'hole'],
    },
    '⛸️': {
        name: 'ice_skate',
        keywords: ['skating'],
    },
    '🎣': {
        name: 'fishing_pole_and_fish',
        keywords: ['entertainment', 'fish', 'pole'],
    },
    '🤿': {
        name: 'diving_mask',
        keywords: [],
    },
    '🎽': {
        name: 'running_shirt_with_sash',
        keywords: ['marathon', 'running', 'sash', 'shirt'],
    },
    '🎿': {
        name: 'ski',
        keywords: ['snow'],
    },
    '🛷': {
        name: 'sled',
        keywords: [],
    },
    '🥌': {
        name: 'curling_stone',
        keywords: [],
    },
    '🎯': {
        name: 'dart',
        keywords: ['target', 'activity', 'bull', 'bullseye', 'entertainment', 'eye', 'game', 'hit'],
    },
    '🪀': {
        name: 'yo_yo',
        keywords: [],
    },
    '🪁': {
        name: 'kite',
        keywords: [],
    },
    '🎱': {
        name: '8ball',
        keywords: ['pool', 'billiards', '8', '8 ball', 'ball', 'billiard', 'eight', 'game'],
    },
    '🔮': {
        name: 'crystal_ball',
        keywords: ['fortune', 'ball', 'crystal', 'fairy tale', 'fantasy', 'tool'],
    },
    '🪄': {
        name: 'magic_wand',
        keywords: [],
    },
    '🧿': {
        name: 'nazar_amulet',
        keywords: [],
    },
    '🎮': {
        name: 'video_game',
        keywords: ['play', 'controller', 'console', 'entertainment', 'game', 'video game'],
    },
    '🕹️': {
        name: 'joystick',
        keywords: [],
    },
    '🎰': {
        name: 'slot_machine',
        keywords: ['activity', 'game', 'slot'],
    },
    '🎲': {
        name: 'game_die',
        keywords: ['dice', 'gambling', 'die', 'entertainment', 'game'],
    },
    '🧩': {
        name: 'jigsaw',
        keywords: [],
    },
    '🧸': {
        name: 'teddy_bear',
        keywords: [],
    },
    '🪅': {
        name: 'pinata',
        keywords: [],
    },
    '🪆': {
        name: 'nesting_dolls',
        keywords: [],
    },
    '♠️': {
        name: 'spades',
        keywords: ['card', 'game', 'spade', 'suit'],
    },
    '♥️': {
        name: 'hearts',
        keywords: ['card', 'game', 'heart', 'suit'],
    },
    '♦️': {
        name: 'diamonds',
        keywords: ['card', 'diamond', 'game', 'suit'],
    },
    '♣️': {
        name: 'clubs',
        keywords: ['card', 'club', 'game', 'suit'],
    },
    '♟️': {
        name: 'chess_pawn',
        keywords: [],
    },
    '🃏': {
        name: 'black_joker',
        keywords: ['card', 'entertainment', 'game', 'joker', 'playing'],
    },
    '🀄': {
        name: 'mahjong',
        keywords: ['game', 'red'],
    },
    '🎴': {
        name: 'flower_playing_cards',
        keywords: ['activity', 'card', 'entertainment', 'flower', 'game', 'japanese', 'playing'],
    },
    '🎭': {
        name: 'performing_arts',
        keywords: ['theater', 'drama', 'activity', 'art', 'entertainment', 'mask', 'performing', 'theatre'],
    },
    '🖼️': {
        name: 'framed_picture',
        keywords: [],
    },
    '🎨': {
        name: 'art',
        keywords: ['design', 'paint', 'activity', 'entertainment', 'museum', 'painting', 'palette'],
    },
    '🧵': {
        name: 'thread',
        keywords: [],
    },
    '🪡': {
        name: 'sewing_needle',
        keywords: [],
    },
    '🧶': {
        name: 'yarn',
        keywords: [],
    },
    '🪢': {
        name: 'knot',
        keywords: [],
    },
    '👓': {
        name: 'eyeglasses',
        keywords: ['glasses', 'clothing', 'eye', 'eyewear'],
    },
    '🕶️': {
        name: 'dark_sunglasses',
        keywords: [],
    },
    '🥽': {
        name: 'goggles',
        keywords: [],
    },
    '🥼': {
        name: 'lab_coat',
        keywords: [],
    },
    '🦺': {
        name: 'safety_vest',
        keywords: [],
    },
    '👔': {
        name: 'necktie',
        keywords: ['shirt', 'formal', 'clothing'],
    },
    '👕': {
        name: 'shirt',
        keywords: ['tshirt', 'clothing'],
    },
    '👖': {
        name: 'jeans',
        keywords: ['pants', 'clothing', 'trousers'],
    },
    '🧣': {
        name: 'scarf',
        keywords: [],
    },
    '🧤': {
        name: 'gloves',
        keywords: [],
    },
    '🧥': {
        name: 'coat',
        keywords: [],
    },
    '🧦': {
        name: 'socks',
        keywords: [],
    },
    '👗': {
        name: 'dress',
        keywords: ['clothing'],
    },
    '👘': {
        name: 'kimono',
        keywords: ['clothing'],
    },
    '🥻': {
        name: 'sari',
        keywords: [],
    },
    '🩱': {
        name: 'one_piece_swimsuit',
        keywords: [],
    },
    '🩲': {
        name: 'swim_brief',
        keywords: [],
    },
    '🩳': {
        name: 'shorts',
        keywords: [],
    },
    '👙': {
        name: 'bikini',
        keywords: ['beach', 'clothing', 'swim'],
    },
    '👚': {
        name: 'womans_clothes',
        keywords: ['clothing', 'woman'],
    },
    '👛': {
        name: 'purse',
        keywords: ['clothing', 'coin'],
    },
    '👜': {
        name: 'handbag',
        keywords: ['bag', 'clothing'],
    },
    '👝': {
        name: 'pouch',
        keywords: ['bag', 'clothing'],
    },
    '🛍️': {
        name: 'shopping',
        keywords: ['bags'],
    },
    '🎒': {
        name: 'school_satchel',
        keywords: ['activity', 'bag', 'satchel', 'school'],
    },
    '🩴': {
        name: 'thong_sandal',
        keywords: [],
    },
    '👞': {
        name: 'mans_shoe',
        keywords: ['shoe', 'clothing', 'man'],
    },
    '👟': {
        name: 'athletic_shoe',
        keywords: ['sneaker', 'sport', 'running', 'athletic', 'clothing', 'shoe'],
    },
    '🥾': {
        name: 'hiking_boot',
        keywords: [],
    },
    '🥿': {
        name: 'flat_shoe',
        keywords: [],
    },
    '👠': {
        name: 'high_heel',
        keywords: ['shoe', 'clothing', 'heel', 'woman'],
    },
    '👡': {
        name: 'sandal',
        keywords: ['shoe', 'clothing', 'woman'],
    },
    '🩰': {
        name: 'ballet_shoes',
        keywords: [],
    },
    '👢': {
        name: 'boot',
        keywords: ['clothing', 'shoe', 'woman'],
    },
    '👑': {
        name: 'crown',
        keywords: ['king', 'queen', 'royal', 'clothing'],
    },
    '👒': {
        name: 'womans_hat',
        keywords: ['clothing', 'hat', 'woman'],
    },
    '🎩': {
        name: 'tophat',
        keywords: ['hat', 'classy', 'activity', 'clothing', 'entertainment', 'top'],
    },
    '🎓': {
        name: 'mortar_board',
        keywords: ['education', 'college', 'university', 'graduation', 'activity', 'cap', 'celebration', 'clothing', 'hat'],
    },
    '🧢': {
        name: 'billed_cap',
        keywords: [],
    },
    '🪖': {
        name: 'military_helmet',
        keywords: [],
    },
    '⛑️': {
        name: 'rescue_worker_helmet',
        keywords: [],
    },
    '📿': {
        name: 'prayer_beads',
        keywords: ['beads', 'clothing', 'necklace', 'prayer', 'religion'],
    },
    '💄': {
        name: 'lipstick',
        keywords: ['makeup', 'cosmetics'],
    },
    '💍': {
        name: 'ring',
        keywords: ['wedding', 'marriage', 'engaged', 'diamond', 'romance'],
    },
    '💎': {
        name: 'gem',
        keywords: ['diamond', 'jewel', 'romance'],
    },
    '🔇': {
        name: 'mute',
        keywords: ['sound', 'volume', 'quiet', 'silent', 'speaker'],
    },
    '🔈': {
        name: 'speaker',
        keywords: ['volume'],
    },
    '🔉': {
        name: 'sound',
        keywords: ['volume', 'low', 'speaker', 'wave'],
    },
    '🔊': {
        name: 'loud_sound',
        keywords: ['volume', '3', 'entertainment', 'high', 'loud', 'speaker', 'three'],
    },
    '📢': {
        name: 'loudspeaker',
        keywords: ['announcement', 'communication', 'loud', 'public address'],
    },
    '📣': {
        name: 'mega',
        keywords: ['cheering', 'communication', 'megaphone'],
    },
    '📯': {
        name: 'postal_horn',
        keywords: ['communication', 'entertainment', 'horn', 'post', 'postal'],
    },
    '🔔': {
        name: 'bell',
        keywords: ['sound', 'notification'],
    },
    '🔕': {
        name: 'no_bell',
        keywords: ['volume', 'off', 'bell', 'forbidden', 'mute', 'no', 'not', 'prohibited', 'quiet', 'silent'],
    },
    '🎼': {
        name: 'musical_score',
        keywords: ['activity', 'entertainment', 'music', 'score'],
    },
    '🎵': {
        name: 'musical_note',
        keywords: ['activity', 'entertainment', 'music', 'note'],
    },
    '🎶': {
        name: 'notes',
        keywords: ['music', 'activity', 'entertainment', 'note'],
    },
    '🎙️': {
        name: 'studio_microphone',
        keywords: ['podcast'],
    },
    '🎚️': {
        name: 'level_slider',
        keywords: [],
    },
    '🎛️': {
        name: 'control_knobs',
        keywords: [],
    },
    '🎤': {
        name: 'microphone',
        keywords: ['sing', 'activity', 'entertainment', 'karaoke', 'mic'],
    },
    '🎧': {
        name: 'headphones',
        keywords: ['music', 'earphones', 'activity', 'earbud', 'entertainment', 'headphone'],
    },
    '📻': {
        name: 'radio',
        keywords: ['podcast', 'entertainment', 'video'],
    },
    '🎷': {
        name: 'saxophone',
        keywords: ['activity', 'entertainment', 'instrument', 'music', 'sax'],
    },
    '🪗': {
        name: 'accordion',
        keywords: [],
    },
    '🎸': {
        name: 'guitar',
        keywords: ['rock', 'activity', 'entertainment', 'instrument', 'music'],
    },
    '🎹': {
        name: 'musical_keyboard',
        keywords: ['piano', 'activity', 'entertainment', 'instrument', 'keyboard', 'music'],
    },
    '🎺': {
        name: 'trumpet',
        keywords: ['activity', 'entertainment', 'instrument', 'music'],
    },
    '🎻': {
        name: 'violin',
        keywords: ['activity', 'entertainment', 'instrument', 'music'],
    },
    '🪕': {
        name: 'banjo',
        keywords: [],
    },
    '🥁': {
        name: 'drum',
        keywords: ['drumsticks', 'music'],
    },
    '🪘': {
        name: 'long_drum',
        keywords: [],
    },
    '📱': {
        name: 'iphone',
        keywords: ['smartphone', 'mobile', 'cell', 'communication', 'phone', 'telephone'],
    },
    '📲': {
        name: 'calling',
        keywords: ['call', 'incoming', 'arrow', 'cell', 'communication', 'mobile', 'phone', 'receive', 'telephone'],
    },
    '☎️': {
        name: 'phone',
        keywords: ['telephone'],
    },
    '📞': {
        name: 'telephone_receiver',
        keywords: ['phone', 'call', 'communication', 'receiver', 'telephone'],
    },
    '📟': {
        name: 'pager',
        keywords: ['communication'],
    },
    '📠': {
        name: 'fax',
        keywords: ['communication'],
    },
    '🔋': {
        name: 'battery',
        keywords: ['power'],
    },
    '🔌': {
        name: 'electric_plug',
        keywords: ['electric', 'electricity', 'plug'],
    },
    '💻': {
        name: 'computer',
        keywords: ['desktop', 'screen', 'pc', 'personal'],
    },
    '🖥️': {
        name: 'desktop_computer',
        keywords: [],
    },
    '🖨️': {
        name: 'printer',
        keywords: [],
    },
    '⌨️': {
        name: 'keyboard',
        keywords: ['computer'],
    },
    '🖱️': {
        name: 'computer_mouse',
        keywords: [],
    },
    '🖲️': {
        name: 'trackball',
        keywords: [],
    },
    '💽': {
        name: 'minidisc',
        keywords: ['computer', 'disk', 'entertainment', 'minidisk', 'optical'],
    },
    '💾': {
        name: 'floppy_disk',
        keywords: ['save', 'computer', 'disk', 'floppy'],
    },
    '💿': {
        name: 'cd',
        keywords: ['blu-ray', 'computer', 'disk', 'dvd', 'optical'],
    },
    '📀': {
        name: 'dvd',
        keywords: ['blu-ray', 'cd', 'computer', 'disk', 'entertainment', 'optical'],
    },
    '🧮': {
        name: 'abacus',
        keywords: [],
    },
    '🎥': {
        name: 'movie_camera',
        keywords: ['film', 'video', 'activity', 'camera', 'cinema', 'entertainment', 'movie'],
    },
    '🎞️': {
        name: 'film_strip',
        keywords: [],
    },
    '📽️': {
        name: 'film_projector',
        keywords: [],
    },
    '🎬': {
        name: 'clapper',
        keywords: ['film', 'activity', 'entertainment', 'movie'],
    },
    '📺': {
        name: 'tv',
        keywords: ['entertainment', 'television', 'video'],
    },
    '📷': {
        name: 'camera',
        keywords: ['photo', 'entertainment', 'video'],
    },
    '📸': {
        name: 'camera_flash',
        keywords: ['photo', 'camera', 'flash', 'video'],
    },
    '📹': {
        name: 'video_camera',
        keywords: ['camera', 'entertainment', 'video'],
    },
    '📼': {
        name: 'vhs',
        keywords: ['entertainment', 'tape', 'video', 'videocassette'],
    },
    '🔍': {
        name: 'mag',
        keywords: ['search', 'zoom', 'glass', 'magnifying', 'tool'],
    },
    '🔎': {
        name: 'mag_right',
        keywords: ['glass', 'magnifying', 'search', 'tool'],
    },
    '🕯️': {
        name: 'candle',
        keywords: [],
    },
    '💡': {
        name: 'bulb',
        keywords: ['idea', 'light', 'comic', 'electric'],
    },
    '🔦': {
        name: 'flashlight',
        keywords: ['electric', 'light', 'tool', 'torch'],
    },
    '🏮': {
        name: 'izakaya_lantern',
        keywords: ['lantern', 'bar', 'japanese', 'light', 'red'],
    },
    '🪔': {
        name: 'diya_lamp',
        keywords: [],
    },
    '📔': {
        name: 'notebook_with_decorative_cover',
        keywords: ['book', 'cover', 'decorated', 'notebook'],
    },
    '📕': {
        name: 'closed_book',
        keywords: ['book', 'closed'],
    },
    '📖': {
        name: 'book',
        keywords: ['open_book', 'open'],
    },
    '📗': {
        name: 'green_book',
        keywords: ['book', 'green'],
    },
    '📘': {
        name: 'blue_book',
        keywords: ['blue', 'book'],
    },
    '📙': {
        name: 'orange_book',
        keywords: ['book', 'orange'],
    },
    '📚': {
        name: 'books',
        keywords: ['library', 'book'],
    },
    '📓': {
        name: 'notebook',
        keywords: [],
    },
    '📒': {
        name: 'ledger',
        keywords: ['notebook'],
    },
    '📃': {
        name: 'page_with_curl',
        keywords: ['curl', 'document', 'page'],
    },
    '📜': {
        name: 'scroll',
        keywords: ['document', 'paper'],
    },
    '📄': {
        name: 'page_facing_up',
        keywords: ['document', 'page'],
    },
    '📰': {
        name: 'newspaper',
        keywords: ['press', 'communication', 'news', 'paper'],
    },
    '🗞️': {
        name: 'newspaper_roll',
        keywords: ['press'],
    },
    '📑': {
        name: 'bookmark_tabs',
        keywords: ['bookmark', 'mark', 'marker', 'tabs'],
    },
    '🔖': {
        name: 'bookmark',
        keywords: ['mark'],
    },
    '🏷️': {
        name: 'label',
        keywords: ['tag'],
    },
    '💰': {
        name: 'moneybag',
        keywords: ['dollar', 'cream', 'bag', 'money'],
    },
    '🪙': {
        name: 'coin',
        keywords: [],
    },
    '💴': {
        name: 'yen',
        keywords: ['bank', 'banknote', 'bill', 'currency', 'money', 'note'],
    },
    '💵': {
        name: 'dollar',
        keywords: ['money', 'bank', 'banknote', 'bill', 'currency', 'note'],
    },
    '💶': {
        name: 'euro',
        keywords: ['bank', 'banknote', 'bill', 'currency', 'money', 'note'],
    },
    '💷': {
        name: 'pound',
        keywords: ['bank', 'banknote', 'bill', 'currency', 'money', 'note'],
    },
    '💸': {
        name: 'money_with_wings',
        keywords: ['dollar', 'bank', 'banknote', 'bill', 'fly', 'money', 'note', 'wings'],
    },
    '💳': {
        name: 'credit_card',
        keywords: ['subscription', 'bank', 'card', 'credit', 'money'],
    },
    '🧾': {
        name: 'receipt',
        keywords: [],
    },
    '💹': {
        name: 'chart',
        keywords: ['bank', 'currency', 'graph', 'growth', 'market', 'money', 'rise', 'trend', 'upward', 'yen'],
    },
    '✉️': {
        name: 'envelope',
        keywords: ['letter', 'email', 'e-mail'],
    },
    '📧': {
        name: 'email',
        keywords: ['e-mail', 'communication', 'letter', 'mail'],
    },
    '📨': {
        name: 'incoming_envelope',
        keywords: ['communication', 'e-mail', 'email', 'envelope', 'incoming', 'letter', 'mail', 'receive'],
    },
    '📩': {
        name: 'envelope_with_arrow',
        keywords: ['arrow', 'communication', 'down', 'e-mail', 'email', 'envelope', 'letter', 'mail', 'outgoing', 'sent'],
    },
    '📤': {
        name: 'outbox_tray',
        keywords: ['box', 'communication', 'letter', 'mail', 'outbox', 'sent', 'tray'],
    },
    '📥': {
        name: 'inbox_tray',
        keywords: ['box', 'communication', 'inbox', 'letter', 'mail', 'receive', 'tray'],
    },
    '📦': {
        name: 'package',
        keywords: ['shipping', 'box', 'communication', 'parcel'],
    },
    '📫': {
        name: 'mailbox',
        keywords: ['closed', 'communication', 'flag', 'mail', 'postbox'],
    },
    '📪': {
        name: 'mailbox_closed',
        keywords: ['closed', 'communication', 'flag', 'lowered', 'mail', 'mailbox', 'postbox'],
    },
    '📬': {
        name: 'mailbox_with_mail',
        keywords: ['communication', 'flag', 'mail', 'mailbox', 'open', 'postbox'],
    },
    '📭': {
        name: 'mailbox_with_no_mail',
        keywords: ['communication', 'flag', 'lowered', 'mail', 'mailbox', 'open', 'postbox'],
    },
    '📮': {
        name: 'postbox',
        keywords: ['communication', 'mail', 'mailbox'],
    },
    '🗳️': {
        name: 'ballot_box',
        keywords: [],
    },
    '✏️': {
        name: 'pencil2',
        keywords: [],
    },
    '✒️': {
        name: 'black_nib',
        keywords: ['nib', 'pen'],
    },
    '🖋️': {
        name: 'fountain_pen',
        keywords: [],
    },
    '🖊️': {
        name: 'pen',
        keywords: [],
    },
    '🖌️': {
        name: 'paintbrush',
        keywords: [],
    },
    '🖍️': {
        name: 'crayon',
        keywords: [],
    },
    '📝': {
        name: 'memo',
        keywords: ['document', 'note', 'pencil', 'communication'],
    },
    '💼': {
        name: 'briefcase',
        keywords: ['business'],
    },
    '📁': {
        name: 'file_folder',
        keywords: ['directory', 'file', 'folder'],
    },
    '📂': {
        name: 'open_file_folder',
        keywords: ['file', 'folder', 'open'],
    },
    '🗂️': {
        name: 'card_index_dividers',
        keywords: [],
    },
    '📅': {
        name: 'date',
        keywords: ['calendar', 'schedule'],
    },
    '📆': {
        name: 'calendar',
        keywords: ['schedule'],
    },
    '🗒️': {
        name: 'spiral_notepad',
        keywords: [],
    },
    '🗓️': {
        name: 'spiral_calendar',
        keywords: [],
    },
    '📇': {
        name: 'card_index',
        keywords: ['card', 'index', 'rolodex'],
    },
    '📈': {
        name: 'chart_with_upwards_trend',
        keywords: ['graph', 'metrics', 'chart', 'growth', 'trend', 'upward'],
    },
    '📉': {
        name: 'chart_with_downwards_trend',
        keywords: ['graph', 'metrics', 'chart', 'down', 'trend'],
    },
    '📊': {
        name: 'bar_chart',
        keywords: ['stats', 'metrics', 'bar', 'chart', 'graph'],
    },
    '📋': {
        name: 'clipboard',
        keywords: [],
    },
    '📌': {
        name: 'pushpin',
        keywords: ['location', 'pin'],
    },
    '📍': {
        name: 'round_pushpin',
        keywords: ['location', 'pin', 'pushpin'],
    },
    '📎': {
        name: 'paperclip',
        keywords: [],
    },
    '🖇️': {
        name: 'paperclips',
        keywords: [],
    },
    '📏': {
        name: 'straight_ruler',
        keywords: ['ruler', 'straight edge'],
    },
    '📐': {
        name: 'triangular_ruler',
        keywords: ['ruler', 'set', 'triangle'],
    },
    '✂️': {
        name: 'scissors',
        keywords: ['cut', 'tool'],
    },
    '🗃️': {
        name: 'card_file_box',
        keywords: [],
    },
    '🗄️': {
        name: 'file_cabinet',
        keywords: [],
    },
    '🗑️': {
        name: 'wastebasket',
        keywords: ['trash'],
    },
    '🔒': {
        name: 'lock',
        keywords: ['security', 'private', 'closed'],
    },
    '🔓': {
        name: 'unlock',
        keywords: ['security', 'lock', 'open'],
    },
    '🔏': {
        name: 'lock_with_ink_pen',
        keywords: ['ink', 'lock', 'nib', 'pen', 'privacy'],
    },
    '🔐': {
        name: 'closed_lock_with_key',
        keywords: ['security', 'closed', 'key', 'lock', 'secure'],
    },
    '🔑': {
        name: 'key',
        keywords: ['lock', 'password'],
    },
    '🗝️': {
        name: 'old_key',
        keywords: [],
    },
    '🔨': {
        name: 'hammer',
        keywords: ['tool'],
    },
    '🪓': {
        name: 'axe',
        keywords: [],
    },
    '⛏️': {
        name: 'pick',
        keywords: [],
    },
    '⚒️': {
        name: 'hammer_and_pick',
        keywords: ['hammer', 'pick', 'tool'],
    },
    '🛠️': {
        name: 'hammer_and_wrench',
        keywords: [],
    },
    '🗡️': {
        name: 'dagger',
        keywords: [],
    },
    '⚔️': {
        name: 'crossed_swords',
        keywords: ['crossed', 'swords', 'weapon'],
    },
    '🔫': {
        name: 'gun',
        keywords: ['shoot', 'weapon', 'handgun', 'pistol', 'revolver', 'tool'],
    },
    '🪃': {
        name: 'boomerang',
        keywords: [],
    },
    '🏹': {
        name: 'bow_and_arrow',
        keywords: ['archery', 'archer', 'arrow', 'bow', 'sagittarius', 'tool', 'weapon', 'zodiac'],
    },
    '🛡️': {
        name: 'shield',
        keywords: [],
    },
    '🪚': {
        name: 'carpentry_saw',
        keywords: [],
    },
    '🔧': {
        name: 'wrench',
        keywords: ['tool'],
    },
    '🪛': {
        name: 'screwdriver',
        keywords: [],
    },
    '🔩': {
        name: 'nut_and_bolt',
        keywords: ['bolt', 'nut', 'tool'],
    },
    '⚙️': {
        name: 'gear',
        keywords: ['tool'],
    },
    '🗜️': {
        name: 'clamp',
        keywords: [],
    },
    '⚖️': {
        name: 'balance_scale',
        keywords: ['balance', 'justice', 'libra', 'scales', 'tool', 'weight', 'zodiac'],
    },
    '🦯': {
        name: 'probing_cane',
        keywords: [],
    },
    '🔗': {
        name: 'link',
        keywords: [],
    },
    '⛓️': {
        name: 'chains',
        keywords: [],
    },
    '🪝': {
        name: 'hook',
        keywords: [],
    },
    '🧰': {
        name: 'toolbox',
        keywords: [],
    },
    '🧲': {
        name: 'magnet',
        keywords: [],
    },
    '🪜': {
        name: 'ladder',
        keywords: [],
    },
    '⚗️': {
        name: 'alembic',
        keywords: ['chemistry', 'tool'],
    },
    '🧪': {
        name: 'test_tube',
        keywords: [],
    },
    '🧫': {
        name: 'petri_dish',
        keywords: [],
    },
    '🧬': {
        name: 'dna',
        keywords: [],
    },
    '🔬': {
        name: 'microscope',
        keywords: ['science', 'laboratory', 'investigate', 'tool'],
    },
    '🔭': {
        name: 'telescope',
        keywords: ['tool'],
    },
    '📡': {
        name: 'satellite',
        keywords: ['signal', 'antenna', 'communication', 'dish'],
    },
    '💉': {
        name: 'syringe',
        keywords: ['health', 'hospital', 'needle', 'doctor', 'medicine', 'shot', 'sick', 'tool'],
    },
    '🩸': {
        name: 'drop_of_blood',
        keywords: [],
    },
    '💊': {
        name: 'pill',
        keywords: ['health', 'medicine', 'doctor', 'sick'],
    },
    '🩹': {
        name: 'adhesive_bandage',
        keywords: [],
    },
    '🩺': {
        name: 'stethoscope',
        keywords: [],
    },
    '🚪': {
        name: 'door',
        keywords: [],
    },
    '🛗': {
        name: 'elevator',
        keywords: [],
    },
    '🪞': {
        name: 'mirror',
        keywords: [],
    },
    '🪟': {
        name: 'window',
        keywords: [],
    },
    '🛏️': {
        name: 'bed',
        keywords: [],
    },
    '🛋️': {
        name: 'couch_and_lamp',
        keywords: [],
    },
    '🪑': {
        name: 'chair',
        keywords: [],
    },
    '🚽': {
        name: 'toilet',
        keywords: ['wc'],
    },
    '🪠': {
        name: 'plunger',
        keywords: [],
    },
    '🚿': {
        name: 'shower',
        keywords: ['bath', 'water'],
    },
    '🛁': {
        name: 'bathtub',
        keywords: ['bath'],
    },
    '🪤': {
        name: 'mouse_trap',
        keywords: [],
    },
    '🪒': {
        name: 'razor',
        keywords: [],
    },
    '🧴': {
        name: 'lotion_bottle',
        keywords: [],
    },
    '🧷': {
        name: 'safety_pin',
        keywords: [],
    },
    '🧹': {
        name: 'broom',
        keywords: [],
    },
    '🧺': {
        name: 'basket',
        keywords: [],
    },
    '🧻': {
        name: 'roll_of_paper',
        keywords: ['toilet'],
    },
    '🪣': {
        name: 'bucket',
        keywords: [],
    },
    '🧼': {
        name: 'soap',
        keywords: [],
    },
    '🪥': {
        name: 'toothbrush',
        keywords: [],
    },
    '🧽': {
        name: 'sponge',
        keywords: [],
    },
    '🧯': {
        name: 'fire_extinguisher',
        keywords: [],
    },
    '🛒': {
        name: 'shopping_cart',
        keywords: ['cart', 'shopping', 'trolley'],
    },
    '🚬': {
        name: 'smoking',
        keywords: ['cigarette', 'activity'],
    },
    '⚰️': {
        name: 'coffin',
        keywords: ['funeral'],
    },
    '🪦': {
        name: 'headstone',
        keywords: [],
    },
    '⚱️': {
        name: 'funeral_urn',
        keywords: [],
    },
    '🗿': {
        name: 'moyai',
        keywords: ['stone', 'face', 'statue'],
    },
    '🪧': {
        name: 'placard',
        keywords: [],
    },
    '🏧': {
        name: 'atm',
        keywords: ['automated', 'bank', 'teller'],
    },
    '🚮': {
        name: 'put_litter_in_its_place',
        keywords: ['litter', 'litterbox'],
    },
    '🚰': {
        name: 'potable_water',
        keywords: ['drink', 'potable', 'water'],
    },
    '♿': {
        name: 'wheelchair',
        keywords: ['accessibility', 'access'],
    },
    '🚹': {
        name: 'mens',
        keywords: ['lavatory', 'man', 'restroom', 'wc'],
    },
    '🚺': {
        name: 'womens',
        keywords: ['lavatory', 'restroom', 'wc', 'woman'],
    },
    '🚻': {
        name: 'restroom',
        keywords: ['toilet', 'lavatory', 'wc'],
    },
    '🚼': {
        name: 'baby_symbol',
        keywords: ['baby', 'changing'],
    },
    '🚾': {
        name: 'wc',
        keywords: ['toilet', 'restroom', 'closet', 'lavatory', 'water'],
    },
    '🛂': {
        name: 'passport_control',
        keywords: ['control', 'passport'],
    },
    '🛃': {
        name: 'customs',
        keywords: [],
    },
    '🛄': {
        name: 'baggage_claim',
        keywords: ['airport', 'baggage', 'claim'],
    },
    '🛅': {
        name: 'left_luggage',
        keywords: ['baggage', 'left luggage', 'locker', 'luggage'],
    },
    '⚠️': {
        name: 'warning',
        keywords: ['wip'],
    },
    '🚸': {
        name: 'children_crossing',
        keywords: ['child', 'crossing', 'pedestrian', 'traffic'],
    },
    '⛔': {
        name: 'no_entry',
        keywords: ['limit', 'entry', 'forbidden', 'no', 'not', 'prohibited', 'traffic'],
    },
    '🚫': {
        name: 'no_entry_sign',
        keywords: ['block', 'forbidden', 'entry', 'no', 'not', 'prohibited'],
    },
    '🚳': {
        name: 'no_bicycles',
        keywords: ['bicycle', 'bike', 'forbidden', 'no', 'not', 'prohibited', 'vehicle'],
    },
    '🚭': {
        name: 'no_smoking',
        keywords: ['forbidden', 'no', 'not', 'prohibited', 'smoking'],
    },
    '🚯': {
        name: 'do_not_litter',
        keywords: ['forbidden', 'litter', 'no', 'not', 'prohibited'],
    },
    '🚱': {
        name: 'non-potable_water',
        keywords: ['drink', 'forbidden', 'no', 'not', 'potable', 'prohibited', 'water'],
    },
    '🚷': {
        name: 'no_pedestrians',
        keywords: ['forbidden', 'no', 'not', 'pedestrian', 'prohibited'],
    },
    '📵': {
        name: 'no_mobile_phones',
        keywords: ['cell', 'communication', 'forbidden', 'mobile', 'no', 'not', 'phone', 'prohibited', 'telephone'],
    },
    '🔞': {
        name: 'underage',
        keywords: ['18', 'age restriction', 'eighteen', 'forbidden', 'no', 'not', 'prohibited'],
    },
    '☢️': {
        name: 'radioactive',
        keywords: [],
    },
    '☣️': {
        name: 'biohazard',
        keywords: [],
    },
    '⬆️': {
        name: 'arrow_up',
        keywords: [],
    },
    '↗️': {
        name: 'arrow_upper_right',
        keywords: ['arrow', 'direction', 'intercardinal', 'northeast'],
    },
    '➡️': {
        name: 'arrow_right',
        keywords: [],
    },
    '↘️': {
        name: 'arrow_lower_right',
        keywords: ['arrow', 'direction', 'intercardinal', 'southeast'],
    },
    '⬇️': {
        name: 'arrow_down',
        keywords: [],
    },
    '↙️': {
        name: 'arrow_lower_left',
        keywords: ['arrow', 'direction', 'intercardinal', 'southwest'],
    },
    '⬅️': {
        name: 'arrow_left',
        keywords: [],
    },
    '↖️': {
        name: 'arrow_upper_left',
        keywords: ['arrow', 'direction', 'intercardinal', 'northwest'],
    },
    '↕️': {
        name: 'arrow_up_down',
        keywords: ['arrow'],
    },
    '↔️': {
        name: 'left_right_arrow',
        keywords: ['arrow'],
    },
    '↩️': {
        name: 'leftwards_arrow_with_hook',
        keywords: ['return'],
    },
    '↪️': {
        name: 'arrow_right_hook',
        keywords: [],
    },
    '⤴️': {
        name: 'arrow_heading_up',
        keywords: ['arrow', 'up'],
    },
    '⤵️': {
        name: 'arrow_heading_down',
        keywords: ['arrow', 'down'],
    },
    '🔃': {
        name: 'arrows_clockwise',
        keywords: ['arrow', 'clockwise', 'reload'],
    },
    '🔄': {
        name: 'arrows_counterclockwise',
        keywords: ['sync', 'anticlockwise', 'arrow', 'counterclockwise', 'withershins'],
    },
    '🔙': {
        name: 'back',
        keywords: ['arrow'],
    },
    '🔚': {
        name: 'end',
        keywords: ['arrow'],
    },
    '🔛': {
        name: 'on',
        keywords: ['arrow', 'mark'],
    },
    '🔜': {
        name: 'soon',
        keywords: ['arrow'],
    },
    '🔝': {
        name: 'top',
        keywords: ['arrow', 'up'],
    },
    '🛐': {
        name: 'place_of_worship',
        keywords: ['religion', 'worship'],
    },
    '⚛️': {
        name: 'atom_symbol',
        keywords: [],
    },
    '🕉️': {
        name: 'om',
        keywords: [],
    },
    '✡️': {
        name: 'star_of_david',
        keywords: ['david', 'jew', 'jewish', 'religion', 'star'],
    },
    '☸️': {
        name: 'wheel_of_dharma',
        keywords: ['buddhist', 'dharma', 'religion', 'wheel'],
    },
    '☯️': {
        name: 'yin_yang',
        keywords: [],
    },
    '✝️': {
        name: 'latin_cross',
        keywords: [],
    },
    '☦️': {
        name: 'orthodox_cross',
        keywords: ['christian', 'cross', 'religion'],
    },
    '☪️': {
        name: 'star_and_crescent',
        keywords: [],
    },
    '☮️': {
        name: 'peace_symbol',
        keywords: [],
    },
    '🕎': {
        name: 'menorah',
        keywords: ['candelabrum', 'candlestick', 'religion'],
    },
    '🔯': {
        name: 'six_pointed_star',
        keywords: ['fortune', 'star'],
    },
    '♈': {
        name: 'aries',
        keywords: ['ram', 'zodiac'],
    },
    '♉': {
        name: 'taurus',
        keywords: ['bull', 'ox', 'zodiac'],
    },
    '♊': {
        name: 'gemini',
        keywords: ['twins', 'zodiac'],
    },
    '♋': {
        name: 'cancer',
        keywords: ['crab', 'zodiac'],
    },
    '♌': {
        name: 'leo',
        keywords: ['lion', 'zodiac'],
    },
    '♍': {
        name: 'virgo',
        keywords: ['maiden', 'virgin', 'zodiac'],
    },
    '♎': {
        name: 'libra',
        keywords: ['balance', 'justice', 'scales', 'zodiac'],
    },
    '♏': {
        name: 'scorpius',
        keywords: ['scorpio', 'scorpion', 'zodiac'],
    },
    '♐': {
        name: 'sagittarius',
        keywords: ['archer', 'zodiac'],
    },
    '♑': {
        name: 'capricorn',
        keywords: ['goat', 'zodiac'],
    },
    '♒': {
        name: 'aquarius',
        keywords: ['bearer', 'water', 'zodiac'],
    },
    '♓': {
        name: 'pisces',
        keywords: ['fish', 'zodiac'],
    },
    '⛎': {
        name: 'ophiuchus',
        keywords: ['bearer', 'serpent', 'snake', 'zodiac'],
    },
    '🔀': {
        name: 'twisted_rightwards_arrows',
        keywords: ['shuffle', 'arrow', 'crossed'],
    },
    '🔁': {
        name: 'repeat',
        keywords: ['loop', 'arrow', 'clockwise'],
    },
    '🔂': {
        name: 'repeat_one',
        keywords: ['arrow', 'clockwise', 'once'],
    },
    '▶️': {
        name: 'arrow_forward',
        keywords: [],
    },
    '⏩': {
        name: 'fast_forward',
        keywords: ['arrow', 'double', 'fast', 'forward'],
    },
    '⏭️': {
        name: 'next_track_button',
        keywords: [],
    },
    '⏯️': {
        name: 'play_or_pause_button',
        keywords: [],
    },
    '◀️': {
        name: 'arrow_backward',
        keywords: [],
    },
    '⏪': {
        name: 'rewind',
        keywords: ['arrow', 'double'],
    },
    '⏮️': {
        name: 'previous_track_button',
        keywords: [],
    },
    '🔼': {
        name: 'arrow_up_small',
        keywords: ['arrow', 'button', 'red'],
    },
    '⏫': {
        name: 'arrow_double_up',
        keywords: ['arrow', 'double'],
    },
    '🔽': {
        name: 'arrow_down_small',
        keywords: ['arrow', 'button', 'down', 'red'],
    },
    '⏬': {
        name: 'arrow_double_down',
        keywords: ['arrow', 'double', 'down'],
    },
    '⏸️': {
        name: 'pause_button',
        keywords: [],
    },
    '⏹️': {
        name: 'stop_button',
        keywords: [],
    },
    '⏺️': {
        name: 'record_button',
        keywords: [],
    },
    '⏏️': {
        name: 'eject_button',
        keywords: [],
    },
    '🎦': {
        name: 'cinema',
        keywords: ['film', 'movie', 'activity', 'camera', 'entertainment'],
    },
    '🔅': {
        name: 'low_brightness',
        keywords: ['brightness', 'dim', 'low'],
    },
    '🔆': {
        name: 'high_brightness',
        keywords: ['bright', 'brightness'],
    },
    '📶': {
        name: 'signal_strength',
        keywords: ['wifi', 'antenna', 'bar', 'cell', 'communication', 'mobile', 'phone', 'signal', 'telephone'],
    },
    '📳': {
        name: 'vibration_mode',
        keywords: ['cell', 'communication', 'mobile', 'mode', 'phone', 'telephone', 'vibration'],
    },
    '📴': {
        name: 'mobile_phone_off',
        keywords: ['mute', 'off', 'cell', 'communication', 'mobile', 'phone', 'telephone'],
    },
    '♀️': {
        name: 'female_sign',
        keywords: [],
    },
    '♂️': {
        name: 'male_sign',
        keywords: [],
    },
    '⚧️': {
        name: 'transgender_symbol',
        keywords: [],
    },
    '✖️': {
        name: 'heavy_multiplication_x',
        keywords: ['cancel', 'multiplication', 'multiply', 'x'],
    },
    '➕': {
        name: 'heavy_plus_sign',
        keywords: ['math', 'plus'],
    },
    '➖': {
        name: 'heavy_minus_sign',
        keywords: ['math', 'minus'],
    },
    '➗': {
        name: 'heavy_division_sign',
        keywords: ['division', 'math'],
    },
    '♾️': {
        name: 'infinity',
        keywords: [],
    },
    '‼️': {
        name: 'bangbang',
        keywords: [],
    },
    '⁉️': {
        name: 'interrobang',
        keywords: ['exclamation', 'mark', 'punctuation', 'question'],
    },
    '❓': {
        name: 'question',
        keywords: ['confused', 'mark', 'punctuation'],
    },
    '❔': {
        name: 'grey_question',
        keywords: ['mark', 'outlined', 'punctuation', 'question'],
    },
    '❕': {
        name: 'grey_exclamation',
        keywords: ['exclamation', 'mark', 'outlined', 'punctuation'],
    },
    '❗': {
        name: 'exclamation',
        keywords: ['bang', 'heavy_exclamation_mark', 'mark', 'punctuation'],
    },
    '〰️': {
        name: 'wavy_dash',
        keywords: ['dash', 'punctuation', 'wavy'],
    },
    '💱': {
        name: 'currency_exchange',
        keywords: ['bank', 'currency', 'exchange', 'money'],
    },
    '💲': {
        name: 'heavy_dollar_sign',
        keywords: ['currency', 'dollar', 'money'],
    },
    '⚕️': {
        name: 'medical_symbol',
        keywords: [],
    },
    '♻️': {
        name: 'recycle',
        keywords: ['environment', 'green'],
    },
    '⚜️': {
        name: 'fleur_de_lis',
        keywords: [],
    },
    '🔱': {
        name: 'trident',
        keywords: ['anchor', 'emblem', 'ship', 'tool'],
    },
    '📛': {
        name: 'name_badge',
        keywords: ['badge', 'name'],
    },
    '🔰': {
        name: 'beginner',
        keywords: ['chevron', 'green', 'japanese', 'leaf', 'tool', 'yellow'],
    },
    '⭕': {
        name: 'o',
        keywords: ['circle'],
    },
    '✅': {
        name: 'white_check_mark',
        keywords: ['check', 'mark'],
    },
    '☑️': {
        name: 'ballot_box_with_check',
        keywords: ['ballot', 'box', 'check'],
    },
    '✔️': {
        name: 'heavy_check_mark',
        keywords: ['check', 'mark'],
    },
    '❌': {
        name: 'x',
        keywords: ['cancel', 'mark', 'multiplication', 'multiply'],
    },
    '❎': {
        name: 'negative_squared_cross_mark',
        keywords: ['mark', 'square'],
    },
    '➰': {
        name: 'curly_loop',
        keywords: ['curl', 'loop'],
    },
    '➿': {
        name: 'loop',
        keywords: ['curl', 'double'],
    },
    '〽️': {
        name: 'part_alternation_mark',
        keywords: [],
    },
    '✳️': {
        name: 'eight_spoked_asterisk',
        keywords: ['asterisk'],
    },
    '✴️': {
        name: 'eight_pointed_black_star',
        keywords: ['star'],
    },
    '❇️': {
        name: 'sparkle',
        keywords: [],
    },
    '©️': {
        name: 'copyright',
        keywords: [],
    },
    '®️': {
        name: 'registered',
        keywords: [],
    },
    '™️': {
        name: 'tm',
        keywords: ['trademark', 'mark'],
    },
    '#️⃣': {
        name: 'hash',
        keywords: ['number', 'keycap', 'pound'],
    },
    '*️⃣': {
        name: 'asterisk',
        keywords: ['keycap', 'star'],
    },
    '0️⃣': {
        name: 'zero',
        keywords: ['0', 'keycap'],
    },
    '1️⃣': {
        name: 'one',
        keywords: ['1', 'keycap'],
    },
    '2️⃣': {
        name: 'two',
        keywords: ['2', 'keycap'],
    },
    '3️⃣': {
        name: 'three',
        keywords: ['3', 'keycap'],
    },
    '4️⃣': {
        name: 'four',
        keywords: ['4', 'keycap'],
    },
    '5️⃣': {
        name: 'five',
        keywords: ['5', 'keycap'],
    },
    '6️⃣': {
        name: 'six',
        keywords: ['6', 'keycap'],
    },
    '7️⃣': {
        name: 'seven',
        keywords: ['7', 'keycap'],
    },
    '8️⃣': {
        name: 'eight',
        keywords: ['8', 'keycap'],
    },
    '9️⃣': {
        name: 'nine',
        keywords: ['9', 'keycap'],
    },
    '🔟': {
        name: 'keycap_ten',
        keywords: ['10', 'keycap', 'ten'],
    },
    '🔠': {
        name: 'capital_abcd',
        keywords: ['letters', 'input', 'latin', 'uppercase'],
    },
    '🔡': {
        name: 'abcd',
        keywords: ['input', 'latin', 'letters', 'lowercase'],
    },
    '🔢': {
        name: '1234',
        keywords: ['numbers', 'input'],
    },
    '🔣': {
        name: 'symbols',
        keywords: ['input'],
    },
    '🔤': {
        name: 'abc',
        keywords: ['alphabet', 'input', 'latin', 'letters'],
    },
    '🅰️': {
        name: 'a',
        keywords: [],
    },
    '🆎': {
        name: 'ab',
        keywords: ['blood'],
    },
    '🅱️': {
        name: 'b',
        keywords: [],
    },
    '🆑': {
        name: 'cl',
        keywords: [],
    },
    '🆒': {
        name: 'cool',
        keywords: [],
    },
    '🆓': {
        name: 'free',
        keywords: [],
    },
    ℹ️: {
        name: 'information_source',
        keywords: ['i', 'information'],
    },
    '🆔': {
        name: 'id',
        keywords: ['identity'],
    },
    'Ⓜ️': {
        name: 'm',
        keywords: [],
    },
    '🆕': {
        name: 'new',
        keywords: ['fresh'],
    },
    '🆖': {
        name: 'ng',
        keywords: [],
    },
    '🅾️': {
        name: 'o2',
        keywords: [],
    },
    '🆗': {
        name: 'ok',
        keywords: ['yes'],
    },
    '🅿️': {
        name: 'parking',
        keywords: [],
    },
    '🆘': {
        name: 'sos',
        keywords: ['help', 'emergency'],
    },
    '🆙': {
        name: 'up',
        keywords: ['mark'],
    },
    '🆚': {
        name: 'vs',
        keywords: ['versus'],
    },
    '🈁': {
        name: 'koko',
        keywords: ['japanese'],
    },
    '🈂️': {
        name: 'sa',
        keywords: [],
    },
    '🈷️': {
        name: 'u6708',
        keywords: [],
    },
    '🈶': {
        name: 'u6709',
        keywords: ['japanese'],
    },
    '🈯': {
        name: 'u6307',
        keywords: ['japanese'],
    },
    '🉐': {
        name: 'ideograph_advantage',
        keywords: ['japanese'],
    },
    '🈹': {
        name: 'u5272',
        keywords: ['japanese'],
    },
    '🈚': {
        name: 'u7121',
        keywords: ['japanese'],
    },
    '🈲': {
        name: 'u7981',
        keywords: ['japanese'],
    },
    '🉑': {
        name: 'accept',
        keywords: ['chinese'],
    },
    '🈸': {
        name: 'u7533',
        keywords: ['chinese'],
    },
    '🈴': {
        name: 'u5408',
        keywords: ['chinese'],
    },
    '🈳': {
        name: 'u7a7a',
        keywords: ['chinese'],
    },
    '㊗️': {
        name: 'congratulations',
        keywords: ['chinese', 'congratulation', 'ideograph'],
    },
    '㊙️': {
        name: 'secret',
        keywords: ['chinese', 'ideograph'],
    },
    '🈺': {
        name: 'u55b6',
        keywords: ['chinese'],
    },
    '🈵': {
        name: 'u6e80',
        keywords: ['chinese'],
    },
    '🔴': {
        name: 'red_circle',
        keywords: ['circle', 'geometric', 'red'],
    },
    '🟠': {
        name: 'orange_circle',
        keywords: [],
    },
    '🟡': {
        name: 'yellow_circle',
        keywords: [],
    },
    '🟢': {
        name: 'green_circle',
        keywords: [],
    },
    '🔵': {
        name: 'large_blue_circle',
        keywords: ['blue', 'circle', 'geometric'],
    },
    '🟣': {
        name: 'purple_circle',
        keywords: [],
    },
    '🟤': {
        name: 'brown_circle',
        keywords: [],
    },
    '⚫': {
        name: 'black_circle',
        keywords: ['circle', 'geometric'],
    },
    '⚪': {
        name: 'white_circle',
        keywords: ['circle', 'geometric'],
    },
    '🟥': {
        name: 'red_square',
        keywords: [],
    },
    '🟧': {
        name: 'orange_square',
        keywords: [],
    },
    '🟨': {
        name: 'yellow_square',
        keywords: [],
    },
    '🟩': {
        name: 'green_square',
        keywords: [],
    },
    '🟦': {
        name: 'blue_square',
        keywords: [],
    },
    '🟪': {
        name: 'purple_square',
        keywords: [],
    },
    '🟫': {
        name: 'brown_square',
        keywords: [],
    },
    '⬛': {
        name: 'black_large_square',
        keywords: ['geometric', 'square'],
    },
    '⬜': {
        name: 'white_large_square',
        keywords: ['geometric', 'square'],
    },
    '◼️': {
        name: 'black_medium_square',
        keywords: [],
    },
    '◻️': {
        name: 'white_medium_square',
        keywords: [],
    },
    '◾': {
        name: 'black_medium_small_square',
        keywords: ['geometric', 'square'],
    },
    '◽': {
        name: 'white_medium_small_square',
        keywords: ['geometric', 'square'],
    },
    '▪️': {
        name: 'black_small_square',
        keywords: [],
    },
    '▫️': {
        name: 'white_small_square',
        keywords: [],
    },
    '🔶': {
        name: 'large_orange_diamond',
        keywords: ['diamond', 'geometric', 'orange'],
    },
    '🔷': {
        name: 'large_blue_diamond',
        keywords: ['blue', 'diamond', 'geometric'],
    },
    '🔸': {
        name: 'small_orange_diamond',
        keywords: ['diamond', 'geometric', 'orange'],
    },
    '🔹': {
        name: 'small_blue_diamond',
        keywords: ['blue', 'diamond', 'geometric'],
    },
    '🔺': {
        name: 'small_red_triangle',
        keywords: ['geometric', 'red'],
    },
    '🔻': {
        name: 'small_red_triangle_down',
        keywords: ['down', 'geometric', 'red'],
    },
    '💠': {
        name: 'diamond_shape_with_a_dot_inside',
        keywords: ['comic', 'diamond', 'geometric', 'inside'],
    },
    '🔘': {
        name: 'radio_button',
        keywords: ['button', 'geometric', 'radio'],
    },
    '🔳': {
        name: 'white_square_button',
        keywords: ['button', 'geometric', 'outlined', 'square'],
    },
    '🔲': {
        name: 'black_square_button',
        keywords: ['button', 'geometric', 'square'],
    },
    '🏁': {
        name: 'checkered_flag',
        keywords: ['milestone', 'finish', 'checkered', 'chequered', 'flag', 'racing'],
    },
    '🚩': {
        name: 'triangular_flag_on_post',
        keywords: ['flag', 'post'],
    },
    '🎌': {
        name: 'crossed_flags',
        keywords: ['activity', 'celebration', 'cross', 'crossed', 'flag', 'japanese'],
    },
    '🏴': {
        name: 'black_flag',
        keywords: ['flag', 'waving'],
    },
    '🏳️': {
        name: 'white_flag',
        keywords: [],
    },
    '🏳️‍🌈': {
        name: 'rainbow_flag',
        keywords: ['pride'],
    },
    '🏳️‍⚧️': {
        name: 'transgender_flag',
        keywords: [],
    },
    '🏴‍☠️': {
        name: 'pirate_flag',
        keywords: [],
    },
    '🇦🇨': {
        name: 'ascension_island',
        keywords: ['ascension', 'flag', 'island'],
    },
    '🇦🇩': {
        name: 'andorra',
        keywords: ['flag'],
    },
    '🇦🇪': {
        name: 'united_arab_emirates',
        keywords: ['emirates', 'flag', 'uae', 'united'],
    },
    '🇦🇫': {
        name: 'afghanistan',
        keywords: ['flag'],
    },
    '🇦🇬': {
        name: 'antigua_barbuda',
        keywords: ['antigua', 'barbuda', 'flag'],
    },
    '🇦🇮': {
        name: 'anguilla',
        keywords: ['flag'],
    },
    '🇦🇱': {
        name: 'albania',
        keywords: ['flag'],
    },
    '🇦🇲': {
        name: 'armenia',
        keywords: ['flag'],
    },
    '🇦🇴': {
        name: 'angola',
        keywords: ['flag'],
    },
    '🇦🇶': {
        name: 'antarctica',
        keywords: ['flag'],
    },
    '🇦🇷': {
        name: 'argentina',
        keywords: ['flag'],
    },
    '🇦🇸': {
        name: 'american_samoa',
        keywords: ['american', 'flag', 'samoa'],
    },
    '🇦🇹': {
        name: 'austria',
        keywords: ['flag'],
    },
    '🇦🇺': {
        name: 'australia',
        keywords: ['flag'],
    },
    '🇦🇼': {
        name: 'aruba',
        keywords: ['flag'],
    },
    '🇦🇽': {
        name: 'aland_islands',
        keywords: ['åland', 'flag'],
    },
    '🇦🇿': {
        name: 'azerbaijan',
        keywords: ['flag'],
    },
    '🇧🇦': {
        name: 'bosnia_herzegovina',
        keywords: ['bosnia', 'flag', 'herzegovina'],
    },
    '🇧🇧': {
        name: 'barbados',
        keywords: ['flag'],
    },
    '🇧🇩': {
        name: 'bangladesh',
        keywords: ['flag'],
    },
    '🇧🇪': {
        name: 'belgium',
        keywords: ['flag'],
    },
    '🇧🇫': {
        name: 'burkina_faso',
        keywords: ['burkina faso', 'flag'],
    },
    '🇧🇬': {
        name: 'bulgaria',
        keywords: ['flag'],
    },
    '🇧🇭': {
        name: 'bahrain',
        keywords: ['flag'],
    },
    '🇧🇮': {
        name: 'burundi',
        keywords: ['flag'],
    },
    '🇧🇯': {
        name: 'benin',
        keywords: ['flag'],
    },
    '🇧🇱': {
        name: 'st_barthelemy',
        keywords: ['barthelemy', 'barthélemy', 'flag', 'saint'],
    },
    '🇧🇲': {
        name: 'bermuda',
        keywords: ['flag'],
    },
    '🇧🇳': {
        name: 'brunei',
        keywords: ['darussalam', 'flag'],
    },
    '🇧🇴': {
        name: 'bolivia',
        keywords: ['flag'],
    },
    '🇧🇶': {
        name: 'caribbean_netherlands',
        keywords: ['bonaire', 'caribbean', 'eustatius', 'flag', 'netherlands', 'saba', 'sint'],
    },
    '🇧🇷': {
        name: 'brazil',
        keywords: ['flag'],
    },
    '🇧🇸': {
        name: 'bahamas',
        keywords: ['flag'],
    },
    '🇧🇹': {
        name: 'bhutan',
        keywords: ['flag'],
    },
    '🇧🇻': {
        name: 'bouvet_island',
        keywords: ['bouvet', 'flag', 'island'],
    },
    '🇧🇼': {
        name: 'botswana',
        keywords: ['flag'],
    },
    '🇧🇾': {
        name: 'belarus',
        keywords: ['flag'],
    },
    '🇧🇿': {
        name: 'belize',
        keywords: ['flag'],
    },
    '🇨🇦': {
        name: 'canada',
        keywords: ['flag'],
    },
    '🇨🇨': {
        name: 'cocos_islands',
        keywords: ['keeling', 'cocos', 'flag', 'island'],
    },
    '🇨🇩': {
        name: 'congo_kinshasa',
        keywords: ['congo', 'congo-kinshasa', 'democratic republic of congo', 'drc', 'flag', 'kinshasa', 'republic'],
    },
    '🇨🇫': {
        name: 'central_african_republic',
        keywords: ['central african republic', 'flag', 'republic'],
    },
    '🇨🇬': {
        name: 'congo_brazzaville',
        keywords: ['brazzaville', 'congo', 'congo republic', 'congo-brazzaville', 'flag', 'republic', 'republic of the congo'],
    },
    '🇨🇭': {
        name: 'switzerland',
        keywords: ['flag'],
    },
    '🇨🇮': {
        name: 'cote_divoire',
        keywords: ['ivory', 'cote ivoire', 'côte ivoire', 'flag', 'ivory coast'],
    },
    '🇨🇰': {
        name: 'cook_islands',
        keywords: ['cook', 'flag', 'island'],
    },
    '🇨🇱': {
        name: 'chile',
        keywords: ['flag'],
    },
    '🇨🇲': {
        name: 'cameroon',
        keywords: ['flag'],
    },
    '🇨🇳': {
        name: 'cn',
        keywords: ['china', 'flag'],
    },
    '🇨🇴': {
        name: 'colombia',
        keywords: ['flag'],
    },
    '🇨🇵': {
        name: 'clipperton_island',
        keywords: ['clipperton', 'flag', 'island'],
    },
    '🇨🇷': {
        name: 'costa_rica',
        keywords: ['costa rica', 'flag'],
    },
    '🇨🇺': {
        name: 'cuba',
        keywords: ['flag'],
    },
    '🇨🇻': {
        name: 'cape_verde',
        keywords: ['cabo', 'cape', 'flag', 'verde'],
    },
    '🇨🇼': {
        name: 'curacao',
        keywords: ['antilles', 'curaçao', 'flag'],
    },
    '🇨🇽': {
        name: 'christmas_island',
        keywords: ['christmas', 'flag', 'island'],
    },
    '🇨🇾': {
        name: 'cyprus',
        keywords: ['flag'],
    },
    '🇨🇿': {
        name: 'czech_republic',
        keywords: ['czech republic', 'flag'],
    },
    '🇩🇪': {
        name: 'de',
        keywords: ['flag', 'germany'],
    },
    '🇩🇬': {
        name: 'diego_garcia',
        keywords: ['diego garcia', 'flag'],
    },
    '🇩🇯': {
        name: 'djibouti',
        keywords: ['flag'],
    },
    '🇩🇰': {
        name: 'denmark',
        keywords: ['flag'],
    },
    '🇩🇲': {
        name: 'dominica',
        keywords: ['flag'],
    },
    '🇩🇴': {
        name: 'dominican_republic',
        keywords: ['dominican republic', 'flag'],
    },
    '🇩🇿': {
        name: 'algeria',
        keywords: ['flag'],
    },
    '🇪🇦': {
        name: 'ceuta_melilla',
        keywords: ['ceuta', 'flag', 'melilla'],
    },
    '🇪🇨': {
        name: 'ecuador',
        keywords: ['flag'],
    },
    '🇪🇪': {
        name: 'estonia',
        keywords: ['flag'],
    },
    '🇪🇬': {
        name: 'egypt',
        keywords: ['flag'],
    },
    '🇪🇭': {
        name: 'western_sahara',
        keywords: ['flag', 'sahara', 'west', 'western sahara'],
    },
    '🇪🇷': {
        name: 'eritrea',
        keywords: ['flag'],
    },
    '🇪🇸': {
        name: 'es',
        keywords: ['spain', 'flag'],
    },
    '🇪🇹': {
        name: 'ethiopia',
        keywords: ['flag'],
    },
    '🇪🇺': {
        name: 'eu',
        keywords: ['european_union', 'european union', 'flag'],
    },
    '🇫🇮': {
        name: 'finland',
        keywords: ['flag'],
    },
    '🇫🇯': {
        name: 'fiji',
        keywords: ['flag'],
    },
    '🇫🇰': {
        name: 'falkland_islands',
        keywords: ['falkland', 'falklands', 'flag', 'island', 'islas', 'malvinas'],
    },
    '🇫🇲': {
        name: 'micronesia',
        keywords: ['flag'],
    },
    '🇫🇴': {
        name: 'faroe_islands',
        keywords: ['faroe', 'flag', 'island'],
    },
    '🇫🇷': {
        name: 'fr',
        keywords: ['france', 'french', 'flag'],
    },
    '🇬🇦': {
        name: 'gabon',
        keywords: ['flag'],
    },
    '🇬🇧': {
        name: 'gb',
        keywords: ['flag', 'british', 'uk', 'britain', 'cornwall', 'england', 'great britain', 'ireland', 'northern ireland', 'scotland', 'union jack', 'united', 'united kingdom', 'wales'],
    },
    '🇬🇩': {
        name: 'grenada',
        keywords: ['flag'],
    },
    '🇬🇪': {
        name: 'georgia',
        keywords: ['flag'],
    },
    '🇬🇫': {
        name: 'french_guiana',
        keywords: ['flag', 'french', 'guiana'],
    },
    '🇬🇬': {
        name: 'guernsey',
        keywords: ['flag'],
    },
    '🇬🇭': {
        name: 'ghana',
        keywords: ['flag'],
    },
    '🇬🇮': {
        name: 'gibraltar',
        keywords: ['flag'],
    },
    '🇬🇱': {
        name: 'greenland',
        keywords: ['flag'],
    },
    '🇬🇲': {
        name: 'gambia',
        keywords: ['flag'],
    },
    '🇬🇳': {
        name: 'guinea',
        keywords: ['flag'],
    },
    '🇬🇵': {
        name: 'guadeloupe',
        keywords: ['flag'],
    },
    '🇬🇶': {
        name: 'equatorial_guinea',
        keywords: ['equatorial guinea', 'flag', 'guinea'],
    },
    '🇬🇷': {
        name: 'greece',
        keywords: ['flag'],
    },
    '🇬🇸': {
        name: 'south_georgia_south_sandwich_islands',
        keywords: ['flag', 'georgia', 'island', 'south', 'south georgia', 'south sandwich'],
    },
    '🇬🇹': {
        name: 'guatemala',
        keywords: ['flag'],
    },
    '🇬🇺': {
        name: 'guam',
        keywords: ['flag'],
    },
    '🇬🇼': {
        name: 'guinea_bissau',
        keywords: ['bissau', 'flag', 'guinea'],
    },
    '🇬🇾': {
        name: 'guyana',
        keywords: ['flag'],
    },
    '🇭🇰': {
        name: 'hong_kong',
        keywords: ['china', 'flag', 'hong kong'],
    },
    '🇭🇲': {
        name: 'heard_mcdonald_islands',
        keywords: ['flag', 'heard', 'island', 'mcdonald'],
    },
    '🇭🇳': {
        name: 'honduras',
        keywords: ['flag'],
    },
    '🇭🇷': {
        name: 'croatia',
        keywords: ['flag'],
    },
    '🇭🇹': {
        name: 'haiti',
        keywords: ['flag'],
    },
    '🇭🇺': {
        name: 'hungary',
        keywords: ['flag'],
    },
    '🇮🇨': {
        name: 'canary_islands',
        keywords: ['canary', 'flag', 'island'],
    },
    '🇮🇩': {
        name: 'indonesia',
        keywords: ['flag'],
    },
    '🇮🇪': {
        name: 'ireland',
        keywords: ['flag'],
    },
    '🇮🇱': {
        name: 'israel',
        keywords: ['flag'],
    },
    '🇮🇲': {
        name: 'isle_of_man',
        keywords: ['flag', 'isle of man'],
    },
    '🇮🇳': {
        name: 'india',
        keywords: ['flag'],
    },
    '🇮🇴': {
        name: 'british_indian_ocean_territory',
        keywords: ['british', 'chagos', 'flag', 'indian ocean', 'island'],
    },
    '🇮🇶': {
        name: 'iraq',
        keywords: ['flag'],
    },
    '🇮🇷': {
        name: 'iran',
        keywords: ['flag'],
    },
    '🇮🇸': {
        name: 'iceland',
        keywords: ['flag'],
    },
    '🇮🇹': {
        name: 'it',
        keywords: ['italy', 'flag'],
    },
    '🇯🇪': {
        name: 'jersey',
        keywords: ['flag'],
    },
    '🇯🇲': {
        name: 'jamaica',
        keywords: ['flag'],
    },
    '🇯🇴': {
        name: 'jordan',
        keywords: ['flag'],
    },
    '🇯🇵': {
        name: 'jp',
        keywords: ['japan', 'flag'],
    },
    '🇰🇪': {
        name: 'kenya',
        keywords: ['flag'],
    },
    '🇰🇬': {
        name: 'kyrgyzstan',
        keywords: ['flag'],
    },
    '🇰🇭': {
        name: 'cambodia',
        keywords: ['flag'],
    },
    '🇰🇮': {
        name: 'kiribati',
        keywords: ['flag'],
    },
    '🇰🇲': {
        name: 'comoros',
        keywords: ['flag'],
    },
    '🇰🇳': {
        name: 'st_kitts_nevis',
        keywords: ['flag', 'kitts', 'nevis', 'saint'],
    },
    '🇰🇵': {
        name: 'north_korea',
        keywords: ['flag', 'korea', 'north', 'north korea'],
    },
    '🇰🇷': {
        name: 'kr',
        keywords: ['korea', 'flag', 'south', 'south korea'],
    },
    '🇰🇼': {
        name: 'kuwait',
        keywords: ['flag'],
    },
    '🇰🇾': {
        name: 'cayman_islands',
        keywords: ['cayman', 'flag', 'island'],
    },
    '🇰🇿': {
        name: 'kazakhstan',
        keywords: ['flag'],
    },
    '🇱🇦': {
        name: 'laos',
        keywords: ['flag'],
    },
    '🇱🇧': {
        name: 'lebanon',
        keywords: ['flag'],
    },
    '🇱🇨': {
        name: 'st_lucia',
        keywords: ['flag', 'lucia', 'saint'],
    },
    '🇱🇮': {
        name: 'liechtenstein',
        keywords: ['flag'],
    },
    '🇱🇰': {
        name: 'sri_lanka',
        keywords: ['flag', 'sri lanka'],
    },
    '🇱🇷': {
        name: 'liberia',
        keywords: ['flag'],
    },
    '🇱🇸': {
        name: 'lesotho',
        keywords: ['flag'],
    },
    '🇱🇹': {
        name: 'lithuania',
        keywords: ['flag'],
    },
    '🇱🇺': {
        name: 'luxembourg',
        keywords: ['flag'],
    },
    '🇱🇻': {
        name: 'latvia',
        keywords: ['flag'],
    },
    '🇱🇾': {
        name: 'libya',
        keywords: ['flag'],
    },
    '🇲🇦': {
        name: 'morocco',
        keywords: ['flag'],
    },
    '🇲🇨': {
        name: 'monaco',
        keywords: ['flag'],
    },
    '🇲🇩': {
        name: 'moldova',
        keywords: ['flag'],
    },
    '🇲🇪': {
        name: 'montenegro',
        keywords: ['flag'],
    },
    '🇲🇫': {
        name: 'st_martin',
        keywords: ['flag', 'french', 'martin', 'saint'],
    },
    '🇲🇬': {
        name: 'madagascar',
        keywords: ['flag'],
    },
    '🇲🇭': {
        name: 'marshall_islands',
        keywords: ['flag', 'island', 'marshall'],
    },
    '🇲🇰': {
        name: 'macedonia',
        keywords: ['flag'],
    },
    '🇲🇱': {
        name: 'mali',
        keywords: ['flag'],
    },
    '🇲🇲': {
        name: 'myanmar',
        keywords: ['burma', 'flag'],
    },
    '🇲🇳': {
        name: 'mongolia',
        keywords: ['flag'],
    },
    '🇲🇴': {
        name: 'macau',
        keywords: ['china', 'flag', 'macao'],
    },
    '🇲🇵': {
        name: 'northern_mariana_islands',
        keywords: ['flag', 'island', 'mariana', 'north', 'northern mariana'],
    },
    '🇲🇶': {
        name: 'martinique',
        keywords: ['flag'],
    },
    '🇲🇷': {
        name: 'mauritania',
        keywords: ['flag'],
    },
    '🇲🇸': {
        name: 'montserrat',
        keywords: ['flag'],
    },
    '🇲🇹': {
        name: 'malta',
        keywords: ['flag'],
    },
    '🇲🇺': {
        name: 'mauritius',
        keywords: ['flag'],
    },
    '🇲🇻': {
        name: 'maldives',
        keywords: ['flag'],
    },
    '🇲🇼': {
        name: 'malawi',
        keywords: ['flag'],
    },
    '🇲🇽': {
        name: 'mexico',
        keywords: ['flag'],
    },
    '🇲🇾': {
        name: 'malaysia',
        keywords: ['flag'],
    },
    '🇲🇿': {
        name: 'mozambique',
        keywords: ['flag'],
    },
    '🇳🇦': {
        name: 'namibia',
        keywords: ['flag'],
    },
    '🇳🇨': {
        name: 'new_caledonia',
        keywords: ['flag', 'new', 'new caledonia'],
    },
    '🇳🇪': {
        name: 'niger',
        keywords: ['flag'],
    },
    '🇳🇫': {
        name: 'norfolk_island',
        keywords: ['flag', 'island', 'norfolk'],
    },
    '🇳🇬': {
        name: 'nigeria',
        keywords: ['flag'],
    },
    '🇳🇮': {
        name: 'nicaragua',
        keywords: ['flag'],
    },
    '🇳🇱': {
        name: 'netherlands',
        keywords: ['flag'],
    },
    '🇳🇴': {
        name: 'norway',
        keywords: ['flag'],
    },
    '🇳🇵': {
        name: 'nepal',
        keywords: ['flag'],
    },
    '🇳🇷': {
        name: 'nauru',
        keywords: ['flag'],
    },
    '🇳🇺': {
        name: 'niue',
        keywords: ['flag'],
    },
    '🇳🇿': {
        name: 'new_zealand',
        keywords: ['flag', 'new', 'new zealand'],
    },
    '🇴🇲': {
        name: 'oman',
        keywords: ['flag'],
    },
    '🇵🇦': {
        name: 'panama',
        keywords: ['flag'],
    },
    '🇵🇪': {
        name: 'peru',
        keywords: ['flag'],
    },
    '🇵🇫': {
        name: 'french_polynesia',
        keywords: ['flag', 'french', 'polynesia'],
    },
    '🇵🇬': {
        name: 'papua_new_guinea',
        keywords: ['flag', 'guinea', 'new', 'papua new guinea'],
    },
    '🇵🇭': {
        name: 'philippines',
        keywords: ['flag'],
    },
    '🇵🇰': {
        name: 'pakistan',
        keywords: ['flag'],
    },
    '🇵🇱': {
        name: 'poland',
        keywords: ['flag'],
    },
    '🇵🇲': {
        name: 'st_pierre_miquelon',
        keywords: ['flag', 'miquelon', 'pierre', 'saint'],
    },
    '🇵🇳': {
        name: 'pitcairn_islands',
        keywords: ['flag', 'island', 'pitcairn'],
    },
    '🇵🇷': {
        name: 'puerto_rico',
        keywords: ['flag', 'puerto rico'],
    },
    '🇵🇸': {
        name: 'palestinian_territories',
        keywords: ['flag', 'palestine'],
    },
    '🇵🇹': {
        name: 'portugal',
        keywords: ['flag'],
    },
    '🇵🇼': {
        name: 'palau',
        keywords: ['flag'],
    },
    '🇵🇾': {
        name: 'paraguay',
        keywords: ['flag'],
    },
    '🇶🇦': {
        name: 'qatar',
        keywords: ['flag'],
    },
    '🇷🇪': {
        name: 'reunion',
        keywords: ['flag', 'réunion'],
    },
    '🇷🇴': {
        name: 'romania',
        keywords: ['flag'],
    },
    '🇷🇸': {
        name: 'serbia',
        keywords: ['flag'],
    },
    '🇷🇺': {
        name: 'ru',
        keywords: ['russia', 'flag'],
    },
    '🇷🇼': {
        name: 'rwanda',
        keywords: ['flag'],
    },
    '🇸🇦': {
        name: 'saudi_arabia',
        keywords: ['flag', 'saudi arabia'],
    },
    '🇸🇧': {
        name: 'solomon_islands',
        keywords: ['flag', 'island', 'solomon'],
    },
    '🇸🇨': {
        name: 'seychelles',
        keywords: ['flag'],
    },
    '🇸🇩': {
        name: 'sudan',
        keywords: ['flag'],
    },
    '🇸🇪': {
        name: 'sweden',
        keywords: ['flag'],
    },
    '🇸🇬': {
        name: 'singapore',
        keywords: ['flag'],
    },
    '🇸🇭': {
        name: 'st_helena',
        keywords: ['flag', 'helena', 'saint'],
    },
    '🇸🇮': {
        name: 'slovenia',
        keywords: ['flag'],
    },
    '🇸🇯': {
        name: 'svalbard_jan_mayen',
        keywords: ['flag', 'jan mayen', 'svalbard'],
    },
    '🇸🇰': {
        name: 'slovakia',
        keywords: ['flag'],
    },
    '🇸🇱': {
        name: 'sierra_leone',
        keywords: ['flag', 'sierra leone'],
    },
    '🇸🇲': {
        name: 'san_marino',
        keywords: ['flag', 'san marino'],
    },
    '🇸🇳': {
        name: 'senegal',
        keywords: ['flag'],
    },
    '🇸🇴': {
        name: 'somalia',
        keywords: ['flag'],
    },
    '🇸🇷': {
        name: 'suriname',
        keywords: ['flag'],
    },
    '🇸🇸': {
        name: 'south_sudan',
        keywords: ['flag', 'south', 'south sudan', 'sudan'],
    },
    '🇸🇹': {
        name: 'sao_tome_principe',
        keywords: ['flag', 'principe', 'príncipe', 'sao tome', 'são tomé'],
    },
    '🇸🇻': {
        name: 'el_salvador',
        keywords: ['el salvador', 'flag'],
    },
    '🇸🇽': {
        name: 'sint_maarten',
        keywords: ['flag', 'maarten', 'sint'],
    },
    '🇸🇾': {
        name: 'syria',
        keywords: ['flag'],
    },
    '🇸🇿': {
        name: 'swaziland',
        keywords: ['flag'],
    },
    '🇹🇦': {
        name: 'tristan_da_cunha',
        keywords: ['flag', 'tristan da cunha'],
    },
    '🇹🇨': {
        name: 'turks_caicos_islands',
        keywords: ['caicos', 'flag', 'island', 'turks'],
    },
    '🇹🇩': {
        name: 'chad',
        keywords: ['flag'],
    },
    '🇹🇫': {
        name: 'french_southern_territories',
        keywords: ['antarctic', 'flag', 'french'],
    },
    '🇹🇬': {
        name: 'togo',
        keywords: ['flag'],
    },
    '🇹🇭': {
        name: 'thailand',
        keywords: ['flag'],
    },
    '🇹🇯': {
        name: 'tajikistan',
        keywords: ['flag'],
    },
    '🇹🇰': {
        name: 'tokelau',
        keywords: ['flag'],
    },
    '🇹🇱': {
        name: 'timor_leste',
        keywords: ['east', 'east timor', 'flag', 'timor-leste'],
    },
    '🇹🇲': {
        name: 'turkmenistan',
        keywords: ['flag'],
    },
    '🇹🇳': {
        name: 'tunisia',
        keywords: ['flag'],
    },
    '🇹🇴': {
        name: 'tonga',
        keywords: ['flag'],
    },
    '🇹🇷': {
        name: 'tr',
        keywords: ['turkey', 'flag'],
    },
    '🇹🇹': {
        name: 'trinidad_tobago',
        keywords: ['flag', 'tobago', 'trinidad'],
    },
    '🇹🇻': {
        name: 'tuvalu',
        keywords: ['flag'],
    },
    '🇹🇼': {
        name: 'taiwan',
        keywords: ['china', 'flag'],
    },
    '🇹🇿': {
        name: 'tanzania',
        keywords: ['flag'],
    },
    '🇺🇦': {
        name: 'ukraine',
        keywords: ['flag'],
    },
    '🇺🇬': {
        name: 'uganda',
        keywords: ['flag'],
    },
    '🇺🇲': {
        name: 'us_outlying_islands',
        keywords: ['america', 'flag', 'island', 'minor outlying', 'united', 'united states', 'us', 'usa'],
    },
    '🇺🇳': {
        name: 'united_nations',
        keywords: ['flag'],
    },
    '🇺🇸': {
        name: 'us',
        keywords: ['flag', 'united', 'america', 'stars and stripes', 'united states'],
    },
    '🇺🇾': {
        name: 'uruguay',
        keywords: ['flag'],
    },
    '🇺🇿': {
        name: 'uzbekistan',
        keywords: ['flag'],
    },
    '🇻🇦': {
        name: 'vatican_city',
        keywords: ['flag', 'vatican'],
    },
    '🇻🇨': {
        name: 'st_vincent_grenadines',
        keywords: ['flag', 'grenadines', 'saint', 'vincent'],
    },
    '🇻🇪': {
        name: 'venezuela',
        keywords: ['flag'],
    },
    '🇻🇬': {
        name: 'british_virgin_islands',
        keywords: ['british', 'flag', 'island', 'virgin'],
    },
    '🇻🇮': {
        name: 'us_virgin_islands',
        keywords: ['america', 'american', 'flag', 'island', 'united', 'united states', 'us', 'usa', 'virgin'],
    },
    '🇻🇳': {
        name: 'vietnam',
        keywords: ['flag', 'viet nam'],
    },
    '🇻🇺': {
        name: 'vanuatu',
        keywords: ['flag'],
    },
    '🇼🇫': {
        name: 'wallis_futuna',
        keywords: ['flag', 'futuna', 'wallis'],
    },
    '🇼🇸': {
        name: 'samoa',
        keywords: ['flag'],
    },
    '🇽🇰': {
        name: 'kosovo',
        keywords: ['flag'],
    },
    '🇾🇪': {
        name: 'yemen',
        keywords: ['flag'],
    },
    '🇾🇹': {
        name: 'mayotte',
        keywords: ['flag'],
    },
    '🇿🇦': {
        name: 'south_africa',
        keywords: ['flag', 'south', 'south africa'],
    },
    '🇿🇲': {
        name: 'zambia',
        keywords: ['flag'],
    },
    '🇿🇼': {
        name: 'zimbabwe',
        keywords: ['flag'],
    },
    '🏴󠁧󠁢󠁥󠁮󠁧󠁿': {
        name: 'england',
        keywords: ['flag'],
    },
    '🏴󠁧󠁢󠁳󠁣󠁴󠁿': {
        name: 'scotland',
        keywords: ['flag'],
    },
    '🏴󠁧󠁢󠁷󠁬󠁳󠁿': {
        name: 'wales',
        keywords: ['flag'],
    },
};

export default enEmojis;
