"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// --- Pessoas ---
export async function addPessoa(nome: string, equipe: string) {
    if (!nome || !equipe) return { error: "Dados inválidos" };
    await prisma.pessoa.create({
        data: { nome, equipe },
    });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
}

export async function deletePessoa(id: number) {
    await prisma.pessoa.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
}

export async function getPessoas() {
    return await prisma.pessoa.findMany({ orderBy: { nome: "asc" } });
}

// --- Equipamentos ---
export async function addEquipamento(nome: string) {
    if (!nome) return { error: "O nome não pode ser vazio" };
    await prisma.equipamento.create({ data: { nome } });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
}

export async function deleteEquipamento(id: number) {
    await prisma.equipamento.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
}

export async function getEquipamentos() {
    return await prisma.equipamento.findMany({ orderBy: { nome: "asc" } });
}

// --- Abastecimentos ---
export async function addAbastecimento(formData: FormData) {
    const pessoaId = Number(formData.get("pessoaId"));
    const equipamentoId = Number(formData.get("equipamentoId"));
    const quantidade = Number(formData.get("quantidade"));
    const observacoes = formData.get("observacoes") as string | null;
    const file = formData.get("imagem") as File | null;
    const dataString = formData.get("data") as string;

    if (!pessoaId || !equipamentoId || quantidade <= 0 || !dataString) {
        return { error: "Campos obrigatórios estão faltando ou são inválidos" };
    }

    // A data vem do formulário sem fuso (ex: "2026-03-12T06:30").
    // O servidor (Vercel) roda em UTC, então precisamos indicar que é UTC-3 (horário de Brasília).
    // Desde 2019, o Brasil não tem mais horário de verão, então -03:00 é sempre correto.
    const customDate = new Date(dataString + '-03:00');

    let imagemUrl = null;
    console.log("-> Iniciando addAbastecimento. file:", file ? file.name : "Nenhum arquivo");

    if (file && file.size > 0) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            console.log("Buffer gerado, enviando ao Cloudinary com tipo:", file.type);
            imagemUrl = await uploadImageToCloudinary(buffer, file.type);
            console.log("Upload concluído! URL:", imagemUrl);
        } catch (err) {
            console.error("Erro no upload para Cloudinary:", err);
            return { error: "A Nuvem de Fotos (Cloudinary) falhou ou não está configurada com as Chaves. Verifique as variáveis do servidor." };
        }
    }

    try {
        console.log("Salvando Abastecimento no BD...", { pessoaId, equipamentoId, quantidade, imagemUrl });
        await prisma.abastecimento.create({
            data: {
                data: customDate,
                quantidade,
                observacoes,
                pessoaId,
                equipamentoId,
                imagemUrl: imagemUrl
            },
        });
        console.log("Salvo no Prisma com sucesso!");
    } catch (err) {
        console.error("Erro ao salvar abastecimento no Prisma:", err);
        return { error: "Ocorreu um erro ao salvar o registro no Banco de Dados." };
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function getAbastecimentos() {
    return await prisma.abastecimento.findMany({
        include: {
            pessoa: true,
            equipamento: true,
        },
        orderBy: { data: "desc" },
    });
}

export async function deleteAbastecimento(id: number) {
    await prisma.abastecimento.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
}

export async function updateAbastecimento(id: number, dataStr: string, quantidade: number, observacoes: string | null) {
    if (quantidade <= 0 || !dataStr) {
        return { error: "Dados inválidos." };
    }
    await prisma.abastecimento.update({
        where: { id },
        data: {
            data: new Date(dataStr + '-03:00'),
            quantidade,
            observacoes
        }
    });
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
}

export async function getDashboardMetrics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    startOfMonth.setHours(0, 0, 0, 0);
    startOfNextMonth.setHours(0, 0, 0, 0);

    const totalAbastecidoMes = await prisma.abastecimento.aggregate({
        _sum: { quantidade: true },
        where: {
            data: {
                gte: startOfMonth,
                lt: startOfNextMonth,
            },
        },
    });

    const countMes = await prisma.abastecimento.count({
        where: {
            data: {
                gte: startOfMonth,
                lt: startOfNextMonth,
            },
        },
    });

    return {
        totalLitros: totalAbastecidoMes._sum.quantidade || 0,
        registrosMes: countMes,
    };
}

