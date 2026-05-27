// ========== TEMA (CLARO/ESCURO) ==========
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

const savedTheme = localStorage.getItem('theme_efetivo');
if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeIcon.classList.remove('bx-moon');
    themeIcon.classList.add('bx-sun');
} else {
    document.body.classList.remove('dark');
    themeIcon.classList.remove('bx-sun');
    themeIcon.classList.add('bx-moon');
    if (!savedTheme) localStorage.setItem('theme_efetivo', 'dark');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    
    if (isDark) {
        themeIcon.classList.remove('bx-moon');
        themeIcon.classList.add('bx-sun');
        localStorage.setItem('theme_efetivo', 'dark');
    } else {
        themeIcon.classList.remove('bx-sun');
        themeIcon.classList.add('bx-moon');
        localStorage.setItem('theme_efetivo', 'light');
    }
});

// ========== FIREBASE INIT ==========
const firebaseConfig = {
    apiKey: "AIzaSyB2xi5fCMv3Vz_UpRxMdQqrVn1DDyAh3_k",
    authDomain: "propostas-comerciais-e288c.firebaseapp.com",
    projectId: "propostas-comerciais-e288c",
    storageBucket: "propostas-comerciais-e288c.firebasestorage.app",
    messagingSenderId: "781220916097",
    appId: "1:781220916097:web:9d1d53aa8bb03c520c1680",
    measurementId: "G-JEH5ZKSX89"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ========== CONSTANTES ==========
const DRAFT_KEY = 'proposta_efetivo_draft';

// ========== FUNÇÃO DE TOAST NOTIFICATION ==========
function showToast(message, isError = false) {
    // Remove toast existente se houver
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    if (isError) {
        toast.classList.add('error');
    }
    
    // Ícone baseado no tipo
    const icon = document.createElement('i');
    icon.className = isError ? 'bx bx-error-circle' : 'bx bx-check-circle';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);
    
    // Mostrar com animação
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('cargos-container');
    const btnAdicionar = document.getElementById('adicionar-cargo');
    const totalGeralEl = document.getElementById('total-geral');
    const clienteInput = document.getElementById('cliente-nome');
    const btnVoltar = document.getElementById('btn-voltar');
    const modalOverlay = document.getElementById('messageModal');
    const modalMensagem = document.getElementById('modal-mensagem');
    const modalIcon = document.getElementById('modal-icon');
    const modalOk = document.getElementById('modal-ok');

    function mostrarModal(mensagem, isError = false, duracao = 3000) {
        modalMensagem.textContent = mensagem;
        if (isError) {
            modalIcon.className = 'bx bx-error-circle modal-icon';
            modalIcon.style.color = '#ff4444';
        } else {
            modalIcon.className = 'bx bx-check-circle modal-icon';
            modalIcon.style.color = 'var(--link-color)';
        }
        modalOverlay.classList.remove('hidden');
        setTimeout(() => {
            modalOverlay.classList.add('hidden');
        }, duracao);
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
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const taxaSpan = item.querySelector('.resultado-bloco .valor');
            if (taxaSpan) {
                const taxaText = taxaSpan.textContent;
                const taxaValor = parseFloat(taxaText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                total += taxaValor * qtd;
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
                    taxa: item.querySelector('.cargo-taxa')?.value || '50'
                };
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
                        container.appendChild(criarCargoItem(
                            c.nome,
                            c.quantidade,
                            parseFloat(c.salario?.replace(/\./g, '').replace(',', '.')) || 0,
                            parseFloat(c.taxa) || 50
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

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async function gerarImagemPorCargo() {
        const btnCompartilhar = document.getElementById('btn-compartilhar');
        const btnBaixar = document.getElementById('btn-baixar-imagens');
        const textoOriginal = btnCompartilhar ? btnCompartilhar.innerHTML : (btnBaixar ? btnBaixar.innerHTML : '');
        const btnAtual = btnCompartilhar || btnBaixar;
        
        if (btnAtual) {
            btnAtual.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Gerando...';
            btnAtual.disabled = true;
        }
        
        try {
            const cliente = clienteInput.value || 'Não informado';
            const vendedor = document.getElementById('vendedor-nome').textContent || 'Não informado';
            const dataAtual = new Date().toLocaleDateString('pt-BR');
            const cargos = document.querySelectorAll('.cargo-item');
            
            const nomeCount = new Map();
            for (let i = 0; i < cargos.length; i++) {
                const cargo = cargos[i];
                const cargoNomeBase = cargo.querySelector('.cargo-nome').value.trim() || `Cargo_${i + 1}`;
                const count = nomeCount.get(cargoNomeBase) || 0;
                nomeCount.set(cargoNomeBase, count + 1);
            }
            
            let totalGeralProposta = 0;
            cargos.forEach(cargo => {
                const qtd = parseInt(cargo.querySelector('.cargo-quantidade').value) || 1;
                const taxaSpan = cargo.querySelector('.resultado-bloco .valor');
                if (taxaSpan) {
                    const taxaText = taxaSpan.textContent;
                    const taxaValor = parseFloat(taxaText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                    totalGeralProposta += taxaValor * qtd;
                }
            });
            
            const wasDarkMode = document.body.classList.contains('dark');
            if (wasDarkMode) {
                document.body.classList.remove('dark');
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const clienteNome = cliente.replace(/[^a-zA-Z0-9]/g, '_');
            const nomeContador = new Map();
            
            // Gerar imagem do total
            const totalElemento = document.createElement('div');
            totalElemento.style.position = 'fixed';
            totalElemento.style.left = '-9999px';
            totalElemento.style.top = '-9999px';
            totalElemento.style.backgroundColor = '#ffffff';
            totalElemento.style.padding = '30px';
            totalElemento.style.borderRadius = '16px';
            totalElemento.style.width = '600px';
            totalElemento.style.fontFamily = "'Poppins', sans-serif";
            
            totalElemento.innerHTML = `
                <div style="text-align: center;">
                    <div style="margin-bottom: 30px;">
                        <div style="background: #c10404; width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto;">
                            <i class="bx bx-chart" style="font-size: 30px; color: #fff;"></i>
                        </div>
                        <h1 style="color: #c10404; margin: 0; font-size: 28px;">Prompt Serviços</h1>
                        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Proposta de Contrato Efetivo</p>
                    </div>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 12px; margin-bottom: 30px; text-align: left;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                            <span style="font-weight: 600; color: #666;">Cliente:</span>
                            <span style="color: #333; font-weight: 500;">${escapeHtml(cliente)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                            <span style="font-weight: 600; color: #666;">Vendedor:</span>
                            <span style="color: #333;">${escapeHtml(vendedor)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="font-weight: 600; color: #666;">Data de Emissão:</span>
                            <span style="color: #333;">${escapeHtml(dataAtual)}</span>
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #c10404 0%, #8b0303 100%); color: #fff; padding: 25px; border-radius: 16px; margin-bottom: 30px;">
                        <div style="font-size: 16px; opacity: 0.9; margin-bottom: 10px;">TOTAL DA PROPOSTA</div>
                        <div style="font-size: 48px; font-weight: bold;">${formatarMoeda(totalGeralProposta)}</div>
                    </div>
                    
                    <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
                        <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
                            <div style="text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #c10404;">${cargos.length}</div>
                                <div style="font-size: 11px; color: #888;">Cargo(s)</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #c10404;">${Array.from(cargos).reduce((total, cargo) => {
                                    const qtd = parseInt(cargo.querySelector('.cargo-quantidade')?.value) || 1;
                                    return total + qtd;
                                }, 0)}</div>
                                <div style="font-size: 11px; color: #888;">Vaga(s)</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 9px; color: #888;">
                        Documento gerado em ${dataAtual} - Proposta válida por 30 dias
                    </div>
                </div>
            `;
            
            document.body.appendChild(totalElemento);
            
            const totalCanvas = await html2canvas(totalElemento, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: false
            });
            
            document.body.removeChild(totalElemento);
            
            const totalBlob = await new Promise(resolve => totalCanvas.toBlob(resolve, 'image/png'));
            const totalLink = document.createElement('a');
            totalLink.download = `${clienteNome}_TOTAL_DA_PROPOSTA.png`;
            totalLink.href = URL.createObjectURL(totalBlob);
            totalLink.click();
            URL.revokeObjectURL(totalLink.href);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Gerar imagens por cargo
            let imagensGeradas = 0;
            
            for (let i = 0; i < cargos.length; i++) {
                const cargo = cargos[i];
                const cargoNomeBase = cargo.querySelector('.cargo-nome').value.trim() || `Cargo_${i + 1}`;
                
                const ocorrenciaAtual = (nomeContador.get(cargoNomeBase) || 0) + 1;
                nomeContador.set(cargoNomeBase, ocorrenciaAtual);
                
                const totalOcorrencias = nomeCount.get(cargoNomeBase) || 1;
                const numeroSufixo = totalOcorrencias > 1 ? ` (${ocorrenciaAtual})` : '';
                
                const nomeCompleto = `${cargoNomeBase}${numeroSufixo}`;
                const nomeArquivo = `${clienteNome}_${nomeCompleto.replace(/[^a-zA-Z0-9À-ú+()]/g, '_')}.png`;
                
                if (btnAtual) {
                    btnAtual.innerHTML = `<i class="bx bx-loader-alt bx-spin"></i> ${i + 1}/${cargos.length}: ${nomeCompleto.substring(0, 25)}...`;
                }
                
                const cloneCargo = cargo.cloneNode(true);
                
                const nomeCargo = cloneCargo.querySelector('.cargo-nome').value;
                const qtd = cloneCargo.querySelector('.cargo-quantidade').value;
                const salarioRaw = cloneCargo.querySelector('.cargo-salario').value;
                const salario = parseFloat(salarioRaw.replace(/\./g, '').replace(',', '.')) || 0;
                const taxaSelect = cloneCargo.querySelector('.cargo-taxa');
                const taxa = parseFloat(taxaSelect.value);
                const valorTaxa = salario * (taxa / 100);
                const subtotal = valorTaxa * qtd;
                
                const elementoImagem = document.createElement('div');
                elementoImagem.style.position = 'fixed';
                elementoImagem.style.left = '-9999px';
                elementoImagem.style.top = '-9999px';
                elementoImagem.style.backgroundColor = '#ffffff';
                elementoImagem.style.padding = '20px';
                elementoImagem.style.borderRadius = '16px';
                elementoImagem.style.width = '800px';
                elementoImagem.style.fontFamily = "'Poppins', sans-serif";
                
                elementoImagem.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #c10404;">
                            <div>
                                <h1 style="color: #c10404; margin: 0; font-size: 20px;">Prompt Serviços</h1>
                                <p style="color: #666; margin: 0; font-size: 11px;">Proposta de Contrato Efetivo</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 10px; color: #888;">Data: ${dataAtual}</div>
                                <div style="font-size: 10px; color: #888;">Vendedor: ${vendedor}</div>
                            </div>
                        </div>
                        <div style="background: #f5f5f5; padding: 8px 12px; border-radius: 8px;">
                            <strong>Cliente:</strong> ${cliente}
                        </div>
                    </div>
                    
                    <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h3 style="color: #c10404; margin-top: 0; border-left: 4px solid #c10404; padding-left: 12px;">
                            ${escapeHtml(nomeCargo)}
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                            <div style="background: #f9f9f9; padding: 12px; border-radius: 10px;">
                                <div style="font-size: 12px; color: #666;">Quantidade de vagas</div>
                                <div style="font-size: 28px; font-weight: bold; color: #c10404;">${qtd}</div>
                            </div>
                            <div style="background: #f9f9f9; padding: 12px; border-radius: 10px;">
                                <div style="font-size: 12px; color: #666;">Salário base</div>
                                <div style="font-size: 28px; font-weight: bold;">${formatarMoeda(salario)}</div>
                            </div>
                        </div>
                        
                        <div style="margin: 20px 0; padding: 15px; background: linear-gradient(135deg, #fff5f5 0%, #fff 100%); border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                                <span>Taxa de administração (${taxa}%)</span>
                                <span style="font-weight: bold;">${formatarMoeda(valorTaxa)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #e0e0e0; margin-top: 8px; padding-top: 12px;">
                                <span style="font-weight: bold;">Subtotal para ${qtd} vaga(s)</span>
                                <span style="font-weight: bold; font-size: 1.2rem; color: #c10404;">${formatarMoeda(subtotal)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center; padding-top: 10px; border-top: 1px solid #e0e0e0; font-size: 9px; color: #888;">
                        Documento gerado em ${dataAtual} - Proposta válida por 30 dias
                    </div>
                `;
                
                document.body.appendChild(elementoImagem);
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const canvas = await html2canvas(elementoImagem, {
                    scale: 1.5,
                    backgroundColor: '#ffffff',
                    logging: false,
                    useCORS: true,
                    allowTaint: false
                });
                
                document.body.removeChild(elementoImagem);
                
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const link = document.createElement('a');
                link.download = nomeArquivo;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
                
                imagensGeradas++;
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            if (wasDarkMode) {
                document.body.classList.add('dark');
            }
            
            mostrarModal(`✅ ${imagensGeradas + 1} imagem(ns) baixada(s)!\n- 1 imagem com o TOTAL\n- ${imagensGeradas} imagem(ns) dos cargos`);
            
        } catch (error) {
            console.error('Erro ao gerar imagens:', error);
            mostrarModal('❌ Erro ao gerar imagens. Tente novamente.', true);
        } finally {
            if (btnAtual) {
                btnAtual.innerHTML = textoOriginal;
                btnAtual.disabled = false;
            }
        }
    }

    function criarCargoItem(cargo = '', quantidade = 1, salario = 0, taxa = 50) {
        const item = document.createElement('div');
        item.className = 'cargo-item';

        const header = document.createElement('div');
        header.className = 'cargo-header';
        header.innerHTML = `
            <div class="cargo-titulo">
                <i class='bx bx-briefcase'></i>
                <span>Cargo</span>
            </div>
            <button type="button" class="btn-remover" title="Remover cargo">
                <i class='bx bx-trash'></i>
            </button>
        `;
        item.appendChild(header);

        const linha = document.createElement('div');
        linha.className = 'cargo-linha';

        const cargoDiv = document.createElement('div');
        cargoDiv.className = 'campo-pequeno';
        cargoDiv.innerHTML = `
            <label><i class='bx bx-briefcase'></i> Cargo</label>
            <input type="text" class="input-moderno cargo-nome" placeholder="Ex: Assistente" value="${cargo.replace(/"/g, '&quot;')}">
        `;

        const qtdDiv = document.createElement('div');
        qtdDiv.className = 'campo-pequeno';
        qtdDiv.innerHTML = `
            <label><i class='bx bx-hash'></i> Quantidade</label>
            <input type="number" class="input-moderno cargo-quantidade" min="1" value="${quantidade}">
        `;

        const salarioDiv = document.createElement('div');
        salarioDiv.className = 'campo-pequeno';
        salarioDiv.innerHTML = `
            <label><i class='bx bx-dollar'></i> Salário (R$)</label>
            <input type="text" class="input-moderno cargo-salario" placeholder="0,00" value="${salario > 0 ? salario.toFixed(2).replace('.', ',') : ''}">
        `;

        const taxaDiv = document.createElement('div');
        taxaDiv.className = 'campo-pequeno';
        taxaDiv.innerHTML = `
            <label><i class='bx bx-percent'></i> Taxa (%)</label>
            <div class="taxa-input-wrapper">
                <input type="number" class="input-moderno cargo-taxa" step="0.1" min="0" max="100" placeholder="50" value="${taxa}">
                <span class="taxa-simbolo">%</span>
            </div>
        `;

        linha.appendChild(cargoDiv);
        linha.appendChild(qtdDiv);
        linha.appendChild(salarioDiv);
        linha.appendChild(taxaDiv);
        item.appendChild(linha);

        const resultadosDiv = document.createElement('div');
        resultadosDiv.className = 'cargo-resultados';
        item.appendChild(resultadosDiv);

        function atualizarResultados() {
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            let salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            let taxaPercentual = parseFloat(item.querySelector('.cargo-taxa').value) || 0;
            
            if (taxaPercentual > 100) taxaPercentual = 100;
            if (taxaPercentual < 0) taxaPercentual = 0;
            
            const valorTaxa = salario * (taxaPercentual / 100);
            const subtotalTaxas = valorTaxa * qtd;

            resultadosDiv.innerHTML = `
                <div class="resultado-bloco">
                    <span class="rotulo"><i class='bx bx-calculator'></i> Valor da Taxa</span>
                    <span class="valor">${formatarMoeda(valorTaxa)}</span>
                </div>
                <div class="resultado-bloco">
                    <span class="rotulo"><i class='bx bx-layer'></i> Subtotal (${qtd} vaga${qtd > 1 ? 's' : ''})</span>
                    <span class="valor">${formatarMoeda(subtotalTaxas)}</span>
                </div>
            `;

            calcularTotalGeral();
            salvarRascunho();
        }

        item.querySelector('.cargo-nome').addEventListener('input', atualizarResultados);
        item.querySelector('.cargo-quantidade').addEventListener('input', atualizarResultados);
        item.querySelector('.cargo-salario').addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor === '') {
                e.target.value = '';
            } else {
                valor = (parseInt(valor) / 100).toFixed(2);
                e.target.value = valor.replace('.', ',');
            }
            atualizarResultados();
        });
        item.querySelector('.cargo-taxa').addEventListener('input', function() {
            let valor = parseFloat(this.value);
            if (valor > 100) this.value = 100;
            if (valor < 0) this.value = 0;
            atualizarResultados();
        });

        item.querySelector('.btn-remover').addEventListener('click', function() {
            item.remove();
            calcularTotalGeral();
            salvarRascunho();
        });

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
                            container.appendChild(criarCargoItem(c.nome, c.quantidade, c.salario, c.taxa));
                        });
                    } else {
                        container.appendChild(criarCargoItem('', 1, 0, 50));
                    }
                    calcularTotalGeral();
                    localStorage.removeItem(DRAFT_KEY);
                } else {
                    if (!carregarRascunho()) {
                        container.appendChild(criarCargoItem('', 1, 0, 50));
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar proposta:', error);
                if (!carregarRascunho()) {
                    container.appendChild(criarCargoItem('', 1, 0, 50));
                }
            }
        } else {
            if (!carregarRascunho()) {
                container.appendChild(criarCargoItem('', 1, 0, 50));
            }
        }
    }

    await carregarPropostaExistente();

    btnAdicionar.addEventListener('click', function() {
        container.appendChild(criarCargoItem('', 1, 0, 50));
        salvarRascunho();
    });

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
            const taxa = parseFloat(item.querySelector('.cargo-taxa').value);
            const valorTaxa = salario * (taxa / 100);
            const subtotal = valorTaxa * qtd;
            
            cargos.push({
                nome,
                quantidade: qtd,
                salario,
                taxa,
                valorTaxa,
                subtotal
            });
        });
        
        const totalGeral = parseFloat(totalGeralEl.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        
        const proposta = {
            vendedor,
            cliente,
            data: new Date().toISOString(),
            tipo: 'efetivo',
            cargos,
            totalGeral
        };
        
        try {
            if (propostaId) {
                await db.collection('propostas').doc(propostaId).update(proposta);
                mostrarModal('✅ Proposta atualizada com sucesso!');
                localStorage.removeItem(DRAFT_KEY);
            } else {
                const docRef = await db.collection('propostas').add(proposta);
                mostrarModal('✅ Proposta salva com sucesso!');
                window.history.replaceState(null, '', `?id=${docRef.id}`);
                localStorage.removeItem(DRAFT_KEY);
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            mostrarModal('❌ Erro ao salvar proposta.', true);
        }
    });

    // ========== GERAR LINK DE VISUALIZAÇÃO ==========
    async function gerarLinkVisualizacao() {
        try {
            const vendedor = document.getElementById('vendedor-nome').textContent;
            const cliente = clienteInput.value || 'SEM CLIENTE';
            const urlParams = new URLSearchParams(window.location.search);
            let propostaId = urlParams.get('id');
            
            if (!propostaId) {
                await salvarPropostaAtual();
                const newUrlParams = new URLSearchParams(window.location.search);
                propostaId = newUrlParams.get('id');
                if (!propostaId) {
                    throw new Error('Não foi possível gerar o link. Tente salvar a proposta primeiro.');
                }
            }
            
            const baseUrl = window.location.href.split('?')[0];
            const linkVisualizacao = `${baseUrl}?id=${propostaId}&visualizacao=true`;
            
            const modalShare = document.getElementById('modal-share');
            const shareLinkInput = document.getElementById('share-link');
            
            if (shareLinkInput && modalShare) {
                shareLinkInput.value = linkVisualizacao;
                modalShare.classList.remove('hidden');
            }
            
            // Copiar para clipboard
            try {
                await navigator.clipboard.writeText(linkVisualizacao);
                // Usar o toast em vez do modal
                showToast('✅ Link copiado para a área de transferência!');
                // Fechar o modal automaticamente após copiar
                setTimeout(() => {
                    if (modalShare) modalShare.classList.add('hidden');
                }, 1000);
            } catch (err) {
                console.log('Não foi possível copiar automaticamente');
                showToast('📋 Clique no botão copiar para copiar o link', false);
            }
            
        } catch (error) {
            console.error('Erro ao gerar link:', error);
            showToast('❌ Erro ao gerar link. Tente salvar a proposta primeiro.', true);
        }
    }

    async function salvarPropostaAtual() {
        const vendedor = document.getElementById('vendedor-nome').textContent;
        const cliente = clienteInput.value || 'SEM CLIENTE';
        const urlParams = new URLSearchParams(window.location.search);
        const propostaId = urlParams.get('id');
        
        const cargos = [];
        for (const item of document.querySelectorAll('.cargo-item')) {
            const nome = item.querySelector('.cargo-nome').value.trim() || 'Cargo sem nome';
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            const salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            const taxa = parseFloat(item.querySelector('.cargo-taxa').value);
            
            cargos.push({
                nome,
                quantidade: qtd,
                salario,
                taxa,
                valorTaxa: salario * (taxa / 100),
                subtotal: salario * (taxa / 100) * qtd
            });
        }
        
        const totalGeral = parseFloat(totalGeralEl.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.'));
        
        const proposta = {
            vendedor,
            cliente,
            data: new Date().toISOString(),
            tipo: 'efetivo',
            cargos,
            totalGeral
        };
        
        if (propostaId) {
            await db.collection('propostas').doc(propostaId).update(proposta);
        } else {
            const docRef = await db.collection('propostas').add(proposta);
            window.history.replaceState(null, '', `?id=${docRef.id}`);
        }
    }

    // ========== INICIALIZAR BOTÕES ==========
    document.getElementById('btn-baixar-imagens').addEventListener('click', async () => {
        const cargos = document.querySelectorAll('.cargo-item');
        if (cargos.length === 0) {
            mostrarModal('Adicione pelo menos um cargo antes de baixar as imagens.', true);
            return;
        }
        
        const cliente = clienteInput.value;
        if (!cliente) {
            mostrarModal('Informe o nome do cliente antes de baixar as imagens.', true);
            return;
        }
        
        await gerarImagemPorCargo();
    });

    document.getElementById('btn-compartilhar-link').addEventListener('click', async () => {
        const cargos = document.querySelectorAll('.cargo-item');
        if (cargos.length === 0) {
            mostrarModal('Adicione pelo menos um cargo antes de compartilhar.', true);
            return;
        }
        
        const cliente = clienteInput.value;
        if (!cliente) {
            mostrarModal('Informe o nome do cliente antes de compartilhar.', true);
            return;
        }
        
        await gerarLinkVisualizacao();
    });

    // ========== MODAL DE COMPARTILHAMENTO ==========
    const modalShare = document.getElementById('modal-share');
    const modalShareOk = document.getElementById('modal-share-ok');
    const btnCopiarLinkModal = document.getElementById('btn-copiar-link');
    
    if (modalShareOk) {
        modalShareOk.addEventListener('click', () => {
            modalShare.classList.add('hidden');
        });
    }
    
    if (modalShare) {
        modalShare.addEventListener('click', (e) => {
            if (e.target === modalShare) {
                modalShare.classList.add('hidden');
            }
        });
    }
    
    if (btnCopiarLinkModal) {
        btnCopiarLinkModal.addEventListener('click', () => {
            const shareLinkInput = document.getElementById('share-link');
            if (shareLinkInput) {
                shareLinkInput.select();
                navigator.clipboard.writeText(shareLinkInput.value);
                showToast('✅ Link copiado!');
                setTimeout(() => {
                    modalShare.classList.add('hidden');
                }, 500);
            }
        });
    }

    // ========== VERIFICAR MODO VISUALIZAÇÃO ==========
    function checkVisualizacao() {
        const urlParams = new URLSearchParams(window.location.search);
        const isVisualizacao = urlParams.get('visualizacao') === 'true';
        
        if (isVisualizacao) {
            document.querySelectorAll('input, select, textarea, .btn-remover, .btn-add, #btn-baixar-imagens, #btn-compartilhar-link, #btn-salvar').forEach(el => {
                if (el) {
                    el.disabled = true;
                    if (el.tagName !== 'BUTTON') {
                        el.style.opacity = '0.7';
                        el.style.cursor = 'not-allowed';
                        el.style.pointerEvents = 'none';
                    } else {
                        el.style.display = 'none';
                    }
                }
            });
            
            const btnAddCargo = document.getElementById('adicionar-cargo');
            if (btnAddCargo) btnAddCargo.style.display = 'none';
            
            const btnVoltar = document.getElementById('btn-voltar');
            if (btnVoltar) btnVoltar.style.display = 'flex';
            
            const themeToggleBtn = document.getElementById('themeToggle');
            if (themeToggleBtn) themeToggleBtn.style.display = 'flex';
            
            const aviso = document.createElement('div');
            aviso.className = 'aviso-visualizacao';
            aviso.innerHTML = `
                <i class='bx bx-show'></i> 
                <strong>Modo de visualização</strong> - Esta proposta é apenas para leitura
            `;
            const containerDiv = document.querySelector('.container');
            if (containerDiv && !containerDiv.querySelector('.aviso-visualizacao')) {
                containerDiv.insertBefore(aviso, containerDiv.firstChild);
            }
        }
    }
    
    checkVisualizacao();

    // ========== VERIFICAR AUTENTICAÇÃO (PULA SE FOR VISUALIZAÇÃO) ==========
    const urlParamsVis = new URLSearchParams(window.location.search);
    const isVisualizacao = urlParamsVis.get('visualizacao') === 'true';
    
    if (!isVisualizacao) {
        auth.onAuthStateChanged((user) => {
            if (!user) {
                console.log('Usuário não autenticado, redirecionando para login...');
                window.location.href = 'index.html';
            } else {
                console.log('✅ Usuário autenticado:', user.email);
            }
        });
    } else {
        console.log('🔓 Modo de visualização ativo - acesso liberado sem necessidade de login');
        // Reforçar o modo visualização
        setTimeout(() => {
            checkVisualizacao();
        }, 50);
    }
});