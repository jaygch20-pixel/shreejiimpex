const LOCAL_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

const isSampleDataPreviewEnabled = (req) => (
  process.env.NODE_ENV === 'development'
  && process.env.SHOW_SAMPLE_DATA_PREVIEW === 'true'
  && LOCAL_ADDRESSES.has(req.ip)
);

const publicSampleDataFilter = (req) => (
  isSampleDataPreviewEnabled(req) ? {} : { isSampleData: false }
);

module.exports = { isSampleDataPreviewEnabled, publicSampleDataFilter };
