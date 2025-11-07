import { resolve } from 'path';

export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  CLIENT_DIR: resolve(__dirname, '..', '..', 'client'),
  UPLOAD_DIR: resolve(__dirname, '..', '..', 'client', 'uploads'),
});
