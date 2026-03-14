import { Navigation } from "@/components/Navigation";
import { TrendingUp } from "lucide-react";
import { getUltimos3MesesData } from "@/app/actions";
import { TrimestralChart } from "@/components/TrimestralChart";

export default async function DashboardTrimestralPage() {
    const chartTresMeses = await getUltimos3MesesData();

    // Totalizar os litros do trimestre
    const totalTrimestre = chartTresMeses.reduce((acc, curr) => acc + curr.litros, 0);

    return (
        <div className="space-y-6 relative">
            <Navigation />

            <header className="mb-8 pt-4 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#006fb3] to-[#faa954]">
                    Dashboard Trimestral
                </h1>
                <p className="text-slate-400 mt-2">
                    Evolução do volume abastecido nos últimos 3 meses
                </p>
            </header>

            {/* Total Consolidados */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006fb3]/5 rounded-full blur-xl group-hover:bg-[#006fb3]/10 transition-all"></div>
                <div className="flex items-center justify-between relative">
                    <div>
                        <p className="text-slate-500 font-medium mb-1">Acumulado do Trimestre</p>
                        <h3 className="text-3xl font-bold text-slate-900">
                            {totalTrimestre.toFixed(1)} <span className="text-lg text-slate-500 font-normal">L</span>
                        </h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-[#006fb3]">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Gráfico */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg mt-6">
                <div className="flex flex-col mb-6 gap-4">
                    <h2 className="text-xl font-bold text-slate-900">Evolução Mensal</h2>
                </div>
                <TrimestralChart data={chartTresMeses} />
            </div>
        </div>
    );
}
