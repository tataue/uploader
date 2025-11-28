import { resolve } from 'path';

export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  CLIENT_DIR: resolve(__dirname, '..', '..', 'client'),
  UPLOAD_DIR: resolve(__dirname, '..', '..', 'client', 'uploads'),
  
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    uploadLimit: parseInt(process.env.THROTTLE_UPLOAD_LIMIT || '10', 10),
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10),
    maxFiles: parseInt(process.env.MAX_FILES || '10', 10),
  },
  
  IP_WHITELIST: process.env.IP_WHITELIST || '',
  IP_BLACKLIST: process.env.IP_BLACKLIST || '',
});
