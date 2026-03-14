"use client";

import { useState, useTransition } from "react";
import { Camera, Fuel, Save, Loader2, CheckCircle2 } from "lucide-react";
import { addAbastecimento } from "@/app/actions";
import imageCompression from 'browser-image-compression';

type Pessoa = { id: number, nome: string, equipe: string };
type Equipamento = { id: number, nome: string };

interface Props {
  equipes: Pessoa[];
  equipamentos: Equipamento[];
}

export function AbastecimentoForm({ equipes, equipamentos }: Props) {
  // Inicializa a data com o horário atual de Brasília
  const getLocalDateTimeString = () => {
    return new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T').substring(0, 16);
  };

  const [dataAtual, setDataAtual] = useState(getLocalDateTimeString);
  const [quantidade, setQuantidade] = useState("");
  const [equipeSelecionada, setEquipeSelecionada] = useState("");
  const [pessoaSelecionada, setPessoaSelecionada] = useState("");
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const pessoasFiltradas = equipes.filter(p => p.equipe === equipeSelecionada);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pessoaSelecionada || !equipamentoSelecionado || !quantidade || !dataAtual || !imagem) {
      alert("Por favor, preencha todos os campos obrigatórios e anexe o comprovante (imagem).");
      return;
    }

    const formData = new FormData();
    formData.append("pessoaId", pessoaSelecionada);
    formData.append("equipamentoId", equipamentoSelecionado);
    formData.append("quantidade", quantidade);
    formData.append("data", dataAtual);
    formData.append("observacoes", observacoes);

    if (imagem) {
      formData.append("imagem", imagem);
    }

    startTransition(async () => {
      const res = await addAbastecimento(formData);
      if (res.success) {
        setSuccess(true);
        setQuantidade("");
        setObservacoes("");
        setImagem(null);
        setPreviewUrl(null);
        setDataAtual(getLocalDateTimeString());
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      try {
        setIsCompressing(true);
        console.log("Original file size:", (file.size / 1024 / 1024).toFixed(2), "MB");
        
        const options = {
          maxSizeMB: 1, // Limite de 1MB para Cloudinary
          maxWidthOrHeight: 1920, // Full HD para manter legibilidade
          useWebWorker: true,
          initialQuality: 0.8 // Qualidade inicial um pouco menor para garantir compressão
        };
        
        const compressedFile = await imageCompression(file, options);
        console.log("Compressed file size:", (compressedFile.size / 1024 / 1024).toFixed(2), "MB");

        const compressedBlobFile = new File([compressedFile], file.name, {
          type: compressedFile.type,
          lastModified: Date.now(),
        });

        setImagem(compressedBlobFile);
        setPreviewUrl(URL.createObjectURL(compressedBlobFile));
      } catch (error) {
        console.error("Erro ao comprimir imagem:", error);
        // Fallback para o arquivo original se a compressão falhar
        setImagem(file);
        setPreviewUrl(URL.createObjectURL(file));
      } finally {
        setIsCompressing(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl max-w-2xl mx-auto relative overflow-hidden">

      {isPending && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#006fb3] animate-spin" />
        </div>
      )}

      {success && (
        <div className="absolute inset-0 bg-emerald-50/90 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-6 transition-all">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold text-emerald-900 mb-2">Sucesso!</h2>
          <p className="text-emerald-700">Registro realizado.</p>
        </div>
      )}

      <form className="space-y-5 relative z-0" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Data e Hora do Abastecimento</label>
            <input
              type="datetime-local"
              value={dataAtual}
              onChange={(e) => setDataAtual(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006fb3]/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Quantidade (Litros)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-12 text-slate-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#006fb3]/50"
              />
              <Fuel className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Equipe</label>
            <select
              value={equipeSelecionada}
              onChange={(e) => {
                setEquipeSelecionada(e.target.value);
                setPessoaSelecionada("");
              }}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006fb3]/50 appearance-none">
              <option value="">Selecione...</option>
              <option value="ALFA">Equipe Alfa</option>
              <option value="BRAVO">Equipe Bravo</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nome do Integrante</label>
            <select
              value={pessoaSelecionada}
              onChange={(e) => setPessoaSelecionada(e.target.value)}
              required
              disabled={!equipeSelecionada}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006fb3]/50 appearance-none disabled:opacity-50">
              <option value="">{equipeSelecionada ? "Selecione a pessoa..." : "Selecione a equipe primeiro"}</option>
              {pessoasFiltradas.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Equipamento</label>
          <select
            value={equipamentoSelecionado}
            onChange={(e) => setEquipamentoSelecionado(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006fb3]/50 appearance-none">
            <option value="">Selecione o equipamento...</option>
            {equipamentos.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.nome}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Comprovante / Foto do Painel</label>
          <label htmlFor="file-upload" className="border-2 border-dashed border-slate-300 hover:border-[#006fb3]/50 bg-slate-50/50 rounded-xl p-8 transition-colors text-center cursor-pointer group block relative overflow-hidden">
            {isCompressing ? (
              <div className="flex flex-col items-center gap-3 relative z-10 py-6">
                <Loader2 className="w-8 h-8 text-[#006fb3] animate-spin" />
                <p className="text-slate-700 font-medium">Comprimindo imagem...</p>
              </div>
            ) : previewUrl ? (
              <div className="absolute inset-0 w-full h-full">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[#006fb3] font-medium bg-white/80 border border-[#006fb3]/50 px-4 py-2 rounded-lg">Trocar Imagem</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="p-4 bg-white border border-slate-200 rounded-full group-hover:bg-[#006fb3]/10 group-hover:text-[#006fb3] transition-colors">
                  <Camera className="w-8 h-8 text-slate-400 group-hover:text-[#006fb3]" />
                </div>
                <div>
                  <p className="text-slate-700 font-medium">Toque para anexar a imagem</p>
                  <p className="text-slate-500 text-sm mt-1">Imagens serão comprimidas automaticamente</p>
                </div>
              </div>
            )}
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Observações (Opcional)</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            placeholder="Ex: Abastecimento em trânsito, troca de óleo..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006fb3]/50 resize-none"
          ></textarea>
        </div>

        <button
          disabled={isPending}
          className="w-full bg-[#006fb3] hover:bg-[#005a96] text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-[#006fb3]/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-4">
          <Save className="w-6 h-6" />
          Registrar Abastecimento
        </button>
      </form>
    </div>
  );
}
