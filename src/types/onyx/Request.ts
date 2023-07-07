type Request = {
    command?: string;
    data?: Record<string, unknown>;
    type?: string;
    shouldUseSecure?: boolean;
};

export default Request;
