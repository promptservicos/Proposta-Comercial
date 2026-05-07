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

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', function() {
    const inputNome = document.getElementById('input-nome');
    const inputEmail = document.getElementById('input-email');
    const inputTelefone = document.getElementById('input-telefone');
    const assinaturaNome = document.getElementById('assinatura-nome');
    const assinaturaEmail = document.getElementById('assinatura-email');
    const assinaturaTelefone = document.getElementById('assinatura-telefone');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCompartilhar = document.getElementById('btn-compartilhar');
    const btnVoltar = document.getElementById('btn-voltar');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalMensagem = document.getElementById('modal-mensagem');
    const modalOk = document.getElementById('modal-ok');
    const corpoCarta = document.getElementById('carta-corpo-editable');

    const urlParams = new URLSearchParams(window.location.search);
    const cartaId = urlParams.get('id');

    // Formatar telefone
    function formatarTelefone(valor) {
        let numeros = valor.replace(/\D/g, '');
        if (numeros.length === 0) return '';
        if (numeros.length <= 2) return `(${numeros}`;
        if (numeros.length <= 6) return `(${numeros.substring(0, 2)}) ${numeros.substring(2)}`;
        if (numeros.length <= 10) return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
        return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7, 11)}`;
    }

    inputTelefone.addEventListener('input', function(e) {
        let valor = e.target.value;
        let cursorPos = e.target.selectionStart;
        let formatted = formatarTelefone(valor);
        e.target.value = formatted;
        let diff = formatted.length - valor.length;
        e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
        atualizarAssinatura();
    });

    function mostrarModal(mensagem) {
        modalMensagem.textContent = mensagem;
        modalOverlay.classList.remove('hidden');
    }

    modalOk.addEventListener('click', () => modalOverlay.classList.add('hidden'));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
    });

    btnVoltar.addEventListener('click', () => {
        window.location.href = 'menu.html';
    });

    function salvarConteudoCarta() {
        localStorage.setItem('carta_conteudo', corpoCarta.innerHTML);
    }

    function carregarConteudoCarta() {
        const conteudoSalvo = localStorage.getItem('carta_conteudo');
        if (conteudoSalvo && !cartaId) {
            corpoCarta.innerHTML = conteudoSalvo;
        }
    }

    corpoCarta.addEventListener('input', salvarConteudoCarta);

    function atualizarAssinatura() {
        assinaturaNome.textContent = inputNome.value.trim() || '_________________________';
        assinaturaEmail.textContent = inputEmail.value.trim() || '_________________________';
        assinaturaTelefone.textContent = inputTelefone.value.trim() || '_________________________';
        
        localStorage.setItem('carta_draft', JSON.stringify({
            nome: inputNome.value.trim(),
            email: inputEmail.value.trim(),
            telefone: inputTelefone.value.trim()
        }));
    }

    inputNome.addEventListener('input', atualizarAssinatura);
    inputEmail.addEventListener('input', atualizarAssinatura);

    function carregarRascunho() {
        const draft = localStorage.getItem('carta_draft');
        if (draft && !cartaId) {
            const dados = JSON.parse(draft);
            if (dados.nome) inputNome.value = dados.nome;
            if (dados.email) inputEmail.value = dados.email;
            if (dados.telefone) inputTelefone.value = dados.telefone;
            atualizarAssinatura();
        }
        carregarConteudoCarta();
    }
    carregarRascunho();

    async function carregarCartaExistente() {
        if (cartaId) {
            try {
                const doc = await db.collection('cartas').doc(cartaId).get();
                if (doc.exists) {
                    const data = doc.data();
                    if (data.nome) inputNome.value = data.nome;
                    if (data.email) inputEmail.value = data.email;
                    if (data.telefone) inputTelefone.value = data.telefone;
                    if (data.conteudo) corpoCarta.innerHTML = data.conteudo;
                    atualizarAssinatura();
                }
            } catch (error) {
                console.error('Erro ao carregar carta:', error);
            }
        }
    }
    carregarCartaExistente();

    async function salvarCarta() {
        const conteudo = corpoCarta.innerHTML;
        if (!conteudo || conteudo.trim() === '') {
            mostrarModal('❌ Escreva algo na carta antes de salvar!');
            return;
        }
        
        const carta = {
            nome: inputNome.value.trim() || 'Não informado',
            email: inputEmail.value.trim() || 'Não informado',
            telefone: inputTelefone.value.trim() || 'Não informado',
            conteudo: conteudo,
            tipo: 'carta',
            dataAtualizacao: new Date().toISOString()
        };
        
        try {
            const usuario = auth.currentUser;
            if (usuario) carta.usuario = usuario.email || usuario.uid;
            
            if (cartaId) {
                await db.collection('cartas').doc(cartaId).update(carta);
                mostrarModal('✅ Carta atualizada com sucesso!');
            } else {
                const docRef = await db.collection('cartas').add(carta);
                mostrarModal('✅ Carta salva com sucesso!');
                window.history.replaceState(null, '', `?id=${docRef.id}`);
                localStorage.removeItem('carta_draft');
                localStorage.removeItem('carta_conteudo');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            mostrarModal('❌ Erro ao salvar carta.');
        }
    }

    btnSalvar.addEventListener('click', salvarCarta);

    function formatarData() {
        const now = new Date();
        return now.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ================== BARRA DE FERRAMENTAS SIMPLIFICADA ==================
    let currentFontSize = 16;
    const fontSizeIndicator = document.getElementById('font-size-indicator');
    const fontSizeInput = document.createElement('input');
    fontSizeInput.type = 'number';
    fontSizeInput.min = 8;
    fontSizeInput.max = 72;
    fontSizeInput.step = 1;
    fontSizeInput.value = currentFontSize;
    fontSizeInput.className = 'font-size-input';

    // Substituir o indicador por um input editável
    if (fontSizeIndicator) {
        fontSizeIndicator.style.display = 'none';
        const parent = fontSizeIndicator.parentElement;
        fontSizeInput.style.width = '55px';
        fontSizeInput.style.textAlign = 'center';
        fontSizeInput.style.background = 'rgba(193, 4, 4, 0.1)';
        fontSizeInput.style.border = '1px solid rgba(193, 4, 4, 0.3)';
        fontSizeInput.style.borderRadius = '20px';
        fontSizeInput.style.color = '#c10404';
        fontSizeInput.style.fontWeight = '600';
        fontSizeInput.style.padding = '0.2rem 0.5rem';
        parent.insertBefore(fontSizeInput, fontSizeIndicator);
        
        fontSizeInput.addEventListener('change', function() {
            let newSize = parseInt(this.value);
            if (isNaN(newSize)) newSize = 16;
            if (newSize < 8) newSize = 8;
            if (newSize > 72) newSize = 72;
            currentFontSize = newSize;
            this.value = currentFontSize;
            applyFontSize(currentFontSize);
        });
    }

    // Função para aplicar tamanho de fonte
    function applyFontSize(size) {
        const selection = window.getSelection();
        
        // Se não tem seleção, não faz nada
        if (!selection.rangeCount || selection.isCollapsed) {
            return;
        }
        
        const range = selection.getRangeAt(0);
        const selectedContent = range.extractContents();
        
        // Criar span com o tamanho desejado
        const span = document.createElement('span');
        span.style.fontSize = size + 'px';
        span.style.lineHeight = '1.5';
        span.appendChild(selectedContent);
        
        // Inserir no lugar
        range.insertNode(span);
        
        // Selecionar o span novamente
        range.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
        
        corpoCarta.focus();
        salvarConteudoCarta();
    }

    // Função para aplicar cor
    function applyColor(color) {
        const selection = window.getSelection();
        
        if (!selection.rangeCount || selection.isCollapsed) {
            return;
        }
        
        const range = selection.getRangeAt(0);
        const selectedContent = range.extractContents();
        
        const span = document.createElement('span');
        span.style.color = color;
        span.appendChild(selectedContent);
        
        range.insertNode(span);
        range.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
        
        corpoCarta.focus();
        salvarConteudoCarta();
    }

    // Função para formatação básica (negrito, itálico, etc)
    function applyFormat(command) {
        const selection = window.getSelection();
        
        if (!selection.rangeCount || selection.isCollapsed) {
            return;
        }
        
        document.execCommand(command, false, null);
        corpoCarta.focus();
        salvarConteudoCarta();
    }

    function updateActiveButtons() {
        document.getElementById('btn-bold')?.classList.toggle('active', document.queryCommandState('bold'));
        document.getElementById('btn-italic')?.classList.toggle('active', document.queryCommandState('italic'));
        document.getElementById('btn-underline')?.classList.toggle('active', document.queryCommandState('underline'));
        document.getElementById('btn-left')?.classList.toggle('active', document.queryCommandState('justifyLeft'));
        document.getElementById('btn-center')?.classList.toggle('active', document.queryCommandState('justifyCenter'));
        document.getElementById('btn-right')?.classList.toggle('active', document.queryCommandState('justifyRight'));
        document.getElementById('btn-justify')?.classList.toggle('active', document.queryCommandState('justifyFull'));
        document.getElementById('btn-ul')?.classList.toggle('active', document.queryCommandState('insertUnorderedList'));
        document.getElementById('btn-ol')?.classList.toggle('active', document.queryCommandState('insertOrderedList'));
    }

    function initToolbar() {
        // Botões de formatação
        document.getElementById('btn-bold')?.addEventListener('click', () => applyFormat('bold'));
        document.getElementById('btn-italic')?.addEventListener('click', () => applyFormat('italic'));
        document.getElementById('btn-underline')?.addEventListener('click', () => applyFormat('underline'));
        document.getElementById('btn-left')?.addEventListener('click', () => applyFormat('justifyLeft'));
        document.getElementById('btn-center')?.addEventListener('click', () => applyFormat('justifyCenter'));
        document.getElementById('btn-right')?.addEventListener('click', () => applyFormat('justifyRight'));
        document.getElementById('btn-justify')?.addEventListener('click', () => applyFormat('justifyFull'));
        document.getElementById('btn-ul')?.addEventListener('click', () => applyFormat('insertUnorderedList'));
        document.getElementById('btn-ol')?.addEventListener('click', () => applyFormat('insertOrderedList'));
        
        // Aumentar fonte
        const fontIncrease = document.getElementById('font-increase');
        if (fontIncrease) {
            fontIncrease.addEventListener('click', () => {
                if (currentFontSize < 72) {
                    currentFontSize += 2;
                    fontSizeInput.value = currentFontSize;
                    applyFontSize(currentFontSize);
                }
            });
        }
        
        // Diminuir fonte
        const fontDecrease = document.getElementById('font-decrease');
        if (fontDecrease) {
            fontDecrease.addEventListener('click', () => {
                if (currentFontSize > 8) {
                    currentFontSize -= 2;
                    fontSizeInput.value = currentFontSize;
                    applyFontSize(currentFontSize);
                }
            });
        }
        
        // Cores
        const colorBtns = document.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                applyColor(btn.dataset.color);
            });
        });
        
        // Limpar formatação
        const clearFormatting = document.getElementById('clearFormatting');
        if (clearFormatting) {
            clearFormatting.addEventListener('click', () => {
                document.execCommand('removeFormat', false, null);
                corpoCarta.focus();
                salvarConteudoCarta();
                updateActiveButtons();
            });
        }
        
        // Atualizar estado dos botões
        corpoCarta.addEventListener('mouseup', updateActiveButtons);
        corpoCarta.addEventListener('keyup', updateActiveButtons);
        corpoCarta.addEventListener('click', updateActiveButtons);
        
        corpoCarta.style.lineHeight = '1.5';
        updateActiveButtons();
    }

    initToolbar();

    // ================== FUNÇÃO PARA GERAR IMAGEM ==================
    async function gerarImagemCarta() {
        const btnOriginalHtml = btnCompartilhar.innerHTML;
        btnCompartilhar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando imagem...';
        btnCompartilhar.disabled = true;
        
        try {
            const cartaElement = document.getElementById('carta-para-imagem');
            const cartaConteudoEl = cartaElement.querySelector('.carta-conteudo');
            
            const wasLightMode = document.body.classList.contains('light-mode');
            if (!wasLightMode) {
                document.body.classList.add('light-mode');
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const dataElement = document.createElement('div');
            dataElement.style.textAlign = 'center';
            dataElement.style.fontSize = '0.7rem';
            dataElement.style.color = '#999';
            dataElement.style.marginTop = '1.5rem';
            dataElement.style.paddingTop = '1rem';
            dataElement.style.borderTop = '1px solid #eee';
            dataElement.innerHTML = `Documento gerado em ${formatarData()}`;
            cartaConteudoEl.appendChild(dataElement);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const canvas = await html2canvas(cartaElement, {
                scale: 2.5,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: false,
                windowWidth: cartaElement.scrollWidth,
                windowHeight: cartaElement.scrollHeight
            });
            
            dataElement.remove();
            
            if (!wasLightMode) {
                document.body.classList.remove('light-mode');
            }
            
            const link = document.createElement('a');
            link.download = `carta_prompt_${new Date().getTime()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            mostrarModal('✅ Carta salva como imagem com sucesso!\nToda a carta foi capturada!');
            
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            mostrarModal('❌ Erro ao gerar imagem. Tente novamente.');
        } finally {
            btnCompartilhar.innerHTML = btnOriginalHtml;
            btnCompartilhar.disabled = false;
        }
    }

    btnCompartilhar.addEventListener('click', gerarImagemCarta);

    // Tema
    function initTema() {
        const temaSalvo = localStorage.getItem('tema_efetivo');
        const btnTema = document.getElementById('btn-tema');
        const iconTema = btnTema?.querySelector('i');
        
        if (temaSalvo === 'dark' || !temaSalvo) {
            document.body.classList.remove('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-sun');
                iconTema.classList.add('fa-moon');
            }
        } else if (temaSalvo === 'light') {
            document.body.classList.add('light-mode');
            if (iconTema) {
                iconTema.classList.remove('fa-moon');
                iconTema.classList.add('fa-sun');
            }
        }
        
        if (btnTema) {
            btnTema.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                const isLight = document.body.classList.contains('light-mode');
                localStorage.setItem('tema_efetivo', isLight ? 'light' : 'dark');
                const icon = btnTema.querySelector('i');
                if (isLight) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            });
        }
    }
    
    initTema();
});