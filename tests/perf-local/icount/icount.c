// Runs a command and prints how many user-space CPU instructions it (and its children) executed.
// Temporary experiment helper: tells us whether CI runners expose hardware counters at all.
#define _GNU_SOURCE
#include <errno.h>
#include <linux/perf_event.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <sys/syscall.h>
#include <sys/wait.h>
#include <unistd.h>

int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "usage: icount <command> [args]\n");
        return 2;
    }
    int gate[2];
    if (pipe(gate) != 0) {
        perror("pipe");
        return 2;
    }
    pid_t pid = fork();
    if (pid < 0) {
        perror("fork");
        return 2;
    }
    if (pid == 0) {
        // Wait until the parent has attached the counter, so nothing runs uncounted.
        char byte;
        close(gate[1]);
        if (read(gate[0], &byte, 1) < 0) {
            _exit(126);
        }
        close(gate[0]);
        execvp(argv[1], argv + 1);
        perror("execvp");
        _exit(127);
    }
    close(gate[0]);

    struct perf_event_attr attr;
    memset(&attr, 0, sizeof(attr));
    attr.type = PERF_TYPE_HARDWARE;
    attr.size = sizeof(attr);
    attr.config = PERF_COUNT_HW_INSTRUCTIONS;
    attr.disabled = 1;
    attr.exclude_kernel = 1;
    attr.exclude_hv = 1;
    attr.inherit = 1;
    attr.enable_on_exec = 1;
    int fd = (int)syscall(SYS_perf_event_open, &attr, pid, -1, -1, 0);
    int openErrno = errno;

    if (write(gate[1], "x", 1) < 0) {
        perror("write");
    }
    close(gate[1]);
    int status = 0;
    waitpid(pid, &status, 0);

    uint64_t count = 0;
    if (fd < 0) {
        fprintf(stderr, "icount unsupported: %s\n", strerror(openErrno));
    } else if (read(fd, &count, sizeof(count)) != (ssize_t)sizeof(count)) {
        fprintf(stderr, "icount unsupported: read failed\n");
    } else {
        fprintf(stderr, "icount instructions:u %llu\n", (unsigned long long)count);
    }
    return WIFEXITED(status) ? WEXITSTATUS(status) : 1;
}
