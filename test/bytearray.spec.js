var ByteArray = require('../lib/bytearray');

describe('ByteArray', function () {
	var byteArray = new ByteArray();

	it('should be init', function () {
		expect(byteArray.length).toEqual(0);
		expect(byteArray.position).toEqual(0);
		expect(byteArray.sharebable).toEqual(false);
		expect(byteArray.endian).toEqual(0);
		expect(byteArray.objectEncoding).toEqual(-1);
	});
	
	it('should read/write boolean', function () {
		byteArray.writeBoolean(true);
		expect(byteArray.readBoolean()).toEqual(true);
	});
	
	it('should read/write UTFBytes', function () {
		byteArray.writeUTFBytes('Hello word');
		expect(byteArray.readUTFBytes()).toEqual('Hello word');
	});
	
	it('should read/write UTF', function () {
		byteArray.writeUTF('Hello bytearray');
		expect(byteArray.readUTF()).toEqual('Hello bytearray');
	});
	
	it('should read/write UnsignedShort', function () {
		byteArray.writeUnsignedInt(4);
		expect(byteArray.readUnsignedShort()).toEqual(4);
	});
	
	it('should read/write UnsignedInt', function () {
		byteArray.writeUnsignedInt(47);
		expect(byteArray.readUnsignedInt()).toEqual(47);
	});
	
	it('should read/write UnsignedByte', function () {
		byteArray.writeUnsignedInt(6);
		expect(byteArray.readUnsignedByte()).toEqual(6);
	});
	
	it('should read/write Short', function () {
		byteArray.writeShort(1);
		expect(byteArray.readShort()).toEqual(1);
	});
	
	it('should read/write Int', function () {
		byteArray.writeInt(19);
		expect(byteArray.readInt()).toEqual(19);
	});
	
	it('should read/write Float', function () {
		byteArray.writeFloat(2.69854);
		expect(byteArray.readFloat()).toEqual(2.69854);
	});
	
	it('should read/write Double', function () {
		byteArray.writeDouble(2.2);
		expect(byteArray.readDouble()).toEqual(2.2);
	});
	
	it('should read/write Byte', function () {
		byteArray.writeByte(2);
		expect(byteArray.readByte()).toEqual(2);
	});
	
	it('should be YOPPP', function () {
		expect(new ByteArray(new Buffer('YOPPP')).toString()).toEqual('YOPPP');
	});
	
	it('should compress/decompress', function () {
		var length = byteArray.length;
		byteArray.compress();
		expect(byteArray.length).toBeLessThan(length);
		byteArray.uncompress();
		expect(byteArray.length).toEqual(length);
	});

	//byteArray.writeBytes(true);
	//byteArray.writeMultiByte(true);
	//byteArray.writeObject(true);
	//expect(byteArray.readBytes()).toEqual(true);
	//expect(byteArray.readMultiByte()).toEqual(true);
	//expect(byteArray.readObject()).toEqual(true);

	
});