"use client";

import { useState } from "react";
import { BarChart3, Download, Search } from "lucide-react";
import { ImagePreview } from "./ImagePreview";
import { useRouter, useSearchParams } from "next/navigation";

type RelatorioTableProps = {
    initialData: any[];
    equipamentos: string[];
    pessoas: string[];
    anosDisponiveis: number[];
};

export function RelatorioTable({ initialData, equipamentos, pessoas, anosDisponiveis }: RelatorioTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const filterAno = searchParams.get("ano") || "TODOS";
    const filterMes = searchParams.get("mes") || "TODOS";
    const filterEquipamento = searchParams.get("equipamento") || "TODOS";
    const filterResponsavel = searchParams.get("pessoa") || "TODOS";

    const mesesStr = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const updateFilters = (newFilters: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === "TODOS") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`?${params.toString()}`);
    };

    const totalLitros = initialData.reduce((acc, curr) => acc + curr.quantidade, 0);

    return (
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg mt-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg text-[#faa954]">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Relatório de Lançamentos</h2>
                </div>
                <button
                    onClick={async () => {
                        const jsPDF = (await import("jspdf")).default;
                        const autoTable = (await import("jspdf-autotable")).default;

                        const doc = new jsPDF();
                        doc.text("Relatório de Abastecimentos - PMDF", 14, 15);
                        doc.setFontSize(9);
                        let subtitulo = `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`;
                        if (filterMes !== "TODOS") subtitulo += ` | Mês: ${filterMes}`;
                        if (filterAno !== "TODOS") subtitulo += ` | Ano: ${filterAno}`;
                        if (filterEquipamento !== "TODOS") subtitulo += ` | Equip: ${filterEquipamento}`;
                        if (filterResponsavel !== "TODOS") subtitulo += ` | Resp: ${filterResponsavel}`;
                        doc.text(subtitulo, 14, 22);

                        const colunas = ["Data", "Responsável", "Equipe", "Equipamento", "Litros", "Obs"];
                        const linhas = initialData.map(d => [
                            new Date(d.data).toLocaleDateString('pt-BR'),
                            d.pessoa?.nome || "-",
                            d.pessoa?.equipe || "-",
                            d.equipamento?.nome || "-",
                            `${d.quantidade.toFixed(2)} L`,
                            d.observacoes || "-"
                        ]);

                        if (linhas.length > 0) {
                            linhas.push(["TOTAL", "", "", "", `${totalLitros.toFixed(2)} L`, ""]);
                        }

                        autoTable(doc, {
                            head: [colunas],
                            body: linhas,
                            startY: 26,
                            theme: 'striped',
                            headStyles: { fillColor: [0, 111, 179] }
                        });

                        doc.save("relatorio_abastecimentos.pdf");
                    }}
                    className="bg-[#006fb3] hover:bg-[#005a96] text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Exportar PDF
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-600 font-medium">Ano</label>
                    <select
                        value={filterAno}
                        onChange={e => updateFilters({ ano: e.target.value })}
                        className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006fb3]/50"
                    >
                        <option value="TODOS">Todos</option>
                        {anosDisponiveis.map(ano => (
                            <option key={ano} value={ano.toString()}>{ano}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-600 font-medium">Mês</label>
                    <select
                        value={filterMes}
                        onChange={e => updateFilters({ mes: e.target.value })}
                        className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006fb3]/50"
                    >
                        <option value="TODOS">Todos</option>
                        {mesesStr.map(mes => (
                            <option key={mes} value={mes}>{mes}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-600 font-medium">Equipamento</label>
                    <select
                        value={filterEquipamento}
                        onChange={e => updateFilters({ equipamento: e.target.value })}
                        className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006fb3]/50"
                    >
                        <option value="TODOS">Todos</option>
                        {equipamentos.map(eq => (
                            <option key={eq} value={eq}>{eq}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-600 font-medium">Responsável</label>
                    <select
                        value={filterResponsavel}
                        onChange={e => updateFilters({ pessoa: e.target.value })}
                        className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006fb3]/50"
                    >
                        <option value="TODOS">Todos</option>
                        {pessoas.map(resp => (
                            <option key={resp} value={resp}>{resp}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                            <th className="pb-3 pl-2 font-medium">Data</th>
                            <th className="pb-3 font-medium">Equipamento</th>
                            <th className="pb-3 font-medium">Responsável</th>
                            <th className="pb-3 font-medium text-center">Comprovante</th>
                            <th className="pb-3 font-medium text-right pr-2">Volume</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialData.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-500">
                                    Nenhum abastecimento encontrado para os filtros atuais.
                                </td>
                            </tr>
                        )}
                        {initialData.map((row) => (
                            <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="py-4 pl-2 text-slate-600">
                                    {new Date(row.data).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="py-4 text-slate-900 font-medium">{row.equipamento?.nome}</td>
                                <td className="py-4 text-slate-500">
                                    {row.pessoa?.nome} <span className="text-xs ml-1 opacity-70">({row.pessoa?.equipe})</span>
                                </td>
                                <td className="py-4 text-center">
                                    {row.imagemUrl ? (
                                        <ImagePreview imagemUrl={row.imagemUrl} />
                                    ) : (
                                        <span className="text-slate-300 text-sm">-</span>
                                    )}
                                </td>
                                <td className="py-4 text-right pr-2">
                                    <span className="bg-blue-50 text-[#006fb3] font-bold px-3 py-1 rounded-full border border-[#006fb3]/10">
                                        {row.quantidade.toFixed(2)} L
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {initialData.length > 0 && (
                        <tfoot>
                            <tr className="border-t-2 border-slate-200 bg-slate-50">
                                <td colSpan={4} className="py-4 pl-2 text-right font-bold text-slate-900">
                                    TOTAL:
                                </td>
                                <td className="py-4 text-right pr-2">
                                    <span className="bg-orange-50 text-orange-600 font-bold px-3 py-1 rounded-full border border-orange-200">
                                        {totalLitros.toFixed(2)} L
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </section>
    );
}
