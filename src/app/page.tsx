import { Navigation } from "@/components/Navigation";
import { Fuel } from "lucide-react";
import { getPessoas, getEquipamentos } from "@/app/actions";
import { AbastecimentoForm } from "@/components/AbastecimentoForm";

// Server Component: busca os dados no servidor antes de renderizar
// Isso elimina o lag causado pelo useEffect no cliente
export default async function Home() {
  const [equipes, equipamentos] = await Promise.all([
    getPessoas(),
    getEquipamentos(),
  ]);

  return (
    <div className="space-y-6 relative">
      <Navigation />

      <header className="mb-8 text-center pt-4">
        <h1 className="text-4xl font-extrabold text-[#006fb3] flex items-center justify-center gap-3">
          <Fuel className="w-10 h-10 text-[#006fb3]" />
          Registrar Abastecimento
        </h1>
        <p className="text-slate-600 mt-2">
          Insira os dados de combustível do veículo ou equipamento.
        </p>
      </header>

      <AbastecimentoForm equipes={equipes} equipamentos={equipamentos} />
    </div>
  );
}

