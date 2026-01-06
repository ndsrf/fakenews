import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsFilters from '../../../../src/client/components/Analytics/AnalyticsFilters';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'analytics.filters.title': 'Filters',
        'analytics.filters.startDate': 'Start Date',
        'analytics.filters.endDate': 'End Date',
        'analytics.filters.brand': 'Brand',
        'analytics.filters.article': 'Article',
        'analytics.filters.apply': 'Apply Filters',
        'analytics.filters.reset': 'Reset',
      };
      return translations[key] || key;
    },
  }),
}));

describe('AnalyticsFilters', () => {
  it('should render all filter inputs', () => {
    const mockOnFilterChange = jest.fn();
    render(<AnalyticsFilters onFilterChange={mockOnFilterChange} />);

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  it('should call onFilterChange when apply button is clicked', () => {
    const mockOnFilterChange = jest.fn();
    render(<AnalyticsFilters onFilterChange={mockOnFilterChange} />);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
  });

  it('should render brand select when brands are provided', () => {
    const mockOnFilterChange = jest.fn();
    const brands = [
      { id: '1', name: 'Brand 1' },
      { id: '2', name: 'Brand 2' },
    ];

    render(<AnalyticsFilters onFilterChange={mockOnFilterChange} brands={brands} />);

    const brandSelect = screen.getByLabelText(/brand/i);
    expect(brandSelect).toBeInTheDocument();
  });

  it('should include brand filter when brand is selected', () => {
    const mockOnFilterChange = jest.fn();
    const brands = [
      { id: '1', name: 'Brand 1' },
      { id: '2', name: 'Brand 2' },
    ];

    render(<AnalyticsFilters onFilterChange={mockOnFilterChange} brands={brands} />);

    const brandSelect = screen.getByLabelText(/brand/i);
    fireEvent.change(brandSelect, { target: { value: '1' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      brandId: '1',
    });
  });

  it('should render article select when articles are provided', () => {
    const mockOnFilterChange = jest.fn();
    const articles = [
      { id: '1', title: 'Article 1' },
      { id: '2', title: 'Article 2' },
    ];

    render(<AnalyticsFilters onFilterChange={mockOnFilterChange} articles={articles} />);

    const articleSelect = screen.getByLabelText(/article/i);
    expect(articleSelect).toBeInTheDocument();
  });

  it('should only include non-empty filters', () => {
    const mockOnFilterChange = jest.fn();
    render(<AnalyticsFilters onFilterChange={mockOnFilterChange} />);

    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      startDate: '2024-01-01',
    });
    expect(mockOnFilterChange).not.toHaveBeenCalledWith(
      expect.objectContaining({ endDate: expect.anything() })
    );
  });

  it('should handle date inputs correctly', () => {
    const mockOnFilterChange = jest.fn();
    render(<AnalyticsFilters onFilterChange={mockOnFilterChange} />);

    const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
    fireEvent.change(startDateInput, { target: { value: '2024-06-15' } });

    expect(startDateInput.value).toBe('2024-06-15');
  });

  it('should render with responsive grid layout', () => {
    const mockOnFilterChange = jest.fn();
    const { container } = render(<AnalyticsFilters onFilterChange={mockOnFilterChange} />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('md:grid-cols-2');
  });
});
