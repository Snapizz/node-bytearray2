/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/node-lzma/node-lzma.d.ts" />

import Endian = require('./endian');
import CompressionAlgorith = require('./compression-algorithm');
import zlib = require('zlib');
import lzmalib = require('node-lzma');
import Amf = require('./amf');

class ByteArray {
	private static BUFFER_SIZE: number = 1024;

	endian: Endian;
	objectEncoding: number;
	position: number;
	shareable: boolean;
	buffer: Buffer;

	constructor(buffer?: ByteArray, size: number = ByteArray.BUFFER_SIZE) {
		this.buffer = buffer ? buffer.buffer : new Buffer(size);
		this.shareable = false;
		this.endian = Endian.Big;
		this.objectEncoding = -1;
		this.position = 0;
	}

	public get bytesAvailable(): number {
		return this.length - this.position;
	}

	public get length(): number {
		return this.buffer.length;
	}
	public set length(value: number) {
		this.buffer.length = length;
	}

	/**
	 * In a single atomic operation,
	 * compares an number value in this byte array with another number value and,
	 * if they match, swaps those bytes with another value.
	 */
	public atomicCompareAndSwapIntAt(byteIndex: number, expectedValue: number, newValue: number): number {
		let byte = this.buffer[byteIndex];
		if (byte === expectedValue) {
			this.buffer[byteIndex] = newValue;
		}
		return byte;
	}

	/**
	 * In a single atomic operation,
	 * compares this byte array's length with a provided value and,
	 * if they match, changes the length of this byte array.
	 */
	public atomicCompareAndSwapLength(expectedLength: number, newLength: number): number {
		let prevLength = this.length;
		if (prevLength !== expectedLength) {
			return prevLength;
		}
		if (prevLength < newLength) {
			this.buffer = Buffer.concat([this.buffer, new Buffer(newLength - prevLength)], newLength);
		}
		if (prevLength > newLength) {
			this.buffer = this.buffer.slice(newLength - 1, prevLength - 1);
		}
		this.buffer.length = newLength;
		return prevLength;
	}

	/**
	 * Clears the contents of the byte array and resets the length and position properties to 0.
	 * Calling this method explicitly frees up the memory used by the ByteArray instance. 
	 */
	public clear(): void {
		this.buffer = new Buffer(this.buffer.length);
	}

	/**
	 * Compresses the byte array. The entire byte array is compressed.
	 * After the call, the length property of the ByteArray is set to the new length.
	 * The position property is set to the end of the byte array. 
	 */
	public compress(algorithm: CompressionAlgorith = CompressionAlgorith.Zlib): void {
		switch (algorithm) {
			case CompressionAlgorith.Deflate:
				this.buffer = zlib.deflateRawSync(this.buffer);
				break;
			case CompressionAlgorith.Zlib:
				this.buffer = zlib.deflateSync(this.buffer);
				break;
			case CompressionAlgorith.Lzma:
				this.buffer = lzmalib.lzma.compress(this.buffer);
				break;
		}
	}

	/**
	 * Compresses the byte array using the deflate compression algorithm. The entire byte array is compressed.
	 */
	public deflate(): void {
		this.compress(CompressionAlgorith.Deflate);
	}

	/**
	 * Decompresses the byte array using the deflate compression algorithm.
	 * The byte array must have been compressed using the same algorithm.
	 */
	public inflate(): void {
		this.uncompress(CompressionAlgorith.Deflate);
	}

	/**
	 * Reads a Boolean value from the byte stream. A single byte is read, and true is returned if the byte is nonzero, false otherwise.
	 */
	public readBoolean(): boolean {
		return Boolean(this.buffer.readInt8(this.updatePosition(1)));
	}

	/**
	 * Reads a signed byte from the byte stream.
	 */
	public readByte(): number {
		return this.buffer.readInt8(this.updatePosition(1));
	}

	/**
	 * Reads the number of data bytes, specified by the length parameter, from the byte stream.
	 * The bytes are read into the ByteArray object specified by the bytes parameter,
	 * and the bytes are written into the destination ByteArray starting at the position specified by offset.
	 */
	public readBytes(bytes: ByteArray, offset: number = 0, length?: number): void {
		length = length || this.readShort();
		for (var i = offset; i < length && bytes.bytesAvailable > 0; i++) {
			bytes.writeByte(this.readByte());
		}
	}

