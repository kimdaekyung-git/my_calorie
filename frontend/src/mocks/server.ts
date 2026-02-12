import { setupServer } from 'msw/node';
import { foodHandlers } from './handlers/food';
import { foodAnalysisHandlers } from './handlers/foodAnalysis';

export const server = setupServer(...foodHandlers, ...foodAnalysisHandlers);
