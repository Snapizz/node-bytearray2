import assert from 'assert';
import ByteArray from './bytearray';

describe('node-bytearray-2', function () {
  var byteArray = new ByteArray();

	byteArray.writeBoolean(true);
	byteArray.writeUnsignedShort(4);
	byteArray.writeUnsignedInt(47);
	byteArray.writeUnsignedByte(6);
	byteArray.writeUnsignedByte(68);
	byteArray.writeUnsignedByte(89);
	byteArray.writeShort(1);
	byteArray.writeShort(100);
	byteArray.writeShort(56);
	byteArray.writeInt(19);
	byteArray.writeFloat(2.69854);
	byteArray.writeDouble(2.2);
	byteArray.writeByte(2);
	byteArray.writeUTFBytes('Hello word');
	byteArray.writeUTFBytes('Hello word2');
	byteArray.writeUTFBytes('Hello word3');
	byteArray.writeUTF('Hello word');
	byteArray.writeUTF('Hello word2');
	byteArray.writeUTF('Hello word3');
	byteArray.writeBytes(ByteArray.fromArray([1,21,48,17]));
	byteArray.writeMultiByte('YOPPP', 'ascii');
	byteArray.writeObject({ id: 1, name: 'uop' });
	byteArray.resize();
	byteArray = new ByteArray(byteArray);

	it('should be init', function () {
		assert(byteArray.length).toEqual(1024);
		assert(byteArray.position).toEqual(0);
		assert(byteArray.bytesAvailable).toEqual(1024);
		assert(byteArray.shareable).toEqual(false);
		assert(byteArray.endian).toEqual(0);
		assert(byteArray.objectEncoding).toEqual(-1);
	});

	it('should read/write boolean', function () {
		assert(byteArray.readBoolean()).toEqual(true);
	});

	it('should read/write UnsignedShort', function () {
		assert(byteArray.readUnsignedShort()).toEqual(4);
	});

	it('should read/write UnsignedInt', function () {
		assert(byteArray.readUnsignedInt()).toEqual(47);
	});

	it('should read/write UnsignedByte', function () {
		assert(byteArray.readUnsignedByte()).toEqual(6);
		assert(byteArray.readUnsignedByte()).toEqual(68);
		assert(byteArray.readUnsignedByte()).toEqual(89);
	});

	it('should read/write Short', function () {
		assert(byteArray.readShort()).toEqual(1);
		assert(byteArray.readShort()).toEqual(100);
		assert(byteArray.readShort()).toEqual(56);
	});

	it('should read/write Int', function () {
		assert(byteArray.readInt()).toEqual(19);
	});

	it('should read/write Float', function () {
		assert(Number(byteArray.readFloat().toFixed(5))).toEqual(2.69854);
	});

	it('should read/write Double', function () {
		assert(byteArray.readDouble()).toEqual(2.2);
	});

	it('should read/write Byte', function () {
		assert(byteArray.readByte()).toEqual(2);
	});

	it('should read/write UTFBytes', function () {
		assert(byteArray.readUTFBytes(10)).toEqual('Hello word');
		assert(byteArray.readUTFBytes(11)).toEqual('Hello word2');
		assert(byteArray.readUTFBytes(11)).toEqual('Hello word3');
	});

	it('should read/write UTF', function () {
		assert(byteArray.readUTF()).toEqual('Hello word');
		assert(byteArray.readUTF()).toEqual('Hello word2');
		assert(byteArray.readUTF()).toEqual('Hello word3');
	});

	it('should read/write Bytes', function () {
		var b = new ByteArray();
		byteArray.readBytes(b, 0, 4);
		b.position = 0;
		assert(b.readByte()).toEqual(1);
		assert(b.readByte()).toEqual(21);
		assert(b.readByte()).toEqual(48);
		assert(b.readByte()).toEqual(17);
	});

	it('should read/write MultiBytes', function () {
		assert(byteArray.readMultiByte(5, 'ascii')).toEqual('YOPPP');
	});
	
	it('should read/write Object', function () {
		assert(byteArray.readObject()).toEqual({ id: 1, name: 'uop' });
	});

	it('should compress/decompress', function () {
		var length = byteArray.length;
		byteArray.compress();
		assert(byteArray.length).toBeLessThan(length);
		byteArray.uncompress();
		assert(byteArray.length).toEqual(length);
		byteArray.position = 0;
		assert(byteArray.readBoolean()).toEqual(true);
		byteArray.compress(2);
		assert(byteArray.length).toBeLessThan(length);
		byteArray.uncompress(2);
		assert(byteArray.length).toEqual(length);
		byteArray.position = 0;
		assert(byteArray.readBoolean()).toEqual(true);
	});

	it('should change length', function () {
		byteArray.atomicCompareAndSwapLength(1024, 512);
		assert(byteArray.length).toEqual(512);
		byteArray.atomicCompareAndSwapLength(1023, 1024);
		assert(byteArray.length).toEqual(512);
		byteArray.atomicCompareAndSwapLength(512, 2048);
		assert(byteArray.length).toEqual(2048);
	});
	it('should length to be 32', function () {
		assert((new ByteArray(32)).length).toEqual(32);
	});
	it('should be resized', function () {
		byteArray = new ByteArray();
		byteArray.writeUTFBytes('yopm');
		assert(byteArray.length).toEqual(1024);
		byteArray.resize();
		assert(byteArray.length).toEqual(4);
		assert(byteArray.toArray().length).toEqual(4);
		assert((ByteArray.fromArray(byteArray.toArray())).toString()).toEqual('yopm');
		byteArray.resize(2);
		assert(byteArray.position).toEqual(2);
		
	});
});
