import { Navigation } from "@/components/Navigation";
import { AreaChart as AreaChartIcon, BarChart3, Droplet } from "lucide-react";
import { getDashboardData } from "@/app/actions";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ImagePreview } from "@/components/ImagePreview";

export default async function DashboardPage() {
    const result = await getDashboardData();
    const data = result.abastecimentos;
    const metrics = { totalLitros: result.totalLitros, registrosMes: result.registrosMes };
    const chartData = { litrosPorEquipamento: result.litrosPorEquipamento };

    return (
        <div className="space-y-6 relative">
            <Navigation />

            <header className="mb-8 pt-4 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#006fb3] to-[#faa954]">
                    Visão Geral do Mês
                </h1>
            </header>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006fb3]/5 rounded-full blur-xl group-hover:bg-[#006fb3]/10 transition-all"></div>
                    <div className="flex items-center justify-between relative">
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Total Abastecido</p>
                            <h3 className="text-3xl font-bold text-slate-900">
                                {metrics.totalLitros.toFixed(1)} <span className="text-lg text-slate-500 font-normal">L</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-[#006fb3]">
                            <Droplet className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#faa954]/5 rounded-full blur-xl group-hover:bg-[#faa954]/10 transition-all"></div>
                    <div className="flex items-center justify-between relative">
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Total de Registros</p>
                            <h3 className="text-3xl font-bold text-slate-900">
                                {metrics.registrosMes}
                            </h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl text-[#faa954]">
                            <AreaChartIcon className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficos Recharts */}
            <div className="grid grid-cols-1 mt-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold text-slate-900">Consumo por Equipamento</h2>
                    </div>
                    <DashboardCharts litrosPorEquipamento={chartData.litrosPorEquipamento} />
                </div>
            </div>

            {/* Histórico Recente */}
            <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-50 rounded-lg text-[#faa954]">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Lançamentos</h2>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                                <th className="pb-3 pl-2 font-medium">Data</th>
                                <th className="pb-3 font-medium">Equipamento</th>
                                <th className="pb-3 font-medium">Responsável</th>
                                <th className="pb-3 font-medium text-right pr-2">Volume</th>
                                <th className="pb-3 font-medium text-center">Comprovante</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-500">
                                        Nenhum abastecimento registrado neste período.
                                    </td>
                                </tr>
                            )}
                            {data.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-4 pl-2 text-slate-600">
                                        {new Date(row.data).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="py-4 text-slate-900 font-medium">{row.equipamento?.nome}</td>
                                    <td className="py-4 text-slate-500">
                                        {row.pessoa?.nome} <span className="text-xs ml-1 opacity-70">({row.pessoa?.equipe})</span>
                                    </td>
                                    <td className="py-4 text-right pr-2">
                                        <span className="bg-blue-50 text-[#006fb3] font-bold px-3 py-1 rounded-full border border-[#006fb3]/10">
                                            {row.quantidade.toFixed(2)} L
                                        </span>
                                    </td>
                                    <td className="py-4 text-center">
                                        {row.imagemUrl ? (
                                            <ImagePreview imagemUrl={row.imagemUrl} />
                                        ) : (
                                            <span className="text-slate-300 text-sm">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
