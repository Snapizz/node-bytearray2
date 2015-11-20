/// <reference path="../typings/node/node.d.ts" />

import Endian = require('./endian');
import CompressionAlgorith = require('./compression-algorithm');

class ByteArray {
	private static BUFFER_SIZE: number = 1024;

	endian: Endian;
	objectEncoding: number;
	shareable: boolean;
	buffer: Buffer;

	constructor(buffer?: Buffer | ByteArray) {
		if (buffer instanceof ByteArray) {
			this.buffer = buffer.buffer;
		} else if (buffer instanceof Buffer) {
			this.buffer = buffer;
		} else {
			this.buffer = new Buffer(ByteArray.BUFFER_SIZE);
		}
		this.shareable = false;
		this.endian = Endian.Big;
		this.objectEncoding = -1;
	}

	public get bytesAvailable(): number {
		throw new Error('ByteArray.getBytesAvailable Not implemented');
	}

	public get position(): number {
		throw new Error('ByteArray.getPosition Not implemented');
	}

	public set position(value: number) {
		throw new Error('ByteArray.setPosition Not implemented');
	}

	public get length(): number {
		throw new Error('ByteArray.getLength Not implemented');
	}
	public set length(value: number) {
		throw new Error('ByteArray.setLength Not implemented');
	}

	/**
	 * In a single atomic operation,
	 * compares an number value in this byte array with another number value and,
	 * if they match, swaps those bytes with another value.
	 */
	public atomicCompareAndSwapIntAt(byteIndex: number, expectedValue: number, newValue: number): number {
		throw new Error('ByteArray.atomicCompareAndSwapIntAt Not implemented');
	}

	/**
	 * In a single atomic operation,
	 * compares this byte array's length with a provided value and,
	 * if they match, changes the length of this byte array.
	 */
	public atomicCompareAndSwapLength(expectedLength: number, newLength: number): number {
		throw new Error('ByteArray.atomicCompareAndSwapLength Not implemented');
	}

	/**
	 * Clears the contents of the byte array and resets the length and position properties to 0.
	 * Calling this method explicitly frees up the memory used by the ByteArray instance. 
	 */
	public clear(): void {
		throw new Error('ByteArray.clear Not implemented');
	}

	/**
	 * Compresses the byte array. The entire byte array is compressed.
	 * After the call, the length property of the ByteArray is set to the new length.
	 * The position property is set to the end of the byte array. 
	 */
	public compress(algorithm: CompressionAlgorith = CompressionAlgorith.Zlib): void {
		throw new Error('ByteArray.compress Not implemented');
	}

	/**
	 * Compresses the byte array using the deflate compression algorithm. The entire byte array is compressed.
	 */
	public deflate(): void {
		throw new Error('ByteArray.deflate Not implemented');
	}

	/**
	 * Decompresses the byte array using the deflate compression algorithm.
	 * The byte array must have been compressed using the same algorithm.
	 */
	public inflate(): void {
		throw new Error('ByteArray.inflate Not implemented');
	}

	/**
	 * Reads a Boolean value from the byte stream. A single byte is read, and true is returned if the byte is nonzero, false otherwise.
	 */
	public readBoolean(): boolean {
		throw new Error('ByteArray.readBoolean Not implemented');
	}

	/**
	 * Reads a signed byte from the byte stream.
	 */
	public readByte(): number {
		throw new Error('ByteArray.readByte Not implemented');
	}

	/**
	 * Reads the number of data bytes, specified by the length parameter, from the byte stream.
	 * The bytes are read into the ByteArray object specified by the bytes parameter,
	 * and the bytes are written into the destination ByteArray starting at the position specified by offset.
	 */
	public readBytes(bytes: ByteArray | Buffer, offset: number = 0, length: number = 0): void {
		throw new Error('ByteArray.readBytes Not implemented');
	}

	/**
	 * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
	 */
	public readDouble(): number {
		throw new Error('ByteArray.readDouble Not implemented');
	}

	/**
	 * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
	 */
	public readFloat(): number {
		throw new Error('ByteArray.readFloat Not implemented');
	}

	/**
	 * Reads a signed 32-bit integer from the byte stream.
	 */
	public readInt(): number {
		throw new Error('ByteArray.readInt Not implemented');
	}

	/**
	 * Reads a multibyte string of specified length from the byte stream using the specified character set.
	 */
	public readMultiByte(length: number, charSet: string): string {
		throw new Error('ByteArray.readMultiByte Not implemented');
	}

