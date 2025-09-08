import MainLayout from '@/components/MainLayout';

// Componente de Card para métricas
function MetricCard({ title, value, change, icon, color = 'blue' }: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-2">{change}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Componente do gráfico de engajamento (simplificado)
function EngagementChart() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Taxa de Engajamento</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#FF6900] rounded-full"></div>
            <span className="text-sm text-gray-600">Impressões</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-600">Audiência</span>
          </div>
        </div>
      </div>
      
      <div className="h-64 flex items-end justify-between space-x-2">
        {[180, 150, 200, 160, 220, 190, 170, 140].map((height, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-1">
            <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '200px' }}>
              <div 
                className="w-full bg-[#FF6900] rounded-t-lg absolute bottom-0 transition-all duration-1000 ease-out"
                style={{ height: `${height}px` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">
              {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'][index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <MainLayout pageTitle="Insights">
      <div className="animate-fadeIn">
       
      </div>
    </MainLayout>
  );
}
