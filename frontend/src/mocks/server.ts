import { setupServer } from 'msw/node';
import { foodHandlers } from './handlers/food';

export const server = setupServer(...foodHandlers);
