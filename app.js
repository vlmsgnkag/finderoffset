const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

// Đường dẫn tới các tệp bạn đã tải lên
const ANOGS_FILE = '155';
const ANOGS2_FILE = '156';

app.post('/offset', (req, res) => {
    try {
        const data = req.body;
        const offset = data.offset;

        if (!offset) {
            return res.status(400).json({ message: "Offset không hợp lệ!" });
        }

        // Chuyển offset từ hex sang số nguyên
        const offset_int = parseInt(offset, 16);

        // Kiểm tra sự tồn tại của các tệp
        if (!fs.existsSync(ANOGS_FILE)) {
            return res.status(404).json({ message: "File v1.55 không tìm thấy!" });
        }
        if (!fs.existsSync(ANOGS2_FILE)) {
            return res.status(404).json({ message: "File v1.56 không tìm thấy!" });
        }

        // Đọc dữ liệu từ tệp 155
        const bytes_data = fs.readFileSync(ANOGS_FILE);
        const byte_str = Array.from(bytes_data.slice(offset_int, offset_int + 30))
            .map(byte => byte.toString(16).padStart(2, '0')).join(' ');

        if (bytes_data.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy offset của bạn trong v1.55!" });
        }

        // Tìm kiếm byte_str trong tệp 156
        const anogs2_data = fs.readFileSync(ANOGS2_FILE);
        const search_byte = Buffer.from(byte_str.split(' ').map(byte => parseInt(byte, 16)));
        const offset_anogs2 = anogs2_data.indexOf(search_byte);

        if (offset_anogs2 === -1) {
            return res.status(404).json({ message: "Không tìm thấy byte tương ứng trong v1.56!" });
        }

        // Chuyển offset_156 thành hex
        const result_offset_hex = `0x${offset_anogs2.toString(16)}`;
        const response_message = `Sau đây là kết quả của bạn:\n\nOffset mùa trước mà bạn tìm: ${offset}\n\nByte gốc của mùa trước là: ${byte_str}\n\nOffset mùa mới là: ${result_offset_hex}`;

        return res.json({ message: response_message });

    } catch (e) {
        if (e instanceof SyntaxError) {
            return res.status(400).json({ message: "offset không hợp lệ! Hãy đảm bảo nó là dạng hex (ví dụ: 0x123456)" });
        }
        return res.status(500).json({ message: `Có lỗi xảy ra: ${e.message}` });
    }
});

app.listen(4000, () => {
    console.log('Server is running on port 5500');
});

