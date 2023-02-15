import {View} from 'react-native';
import _ from 'underscore';
import EmojiReactionBubble from './EmojiReactionBubble';
import AddReactionBubble from './AddReactionBubble';

const QUICK_REACTIONS = [
    {
        name: '+1',
        codes: ['👍'],
    },
    {
        name: 'heart',
        codes: ['❤️'],
    },
    {
        name: 'joy',
        codes: ['😂'],
    },
    {
        name: 'fire',
        codes: ['🔥'],
    },
];

const EMOJI_BUBBLE_SCALE = 1.5;

const QuickEmojiReactions = () => (
    <View style={{
        flexDirection: 'row',
        paddingHorizontal: 30,
        paddingVertical: 12,
        justifyContent: 'space-between',
    }}
    >
        {_.map(QUICK_REACTIONS, reaction => (
            <EmojiReactionBubble
                key={reaction.name}
                onPress={console.log}
                emojiName={reaction.name}
                emojiCodes={reaction.codes}
                sizeScale={EMOJI_BUBBLE_SCALE}
            />
        ))}
        <AddReactionBubble
            iconSizeScale={1.2}
            onSelectEmoji={console.log}
            sizeScale={EMOJI_BUBBLE_SCALE}
        />
    </View>
);

QuickEmojiReactions.displayName = 'QuickEmojiReactions';
export default QuickEmojiReactions;
