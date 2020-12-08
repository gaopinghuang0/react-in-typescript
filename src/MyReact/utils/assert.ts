// Lightweight replacement for invariant/node assert

export function assert(condition: any, message?: string) {
    if (!condition) {
        throw new Error(message || 'assertion failure');
    }
}
