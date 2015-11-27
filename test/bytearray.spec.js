var ByteArray = require('../lib/bytearray');

describe('ByteArray', function () {
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
	var loc = new ByteArray();
	loc.writeByte(1);
	loc.writeByte(21);
	loc.writeByte(48);
	loc.writeByte(17);
	byteArray.writeBytes(loc);
	byteArray.writeMultiByte('YOPPP', 'ascii');
	byteArray.writeObject({ id: 1, name: 'uop' });
	byteArray = new ByteArray(byteArray);

	it('should be init', function () {
		expect(byteArray.length).toEqual(1024);
		expect(byteArray.position).toEqual(0);
		expect(byteArray.bytesAvailable).toEqual(1024);
		expect(byteArray.shareable).toEqual(false);
		expect(byteArray.endian).toEqual(0);
		expect(byteArray.objectEncoding).toEqual(-1);
	});

	it('should read/write boolean', function () {
		expect(byteArray.readBoolean()).toEqual(true);
	});

	it('should read/write UnsignedShort', function () {
		expect(byteArray.readUnsignedShort()).toEqual(4);
	});

	it('should read/write UnsignedInt', function () {
		expect(byteArray.readUnsignedInt()).toEqual(47);
	});

	it('should read/write UnsignedByte', function () {
		expect(byteArray.readUnsignedByte()).toEqual(6);
		expect(byteArray.readUnsignedByte()).toEqual(68);
		expect(byteArray.readUnsignedByte()).toEqual(89);
	});

	it('should read/write Short', function () {
		expect(byteArray.readShort()).toEqual(1);
		expect(byteArray.readShort()).toEqual(100);
		expect(byteArray.readShort()).toEqual(56);
	});

	it('should read/write Int', function () {
		expect(byteArray.readInt()).toEqual(19);
	});

	it('should read/write Float', function () {
		expect(Number(byteArray.readFloat().toFixed(5))).toEqual(2.69854);
	});

	it('should read/write Double', function () {
		expect(byteArray.readDouble()).toEqual(2.2);
	});

	it('should read/write Byte', function () {
		expect(byteArray.readByte()).toEqual(2);
	});

	it('should read/write UTFBytes', function () {
		expect(byteArray.readUTFBytes(10)).toEqual('Hello word');
		expect(byteArray.readUTFBytes(11)).toEqual('Hello word2');
		expect(byteArray.readUTFBytes(11)).toEqual('Hello word3');
	});

	it('should read/write UTF', function () {
		expect(byteArray.readUTF()).toEqual('Hello word');
		expect(byteArray.readUTF()).toEqual('Hello word2');
		expect(byteArray.readUTF()).toEqual('Hello word3');
	});

	it('should read/write Bytes', function () {
		var b = new ByteArray();
		byteArray.readBytes(b, 0, 4);
		b.position = 0;
		expect(b.readByte()).toEqual(1);
		expect(b.readByte()).toEqual(21);
		expect(b.readByte()).toEqual(48);
		expect(b.readByte()).toEqual(17);
	});

	it('should read/write MultiBytes', function () {
		expect(byteArray.readMultiByte(5, 'ascii')).toEqual('YOPPP');
	});
	
	it('should read/write Object', function () {
		expect(byteArray.readObject()).toEqual({ id: 1, name: 'uop' });
	});

	it('should compress/decompress', function () {
		var length = byteArray.length;
		byteArray.compress();
		expect(byteArray.length).toBeLessThan(length);
		byteArray.uncompress();
		expect(byteArray.length).toEqual(length);
		byteArray.position = 0;
		expect(byteArray.readBoolean()).toEqual(true);
		byteArray.compress(2);
		expect(byteArray.length).toBeLessThan(length);
		byteArray.uncompress(2);
		expect(byteArray.length).toEqual(length);
		byteArray.position = 0;
		expect(byteArray.readBoolean()).toEqual(true);
	});

	it('should change length', function () {
		byteArray.atomicCompareAndSwapLength(1024, 512);
		expect(byteArray.length).toEqual(512);
		byteArray.atomicCompareAndSwapLength(1023, 1024);
		expect(byteArray.length).toEqual(512);
		byteArray.atomicCompareAndSwapLength(512, 2048);
		expect(byteArray.length).toEqual(2048);
	})
	it('should length to be 32', function () {
		expect((new ByteArray(32)).length).toEqual(32);
	})
});