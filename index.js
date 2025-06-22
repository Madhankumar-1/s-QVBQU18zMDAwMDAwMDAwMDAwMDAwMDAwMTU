import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Expose full path to a subfolder
export const handlersPath = path.join(__dirname, './lambda');
