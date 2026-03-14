import { Navigation } from "@/components/Navigation";
import { getRelatorioData } from "@/app/actions";
import { RelatorioTable } from "@/components/RelatorioTable";

export default async function RelatorioPage({ searchParams }: { searchParams: Promise<any> }) {
    const sp = await searchParams;
    const filters = {
        ano: sp.ano,
        mes: sp.mes,
        equipamento: sp.equipamento,
        pessoa: sp.pessoa
    };

    const { abastecimentos, equipamentos, pessoas } = await getRelatorioData(filters);
    
    // Anos disponíveis para o filtro (estático ou dinâmico)
    const currentYear = new Date().getFullYear();
    const anosDisponiveis = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-6 relative">
            <Navigation />

            <header className="mb-8 pt-4 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-[#006fb3]">
                    Relatório Avançado
                </h1>
                <p className="text-slate-400 mt-2">
                    Filtre e exporte todo o histórico de lançamentos.
                </p>
            </header>

            <RelatorioTable 
                initialData={abastecimentos} 
                equipamentos={equipamentos} 
                pessoas={pessoas}
                anosDisponiveis={anosDisponiveis}
            />
        </div>
    );
}
