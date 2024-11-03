from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Đường dẫn tới các tệp bạn đã tải lên
ANOGS_FILE = '155'
ANOGS2_FILE = '156'

@app.route('/offset', methods=['POST'])
def offset_finder():
    try:
        data = request.json
        offset = data.get("offset")

        if not offset:
            return jsonify({"message": "Offset không hợp lệ!"}), 400

        # Chuyển offset từ hex sang số nguyên
        offset_int = int(offset, 16)

        # Kiểm tra sự tồn tại của các tệp
        if not os.path.exists(ANOGS_FILE):
            return jsonify({"message": "File v1.55 không tìm thấy!"}), 404
        if not os.path.exists(ANOGS2_FILE):
            return jsonify({"message": "File v1.56 không tìm thấy!"}), 404

        # Đọc dữ liệu từ tệp 155
        with open(ANOGS_FILE, 'rb') as file:
            file.seek(offset_int)
            bytes_data = file.read(30)
            byte_str = ' '.join(f'{byte:02x}' for byte in bytes_data)

            if len(bytes_data) == 0:
                return jsonify({"message": "Không tìm thấy offset của bạn trong v1.55!"}), 404

        # Tìm kiếm byte_str trong tệp 156
        with open(ANOGS2_FILE, 'rb') as file2:
            anogs2_data = file2.read()
            search_byte = bytes.fromhex(' '.join(byte_str.split()))
            offset_anogs2 = anogs2_data.find(search_byte)

            if offset_anogs2 == -1:
                return jsonify({"message": "Không tìm thấy byte tương ứng trong v1.56!"}), 404

            # Chuyển offset_156 thành hex
            result_offset_hex = hex(offset_anogs2)
            response_message = (f"Sau đây là kết quả của bạn:\n\nOffset mùa trước mà bạn tìm: {offset}\n\n"
                                f"Byte gốc của mùa trước là: {byte_str}\n\n"
                                f"Offset mùa mới là: {result_offset_hex}")

            return jsonify({"message": response_message})

    except ValueError:
        return jsonify({"message": "offset không hợp lệ! Hãy đảm bảo nó là dạng hex (ví dụ: 0x123456)"}), 400
    except Exception as e:
        return jsonify({"message": f"Có lỗi xảy ra: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=5500)
