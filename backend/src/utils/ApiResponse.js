class ApiResponse {
  constructor({ success = true, message = null, data = null, meta = null }) {
    this.success = success;
    if (message) this.message = message;
    if (data) this.data = data;
    if (meta) this.meta = meta;
  }
}

module.exports = ApiResponse;
