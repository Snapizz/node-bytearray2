/// <reference path="../node/node.d.ts" />

declare module 'node-lzma' {
	module lzma {
		export function compress(buff: Buffer);
		export function decompress(buff: Buffer);
	}
}