export async function getChartData() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    startOfMonth.setHours(0, 0, 0, 0);
    startOfNextMonth.setHours(0, 0, 0, 0);

    const allRecordsMes = await prisma.abastecimento.findMany({
        where: {
            data: {
                gte: startOfMonth,
                lt: startOfNextMonth,
            }
        },
        select: { quantidade: true, equipamento: { select: { nome: true } } }
    });

    const equipamentosMap: Record<string, number> = {};
    allRecordsMes.forEach((abs: { quantidade: number, equipamento: { nome: string } | null }) => {
        const eqName = abs.equipamento?.nome || "Desconhecido";
        equipamentosMap[eqName] = (equipamentosMap[eqName] || 0) + abs.quantidade;
    });

    const chartEquipamentos = Object.entries(equipamentosMap)
        .map(([nome, litros]) => ({ nome, litros }))
        .sort((a, b) => b.litros - a.litros); // Maior consumo primeiro

    return {
        litrosPorEquipamento: chartEquipamentos
    };
}

export async function getRelatorioData(filters: { mes?: string, ano?: string, equipamento?: string, pessoa?: string }) {
    const where: any = {};

    if (filters.ano && filters.ano !== "TODOS") {
        const year = parseInt(filters.ano);
        where.data = {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1)
        };
    }

    if (filters.mes && filters.mes !== "TODOS") {
        const mesesStr = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const mesIndex = mesesStr.indexOf(filters.mes);
        const year = filters.ano && filters.ano !== "TODOS" ? parseInt(filters.ano) : new Date().getFullYear();
        
        where.data = {
            gte: new Date(year, mesIndex, 1),
            lt: new Date(year, mesIndex + 1, 1)
        };
    }

    if (filters.equipamento && filters.equipamento !== "TODOS") {
        where.equipamento = { nome: filters.equipamento };
    }

    if (filters.pessoa && filters.pessoa !== "TODOS") {
        where.pessoa = { nome: filters.pessoa };
    }

    const [abastecimentos, equipamentos, pessoas] = await Promise.all([
        prisma.abastecimento.findMany({
            where,
            select: {
                id: true,
                data: true,
                quantidade: true,
                observacoes: true,
                imagemUrl: true,
                pessoa: { select: { nome: true, equipe: true } },
                equipamento: { select: { nome: true } }
            },
            orderBy: { data: 'desc' }
        }),
        prisma.equipamento.findMany({ select: { nome: true } }),
        prisma.pessoa.findMany({ select: { nome: true } })
    ]);

    return {
        abastecimentos,
        equipamentos: Array.from(new Set(equipamentos.map((e: { nome: string }) => e.nome))),
        pessoas: Array.from(new Set(pessoas.map((p: { nome: string }) => p.nome)))
    };
}

export async function getDashboardData() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    startOfMonth.setHours(0, 0, 0, 0);
    startOfNextMonth.setHours(0, 0, 0, 0);

    const [abastecimentosMes, totalAggregate, countMes] = await Promise.all([
        prisma.abastecimento.findMany({
            where: { data: { gte: startOfMonth, lt: startOfNextMonth } },
            select: {
                id: true,
                data: true,
                quantidade: true,
                imagemUrl: true,
                pessoa: {
                    select: { nome: true, equipe: true }
                },
                equipamento: {
                    select: { nome: true }
                }
            },
            orderBy: { data: 'desc' },
        }),
        prisma.abastecimento.aggregate({
            _sum: { quantidade: true },
            where: { data: { gte: startOfMonth, lt: startOfNextMonth } },
        }),
        prisma.abastecimento.count({
            where: { data: { gte: startOfMonth, lt: startOfNextMonth } },
        }),
    ]);

    // Montar dados do gráfico a partir dos registros já buscados (sem nova query)
    const equipamentosMap: Record<string, number> = {};
    abastecimentosMes.forEach((abs: any) => {
        const eqName = abs.equipamento?.nome || 'Desconhecido';
        equipamentosMap[eqName] = (equipamentosMap[eqName] || 0) + abs.quantidade;
    });
    const litrosPorEquipamento = Object.entries(equipamentosMap)
        .map(([nome, litros]) => ({ nome, litros }))
        .sort((a, b) => b.litros - a.litros);

    return {
        abastecimentos: abastecimentosMes,
        totalLitros: totalAggregate._sum.quantidade || 0,
        registrosMes: countMes,
        litrosPorEquipamento,
    };
}

