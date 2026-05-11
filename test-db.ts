import { saveMessage } from './lib/db';

saveMessage('test-user', 'test-session', {
  role: 'user',
  content: 'hello',
}).catch(console.error);
