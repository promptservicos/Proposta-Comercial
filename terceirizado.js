// ================== FIREBASE INIT ==================
const firebaseConfig = {
    apiKey: "AIzaSyB2xi5fCMv3Vz_UpRxMdQqrVn1DDyAh3_k",
    authDomain: "propostas-comerciais-e288c.firebaseapp.com",
    projectId: "propostas-comerciais-e288c",
    storageBucket: "propostas-comerciais-e288c.firebasestorage.app",
    messagingSenderId: "781220916097",
    appId: "1:781220916097:web:9d1d53aa8bb03c520c1680",
    measurementId: "G-JEH5ZKSX89"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics();

// ================== CONSTANTES ==================
const SALARIO_MINIMO = 1621.00;
const HORAS_MENSAL = 220;
const TAXA_ENCARGOS_FISCAIS = 0.1375; // 13.75% fixo sobre subtotal dos insumos e benefícios

const UNIFORMES = [
    { nome: "KIT DE UNIFORMES", preco: 389.00 },
    { nome: "CALÇA OPERACIONAL", preco: 48.00 },
    { nome: "CAMISETA", preco: 45.00 },
    { nome: "BOTA", preco: 78.00 },
    { nome: "BLUSA DE FRIO", preco: 125.00 },
    { nome: "COLETE", preco: 28.00 }
];

const EPIS = [
    { nome: "Óculos Proteção", preco: 7.00 },
    { nome: "Cinta Elástica P Proteção Lombar", preco: 38.00 },
    { nome: "Luva Vaqueta Tipo Petroleiro", preco: 25.00 },
    { nome: "Protetor auricular Tipo Plug Silicone", preco: 2.00 },
    { nome: "Capacete Avant", preco: 18.00 },
    { nome: "Luvas de limpeza", preco: 10.00 },
    { nome: "GALOCHA", preco: 52.00 }
];

// Benefícios fixos
const BENEFICIOS_FIXOS = [
    { nome: "Vale Refeição", campo: "vr", valorDiario: 0, dias: 0 },
    { nome: "Cesta Básica", campo: "cesta", valorDiario: 0, dias: 0 },
    { nome: "PPR", campo: "ppr", valorDiario: 0, dias: 0 },
    { nome: "Assiduidade", campo: "assiduidade", valorDiario: 0, dias: 0 },
    { nome: "Vale Transporte", campo: "vt", valorDiario: 0, dias: 0 }
];

const SEGURANCA_FIXOS = [
    { nome: "SST (Segurança e Saúde do Trabalho)", campo: "sst", valor: 18.00, depreciacao: 1 },
    { nome: "Seguro de Vida", campo: "seguro_vida", valor: 15.00, depreciacao: 1 }
];

const INSUMOS = [
    { nome: "Tipo", campo: "tipo" },
    { nome: "Uber", campo: "uber" },
    { nome: "Insumos (Materiais de Limpeza)", campo: "insumos" },
    { nome: "Maquinário", campo: "maquinario" }
];

// EXAMES
const EXAMES_ADMISSIONAL = [
    { nome: "Admissional / Demissional / Acuidade", preco: 111.00, obrigatorio: false }
];

const EXAMES_COMPLEMENTARES = [
    { nome: "Hemograma", preco: 20.00 },
    { nome: "Glicemia", preco: 18.00 },
    { nome: "Urina tipo I", preco: 15.00 },
    { nome: "ECG", preco: 55.00 },
    { nome: "EEG", preco: 60.00 },
    { nome: "Coprocultura", preco: 38.00 },
    { nome: "PPF", preco: 32.00 },
    { nome: "VDRL", preco: 35.00 },
    { nome: "Espirometria", preco: 55.00 },
    { nome: "RX Tórax", preco: 75.00 },
    { nome: "RX Lombo Sacra", preco: 68.00 },
    { nome: "Av. Psicossocial", preco: 210.00 },
    { nome: "RX Coluna Cervical", preco: 115.00 },
    { nome: "RX Coluna Dorsal", preco: 115.00 },
    { nome: "Toxicologico", preco: 250.00 },
    { nome: "Gama GT", preco: 19.00 },
    { nome: "Ácido Hipurico", preco: 38.00 },
    { nome: "TGO", preco: 22.00 },
    { nome: "TGP", preco: 22.00 },
    { nome: "Micologico", preco: 25.00 },
    { nome: "Testoreno", preco: 60.00 },
    { nome: "HBSAG", preco: 67.00 },
    { nome: "Cretinina", preco: 19.00 }
];

// Chave para salvar rascunho no localStorage
const DRAFT_KEY = 'proposta_terceirizado_draft';

// ========== FUNÇÃO AUXILIAR ESCAPE HTML ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== FUNÇÃO PARA GERAR IMAGEM DA PROPOSTA DIRETAMENTE ==========
async function gerarImagemProposta() {
    // Mostrar indicador de carregamento
    const btnBaixar = document.getElementById('btn-baixar-proposta');
    const textoOriginal = btnBaixar ? btnBaixar.innerHTML : '';
    if (btnBaixar) {
        btnBaixar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando imagem...';
        btnBaixar.disabled = true;
    }
    
    try {
        // Criar um elemento temporário para a visualização
        const elementoVisualizacao = document.createElement('div');
        elementoVisualizacao.className = 'visualizacao-temporaria';
        elementoVisualizacao.style.position = 'fixed';
        elementoVisualizacao.style.left = '-9999px';
        elementoVisualizacao.style.top = '-9999px';
        elementoVisualizacao.style.backgroundColor = '#ffffff';
        elementoVisualizacao.style.padding = '2rem';
        elementoVisualizacao.style.borderRadius = '16px';
        elementoVisualizacao.style.width = '800px';
        elementoVisualizacao.style.maxWidth = '800px';
        elementoVisualizacao.style.fontFamily = "'Inter', sans-serif";
        
        // Coletar dados da proposta atual
        const cliente = document.getElementById('cliente-nome').value || 'Não informado';
        const vendedor = document.getElementById('vendedor-nome').textContent || 'Não informado';
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        
        // Coletar dados dos cargos
        let cargosHTML = '';
        let cargoIndex = 0;
        let totalGeralProposta = 0;
        
        document.querySelectorAll('.cargo-item').forEach(item => {
            cargoIndex++;
            const nomeCargo = item.querySelector('.cargo-nome').value.trim() || 'Cargo sem nome';
            const qtdVagas = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            
            // Pegar o TOTAL FINAL DA VAGA (já com multiplicação e acúmulo)
            const totalVagaElem = item.querySelector('.total-prestacao .valor');
            let totalVaga = 0;
            if (totalVagaElem) {
                const totalText = totalVagaElem.textContent;
                totalVaga = parseFloat(totalText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
            }
            
            totalGeralProposta += totalVaga;
            
            // Calcular valor por vaga (sem multiplicação)
            let valorPorVaga = totalVaga;
            if (qtdVagas > 1) {
                valorPorVaga = totalVaga / qtdVagas;
            }
            
            cargosHTML += `
                <div class="vis-cargo" style="background: #fff; border: 1px solid #e0e0e0; border-radius: 16px; margin-bottom: 1.5rem; overflow: hidden;">
                    <div class="vis-cargo-header" style="background: #f8f8f8; padding: 1rem; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="color: #c10404; margin: 0; font-size: 1.1rem;">${cargoIndex}. ${escapeHtml(nomeCargo)}</h3>
                        <span class="vis-quantidade" style="background: #c10404; color: #fff; padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.8rem;">${qtdVagas} vaga${qtdVagas > 1 ? 's' : ''}</span>
                    </div>
                    <div class="vis-resumo" style="padding: 1rem;">
                        <div class="vis-resumo-item" style="padding: 0.5rem 0; display: flex; justify-content: space-between; border-bottom: 1px dashed #eee;">
                            <strong>Valor por vaga:</strong>
                            <span>${formatarMoeda(valorPorVaga)}</span>
                        </div>
                        <div class="vis-resumo-item vis-destaque" style="padding: 0.5rem 0; display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: bold; color: #c10404; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #ddd;">
                            <strong>Total (${qtdVagas} vaga${qtdVagas > 1 ? 's' : ''}):</strong>
                            <span>${formatarMoeda(totalVaga)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Construir HTML da visualização
        elementoVisualizacao.innerHTML = `
            <div class="visualizacao-resumida" style="max-width: 800px; margin: 0 auto;">
                <div class="vis-header" style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #c10404;">
                    <i class="fas fa-chart-line" style="font-size: 2rem; color: #c10404;"></i>
                    <h2 style="color: #c10404; margin: 0.5rem 0;">Proposta Comercial</h2>
                    <p class="vis-subtitle" style="color: #666; font-size: 0.9rem;">Prompt Serviços - Contrato Terceirizado</p>
                </div>
                
                <div class="vis-info" style="background: #f5f5f5; padding: 1rem; border-radius: 12px; margin-bottom: 2rem;">
                    <div class="vis-info-item" style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
                        <span class="vis-label" style="font-weight: 600; color: #666;">Cliente:</span>
                        <span class="vis-value" style="color: #333;">${escapeHtml(cliente)}</span>
                    </div>
                    <div class="vis-info-item" style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
                        <span class="vis-label" style="font-weight: 600; color: #666;">Vendedor:</span>
                        <span class="vis-value" style="color: #333;">${escapeHtml(vendedor)}</span>
                    </div>
                    <div class="vis-info-item" style="display: flex; justify-content: space-between; padding: 0.3rem 0;">
                        <span class="vis-label" style="font-weight: 600; color: #666;">Data:</span>
                        <span class="vis-value" style="color: #333;">${dataAtual}</span>
                    </div>
                </div>
                
                ${cargosHTML}
                
                <div class="vis-total-geral" style="background: linear-gradient(135deg, #c10404 0%, #a00303 100%); color: #fff; padding: 1.5rem; border-radius: 16px; text-align: center; margin: 2rem 0; display: flex; justify-content: space-between; align-items: center; font-size: 1.2rem;">
                    <strong>TOTAL DA PROPOSTA:</strong>
                    <span style="font-size: 1.8rem; font-weight: bold;">${formatarMoeda(totalGeralProposta)}</span>
                </div>
                
                <div class="vis-footer" style="text-align: center; padding: 1rem; color: #888; font-size: 0.8rem; border-top: 1px solid #e0e0e0; margin-top: 1rem;">
                    <p>Documento gerado em ${dataAtual}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(elementoVisualizacao);
        
        // Usar html2canvas para gerar a imagem
        const canvas = await html2canvas(elementoVisualizacao, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: false
        });
        
        // Remover o elemento temporário
        document.body.removeChild(elementoVisualizacao);
        
        // Criar link para download
        const link = document.createElement('a');
        const clienteNome = cliente.replace(/[^a-zA-Z0-9]/g, '_');
        const dataAtualFormatada = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `Proposta_${clienteNome}_${dataAtualFormatada}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        alert('Erro ao gerar imagem. Tente novamente.');
    } finally {
        // Restaurar botão
        if (btnBaixar) {
            btnBaixar.innerHTML = textoOriginal;
            btnBaixar.disabled = false;
        }
    }
}

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('cargos-container');
    const btnAdicionar = document.getElementById('adicionar-cargo');
    const totalGeralEl = document.getElementById('total-geral');
    const clienteInput = document.getElementById('cliente-nome');
    const btnVoltar = document.getElementById('btn-voltar');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalMensagem = document.getElementById('modal-mensagem');
    const modalOk = document.getElementById('modal-ok');

    function mostrarModal(mensagem) {
        modalMensagem.textContent = mensagem;
        modalOverlay.classList.remove('hidden');
    }

    modalOk.addEventListener('click', () => modalOverlay.classList.add('hidden'));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
    });

    btnVoltar.addEventListener('click', () => {
        localStorage.removeItem(DRAFT_KEY);
        window.location.href = 'menu.html';
    });

    clienteInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
        salvarRascunho();
    });

    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function calcularTotalGeral() {
        let total = 0;
        document.querySelectorAll('.cargo-item').forEach(item => {
            // Busca o elemento que contém o TOTAL FINAL DA VAGA
            const totalVagaElem = item.querySelector('.total-prestacao .valor');
            if (totalVagaElem) {
                // Extrai o valor do texto (ex: "R$ 12.204,55")
                const totalText = totalVagaElem.textContent;
                // Converte para número (remove R$, pontos e troca vírgula por ponto)
                const totalValor = parseFloat(totalText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                total += totalValor;
            }
        });
        // Atualiza o elemento na tela
        totalGeralEl.textContent = formatarMoeda(total);
        return total;
    }

    // ========== FUNÇÃO PARA SALVAR RASCUNHO ==========
    function salvarRascunho() {
        try {
            const dados = {
                cliente: document.getElementById('cliente-nome').value,
                cargos: []
            };
            
            document.querySelectorAll('.cargo-item').forEach(item => {
                const cargo = {
                    nome: item.querySelector('.cargo-nome')?.value || '',
                    quantidade: item.querySelector('.cargo-quantidade')?.value || 1,
                    salario: item.querySelector('.cargo-salario')?.value || '',
                    encargosPercentual: item.querySelector('.encargos-percentual')?.value || '113,00'
                };
                
                // ========== CAPTURAR ADICIONAIS ==========
                const adicionaisSection = item.querySelector('.expandable-section .adicionais-grid')?.closest('.expandable-section') 
                    || item.querySelector('.expandable-section:first-child');
                
                const adicionaisContent = adicionaisSection?.querySelector('.section-content');
                
                if (adicionaisContent) {
                    cargo.adicionais = {
                        horasExtras: adicionaisContent.querySelector('.he-check')?.checked || false,
                        noturno: adicionaisContent.querySelector('.an-check')?.checked || false,
                        periculosidade: adicionaisContent.querySelector('.per-check')?.checked || false,
                        insalubridade: adicionaisContent.querySelector('.ins-check')?.checked || false,
                        heHoras: parseFloat(adicionaisContent.querySelector('.he-horas')?.value) || 0,
                        anHoras: parseFloat(adicionaisContent.querySelector('.an-horas')?.value) || 0,
                        // ACÚMULO DE FUNÇÃO
                        acumulo: adicionaisContent.querySelector('.acumulo-check')?.checked || false,
                        acumuloQuantidade: parseInt(adicionaisContent.querySelector('.acumulo-quantidade')?.value) || 0
                    };
                } else {
                    cargo.adicionais = {
                        horasExtras: false,
                        noturno: false,
                        periculosidade: false,
                        insalubridade: false,
                        heHoras: 0,
                        anHoras: 0,
                        acumulo: false,
                        acumuloQuantidade: 0
                    };
                }
                
                // ========== CAPTURAR UNIFORMES ==========
                cargo.uniformes = {};
                const uniformesBox = item.querySelector('.uniformes-box');
                if (uniformesBox) {
                    uniformesBox.querySelectorAll('.item-lista').forEach(lista => {
                        const nome = lista.querySelector('.item-nome')?.textContent;
                        const qtdInput = lista.querySelector('.quantidade-uniforme');
                        const depInput = lista.querySelector('.depreciacao-uniforme');
                        if (nome && qtdInput && parseInt(qtdInput.value) > 0) {
                            cargo.uniformes[nome] = {
                                quantidade: parseInt(qtdInput.value),
                                depreciacao: parseInt(depInput?.value) || 1
                            };
                        }
                    });
                }
                
                // ========== CAPTURAR EPIs ==========
                cargo.epis = {};
                const episBox = item.querySelector('.epis-box');
                if (episBox) {
                    episBox.querySelectorAll('.item-lista').forEach(lista => {
                        const nome = lista.querySelector('.item-nome')?.textContent;
                        const qtdInput = lista.querySelector('.quantidade-epi');
                        const depInput = lista.querySelector('.depreciacao-epi');
                        if (nome && qtdInput && parseInt(qtdInput.value) > 0) {
                            cargo.epis[nome] = {
                                quantidade: parseInt(qtdInput.value),
                                depreciacao: parseInt(depInput?.value) || 1
                            };
                        }
                    });
                }
                
                // ========== CAPTURAR BENEFÍCIOS ==========
                cargo.beneficios = {};
                cargo.beneficiosPersonalizados = [];
                
                const beneficiosSection = item.querySelectorAll('.expandable-section')[2];
                if (beneficiosSection) {
                    beneficiosSection.querySelectorAll('.beneficio-fixo-card').forEach(card => {
                        const campo = card.querySelector('.beneficio-valor')?.dataset.campo;
                        const valorInput = card.querySelector('.beneficio-valor');
                        const diasInput = card.querySelector('.beneficio-dias');
                        if (campo) {
                            const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                            const dias = parseInt(diasInput?.value) || 0;
                            if (valor > 0 || dias > 0) {
                                cargo.beneficios[campo] = { valorDiario: valor, dias: dias };
                            }
                        }
                    });
                    
                    beneficiosSection.querySelectorAll('.beneficio-custom-card').forEach(card => {
                        const nomeInput = card.querySelector('.beneficio-custom-nome');
                        const valorInput = card.querySelector('.beneficio-custom-valor');
                        const diasInput = card.querySelector('.beneficio-custom-dias');
                        const nome = nomeInput?.value || '';
                        const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                        const dias = parseInt(diasInput?.value) || 0;
                        if (nome && (valor > 0 || dias > 0)) {
                            cargo.beneficiosPersonalizados.push({ nome, valorDiario: valor, dias });
                        }
                    });
                }
                
                // ========== CAPTURAR SEGURANÇA ==========
                cargo.seguranca = {};
                const segurancaSection = item.querySelectorAll('.expandable-section')[3];
                if (segurancaSection) {
                    segurancaSection.querySelectorAll('.seguranca-item').forEach(card => {
                        const campo = card.querySelector('.seguranca-valor')?.dataset.campo;
                        const valorInput = card.querySelector('.seguranca-valor');
                        const depInput = card.querySelector('.seguranca-depreciacao');
                        if (campo) {
                            const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                            const depreciacao = parseInt(depInput?.value) || 1;
                            if (valor > 0) {
                                cargo.seguranca[campo] = { valor: valor, depreciacao: depreciacao };
                            }
                        }
                    });
                }
                
                // ========== CAPTURAR EXAMES ==========
                cargo.exames = {};
                cargo.treinamento = 0;
                const examesSection = item.querySelector('.exames-section');
                if (examesSection) {
                    examesSection.querySelectorAll('.exame-checkbox').forEach(cb => {
                        if (cb.checked) {
                            cargo.exames[cb.dataset.nome] = true;
                        }
                    });
                    
                    const treinamentoInput = examesSection.querySelector('.treinamento-valor');
                    if (treinamentoInput) {
                        cargo.treinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                    }
                }
                
                // ========== CAPTURAR INSUMOS ==========
                cargo.insumos = {};
                const insumosSection = item.querySelectorAll('.expandable-section')[5];
                if (insumosSection) {
                    insumosSection.querySelectorAll('.insumo-card').forEach(card => {
                        const campo = card.querySelector('.insumo-valor')?.dataset.campo;
                        const valorInput = card.querySelector('.insumo-valor');
                        if (campo) {
                            const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                            if (valor > 0) {
                                cargo.insumos[campo] = { valor: valor };
                            }
                        }
                    });
                }
                
                dados.cargos.push(cargo);
            });
            
            localStorage.setItem(DRAFT_KEY, JSON.stringify(dados));
            console.log('Rascunho salvo com sucesso!', dados);
        } catch (e) {
            console.error('Erro ao salvar rascunho:', e);
        }
    }
    
    // ========== FUNÇÃO PARA CARREGAR RASCUNHO ==========
    function carregarRascunho() {
        try {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
                const dadosRascunho = JSON.parse(draft);
                if (dadosRascunho.cliente) {
                    document.getElementById('cliente-nome').value = dadosRascunho.cliente;
                }
                if (dadosRascunho.cargos && dadosRascunho.cargos.length > 0) {
                    const container = document.getElementById('cargos-container');
                    container.innerHTML = '';
                    dadosRascunho.cargos.forEach(c => {
                        const examesObj = c.exames || {};
                        
                        container.appendChild(criarCargoItem(
                            c.nome,
                            c.quantidade,
                            parseFloat(c.salario?.replace(/\./g, '').replace(',', '.')) || 0,
                            c.adicionais || {},  // Inclui acumulo e acumuloQuantidade
                            c.uniformes || {},
                            c.epis || {},
                            c.beneficios || {},
                            c.seguranca || {},
                            examesObj,
                            c.insumos || {},
                            { encargos_fiscais: { porcentagem: 13.75 } },
                            c.treinamento || 0,
                            c.beneficiosPersonalizados || []
                        ));
                    });
                    calcularTotalGeral();
                    return true;
                }
            }
        } catch (e) {
            console.error('Erro ao carregar rascunho:', e);
        }
        return false;
    }

    // ========== FUNÇÃO PARA CRIAR SEÇÃO EXPANSÍVEL ==========
    function criarSecaoExpansivel(titulo, icone, conteudoHtml, iniciarRetraido = true) {
        const section = document.createElement('div');
        section.className = 'expandable-section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <div class="section-title">
                <i class="fas ${icone}"></i>
                <span>${titulo}</span>
            </div>
            <div class="section-summary">
                <span class="summary-label">Subtotal:</span>
                <span class="summary-value">R$ 0,00</span>
                <i class="fas fa-chevron-down section-toggle"></i>  <!-- Mudado: sempre começa com chevron-down -->
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'section-content';
        content.innerHTML = conteudoHtml;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = !iniciarRetraido;  // Se iniciar retraído, isExpanded = false
        
        if (iniciarRetraido) {
            content.classList.add('collapsed');
            // Quando fechado (retraído), seta pra BAIXO (chevron-down)
            header.querySelector('.section-toggle').classList.remove('fa-chevron-up');
            header.querySelector('.section-toggle').classList.add('fa-chevron-down');
        } else {
            // Quando aberto, seta pra CIMA (chevron-up)
            header.querySelector('.section-toggle').classList.remove('fa-chevron-down');
            header.querySelector('.section-toggle').classList.add('fa-chevron-up');
        }
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            if (isExpanded) {
                content.classList.remove('collapsed');
                // ABERTO: seta pra CIMA
                header.querySelector('.section-toggle').classList.remove('fa-chevron-down');
                header.querySelector('.section-toggle').classList.add('fa-chevron-up');
            } else {
                content.classList.add('collapsed');
                // FECHADO: seta pra BAIXO
                header.querySelector('.section-toggle').classList.remove('fa-chevron-up');
                header.querySelector('.section-toggle').classList.add('fa-chevron-down');
            }
        });
        
        function updateSummary(value) {
            const summaryValue = header.querySelector('.summary-value');
            if (summaryValue) {
                summaryValue.textContent = formatarMoeda(value);
            }
        }
        
        return { section, updateSummary, content };
    }

    // ========== FUNÇÕES AUXILIARES ==========
    function criarItemListaComDepreciacao(item, tipo) {
        const div = document.createElement('div');
        div.className = 'item-lista';
        div.innerHTML = `
            <div class="item-header">
                <span class="item-nome">${item.nome}</span>
                <span class="item-preco">${formatarMoeda(item.preco)}</span>
            </div>
            <div class="item-inputs">
                <div class="item-input">
                    <input type="number" min="0" step="1" value="0" class="quantidade-${tipo}" data-preco="${item.preco}">
                    <span>un.</span>
                </div>
                <div class="item-input">
                    <input type="number" min="1" step="1" value="1" class="depreciacao-${tipo}" data-preco="${item.preco}">
                    <span>depreciação (meses)</span>
                </div>
            </div>
            <div class="item-totals">
                <span class="item-total">Total: R$ 0,00</span>
                <span class="item-mensal">Mensal: R$ 0,00</span>
            </div>
        `;
        
        const quantidadeInput = div.querySelector(`.quantidade-${tipo}`);
        const depreciacaoInput = div.querySelector(`.depreciacao-${tipo}`);
        const totalSpan = div.querySelector('.item-total');
        const mensalSpan = div.querySelector('.item-mensal');
        
        function atualizar() {
            const qtd = parseInt(quantidadeInput.value) || 0;
            const depreciacao = parseInt(depreciacaoInput.value) || 1;
            const total = qtd * item.preco;
            const mensal = total / depreciacao;
            totalSpan.textContent = `Total: ${formatarMoeda(total)}`;
            mensalSpan.textContent = `Mensal: ${formatarMoeda(mensal)}`;
            return { total, mensal };
        }
        
        quantidadeInput.addEventListener('input', atualizar);
        depreciacaoInput.addEventListener('input', atualizar);
        atualizar();
        
        return { 
            div, 
            atualizar, 
            getQuantidade: () => parseInt(quantidadeInput.value) || 0, 
            getDepreciacao: () => parseInt(depreciacaoInput.value) || 1, 
            getMensal: () => {
                const qtd = parseInt(quantidadeInput.value) || 0;
                const depreciacao = parseInt(depreciacaoInput.value) || 1;
                return (qtd * item.preco) / depreciacao;
            },
            getTotal: () => {
                const qtd = parseInt(quantidadeInput.value) || 0;
                return qtd * item.preco;
            }
        };
    }

    function criarUniformesEpisSection(cargoItem, dadosUniformes = {}, dadosEpis = {}) {
        const section = document.createElement('div');
        section.className = 'expandable-section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <div class="section-title">
                <i class="fas fa-tshirt"></i>
                <span>Uniformes e EPIs</span>
            </div>
            <div class="section-summary">
                <span class="summary-label">Subtotal Mensal:</span>
                <span class="summary-value">R$ 0,00</span>
                <i class="fas fa-chevron-down section-toggle"></i>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'section-content';
        content.innerHTML = `
            <div class="uniformes-epis-container">
                <div class="uniformes-box">
                    <div class="box-header">
                        <h4><i class="fas fa-shirt"></i> Uniformes</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-menu uniformes-menu"></div>
                    <div class="uniformes-total">
                        <div>Total Mensal Uniformes: <span>R$ 0,00</span></div>
                        <div class="uniformes-total-geral" style="font-size: 0.8rem; color: #c10404; margin-top: 0.25rem;">Total para ${cargoItem ? (cargoItem.querySelector('.cargo-quantidade')?.value || 1) : 1} funcionário(s): <strong>R$ 0,00</strong></div>
                    </div>
                </div>
                <div class="epis-box">
                    <div class="box-header">
                        <h4><i class="fas fa-hard-hat"></i> EPIs</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-menu epis-menu"></div>
                    <div class="epis-total">
                        <div>Total Mensal EPIs: <span>R$ 0,00</span></div>
                        <div class="epis-total-geral" style="font-size: 0.8rem; color: #c10404; margin-top: 0.25rem;">Total para ${cargoItem ? (cargoItem.querySelector('.cargo-quantidade')?.value || 1) : 1} funcionário(s): <strong>R$ 0,00</strong></div>
                    </div>
                </div>
            </div>
        `;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = false;
        content.classList.add('collapsed');
        header.querySelector('.section-toggle').classList.remove('fa-chevron-up');
        header.querySelector('.section-toggle').classList.add('fa-chevron-down');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            if (isExpanded) {
                content.classList.remove('collapsed');
                header.querySelector('.section-toggle').classList.remove('fa-chevron-down');
                header.querySelector('.section-toggle').classList.add('fa-chevron-up');
            } else {
                content.classList.add('collapsed');
                header.querySelector('.section-toggle').classList.remove('fa-chevron-up');
                header.querySelector('.section-toggle').classList.add('fa-chevron-down');
            }
        });
        
        const uniformesBox = content.querySelector('.uniformes-box');
        const episBox = content.querySelector('.epis-box');
        const uniformesMenu = content.querySelector('.uniformes-menu');
        const episMenu = content.querySelector('.epis-menu');
        const uniformesTotalSpan = content.querySelector('.uniformes-total span');
        const episTotalSpan = content.querySelector('.epis-total span');
        const uniformesTotalGeralSpan = content.querySelector('.uniformes-total-geral strong');
        const episTotalGeralSpan = content.querySelector('.epis-total-geral strong');
        
        const uniformesItems = [];
        const episItems = [];
        const uniformesCustomItems = [];
        const episCustomItems = [];
        
        // Função para criar item personalizado (uniforme ou EPI) que vai dentro do dropdown
        function criarItemPersonalizadoDropdown(tipo, itemData = null) {
            const div = document.createElement('div');
            div.className = 'item-custom item-lista';
            div.style.cssText = 'margin-bottom: 0.8rem; padding-bottom: 0.5rem; border-bottom: 1px solid #2a2a2a;';
            
            const nome = itemData?.nome || '';
            const preco = itemData?.preco || 0;
            const quantidade = itemData?.quantidade || 0;
            const depreciacao = itemData?.depreciacao || 1;
            
            div.innerHTML = `
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.2rem;">
                    <input type="text" class="item-custom-nome" placeholder="Nome do item" value="${nome}" style="background: transparent; border: none; color: #c10404; font-weight: 600; width: 60%; padding: 0; font-size: 0.85rem;">
                    <span class="item-preco" style="font-size: 0.75rem; color: #c10404;">R$ <span class="preco-valor">${preco.toFixed(2).replace('.', ',')}</span></span>
                </div>
                <div class="item-inputs" style="display: flex; gap: 0.5rem; margin-top: 0.3rem; flex-wrap: wrap;">
                    <div class="item-input" style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.7rem;">Preço:</span>
                        <input type="text" class="item-custom-preco-input" placeholder="0,00" value="${preco.toFixed(2).replace('.', ',')}" style="width: 70px; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; padding: 0.2rem 0.4rem; color: #fff; text-align: center; font-size: 0.75rem;">
                    </div>
                    <div class="item-input" style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.7rem;">Quantidade:</span>
                        <input type="number" min="0" step="1" value="${quantidade}" class="item-custom-quantidade-input" style="width: 60px; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; padding: 0.2rem 0.4rem; color: #fff; text-align: center; font-size: 0.75rem;">
                    </div>
                    <div class="item-input" style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.7rem;">Depreciação:</span>
                        <input type="number" min="1" step="1" value="${depreciacao}" class="item-custom-depreciacao-input" style="width: 60px; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; padding: 0.2rem 0.4rem; color: #fff; text-align: center; font-size: 0.75rem;">
                        <span style="font-size: 0.7rem;">meses</span>
                    </div>
                    <button type="button" class="btn-remover-custom" style="background: transparent; border: none; color: #c10404; cursor: pointer; padding: 0.2rem; margin-left: auto;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="item-totals" style="margin-top: 0.3rem; font-size: 0.75rem; display: flex; justify-content: space-between;">
                    <span class="item-total">Total: R$ 0,00</span>
                    <span class="item-mensal">Mensal: R$ 0,00</span>
                </div>
            `;
            
            const nomeInput = div.querySelector('.item-custom-nome');
            const precoInput = div.querySelector('.item-custom-preco-input');
            const quantidadeInput = div.querySelector('.item-custom-quantidade-input');
            const depreciacaoInput = div.querySelector('.item-custom-depreciacao-input');
            const totalSpan = div.querySelector('.item-total');
            const mensalSpan = div.querySelector('.item-mensal');
            const precoSpan = div.querySelector('.preco-valor');
            
            function atualizar() {
                const preco = parseFloat(precoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                const qtd = parseInt(quantidadeInput.value) || 0;
                const depreciacao = parseInt(depreciacaoInput.value) || 1;
                const total = qtd * preco;
                const mensal = total / depreciacao;
                totalSpan.textContent = `Total: ${formatarMoeda(total)}`;
                mensalSpan.textContent = `Mensal: ${formatarMoeda(mensal)}`;
                if (precoSpan) precoSpan.textContent = preco.toFixed(2).replace('.', ',');
                return { total, mensal, preco, qtd, depreciacao };
            }
            
            precoInput.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                atualizar();
                calcularTotais();
                salvarRascunho();
            });
            
            quantidadeInput.addEventListener('input', () => {
                atualizar();
                calcularTotais();
                salvarRascunho();
            });
            
            depreciacaoInput.addEventListener('input', () => {
                atualizar();
                calcularTotais();
                salvarRascunho();
            });
            
            nomeInput.addEventListener('input', () => {
                salvarRascunho();
            });
            
            const btnRemover = div.querySelector('.btn-remover-custom');
            btnRemover.addEventListener('click', () => {
                div.remove();
                const index = (tipo === 'uniforme' ? uniformesCustomItems : episCustomItems).findIndex(item => item.div === div);
                if (index !== -1) (tipo === 'uniforme' ? uniformesCustomItems : episCustomItems).splice(index, 1);
                calcularTotais();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            });
            
            atualizar();
            
            return {
                div,
                getNome: () => nomeInput.value,
                getPreco: () => parseFloat(precoInput.value.replace(/\./g, '').replace(',', '.')) || 0,
                getQuantidade: () => parseInt(quantidadeInput.value) || 0,
                getDepreciacao: () => parseInt(depreciacaoInput.value) || 1,
                getTotal: () => {
                    const preco = parseFloat(precoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const qtd = parseInt(quantidadeInput.value) || 0;
                    return qtd * preco;
                },
                getMensal: () => {
                    const preco = parseFloat(precoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const qtd = parseInt(quantidadeInput.value) || 0;
                    const depreciacao = parseInt(depreciacaoInput.value) || 1;
                    return (qtd * preco) / depreciacao;
                },
                atualizar
            };
        }
        
        // Função para criar botão "Adicionar Personalizado" dentro do dropdown
        function criarBotaoAdicionarCustom(tipo) {
            const btnDiv = document.createElement('div');
            btnDiv.className = 'btn-add-custom-container';
            btnDiv.style.cssText = 'margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed #c10404;';
            btnDiv.innerHTML = `
                <button type="button" class="btn-add-custom-${tipo}" style="background: transparent; border: 1px dashed #c10404; color: #c10404; padding: 0.3rem; border-radius: 20px; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem; font-size: 0.75rem;">
                    <i class="fas fa-plus-circle"></i> Adicionar ${tipo === 'uniforme' ? 'Uniforme' : 'EPI'} Personalizado
                </button>
            `;
            return btnDiv;
        }
        
        // Adicionar itens padrão ao menu de uniformes
        UNIFORMES.forEach(u => {
            const { div, atualizar, getQuantidade, getDepreciacao, getMensal, getTotal } = criarItemListaComDepreciacao(u, 'uniforme');
            const quantidadeInput = div.querySelector('.quantidade-uniforme');
            const depreciacaoInput = div.querySelector('.depreciacao-uniforme');
            if (dadosUniformes && dadosUniformes[u.nome]) {
                quantidadeInput.value = dadosUniformes[u.nome].quantidade || 0;
                depreciacaoInput.value = dadosUniformes[u.nome].depreciacao || 1;
                atualizar();
            }
            uniformesMenu.appendChild(div);
            uniformesItems.push({ 
                atualizar, 
                getQuantidade, 
                getDepreciacao,
                getMensal,
                getTotal,
                getPreco: () => u.preco,
                getNome: () => u.nome,
                div
            });
        });
        
        // Carregar uniformes personalizados existentes dentro do dropdown
        if (dadosUniformes && dadosUniformes.custom) {
            dadosUniformes.custom.forEach(item => {
                const customItem = criarItemPersonalizadoDropdown('uniforme', item);
                uniformesMenu.appendChild(customItem.div);
                uniformesCustomItems.push(customItem);
            });
        }
        
        // Adicionar botão de adicionar personalizado no final do menu de uniformes
        const btnUniformeCustom = criarBotaoAdicionarCustom('uniforme');
        uniformesMenu.appendChild(btnUniformeCustom);
        btnUniformeCustom.querySelector('.btn-add-custom-uniforme').addEventListener('click', () => {
            const customItem = criarItemPersonalizadoDropdown('uniforme');
            uniformesMenu.insertBefore(customItem.div, btnUniformeCustom);
            uniformesCustomItems.push(customItem);
            calcularTotais();
            salvarRascunho();
        });
        
        // Adicionar itens padrão ao menu de EPIs
        EPIS.forEach(e => {
            const { div, atualizar, getQuantidade, getDepreciacao, getMensal, getTotal } = criarItemListaComDepreciacao(e, 'epi');
            const quantidadeInput = div.querySelector('.quantidade-epi');
            const depreciacaoInput = div.querySelector('.depreciacao-epi');
            if (dadosEpis && dadosEpis[e.nome]) {
                quantidadeInput.value = dadosEpis[e.nome].quantidade || 0;
                depreciacaoInput.value = dadosEpis[e.nome].depreciacao || 1;
                atualizar();
            }
            episMenu.appendChild(div);
            episItems.push({ 
                atualizar, 
                getQuantidade, 
                getDepreciacao,
                getMensal,
                getTotal,
                getPreco: () => e.preco,
                getNome: () => e.nome,
                div
            });
        });
        
        // Carregar EPIs personalizados existentes dentro do dropdown
        if (dadosEpis && dadosEpis.custom) {
            dadosEpis.custom.forEach(item => {
                const customItem = criarItemPersonalizadoDropdown('epi', item);
                episMenu.appendChild(customItem.div);
                episCustomItems.push(customItem);
            });
        }
        
        // Adicionar botão de adicionar personalizado no final do menu de EPIs
        const btnEpiCustom = criarBotaoAdicionarCustom('epi');
        episMenu.appendChild(btnEpiCustom);
        btnEpiCustom.querySelector('.btn-add-custom-epi').addEventListener('click', () => {
            const customItem = criarItemPersonalizadoDropdown('epi');
            episMenu.insertBefore(customItem.div, btnEpiCustom);
            episCustomItems.push(customItem);
            calcularTotais();
            salvarRascunho();
        });
        
        function calcularTotalUniformeMensal() {
            let total = 0;
            uniformesItems.forEach(item => {
                total += item.getMensal();
            });
            uniformesCustomItems.forEach(item => {
                total += item.getMensal();
            });
            uniformesTotalSpan.textContent = formatarMoeda(total);
            return total;
        }
        
        function calcularTotalUniformeGeral(qtdFuncionarios) {
            let total = 0;
            uniformesItems.forEach(item => {
                total += item.getTotal();
            });
            uniformesCustomItems.forEach(item => {
                total += item.getTotal();
            });
            return total * qtdFuncionarios;
        }
        
        function calcularTotalEpiMensal() {
            let total = 0;
            episItems.forEach(item => {
                total += item.getMensal();
            });
            episCustomItems.forEach(item => {
                total += item.getMensal();
            });
            episTotalSpan.textContent = formatarMoeda(total);
            return total;
        }
        
        function calcularTotalEpiGeral(qtdFuncionarios) {
            let total = 0;
            episItems.forEach(item => {
                total += item.getTotal();
            });
            episCustomItems.forEach(item => {
                total += item.getTotal();
            });
            return total * qtdFuncionarios;
        }
        
        function calcularTotais() {
            const totalUniforme = calcularTotalUniformeMensal();
            const totalEpi = calcularTotalEpiMensal();
            const totalGeral = totalUniforme + totalEpi;
            header.querySelector('.summary-value').textContent = formatarMoeda(totalGeral);
            
            const qtdFuncionarios = parseInt(cargoItem?.querySelector('.cargo-quantidade')?.value) || 1;
            const totalUniformeGeral = calcularTotalUniformeGeral(qtdFuncionarios);
            const totalEpiGeral = calcularTotalEpiGeral(qtdFuncionarios);
            
            if (uniformesTotalGeralSpan) {
                uniformesTotalGeralSpan.textContent = formatarMoeda(totalUniformeGeral);
            }
            if (episTotalGeralSpan) {
                episTotalGeralSpan.textContent = formatarMoeda(totalEpiGeral);
            }
            
            const uniformesTotalGeralDiv = content.querySelector('.uniformes-total-geral');
            const episTotalGeralDiv = content.querySelector('.epis-total-geral');
            if (uniformesTotalGeralDiv) {
                uniformesTotalGeralDiv.innerHTML = `Total para ${qtdFuncionarios} funcionário(s): <strong>${formatarMoeda(totalUniformeGeral)}</strong>`;
            }
            if (episTotalGeralDiv) {
                episTotalGeralDiv.innerHTML = `Total para ${qtdFuncionarios} funcionário(s): <strong>${formatarMoeda(totalEpiGeral)}</strong>`;
            }
            
            return { totalUniforme, totalEpi, totalGeral };
        }
        
        // Event listeners para itens padrão
        uniformesItems.forEach(item => {
            item.div.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => {
                    calcularTotais();
                    if (cargoItem && cargoItem.dispatchEvent) {
                        cargoItem.dispatchEvent(new Event('recalcular'));
                    }
                    salvarRascunho();
                });
            });
        });
        
        episItems.forEach(item => {
            item.div.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => {
                    calcularTotais();
                    if (cargoItem && cargoItem.dispatchEvent) {
                        cargoItem.dispatchEvent(new Event('recalcular'));
                    }
                    salvarRascunho();
                });
            });
        });
        
        // Listener para quantidade de funcionários
        if (cargoItem) {
            const qtdInput = cargoItem.querySelector('.cargo-quantidade');
            if (qtdInput) {
                qtdInput.addEventListener('input', () => {
                    calcularTotais();
                });
            }
        }
        
        // Dropdown toggle
        const uniformesHeader = uniformesBox.querySelector('.box-header');
        const episHeader = episBox.querySelector('.box-header');
        const uniformesMenuEl = uniformesMenu;
        const episMenuEl = episMenu;
        const uniformesIcon = uniformesHeader.querySelector('i');
        const episIcon = episHeader.querySelector('i');
        
        function toggleDropdown(headerEl, menu, icon) {
            const isOpen = menu.classList.contains('open');
            document.querySelectorAll('.dropdown-menu.open').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('open');
                    const prevHeader = m.previousElementSibling;
                    if (prevHeader && prevHeader.classList.contains('box-header')) {
                        const prevIcon = prevHeader.querySelector('i');
                        if (prevIcon) {
                            prevIcon.classList.remove('fa-chevron-up');
                            prevIcon.classList.add('fa-chevron-down');
                        }
                        prevHeader.classList.remove('open');
                    }
                }
            });
            if (!isOpen) {
                menu.classList.add('open');
                headerEl.classList.add('open');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
                menu.style.zIndex = '10000';
            } else {
                menu.classList.remove('open');
                headerEl.classList.remove('open');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
                menu.style.zIndex = '';
            }
        }
        
        uniformesHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(uniformesHeader, uniformesMenuEl, uniformesIcon);
        });
        
        episHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(episHeader, episMenuEl, episIcon);
        });
        
        document.addEventListener('click', function(e) {
            if (!section.contains(e.target)) {
                document.querySelectorAll('.dropdown-menu.open').forEach(menu => {
                    menu.classList.remove('open');
                    const prevHeader = menu.previousElementSibling;
                    if (prevHeader && prevHeader.classList.contains('box-header')) {
                        const prevIcon = prevHeader.querySelector('i');
                        if (prevIcon) {
                            prevIcon.classList.remove('fa-chevron-up');
                            prevIcon.classList.add('fa-chevron-down');
                        }
                        prevHeader.classList.remove('open');
                    }
                    menu.style.zIndex = '';
                });
            }
        });
        
        uniformesMenuEl.addEventListener('click', (e) => e.stopPropagation());
        episMenuEl.addEventListener('click', (e) => e.stopPropagation());
        
        calcularTotais();
        
        return { 
            section, 
            atualizarTotais: calcularTotais, 
            getDados: () => {
                const uniformes = {};
                uniformesItems.forEach(item => {
                    const qtd = item.getQuantidade();
                    if (qtd > 0) {
                        uniformes[item.getNome()] = {
                            quantidade: qtd,
                            depreciacao: item.getDepreciacao()
                        };
                    }
                });
                
                const uniformesCustom = [];
                uniformesCustomItems.forEach(item => {
                    const nome = item.getNome();
                    const qtd = item.getQuantidade();
                    const preco = item.getPreco();
                    const depreciacao = item.getDepreciacao();
                    if (nome && qtd > 0 && preco > 0) {
                        uniformesCustom.push({
                            nome: nome,
                            preco: preco,
                            quantidade: qtd,
                            depreciacao: depreciacao
                        });
                    }
                });
                if (uniformesCustom.length > 0) {
                    uniformes.custom = uniformesCustom;
                }
                
                const epis = {};
                episItems.forEach(item => {
                    const qtd = item.getQuantidade();
                    if (qtd > 0) {
                        epis[item.getNome()] = {
                            quantidade: qtd,
                            depreciacao: item.getDepreciacao()
                        };
                    }
                });
                
                const episCustom = [];
                episCustomItems.forEach(item => {
                    const nome = item.getNome();
                    const qtd = item.getQuantidade();
                    const preco = item.getPreco();
                    const depreciacao = item.getDepreciacao();
                    if (nome && qtd > 0 && preco > 0) {
                        episCustom.push({
                            nome: nome,
                            preco: preco,
                            quantidade: qtd,
                            depreciacao: depreciacao
                        });
                    }
                });
                if (episCustom.length > 0) {
                    epis.custom = episCustom;
                }
                
                return { uniformes, epis };
            } 
        };
    }

    // Benefícios com nomes fixos e botão para adicionar customizados
    function criarBeneficiosSection(cargoItem, dadosBeneficios = {}, dadosBeneficiosPersonalizados = []) {
        const conteudoHtml = `
            <div class="beneficios-fixos">
                <h4 style="color: #c10404; margin-bottom: 0.8rem; font-size: 0.85rem;">Benefícios Fixos</h4>
                <div class="beneficios-fixos-grid"></div>
            </div>
            <div class="beneficios-custom">
                <h4 style="color: #c10404; margin-bottom: 0.8rem; font-size: 0.85rem; margin-top: 1rem;">Benefícios Personalizados</h4>
                <div class="beneficios-custom-grid"></div>
                <button type="button" class="btn-add-beneficio" style="background: transparent; border: 1px dashed #c10404; color: #c10404; padding: 0.5rem; border-radius: 30px; width: 100%; margin-top: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <i class="fas fa-plus-circle"></i> Adicionar Benefício
                </button>
            </div>
            <div class="beneficios-total-geral" style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid rgba(193, 4, 4, 0.3); text-align: right; font-size: 0.9rem;">
                Total para <span class="beneficios-qtd-funcionarios">1</span> funcionário(s): <strong class="beneficios-valor-geral">R$ 0,00</strong>
            </div>
        `;
        const { section, updateSummary, content } = criarSecaoExpansivel('Benefícios', 'fa-gift', conteudoHtml, true);
        const fixosGrid = content.querySelector('.beneficios-fixos-grid');
        const customGrid = content.querySelector('.beneficios-custom-grid');
        const btnAdicionar = content.querySelector('.btn-add-beneficio');
        const beneficiosTotalGeralSpan = content.querySelector('.beneficios-valor-geral');
        const beneficiosQtdFuncionariosSpan = content.querySelector('.beneficios-qtd-funcionarios');
        
        let customBeneficios = [...dadosBeneficiosPersonalizados];
        
        // Função para atualizar o total geral com a quantidade de funcionários
        function atualizarTotalGeral(totalPorFuncionario) {
            const qtdFuncionarios = parseInt(cargoItem?.querySelector('.cargo-quantidade')?.value) || 1;
            const totalGeral = totalPorFuncionario * qtdFuncionarios;
            if (beneficiosTotalGeralSpan) {
                beneficiosTotalGeralSpan.textContent = formatarMoeda(totalGeral);
            }
            if (beneficiosQtdFuncionariosSpan) {
                beneficiosQtdFuncionariosSpan.textContent = qtdFuncionarios;
            }
            return totalGeral;
        }
        
        // Criar benefícios fixos
        BENEFICIOS_FIXOS.forEach(b => {
            const card = document.createElement('div');
            card.className = 'beneficio-fixo-card';
            card.style.cssText = 'background: linear-gradient(135deg, #141414 0%, #0d0d0d 100%); border: 1px solid #2a2a2a; border-radius: 20px; padding: 0.8rem 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; flex-wrap: wrap; gap: 1rem;';
            const valorDiario = dadosBeneficios[b.campo]?.valorDiario ?? 0;
            const dias = dadosBeneficios[b.campo]?.dias ?? 0;
            card.innerHTML = `
                <div class="beneficio-nome" style="font-size: 0.9rem; font-weight: 600; color: #c10404; min-width: 120px;">${b.nome}</div>
                <div class="beneficio-campos" style="display: flex; gap: 1rem; flex: 1; justify-content: flex-start; align-items: center;">
                    <div class="beneficio-campo" style="display: flex; align-items: center; gap: 0.5rem;">
                        <label style="font-size: 0.7rem; color: #aaa; text-transform: uppercase;">R$ / dia</label>
                        <input type="text" class="beneficio-valor" data-campo="${b.campo}" placeholder="0,00" value="${valorDiario.toFixed(2).replace('.', ',')}" style="width: 90px; padding: 0.4rem 0.5rem; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; color: #fff; text-align: center;">
                    </div>
                    <div class="beneficio-campo" style="display: flex; align-items: center; gap: 0.5rem;">
                        <label style="font-size: 0.7rem; color: #aaa; text-transform: uppercase;">Dias</label>
                        <input type="number" class="beneficio-dias" data-campo="${b.campo}" placeholder="0" value="${dias}" style="width: 90px; padding: 0.4rem 0.5rem; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; color: #fff; text-align: center;">
                    </div>
                </div>
                <div class="beneficio-total" style="font-size: 0.85rem; font-weight: 600; color: #c10404; text-align: right; min-width: 100px;">Total: R$ 0,00</div>
            `;
            fixosGrid.appendChild(card);
        });
        
        // Função para criar um benefício personalizado
        function criarBeneficioCustomizado(beneficio = null) {
            const card = document.createElement('div');
            card.className = 'beneficio-custom-card';
            card.style.cssText = 'background: linear-gradient(135deg, #141414 0%, #0d0d0d 100%); border: 1px solid #2a2a2a; border-radius: 20px; padding: 0.8rem 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; flex-wrap: wrap; gap: 1rem;';
            const nome = beneficio?.nome || '';
            const valorDiario = beneficio?.valorDiario || 0;
            const dias = beneficio?.dias || 0;
            card.innerHTML = `
                <div class="beneficio-nome" style="min-width: 150px;">
                    <input type="text" class="beneficio-custom-nome" placeholder="Nome do benefício" value="${nome}" style="background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; padding: 0.4rem 0.8rem; color: #c10404; font-weight: 600; width: 100%;">
                </div>
                <div class="beneficio-campos" style="display: flex; gap: 1rem; flex: 1; justify-content: flex-start; align-items: center;">
                    <div class="beneficio-campo" style="display: flex; align-items: center; gap: 0.5rem;">
                        <label style="font-size: 0.7rem; color: #aaa; text-transform: uppercase;">R$ / dia</label>
                        <input type="text" class="beneficio-custom-valor" placeholder="0,00" value="${valorDiario.toFixed(2).replace('.', ',')}" style="width: 90px; padding: 0.4rem 0.5rem; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; color: #fff; text-align: center;">
                    </div>
                    <div class="beneficio-campo" style="display: flex; align-items: center; gap: 0.5rem;">
                        <label style="font-size: 0.7rem; color: #aaa; text-transform: uppercase;">Dias</label>
                        <input type="number" class="beneficio-custom-dias" placeholder="0" value="${dias}" style="width: 90px; padding: 0.4rem 0.5rem; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; color: #fff; text-align: center;">
                    </div>
                </div>
                <div class="beneficio-total" style="font-size: 0.85rem; font-weight: 600; color: #c10404; text-align: right; min-width: 100px;">Total: R$ 0,00</div>
                <button type="button" class="btn-remover-beneficio" style="background: transparent; border: none; color: #c10404; cursor: pointer; font-size: 1rem; padding: 0.5rem;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            const btnRemover = card.querySelector('.btn-remover-beneficio');
            btnRemover.addEventListener('click', () => {
                card.remove();
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            });
            
            return card;
        }
        
        // Adicionar benefícios personalizados existentes
        customBeneficios.forEach(b => {
            customGrid.appendChild(criarBeneficioCustomizado(b));
        });
        
        // Botão para adicionar novo benefício personalizado
        btnAdicionar.addEventListener('click', () => {
            customGrid.appendChild(criarBeneficioCustomizado());
            calcularTotal();
            salvarRascunho();
        });
        
        function calcularTotal() {
            let total = 0;
            
            // Benefícios fixos
            fixosGrid.querySelectorAll('.beneficio-fixo-card').forEach(card => {
                const valorInput = card.querySelector('.beneficio-valor');
                const diasInput = card.querySelector('.beneficio-dias');
                let valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                let dias = parseInt(diasInput.value) || 0;
                const subtotal = valor * dias;
                total += subtotal;
                const totalSpan = card.querySelector('.beneficio-total');
                totalSpan.textContent = `Total: ${formatarMoeda(subtotal)}`;
            });
            
            // Benefícios personalizados
            customGrid.querySelectorAll('.beneficio-custom-card').forEach(card => {
                const valorInput = card.querySelector('.beneficio-custom-valor');
                const diasInput = card.querySelector('.beneficio-custom-dias');
                let valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                let dias = parseInt(diasInput.value) || 0;
                const subtotal = valor * dias;
                total += subtotal;
                const totalSpan = card.querySelector('.beneficio-total');
                totalSpan.textContent = `Total: ${formatarMoeda(subtotal)}`;
            });
            
            updateSummary(total);
            atualizarTotalGeral(total);
            return total;
        }
        
        // Event listeners para benefícios fixos
        fixosGrid.querySelectorAll('.beneficio-valor, .beneficio-dias').forEach(input => {
            input.addEventListener('input', function(e) {
                if (e.target.classList.contains('beneficio-valor')) {
                    let valor = e.target.value.replace(/\D/g, '');
                    e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                }
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            });
        });
        
        // Event listeners para benefícios personalizados (delegação)
        customGrid.addEventListener('input', function(e) {
            if (e.target.classList.contains('beneficio-custom-valor')) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            } else if (e.target.classList.contains('beneficio-custom-dias')) {
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            } else if (e.target.classList.contains('beneficio-custom-nome')) {
                salvarRascunho();
            }
        });
        
        // Adicionar listener para quando a quantidade de funcionários mudar
        if (cargoItem) {
            const qtdInput = cargoItem.querySelector('.cargo-quantidade');
            if (qtdInput) {
                const totalAtual = calcularTotal();
                qtdInput.addEventListener('input', () => {
                    atualizarTotalGeral(totalAtual);
                });
            }
        }
        
        calcularTotal();
        
        return { section, calcularTotal, getDados: () => {
            const beneficios = {};
            fixosGrid.querySelectorAll('.beneficio-fixo-card').forEach(card => {
                const campo = card.querySelector('.beneficio-valor').dataset.campo;
                const valorInput = card.querySelector('.beneficio-valor');
                const diasInput = card.querySelector('.beneficio-dias');
                const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                const dias = parseInt(diasInput.value) || 0;
                if (valor > 0 || dias > 0) {
                    beneficios[campo] = { valorDiario: valor, dias: dias };
                }
            });
            
            const beneficiosPersonalizados = [];
            customGrid.querySelectorAll('.beneficio-custom-card').forEach(card => {
                const nomeInput = card.querySelector('.beneficio-custom-nome');
                const valorInput = card.querySelector('.beneficio-custom-valor');
                const diasInput = card.querySelector('.beneficio-custom-dias');
                const nome = nomeInput.value.trim();
                const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                const dias = parseInt(diasInput.value) || 0;
                if (nome && (valor > 0 || dias > 0)) {
                    beneficiosPersonalizados.push({ nome, valorDiario: valor, dias: dias });
                }
            });
            
            return { beneficios, beneficiosPersonalizados };
        } };
    }

    function criarSegurancaSection(cargoItem, dadosSeguranca = {}) {
        const conteudoHtml = `
            <div class="seguranca-grid"></div>
            <div class="seguranca-total-geral" style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid rgba(193, 4, 4, 0.3); text-align: right; font-size: 0.9rem;">
                Total para <span class="seguranca-qtd-funcionarios">1</span> funcionário(s): <strong class="seguranca-valor-geral">R$ 0,00</strong>
            </div>
        `;
        const { section, updateSummary, content } = criarSecaoExpansivel('Segurança e Seguro', 'fa-shield-alt', conteudoHtml, true);
        const grid = content.querySelector('.seguranca-grid');
        const segurancaTotalGeralSpan = content.querySelector('.seguranca-valor-geral');
        const segurancaQtdFuncionariosSpan = content.querySelector('.seguranca-qtd-funcionarios');
        
        // Função para atualizar o total geral com a quantidade de funcionários
        function atualizarTotalGeral(totalPorFuncionario) {
            const qtdFuncionarios = parseInt(cargoItem?.querySelector('.cargo-quantidade')?.value) || 1;
            const totalGeral = totalPorFuncionario * qtdFuncionarios;
            if (segurancaTotalGeralSpan) {
                segurancaTotalGeralSpan.textContent = formatarMoeda(totalGeral);
            }
            if (segurancaQtdFuncionariosSpan) {
                segurancaQtdFuncionariosSpan.textContent = qtdFuncionarios;
            }
            return totalGeral;
        }
        
        SEGURANCA_FIXOS.forEach(s => {
            const card = document.createElement('div');
            card.className = 'seguranca-item';
            const valorUnitario = dadosSeguranca[s.campo]?.valor ?? s.valor;
            const depreciacao = dadosSeguranca[s.campo]?.depreciacao ?? s.depreciacao;
            card.innerHTML = `
                <div class="seguranca-nome">${s.nome}</div>
                <div class="seguranca-campos">
                    <div class="seguranca-campo">
                        <label>Valor (R$)</label>
                        <input type="text" class="seguranca-valor" data-campo="${s.campo}" placeholder="0,00" value="${valorUnitario.toFixed(2).replace('.', ',')}">
                    </div>
                    <div class="seguranca-campo">
                        <label>Depreciação (meses)</label>
                        <input type="number" class="seguranca-depreciacao" data-campo="${s.campo}" placeholder="0" value="${depreciacao}" min="1" step="1">
                    </div>
                </div>
                <div class="seguranca-total">
                    <div>Total: R$ 0,00</div>
                    <div class="seguranca-mensal">Mensal: R$ 0,00</div>
                </div>
            `;
            grid.appendChild(card);
        });
        
        function calcularTotal() {
            let totalMensal = 0;
            let totalGeral = 0;
            grid.querySelectorAll('.seguranca-item').forEach(card => {
                const valorInput = card.querySelector('.seguranca-valor');
                const depreciacaoInput = card.querySelector('.seguranca-depreciacao');
                let valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                let depreciacao = parseInt(depreciacaoInput.value) || 1;
                const totalMensalItem = valor / depreciacao;
                totalMensal += totalMensalItem;
                totalGeral += valor;
                const totalSpan = card.querySelector('.seguranca-total');
                totalSpan.innerHTML = `
                    <div>Total: ${formatarMoeda(valor)}</div>
                    <div class="seguranca-mensal">Mensal: ${formatarMoeda(totalMensalItem)}</div>
                `;
            });
            updateSummary(totalMensal);
            atualizarTotalGeral(totalMensal);
            return { totalMensal, totalGeral };
        }
        
        grid.querySelectorAll('.seguranca-valor, .seguranca-depreciacao').forEach(input => {
            input.addEventListener('input', function(e) {
                if (e.target.classList.contains('seguranca-valor')) {
                    let valor = e.target.value.replace(/\D/g, '');
                    e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                }
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            });
        });
        
        // Adicionar listener para quando a quantidade de funcionários mudar
        if (cargoItem) {
            const qtdInput = cargoItem.querySelector('.cargo-quantidade');
            if (qtdInput) {
                const result = calcularTotal();
                qtdInput.addEventListener('input', () => {
                    atualizarTotalGeral(result.totalMensal);
                });
            }
        }
        
        calcularTotal();
        
        return { section, calcularTotal: () => calcularTotal().totalMensal, getDados: () => {
            const seguranca = {};
            grid.querySelectorAll('.seguranca-item').forEach(card => {
                const campo = card.querySelector('.seguranca-valor').dataset.campo;
                const valorInput = card.querySelector('.seguranca-valor');
                const depreciacaoInput = card.querySelector('.seguranca-depreciacao');
                const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                const depreciacao = parseInt(depreciacaoInput.value) || 1;
                if (valor > 0) {
                    seguranca[campo] = { valor: valor, depreciacao: depreciacao };
                }
            });
            return seguranca;
        } };
    }

    function criarExamesSection(cargoItem, dadosExames = {}, treinamentoValor = 0) {
        const section = document.createElement('div');
        section.className = 'exames-section';
        
        const header = document.createElement('div');
        header.className = 'exames-header';
        header.innerHTML = `
            <div class="exames-title">
                <i class="fas fa-stethoscope"></i>
                <span>Exames e Treinamentos</span>
            </div>
            <div class="exames-summary">
                <span class="summary-label">Subtotal:</span>
                <span class="summary-value">R$ 0,00</span>
                <i class="fas fa-chevron-down exames-toggle"></i>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'exames-content';
        content.innerHTML = `
            <div class="exames-grid">
                <div class="exames-box">
                    <div class="box-header">
                        <h4><i class="fas fa-notes-medical"></i> Exames</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-menu exames-menu"></div>
                    <div class="exames-total">Total Exames: <span>R$ 0,00</span></div>
                </div>
                <div class="treinamento-box">
                    <h4><i class="fas fa-chalkboard-user"></i> NR / Ordem de Serviços / Treinamentos</h4>
                    <div class="treinamento-input">
                        <span>R$</span>
                        <input type="text" class="treinamento-valor" placeholder="0,00" value="${treinamentoValor.toFixed(2).replace('.', ',')}">
                    </div>
                </div>
            </div>
            <div class="exames-resumo">
                Total da seção: <span class="total-secao">R$ 0,00</span>
            </div>
            <div class="exames-total-geral" style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid rgba(193, 4, 4, 0.3); text-align: right; font-size: 0.9rem;">
                Total para <span class="exames-qtd-funcionarios">1</span> funcionário(s): <strong class="exames-valor-geral">R$ 0,00</strong>
            </div>
        `;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = false;
        content.classList.add('collapsed');
        header.querySelector('.exames-toggle').classList.remove('fa-chevron-up');
        header.querySelector('.exames-toggle').classList.add('fa-chevron-down');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            if (isExpanded) {
                content.classList.remove('collapsed');
                header.querySelector('.exames-toggle').classList.remove('fa-chevron-down');
                header.querySelector('.exames-toggle').classList.add('fa-chevron-up');
            } else {
                content.classList.add('collapsed');
                header.querySelector('.exames-toggle').classList.remove('fa-chevron-up');
                header.querySelector('.exames-toggle').classList.add('fa-chevron-down');
            }
        });
        
        const examesBox = content.querySelector('.exames-box');
        const examesMenu = content.querySelector('.exames-menu');
        const examesTotalSpan = content.querySelector('.exames-total span');
        const treinamentoInput = content.querySelector('.treinamento-valor');
        const totalSecaoSpan = content.querySelector('.total-secao');
        const examesTotalGeralSpan = content.querySelector('.exames-valor-geral');
        const examesQtdFuncionariosSpan = content.querySelector('.exames-qtd-funcionarios');
        
        const examesItems = [];
        const examesCustomItems = [];
        
        // Função para criar exame personalizado DENTRO DO DROPDOWN
        function criarExamePersonalizadoDropdown(exameData = null) {
            const div = document.createElement('div');
            div.className = 'exame-custom-item item-lista';
            div.style.cssText = 'margin-bottom: 0.8rem; padding-bottom: 0.5rem; border-bottom: 1px solid #2a2a2a;';
            
            const nome = exameData?.nome || '';
            const preco = exameData?.preco || 0;
            const isChecked = exameData?.checked || false;
            
            div.innerHTML = `
                <div class="item-header" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.2rem;">
                    <input type="text" class="exame-custom-nome" placeholder="Nome do exame" value="${nome}" style="background: transparent; border: none; color: #c10404; font-weight: 600; width: 60%; padding: 0; font-size: 0.85rem;">
                    <span class="exames-item-preco" style="font-size: 0.75rem; color: #c10404;">R$ <span class="preco-valor">${preco.toFixed(2).replace('.', ',')}</span></span>
                </div>
                <div class="item-inputs" style="display: flex; gap: 0.5rem; margin-top: 0.3rem; flex-wrap: wrap; align-items: center;">
                    <div class="item-input" style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.7rem;">Preço:</span>
                        <input type="text" class="exame-custom-preco-input" placeholder="0,00" value="${preco.toFixed(2).replace('.', ',')}" style="width: 70px; background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; padding: 0.2rem 0.4rem; color: #fff; text-align: center; font-size: 0.75rem;">
                    </div>
                    <label style="display: flex; align-items: center; gap: 0.3rem; cursor: pointer; margin-left: 0.5rem;">
                        <input type="checkbox" class="exame-custom-checkbox" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer; accent-color: #c10404;">
                        <span style="font-size: 0.7rem;">Selecionar</span>
                    </label>
                    <button type="button" class="btn-remover-exame-custom" style="background: transparent; border: none; color: #c10404; cursor: pointer; padding: 0.2rem; margin-left: auto;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="item-totals" style="margin-top: 0.3rem; font-size: 0.75rem;">
                    <span class="exame-total">Total: R$ 0,00</span>
                </div>
            `;
            
            const nomeInput = div.querySelector('.exame-custom-nome');
            const precoInput = div.querySelector('.exame-custom-preco-input');
            const checkbox = div.querySelector('.exame-custom-checkbox');
            const totalSpan = div.querySelector('.exame-total');
            const precoSpan = div.querySelector('.preco-valor');
            
            function getPreco() {
                return parseFloat(precoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
            }
            
            function atualizarTotal() {
                const preco = getPreco();
                const isCheckedVal = checkbox.checked;
                const total = isCheckedVal ? preco : 0;
                totalSpan.textContent = `Total: ${formatarMoeda(total)}`;
                return total;
            }
            
            precoInput.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                if (precoSpan) precoSpan.textContent = e.target.value;
                atualizarTotal();
                calcularTotal();
                salvarRascunho();
            });
            
            nomeInput.addEventListener('input', () => {
                salvarRascunho();
            });
            
            checkbox.addEventListener('change', () => {
                atualizarTotal();
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular-exames'));
                }
            });
            
            const btnRemover = div.querySelector('.btn-remover-exame-custom');
            btnRemover.addEventListener('click', () => {
                div.remove();
                const index = examesCustomItems.findIndex(item => item.div === div);
                if (index !== -1) examesCustomItems.splice(index, 1);
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular-exames'));
                }
            });
            
            atualizarTotal();
            
            return {
                div,
                getNome: () => nomeInput.value,
                getPreco,
                isChecked: () => checkbox.checked,
                checkbox,
                atualizarTotal
            };
        }
        
        // Função para criar botão "Adicionar Exame Personalizado" dentro do dropdown
        function criarBotaoAdicionarExameCustom() {
            const btnDiv = document.createElement('div');
            btnDiv.className = 'btn-add-custom-exame-container';
            btnDiv.style.cssText = 'margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed #c10404;';
            btnDiv.innerHTML = `
                <button type="button" class="btn-add-custom-exame" style="background: transparent; border: 1px dashed #c10404; color: #c10404; padding: 0.3rem; border-radius: 20px; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem; font-size: 0.75rem;">
                    <i class="fas fa-plus-circle"></i> Adicionar Exame Personalizado
                </button>
            `;
            return btnDiv;
        }
        
        // Função para atualizar o total geral com a quantidade de funcionários
        function atualizarTotalGeral(totalPorFuncionario) {
            const qtdFuncionarios = parseInt(cargoItem?.querySelector('.cargo-quantidade')?.value) || 1;
            const totalGeral = totalPorFuncionario * qtdFuncionarios;
            if (examesTotalGeralSpan) {
                examesTotalGeralSpan.textContent = formatarMoeda(totalGeral);
            }
            if (examesQtdFuncionariosSpan) {
                examesQtdFuncionariosSpan.textContent = qtdFuncionarios;
            }
            return totalGeral;
        }
        
        // Adicionar exame Admissional/Demissional/Acuidade
        EXAMES_ADMISSIONAL.forEach(e => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'exames-item item-lista';
            itemDiv.style.cssText = 'margin-bottom: 0.8rem; padding-bottom: 0.5rem; border-bottom: 1px solid #2a2a2a; display: flex; justify-content: space-between; align-items: center;';
            const isChecked = (dadosExames && dadosExames[e.nome] === true);
            itemDiv.innerHTML = `
                <div class="exames-item-nome" style="font-size: 0.85rem; color: #ddd;">${e.nome}</div>
                <div class="exames-item-checkbox" style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="exames-item-preco" style="font-size: 0.75rem; color: #c10404;">${formatarMoeda(e.preco)}</span>
                    <input type="checkbox" class="exame-checkbox" data-nome="${e.nome}" data-preco="${e.preco}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: #c10404;">
                </div>
            `;
            examesMenu.appendChild(itemDiv);
            examesItems.push({
                nome: e.nome,
                preco: e.preco,
                checkbox: itemDiv.querySelector('.exame-checkbox'),
                div: itemDiv
            });
        });
        
        // Adicionar exames complementares
        EXAMES_COMPLEMENTARES.forEach(e => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'exames-item item-lista';
            itemDiv.style.cssText = 'margin-bottom: 0.8rem; padding-bottom: 0.5rem; border-bottom: 1px solid #2a2a2a; display: flex; justify-content: space-between; align-items: center;';
            const isChecked = (dadosExames && dadosExames[e.nome] === true);
            itemDiv.innerHTML = `
                <div class="exames-item-nome" style="font-size: 0.85rem; color: #ddd;">${e.nome}</div>
                <div class="exames-item-checkbox" style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="exames-item-preco" style="font-size: 0.75rem; color: #c10404;">${formatarMoeda(e.preco)}</span>
                    <input type="checkbox" class="exame-checkbox" data-nome="${e.nome}" data-preco="${e.preco}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: #c10404;">
                </div>
            `;
            examesMenu.appendChild(itemDiv);
            examesItems.push({
                nome: e.nome,
                preco: e.preco,
                checkbox: itemDiv.querySelector('.exame-checkbox'),
                div: itemDiv
            });
        });
        
        // Carregar exames personalizados existentes dentro do dropdown
        if (dadosExames && dadosExames.custom) {
            dadosExames.custom.forEach(item => {
                const customItem = criarExamePersonalizadoDropdown(item);
                examesMenu.appendChild(customItem.div);
                examesCustomItems.push(customItem);
            });
        }
        
        // Adicionar botão de adicionar exame personalizado no final do menu
        const btnExameCustom = criarBotaoAdicionarExameCustom();
        examesMenu.appendChild(btnExameCustom);
        btnExameCustom.querySelector('.btn-add-custom-exame').addEventListener('click', () => {
            const customItem = criarExamePersonalizadoDropdown();
            examesMenu.insertBefore(customItem.div, btnExameCustom);
            examesCustomItems.push(customItem);
            calcularTotal();
            salvarRascunho();
        });
        
        function calcularTotalExames() {
            let totalExames = 0;
            examesItems.forEach(item => {
                if (item.checkbox.checked) {
                    totalExames += item.preco;
                }
            });
            examesCustomItems.forEach(item => {
                if (item.isChecked()) {
                    totalExames += item.getPreco();
                }
            });
            examesTotalSpan.textContent = formatarMoeda(totalExames);
            return totalExames;
        }
        
        function calcularTotal() {
            const totalExames = calcularTotalExames();
            let totalTreinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
            const totalGeral = totalExames + totalTreinamento;
            totalSecaoSpan.textContent = formatarMoeda(totalGeral);
            header.querySelector('.summary-value').textContent = formatarMoeda(totalGeral);
            atualizarTotalGeral(totalGeral);
            return totalGeral;
        }
        
        // Event listeners para exames padrão
        examesItems.forEach(item => {
            item.checkbox.addEventListener('change', () => {
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular-exames'));
                }
            });
        });
        
        treinamentoInput.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '0,00';
            calcularTotal();
            salvarRascunho();
            if (cargoItem && cargoItem.dispatchEvent) {
                cargoItem.dispatchEvent(new Event('recalcular-exames'));
            }
        });
        
        // Adicionar listener para quando a quantidade de funcionários mudar
        if (cargoItem) {
            const qtdInput = cargoItem.querySelector('.cargo-quantidade');
            if (qtdInput) {
                const totalAtual = calcularTotal();
                qtdInput.addEventListener('input', () => {
                    atualizarTotalGeral(totalAtual);
                });
            }
        }
        
        // Dropdown toggle para exames
        const examesHeader = examesBox.querySelector('.box-header');
        const examesMenuEl = examesMenu;
        const examesIcon = examesHeader.querySelector('i');
        
        function toggleDropdown(headerEl, menu, icon) {
            const isOpen = menu.classList.contains('open');
            document.querySelectorAll('.exames-box .dropdown-menu.open').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('open');
                    const prevHeader = m.previousElementSibling;
                    if (prevHeader && prevHeader.classList.contains('box-header')) {
                        const prevIcon = prevHeader.querySelector('i');
                        if (prevIcon) {
                            prevIcon.classList.remove('fa-chevron-up');
                            prevIcon.classList.add('fa-chevron-down');
                        }
                        prevHeader.classList.remove('open');
                    }
                }
            });
            if (!isOpen) {
                menu.classList.add('open');
                headerEl.classList.add('open');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
                menu.style.zIndex = '10000';
            } else {
                menu.classList.remove('open');
                headerEl.classList.remove('open');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
                menu.style.zIndex = '';
            }
        }
        
        examesHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(examesHeader, examesMenuEl, examesIcon);
        });
        
        document.addEventListener('click', function(e) {
            if (!section.contains(e.target)) {
                document.querySelectorAll('.exames-box .dropdown-menu.open').forEach(menu => {
                    menu.classList.remove('open');
                    const prevHeader = menu.previousElementSibling;
                    if (prevHeader && prevHeader.classList.contains('box-header')) {
                        const prevIcon = prevHeader.querySelector('i');
                        if (prevIcon) {
                            prevIcon.classList.remove('fa-chevron-up');
                            prevIcon.classList.add('fa-chevron-down');
                        }
                        prevHeader.classList.remove('open');
                    }
                    menu.style.zIndex = '';
                });
            }
        });
        
        examesMenuEl.addEventListener('click', (e) => e.stopPropagation());
        
        // Inicializar com os valores
        calcularTotal();
        
        return { 
            section, 
            calcularTotal, 
            getDados: () => {
                const exames = {};
                examesItems.forEach(item => {
                    if (item.checkbox.checked) {
                        exames[item.nome] = true;
                    }
                });
                
                // Capturar exames personalizados
                const examesCustom = [];
                examesCustomItems.forEach(item => {
                    const nome = item.getNome();
                    const preco = item.getPreco();
                    const checked = item.isChecked();
                    if (nome && preco > 0) {
                        examesCustom.push({
                            nome: nome,
                            preco: preco,
                            checked: checked
                        });
                    } else if (nome && checked) {
                        examesCustom.push({
                            nome: nome,
                            preco: 0,
                            checked: checked
                        });
                    }
                });
                if (examesCustom.length > 0) {
                    exames.custom = examesCustom;
                }
                
                const treinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                return { exames, treinamento };
            } 
        };
    }

    function criarInsumosSection(cargoItem, dadosInsumos = {}) {
        const conteudoHtml = `
            <div class="insumos-grid"></div>
            <div class="insumos-total-geral" style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid rgba(193, 4, 4, 0.3); text-align: right; font-size: 0.9rem;">
                Total para <span class="insumos-qtd-funcionarios">1</span> funcionário(s): <strong class="insumos-valor-geral">R$ 0,00</strong>
            </div>
        `;
        const { section, updateSummary, content } = criarSecaoExpansivel('Insumos', 'fa-boxes', conteudoHtml, true);
        const grid = content.querySelector('.insumos-grid');
        const insumosTotalGeralSpan = content.querySelector('.insumos-valor-geral');
        const insumosQtdFuncionariosSpan = content.querySelector('.insumos-qtd-funcionarios');
        
        // Função para atualizar o total geral com a quantidade de funcionários
        function atualizarTotalGeral(totalPorFuncionario) {
            const qtdFuncionarios = parseInt(cargoItem?.querySelector('.cargo-quantidade')?.value) || 1;
            const totalGeral = totalPorFuncionario * qtdFuncionarios;
            if (insumosTotalGeralSpan) {
                insumosTotalGeralSpan.textContent = formatarMoeda(totalGeral);
            }
            if (insumosQtdFuncionariosSpan) {
                insumosQtdFuncionariosSpan.textContent = qtdFuncionarios;
            }
            return totalGeral;
        }
        
        INSUMOS.forEach(i => {
            const card = document.createElement('div');
            card.className = 'insumo-card';
            const valor = dadosInsumos[i.campo]?.valor ?? 0;
            card.innerHTML = `
                <div class="insumo-nome">${i.nome}</div>
                <div class="insumo-campo">
                    <label>Valor (R$)</label>
                    <input type="text" class="insumo-valor" data-campo="${i.campo}" placeholder="0,00" value="${valor.toFixed(2).replace('.', ',')}">
                </div>
                <div class="insumo-total">R$ 0,00</div>
            `;
            grid.appendChild(card);
        });
        
        function calcularTotal() {
            let total = 0;
            grid.querySelectorAll('.insumo-card').forEach(card => {
                const valorInput = card.querySelector('.insumo-valor');
                let valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                total += valor;
                const totalSpan = card.querySelector('.insumo-total');
                totalSpan.textContent = formatarMoeda(valor);
            });
            updateSummary(total);
            atualizarTotalGeral(total);
            return total;
        }
        
        grid.querySelectorAll('.insumo-valor').forEach(input => {
            input.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular'));
                }
            });
        });
        
        // Adicionar listener para quando a quantidade de funcionários mudar
        if (cargoItem) {
            const qtdInput = cargoItem.querySelector('.cargo-quantidade');
            if (qtdInput) {
                const totalAtual = calcularTotal();
                qtdInput.addEventListener('input', () => {
                    atualizarTotalGeral(totalAtual);
                });
            }
        }
        
        calcularTotal();
        
        return { section, calcularTotal, getDados: () => {
            const insumos = {};
            grid.querySelectorAll('.insumo-card').forEach(card => {
                const campo = card.querySelector('.insumo-valor').dataset.campo;
                const valorInput = card.querySelector('.insumo-valor');
                const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                if (valor > 0) {
                    insumos[campo] = { valor: valor };
                }
            });
            return insumos;
        } };
    }

    function criarDespesasSection(cargoItem, dadosDespesas = {}) {
        const section = document.createElement('div');
        section.className = 'despesas-section';
        
        const header = document.createElement('div');
        header.className = 'despesas-header';
        header.innerHTML = `
            <div class="despesas-title">
                <i class="fas fa-chart-line"></i>
                <span>Despesas</span>
            </div>
            <div class="despesas-summary">
                <span class="summary-label">Total Encargos Fiscais:</span>
                <span class="summary-value">R$ 0,00</span>
                <i class="fas fa-chevron-down despesas-toggle"></i>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'despesas-content';
        content.innerHTML = `
            <div class="despesas-grid">
                <div class="despesa-card">
                    <div class="despesa-nome">Encargos Fiscais (Benefícios)</div>
                    <div class="despesa-campos">
                        <div class="despesa-campo">
                            <label>Taxa</label>
                            <input type="text" class="despesa-taxa" value="13,75%" disabled>
                        </div>
                    </div>
                    <div class="despesa-valor">R$ 0,00</div>
                    <div class="despesa-calculo"></div>
                </div>
            </div>
            <div class="despesas-total">
                <span>Total Encargos Fiscais:</span>
                <span>R$ 0,00</span>
            </div>
        `;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = false;
        content.classList.add('collapsed');
        // Quando fechado, seta pra BAIXO
        header.querySelector('.despesas-toggle').classList.remove('fa-chevron-up');
        header.querySelector('.despesas-toggle').classList.add('fa-chevron-down');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            if (isExpanded) {
                content.classList.remove('collapsed');
                // ABERTO: seta pra CIMA
                header.querySelector('.despesas-toggle').classList.remove('fa-chevron-down');
                header.querySelector('.despesas-toggle').classList.add('fa-chevron-up');
            } else {
                content.classList.add('collapsed');
                // FECHADO: seta pra BAIXO
                header.querySelector('.despesas-toggle').classList.remove('fa-chevron-up');
                header.querySelector('.despesas-toggle').classList.add('fa-chevron-down');
            }
        });
        
        const totalSpan = content.querySelector('.despesas-total span:last-child');
        const valorSpan = content.querySelector('.despesa-valor');
        const calculoSpan = content.querySelector('.despesa-calculo');
        
        function calcularDespesas(subtotalInsumosBeneficios) {
            const taxa = TAXA_ENCARGOS_FISCAIS;
            const valorEncargos = subtotalInsumosBeneficios * taxa;
            
            valorSpan.textContent = formatarMoeda(valorEncargos);
            calculoSpan.textContent = `(${formatarMoeda(subtotalInsumosBeneficios)} × ${(taxa * 100).toFixed(2)}%)`;
            totalSpan.textContent = formatarMoeda(valorEncargos);
            header.querySelector('.summary-value').textContent = formatarMoeda(valorEncargos);
            
            return valorEncargos;
        }
        
        return { section, calcularDespesas, getDados: () => {
            return { encargos_fiscais: { porcentagem: TAXA_ENCARGOS_FISCAIS * 100 } };
        } };
    }

    // ========== CRIAÇÃO DO CARGO ==========
    function criarCargoItem(cargo = '', quantidade = 1, salario = 0, dadosAdicionais = {}, dadosUniformes = {}, dadosEpis = {}, dadosBeneficios = {}, dadosSeguranca = {}, dadosExames = {}, dadosInsumos = {}, dadosDespesas = {}, treinamentoValor = 0, beneficiosPersonalizados = []) {
        const item = document.createElement('div');
        item.className = 'cargo-item';
        
        // Header do cargo
        const header = document.createElement('div');
        header.className = 'cargo-header';
        header.innerHTML = `
            <div class="cargo-titulo">
                <i class="fas fa-briefcase"></i>
                <span>Cargo</span>
            </div>
            <button type="button" class="btn-remover" title="Remover cargo">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        item.appendChild(header);
        
        // Linha de campos básicos
        const linha = document.createElement('div');
        linha.className = 'cargo-linha';
        linha.innerHTML = `
            <div class="campo-pequeno">
                <label><i class="fas fa-briefcase"></i> Cargo</label>
                <input type="text" class="input-moderno cargo-nome" placeholder="Ex: Assistente" value="${cargo}">
            </div>
            <div class="campo-pequeno">
                <label><i class="fas fa-hashtag"></i> Quant.</label>
                <input type="number" class="input-moderno cargo-quantidade" min="1" value="${quantidade}">
            </div>
            <div class="campo-pequeno">
                <label><i class="fas fa-dollar-sign"></i> Salário (R$)</label>
                <input type="text" class="input-moderno cargo-salario" placeholder="0,00" value="${salario > 0 ? salario.toFixed(2).replace('.', ',') : ''}">
            </div>
            <div class="campo-pequeno">
                <label><i class="fas fa-percent"></i> Encargos</label>
                <div class="campo-encargos">
                    <input type="text" class="input-moderno encargos-percentual" placeholder="113,00" value="113,00" style="width: 80px; text-align: center;">
                    <span>%</span>
                </div>
            </div>
        `;
        item.appendChild(linha);
        
        // Seção Adicionais (atualizada com Acúmulo de Função)
        const adicionaisHtml = `
            <div class="adicionais-grid">
                <div class="adicional-card">
                    <div class="adicional-header">
                        <label class="checkbox-label">
                            <input type="checkbox" class="he-check">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Horas Extras</span>
                        </label>
                    </div>
                    <div class="adicional-conteudo he-conteudo hidden">
                        <div class="adicional-campo">
                            <span class="input-symbol"><i class="fas fa-clock"></i></span>
                            <input type="number" class="input-moderno he-horas" placeholder="Horas/mês" min="0" step="1">
                        </div>
                        <div class="adicional-valor he-resultado"></div>
                    </div>
                </div>
                <div class="adicional-card">
                    <div class="adicional-header">
                        <label class="checkbox-label">
                            <input type="checkbox" class="an-check">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Ad. Noturno</span>
                        </label>
                    </div>
                    <div class="adicional-conteudo an-conteudo hidden">
                        <div class="adicional-campo">
                            <span class="input-symbol"><i class="fas fa-moon"></i></span>
                            <input type="number" class="input-moderno an-horas" placeholder="Horas noturnas" min="0" step="1">
                        </div>
                        <div class="adicional-valor an-resultado"></div>
                    </div>
                </div>
                <div class="adicional-card">
                    <div class="adicional-header">
                        <label class="checkbox-label">
                            <input type="checkbox" class="per-check">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Periculosidade</span>
                        </label>
                    </div>
                    <div class="adicional-conteudo per-conteudo hidden">
                        <div class="adicional-valor per-resultado"></div>
                    </div>
                </div>
                <div class="adicional-card">
                    <div class="adicional-header">
                        <label class="checkbox-label">
                            <input type="checkbox" class="ins-check">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Insalubridade</span>
                        </label>
                    </div>
                    <div class="adicional-conteudo ins-conteudo hidden">
                        <div class="adicional-valor ins-resultado"></div>
                    </div>
                </div>
                <!-- NOVO ADICIONAL: ACÚMULO DE FUNÇÃO -->
                <div class="adicional-card">
                    <div class="adicional-header">
                        <label class="checkbox-label">
                            <input type="checkbox" class="acumulo-check">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Acúmulo de Função</span>
                        </label>
                    </div>
                    <div class="adicional-conteudo acumulo-conteudo hidden">
                        <div class="adicional-campo">
                            <span class="input-symbol"><i class="fas fa-users"></i></span>
                            <input type="number" class="input-moderno acumulo-quantidade" placeholder="Nº de funcionários" min="0" step="1" value="0">
                        </div>
                        <div class="adicional-valor acumulo-resultado"></div>
                    </div>
                </div>
            </div>
        `;
        
        const { section: adicionaisSection, updateSummary: updateAdicionaisSummary, content: adicionaisContent } = criarSecaoExpansivel('Adicionais', 'fa-bolt', adicionaisHtml, true);
        item.appendChild(adicionaisSection);
        
        // Seção Uniformes e EPIs
        const { section: uniformesSection, atualizarTotais: atualizarUniformesTotais, getDados: getUniformesDados } = criarUniformesEpisSection(item, dadosUniformes, dadosEpis);
        item.appendChild(uniformesSection);
        
        // Seção Benefícios
        const { section: beneficiosSection, calcularTotal: calcularBeneficios, getDados: getBeneficiosDados } = criarBeneficiosSection(item, dadosBeneficios, beneficiosPersonalizados);
        item.appendChild(beneficiosSection);
        
        // Seção Segurança
        const { section: segurancaSection, calcularTotal: calcularSeguranca, getDados: getSegurancaDados } = criarSegurancaSection(item, dadosSeguranca);
        item.appendChild(segurancaSection);
        
        // Seção Exames e Treinamentos
        const { section: examesSection, calcularTotal: calcularExames, getDados: getExamesDados } = criarExamesSection(item, dadosExames, treinamentoValor);
        item.appendChild(examesSection);
        
        // Seção Insumos
        const { section: insumosSection, calcularTotal: calcularInsumos, getDados: getInsumosDados } = criarInsumosSection(item, dadosInsumos);
        item.appendChild(insumosSection);
        
        // Seção Despesas (Encargos Fiscais)
        const { section: despesasSection, calcularDespesas, getDados: getDespesasDados } = criarDespesasSection(item, dadosDespesas);
        item.appendChild(despesasSection);
        
        // Resultados
        const resultadosDiv = document.createElement('div');
        resultadosDiv.className = 'cargo-resultados';
        item.appendChild(resultadosDiv);
        
        // Armazenar referências para uso nas funções
        item.__getUniformesDados = getUniformesDados;
        item.__getBeneficiosDados = getBeneficiosDados;
        item.__getSegurancaDados = getSegurancaDados;
        item.__getExamesDados = getExamesDados;
        item.__getInsumosDados = getInsumosDados;
        item.__getDespesasDados = getDespesasDados;
        
        function atualizarResultados() {
            // Quantidade TOTAL de funcionários no cargo (usada para uniformes, benefícios, etc.)
            const qtdTotalFuncionarios = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            let salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            const valorHora = salario / HORAS_MENSAL;
            
            // Obter porcentagem de encargos do campo (valor em %)
            const encargosPercentualInput = item.querySelector('.encargos-percentual');
            let taxaEncargos = parseFloat(encargosPercentualInput.value.replace(/\./g, '').replace(',', '.')) || 113.00;
            taxaEncargos = taxaEncargos / 100; // Converter para decimal
            
            let totalAdicionais = 0;
            let totalAcumulo = 0; // Valor do acúmulo (independente, NÃO multiplica pela quantidade de vagas)
            
            // ========== HORAS EXTRAS ==========
            const heCheck = adicionaisContent.querySelector('.he-check');
            const heConteudo = adicionaisContent.querySelector('.he-conteudo');
            const heResultado = adicionaisContent.querySelector('.he-resultado');
            if (heCheck && heCheck.checked) {
                const horas = parseFloat(adicionaisContent.querySelector('.he-horas')?.value) || 0;
                if (horas > 0) {
                    const valorHoraExtra = valorHora * 1.5 * horas;
                    const dsr = (valorHoraExtra / 25) * 5;
                    const encargosHE = (valorHoraExtra + dsr) * taxaEncargos;
                    const totalHE = valorHoraExtra + dsr + encargosHE;
                    if (heResultado) heResultado.innerHTML = `<span class="valor-label">Total Horas Extras</span><span class="valor-number">${formatarMoeda(totalHE)}</span>`;
                    totalAdicionais += totalHE;
                } else {
                    if (heResultado) heResultado.innerHTML = '';
                }
            } else {
                if (heResultado) heResultado.innerHTML = '';
            }
            if (heConteudo) heConteudo.classList.toggle('hidden', !(heCheck && heCheck.checked));
            
            // ========== ADICIONAL NOTURNO ==========
            const anCheck = adicionaisContent.querySelector('.an-check');
            const anConteudo = adicionaisContent.querySelector('.an-conteudo');
            const anResultado = adicionaisContent.querySelector('.an-resultado');
            if (anCheck && anCheck.checked) {
                const horasNoturnas = parseFloat(adicionaisContent.querySelector('.an-horas')?.value) || 0;
                if (horasNoturnas > 0) {
                    const valorAdicionalNoturno = valorHora * 0.2 * horasNoturnas;
                    const encargosAN = valorAdicionalNoturno * taxaEncargos;
                    const totalAN = valorAdicionalNoturno + encargosAN;
                    if (anResultado) anResultado.innerHTML = `<span class="valor-label">Total Ad. Noturno</span><span class="valor-number">${formatarMoeda(totalAN)}</span>`;
                    totalAdicionais += totalAN;
                } else {
                    if (anResultado) anResultado.innerHTML = '';
                }
            } else {
                if (anResultado) anResultado.innerHTML = '';
            }
            if (anConteudo) anConteudo.classList.toggle('hidden', !(anCheck && anCheck.checked));
            
            // ========== PERICULOSIDADE ==========
            const perCheck = adicionaisContent.querySelector('.per-check');
            const perConteudo = adicionaisContent.querySelector('.per-conteudo');
            const perResultado = adicionaisContent.querySelector('.per-resultado');
            if (perCheck && perCheck.checked) {
                const periculosidade = salario * 0.3;
                const encargosPer = periculosidade * taxaEncargos;
                const totalPer = periculosidade + encargosPer;
                if (perResultado) perResultado.innerHTML = `<span class="valor-label">Total Periculosidade</span><span class="valor-number">${formatarMoeda(totalPer)}</span>`;
                totalAdicionais += totalPer;
            } else {
                if (perResultado) perResultado.innerHTML = '';
            }
            if (perConteudo) perConteudo.classList.toggle('hidden', !(perCheck && perCheck.checked));
            
            // ========== INSALUBRIDADE ==========
            const insCheck = adicionaisContent.querySelector('.ins-check');
            const insConteudo = adicionaisContent.querySelector('.ins-conteudo');
            const insResultado = adicionaisContent.querySelector('.ins-resultado');
            if (insCheck && insCheck.checked) {
                const insalubridade = SALARIO_MINIMO * 0.2;
                const encargosIns = insalubridade * taxaEncargos;
                const totalIns = insalubridade + encargosIns;
                if (insResultado) insResultado.innerHTML = `<span class="valor-label">Total Insalubridade</span><span class="valor-number">${formatarMoeda(totalIns)}</span>`;
                totalAdicionais += totalIns;
            } else {
                if (insResultado) insResultado.innerHTML = '';
            }
            if (insConteudo) insConteudo.classList.toggle('hidden', !(insCheck && insCheck.checked));
            
            // ========== ACÚMULO DE FUNÇÃO ==========
            const acumuloCheck = adicionaisContent.querySelector('.acumulo-check');
            const acumuloConteudo = adicionaisContent.querySelector('.acumulo-conteudo');
            const acumuloResultado = adicionaisContent.querySelector('.acumulo-resultado');
            const acumuloQuantidade = adicionaisContent.querySelector('.acumulo-quantidade');
            
            if (acumuloCheck && acumuloCheck.checked) {
                // Quantidade ESPECÍFICA de funcionários que terão acúmulo
                const qtdAcumulo = parseInt(acumuloQuantidade?.value) || 0;
                
                if (qtdAcumulo > 0) {
                    // Cálculo: Valor por funcionário = Salário × 20% + encargos sobre esse valor
                    const valorBaseAcumulo = salario * 0.20;
                    const encargosAcumulo = valorBaseAcumulo * taxaEncargos;
                    const valorPorFuncionario = valorBaseAcumulo + encargosAcumulo;
                    
                    // Total do acúmulo = Valor por funcionário × quantidade de funcionários com acúmulo
                    // IMPORTANTE: Este valor NÃO será multiplicado pela quantidade total de vagas
                    totalAcumulo = valorPorFuncionario * qtdAcumulo;
                    
                    if (acumuloResultado) {
                        acumuloResultado.innerHTML = `
                            <span class="valor-label">Total Acúmulo (${qtdAcumulo} funcionário${qtdAcumulo > 1 ? 's' : ''})</span>
                            <span class="valor-number">${formatarMoeda(totalAcumulo)}</span>
                        `;
                    }
                } else {
                    if (acumuloResultado) acumuloResultado.innerHTML = '';
                    totalAcumulo = 0;
                }
            } else {
                if (acumuloResultado) acumuloResultado.innerHTML = '';
                totalAcumulo = 0;
            }
            
            // Mostrar/esconder o conteúdo do acúmulo baseado no checkbox
            if (acumuloConteudo) {
                acumuloConteudo.classList.toggle('hidden', !(acumuloCheck && acumuloCheck.checked));
            }
            
            updateAdicionaisSummary(totalAdicionais);
            
            // ========== UNIFORMES E EPIS ==========
            let totalUniformeEpi = 0;
            if (typeof atualizarUniformesTotais === 'function') {
                const uniformesData = atualizarUniformesTotais();
                totalUniformeEpi = uniformesData?.totalGeral || 0;
            }
            
            // ========== BENEFÍCIOS ==========
            const totalBeneficios = typeof calcularBeneficios === 'function' ? calcularBeneficios() : 0;
            
            // ========== SEGURANÇA ==========
            const totalSeguranca = typeof calcularSeguranca === 'function' ? calcularSeguranca() : 0;
            
            // ========== EXAMES E TREINAMENTOS ==========
            const totalExames = typeof calcularExames === 'function' ? calcularExames() : 0;
            
            // ========== INSUMOS ==========
            const totalInsumos = typeof calcularInsumos === 'function' ? calcularInsumos() : 0;
            
            // ========== CÁLCULOS TERCEIRIZADO ==========
            // SUB TOTAL SALARIO + ENCARGOS (NÃO inclui o acúmulo)
            const valorEncargos = salario * taxaEncargos;
            const subtotalSalarioEncargos = salario + valorEncargos + totalAdicionais;
            
            // SUB TOTAL DOS INSUMOS E BENEFICIOS (todos já são valores mensais)
            const subtotalInsumosBeneficios = totalUniformeEpi + totalBeneficios + totalSeguranca + totalExames + totalInsumos;
            
            // Calcular Encargos Fiscais (13,75% sobre subtotalInsumosBeneficios)
            let despesasResult = 0;
            if (typeof calcularDespesas === 'function') {
                despesasResult = calcularDespesas(subtotalInsumosBeneficios);
            }
            
            // ========== CÁLCULO DO TOTAL POR VAGA (SEM ACÚMULO) ==========
            // Este é o valor base da vaga, sem o acúmulo
            const totalPorVaga = subtotalSalarioEncargos + subtotalInsumosBeneficios + despesasResult;
            
            // ========== CÁLCULO DO TOTAL COM MULTIPLICAÇÃO PELA QUANTIDADE DE VAGAS ==========
            // Multiplica o valor por vaga pela quantidade total de funcionários
            const totalVagasMultiplicado = totalPorVaga * qtdTotalFuncionarios;
            
            // ========== TOTAL FINAL DA VAGA (COM ACÚMULO) ==========
            // O acúmulo é somado APÓS a multiplicação das vagas, e NÃO é multiplicado
            const totalFinalVaga = totalVagasMultiplicado + totalAcumulo;
            
            // ========== ATUALIZAR RESULTADOS NA TELA ==========
            let resultadosHTML = `
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-calculator"></i> Encargos (${(taxaEncargos * 100).toFixed(2)}%)</span>
                    <span class="valor">${formatarMoeda(valorEncargos)}</span>
                </div>
            `;
            
            if (totalAdicionais > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-plus-circle"></i> Adicionais (c/ encargos)</span>
                        <span class="valor">${formatarMoeda(totalAdicionais)}</span>
                    </div>
                `;
            }
            
            resultadosHTML += `
                <div class="resultado-bloco subtotal-cargo">
                    <span class="rotulo"><i class="fas fa-file-invoice"></i> SUB TOTAL SALARIO + ENCARGOS</span>
                    <span class="valor">${formatarMoeda(subtotalSalarioEncargos)}</span>
                </div>
            `;
            
            if (totalUniformeEpi > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-tshirt"></i> Uniformes/EPIs</span>
                        <span class="valor">${formatarMoeda(totalUniformeEpi)}</span>
                    </div>
                `;
            }
            
            if (totalBeneficios > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-gift"></i> Benefícios</span>
                        <span class="valor">${formatarMoeda(totalBeneficios)}</span>
                    </div>
                `;
            }
            
            if (totalSeguranca > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-shield-alt"></i> SST + Seguro</span>
                        <span class="valor">${formatarMoeda(totalSeguranca)}</span>
                    </div>
                `;
            }
            
            if (totalExames > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-stethoscope"></i> Exames e Treinamentos</span>
                        <span class="valor">${formatarMoeda(totalExames)}</span>
                    </div>
                `;
            }
            
            if (totalInsumos > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-boxes"></i> Insumos</span>
                        <span class="valor">${formatarMoeda(totalInsumos)}</span>
                    </div>
                `;
            }
            
            resultadosHTML += `
                <div class="resultado-bloco subtotal-insumos">
                    <span class="rotulo"><i class="fas fa-boxes"></i> SUB TOTAL DOS INSUMOS E BENEFICIOS</span>
                    <span class="valor">${formatarMoeda(subtotalInsumosBeneficios)}</span>
                </div>
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-chart-line"></i> Encargos Fiscais (Benefícios)</span>
                    <span class="valor">${formatarMoeda(despesasResult)}</span>
                </div>
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-calculator"></i> Valor por vaga (${qtdTotalFuncionarios} vaga${qtdTotalFuncionarios > 1 ? 's' : ''})</span>
                    <span class="valor">${formatarMoeda(totalPorVaga)}</span>
                </div>
            `;
            
            // Mostrar acúmulo se houver (como valor separado)
            if (totalAcumulo > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-chart-line"></i> Acúmulo de Função</span>
                        <span class="valor">${formatarMoeda(totalAcumulo)}</span>
                    </div>
                `;
            }
            
            // Mostrar total das vagas multiplicado
            if (qtdTotalFuncionarios > 1) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-times"></i> Total (${qtdTotalFuncionarios} vaga${qtdTotalFuncionarios > 1 ? 's' : ''})</span>
                        <span class="valor">${formatarMoeda(totalVagasMultiplicado)}</span>
                    </div>
                `;
            }
            
            resultadosHTML += `
                <div class="resultado-bloco total-prestacao">
                    <span class="rotulo"><i class="fas fa-calculator"></i> TOTAL FINAL DA VAGA</span>
                    <span class="valor" style="color: #c10404; font-size: 1.2rem;">${formatarMoeda(totalFinalVaga)}</span>
                </div>
            `;
            
            resultadosDiv.innerHTML = resultadosHTML;
            calcularTotalGeral();
        }
        
        // ========== EVENT LISTENERS ==========
        
        // Event listeners para campos básicos
        item.querySelector('.cargo-nome').addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        item.querySelector('.cargo-quantidade').addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        item.querySelector('.cargo-salario').addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
            atualizarResultados();
            salvarRascunho();
        });
        
        // Event listeners para encargos
        const encargosInput = item.querySelector('.encargos-percentual');
        if (encargosInput) {
            encargosInput.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                atualizarResultados();
                salvarRascunho();
            });
        }
        
        // Event listeners para adicionais existentes
        adicionaisContent.querySelectorAll('.he-check, .an-check, .per-check, .ins-check').forEach(chk => {
            chk.addEventListener('change', () => { atualizarResultados(); salvarRascunho(); });
        });
        adicionaisContent.querySelectorAll('.he-horas, .an-horas').forEach(input => {
            input.addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        });
        
        // ========== NOVOS EVENT LISTENERS PARA ACÚMULO DE FUNÇÃO ==========
        const acumuloCheck = adicionaisContent.querySelector('.acumulo-check');
        const acumuloQuantidade = adicionaisContent.querySelector('.acumulo-quantidade');
        
        if (acumuloCheck) {
            acumuloCheck.addEventListener('change', () => { 
                atualizarResultados(); 
                salvarRascunho(); 
            });
        }
        
        if (acumuloQuantidade) {
            acumuloQuantidade.addEventListener('input', () => { 
                atualizarResultados(); 
                salvarRascunho(); 
            });
        }
        
        // Event listeners para eventos personalizados
        item.addEventListener('recalcular', atualizarResultados);
        item.addEventListener('recalcular-despesas', atualizarResultados);
        item.addEventListener('recalcular-exames', atualizarResultados);
        
        // Botão remover cargo
        item.querySelector('.btn-remover').addEventListener('click', function() {
            item.remove();
            calcularTotalGeral();
            salvarRascunho();
        });
        
        // ========== PREENCHER DADOS EXISTENTES ==========
        
        // Preencher dados adicionais existentes
        // ========== PREENCHER DADOS EXISTENTES ==========

        // Preencher dados adicionais existentes
        if (dadosAdicionais) {
            // Adicionais existentes
            if (dadosAdicionais.horasExtras && adicionaisContent.querySelector('.he-check')) 
                adicionaisContent.querySelector('.he-check').checked = true;
            if (dadosAdicionais.noturno && adicionaisContent.querySelector('.an-check')) 
                adicionaisContent.querySelector('.an-check').checked = true;
            if (dadosAdicionais.periculosidade && adicionaisContent.querySelector('.per-check')) 
                adicionaisContent.querySelector('.per-check').checked = true;
            if (dadosAdicionais.insalubridade && adicionaisContent.querySelector('.ins-check')) 
                adicionaisContent.querySelector('.ins-check').checked = true;
            if (dadosAdicionais.heHoras && adicionaisContent.querySelector('.he-horas')) 
                adicionaisContent.querySelector('.he-horas').value = dadosAdicionais.heHoras;
            if (dadosAdicionais.anHoras && adicionaisContent.querySelector('.an-horas')) 
                adicionaisContent.querySelector('.an-horas').value = dadosAdicionais.anHoras;
            
            // ========== PREENCHER DADOS DO ACÚMULO ==========
            if (dadosAdicionais.acumulo !== undefined && adicionaisContent.querySelector('.acumulo-check')) {
                adicionaisContent.querySelector('.acumulo-check').checked = dadosAdicionais.acumulo;
                
                // Mostrar/esconder o conteúdo baseado no checkbox
                const acumuloConteudo = adicionaisContent.querySelector('.acumulo-conteudo');
                if (acumuloConteudo) {
                    acumuloConteudo.classList.toggle('hidden', !dadosAdicionais.acumulo);
                }
            }
            
            if (dadosAdicionais.acumuloQuantidade !== undefined && adicionaisContent.querySelector('.acumulo-quantidade')) {
                adicionaisContent.querySelector('.acumulo-quantidade').value = dadosAdicionais.acumuloQuantidade;
            }
        }
        
        // Preencher porcentagem de encargos
        if (dadosAdicionais && dadosAdicionais.encargosPercentual) {
            const encargosInputElem = item.querySelector('.encargos-percentual');
            if (encargosInputElem) {
                encargosInputElem.value = dadosAdicionais.encargosPercentual.toFixed(2).replace('.', ',');
            }
        }
        
        // ========== PREENCHER DADOS DO ACÚMULO ==========
        console.log('PREENCHENDO ACÚMULO - dadosAdicionais:', dadosAdicionais);

        if (dadosAdicionais) {
            const acumuloCheckElem = adicionaisContent.querySelector('.acumulo-check');
            const acumuloQuantidadeElem = adicionaisContent.querySelector('.acumulo-quantidade');
            const acumuloConteudoElem = adicionaisContent.querySelector('.acumulo-conteudo');
            
            console.log('Elementos encontrados - checkbox:', !!acumuloCheckElem, 'quantidade:', !!acumuloQuantidadeElem);
            
            // Preencher checkbox
            if (acumuloCheckElem && dadosAdicionais.acumulo !== undefined) {
                acumuloCheckElem.checked = dadosAdicionais.acumulo;
                console.log('Checkbox preenchido com:', dadosAdicionais.acumulo);
                
                // Mostrar/esconder o conteúdo
                if (acumuloConteudoElem) {
                    acumuloConteudoElem.classList.toggle('hidden', !dadosAdicionais.acumulo);
                }
            }
            
            // Preencher quantidade
            if (acumuloQuantidadeElem && dadosAdicionais.acumuloQuantidade !== undefined) {
                acumuloQuantidadeElem.value = dadosAdicionais.acumuloQuantidade;
                console.log('Quantidade preenchida com:', dadosAdicionais.acumuloQuantidade);
            }
        }

        // Executar atualização inicial
        atualizarResultados();
        
        return item;
    }
    
    // ========== CARREGAR PROPOSTA EXISTENTE ==========
    async function carregarPropostaExistente() {
        const urlParams = new URLSearchParams(window.location.search);
        const propostaId = urlParams.get('id');
        const vendedorParam = urlParams.get('vendedor');
        
        if (vendedorParam) {
            document.getElementById('vendedor-nome').textContent = vendedorParam;
        }
        
        if (propostaId) {
            try {
                const doc = await db.collection('propostas').doc(propostaId).get();
                if (doc.exists) {
                    const propostaData = doc.data();
                    if (!vendedorParam) {
                        document.getElementById('vendedor-nome').textContent = propostaData.vendedor || 'Não informado';
                    }
                    clienteInput.value = propostaData.cliente || '';
                    container.innerHTML = '';
                    if (propostaData.cargos && propostaData.cargos.length > 0) {
                        propostaData.cargos.forEach(c => {
                            // Garantir que exames seja um objeto
                            let examesObj = {};
                            if (c.exames) {
                                if (Array.isArray(c.exames)) {
                                    // Se for array, converte para objeto
                                    c.exames.forEach(nomeExame => {
                                        examesObj[nomeExame] = true;
                                    });
                                } else {
                                    // Já é objeto
                                    examesObj = c.exames;
                                }
                            }
                            
                            container.appendChild(criarCargoItem(
                                c.nome,
                                c.quantidade,
                                c.salario,
                                c.adicionais || {},
                                c.uniformes || {},
                                c.epis || {},
                                c.beneficios || {},
                                c.seguranca || {},
                                examesObj,
                                c.insumos || {},
                                c.despesas || {},
                                c.treinamento || 0,
                                c.beneficiosPersonalizados || []
                            ));
                        });
                    } else {
                        container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, []));
                    }
                    calcularTotalGeral();
                    localStorage.removeItem(DRAFT_KEY);
                } else {
                    if (!carregarRascunho()) {
                        container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, []));
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar proposta:', error);
                if (!carregarRascunho()) {
                    container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, []));
                }
            }
        } else {
            if (!carregarRascunho()) {
                container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, []));
            }
        }
    }
    
    await carregarPropostaExistente();
    
    // Botão adicionar cargo
    btnAdicionar.addEventListener('click', function() {
        const novoCargo = criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, []);
        container.appendChild(novoCargo);
        calcularTotalGeral();
        salvarRascunho();
    });
    
    // ========== TEMA CLARO/ESCURO ==========
    function initTema() {
        const temaSalvo = localStorage.getItem('tema_terceirizado');
        const btnTema = document.getElementById('btn-tema');
        const iconTema = btnTema?.querySelector('i');
        
        // Se NÃO houver tema salvo, ou se o tema salvo for 'light', aplica o tema claro
        if (!temaSalvo || temaSalvo === 'light') {
            document.body.classList.add('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-moon');
                iconTema.classList.add('fa-sun');
            }
            // Salvar como 'light' se não houver tema salvo
            if (!temaSalvo) {
                localStorage.setItem('tema_terceirizado', 'light');
            }
        } else if (temaSalvo === 'dark') {
            // Apenas se o tema salvo for 'dark', aplica o tema escuro
            document.body.classList.remove('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-sun');
                iconTema.classList.add('fa-moon');
            }
        }
        
        if (btnTema) {
            btnTema.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                const isLight = document.body.classList.contains('light-mode');
                localStorage.setItem('tema_terceirizado', isLight ? 'light' : 'dark');
                
                if (iconTema) {
                    if (isLight) {
                        iconTema.classList.remove('fa-moon');
                        iconTema.classList.add('fa-sun');
                    } else {
                        iconTema.classList.remove('fa-sun');
                        iconTema.classList.add('fa-moon');
                    }
                }
            });
        }
    }
    
    // ========== BAIXAR PROPOSTA COMO IMAGEM ==========
    function initBaixarProposta() {
        const btnBaixar = document.getElementById('btn-baixar-proposta');
        
        if (!btnBaixar) return;
        
        btnBaixar.addEventListener('click', async () => {
            // Verificar se há dados para baixar
            const cargos = document.querySelectorAll('.cargo-item');
            if (cargos.length === 0) {
                mostrarModal('Adicione pelo menos um cargo antes de baixar a proposta.');
                return;
            }
            
            const cliente = document.getElementById('cliente-nome').value;
            if (!cliente) {
                mostrarModal('Informe o nome do cliente antes de baixar a proposta.');
                return;
            }
            
            await gerarImagemProposta();
        });
    }
    
    // ========== VISUALIZAÇÃO RESUMIDA PARA CLIENTE ==========
    async function capturarImagemProposta() {
        const elemento = document.querySelector('.visualizacao-resumida');
        if (!elemento) {
            console.error('Elemento não encontrado');
            return;
        }
        
        // Mostrar indicador de carregamento
        const btnCapture = document.getElementById('btn-capturar-imagem');
        const textoOriginal = btnCapture ? btnCapture.innerHTML : '';
        if (btnCapture) {
            btnCapture.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando imagem...';
            btnCapture.disabled = true;
        }
        
        try {
            // Clonar o elemento para não afetar o original
            const cloneElement = elemento.cloneNode(true);
            cloneElement.style.position = 'absolute';
            cloneElement.style.left = '-9999px';
            cloneElement.style.top = '-9999px';
            cloneElement.style.backgroundColor = '#ffffff';
            cloneElement.style.padding = '2rem';
            cloneElement.style.borderRadius = '16px';
            
            // Garantir que os estilos sejam aplicados corretamente
            cloneElement.style.width = '800px';
            cloneElement.style.maxWidth = '800px';
            cloneElement.style.margin = '0';
            
            // Remover o botão de captura do clone para não aparecer na imagem
            const btnClone = cloneElement.querySelector('#btn-capturar-imagem');
            if (btnClone) btnClone.remove();
            
            document.body.appendChild(cloneElement);
            
            // Usar html2canvas para gerar a imagem
            const canvas = await html2canvas(cloneElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: false
            });
            
            // Remover o clone
            document.body.removeChild(cloneElement);
            
            // Criar link para download
            const link = document.createElement('a');
            const clienteNome = document.querySelector('.vis-value')?.textContent || 'proposta';
            const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            link.download = `Proposta_${clienteNome}_${dataAtual}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            alert('Erro ao gerar imagem. Tente novamente.');
        } finally {
            // Restaurar botão
            if (btnCapture) {
                btnCapture.innerHTML = textoOriginal;
                btnCapture.disabled = false;
            }
        }
    }
    
    // ========== VISUALIZAÇÃO RESUMIDA PARA CLIENTE ==========
    function carregarVisualizacaoResumida(proposta) {
        const container = document.getElementById('cargos-container');
        if (!container) return;
        
        // Usar a função formatarMoeda que já existe no escopo global
        const formatMoney = (valor) => {
            return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        };
        
        let html = `
            <div class="visualizacao-resumida">
                <div class="vis-header">
                    <i class="fas fa-chart-line"></i>
                    <h2>Proposta Comercial</h2>
                    <p class="vis-subtitle">Prompt Serviços - Contrato Terceirizado</p>
                </div>
                
                <div class="vis-info">
                    <div class="vis-info-item">
                        <span class="vis-label">Cliente:</span>
                        <span class="vis-value">${escapeHtml(proposta.cliente || 'Não informado')}</span>
                    </div>
                    <div class="vis-info-item">
                        <span class="vis-label">Vendedor:</span>
                        <span class="vis-value">${escapeHtml(proposta.vendedor || 'Não informado')}</span>
                    </div>
                    <div class="vis-info-item">
                        <span class="vis-label">Data:</span>
                        <span class="vis-value">${new Date(proposta.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
        `;
        
        // Para cada cargo, mostrar apenas valores resumidos
        let cargoIndex = 0;
        let totalGeralProposta = 0;
        
        proposta.cargos.forEach(cargo => {
            cargoIndex++;
            const qtd = cargo.quantidade || 1;
            const totalVaga = cargo.totalVaga || 0;
            const totalVagas = totalVaga * qtd;
            totalGeralProposta += totalVagas;
            
            html += `
                <div class="vis-cargo">
                    <div class="vis-cargo-header">
                        <h3>${cargoIndex}. ${escapeHtml(cargo.nome || 'Cargo sem nome')}</h3>
                        <span class="vis-quantidade">${qtd} vaga${qtd > 1 ? 's' : ''}</span>
                    </div>
                    <div class="vis-resumo">
                        <div class="vis-resumo-item">
                            <strong>Valor por vaga:</strong>
                            <span>${formatMoney(totalVaga)}</span>
                        </div>
                        <div class="vis-resumo-item vis-destaque">
                            <strong>Total (${qtd} vaga${qtd > 1 ? 's' : ''}):</strong>
                            <span>${formatMoney(totalVagas)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                <div class="vis-total-geral">
                    <strong>TOTAL DA PROPOSTA:</strong>
                    <span>${formatMoney(totalGeralProposta)}</span>
                </div>
                
                <div class="vis-footer">
                    <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                
                <div class="vis-actions">
                    <button id="btn-capturar-imagem" class="btn-capturar">
                        <i class="fas fa-camera"></i> Capturar como Imagem
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Adicionar CSS específico para visualização resumida
        const styleId = 'vis-resumida-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .visualizacao-resumida {
                    max-width: 800px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                }
                .vis-header {
                    text-align: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #c10404;
                }
                .vis-header h2 {
                    color: #c10404;
                    margin: 0.5rem 0;
                }
                .vis-subtitle {
                    color: #666;
                    font-size: 0.9rem;
                }
                .vis-info {
                    background: #f5f5f5;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                }
                .vis-info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.3rem 0;
                }
                .vis-label {
                    font-weight: 600;
                    color: #666;
                }
                .vis-value {
                    color: #333;
                }
                .vis-cargo {
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 16px;
                    margin-bottom: 1.5rem;
                    overflow: hidden;
                }
                .vis-cargo-header {
                    background: #f8f8f8;
                    padding: 1rem;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .vis-cargo-header h3 {
                    color: #c10404;
                    margin: 0;
                    font-size: 1.1rem;
                }
                .vis-quantidade {
                    background: #c10404;
                    color: #fff;
                    padding: 0.2rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                }
                .vis-resumo {
                    padding: 1rem;
                }
                .vis-resumo-item {
                    padding: 0.5rem 0;
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px dashed #eee;
                }
                .vis-resumo-item:last-child {
                    border-bottom: none;
                }
                .vis-destaque {
                    font-size: 1.1rem;
                    font-weight: bold;
                    color: #c10404;
                    margin-top: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px solid #ddd;
                }
                .vis-total-geral {
                    background: linear-gradient(135deg, #c10404 0%, #a00303 100%);
                    color: #fff;
                    padding: 1.5rem;
                    border-radius: 16px;
                    text-align: center;
                    margin: 2rem 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 1.2rem;
                }
                .vis-total-geral span {
                    font-size: 1.8rem;
                    font-weight: bold;
                }
                .vis-footer {
                    text-align: center;
                    padding: 1rem;
                    color: #888;
                    font-size: 0.8rem;
                    border-top: 1px solid #e0e0e0;
                    margin-top: 1rem;
                }
                .vis-actions {
                    text-align: center;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e0e0e0;
                }
                .btn-capturar {
                    background: linear-gradient(135deg, #c10404 0%, #a00303 100%);
                    color: #fff;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 30px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .btn-capturar:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(193, 4, 4, 0.3);
                }
                .btn-capturar:active {
                    transform: translateY(0);
                }
                .btn-capturar:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                body.light-mode .vis-cargo {
                    background: #fff;
                }
                body.light-mode .vis-info {
                    background: #f5f5f5;
                }
                body.light-mode .vis-cargo-header {
                    background: #f8f8f8;
                }
                body.dark-mode .vis-cargo {
                    background: #1a1a1a;
                    border-color: #333;
                }
                body.dark-mode .vis-info {
                    background: #1a1a1a;
                }
                body.dark-mode .vis-cargo-header {
                    background: #222;
                }
                body.dark-mode .vis-resumo-item {
                    color: #ccc;
                    border-bottom-color: #333;
                }
                body.dark-mode .vis-value {
                    color: #fff;
                }
                body.dark-mode .vis-actions {
                    border-top-color: #333;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Adicionar evento ao botão de capturar imagem
        const btnCapturar = document.getElementById('btn-capturar-imagem');
        if (btnCapturar) {
            btnCapturar.addEventListener('click', capturarImagemProposta);
        }
    }
    
    // ========== VERIFICAR MODO VISUALIZAÇÃO ==========
    function checkVisualizacao() {
        const urlParams = new URLSearchParams(window.location.search);
        const isVisualizacao = urlParams.get('visualizacao') === 'true';
        
        if (isVisualizacao) {
            const propostaId = urlParams.get('id');
            if (!propostaId) return;
            
            // Buscar a proposta no Firebase para exibir a versão resumida
            db.collection('propostas').doc(propostaId).get()
                .then((doc) => {
                    if (doc.exists) {
                        const proposta = doc.data();
                        // Exibir versão resumida
                        carregarVisualizacaoResumida(proposta);
                        
                        // Esconder elementos de edição
                        const btnAdicionar = document.getElementById('adicionar-cargo');
                        const btnSalvar = document.getElementById('btn-salvar');
                        const btnGerarPDF = document.getElementById('btn-gerar-pdf');
                        const btnCompartilhar = document.getElementById('btn-compartilhar');
                        const clienteInput = document.getElementById('cliente-nome');
                        
                        if (btnAdicionar) btnAdicionar.style.display = 'none';
                        if (btnSalvar) btnSalvar.style.display = 'none';
                        if (btnGerarPDF) btnGerarPDF.style.display = 'none';
                        if (btnCompartilhar) btnCompartilhar.style.display = 'none';
                        if (clienteInput) {
                            clienteInput.disabled = true;
                            clienteInput.value = proposta.cliente || '';
                        }
                        
                        // Esconder todas as seções expansíveis originais
                        document.querySelectorAll('.expandable-section, .exames-section, .despesas-section, .cargo-linha, .cargo-header, .cargo-resultados').forEach(el => {
                            if (el) el.style.display = 'none';
                        });
                        
                        // Esconder botões de remover
                        document.querySelectorAll('.btn-remover, .btn-remover-beneficio, .btn-add-beneficio').forEach(btn => {
                            if (btn) btn.style.display = 'none';
                        });
                        
                        // Adicionar aviso de visualização
                        const aviso = document.createElement('div');
                        aviso.className = 'aviso-visualizacao';
                        aviso.innerHTML = `
                            <div style="background: #c10404; color: #fff; text-align: center; padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem;">
                                <i class="fas fa-eye"></i> <strong>Modo de visualização</strong> - Versão resumida da proposta
                            </div>
                        `;
                        const containerDiv = document.querySelector('.container');
                        if (containerDiv && !containerDiv.querySelector('.aviso-visualizacao')) {
                            containerDiv.insertBefore(aviso, containerDiv.firstChild);
                        }
                    } else {
                        document.getElementById('cargos-container').innerHTML = '<p style="text-align:center;padding:2rem;">Proposta não encontrada.</p>';
                    }
                })
                .catch((error) => {
                    console.error('Erro ao carregar proposta:', error);
                    document.getElementById('cargos-container').innerHTML = '<p style="text-align:center;padding:2rem;">Erro ao carregar proposta.</p>';
                });
        }
    }
    
    // ========== VERIFICAR MODO VISUALIZAÇÃO ==========
    function checkVisualizacao() {
        const urlParams = new URLSearchParams(window.location.search);
        const isVisualizacao = urlParams.get('visualizacao') === 'true';
        
        if (isVisualizacao) {
            const propostaId = urlParams.get('id');
            if (!propostaId) return;
            
            // Buscar a proposta no Firebase para exibir a versão resumida
            db.collection('propostas').doc(propostaId).get()
                .then((doc) => {
                    if (doc.exists) {
                        const proposta = doc.data();
                        // Exibir versão resumida
                        carregarVisualizacaoResumida(proposta);
                        
                        // Esconder elementos de edição
                        const btnAdicionar = document.getElementById('adicionar-cargo');
                        const btnSalvar = document.getElementById('btn-salvar');
                        const btnGerarPDF = document.getElementById('btn-gerar-pdf');
                        const btnCompartilhar = document.getElementById('btn-compartilhar');
                        const clienteInput = document.getElementById('cliente-nome');
                        
                        if (btnAdicionar) btnAdicionar.style.display = 'none';
                        if (btnSalvar) btnSalvar.style.display = 'none';
                        if (btnGerarPDF) btnGerarPDF.style.display = 'none';
                        if (btnCompartilhar) btnCompartilhar.style.display = 'none';
                        if (clienteInput) {
                            clienteInput.disabled = true;
                            clienteInput.value = proposta.cliente || '';
                        }
                        
                        // Esconder todas as seções expansíveis originais
                        document.querySelectorAll('.expandable-section, .exames-section, .despesas-section, .cargo-linha, .cargo-header, .cargo-resultados').forEach(el => {
                            if (el) el.style.display = 'none';
                        });
                        
                        // Esconder botões de remover
                        document.querySelectorAll('.btn-remover, .btn-remover-beneficio, .btn-add-beneficio').forEach(btn => {
                            if (btn) btn.style.display = 'none';
                        });
                        
                        // Adicionar aviso de visualização
                        const aviso = document.createElement('div');
                        aviso.className = 'aviso-visualizacao';
                        aviso.innerHTML = `
                            <div style="background: #c10404; color: #fff; text-align: center; padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem;">
                                <i class="fas fa-eye"></i> <strong>Modo de visualização</strong> - Versão resumida da proposta
                            </div>
                        `;
                        const containerDiv = document.querySelector('.container');
                        if (containerDiv && !containerDiv.querySelector('.aviso-visualizacao')) {
                            containerDiv.insertBefore(aviso, containerDiv.firstChild);
                        }
                    } else {
                        document.getElementById('cargos-container').innerHTML = '<p style="text-align:center;padding:2rem;">Proposta não encontrada.</p>';
                    }
                })
                .catch((error) => {
                    console.error('Erro ao carregar proposta:', error);
                    document.getElementById('cargos-container').innerHTML = '<p style="text-align:center;padding:2rem;">Erro ao carregar proposta.</p>';
                });
        }
    }
    
    // ========== SALVAR PROPOSTA ==========
    document.getElementById('btn-salvar').addEventListener('click', async function() {
        const vendedor = document.getElementById('vendedor-nome').textContent;
        const cliente = clienteInput.value || 'SEM CLIENTE';
        const urlParams = new URLSearchParams(window.location.search);
        const propostaId = urlParams.get('id');
        
        const cargos = [];
        document.querySelectorAll('.cargo-item').forEach(item => {
            const nome = item.querySelector('.cargo-nome').value.trim() || 'Cargo sem nome';
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            const salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            
            const encargosPercentualInput = item.querySelector('.encargos-percentual');
            const encargosPercentual = parseFloat(encargosPercentualInput?.value.replace(/\./g, '').replace(',', '.')) || 113.00;
            
            // ========== CAPTURAR DADOS DOS ADICIONAIS ==========
            // Procura a seção de adicionais de forma mais robusta
            const adicionaisSection = item.querySelector('.expandable-section .adicionais-grid')?.closest('.expandable-section') 
                || item.querySelector('.expandable-section:first-child');

            if (!adicionaisSection) {
                console.error('Seção de adicionais não encontrada!');
            }

            // Busca os elementos dentro da seção
            const adicionaisContent = adicionaisSection?.querySelector('.section-content');
            if (!adicionaisContent) {
                console.error('Conteúdo da seção de adicionais não encontrado!');
            }

            // Adicionais existentes
            const heCheck = adicionaisContent?.querySelector('.he-check');
            const anCheck = adicionaisContent?.querySelector('.an-check');
            const perCheck = adicionaisContent?.querySelector('.per-check');
            const insCheck = adicionaisContent?.querySelector('.ins-check');
            const heHoras = parseFloat(adicionaisContent?.querySelector('.he-horas')?.value) || 0;
            const anHoras = parseFloat(adicionaisContent?.querySelector('.an-horas')?.value) || 0;

            // NOVOS CAMPOS: ACÚMULO DE FUNÇÃO - Busca de forma mais específica
            const acumuloCheck = adicionaisContent?.querySelector('.acumulo-check');
            const acumuloQuantidade = parseInt(adicionaisContent?.querySelector('.acumulo-quantidade')?.value) || 0;

            console.log('ACÚMULO - Checkbox encontrado:', !!acumuloCheck);
            console.log('ACÚMULO - Checkbox checked:', acumuloCheck?.checked);
            console.log('ACÚMULO - Quantidade:', acumuloQuantidade);
            
            // ========== UNIFORMES E EPIS ==========
            let uniformes = {}, epis = {};
            const uniformesSection = item.querySelectorAll('.expandable-section')[1];
            if (uniformesSection && uniformesSection.__getUniformesDados) {
                const dados = uniformesSection.__getUniformesDados();
                uniformes = dados.uniformes || {};
                epis = dados.epis || {};
            } else {
                const uniformesBox = item.querySelector('.uniformes-box');
                if (uniformesBox) {
                    uniformesBox.querySelectorAll('.item-lista').forEach(lista => {
                        const nomeItem = lista.querySelector('.item-nome')?.textContent;
                        const qtdInput = lista.querySelector('.quantidade-uniforme');
                        const depInput = lista.querySelector('.depreciacao-uniforme');
                        if (nomeItem && qtdInput && parseInt(qtdInput.value) > 0) {
                            uniformes[nomeItem] = {
                                quantidade: parseInt(qtdInput.value),
                                depreciacao: parseInt(depInput?.value) || 1
                            };
                        }
                    });
                }
                const episBox = item.querySelector('.epis-box');
                if (episBox) {
                    episBox.querySelectorAll('.item-lista').forEach(lista => {
                        const nomeItem = lista.querySelector('.item-nome')?.textContent;
                        const qtdInput = lista.querySelector('.quantidade-epi');
                        const depInput = lista.querySelector('.depreciacao-epi');
                        if (nomeItem && qtdInput && parseInt(qtdInput.value) > 0) {
                            epis[nomeItem] = {
                                quantidade: parseInt(qtdInput.value),
                                depreciacao: parseInt(depInput?.value) || 1
                            };
                        }
                    });
                }
            }
            
            // ========== BENEFÍCIOS ==========
            let beneficios = {};
            let beneficiosPersonalizados = [];
            const beneficiosSection = item.querySelectorAll('.expandable-section')[2];
            if (beneficiosSection && beneficiosSection.__getBeneficiosDados) {
                const dados = beneficiosSection.__getBeneficiosDados();
                beneficios = dados.beneficios || {};
                beneficiosPersonalizados = dados.beneficiosPersonalizados || [];
            } else {
                item.querySelectorAll('.beneficio-fixo-card').forEach(card => {
                    const campo = card.querySelector('.beneficio-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.beneficio-valor');
                    const diasInput = card.querySelector('.beneficio-dias');
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const dias = parseInt(diasInput?.value) || 0;
                    if (valor > 0 || dias > 0) {
                        beneficios[campo] = { valorDiario: valor, dias: dias };
                    }
                });
                item.querySelectorAll('.beneficio-custom-card').forEach(card => {
                    const nomeInput = card.querySelector('.beneficio-custom-nome');
                    const valorInput = card.querySelector('.beneficio-custom-valor');
                    const diasInput = card.querySelector('.beneficio-custom-dias');
                    const nome = nomeInput?.value.trim() || '';
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const dias = parseInt(diasInput?.value) || 0;
                    if (nome && (valor > 0 || dias > 0)) {
                        beneficiosPersonalizados.push({ nome, valorDiario: valor, dias: dias });
                    }
                });
            }
            
            // ========== SEGURANÇA ==========
            let seguranca = {};
            const segurancaSection = item.querySelectorAll('.expandable-section')[3];
            if (segurancaSection && segurancaSection.__getSegurancaDados) {
                seguranca = segurancaSection.__getSegurancaDados();
            } else {
                item.querySelectorAll('.seguranca-item').forEach(card => {
                    const campo = card.querySelector('.seguranca-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.seguranca-valor');
                    const depInput = card.querySelector('.seguranca-depreciacao');
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const depreciacao = parseInt(depInput?.value) || 1;
                    if (valor > 0) {
                        seguranca[campo] = { valor: valor, depreciacao: depreciacao };
                    }
                });
            }
            
            // ========== EXAMES E TREINAMENTOS ==========
            const examesSection = item.querySelector('.exames-section');
            let exames = {};
            let treinamento = 0;
            
            if (examesSection) {
                examesSection.querySelectorAll('.exame-checkbox').forEach(cb => {
                    if (cb.checked) {
                        exames[cb.dataset.nome] = true;
                    }
                });
                
                const treinamentoInput = examesSection.querySelector('.treinamento-valor');
                if (treinamentoInput) {
                    treinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                }
            }
            
            // ========== INSUMOS ==========
            let insumos = {};
            const insumosSection = item.querySelectorAll('.expandable-section')[5];
            if (insumosSection && insumosSection.__getInsumosDados) {
                insumos = insumosSection.__getInsumosDados();
            } else {
                item.querySelectorAll('.insumo-card').forEach(card => {
                    const campo = card.querySelector('.insumo-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.insumo-valor');
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    if (valor > 0) {
                        insumos[campo] = { valor: valor };
                    }
                });
            }
            
            // ========== DESPESAS ==========
            const despesasSection = item.querySelector('.despesas-section');
            let despesas = {};
            if (despesasSection && despesasSection.__getDespesasDados) {
                despesas = despesasSection.__getDespesasDados();
            }
            
            // ========== TOTAL DA VAGA ==========
            const totalVagaElem = item.querySelector('.total-prestacao .valor');
            const totalVaga = totalVagaElem ? parseFloat(totalVagaElem.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0 : 0;
            
            // ========== MONTAR OBJETO DO CARGO ==========
            cargos.push({
                nome,
                quantidade: qtd,
                salario,
                adicionais: {
                    horasExtras: heCheck?.checked || false,
                    noturno: anCheck?.checked || false,
                    periculosidade: perCheck?.checked || false,
                    insalubridade: insCheck?.checked || false,
                    heHoras: heHoras,
                    anHoras: anHoras,
                    // NOVOS CAMPOS: ACÚMULO DE FUNÇÃO
                    acumulo: acumuloCheck?.checked || false,
                    acumuloQuantidade: acumuloQuantidade,
                    encargosPercentual: encargosPercentual
                },
                uniformes,
                epis,
                beneficios,
                beneficiosPersonalizados,
                seguranca,
                exames,
                treinamento,
                insumos,
                despesas,
                totalVaga
            });
        });
        
        const totalGeral = parseFloat(totalGeralEl.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        
        const proposta = {
            vendedor,
            cliente,
            data: new Date().toISOString(),
            tipo: 'terceirizado',
            cargos,
            totalGeral
        };
        
        console.log('Proposta sendo salva:', proposta);
        
        try {
            if (propostaId) {
                await db.collection('propostas').doc(propostaId).update(proposta);
                mostrarModal('Proposta atualizada com sucesso!');
                localStorage.removeItem(DRAFT_KEY);
            } else {
                const docRef = await db.collection('propostas').add(proposta);
                mostrarModal('Proposta salva com sucesso!');
                window.history.replaceState(null, '', `?id=${docRef.id}`);
                localStorage.removeItem(DRAFT_KEY);
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            mostrarModal('Erro ao salvar proposta.');
        }
    });

    // ========== INICIALIZAR FUNCIONALIDADES ==========
    initTema();
    initBaixarProposta();
    checkVisualizacao();
    
});