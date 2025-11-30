// Shared test setup for Vitest. Extends expect with jest-dom matchers.
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);
