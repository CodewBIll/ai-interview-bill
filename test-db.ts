import { saveMessage } from './lib/db'; saveMessage('test-session', { role: 'user', content: 'hello' }).catch(console.error); 
