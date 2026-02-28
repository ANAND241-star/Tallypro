import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App', () => {
  it('renders without crashing and shows navigation', () => {
    // Note: React Router might need wrapper but for now just basic render test
    const { container } = render(<App />);
    const htmlContent = container.innerHTML;
    expect(htmlContent).toContain('Home');
  });
});