	/**
	 * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
	 */
	public readDouble(): number {
		let position = this.updatePosition(8);
		return this.endian === Endian.Big
			? this.buffer.readDoubleBE(position)
			: this.buffer.readDoubleBE(position);
	}

	/**
	 * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
	 */
	public readFloat(): number {
		let position = this.updatePosition(4);
		return this.endian === Endian.Big
			? this.buffer.readFloatBE(position)
			: this.buffer.readFloatBE(position);
	}

	/**
	 * Reads a signed 32-bit integer from the byte stream.
	 */
	public readInt(): number {
		let position = this.updatePosition(4);
		return this.endian === Endian.Big
			? this.buffer.readInt32BE(position)
			: this.buffer.readInt32LE(position);
	}

	/**
	 * Reads a multibyte string of specified length from the byte stream using the specified character set.
	 */
	public readMultiByte(length: number, charSet?: string): string {
		let position = this.updatePosition(length);
		return this.buffer.toString(charSet || 'utf8', position, position + length);
	}

	/**
	 * Reads an object from the byte array, encoded in AMF serialized format.
	 */
	public readObject(): any {
		return Amf.read(this.buffer, this.updatePosition(this.readInt()));
	}

	/**
	 * Reads a signed 16-bit integer from the byte stream.
	 */
	public readShort(): number {
		let position = this.updatePosition(2);
		return this.endian === Endian.Big
			? this.buffer.readInt16BE(position)
			: this.buffer.readInt16LE(position);
	}

	/**
	 * Reads an unsigned byte from the byte stream.
	 */
	public readUnsignedByte(): number {
		return this.buffer.readUInt8(this.updatePosition(1));
	}

	/**
	 * Reads an unsigned 32-bit integer from the byte stream.
	 */
	public readUnsignedInt(): number {
		let position = this.updatePosition(4);
		return this.endian === Endian.Big
			? this.buffer.readUInt32BE(position)
			: this.buffer.readUInt32LE(position);
	}

	/**
	 * Reads an unsigned 16-bit integer from the byte stream
	 */
	public readUnsignedShort(): number {
		let position = this.updatePosition(2);
		return this.endian === Endian.Big
			? this.buffer.readUInt16BE(position)
			: this.buffer.readUInt16LE(position);
	}

	/**
	 * Reads a UTF-8 string from the byte stream.
	 * The string is assumed to be prefixed with an unsigned short indicating the length in bytes.
	 */
	public readUTF(): string {
		let len = this.readShort();
		let position = this.updatePosition(len);
		return this.buffer.toString('utf8', position, position + len);
	}

	/**
	 * Reads a sequence of UTF-8 bytes specified by the length parameter from the byte stream and returns a string.
	 */
	public readUTFBytes(length: number): string {
		return this.readMultiByte(length);
	}

	/**
	 * Provides an overridable method for customizing the JSON encoding of values in an ByteArray object.
	 */
	public toJSON(k: string): any {
		return this.buffer.toJSON();
	}

	/**
	 * Converts the byte array to a string.
	 * If the data in the array begins with a Unicode byte order mark, the application will honor that mark when converting to a string.
	 * If System.useCodePage is set to true,
	 * the application will treat the data in the array as being in the current system code page when converting.
	 */
	public toString(encoding?: string, offset?: number, length?: number): string {
		return this.buffer.toString(encoding || 'utf8', offset || 0, length || this.length);
	}

	/**
	 * Decompresses the byte array. After the call,
	 * the length property of the ByteArray is set to the new length. The position property is set to 0.
	 */
	public uncompress(algorithm: CompressionAlgorith = CompressionAlgorith.Zlib): void {
		switch (algorithm) {
			case CompressionAlgorith.Deflate:
				this.buffer = zlib.inflateRawSync(this.buffer);
				break;
			case CompressionAlgorith.Zlib:
				this.buffer = zlib.inflateSync(this.buffer);
				break;
			case CompressionAlgorith.Lzma:
				this.buffer = lzmalib.lzma.decompress(this.buffer);
				break;
		}
	}