	/**
	 * Reads an object from the byte array, encoded in AMF serialized format.
	 */
	public readObject(): any {
		throw new Error('ByteArray.readObject Not implemented');
	}

	/**
	 * Reads a signed 16-bit integer from the byte stream.
	 */
	public readShort(): number {
		throw new Error('ByteArray.readShort Not implemented');
	}

	/**
	 * Reads an unsigned byte from the byte stream.
	 */
	public readUnsignedByte(): number {
		throw new Error('ByteArray.readUnsignedByte Not implemented');
	}

	/**
	 * Reads an unsigned 32-bit integer from the byte stream.
	 */
	public readUnsignedInt(): number {
		throw new Error('ByteArray.readUnsignedInt Not implemented');
	}

	/**
	 * Reads an unsigned 16-bit integer from the byte stream
	 */
	public readUnsignedShort(): number {
		throw new Error('ByteArray.readUnsignedShort Not implemented');
	}

	/**
	 * Reads a UTF-8 string from the byte stream.
	 * The string is assumed to be prefixed with an unsigned short indicating the length in bytes.
	 */
	public readUTF(): string {
		throw new Error('ByteArray.readUTF Not implemented');
	}

	/**
	 * Reads a sequence of UTF-8 bytes specified by the length parameter from the byte stream and returns a string.
	 */
	public readUTFBytes(length: number): string {
		throw new Error('ByteArray.readUTFBytes Not implemented');
	}

	/**
	 * Provides an overridable method for customizing the JSON encoding of values in an ByteArray object.
	 */
	public toJSON(k: string): JSON {
		throw new Error('ByteArray.toJSON Not implemented');
	}

	/**
	 * Converts the byte array to a string.
	 * If the data in the array begins with a Unicode byte order mark, the application will honor that mark when converting to a string.
	 * If System.useCodePage is set to true,
	 * the application will treat the data in the array as being in the current system code page when converting.
	 */
	public toString(): string {
		throw new Error('ByteArray.toString Not implemented');
	}

	/**
	 * Decompresses the byte array. After the call,
	 * the length property of the ByteArray is set to the new length. The position property is set to 0.
	 */
	public uncompress(algorithm: CompressionAlgorith = CompressionAlgorith.Zlib): void {
		throw new Error('ByteArray.uncompress Not implemented');
	}

	/**
	 * Writes a Boolean value.
	 */
	public writeBoolean(value: boolean): void {
		throw new Error('ByteArray.writeBoolean Not implemented');
	}

	/**
	 * Writes a byte to the byte stream.
	 */
	public writeByte(value: number): void {
		throw new Error('ByteArray.writeByte Not implemented');
	}

	/**
	 * Writes a sequence of length bytes from the specified byte array, bytes,
	 * starting offset(zero-based index) bytes into the byte stream.
	 */
	public writeBytes(bytes: ByteArray | Buffer, offset: number = 0, length: number = 0): void {
		throw new Error('ByteArray.writeBytes Not implemented');
	}

	/**
	 * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
	 */
	public writeDouble(value: number): void {
		throw new Error('ByteArray.writeDouble Not implemented');
	}

	/**
	 * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
	 */
	public writeFloat(value: number): void {
		throw new Error('ByteArray.writeFloat Not implemented');
	}

	/**
	 * Writes a 32-bit signed integer to the byte stream.
	 */
	public writeInt(value: number): void {
		throw new Error('ByteArray.writeInt Not implemented');
	}

	/**
	 * Writes a multibyte string to the byte stream using the specified character set.
	 */
	public writeMultiByte(value: string, charSet: string): void {
		throw new Error('ByteArray.writeMultiByte Not implemented');
	}

	/**
	 * Writes an object into the byte array in AMF serialized format.
	 */
	public writeObject(object: any): void {
		throw new Error('ByteArray.writeObject Not implemented');
	}

	/**
	 * Writes a 16-bit integer to the byte stream.
	 */
	public writeShort(value: number): void {
		throw new Error('ByteArray.writeShort Not implemented');
	}

	/**
	 * Writes a 32-bit unsigned integer to the byte stream.
	 */
	public writeUnsignedInt(value: number): void {
		throw new Error('ByteArray.writeUnsignedInt Not implemented');
	}

	/**
	 * Writes a UTF-8 string to the byte stream.
	 */
	public writeUTF(value: string): void {
		throw new Error('ByteArray.writeUTF Not implemented');
	}

	/**
	 * Writes a UTF-8 string to the byte stream.
	 */
	public writeUTFBytes(value: string): void {
		throw new Error('ByteArray.writeUTFBytes Not implemented');
	}
}

export = ByteArray;
