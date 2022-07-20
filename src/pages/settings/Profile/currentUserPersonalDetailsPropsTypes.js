import PropTypes from 'prop-types';

/** The personal details of the person who is logged in */
const currentUserPersonalDetailsPropsTypes = {
    /** Email/Phone login of the current user from their personal details */
    login: PropTypes.string,

    /** Display first name of the current user from their personal details */
    firstName: PropTypes.string,

    /** Display last name of the current user from their personal details */
    lastName: PropTypes.string,

    /** Avatar URL of the current user from their personal details */
    avatar: PropTypes.string,

    /** Flag to set when Avatar uploading */
    avatarUploading: PropTypes.bool,

    /** Pronouns of the current user from their personal details */
    pronouns: PropTypes.string,

    /** Timezone of the current user from their personal details */
    timezone: PropTypes.shape({

        /** Value of selected timezone */
        selected: PropTypes.string,

        /** Whether timezone is automatically set */
        automatic: PropTypes.bool,
    }),
};

export default currentUserPersonalDetailsPropsTypes;
