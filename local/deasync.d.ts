declare module 'deasync' {
    export function loopWhile(cb: () => boolean): void;
    export function sleep(ms: number): void;
}
