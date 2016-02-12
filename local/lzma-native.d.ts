declare module 'lzma-native' {
    module M {
        export function LZMA(): ILzma;
        export interface ILzma {
            compress(str: string | Buffer, mode: number, cb: (result?: Buffer) => void): void;
            decompress(str: string | Buffer, cb: (result?: Buffer) => void): void;
        }
    }

    export = M;
}
