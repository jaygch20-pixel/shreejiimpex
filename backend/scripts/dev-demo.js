process.env.NODE_ENV = 'development';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/shreeji_impex_demo';
process.env.SHOW_SAMPLE_DATA_PREVIEW = 'true';

const { startServer } = require('../server');

startServer().catch((error) => {
  console.error(`Demo server startup failed: ${error.message}`);
  process.exitCode = 1;
});
