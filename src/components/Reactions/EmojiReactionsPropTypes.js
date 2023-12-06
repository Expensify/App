import PropTypes from 'prop-types';

/** All the emoji reactions for the report action. An object that looks like this:
    "emojiReactions": {
        "+1": { // The emoji added to the action
            "createdAt": "2021-01-01 00:00:00",
            "users": {
                2352342: { // The accountID of the user who added this emoji
                    "skinTones": {
                        "1": "2021-01-01 00:00:00",
                        "2": "2021-01-01 00:00:00",
                    },
                },
            },
        },
    },
*/
export default PropTypes.objectOf(
    PropTypes.shape({
        /** The time the emoji was added */
        createdAt: PropTypes.string,

        /** All the users who have added this emoji */
        users: PropTypes.objectOf(
            PropTypes.shape({
                /** The skin tone which was used and also the timestamp of when it was added */
                skinTones: PropTypes.objectOf(PropTypes.string),
            }),
        ),
    }),
);
