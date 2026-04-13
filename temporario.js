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

// ========== FUNÇÃO PARA GERAR IMAGEM POR CARGO E IMAGEM DO TOTAL ==========
async function gerarImagemPorCargo() {
    const btnCompartilhar = document.getElementById('btn-compartilhar');
    const textoOriginal = btnCompartilhar ? btnCompartilhar.innerHTML : '';
    
    if (btnCompartilhar) {
        btnCompartilhar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando imagens...';
        btnCompartilhar.disabled = true;
    }
    
    try {
        const cliente = document.getElementById('cliente-nome').value || 'Não informado';
        const vendedor = document.getElementById('vendedor-nome').textContent || 'Não informado';
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const cargos = document.querySelectorAll('.cargo-item');
        
        console.log(`Total de cargos encontrados: ${cargos.length}`);
        
        // Mapa para contar nomes de cargos repetidos
        const nomeCount = new Map();
        
        // Primeiro, coletar todos os nomes base para contar
        const nomesBase = [];
        for (let i = 0; i < cargos.length; i++) {
            const cargo = cargos[i];
            const cargoNomeBase = cargo.querySelector('.cargo-nome').value.trim() || `Cargo_${i + 1}`;
            nomesBase.push(cargoNomeBase);
            
            const count = nomeCount.get(cargoNomeBase) || 0;
            nomeCount.set(cargoNomeBase, count + 1);
        }
        
        // Função para obter os adicionais ativos de um cargo
        function getAdicionaisAtivos(cargoItem) {
            const adicionais = [];
            const adicionaisContent = cargoItem.querySelector('.expandable-section:first-child .section-content');
            
            if (adicionaisContent) {
                const heCheck = adicionaisContent.querySelector('.he-check');
                const anCheck = adicionaisContent.querySelector('.an-check');
                const perCheck = adicionaisContent.querySelector('.per-check');
                const insCheck = adicionaisContent.querySelector('.ins-check');
                
                // Verificar se tem valores (não apenas checkbox marcado)
                if (heCheck && heCheck.checked) {
                    const horas = parseFloat(adicionaisContent.querySelector('.he-horas')?.value) || 0;
                    if (horas > 0) adicionais.push('HORA EXTRA');
                }
                if (anCheck && anCheck.checked) {
                    const horas = parseFloat(adicionaisContent.querySelector('.an-horas')?.value) || 0;
                    if (horas > 0) adicionais.push('NOTURNO');
                }
                if (perCheck && perCheck.checked) adicionais.push('PERICULOSIDADE');
                if (insCheck && insCheck.checked) adicionais.push('INSALUBRIDADE');
            }
            
            return adicionais;
        }
        
        // Função melhorada para verificar se uma seção tem valores > 0
        function secaoTemValores(secaoElement) {
            if (!secaoElement) return false;
            
            // Verificar inputs de valor em cards
            const cards = secaoElement.querySelectorAll('.beneficio-card, .seguranca-item, .insumo-card, .despesa-card, .adicional-card');
            
            for (const card of cards) {
                // Verificar inputs de valor
                const valorInputs = card.querySelectorAll('input[type="text"], input[type="number"]');
                for (const input of valorInputs) {
                    // Pular inputs de quantidade/depreciação em uniformes/EPIs
                    if (input.classList.contains('quantidade-uniforme') || 
                        input.classList.contains('quantidade-epi') ||
                        input.classList.contains('depreciacao-uniforme') ||
                        input.classList.contains('depreciacao-epi')) {
                        continue;
                    }
                    
                    let valor = 0;
                    if (input.type === 'text') {
                        valor = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
                    } else if (input.type === 'number') {
                        valor = parseFloat(input.value) || 0;
                    }
                    
                    if (valor > 0) return true;
                }
                
                // Verificar checkbox de exames
                const checkboxes = card.querySelectorAll('input[type="checkbox"]');
                for (const cb of checkboxes) {
                    if (cb.checked) return true;
                }
            }
            
            // Verificar se há itens personalizados
            const customItems = secaoElement.querySelectorAll('.item-custom, .beneficio-custom-card, .exame-custom-item');
            for (const item of customItems) {
                const qtdInput = item.querySelector('.item-custom-quantidade-input, .beneficio-custom-valor');
                if (qtdInput) {
                    const valor = parseFloat(qtdInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                    if (valor > 0) return true;
                }
                
                // Verificar checkbox em exame personalizado
                const checkbox = item.querySelector('.exame-custom-checkbox');
                if (checkbox && checkbox.checked) return true;
            }
            
            // Verificar totais de uniformes/EPIs
            const uniformesTotal = secaoElement.querySelector('.uniformes-total span:last-child');
            const episTotal = secaoElement.querySelector('.epis-total span:last-child');
            
            if (uniformesTotal) {
                const valor = parseFloat(uniformesTotal.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                if (valor > 0) return true;
            }
            if (episTotal) {
                const valor = parseFloat(episTotal.textContent.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                if (valor > 0) return true;
            }
            
            return false;
        }
        
        // Função para clonar e limpar seções vazias
        function cloneCargoLimpo(cargoOriginal) {
            const clone = cargoOriginal.cloneNode(true);
            
            // Lista de seções para verificar
            const secoes = [
                { selector: '.expandable-section:nth-child(2)', nome: 'Uniformes e EPIs' },
                { selector: '.expandable-section:nth-child(3)', nome: 'Benefícios' },
                { selector: '.expandable-section:nth-child(4)', nome: 'Segurança' },
                { selector: '.expandable-section:nth-child(5)', nome: 'Insumos' },
                { selector: '.despesas-section', nome: 'Despesas' },
                { selector: '.exames-section', nome: 'Exames' }
            ];
            
            // Verificar e remover seções vazias
            secoes.forEach(secao => {
                const elemento = clone.querySelector(secao.selector);
                if (elemento && !secaoTemValores(elemento)) {
                    elemento.style.display = 'none';
                }
            });
            
            // Verificar se a seção de adicionais tem valores
            const adicionaisSection = clone.querySelector('.expandable-section:first-child');
            if (adicionaisSection && !secaoTemValores(adicionaisSection)) {
                adicionaisSection.style.display = 'none';
            }
            
            return clone;
        }
        
        // Calcular total geral da proposta
        let totalGeralProposta = 0;
        cargos.forEach(cargo => {
            const totalVagaElem = cargo.querySelector('.total-prestacao .valor');
            if (totalVagaElem) {
                const totalText = totalVagaElem.textContent;
                const totalValor = parseFloat(totalText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
                totalGeralProposta += totalValor;
            }
        });
        
        // Salvar estado original do tema
        const wasLightMode = document.body.classList.contains('light-mode');
        
        if (!wasLightMode) {
            document.body.classList.add('light-mode');
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const zip = new JSZip();
        const clienteNome = cliente.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Contador para nomes repetidos
        const nomeContador = new Map();
        
        // ========== 1. GERAR IMAGEM DO TOTAL DA PROPOSTA ==========
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
                    <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Proposta de Contrato Temporário</p>
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
        zip.file(`${clienteNome}_TOTAL_DA_PROPOSTA.png`, totalBlob);
        
        // ========== 2. GERAR IMAGEM PARA CADA CARGO E ADICIONAR AO ZIP ==========
        const promessasImagens = [];
        
        for (let i = 0; i < cargos.length; i++) {
            const cargo = cargos[i];
            const cargoNomeBase = cargo.querySelector('.cargo-nome').value.trim() || `Cargo_${i + 1}`;
            
            // Contar ocorrências deste nome
            const ocorrenciaAtual = (nomeContador.get(cargoNomeBase) || 0) + 1;
            nomeContador.set(cargoNomeBase, ocorrenciaAtual);
            
            const totalOcorrencias = nomeCount.get(cargoNomeBase) || 1;
            const numeroSufixo = totalOcorrencias > 1 ? ` (${ocorrenciaAtual})` : '';
            
            // Obter adicionais ativos
            const adicionais = getAdicionaisAtivos(cargo);
            const adicionaisSufixo = adicionais.length > 0 ? ` + ${adicionais.join(' + ')}` : '';
            
            const nomeCompleto = `${cargoNomeBase}${numeroSufixo}${adicionaisSufixo}`;
            const nomeArquivo = `${clienteNome}_${nomeCompleto.replace(/[^a-zA-Z0-9À-ú+()]/g, '_')}.png`;
            
            console.log(`Preparando imagem ${i + 1}/${cargos.length}: ${nomeCompleto}`);
            
            if (btnCompartilhar) {
                btnCompartilhar.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Preparando ${i + 1}/${cargos.length}: ${nomeCompleto.substring(0, 25)}...`;
            }
            
            const promise = (async () => {
                try {
                    // Clonar o cargo e limpar seções vazias
                    const cloneCargo = cloneCargoLimpo(cargo);
                    
                    // Fechar dropdowns no clone
                    const cloneDropdowns = cloneCargo.querySelectorAll('.dropdown-menu');
                    cloneDropdowns.forEach(dropdown => {
                        dropdown.classList.remove('open');
                        dropdown.style.display = 'none';
                        const header = dropdown.previousElementSibling;
                        if (header && header.classList.contains('box-header')) {
                            const icon = header.querySelector('i');
                            if (icon) {
                                icon.classList.remove('fa-chevron-up');
                                icon.classList.add('fa-chevron-down');
                            }
                        }
                    });
                    
                    // Expandir todas as seções (apenas as que não foram ocultadas)
                    const cloneSecoes = cloneCargo.querySelectorAll('.expandable-section, .exames-section, .despesas-section');
                    cloneSecoes.forEach(secao => {
                        if (secao.style.display !== 'none') {
                            const content = secao.querySelector('.section-content, .exames-content, .despesas-content');
                            if (content && content.classList.contains('collapsed')) {
                                content.classList.remove('collapsed');
                            }
                            const toggleIcon = secao.querySelector('.section-toggle, .exames-toggle, .despesas-toggle');
                            if (toggleIcon) {
                                toggleIcon.classList.remove('fa-chevron-down');
                                toggleIcon.classList.add('fa-chevron-up');
                            }
                        }
                    });
                    
                    // Criar elemento para imagem
                    const elementoImagem = document.createElement('div');
                    elementoImagem.style.position = 'fixed';
                    elementoImagem.style.left = '-9999px';
                    elementoImagem.style.top = '-9999px';
                    elementoImagem.style.backgroundColor = '#ffffff';
                    elementoImagem.style.padding = '20px';
                    elementoImagem.style.borderRadius = '16px';
                    elementoImagem.style.width = '1000px';
                    elementoImagem.style.fontFamily = "'Inter', 'Segoe UI', sans-serif";
                    
                    elementoImagem.innerHTML = `
                        <div style="margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #c10404;">
                                <div>
                                    <h1 style="color: #c10404; margin: 0; font-size: 20px;">Prompt Serviços</h1>
                                    <p style="color: #666; margin: 0; font-size: 11px;">Proposta de Contrato Temporário</p>
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
                        ${cloneCargo.outerHTML}
                        <div style="margin-top: 20px; text-align: center; padding-top: 10px; border-top: 1px solid #e0e0e0; font-size: 9px; color: #888;">
                            Documento gerado em ${dataAtual} - Proposta válida por 30 dias
                        </div>
                    `;
                    
                    document.body.appendChild(elementoImagem);
                    
                    // Ajustar estilos e altura dos inputs
                    const cargoCloneElem = elementoImagem.querySelector('.cargo-item');
                    if (cargoCloneElem) {
                        cargoCloneElem.style.margin = '0';
                        cargoCloneElem.style.boxShadow = 'none';
                    }
                    
                    // Aumentar altura dos inputs para não cortar o texto
                    const allInputs = elementoImagem.querySelectorAll('input');
                    allInputs.forEach(input => {
                        input.style.minHeight = '36px';
                        input.style.height = 'auto';
                        input.style.padding = '8px 12px';
                    });
                    
                    // Ajustar específicamente os campos pequenos
                    const smallInputs = elementoImagem.querySelectorAll('.beneficio-campo input, .seguranca-campo input, .insumo-campo input, .despesa-campo input');
                    smallInputs.forEach(input => {
                        input.style.minHeight = '34px';
                        input.style.height = 'auto';
                        input.style.padding = '6px 10px';
                    });
                    
                    // Garantir que todos os conteúdos estão visíveis
                    const allContents = elementoImagem.querySelectorAll('.section-content, .exames-content, .despesas-content');
                    allContents.forEach(content => {
                        if (content.parentElement?.style.display !== 'none') {
                            content.style.display = 'block';
                            content.classList.remove('collapsed');
                        }
                    });
                    
                    // Esconder todos os dropdowns
                    const imagemDropdowns = elementoImagem.querySelectorAll('.dropdown-menu');
                    imagemDropdowns.forEach(dropdown => {
                        dropdown.style.display = 'none';
                        dropdown.classList.remove('open');
                    });
                    
                    elementoImagem.style.backgroundColor = '#ffffff';
                    elementoImagem.style.color = '#333333';
                    
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
                    zip.file(nomeArquivo, blob);
                    
                    console.log(`✅ Imagem ${i + 1}/${cargos.length} adicionada ao ZIP: ${nomeArquivo}`);
                    return { success: true, index: i, nome: nomeCompleto };
                    
                } catch (cargoError) {
                    console.error(`❌ Erro no cargo ${i + 1}: ${cargoNomeBase}`, cargoError);
                    return { success: false, index: i, nome: cargoNomeBase, erro: cargoError.message };
                }
            })();
            
            promessasImagens.push(promise);
        }
        
        // Aguardar TODAS as imagens serem processadas
        console.log('Aguardando processamento de todas as imagens...');
        if (btnCompartilhar) {
            btnCompartilhar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizando imagens...';
        }
        
        const resultados = await Promise.all(promessasImagens);
        
        const sucessos = resultados.filter(r => r.success).length;
        const falhas = resultados.filter(r => !r.success).length;
        
        console.log(`Processamento concluído: ${sucessos} sucessos, ${falhas} falhas`);
        
        // Restaurar tema original
        if (!wasLightMode) {
            document.body.classList.remove('light-mode');
        }
        
        // Gerar e baixar o arquivo ZIP
        console.log('Gerando arquivo ZIP...');
        if (btnCompartilhar) {
            btnCompartilhar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compactando arquivos...';
        }
        
        const content = await zip.generateAsync({ 
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: { level: 1 }
        });
        
        console.log(`ZIP gerado com ${Object.keys(zip.files).length} arquivos`);
        
        const link = document.createElement('a');
        link.download = `Propostas_${clienteNome}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`;
        link.href = URL.createObjectURL(content);
        link.click();
        URL.revokeObjectURL(link.href);
        
        // Mostrar resultado
        let mensagem = `✅ ${sucessos + 1} imagem(ns) gerada(s) com sucesso!\n- 1 imagem com o TOTAL da proposta\n- ${sucessos} imagem(ns) com detalhes dos cargos\n\n📦 Arquivo ZIP salvo na pasta Downloads`;
        
        if (sucessos !== cargos.length) {
            mensagem += `\n\n⚠️ Apenas ${sucessos} de ${cargos.length} cargos foram gerados.`;
        }
        
        if (falhas > 0) {
            mensagem += `\n\n❌ ${falhas} cargo(s) falharam:\n`;
            resultados.filter(r => !r.success).forEach(erro => {
                mensagem += `- Cargo ${erro.index + 1}: ${erro.nome}\n`;
            });
        }
        
        alert(mensagem);
        
    } catch (error) {
        console.error('Erro ao gerar imagens:', error);
        alert('Erro ao gerar imagens. Tente novamente.\n' + error.message);
    } finally {
        const btnCompartilhar = document.getElementById('btn-compartilhar');
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
                    beneficiosPersonalizados: [],  // <-- ADICIONAR ESTA LINHA
                    seguranca: {},
                    insumos: {},
                    despesas: {},
                    exames: {},
                    treinamento: 0
                };
                
                // ========== UNIFORMES PADRÃO ==========
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
                
                // ========== EPIs PADRÃO ==========
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
                
                // ========== BENEFÍCIOS FIXOS ==========
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
                
                // ========== BENEFÍCIOS PERSONALIZADOS ==========
                // ⬇️⬇️⬇️ ESTE É O BLOCO QUE FALTAVA ⬇️⬇️⬇️
                const beneficiosPersonalizados = [];
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
                cargo.beneficiosPersonalizados = beneficiosPersonalizados;
                // ⬆️⬆️⬆️ FIM DO BLOCO ⬆️⬆️⬆️
                
                // ========== SEGURANÇA ==========
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
                
                // ========== INSUMOS ==========
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
                
                // ========== DESPESAS ==========
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
                
                // ========== EXAMES PADRÃO ==========
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
                
                // ========== UNIFORMES PERSONALIZADOS ==========
                const uniformesCustom = [];
                item.querySelectorAll('.uniformes-box .item-custom').forEach(customItem => {
                    const nome = customItem.querySelector('.item-custom-nome')?.value;
                    const precoInput = customItem.querySelector('.item-custom-preco-input');
                    const qtdInput = customItem.querySelector('.item-custom-quantidade-input');
                    const depInput = customItem.querySelector('.item-custom-depreciacao-input');
                    const preco = parseFloat(precoInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const qtd = parseInt(qtdInput?.value) || 0;
                    const dep = parseInt(depInput?.value) || 1;
                    if (nome && qtd > 0 && preco > 0) {
                        uniformesCustom.push({ nome, preco, quantidade: qtd, depreciacao: dep });
                    }
                });
                if (uniformesCustom.length > 0) cargo.uniformes.custom = uniformesCustom;
                
                // ========== EPIs PERSONALIZADOS ==========
                const episCustom = [];
                item.querySelectorAll('.epis-box .item-custom').forEach(customItem => {
                    const nome = customItem.querySelector('.item-custom-nome')?.value;
                    const precoInput = customItem.querySelector('.item-custom-preco-input');
                    const qtdInput = customItem.querySelector('.item-custom-quantidade-input');
                    const depInput = customItem.querySelector('.item-custom-depreciacao-input');
                    const preco = parseFloat(precoInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const qtd = parseInt(qtdInput?.value) || 0;
                    const dep = parseInt(depInput?.value) || 1;
                    if (nome && qtd > 0 && preco > 0) {
                        episCustom.push({ nome, preco, quantidade: qtd, depreciacao: dep });
                    }
                });
                if (episCustom.length > 0) cargo.epis.custom = episCustom;
                
                // ========== EXAMES PERSONALIZADOS ==========
                const examesCustom = [];
                item.querySelectorAll('.exame-custom-item').forEach(customItem => {
                    const nome = customItem.querySelector('.exame-custom-nome')?.value;
                    const precoInput = customItem.querySelector('.exame-custom-preco-input');
                    const checkbox = customItem.querySelector('.exame-custom-checkbox');
                    const preco = parseFloat(precoInput?.value.replace(/\./g, '').replace(',', '.')) || 0;
                    const checked = checkbox?.checked || false;
                    if (nome && preco > 0) {
                        examesCustom.push({ nome, preco, checked });
                    } else if (nome && checked) {
                        examesCustom.push({ nome, preco: 0, checked });
                    }
                });
                if (examesCustom.length > 0) cargo.exames.custom = examesCustom;
                
                dados.cargos.push(cargo);
            });
           
            // Dentro de salvarRascunho, ANTES do localStorage.setItem
            console.log('=== DADOS SENDO SALVOS ===');
            console.log('Benefícios Personalizados:', dados.cargos.map(c => c.beneficiosPersonalizados));
            console.log('Uniformes Custom:', dados.cargos.map(c => c.uniformes?.custom));
            console.log('EPIs Custom:', dados.cargos.map(c => c.epis?.custom));
            console.log('Exames Custom:', dados.cargos.map(c => c.exames?.custom));

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
                        console.log('=== CARREGANDO CARGO DO RASCUNHO ===');
                        console.log('Nome:', c.nome);
                        console.log('Adicionais brutos:', c.adicionais);

                        let examesObj = c.exames || {};
                        
                        // GARANTIR que os adicionais existem
                        const adicionais = c.adicionais || {
                            horasExtras: false,
                            noturno: false,
                            periculosidade: false,
                            insalubridade: false,
                            heHoras: 0,
                            anHoras: 0
                        };
                        
                        container.appendChild(criarCargoItem(
                            c.nome,
                            c.quantidade,
                            parseFloat(c.salario?.replace(/\./g, '').replace(',', '.')) || 0,
                            adicionais,  // <-- PASSAR OS ADICIONAIS
                            c.uniformes || {},
                            c.epis || {},
                            c.beneficios || {},
                            c.seguranca || {},
                            c.insumos || {},
                            c.despesas || {},
                            examesObj,
                            c.treinamento || 0,
                            parseFloat(c.adicionais?.encargosPercentual?.replace(/\./g, '').replace(',', '.')) || 55.83,
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
        
        // Função para criar item personalizado (uniforme ou EPI)
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
                    <input type="text" class="item-custom-nome" placeholder="Nome do item" value="${escapeHtml(nome)}" style="background: transparent; border: none; color: #c10404; font-weight: 600; width: 60%; padding: 0; font-size: 0.85rem;">
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
        
        // Função para criar botão "Adicionar Personalizado"
        function criarBotaoAdicionarCustom(tipo) {
            const btnDiv = document.createElement('div');
            btnDiv.className = 'btn-add-custom-container';
            btnDiv.innerHTML = `
                <button type="button" class="btn-add-custom btn-add-custom-${tipo}" style="background: transparent; border: 1px dashed #c10404; color: #c10404; padding: 0.3rem; border-radius: 20px; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem; font-size: 0.75rem;">
                    <i class="fas fa-plus-circle"></i> Adicionar ${tipo === 'uniforme' ? 'Uniforme' : 'EPI'} Personalizado
                </button>
            `;
            return btnDiv;
        }
        
        // Adicionar itens padrão UNIFORMES
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
        
        // Carregar uniformes personalizados existentes
        if (dadosUniformes && dadosUniformes.custom) {
            dadosUniformes.custom.forEach(item => {
                const customItem = criarItemPersonalizadoDropdown('uniforme', item);
                uniformesMenu.appendChild(customItem.div);
                uniformesCustomItems.push(customItem);
            });
        }
        
        const btnUniformeCustom = criarBotaoAdicionarCustom('uniforme');
        uniformesMenu.appendChild(btnUniformeCustom);
        btnUniformeCustom.querySelector('.btn-add-custom-uniforme').addEventListener('click', () => {
            const customItem = criarItemPersonalizadoDropdown('uniforme');
            uniformesMenu.insertBefore(customItem.div, btnUniformeCustom);
            uniformesCustomItems.push(customItem);
            calcularTotais();
            salvarRascunho();
        });
        
        // Adicionar itens padrão EPIS
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
        
        // Carregar EPIs personalizados existentes
        if (dadosEpis && dadosEpis.custom) {
            dadosEpis.custom.forEach(item => {
                const customItem = criarItemPersonalizadoDropdown('epi', item);
                episMenu.appendChild(customItem.div);
                episCustomItems.push(customItem);
            });
        }
        
        const btnEpiCustom = criarBotaoAdicionarCustom('epi');
        episMenu.appendChild(btnEpiCustom);
        btnEpiCustom.querySelector('.btn-add-custom-epi').addEventListener('click', () => {
            const customItem = criarItemPersonalizadoDropdown('epi');
            episMenu.insertBefore(customItem.div, btnEpiCustom);
            episCustomItems.push(customItem);
            calcularTotais();
            salvarRascunho();
        });
        
        // Função para calcular total mensal de uniformes (padrão + personalizados)
        function calcularTotalUniformeMensal() {
            let total = 0;
            // Itens padrão
            uniformesItems.forEach(item => {
                if (typeof item.getMensal === 'function') {
                    total += item.getMensal();
                }
            });
            // Itens personalizados
            uniformesCustomItems.forEach(item => {
                if (typeof item.getMensal === 'function') {
                    total += item.getMensal();
                }
            });
            uniformesTotalSpan.textContent = formatarMoeda(total);
            return total;
        }
        
        // Função para calcular total GERAL de uniformes (para multiplicar pela quantidade)
        function calcularTotalUniformeGeral(qtdFuncionarios) {
            let total = 0;
            // Itens padrão
            uniformesItems.forEach(item => {
                if (typeof item.getTotal === 'function') {
                    total += item.getTotal();
                } else if (typeof item.getQuantidade === 'function' && typeof item.getPreco === 'function') {
                    // Fallback se getTotal não existir
                    total += item.getQuantidade() * item.getPreco();
                }
            });
            // Itens personalizados
            uniformesCustomItems.forEach(item => {
                if (typeof item.getTotal === 'function') {
                    total += item.getTotal();
                } else if (typeof item.getQuantidade === 'function' && typeof item.getPreco === 'function') {
                    total += item.getQuantidade() * item.getPreco();
                }
            });
            return total * qtdFuncionarios;
        }
        
        // Função para calcular total mensal de EPIs (padrão + personalizados)
        function calcularTotalEpiMensal() {
            let total = 0;
            // Itens padrão
            episItems.forEach(item => {
                if (typeof item.getMensal === 'function') {
                    total += item.getMensal();
                }
            });
            // Itens personalizados
            episCustomItems.forEach(item => {
                if (typeof item.getMensal === 'function') {
                    total += item.getMensal();
                }
            });
            episTotalSpan.textContent = formatarMoeda(total);
            return total;
        }
        
        // Função para calcular total GERAL de EPIs (para multiplicar pela quantidade)
        function calcularTotalEpiGeral(qtdFuncionarios) {
            let total = 0;
            // Itens padrão
            episItems.forEach(item => {
                if (typeof item.getTotal === 'function') {
                    total += item.getTotal();
                } else if (typeof item.getQuantidade === 'function' && typeof item.getPreco === 'function') {
                    total += item.getQuantidade() * item.getPreco();
                }
            });
            // Itens personalizados
            episCustomItems.forEach(item => {
                if (typeof item.getTotal === 'function') {
                    total += item.getTotal();
                } else if (typeof item.getQuantidade === 'function' && typeof item.getPreco === 'function') {
                    total += item.getQuantidade() * item.getPreco();
                }
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
            
            if (uniformesTotalGeralSpan) uniformesTotalGeralSpan.textContent = formatarMoeda(totalUniformeGeral);
            if (episTotalGeralSpan) episTotalGeralSpan.textContent = formatarMoeda(totalEpiGeral);
            
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
                    if (cargoItem && cargoItem.dispatchEvent) cargoItem.dispatchEvent(new Event('recalcular'));
                    salvarRascunho();
                });
            });
        });
        
        episItems.forEach(item => {
            item.div.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => {
                    calcularTotais();
                    if (cargoItem && cargoItem.dispatchEvent) cargoItem.dispatchEvent(new Event('recalcular'));
                    salvarRascunho();
                });
            });
        });
        
        if (cargoItem) {
            const qtdInput = cargoItem.querySelector('.cargo-quantidade');
            if (qtdInput) {
                qtdInput.addEventListener('input', () => { calcularTotais(); });
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
                if (uniformesCustom.length > 0) uniformes.custom = uniformesCustom;
                
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
                if (episCustom.length > 0) epis.custom = episCustom;
                
                return { uniformes, epis };
            } 
        };
    }

    function criarBeneficiosSection(cargoItem, dadosBeneficios = {}, dadosBeneficiosPersonalizados = []) {
        console.log('criarBeneficiosSection - dadosBeneficiosPersonalizados recebidos:', dadosBeneficiosPersonalizados);
        
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
        
        // Array para armazenar os benefícios personalizados (referências DOM)
        const customBeneficiosRefs = [];
        
        function atualizarTotalGeral(totalPorFuncionario) {
            const qtdFuncionarios = parseInt(cargoItem?.querySelector('.cargo-quantidade')?.value) || 1;
            const totalGeral = totalPorFuncionario * qtdFuncionarios;
            if (beneficiosTotalGeralSpan) beneficiosTotalGeralSpan.textContent = formatarMoeda(totalGeral);
            if (beneficiosQtdFuncionariosSpan) beneficiosQtdFuncionariosSpan.textContent = qtdFuncionarios;
            return totalGeral;
        }
        
        // Benefícios fixos
        BENEFICIOS.forEach(b => {
            const card = document.createElement('div');
            card.className = 'beneficio-card';
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
        
        // Função para criar um card de benefício personalizado
        function criarBeneficioCustomizado(beneficio = null) {
            const card = document.createElement('div');
            card.className = 'beneficio-custom-card';
            const nome = beneficio?.nome || '';
            const valorDiario = beneficio?.valorDiario || 0;
            const dias = beneficio?.dias || 0;
            
            card.innerHTML = `
                <div class="beneficio-nome" style="min-width: 150px;">
                    <input type="text" class="beneficio-custom-nome" placeholder="Nome do benefício" value="${escapeHtml(nome)}" style="background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%); border: 1px solid #2c2c2c; border-radius: 30px; padding: 0.4rem 0.8rem; color: #c10404; font-weight: 600; width: 100%;">
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
            
            // Adicionar event listeners
            const nomeInput = card.querySelector('.beneficio-custom-nome');
            const valorInput = card.querySelector('.beneficio-custom-valor');
            const diasInput = card.querySelector('.beneficio-custom-dias');
            const btnRemover = card.querySelector('.btn-remover-beneficio');
            
            // Formatação do valor
            valorInput.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/\D/g, '');
                e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) cargoItem.dispatchEvent(new Event('recalcular'));
            });
            
            diasInput.addEventListener('input', () => {
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) cargoItem.dispatchEvent(new Event('recalcular'));
            });
            
            nomeInput.addEventListener('input', () => {
                salvarRascunho();
            });
            
            btnRemover.addEventListener('click', () => {
                card.remove();
                const index = customBeneficiosRefs.findIndex(ref => ref.card === card);
                if (index !== -1) customBeneficiosRefs.splice(index, 1);
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) cargoItem.dispatchEvent(new Event('recalcular'));
            });
            
            // Atualizar total inicial
            const valor = parseFloat(valorInput.value.replace(/\./g, '').replace(',', '.')) || 0;
            const diasVal = parseInt(diasInput.value) || 0;
            const totalSpan = card.querySelector('.beneficio-total');
            totalSpan.textContent = `Total: ${formatarMoeda(valor * diasVal)}`;
            
            return card;
        }
        
        // Carregar benefícios personalizados existentes
        console.log('Carregando benefícios personalizados:', dadosBeneficiosPersonalizados);
        if (dadosBeneficiosPersonalizados && dadosBeneficiosPersonalizados.length > 0) {
            dadosBeneficiosPersonalizados.forEach(beneficio => {
                const card = criarBeneficioCustomizado(beneficio);
                customGrid.appendChild(card);
                customBeneficiosRefs.push({ card, data: beneficio });
            });
        }
        
        // Botão para adicionar novo benefício
        btnAdicionar.addEventListener('click', () => {
            const card = criarBeneficioCustomizado();
            customGrid.appendChild(card);
            customBeneficiosRefs.push({ card, data: null });
            calcularTotal();
            salvarRascunho();
        });
        
        function calcularTotal() {
            let total = 0;
            
            // Benefícios fixos
            fixosGrid.querySelectorAll('.beneficio-card').forEach(card => {
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
                if (cargoItem && cargoItem.dispatchEvent) cargoItem.dispatchEvent(new Event('recalcular'));
            });
        });
        
        // Atualizar quantidade de funcionários
        if (cargoItem) {
            const qtdInput = cargoItem.querySelector('.cargo-quantidade');
            if (qtdInput) {
                const totalAtual = calcularTotal();
                qtdInput.addEventListener('input', () => atualizarTotalGeral(totalAtual));
            }
        }
        
        calcularTotal();
        
        // Função para capturar dados
        const getDados = () => {
            const beneficios = {};
            fixosGrid.querySelectorAll('.beneficio-card').forEach(card => {
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
            
            console.log('getDados - Benefícios Personalizados capturados:', beneficiosPersonalizados);
            
            return { beneficios, beneficiosPersonalizados };
        };
        
        return { section, calcularTotal, getDados };
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
        
        function atualizarTotalGeral(totalPorFuncionario) {
            const qtdFuncionarios = parseInt(cargoItem?.querySelector('.cargo-quantidade')?.value) || 1;
            const totalGeral = totalPorFuncionario * qtdFuncionarios;
            if (examesTotalGeralSpan) examesTotalGeralSpan.textContent = formatarMoeda(totalGeral);
            if (examesQtdFuncionariosSpan) examesQtdFuncionariosSpan.textContent = qtdFuncionarios;
            return totalGeral;
        }
        
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
                    <input type="text" class="exame-custom-nome" placeholder="Nome do exame" value="${escapeHtml(nome)}" style="background: transparent; border: none; color: #c10404; font-weight: 600; width: 60%; padding: 0; font-size: 0.85rem;">
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
            
            nomeInput.addEventListener('input', () => salvarRascunho());
            
            checkbox.addEventListener('change', () => {
                atualizarTotal();
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) cargoItem.dispatchEvent(new Event('recalcular-exames'));
            });
            
            const btnRemover = div.querySelector('.btn-remover-exame-custom');
            btnRemover.addEventListener('click', () => {
                div.remove();
                const index = examesCustomItems.findIndex(item => item.div === div);
                if (index !== -1) examesCustomItems.splice(index, 1);
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) cargoItem.dispatchEvent(new Event('recalcular-exames'));
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
        
        function criarBotaoAdicionarExameCustom() {
            const btnDiv = document.createElement('div');
            btnDiv.className = 'btn-add-custom-container';
            btnDiv.innerHTML = `
                <button type="button" class="btn-add-custom" style="background: transparent; border: 1px dashed #c10404; color: #c10404; padding: 0.3rem; border-radius: 20px; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem; font-size: 0.75rem;">
                    <i class="fas fa-plus-circle"></i> Adicionar Exame Personalizado
                </button>
            `;
            return btnDiv;
        }
        
        // Adicionar exames obrigatórios
        EXAMES_OBRIGATORIOS.forEach(e => {
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
                div: itemDiv,
                obrigatorio: true
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
                div: itemDiv,
                obrigatorio: false
            });
        });
        
        // Carregar exames personalizados existentes
        if (dadosExames && dadosExames.custom) {
            dadosExames.custom.forEach(item => {
                const customItem = criarExamePersonalizadoDropdown(item);
                examesMenu.appendChild(customItem.div);
                examesCustomItems.push(customItem);
            });
        }
        
        const btnExameCustom = criarBotaoAdicionarExameCustom();
        examesMenu.appendChild(btnExameCustom);
        btnExameCustom.querySelector('.btn-add-custom').addEventListener('click', () => {
            const customItem = criarExamePersonalizadoDropdown();
            examesMenu.insertBefore(customItem.div, btnExameCustom);
            examesCustomItems.push(customItem);
            calcularTotal();
            salvarRascunho();
        });
        
        function calcularTotalExames() {
            let totalExames = 0;
            examesItems.forEach(item => {
                if (item.checkbox.checked) totalExames += item.preco;
            });
            examesCustomItems.forEach(item => {
                if (item.isChecked()) totalExames += item.getPreco();
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
            atualizarTotalGeral(totalGeral);
            return totalGeral;
        }
        
        examesItems.forEach(item => {
            item.checkbox.addEventListener('change', () => {
                calcularTotal();
                salvarRascunho();
                if (cargoItem && cargoItem.dispatchEvent) cargoItem.dispatchEvent(new Event('recalcular-exames'));
            });
        });
        
        treinamentoInput.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '0,00';
            calcularTotal();
            salvarRascunho();
            if (cargoItem && cargoItem.dispatchEvent) cargoItem.dispatchEvent(new Event('recalcular-exames'));
        });
        
        if (cargoItem) {
            const qtdInput = cargoItem.querySelector('.cargo-quantidade');
            if (qtdInput) {
                const totalAtual = calcularTotal();
                qtdInput.addEventListener('input', () => atualizarTotalGeral(totalAtual));
            }
        }
        
        // Dropdown toggle
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
                    if (item.checkbox.checked) exames[item.nome] = true;
                });
                
                const examesCustom = [];
                examesCustomItems.forEach(item => {
                    const nome = item.getNome();
                    const preco = item.getPreco();
                    const checked = item.isChecked();
                    if (nome && preco > 0) {
                        examesCustom.push({ nome, preco, checked });
                    } else if (nome && checked) {
                        examesCustom.push({ nome, preco: 0, checked });
                    }
                });
                if (examesCustom.length > 0) exames.custom = examesCustom;
                
                const treinamento = parseFloat(treinamentoInput.value.replace(/\./g, '').replace(',', '.')) || 0;
                return { exames, treinamento };
            } 
        };
    }

    function criarCargoItem(cargo = '', quantidade = 1, salario = 0, dadosAdicionais = {}, dadosUniformes = {}, dadosEpis = {}, dadosBeneficios = {}, dadosSeguranca = {}, dadosInsumos = {}, dadosDespesas = {}, dadosExames = {}, treinamentoValor = 0, encargosPercentual = 55.83, dadosBeneficiosPersonalizados = []) {
        console.log('=== criarCargoItem CHAMADA ===');
        console.log('dadosAdicionais recebidos:', dadosAdicionais);
        console.log('horasExtras:', dadosAdicionais?.horasExtras);
        console.log('heHoras:', dadosAdicionais?.heHoras);
        
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
        
        const { section: beneficiosSection, calcularTotal: calcularBeneficios, getDados: getBeneficiosDados } = criarBeneficiosSection(item, dadosBeneficios, dadosBeneficiosPersonalizados || []);
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
        
        // ========== EVENT LISTENERS ==========
        item.querySelector('.cargo-nome').addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        item.querySelector('.cargo-quantidade').addEventListener('input', () => { atualizarResultados(); salvarRascunho(); });
        item.querySelector('.cargo-salario').addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            e.target.value = valor ? (parseInt(valor) / 100).toFixed(2).replace('.', ',') : '';
            atualizarResultados();
            salvarRascunho();
        });
        
        const encargosInput = item.querySelector('.encargos-percentual');
        encargosInput.addEventListener('input', function(e) {
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
        
        // ========== RESTAURAR ADICIONAIS ==========
        // Usar setTimeout para garantir que o DOM já foi completamente criado
        setTimeout(() => {
            console.log('=== RESTAURANDO ADICIONAIS (após DOM) ===');
            console.log('dadosAdicionais:', dadosAdicionais);
            
            if (dadosAdicionais) {
                // Forçar a expansão da seção
                const adicionaisHeader = item.querySelector('.expandable-section:first-child .section-header');
                const adicionaisContentElem = item.querySelector('.expandable-section:first-child .section-content');
                
                if (adicionaisContentElem && adicionaisContentElem.classList.contains('collapsed')) {
                    adicionaisContentElem.classList.remove('collapsed');
                    const toggleIcon = adicionaisHeader?.querySelector('.section-toggle');
                    if (toggleIcon) {
                        toggleIcon.classList.remove('fa-chevron-down');
                        toggleIcon.classList.add('fa-chevron-up');
                    }
                }
                
                // Restaurar checkboxes
                const heCheck = adicionaisContent.querySelector('.he-check');
                const anCheck = adicionaisContent.querySelector('.an-check');
                const perCheck = adicionaisContent.querySelector('.per-check');
                const insCheck = adicionaisContent.querySelector('.ins-check');
                const heHoras = adicionaisContent.querySelector('.he-horas');
                const anHoras = adicionaisContent.querySelector('.an-horas');
                
                if (heCheck) {
                    heCheck.checked = dadosAdicionais.horasExtras === true;
                    console.log('Set heCheck.checked =', dadosAdicionais.horasExtras);
                }
                if (anCheck) {
                    anCheck.checked = dadosAdicionais.noturno === true;
                    console.log('Set anCheck.checked =', dadosAdicionais.noturno);
                }
                if (perCheck) {
                    perCheck.checked = dadosAdicionais.periculosidade === true;
                    console.log('Set perCheck.checked =', dadosAdicionais.periculosidade);
                }
                if (insCheck) {
                    insCheck.checked = dadosAdicionais.insalubridade === true;
                    console.log('Set insCheck.checked =', dadosAdicionais.insalubridade);
                }
                if (heHoras && dadosAdicionais.heHoras) {
                    heHoras.value = dadosAdicionais.heHoras;
                    console.log('Set heHoras.value =', dadosAdicionais.heHoras);
                }
                if (anHoras && dadosAdicionais.anHoras) {
                    anHoras.value = dadosAdicionais.anHoras;
                    console.log('Set anHoras.value =', dadosAdicionais.anHoras);
                }
                
                // Mostrar/esconder os conteúdos
                const heConteudo = adicionaisContent.querySelector('.he-conteudo');
                const anConteudo = adicionaisContent.querySelector('.an-conteudo');
                const perConteudo = adicionaisContent.querySelector('.per-conteudo');
                const insConteudo = adicionaisContent.querySelector('.ins-conteudo');
                
                if (heConteudo) heConteudo.classList.toggle('hidden', !dadosAdicionais.horasExtras);
                if (anConteudo) anConteudo.classList.toggle('hidden', !dadosAdicionais.noturno);
                if (perConteudo) perConteudo.classList.toggle('hidden', !dadosAdicionais.periculosidade);
                if (insConteudo) insConteudo.classList.toggle('hidden', !dadosAdicionais.insalubridade);
                
                // Forçar atualização dos resultados
                atualizarResultados();
            }
        }, 100);
        
        // Primeira atualização
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
                                console.log('=== CARREGANDO CARGO DO FIREBASE ===');
                                console.log('Nome:', c.nome);
                                console.log('Adicionais brutos:', c.adicionais);
                                console.log('Horas Extras:', c.adicionais?.horasExtras);
                                console.log('Horas Extras valor:', c.adicionais?.heHoras);
                                console.log('Noturno:', c.adicionais?.noturno);
                                console.log('Periculosidade:', c.adicionais?.periculosidade);
                                console.log('Insalubridade:', c.adicionais?.insalubridade);
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
                            
                            // GARANTIR que os adicionais existem
                            const adicionais = c.adicionais || {
                                horasExtras: false,
                                noturno: false,
                                periculosidade: false,
                                insalubridade: false,
                                heHoras: 0,
                                anHoras: 0
                            };
                            
                            container.appendChild(criarCargoItem(
                                c.nome,
                                c.quantidade,
                                c.salario,
                                adicionais,  // <-- PASSAR OS ADICIONAIS
                                c.uniformes || {},
                                c.epis || {},
                                c.beneficios || {},
                                c.seguranca || {},
                                c.insumos || {},
                                c.despesas || {},
                                examesObj,
                                c.treinamento || 0,
                                c.adicionais?.encargosPercentual || 55.83,
                                c.beneficiosPersonalizados || []
                            ));
                        });
                    } else {
                        container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83, []));
                    }
                    calcularTotalGeral();
                    localStorage.removeItem(DRAFT_KEY);
                } else {
                    if (!carregarRascunho()) {
                        container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83, []));
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar proposta:', error);
                if (!carregarRascunho()) {
                    container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83, []));
                }
            }
        } else {
            if (!carregarRascunho()) {
                container.appendChild(criarCargoItem('', 1, 0, {}, {}, {}, {}, {}, {}, {}, {}, 0, 55.83, []));
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
            const cargos = document.querySelectorAll('.cargo-item');
            if (cargos.length === 0) {
                mostrarModal('Adicione pelo menos um cargo antes de gerar as imagens.');
                return;
            }
            
            const cliente = document.getElementById('cliente-nome').value;
            if (!cliente) {
                mostrarModal('Informe o nome do cliente antes de gerar as imagens.');
                return;
            }
            
            await gerarImagemPorCargo();
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
            
            // Depois de capturar os benefícios fixos, adicione:
            const beneficiosPersonalizados = [];
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
                beneficiosPersonalizados,
                seguranca,
                insumos,
                despesas,
                exames,
                treinamento,
                totalVaga
            });

            console.log('=== SALVANDO CARGO ===');
            console.log('Nome:', nome);
            console.log('Adicionais sendo salvos:', {
                horasExtras: heCheck?.checked || false,
                noturno: anCheck?.checked || false,
                heHoras: heHoras,
                anHoras: anHoras
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