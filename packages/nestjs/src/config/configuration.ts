import { resolve } from 'path';

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  CLIENT_DIR: resolve(__dirname, '..', '..', 'client'),
  UPLOAD_DIR: resolve(__dirname, '..', '..', 'client', 'uploads'),
});
