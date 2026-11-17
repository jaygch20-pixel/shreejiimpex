const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

process.env.NODE_ENV = 'development';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/shreeji_impex_demo';
process.env.SHOW_SAMPLE_DATA_PREVIEW = 'true';
if (!process.env.ADMIN_EMAIL_SEED || !process.env.ADMIN_PASSWORD_SEED) {
  process.env.SKIP_ADMIN_SEED = 'true';
}

require('./seed');
