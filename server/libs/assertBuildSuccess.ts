function assertBuildSuccess(result: Awaited<ReturnType<typeof Bun.build>>, message: string): void {
    if (result.success) {
        return;
    }

    for (const log of result.logs) {
        console.error(log);
    }

    throw new Error(message);
}

export default assertBuildSuccess;
