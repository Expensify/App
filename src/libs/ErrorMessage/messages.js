const messages = [
    {
        type: 'Login',
        errorCode: 401,
        message: 'Incorrect login or password. Please try again.',
    },
    {
        type: 'Login',
        errorCode: 402,
        message:
          'You have 2FA enabled on this account. Please sign in using your email or phone number.',
    },
    {
        type: 'Login',
        errorCode: 403,
        message:
          'Invalid login or password. Please try again or reset your password.',
    },
    {
        type: 'Login',
        errorCode: 404,
        message:
          'We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
    },
    {
        type: 'Login',
        errorCode: 405,
        message:
          'You do not have access to this application. Please add your GitHub username for access.',
    },
    {
        type: 'Login',
        errorCode: 413,
        message: 'Your account has been locked.',
    },
];

export default messages;