const errorMessages = [
    {
        errorCode: 401,
        errorMessage: 'Incorrect login or password. Please try again.',
    },
    {
        errorCode: 402,
        errorMessage:
          'You have 2FA enabled on this account. Please sign in using your email or phone number.',
    },
    {
        errorCode: 403,
        errorMessage:
          'Invalid login or password. Please try again or reset your password.',
    },
    {
        errorCode: 404,
        errorMessage:
          'We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
    },
    {
        errorCode: 405,
        errorMessage:
          'You do not have access to this application. Please add your GitHub username for access.',
    },
    {
        errorCode: 413,
        errorMessage: 'Your account has been locked.',
    },
];
export default errorMessages;
