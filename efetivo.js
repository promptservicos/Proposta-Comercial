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
const DRAFT_KEY = 'proposta_efetivo_draft';

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

    // ========== FUNÇÃO PARA SALVAR RASCUNHO ==========
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
                    taxa: item.querySelector('.cargo-taxa')?.value || '0.5'
                };
                dados.cargos.push(cargo);
            });
            
            localStorage.setItem(DRAFT_KEY, JSON.stringify(dados));
        } catch (e) {
            console.error('Erro ao salvar rascunho:', e);
        }
    }
    
    // ========== FUNÇÃO PARA CARREGAR RASCUNHO ==========
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
                            parseFloat(c.taxa) || 0.5
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

    // ========== FUNÇÃO ESCAPE HTML ==========
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========== FUNÇÃO PARA GERAR IMAGENS ==========
    async function gerarImagemPorCargo() {
        const btnCompartilhar = document.getElementById('btn-compartilhar');
        const textoOriginal = btnCompartilhar ? btnCompartilhar.innerHTML : '';
        
        if (btnCompartilhar) {
            btnCompartilhar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando imagens...';
            btnCompartilhar.disabled = true;
        }
        
        try {
            const cliente = clienteInput.value || 'Não informado';
            const vendedor = document.getElementById('vendedor-nome').textContent || 'Não informado';
            const dataAtual = new Date().toLocaleDateString('pt-BR');
            const cargos = document.querySelectorAll('.cargo-item');
            
            console.log(`Total de cargos encontrados: ${cargos.length}`);
            
            // Mapa para contar nomes de cargos repetidos
            const nomeCount = new Map();
            for (let i = 0; i < cargos.length; i++) {
                const cargo = cargos[i];
                const cargoNomeBase = cargo.querySelector('.cargo-nome').value.trim() || `Cargo_${i + 1}`;
                const count = nomeCount.get(cargoNomeBase) || 0;
                nomeCount.set(cargoNomeBase, count + 1);
            }
            
            // Calcular total geral da proposta
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
            
            // Forçar tema claro para melhor qualidade das imagens
            const wasLightMode = document.body.classList.contains('light-mode');
            if (!wasLightMode) {
                document.body.classList.add('light-mode');
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const clienteNome = cliente.replace(/[^a-zA-Z0-9]/g, '_');
            const nomeContador = new Map();
            
            // ========== 1. GERAR E BAIXAR IMAGEM DO TOTAL DA PROPOSTA ==========
            console.log('Gerando imagem do total da proposta...');
            const totalElemento = document.createElement('div');
            totalElemento.style.position = 'fixed';
            totalElemento.style.left = '-9999px';
            totalElemento.style.top = '-9999px';
            totalElemento.style.backgroundColor = '#ffffff';
            totalElemento.style.padding = '30px';
            totalElemento.style.borderRadius = '16px';
            totalElemento.style.width = '600px';
            totalElemento.style.fontFamily = "'Inter', 'Segoe UI', sans-serif";
            
            totalElemento.innerHTML = `
                <div style="text-align: center;">
                    <div style="margin-bottom: 30px;">
                        <div style="background: #c10404; width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto;">
                            <i class="fas fa-chart-line" style="font-size: 30px; color: #fff;"></i>
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
            
            // Download da imagem total
            const totalBlob = await new Promise(resolve => totalCanvas.toBlob(resolve, 'image/png'));
            const totalLink = document.createElement('a');
            totalLink.download = `${clienteNome}_TOTAL_DA_PROPOSTA.png`;
            totalLink.href = URL.createObjectURL(totalBlob);
            totalLink.click();
            URL.revokeObjectURL(totalLink.href);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // ========== 2. GERAR E BAIXAR IMAGEM PARA CADA CARGO ==========
            let imagensGeradas = 0;
            let imagensFalhas = 0;
            
            for (let i = 0; i < cargos.length; i++) {
                const cargo = cargos[i];
                const cargoNomeBase = cargo.querySelector('.cargo-nome').value.trim() || `Cargo_${i + 1}`;
                
                const ocorrenciaAtual = (nomeContador.get(cargoNomeBase) || 0) + 1;
                nomeContador.set(cargoNomeBase, ocorrenciaAtual);
                
                const totalOcorrencias = nomeCount.get(cargoNomeBase) || 1;
                const numeroSufixo = totalOcorrencias > 1 ? ` (${ocorrenciaAtual})` : '';
                
                const nomeCompleto = `${cargoNomeBase}${numeroSufixo}`;
                const nomeArquivo = `${clienteNome}_${nomeCompleto.replace(/[^a-zA-Z0-9À-ú+()]/g, '_')}.png`;
                
                console.log(`Preparando imagem ${i + 1}/${cargos.length}: ${nomeCompleto}`);
                
                if (btnCompartilhar) {
                    btnCompartilhar.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Baixando ${i + 1}/${cargos.length}: ${nomeCompleto.substring(0, 25)}...`;
                }
                
                try {
                    // Clonar o cargo e remover classes/estilos desnecessários
                    const cloneCargo = cargo.cloneNode(true);
                    
                    // Criar elemento para imagem
                    const elementoImagem = document.createElement('div');
                    elementoImagem.style.position = 'fixed';
                    elementoImagem.style.left = '-9999px';
                    elementoImagem.style.top = '-9999px';
                    elementoImagem.style.backgroundColor = '#ffffff';
                    elementoImagem.style.padding = '20px';
                    elementoImagem.style.borderRadius = '16px';
                    elementoImagem.style.width = '800px';
                    elementoImagem.style.fontFamily = "'Inter', 'Segoe UI', sans-serif";
                    
                    // Extrair dados para mostrar no card da imagem
                    const nomeCargo = cloneCargo.querySelector('.cargo-nome').value;
                    const qtd = cloneCargo.querySelector('.cargo-quantidade').value;
                    const salarioRaw = cloneCargo.querySelector('.cargo-salario').value;
                    const salario = parseFloat(salarioRaw.replace(/\./g, '').replace(',', '.')) || 0;
                    const taxaSelect = cloneCargo.querySelector('.cargo-taxa');
                    const taxa = parseFloat(taxaSelect.value);
                    const taxaPercentual = taxa;
                    const valorTaxa = salario * taxa;
                    const subtotal = valorTaxa * qtd;
                    
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
                                    <span>Taxa de administração (${taxaPercentual}%)</span>
                                    <span style="font-weight: bold;">${formatarMoeda(valorTaxa)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                    <span>Subtotal para ${qtd} vaga(s)</span>
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
                    
                    // Download da imagem do cargo
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    const link = document.createElement('a');
                    link.download = nomeArquivo;
                    link.href = URL.createObjectURL(blob);
                    link.click();
                    URL.revokeObjectURL(link.href);
                    
                    imagensGeradas++;
                    console.log(`✅ Imagem ${i + 1}/${cargos.length} baixada: ${nomeArquivo}`);
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (cargoError) {
                    console.error(`❌ Erro no cargo ${i + 1}: ${cargoNomeBase}`, cargoError);
                    imagensFalhas++;
                }
            }
            
            // Restaurar tema original
            if (!wasLightMode) {
                document.body.classList.remove('light-mode');
            }
            
            let mensagem = `✅ ${imagensGeradas + 1} imagem(ns) baixada(s) com sucesso!\n- 1 imagem com o TOTAL da proposta\n- ${imagensGeradas} imagem(ns) com detalhes dos cargos`;
            
            if (imagensGeradas !== cargos.length) {
                mensagem += `\n\n⚠️ Apenas ${imagensGeradas} de ${cargos.length} cargos foram gerados.`;
            }
            
            if (imagensFalhas > 0) {
                mensagem += `\n\n❌ ${imagensFalhas} cargo(s) falharam. Verifique o console.`;
            }
            
            mostrarModal(mensagem);
            
        } catch (error) {
            console.error('Erro ao gerar imagens:', error);
            mostrarModal('Erro ao gerar imagens. Tente novamente.\n' + error.message);
        } finally {
            const btnCompartilhar = document.getElementById('btn-compartilhar');
            if (btnCompartilhar) {
                btnCompartilhar.innerHTML = textoOriginal;
                btnCompartilhar.disabled = false;
            }
        }
    }

    // ========== FUNÇÃO PARA CRIAR CARGO ==========
    function criarCargoItem(cargo = '', quantidade = 1, salario = 0, taxa = 50) {
        const item = document.createElement('div');
        item.className = 'cargo-item';

        // Cabeçalho
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

        // Linha de campos
        const linha = document.createElement('div');
        linha.className = 'cargo-linha';

        const cargoDiv = document.createElement('div');
        cargoDiv.className = 'campo-pequeno';
        cargoDiv.innerHTML = `
            <label><i class="fas fa-briefcase"></i> Cargo</label>
            <input type="text" class="input-moderno cargo-nome" placeholder="Ex: Assistente" value="${cargo}">
        `;

        const qtdDiv = document.createElement('div');
        qtdDiv.className = 'campo-pequeno';
        qtdDiv.innerHTML = `
            <label><i class="fas fa-hashtag"></i> Quantidade</label>
            <input type="number" class="input-moderno cargo-quantidade" min="1" value="${quantidade}">
        `;

        const salarioDiv = document.createElement('div');
        salarioDiv.className = 'campo-pequeno';
        salarioDiv.innerHTML = `
            <label><i class="fas fa-dollar-sign"></i> Salário (R$)</label>
            <input type="text" class="input-moderno cargo-salario" placeholder="0,00" value="${salario > 0 ? salario.toFixed(2).replace('.', ',') : ''}">
        `;

        const taxaDiv = document.createElement('div');
        taxaDiv.className = 'campo-pequeno';
        taxaDiv.innerHTML = `
            <label><i class="fas fa-percent"></i> Taxa (%)</label>
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

        // Área de resultados
        const resultadosDiv = document.createElement('div');
        resultadosDiv.className = 'cargo-resultados';
        item.appendChild(resultadosDiv);

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
            document.getElementById('total-geral').textContent = formatarMoeda(total);
            return total;
        }

        function atualizarResultados() {
            const qtd = parseInt(item.querySelector('.cargo-quantidade').value) || 1;
            const salarioInput = item.querySelector('.cargo-salario').value;
            let salario = parseFloat(salarioInput.replace(/\./g, '').replace(',', '.')) || 0;
            let taxaPercentual = parseFloat(item.querySelector('.cargo-taxa').value) || 0;
            
            // Limitar taxa entre 0 e 100
            if (taxaPercentual > 100) taxaPercentual = 100;
            if (taxaPercentual < 0) taxaPercentual = 0;
            
            const valorTaxa = salario * (taxaPercentual / 100);
            const subtotalTaxas = valorTaxa * qtd;

            resultadosDiv.innerHTML = `
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-calculator"></i> Valor da Taxa</span>
                    <span class="valor">${formatarMoeda(valorTaxa)}</span>
                </div>
                <div class="resultado-bloco">
                    <span class="rotulo"><i class="fas fa-layer-group"></i> Subtotal (${qtd} vaga${qtd > 1 ? 's' : ''})</span>
                    <span class="valor">${formatarMoeda(subtotalTaxas)}</span>
                </div>
            `;

            calcularTotalGeral();
            salvarRascunho();
        }

        // Event listeners
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

        // Botão remover
        item.querySelector('.btn-remover').addEventListener('click', function() {
            item.remove();
            calcularTotalGeral();
            salvarRascunho();
        });

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
                        container.appendChild(criarCargoItem('', 1, 0, 0.5));
                    }
                    calcularTotalGeral();
                    localStorage.removeItem(DRAFT_KEY);
                } else {
                    if (!carregarRascunho()) {
                        container.appendChild(criarCargoItem('', 1, 0, 0.5));
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar proposta:', error);
                if (!carregarRascunho()) {
                    container.appendChild(criarCargoItem('', 1, 0, 0.5));
                }
            }
        } else {
            if (!carregarRascunho()) {
                container.appendChild(criarCargoItem('', 1, 0, 0.5));
            }
        }
    }

    await carregarPropostaExistente();

    // Botão adicionar cargo
    btnAdicionar.addEventListener('click', function() {
        container.appendChild(criarCargoItem('', 1, 0, 0.5));
        salvarRascunho();
    });

    // ========== TEMA CLARO/ESCURO ==========
    function initTema() {
        const temaSalvo = localStorage.getItem('tema_efetivo');
        const btnTema = document.getElementById('btn-tema');
        const iconTema = btnTema?.querySelector('i');
        
        if (!temaSalvo || temaSalvo === 'light') {
            document.body.classList.add('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-moon');
                iconTema.classList.add('fa-sun');
            }
            if (!temaSalvo) {
                localStorage.setItem('tema_efetivo', 'light');
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
                localStorage.setItem('tema_efetivo', isLight ? 'light' : 'dark');
                
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
    
    // ========== NOVO: COMPARTILHAR / BAIXAR IMAGENS ==========
    function initCompartilhar() {
        const btnCompartilhar = document.getElementById('btn-compartilhar');
        if (!btnCompartilhar) return;
        
        btnCompartilhar.addEventListener('click', async () => {
            const cargos = document.querySelectorAll('.cargo-item');
            if (cargos.length === 0) {
                mostrarModal('Adicione pelo menos um cargo antes de gerar as imagens.');
                return;
            }
            
            const cliente = clienteInput.value;
            if (!cliente) {
                mostrarModal('Informe o nome do cliente antes de gerar as imagens.');
                return;
            }
            
            await gerarImagemPorCargo();
        });
    }
    
    // ========== VERIFICAR MODO VISUALIZAÇÃO (removido pois não há mais link) ==========
    // O modo visualização ainda pode existir se a URL vier com ?visualizacao=true
    // Mantido por compatibilidade, mas sem link de compartilhamento.
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
            
            document.querySelectorAll('.btn-add, #btn-salvar, .btn-remover, .btn-tema, .btn-compartilhar').forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
            
            const btnAddCargo = document.getElementById('adicionar-cargo');
            if (btnAddCargo) btnAddCargo.style.display = 'none';
            
            const btnVoltar = document.getElementById('btn-voltar');
            if (btnVoltar) btnVoltar.style.display = 'none';
            
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
            const valorTaxa = salario * taxa;
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
    initCompartilhar();  // agora chama a geração de imagens
    checkVisualizacao();
});