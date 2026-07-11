/*
 * Writes pre-formatted log lines directly to rsyslog over the systemd-journald AF_UNIX SOCK_DGRAM
 * socket, the same way Web-Expensify's Log.php (_writeRsyslog) and Bedrock's libstuff.cpp
 * (SSyslogSocketDirect) do. Bun has no built-in AF_UNIX SOCK_DGRAM client (Bun.connect only
 * supports SOCK_STREAM for unix sockets), so libc's socket/sendto/close are called directly via
 * bun:ffi.
 *
 * Falls back to writing the line to stderr whenever the socket can't be created or a send fails,
 * which is expected on a dev laptop, in CI without the syslog socket mounted, or on macOS (no
 * journald).
 */
import {dlopen, suffix} from 'bun:ffi';

const DEFAULT_SOCKET_PATH = '/run/systemd/journal/syslog';
const AF_UNIX = 1;
const SOCK_DGRAM = 2;

// Linux struct sockaddr_un: a 2-byte sa_family_t followed by a 108-byte sun_path.
const SUN_PATH_MAX = 108;

// Read lazily (rather than caching at module load) so tests can force the stderr fallback by
// setting VCR_LOG_DESTINATION before calling writeRsyslog, even though `bun:test` always finishes
// evaluating this module's imports before the test file's own top-level statements run.
function shouldForceStderr(): boolean {
    return process.env.VCR_LOG_DESTINATION === 'stderr';
}

function getSocketPath(): string {
    return process.env.RSYSLOG_SOCKET_PATH ?? DEFAULT_SOCKET_PATH;
}

function loadLibc() {
    // libc.so.6 is the real runtime library on Linux ("libc.so" is normally only present via -dev
    // packages); libc.dylib is a symlink to libSystem on macOS, so `libc.${suffix}` is fine there.
    const libcPath = process.platform === 'linux' ? 'libc.so.6' : `libc.${suffix}`;

    return dlopen(libcPath, {
        socket: {args: ['i32', 'i32', 'i32'], returns: 'i32'},
        // sendto/close actually return ssize_t/int, but every value we ever see (message length,
        // or -1 on error) fits in 32 bits, so declaring an i32 return avoids bigint handling while
        // still reading back the correct value (sign-extension of -1 truncates identically).
        sendto: {args: ['i32', 'ptr', 'u64', 'i32', 'ptr', 'u32'], returns: 'i32'},
        close: {args: ['i32'], returns: 'i32'},
    });
}

type Libc = ReturnType<typeof loadLibc>;

let libc: Libc | undefined;
let socketFd = -1;
let sockaddr: Uint8Array | undefined;

function buildSockaddrUn(path: string): Uint8Array {
    const pathBytes = Buffer.from(path, 'utf8');

    if (pathBytes.length >= SUN_PATH_MAX) {
        throw new Error(`Rsyslog socket path is too long for sockaddr_un: ${path}`);
    }

    const addr = new Uint8Array(2 + SUN_PATH_MAX);
    addr[0] = AF_UNIX;
    addr.set(pathBytes, 2);
    return addr;
}

function ensureSocket(): boolean {
    if (socketFd !== -1) {
        return true;
    }

    libc ??= loadLibc();
    const fd = libc.symbols.socket(AF_UNIX, SOCK_DGRAM, 0);

    if (fd < 0) {
        return false;
    }

    socketFd = fd;
    sockaddr = buildSockaddrUn(getSocketPath());
    return true;
}

function writeStderrFallback(line: string): void {
    process.stderr.write(`${line}\n`);
}

/**
 * Sends a single, already-formatted log line to rsyslog. Returns whether the socket send
 * succeeded; on failure (or when `VCR_LOG_DESTINATION=stderr` is set) the line is written to
 * stderr instead.
 */
function writeRsyslog(line: string): boolean {
    if (shouldForceStderr() || !ensureSocket() || !sockaddr || !libc) {
        writeStderrFallback(line);
        return false;
    }

    const message = Buffer.from(line, 'utf8');
    const bytesSent = libc.symbols.sendto(socketFd, message, message.length, 0, sockaddr, sockaddr.length);

    if (bytesSent < 0) {
        libc.symbols.close(socketFd);
        socketFd = -1;
        writeStderrFallback(line);
        return false;
    }

    return true;
}

export default writeRsyslog;
