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
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// ================== CONSTANTES ==================
const SALARIO_MINIMO = 1621.00;
const HORAS_MENSAL = 220;
const TAXA_ENCARGOS_PADRAO = 0.5583;

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

const BENEFICIOS = [
    { nome: "Vale Refeição", campo: "vr" },
    { nome: "Café", campo: "cafe" },
    { nome: "PLR", campo: "plr" },
    { nome: "Auxílio Saúde", campo: "saude" },
    { nome: "Vale Transporte", campo: "vt" }
];

const SEGURANCA = [
    { nome: "SST (Segurança e Saúde do Trabalho)", campo: "sst" },
    { nome: "Seguro de Vida", campo: "seguro_vida" }
];

const INSUMOS = [
    { nome: "Rádios / Bastão de Ronda", campo: "radio" },
    { nome: "Insumos (Materiais de Limpeza)", campo: "insumos" },
    { nome: "Maquinário", campo: "maquinario" }
];

const DESPESAS = [
    { nome: "Taxa Adm (Sob salário + encargos)", campo: "taxa_adm", porcentagem: 0 },
    { nome: "Encargos fiscais (Sob valor bruto)", campo: "encargos_fiscais", porcentagem: 0 }
];

const EXAMES_OBRIGATORIOS = [
    { nome: "Clínico", preco: 55.00, obrigatorio: true },
    { nome: "Audiometria", preco: 28.00, obrigatorio: true },
    { nome: "Acuidade", preco: 28.00, obrigatorio: true }
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

const TAXA_EXAMES = 0.1375;
const DRAFT_KEY = 'proposta_temporario_draft';

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ========== FUNÇÃO AUXILIAR ESCAPE HTML ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== FUNÇÃO PARA GERAR IMAGEM DA PROPOSTA COM DETALHES ==========
// ========== FUNÇÃO PARA GERAR IMAGEM DA PROPOSTA NO FORMATO HORIZONTAL ==========
async function gerarImagemPropostaDetalhada() {
    // Mostrar indicador de carregamento
    const btnCompartilhar = document.getElementById('btn-compartilhar');
    const textoOriginal = btnCompartilhar ? btnCompartilhar.innerHTML : '';
    if (btnCompartilhar) {
        btnCompartilhar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando imagem...';
        btnCompartilhar.disabled = true;
    }
    
    try {
        // Criar um elemento temporário para a visualização em formato horizontal
        const elementoVisualizacao = document.createElement('div');
        elementoVisualizacao.className = 'visualizacao-detalhada-horizontal';
        elementoVisualizacao.style.position = 'fixed';
        elementoVisualizacao.style.left = '-9999px';
        elementoVisualizacao.style.top = '-9999px';
        elementoVisualizacao.style.backgroundColor = '#ffffff';
        elementoVisualizacao.style.padding = '1.5rem';
        elementoVisualizacao.style.borderRadius = '16px';
        elementoVisualizacao.style.width = '1920px';
        elementoVisualizacao.style.maxWidth = '1920px';
        elementoVisualizacao.style.fontFamily = "'Inter', sans-serif";
        
        // Coletar dados da proposta atual
        const cliente = document.getElementById('cliente-nome').value || 'Não informado';
        const vendedor = document.getElementById('vendedor-nome').textContent || 'Não informado';
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        
        // Coletar dados detalhados de todos os cargos em formato compacto
        let cargosHTML = '';
        let cargoIndex = 0;
        let totalGeralProposta = 0;
        
        document.querySelectorAll('.cargo-item').forEach(item => {
            cargoIndex++;
            const nomeCargo = item.querySelector('.cargo-nome').value.trim() || 'Cargo sem nome';
            const qtdVagas = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            const salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            
            // Obter encargos percentual
            const encargosPercentualInput = item.querySelector('.encargos-percentual');
            const encargosPercentual = parseFloat(encargosPercentualInput?.value.replace(/\./g, '').replace(',', '.')) || 55.83;
            
            // Pegar o TOTAL FINAL DA VAGA
            const totalVagaElem = item.querySelector('.total-prestacao .valor');
            let totalVaga = 0;
            if (totalVagaElem) {
                const totalText = totalVagaElem.textContent;
                totalVaga = parseFloat(totalText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
            }
            
            totalGeralProposta += totalVaga;
            
            // Coletar resultados detalhados de forma compacta
            const resultadosDiv = item.querySelector('.cargo-resultados');
            let resumoValores = '';
            let detalhesItens = '';
            
            if (resultadosDiv) {
                const blocos = resultadosDiv.querySelectorAll('.resultado-bloco');
                blocos.forEach(bloco => {
                    const rotulo = bloco.querySelector('.rotulo')?.innerHTML || '';
                    const valor = bloco.querySelector('.valor')?.textContent || '';
                    const rotuloLimpo = rotulo.replace(/<[^>]*>/g, '').trim();
                    
                    if (rotuloLimpo && valor && !rotuloLimpo.includes('TOTAL FINAL')) {
                        if (rotuloLimpo.includes('SUB TOTAL') || rotuloLimpo.includes('Encargos') || rotuloLimpo.includes('Valor por vaga')) {
                            resumoValores += `
                                <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid #eee;">
                                    <span style="font-size: 0.7rem;">${rotuloLimpo}:</span>
                                    <span style="font-weight: bold; color: #c10404; font-size: 0.7rem;">${valor}</span>
                                </div>
                            `;
                        } else if (!rotuloLimpo.includes('Acúmulo')) {
                            detalhesItens += `
                                <div style="display: flex; justify-content: space-between; padding: 0.2rem 0; border-bottom: 1px solid #f0f0f0;">
                                    <span style="font-size: 0.65rem;">${rotuloLimpo}:</span>
                                    <span style="font-size: 0.65rem;">${valor}</span>
                                </div>
                            `;
                        }
                    }
                });
            }
            
            cargosHTML += `
                <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; margin-bottom: 1rem; overflow: hidden; break-inside: avoid;">
                    <div style="background: #c10404; color: #fff; padding: 0.5rem 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; font-size: 0.9rem;">${cargoIndex}. ${escapeHtml(nomeCargo)}</h3>
                        <span style="background: #fff; color: #c10404; padding: 0.15rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: bold;">${qtdVagas} vaga${qtdVagas > 1 ? 's' : ''}</span>
                    </div>
                    <div style="padding: 0.8rem; display: flex; flex-wrap: wrap; gap: 1rem;">
                        <div style="flex: 1; min-width: 200px;">
                            <div style="background: #f8f8f8; padding: 0.5rem; border-radius: 8px; margin-bottom: 0.5rem;">
                                <h4 style="color: #c10404; margin: 0 0 0.3rem 0; font-size: 0.75rem;">Informações</h4>
                                <div style="font-size: 0.7rem;"><strong>Salário:</strong> ${formatarMoeda(salario)}</div>
                                <div style="font-size: 0.7rem;"><strong>Encargos:</strong> ${encargosPercentual.toFixed(2)}%</div>
                                <div style="font-size: 0.7rem;"><strong>Valor por vaga:</strong> ${formatarMoeda(totalVaga / qtdVagas)}</div>
                                <div style="font-size: 0.7rem; color: #c10404; font-weight: bold;"><strong>Total:</strong> ${formatarMoeda(totalVaga)}</div>
                            </div>
                            ${resumoValores ? `
                            <div style="background: #f8f8f8; padding: 0.5rem; border-radius: 8px;">
                                <h4 style="color: #c10404; margin: 0 0 0.3rem 0; font-size: 0.75rem;">Resumo</h4>
                                ${resumoValores}
                            </div>
                            ` : ''}
                        </div>
                        <div style="flex: 2; min-width: 300px;">
                            ${detalhesItens ? `
                            <div style="background: #f8f8f8; padding: 0.5rem; border-radius: 8px;">
                                <h4 style="color: #c10404; margin: 0 0 0.3rem 0; font-size: 0.75rem;">Composição</h4>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.2rem 0.5rem;">
                                    ${detalhesItens}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Construir HTML da visualização horizontal
        elementoVisualizacao.innerHTML = `
            <div style="max-width: 1900px; margin: 0 auto;">
                <!-- Cabeçalho -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #c10404;">
                    <div>
                        <i class="fas fa-chart-line" style="font-size: 1.8rem; color: #c10404;"></i>
                        <h1 style="color: #c10404; margin: 0; font-size: 1.5rem;">Prompt Serviços</h1>
                        <p style="color: #666; margin: 0; font-size: 0.7rem;">Contrato Terceirizado</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: linear-gradient(135deg, #c10404 0%, #a00303 100%); color: #fff; padding: 0.5rem 1rem; border-radius: 12px;">
                            <div style="font-size: 0.7rem;">TOTAL DA PROPOSTA</div>
                            <div style="font-size: 1.3rem; font-weight: bold;">${formatarMoeda(totalGeralProposta)}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Informações do Cliente -->
                <div style="display: flex; gap: 2rem; background: #f5f5f5; padding: 0.8rem; border-radius: 10px; margin-bottom: 1.5rem;">
                    <div style="flex: 1;">
                        <span style="font-weight: 600; color: #666; font-size: 0.7rem;">CLIENTE:</span>
                        <span style="color: #333; font-size: 0.8rem; font-weight: bold;">${escapeHtml(cliente)}</span>
                    </div>
                    <div style="flex: 1;">
                        <span style="font-weight: 600; color: #666; font-size: 0.7rem;">VENDEDOR:</span>
                        <span style="color: #333; font-size: 0.8rem;">${escapeHtml(vendedor)}</span>
                    </div>
                    <div>
                        <span style="font-weight: 600; color: #666; font-size: 0.7rem;">DATA:</span>
                        <span style="color: #333; font-size: 0.8rem;">${escapeHtml(dataAtual)}</span>
                    </div>
                </div>
                
                <!-- Cargos -->
                <div style="display: grid; grid-template-columns: repeat(${Math.min(document.querySelectorAll('.cargo-item').length, 2)}, 1fr); gap: 1rem;">
                    ${cargosHTML}
                </div>
                
                <!-- Rodapé -->
                <div style="text-align: center; padding: 1rem; color: #888; font-size: 0.6rem; border-top: 1px solid #e0e0e0; margin-top: 1.5rem;">
                    <p>Documento gerado em ${escapeHtml(dataAtual)} | Prompt Serviços - Proposta Comercial</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(elementoVisualizacao);
        
        // Usar html2canvas para gerar a imagem no tamanho 1920x1080
        const canvas = await html2canvas(elementoVisualizacao, {
            scale: 1.5,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: false,
            width: 1920,
            height: 1080,
            windowWidth: 1920,
            windowHeight: 1080
        });
        
        // Redimensionar o canvas para 1920x1080 se necessário
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 1920;
        finalCanvas.height = 1080;
        const ctx = finalCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1920, 1080);
        
        // Calcular posição para centralizar
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const x = (1920 - imgWidth) / 2;
        const y = (1080 - imgHeight) / 2;
        ctx.drawImage(canvas, Math.max(0, x), Math.max(0, y));
        
        // Remover o elemento temporário
        document.body.removeChild(elementoVisualizacao);
        
        // Criar link para download
        const link = document.createElement('a');
        const clienteNome = cliente.replace(/[^a-zA-Z0-9]/g, '_');
        const dataAtualFormatada = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `Proposta_${clienteNome}_${dataAtualFormatada}.png`;
        link.href = finalCanvas.toDataURL('image/png');
        link.click();
        
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        alert('Erro ao gerar imagem. Tente novamente.');
    } finally {
        // Restaurar botão
        if (btnCompartilhar) {
            btnCompartilhar.innerHTML = textoOriginal;
            btnCompartilhar.disabled = false;
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

    function calcularTotalGeral() {
        let total = 0;
        document.querySelectorAll('.cargo-item').forEach(item => {
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const totalVagaElem = item.querySelector('.total-prestacao .valor');
            if (totalVagaElem) {
                const totalText = totalVagaElem.textContent;
                const totalValor = parseFloat(totalText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                total += totalValor * qtd;
            }
        });
        totalGeralEl.textContent = formatarMoeda(total);
        return total;
    }

    function salvarRascunho() {
        try {
            const dados = {
                cliente: clienteInput.value,
                cargos: []
            };
            
            document.querySelectorAll('.cargo-item').forEach(item => {
                const cargo = {
                    nome: item.querySelector('.cargo-nome')?.value || '',
                    quantidade: item.querySelector('.cargo-quantidade')?.value || 1,
                    salario: item.querySelector('.cargo-salario')?.value || '',
                    encargosPercentual: item.querySelector('.encargos-percentual')?.value || '55,83',
                    adicionais: {
                        horasExtras: item.querySelector('.he-check')?.checked || false,
                        noturno: item.querySelector('.an-check')?.checked || false,
                        periculosidade: item.querySelector('.per-check')?.checked || false,
                        insalubridade: item.querySelector('.ins-check')?.checked || false,
                        heHoras: item.querySelector('.he-horas')?.value || 0,
                        anHoras: item.querySelector('.an-horas')?.value || 0
                    },
                    uniformes: {},
                    epis: {},
                    beneficios: {},
                    seguranca: {},
                    insumos: {},
                    despesas: {},
                    exames: {},
                    treinamento: 0
                };
                
                item.querySelectorAll('.uniformes-box .item-lista').forEach(lista => {
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
                
                item.querySelectorAll('.epis-box .item-lista').forEach(lista => {
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
                
                item.querySelectorAll('.beneficio-card').forEach(card => {
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
                
                item.querySelectorAll('.seguranca-item').forEach(card => {
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
                
                item.querySelectorAll('.insumo-card').forEach(card => {
                    const campo = card.querySelector('.insumo-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.insumo-valor');
                    if (campo) {
                        const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                        if (valor > 0) {
                            cargo.insumos[campo] = { valor: valor };
                        }
                    }
                });
                
                const despesasSection = item.querySelector('.despesas-section');
                if (despesasSection) {
                    despesasSection.querySelectorAll('.despesa-card').forEach(card => {
                        const campo = card.querySelector('.despesa-porcentagem')?.dataset.campo;
                        const porcentagemInput = card.querySelector('.despesa-porcentagem');
                        if (campo) {
                            const porcentagem = parseFloat(porcentagemInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                            if (porcentagem > 0) {
                                cargo.despesas[campo] = { porcentagem: porcentagem };
                            }
                        }
                    });
                }
                
                const examesSection = item.querySelector('.exames-section');
                if (examesSection) {
                    const examesObj = {};
                    examesSection.querySelectorAll('.exame-checkbox').forEach(cb => {
                        if (cb.checked) {
                            examesObj[cb.dataset.nome] = true;
                        }
                    });
                    cargo.exames = examesObj;
                    
                    const treinamentoInput = examesSection.querySelector('.treinamento-valor');
                    if (treinamentoInput) {
                        cargo.treinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                    }
                }
                
                dados.cargos.push(cargo);
            });
            
            localStorage.setItem(DRAFT_KEY, JSON.stringify(dados));
        } catch (e) {
            console.error('Erro ao salvar rascunho:', e);
        }
    }
    
    function carregarRascunho() {
        try {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
                const dados = JSON.parse(draft);
                if (dados.cliente) clienteInput.value = dados.cliente;
                if (dados.cargos && dados.cargos.length > 0) {
                    container.innerHTML = '';
                    dados.cargos.forEach(c => {
                        let examesObj = c.exames || {};
                        container.appendChild(criarCargoItem(
                            c.nome,
                            c.quantidade,
                            parseFloat(c.salario?.replace(/\./g, '').replace(',', '.')) || 0,
                            c.adicionais || {},
                            c.uniformes || {},
                            c.epis || {},
                            c.beneficios || {},
                            c.seguranca || {},
                            c.insumos || {},
                            c.despesas || {},
                            examesObj,
                            c.treinamento || 0,
                            parseFloat(c.adicionais?.encargosPercentual?.replace(/\./g, '').replace(',', '.')) || 55.83
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
                <i class="fas fa-chevron-down section-toggle"></i>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'section-content';
        content.innerHTML = conteudoHtml;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = !iniciarRetraido;
        
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
        
        return { div, atualizar, getQuantidade: () => parseInt(quantidadeInput.value) || 0, getDepreciacao: () => parseInt(depreciacaoInput.value) || 1, getMensal: () => {
            const qtd = parseInt(quantidadeInput.value) || 0;
            const depreciacao = parseInt(depreciacaoInput.value) || 1;
            return (qtd * item.preco) / depreciacao;
        } };
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
                    <div class="uniformes-total">Total Mensal Uniformes: <span>R$ 0,00</span></div>
                </div>
                <div class="epis-box">
                    <div class="box-header">
                        <h4><i class="fas fa-hard-hat"></i> EPIs</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-menu epis-menu"></div>
                    <div class="epis-total">Total Mensal EPIs: <span>R$ 0,00</span></div>
                </div>
            </div>
        `;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = false;
        content.classList.add('collapsed');
        // Quando fechado, seta pra BAIXO
        header.querySelector('.section-toggle').classList.remove('fa-chevron-up');
        header.querySelector('.section-toggle').classList.add('fa-chevron-down');
        
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
        
        const uniformesBox = content.querySelector('.uniformes-box');
        const episBox = content.querySelector('.epis-box');
        const uniformesMenu = content.querySelector('.uniformes-menu');
        const episMenu = content.querySelector('.epis-menu');
        const uniformesTotalSpan = content.querySelector('.uniformes-total span');
        const episTotalSpan = content.querySelector('.epis-total span');
        
        const uniformesItems = [];
        const episItems = [];
        
        UNIFORMES.forEach(u => {
            const { div, atualizar, getQuantidade, getDepreciacao, getMensal } = criarItemListaComDepreciacao(u, 'uniforme');
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
                getPreco: () => u.preco,
                getNome: () => u.nome,
                div
            });
        });
        
        EPIS.forEach(e => {
            const { div, atualizar, getQuantidade, getDepreciacao, getMensal } = criarItemListaComDepreciacao(e, 'epi');
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
                getPreco: () => e.preco,
                getNome: () => e.nome,
                div
            });
        });
        
        function calcularTotalUniformeMensal() {
            let total = 0;
            uniformesItems.forEach(item => {
                total += item.getMensal();
            });
            uniformesTotalSpan.textContent = formatarMoeda(total);
            return total;
        }
        
        function calcularTotalEpiMensal() {
            let total = 0;
            episItems.forEach(item => {
                total += item.getMensal();
            });
            episTotalSpan.textContent = formatarMoeda(total);
            return total;
        }
        
        function atualizarTotais() {
            const totalUniforme = calcularTotalUniformeMensal();
            const totalEpi = calcularTotalEpiMensal();
            const totalGeral = totalUniforme + totalEpi;
            header.querySelector('.summary-value').textContent = formatarMoeda(totalGeral);
            return { totalUniforme, totalEpi, totalGeral };
        }
        
        uniformesItems.forEach(item => {
            item.div.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => {
                    atualizarTotais();
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
                    atualizarTotais();
                    if (cargoItem && cargoItem.dispatchEvent) {
                        cargoItem.dispatchEvent(new Event('recalcular'));
                    }
                    salvarRascunho();
                });
            });
        });
        
        const uniformesHeader = uniformesBox.querySelector('.box-header');
        const episHeader = episBox.querySelector('.box-header');
        const uniformesMenuEl = uniformesMenu;
        const episMenuEl = episMenu;
        
        // Configurar setas dos dropdowns
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
        
        atualizarTotais();
        
        return { 
            section, 
            atualizarTotais, 
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
                return { uniformes, epis };
            } 
        };
    }

    function criarBeneficiosSection(dadosBeneficios = {}) {
        const conteudoHtml = `<div class="beneficios-grid"></div>`;
        const { section, updateSummary, content } = criarSecaoExpansivel('Benefícios', 'fa-gift', conteudoHtml, true);
        const grid = content.querySelector('.beneficios-grid');
        
        BENEFICIOS.forEach(b => {
            const card = document.createElement('div');
            card.className = 'beneficio-card';
            const valorDiario = dadosBeneficios[b.campo]?.valorDiario ?? 0;
            const dias = dadosBeneficios[b.campo]?.dias ?? 0;
            card.innerHTML = `
                <div class="beneficio-nome">${b.nome}</div>
                <div class="beneficio-campos">
                    <div class="beneficio-campo">
                        <label>R$ / dia</label>
                        <input type="text" class="beneficio-valor" data-campo="${b.campo}" placeholder="0,00" value="${valorDiario.toFixed(2).replace('.', ',')}">
                    </div>
                    <div class="beneficio-campo">
                        <label>Dias</label>
                        <input type="number" class="beneficio-dias" data-campo="${b.campo}" placeholder="0" value="${dias}">
                    </div>
                </div>
                <div class="beneficio-total">Total: R$ 0,00</div>
            `;
            grid.appendChild(card);
        });
        
        function calcularTotal() {
            let total = 0;
            grid.querySelectorAll('.beneficio-card').forEach(card => {
                const valorInput = card.querySelector('.beneficio-valor');
                const diasInput = card.querySelector('.beneficio-dias');
                let valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                let dias = parseInt(diasInput.value) || 0;
                const subtotal = valor * dias;
                total += subtotal;
                const totalSpan = card.querySelector('.beneficio-total');
                totalSpan.textContent = `Total: ${formatarMoeda(subtotal)}`;
            });
            updateSummary(total);
            return total;
        }
        
        grid.querySelectorAll('.beneficio-valor, .beneficio-dias').forEach(input => {
            input.addEventListener('input', function(e) {
                if (e.target.classList.contains('beneficio-valor')) {
                    let valor = e.target.value.replace(/\D/g, '');
                    e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                }
                calcularTotal();
                salvarRascunho();
            });
        });
        
        calcularTotal();
        
        return { section, calcularTotal, getDados: () => {
            const beneficios = {};
            grid.querySelectorAll('.beneficio-card').forEach(card => {
                const campo = card.querySelector('.beneficio-valor').dataset.campo;
                const valorInput = card.querySelector('.beneficio-valor');
                const diasInput = card.querySelector('.beneficio-dias');
                const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                const dias = parseInt(diasInput.value) || 0;
                if (valor > 0 || dias > 0) {
                    beneficios[campo] = { valorDiario: valor, dias: dias };
                }
            });
            return beneficios;
        } };
    }

    function criarSegurancaSection(cargoItem, dadosSeguranca = {}) {
        const conteudoHtml = `<div class="seguranca-grid"></div>`;
        const { section, updateSummary, content } = criarSecaoExpansivel('Segurança e Seguro', 'fa-shield-alt', conteudoHtml, true);
        const grid = content.querySelector('.seguranca-grid');
        
        SEGURANCA.forEach(s => {
            const card = document.createElement('div');
            card.className = 'seguranca-item';
            const valorUnitario = dadosSeguranca[s.campo]?.valor ?? 0;
            const depreciacao = dadosSeguranca[s.campo]?.depreciacao ?? 0;
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

    function criarInsumosSection(cargoItem, dadosInsumos = {}) {
        const conteudoHtml = `<div class="insumos-grid"></div>`;
        const { section, updateSummary, content } = criarSecaoExpansivel('Insumos', 'fa-boxes', conteudoHtml, true);
        const grid = content.querySelector('.insumos-grid');
        
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
                <span class="summary-label">Subtotal da prestação:</span>
                <span class="summary-value">R$ 0,00</span>
                <i class="fas fa-chevron-down despesas-toggle"></i>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'despesas-content';
        content.innerHTML = `
            <div class="despesas-grid"></div>
            <div class="despesas-total">
                <span>Subtotal da prestação de serviço:</span>
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
        
        const grid = content.querySelector('.despesas-grid');
        const totalSpan = content.querySelector('.despesas-total span:last-child');
        
        const despesasItems = [];
        
        DESPESAS.forEach(d => {
            const card = document.createElement('div');
            card.className = 'despesa-card';
            const porcentagem = dadosDespesas[d.campo]?.porcentagem ?? 0;
            card.innerHTML = `
                <div class="despesa-nome">${d.nome}</div>
                <div class="despesa-campos">
                    <div class="despesa-campo">
                        <label>%</label>
                        <input type="text" class="despesa-porcentagem" data-campo="${d.campo}" placeholder="0,00" value="${porcentagem.toFixed(2).replace('.', ',')}">
                    </div>
                </div>
                <div class="despesa-valor">R$ 0,00</div>
                <div class="despesa-calculo"></div>
            `;
            grid.appendChild(card);
            despesasItems.push({
                card,
                campo: d.campo,
                porcentagemInput: card.querySelector('.despesa-porcentagem'),
                valorSpan: card.querySelector('.despesa-valor'),
                calculoSpan: card.querySelector('.despesa-calculo')
            });
        });
        
        function calcularDespesas(subtotalCargo, salario, encargosValor) {
            let taxaAdm = 0;
            let encargosFiscais = 0;
            
            despesasItems.forEach(item => {
                const porcentagem = parseFloat(item.porcentagemInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                
                if (item.campo === 'taxa_adm') {
                    const base = salario + encargosValor;
                    taxaAdm = base * (porcentagem / 100);
                    item.valorSpan.textContent = formatarMoeda(taxaAdm);
                    item.calculoSpan.textContent = `(${formatarMoeda(base)} × ${porcentagem}%)`;
                } else if (item.campo === 'encargos_fiscais') {
                    const base = subtotalCargo + taxaAdm;
                    encargosFiscais = base * (porcentagem / 100);
                    item.valorSpan.textContent = formatarMoeda(encargosFiscais);
                    item.calculoSpan.textContent = `(${formatarMoeda(base)} × ${porcentagem}%)`;
                }
            });
            
            const totalPrestacao = subtotalCargo + taxaAdm + encargosFiscais;
            totalSpan.textContent = formatarMoeda(totalPrestacao);
            header.querySelector('.summary-value').textContent = formatarMoeda(totalPrestacao);
            
            return { taxaAdm, encargosFiscais, totalPrestacao };
        }
        
        despesasItems.forEach(item => {
            item.porcentagemInput.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                if (cargoItem && cargoItem.dispatchEvent) {
                    cargoItem.dispatchEvent(new Event('recalcular-despesas'));
                }
                salvarRascunho();
            });
        });
        
        return { section, calcularDespesas, getDados: () => {
            const despesas = {};
            despesasItems.forEach(item => {
                const porcentagem = parseFloat(item.porcentagemInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                if (porcentagem > 0) {
                    despesas[item.campo] = { porcentagem: porcentagem };
                }
            });
            return despesas;
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
        `;
        
        section.appendChild(header);
        section.appendChild(content);
        
        let isExpanded = false;
        content.classList.add('collapsed');
        // Quando fechado, seta pra BAIXO
        header.querySelector('.exames-toggle').classList.remove('fa-chevron-up');
        header.querySelector('.exames-toggle').classList.add('fa-chevron-down');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            if (isExpanded) {
                content.classList.remove('collapsed');
                // ABERTO: seta pra CIMA
                header.querySelector('.exames-toggle').classList.remove('fa-chevron-down');
                header.querySelector('.exames-toggle').classList.add('fa-chevron-up');
            } else {
                content.classList.add('collapsed');
                // FECHADO: seta pra BAIXO
                header.querySelector('.exames-toggle').classList.remove('fa-chevron-up');
                header.querySelector('.exames-toggle').classList.add('fa-chevron-down');
            }
        });
        
        const examesBox = content.querySelector('.exames-box');
        const examesMenu = content.querySelector('.exames-menu');
        const examesTotalSpan = content.querySelector('.exames-total span');
        const treinamentoInput = content.querySelector('.treinamento-valor');
        const totalSecaoSpan = content.querySelector('.total-secao');
        
        const examesItems = [];
        
        EXAMES_OBRIGATORIOS.forEach(e => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'exames-item';
            const isChecked = dadosExames[e.nome] === true;
            itemDiv.innerHTML = `
                <div class="exames-item-nome">${e.nome}</div>
                <div class="exames-item-checkbox">
                    <span class="exames-item-preco">${formatarMoeda(e.preco)}</span>
                    <input type="checkbox" class="exame-checkbox" data-nome="${e.nome}" data-preco="${e.preco}" ${isChecked ? 'checked' : ''}>
                </div>
            `;
            examesMenu.appendChild(itemDiv);
            examesItems.push({
                nome: e.nome,
                preco: e.preco,
                checkbox: itemDiv.querySelector('.exame-checkbox'),
                obrigatorio: true
            });
        });
        
        EXAMES_COMPLEMENTARES.forEach(e => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'exames-item';
            const isChecked = dadosExames[e.nome] === true;
            itemDiv.innerHTML = `
                <div class="exames-item-nome">${e.nome}</div>
                <div class="exames-item-checkbox">
                    <span class="exames-item-preco">${formatarMoeda(e.preco)}</span>
                    <input type="checkbox" class="exame-checkbox" data-nome="${e.nome}" data-preco="${e.preco}" ${isChecked ? 'checked' : ''}>
                </div>
            `;
            examesMenu.appendChild(itemDiv);
            examesItems.push({
                nome: e.nome,
                preco: e.preco,
                checkbox: itemDiv.querySelector('.exame-checkbox'),
                obrigatorio: false
            });
        });
        
        function calcularTotalExames() {
            let totalExames = 0;
            examesItems.forEach(item => {
                if (item.checkbox.checked) {
                    totalExames += item.preco;
                }
            });
            const taxa = totalExames * TAXA_EXAMES;
            const totalComTaxa = totalExames + taxa;
            examesTotalSpan.textContent = formatarMoeda(totalComTaxa);
            return totalComTaxa;
        }
        
        function calcularTotal() {
            const totalExames = calcularTotalExames();
            let totalTreinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
            const totalGeral = totalExames + totalTreinamento;
            totalSecaoSpan.textContent = formatarMoeda(totalGeral);
            header.querySelector('.summary-value').textContent = formatarMoeda(totalGeral);
            return totalGeral;
        }
        
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
                const treinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                return { exames, treinamento };
            } 
        };
    }

    function criarCargoItem(cargo = '', quantidade = 1, salario = 0, dadosAdicionais = {}, dadosUniformes = {}, dadosEpis = {}, dadosBeneficios = {}, dadosSeguranca = {}, dadosInsumos = {}, dadosDespesas = {}, dadosExames = {}, treinamentoValor = 0, encargosPercentual = 55.83) {
        const item = document.createElement('div');
        item.className = 'cargo-item';
        
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
                    <input type="text" class="input-moderno encargos-percentual" placeholder="55,83" value="${encargosPercentual.toFixed(2).replace('.', ',')}" style="width: 80px; text-align: center;">
                    <span>%</span>
                </div>
            </div>
        `;
        item.appendChild(linha);
        
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
            </div>
        `;
        
        const { section: adicionaisSection, updateSummary: updateAdicionaisSummary, content: adicionaisContent } = criarSecaoExpansivel('Adicionais', 'fa-bolt', adicionaisHtml, true);
        item.appendChild(adicionaisSection);
        
        const { section: uniformesSection, atualizarTotais: atualizarUniformesTotais, getDados: getUniformesDados } = criarUniformesEpisSection(item, dadosUniformes, dadosEpis);
        item.appendChild(uniformesSection);
        
        const { section: beneficiosSection, calcularTotal: calcularBeneficios, getDados: getBeneficiosDados } = criarBeneficiosSection(dadosBeneficios);
        item.appendChild(beneficiosSection);
        
        const { section: segurancaSection, calcularTotal: calcularSeguranca, getDados: getSegurancaDados } = criarSegurancaSection(item, dadosSeguranca);
        item.appendChild(segurancaSection);
        
        const { section: insumosSection, calcularTotal: calcularInsumos, getDados: getInsumosDados } = criarInsumosSection(item, dadosInsumos);
        item.appendChild(insumosSection);
        
        const { section: despesasSection, calcularDespesas, getDados: getDespesasDados } = criarDespesasSection(item, dadosDespesas);
        item.appendChild(despesasSection);
        
        const { section: examesSection, calcularTotal: calcularExames, getDados: getExamesDados } = criarExamesSection(item, dadosExames, treinamentoValor);
        item.appendChild(examesSection);
        
        const resultadosDiv = document.createElement('div');
        resultadosDiv.className = 'cargo-resultados';
        item.appendChild(resultadosDiv);
        
        item.__getUniformesDados = getUniformesDados;
        item.__getBeneficiosDados = getBeneficiosDados;
        item.__getSegurancaDados = getSegurancaDados;
        item.__getInsumosDados = getInsumosDados;
        item.__getDespesasDados = getDespesasDados;
        item.__getExamesDados = getExamesDados;
        
        function atualizarResultados() {
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            let salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            const valorHora = salario / HORAS_MENSAL;
            
            const encargosPercentualInput = item.querySelector('.encargos-percentual');
            let taxaEncargos = parseFloat(encargosPercentualInput.value.replace(/\./g, '').replace(',', '.')) || 55.83;
            taxaEncargos = taxaEncargos / 100;
            
            let totalAdicionais = 0;
            
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
            
            updateAdicionaisSummary(totalAdicionais);
            
            const uniformesData = atualizarUniformesTotais();
            const totalUniformeEpi = uniformesData?.totalGeral || 0;
            const totalBeneficios = calcularBeneficios();
            const totalSeguranca = calcularSeguranca();
            const totalInsumos = calcularInsumos();
            
            const valorEncargos = salario * taxaEncargos;
            const subtotalSalarioEncargos = salario + valorEncargos + totalAdicionais;
            const subtotalInsumosBeneficios = totalUniformeEpi + totalBeneficios + totalSeguranca + totalInsumos;
            
            const despesasResult = calcularDespesas(subtotalSalarioEncargos, salario, valorEncargos);
            const totalExames = calcularExames();
            const totalFinalVaga = despesasResult.totalPrestacao + totalExames;
            
            encargosPercentualInput.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                atualizarResultados();
                salvarRascunho();
            });
            
            let resultadosHTML = `
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-calculator"></i> Encargos (${(taxaEncargos * 100).toFixed(2)}%)</span>
                    <span class="valor">${formatarMoeda(valorEncargos)}</span>
                </div>
            `;
            if (totalAdicionais > 0) {
                resultadosHTML += `
                    <div class="resultado-bloco">
                        <span class="rotulo"><i class="fas fa-plus-circle"></i> Adicionais</span>
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
                    <span class="rotulo"><i class="fas fa-chart-line"></i> Taxa Adm</span>
                    <span class="valor">${formatarMoeda(despesasResult.taxaAdm)}</span>
                </div>
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-file-invoice-dollar"></i> Encargos Fiscais</span>
                    <span class="valor">${formatarMoeda(despesasResult.encargosFiscais)}</span>
                </div>
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-stethoscope"></i> Exames e Treinamentos</span>
                    <span class="valor">${formatarMoeda(totalExames)}</span>
                </div>
                <div class="resultado-bloco total-prestacao">
                    <span class="rotulo"><i class="fas fa-calculator"></i> Total da vaga</span>
                    <span class="valor" style="color: #c10404; font-size: 1.2rem;">${formatarMoeda(totalFinalVaga)}</span>
                </div>
            `;
            resultadosDiv.innerHTML = resultadosHTML;
            calcularTotalGeral();
        }
        
        item.querySelector('.cargo-nome').addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        item.querySelector('.cargo-quantidade').addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        item.querySelector('.cargo-salario').addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
            atualizarResultados();
            salvarRascunho();
        });
        
        adicionaisContent.querySelectorAll('.he-check, .an-check, .per-check, .ins-check').forEach(chk => {
            chk.addEventListener('change', () => { atualizarResultados(); salvarRascunho(); });
        });
        adicionaisContent.querySelectorAll('.he-horas, .an-horas').forEach(input => {
            input.addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        });
        
        item.addEventListener('recalcular', atualizarResultados);
        item.addEventListener('recalcular-despesas', atualizarResultados);
        item.addEventListener('recalcular-exames', atualizarResultados);
        
        item.querySelector('.btn-remover').addEventListener('click', function() {
            item.remove();
            calcularTotalGeral();
            salvarRascunho();
        });
        
        if (dadosAdicionais) {
            if (dadosAdicionais.horasExtras && adicionaisContent.querySelector('.he-check')) adicionaisContent.querySelector('.he-check').checked = true;
            if (dadosAdicionais.noturno && adicionaisContent.querySelector('.an-check')) adicionaisContent.querySelector('.an-check').checked = true;
            if (dadosAdicionais.periculosidade && adicionaisContent.querySelector('.per-check')) adicionaisContent.querySelector('.per-check').checked = true;
            if (dadosAdicionais.insalubridade && adicionaisContent.querySelector('.ins-check')) adicionaisContent.querySelector('.ins-check').checked = true;
            if (dadosAdicionais.heHoras && adicionaisContent.querySelector('.he-horas')) adicionaisContent.querySelector('.he-horas').value = dadosAdicionais.heHoras;
            if (dadosAdicionais.anHoras && adicionaisContent.querySelector('.an-horas')) adicionaisContent.querySelector('.an-horas').value = dadosAdicionais.anHoras;
        }
        
        atualizarResultados();
        return item;
    }
    
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
                    const data = doc.data();
                    if (!vendedorParam) {
                        document.getElementById('vendedor-nome').textContent = data.vendedor || 'Não informado';
                    }
                    clienteInput.value = data.cliente || '';
                    container.innerHTML = '';
                    if (data.cargos && data.cargos.length > 0) {
                        data.cargos.forEach(c => {
                            let examesObj = {};
                            if (c.exames) {
                                if (Array.isArray(c.exames)) {
                                    c.exames.forEach(nomeExame => {
                                        examesObj[nomeExame] = true;
                                    });
                                } else {
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
                                c.insumos || {},
                                c.despesas || {},
                                examesObj,
                                c.treinamento || 0,
                                c.adicionais?.encargosPercentual || 55.83
                            ));
                        });
                    } else {
                        container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83));
                    }
                    calcularTotalGeral();
                    localStorage.removeItem(DRAFT_KEY);
                } else {
                    if (!carregarRascunho()) {
                        container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83));
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar proposta:', error);
                if (!carregarRascunho()) {
                    container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83));
                }
            }
        } else {
            if (!carregarRascunho()) {
                container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83));
            }
        }
    }
    
    await carregarPropostaExistente();
    
    btnAdicionar.addEventListener('click', function() {
        const novoCargo = criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83);
        container.appendChild(novoCargo);
        calcularTotalGeral();
        salvarRascunho();
    });
    
    function initTema() {
        const temaSalvo = localStorage.getItem('tema_temporario');
        const btnTema = document.getElementById('btn-tema');
        const iconTema = btnTema?.querySelector('i');
        
        if (!temaSalvo || temaSalvo === 'light') {
            document.body.classList.add('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-moon');
                iconTema.classList.add('fa-sun');
            }
            if (!temaSalvo) {
                localStorage.setItem('tema_temporario', 'light');
            }
        } else if (temaSalvo === 'dark') {
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
                localStorage.setItem('tema_temporario', isLight ? 'light' : 'dark');
                
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
    
    function initCompartilhar() {
        const btnCompartilhar = document.getElementById('btn-compartilhar');
        
        if (!btnCompartilhar) return;
        
        btnCompartilhar.addEventListener('click', async () => {
            // Verificar se há dados para gerar imagem
            const cargos = document.querySelectorAll('.cargo-item');
            if (cargos.length === 0) {
                mostrarModal('Adicione pelo menos um cargo antes de gerar a imagem.');
                return;
            }
            
            const cliente = document.getElementById('cliente-nome').value;
            if (!cliente) {
                mostrarModal('Informe o nome do cliente antes de gerar a imagem.');
                return;
            }
            
            await gerarImagemPropostaDetalhada();
        });
    }
    
    function checkVisualizacao() {
        const urlParams = new URLSearchParams(window.location.search);
        const isVisualizacao = urlParams.get('visualizacao') === 'true';
        
        if (isVisualizacao) {
            document.querySelectorAll('input, select, textarea').forEach(el => {
                el.disabled = true;
                el.style.opacity = '0.7';
                el.style.cursor = 'not-allowed';
                el.style.pointerEvents = 'none';
            });
            
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.disabled = true;
                cb.style.pointerEvents = 'none';
            });
            
            document.querySelectorAll('.btn-add, #btn-gerar-pdf, #btn-salvar, .btn-remover, .btn-compartilhar').forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
            
            const btnAddCargo = document.getElementById('adicionar-cargo');
            if (btnAddCargo) btnAddCargo.style.display = 'none';
            
            document.querySelectorAll('.section-toggle, .despesas-toggle, .exames-toggle').forEach(toggle => {
                if (toggle) toggle.style.display = 'none';
            });
            
            document.querySelectorAll('.section-content.collapsed, .despesas-content.collapsed, .exames-content.collapsed').forEach(content => {
                if (content) content.classList.remove('collapsed');
            });
            
            document.querySelectorAll('.box-header').forEach(header => {
                header.style.pointerEvents = 'none';
                header.style.cursor = 'default';
            });
            
            const aviso = document.createElement('div');
            aviso.className = 'aviso-visualizacao';
            aviso.innerHTML = `
                <div style="background: #c10404; color: #fff; text-align: center; padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem;">
                    <i class="fas fa-eye"></i> <strong>Modo de visualização</strong> - Esta proposta é apenas para leitura
                </div>
            `;
            const containerDiv = document.querySelector('.container');
            if (containerDiv && !containerDiv.querySelector('.aviso-visualizacao')) {
                containerDiv.insertBefore(aviso, containerDiv.firstChild);
            }
        }
    }
    
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
            const encargosPercentual = parseFloat(encargosPercentualInput?.value.replace(/\./g, '').replace(',', '.')) || 55.83;
            
            const adicionaisSection = item.querySelector('.expandable-section:first-child .section-content');
            const heCheck = adicionaisSection?.querySelector('.he-check');
            const anCheck = adicionaisSection?.querySelector('.an-check');
            const perCheck = adicionaisSection?.querySelector('.per-check');
            const insCheck = adicionaisSection?.querySelector('.ins-check');
            const heHoras = parseFloat(adicionaisSection?.querySelector('.he-horas')?.value) || 0;
            const anHoras = parseFloat(adicionaisSection?.querySelector('.an-horas')?.value) || 0;
            
            const uniformesSection = item.querySelectorAll('.expandable-section')[1];
            let uniformes = {}, epis = {};
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
            
            const beneficiosSection = item.querySelectorAll('.expandable-section')[2];
            let beneficios = {};
            if (beneficiosSection && beneficiosSection.__getBeneficiosDados) {
                beneficios = beneficiosSection.__getBeneficiosDados();
            } else {
                item.querySelectorAll('.beneficio-card').forEach(card => {
                    const campo = card.querySelector('.beneficio-valor')?.dataset.campo;
                    const valorInput = card.querySelector('.beneficio-valor');
                    const diasInput = card.querySelector('.beneficio-dias');
                    const valor = parseFloat(valorInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const dias = parseInt(diasInput?.value) || 0;
                    if (valor > 0 || dias > 0) {
                        beneficios[campo] = { valorDiario: valor, dias: dias };
                    }
                });
            }
            
            const segurancaSection = item.querySelectorAll('.expandable-section')[3];
            let seguranca = {};
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
            
            const insumosSection = item.querySelectorAll('.expandable-section')[4];
            let insumos = {};
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
            
            const despesasSection = item.querySelector('.despesas-section');
            let despesas = {};
            if (despesasSection && despesasSection.__getDespesasDados) {
                despesas = despesasSection.__getDespesasDados();
            } else if (despesasSection) {
                despesasSection.querySelectorAll('.despesa-card').forEach(card => {
                    const campo = card.querySelector('.despesa-porcentagem')?.dataset.campo;
                    const porcentagemInput = card.querySelector('.despesa-porcentagem');
                    const porcentagem = parseFloat(porcentagemInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    if (porcentagem > 0) {
                        despesas[campo] = { porcentagem: porcentagem };
                    }
                });
            }
            
            const examesSection = item.querySelector('.exames-section');
            let exames = {};
            let treinamento = 0;
            if (examesSection && examesSection.__getExamesDados) {
                const dados = examesSection.__getExamesDados();
                exames = dados.exames || {};
                treinamento = dados.treinamento || 0;
            } else if (examesSection) {
                const examesData = { exames: {}, treinamento: 0 };
                examesSection.querySelectorAll('.exame-checkbox').forEach(cb => {
                    if (cb.checked) {
                        examesData.exames[cb.dataset.nome] = true;
                    }
                });
                const treinamentoInputExames = examesSection.querySelector('.treinamento-valor');
                if (treinamentoInputExames) {
                    examesData.treinamento = parseFloat(treinamentoInputExames.value.replace(/\./g, '').replace(',', '.')) || 0;
                }
                exames = examesData.exames;
                treinamento = examesData.treinamento;
            }
            
            const totalVagaElem = item.querySelector('.total-prestacao .valor');
            const totalVaga = totalVagaElem ? parseFloat(totalVagaElem.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0 : 0;
            
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
                    encargosPercentual: encargosPercentual
                },
                uniformes,
                epis,
                beneficios,
                seguranca,
                insumos,
                despesas,
                exames,
                treinamento,
                totalVaga
            });
        });
        
        const totalGeral = parseFloat(totalGeralEl.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        
        const proposta = {
            vendedor,
            cliente,
            data: new Date().toISOString(),
            tipo: 'temporario',
            cargos,
            totalGeral
        };
        
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
    
    initTema();
    initCompartilhar();
    checkVisualizacao();
    
});