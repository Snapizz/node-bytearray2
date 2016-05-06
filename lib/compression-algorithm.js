var CompressionAlgorithm;
(function (CompressionAlgorithm) {
    CompressionAlgorithm[CompressionAlgorithm["Deflate"] = 0] = "Deflate";
    CompressionAlgorithm[CompressionAlgorithm["Lzma"] = 1] = "Lzma";
    CompressionAlgorithm[CompressionAlgorithm["Zlib"] = 2] = "Zlib";
})(CompressionAlgorithm || (CompressionAlgorithm = {}));
export default CompressionAlgorithm;