export async function getUltimos3MesesData() {
    const now = new Date();
    const startMes3 = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    startMes3.setHours(0, 0, 0, 0);
    startOfNextMonth.setHours(0, 0, 0, 0);

    const allRecords = await prisma.abastecimento.findMany({
        where: {
            data: {
                gte: startMes3,
                lt: startOfNextMonth,
            }
        },
        select: { quantidade: true, data: true }
    });

    const mesesStr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Cria array com os ultimos 3 meses para garantir ordem correta incluindo meses sem consumo
    const dataTresMeses: { mesAno: string, litros: number }[] = [];
    for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        dataTresMeses.push({
            mesAno: `${mesesStr[d.getMonth()]}/${d.getFullYear()}`,
            litros: 0
        });
    }

    allRecords.forEach((abs: { quantidade: number, data: Date }) => {
        const rowDate = new Date(abs.data);
        const ref = `${mesesStr[rowDate.getMonth()]}/${rowDate.getFullYear()}`;
        const target = dataTresMeses.find(m => m.mesAno === ref);
        if (target) {
            target.litros += abs.quantidade;
        }
    });

    return dataTresMeses;
}

// --- Auth / Config ---
export async function verifyAdminPassword(senhaAberta: string) {
    let configSenha = await prisma.config.findUnique({ where: { chave: 'admin_pass' } });
    if (!configSenha) {
        // Inicializa se não existir com "admin123"
        configSenha = await prisma.config.create({ data: { chave: 'admin_pass', valor: 'admin123' } });
        await prisma.config.create({ data: { chave: 'admin_pin', valor: '0000' } }); // PIN de recuperação padrão
    }
    return configSenha.valor === senhaAberta;
}

export async function changeAdminPassword(senhaAtual: string, novaSenha: string, novoPin?: string) {
    if (!novaSenha || novaSenha.length < 4) return { error: "Nova senha muito curta." };

    const configSenha = await prisma.config.findUnique({ where: { chave: 'admin_pass' } });
    if (configSenha?.valor !== senhaAtual && configSenha?.valor !== undefined) {
        return { error: "Senha atual incorreta." };
    }

    await prisma.config.upsert({
        where: { chave: 'admin_pass' },
        update: { valor: novaSenha },
        create: { chave: 'admin_pass', valor: novaSenha }
    });

    if (novoPin && novoPin.length >= 4) {
        await prisma.config.upsert({
            where: { chave: 'admin_pin' },
            update: { valor: novoPin },
            create: { chave: 'admin_pin', valor: novoPin }
        });
    }

    return { success: true };
}

export async function verifyPinAndResetPassword(pin: string, novaSenha: string) {
    if (!novaSenha || novaSenha.length < 4) return { error: "Nova senha muito curta." };
    const configPin = await prisma.config.findUnique({ where: { chave: 'admin_pin' } });

    // Se não existir o pino, consideramos '0000'
    const currentPin = configPin ? configPin.valor : '0000';
    if (currentPin !== pin) {
        return { error: "PIN de recuperação incorreto." };
    }

    await prisma.config.upsert({
        where: { chave: 'admin_pass' },
        update: { valor: novaSenha },
        create: { chave: 'admin_pass', valor: novaSenha }
    });

    return { success: true };
}