	/**
	 * Writes a Boolean value.
	 */
	public writeBoolean(value: boolean): number {
		return this.buffer.writeInt8(Number(value), this.updatePosition(1));
	}

	/**
	 * Writes a byte to the byte stream.
	 */
	public writeByte(value: number): number {
		return this.buffer.writeInt8(value, this.updatePosition(1));
	}

	/**
	 * Writes a sequence of length bytes from the specified byte array, bytes,
	 * starting offset(zero-based index) bytes into the byte stream.
	 */
	public writeBytes(bytes: ByteArray, offset: number = 0, length?: number): void {
        length = length || bytes.position;
		bytes.position = 0;
		this.writeShort(length);
		for (var i = offset; i < length && this.bytesAvailable > 0; i++) {
			this.writeByte(bytes.readByte());
		}
	}

	/**
	 * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
	 */
	public writeDouble(value: number): number {
		let position = this.updatePosition(8);
		return this.endian === Endian.Big
			? this.buffer.writeDoubleBE(value, position)
			: this.buffer.writeDoubleBE(value, position);
	}

	/**
	 * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
	 */
	public writeFloat(value: number): number {
		let position = this.updatePosition(4);
		return this.endian === Endian.Big
			? this.buffer.writeFloatBE(value, position)
			: this.buffer.writeFloatBE(value, position);
	}

	/**
	 * Writes a 32-bit signed integer to the byte stream.
	 */
	public writeInt(value: number): number {
		let position = this.updatePosition(4);
		return this.endian === Endian.Big
			? this.buffer.writeInt32BE(value, position)
			: this.buffer.writeInt32LE(value, position);
	}

	/**
	 * Writes a multibyte string to the byte stream using the specified character set.
	 */
	public writeMultiByte(value: string, charSet?: string): number {
		let len = Buffer.byteLength(value);
		return this.buffer.write(value, this.updatePosition(len), len, charSet || 'utf8');
	}

	/**
	 * Writes an object into the byte array in AMF serialized format.
	 */
	public writeObject(object: any): void {
		let len = Buffer.byteLength(object);
		this.writeInt(len);
		Amf.write(this.buffer, object, this.updatePosition(len));
	}

	/**
	 * Writes a 16-bit integer to the byte stream.
	 */
	public writeShort(value: number): number {
		let position = this.updatePosition(2);
		return this.endian === Endian.Big
			? this.buffer.writeInt16BE(value, position)
			: this.buffer.writeInt16LE(value, position);
	}

	/**
	 * Writes a 32-bit unsigned integer to the byte stream.
	 */
	public writeUnsignedInt(value: number): number {
		let position = this.updatePosition(4);
		return this.endian === Endian.Big
			? this.buffer.writeUInt32BE(value, position)
			: this.buffer.writeUInt32LE(value, position);
	}

	/**
	 * Writes a 16-bit unsigned integer to the byte stream.
	 */
	public writeUnsignedShort(value: number): number {
		let position = this.updatePosition(2);
		return this.endian === Endian.Big
			? this.buffer.writeUInt16BE(value, position)
			: this.buffer.writeUInt16LE(value, position);
	}

	/**
	 * Writes a 8-bit unsigned integer to the byte stream.
	 */
	public writeUnsignedByte(value: number): number {
		return this.buffer.writeUInt8(Number(value), this.updatePosition(1));
	}

	/**
	 * Writes a UTF-8 string to the byte stream.
	 */
	public writeUTF(value: string): number {
		let len = Buffer.byteLength(value);
		this.writeShort(len);
		return this.buffer.write(value, this.updatePosition(len), len);
	}

	/**
	 * Writes a UTF-8 string to the byte stream.
	 */
	public writeUTFBytes(value: string): number {
		return this.writeMultiByte(value);
	}

	/**
	 * Update position with number after use it
	 */
	private updatePosition(n: number): number {
		let a = this.position;
		this.position += n;
		return a;
	}
}

export = ByteArray;
