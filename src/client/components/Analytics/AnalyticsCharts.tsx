import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';

/**
 * Analytics data structure
 */
export interface AnalyticsData {
  viewsOverTime: Array<{ date: string; views: number }>;
  deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
  geographicDistribution: Array<{ country: string; count: number }>;
}

interface AnalyticsChartsProps {
  data: AnalyticsData | null;
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

/**
 * Analytics charts component.
 *
 * This component:
 * - Renders line chart for views over time
 * - Renders pie chart for device breakdown
 * - Renders bar chart for geographic distribution
 * - Shows loading state
 * - Responsive using ResponsiveContainer
 */
export default function AnalyticsCharts({ data, loading }: AnalyticsChartsProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t('analytics.noData')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Views Over Time - Line Chart */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">
          {t('analytics.viewsOverTime')}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.viewsOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#0088FE"
              strokeWidth={2}
              name={t('analytics.views')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Device Breakdown - Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('analytics.deviceBreakdown')}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.deviceBreakdown}
              dataKey="count"
              nameKey="device"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ device, percentage }) => `${device} (${percentage.toFixed(1)}%)`}
            >
              {data.deviceBreakdown.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Geographic Distribution - Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('analytics.geographicDistribution')}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.geographicDistribution.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="country" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#00C49F" name={t('analytics.views')} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
