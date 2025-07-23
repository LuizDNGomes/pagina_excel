/**
 * Sistema de gerenciamento de dados para o Dashboard Excel
 * Permite salvar e carregar dados em formato JSON para persistência entre sessões
 * Versão 2.0 - Com carregamento automático e atualizações em tempo real
 */

class DataManager {
    constructor() {
        // Configurações iniciais
        this.dataFilePath = 'dashboard_data.json';
        this.autoSaveEnabled = true;
        this.salvamentoEmAndamento = false; // Evitar salvamentos simultâneos
        this.autoSaveDebounceTimer = null;  // Para debounce do salvamento automático
        
        // Estrutura de dados padrão
        this.data = {
            aniversariosPessoais: [],
            aniversariosEmpresa: [],
            noticias: [],
            eventos: [],
            lastUpdated: new Date().toISOString()
        };
        
        // Funções auxiliares para formatação de datas
        this.formatarData = function(data) {
            if (!(data instanceof Date)) {
                if (typeof data === 'string') {
                    try {
                        data = new Date(data);
                        // Verificar se é uma data válida
                        if (isNaN(data.getTime())) {
                            return 'Data inválida';
                        }
                    } catch (e) {
                        console.error('Erro ao converter data:', e);
                        return 'Data inválida';
                    }
                } else {
                    return 'Data inválida';
                }
            }
            
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            const hora = String(data.getHours()).padStart(2, '0');
            const minuto = String(data.getMinutes()).padStart(2, '0');
            
            return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
        };
        
        // Inicialização em duas etapas (após o DOM estar pronto)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._inicializacao());
        } else {
            // Se o DOM já estiver pronto, inicializar imediatamente
            setTimeout(() => this._inicializacao(), 100);
        }
        
        console.log('✅ DataManager instanciado');
    }
    
    /**
     * Limpa texto removendo qualquer "Hoje!" e datas duplicadas
     * @private
     * @param {string} texto O texto a ser limpo
     * @return {string} Texto limpo
     */
    _limparTextoAniversario(texto) {
        if (!texto) return '';
        
        // Remover qualquer tag HTML
        texto = texto.replace(/<[^>]+>/g, '');
        
        // Remover Hoje! e qualquer conteúdo após ele
        texto = texto.replace(/Hoje!.*$/g, '');
        
        // Remover datas no formato DD/MM
        texto = texto.replace(/\d{1,2}\/\d{1,2}/g, '');
        
        // Remover emojis comuns
        texto = texto.replace(/🎂|🏆|🎉|🎊|⭐/g, '');
        
        // Remover espaços extras
        return texto.trim();
    }
    
    /**
     * Inicialização privada do gerenciador de dados
     */
    _inicializacao() {
        // 1. Primeiro tenta carregar do localStorage
        const dadosCarregados = this.carregarDoLocalStorage();
        
        // 2. Se não houver dados no localStorage, tenta carregar do JSON padrão
        if (!dadosCarregados && this.isDataEmpty()) {
            console.log('📂 Tentando carregar dados padrão do arquivo JSON...');
            this.carregarDadosPadrao();
        } else if (dadosCarregados) {
            // Aplicar dados carregados sem notificação
            this.aplicarDados(false);
        }
        
        // 3. Configurar observadores para salvamento automático
        // Pequeno timeout para garantir que a página já carregou por completo
        setTimeout(() => this.configurarAutoSave(), 1000);
        
        console.log('✅ DataManager inicializado com sucesso!');
    }
    
    // Verifica se os dados estão vazios
    isDataEmpty() {
        return (
            this.data.aniversariosPessoais.length === 0 &&
            this.data.aniversariosEmpresa.length === 0 &&
            this.data.noticias.length === 0 &&
            this.data.eventos.length === 0
        );
    }

    /**
     * Carrega dados do localStorage
     */
    carregarDoLocalStorage() {
        try {
            const dadosSalvos = localStorage.getItem('excel_dashboard_data');
            if (dadosSalvos) {
                this.data = JSON.parse(dadosSalvos);
                console.log('✅ Dados carregados do localStorage com sucesso!');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao carregar do localStorage:', error);
            return false;
        }
    }
    
    /**
     * Salva dados no localStorage
     * @param {boolean} debounce Se deve usar debounce para evitar salvamentos frequentes
     */
    salvarNoLocalStorage(debounce = false) {
        // Se estiver usando debounce, configurar um timer e retornar
        if (debounce) {
            if (this.autoSaveDebounceTimer) {
                clearTimeout(this.autoSaveDebounceTimer);
            }
            
            this.autoSaveDebounceTimer = setTimeout(() => {
                this.salvarNoLocalStorage(false);
            }, 2000); // Aguardar 2 segundos de inatividade antes de salvar
            
            return true;
        }
        
        // Se já estiver salvando, não iniciar novo salvamento
        if (this.salvamentoEmAndamento) {
            return false;
        }
        
        try {
            this.salvamentoEmAndamento = true;
            
            // Coletar dados atualizados
            this.coletarDados();
            
            // Atualizar timestamp
            this.data.lastUpdated = new Date().toISOString();
            
            // Salvar no localStorage
            localStorage.setItem('excel_dashboard_data', JSON.stringify(this.data));
            
            console.log('✅ Dados salvos no localStorage com sucesso!', new Date().toLocaleTimeString());
            
            // Atualizar exibição da última atualização se disponível
            if (typeof window.atualizarUltimaAtualizacao === 'function') {
                window.atualizarUltimaAtualizacao();
            }
            
            this.salvamentoEmAndamento = false;
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar no localStorage:', error);
            this.salvamentoEmAndamento = false;
            return false;
        }
    }
    
    /**
     * Carrega dados do arquivo JSON padrão
     */
    carregarDadosPadrao() {
        try {
            fetch(this.dataFilePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao buscar arquivo JSON padrão');
                    }
                    return response.json();
                })
                .then(dados => {
                    this.data = dados;
                    this.aplicarDados();
                    this.salvarNoLocalStorage();
                    console.log('✅ Dados carregados do JSON padrão com sucesso!');
                })
                .catch(error => {
                    console.error('❌ Erro ao carregar JSON padrão:', error);
                });
        } catch (error) {
            console.error('❌ Erro ao carregar dados padrão:', error);
        }
    }
    
    /**
     * Salva os dados no formato JSON (download do arquivo)
     */
    salvarDados() {
        try {
            // Coletar dados do DOM
            this.coletarDados();
            
            // Converter para string JSON
            const jsonData = JSON.stringify(this.data, null, 2);
            
            // Criar um Blob com os dados
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // Criar URL para download
            const url = URL.createObjectURL(blob);
            
            // Criar elemento de download
            const a = document.createElement('a');
            a.href = url;
            a.download = this.dataFilePath;
            
            // Simular clique para baixar o arquivo
            document.body.appendChild(a);
            a.click();
            
            // Limpar
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            // Também salvar no localStorage
            this.salvarNoLocalStorage();
            
            console.log('✅ Dados exportados com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            alert('Erro ao exportar dados: ' + error.message);
            return false;
        }
    }

    /**
     * Carrega dados de um arquivo JSON selecionado pelo usuário
     */
    carregarDados() {
        return new Promise((resolve, reject) => {
            try {
                // Criar input de arquivo escondido
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.json';
                fileInput.style.display = 'none';
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) {
                        reject('Nenhum arquivo selecionado');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const dados = JSON.parse(event.target.result);
                            this.data = dados;
                            this.aplicarDados();
                            // Também salvar no localStorage
                            this.salvarNoLocalStorage();
                            console.log('✅ Dados importados com sucesso!');
                            resolve(true);
                        } catch (parseError) {
                            console.error('❌ Erro ao analisar JSON:', parseError);
                            alert('O arquivo selecionado não é um JSON válido');
                            reject(parseError);
                        }
                    };
                    
                    reader.onerror = (error) => {
                        console.error('❌ Erro ao ler arquivo:', error);
                        alert('Erro ao ler o arquivo');
                        reject(error);
                    };
                    
                    reader.readAsText(file);
                });
                
                document.body.appendChild(fileInput);
                fileInput.click();
                
                // Limpar
                setTimeout(() => {
                    document.body.removeChild(fileInput);
                }, 1000);
            } catch (error) {
                console.error('❌ Erro ao importar dados:', error);
                alert('Erro ao importar dados: ' + error.message);
                reject(error);
            }
        });
    }

    /**
     * Configura observadores para salvar automaticamente quando houver mudanças
     */
    configurarAutoSave() {
        if (!this.autoSaveEnabled) return;
        
        // Observador para mutações no DOM
        const observer = new MutationObserver((mutations) => {
            let shouldSave = false;
            
            // Verificar se alguma mutação relevante ocorreu
            mutations.forEach((mutation) => {
                // Verificamos se a mutação afeta os elementos que nos interessam
                const targetClasses = ['anniversary-item', 'news-item', 'event-item'];
                
                if (mutation.type === 'childList') {
                    // Se elementos foram adicionados ou removidos
                    const relevantAddedNodes = Array.from(mutation.addedNodes).some(node => 
                        node.nodeType === 1 && targetClasses.some(cls => node.classList?.contains(cls))
                    );
                    
                    const relevantRemovedNodes = Array.from(mutation.removedNodes).some(node => 
                        node.nodeType === 1 && targetClasses.some(cls => node.classList?.contains(cls))
                    );
                    
                    if (relevantAddedNodes || relevantRemovedNodes) {
                        shouldSave = true;
                    }
                } else if (mutation.type === 'attributes' && targetClasses.some(cls => mutation.target.classList?.contains(cls))) {
                    // Se atributos de elementos relevantes foram modificados
                    shouldSave = true;
                }
            });
            
            // Se identificamos mudanças relevantes, salvamos com debounce
            if (shouldSave) {
                console.log('🔄 Mudanças detectadas, agendando salvamento automático...');
                this.salvarNoLocalStorage(true); // Com debounce para evitar salvamentos excessivos
                
                // Mostrar feedback visual ao usuário
                this._mostrarFeedbackSalvamento();
            }
        });
        
        // Configurar o observador para monitorar todo o documento
        observer.observe(document.body, {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        });
        
        console.log('✅ AutoSave configurado com sucesso!');
        
        // Também monitorar eventos específicos para salvar dados
        const saveEvents = ['saveBdayBtn', 'saveAnnivBtn', 'saveNewsBtn', 'saveEventBtn',
                          'clearBdayBtn', 'clearAnnivBtn', 'clearNewsBtn', 'clearEventBtn'];
        
        saveEvents.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', () => {
                    // Pequeno atraso para garantir que as alterações do DOM foram concluídas
                    setTimeout(() => {
                        // Coletar dados do painel, salvar e atualizar interface
                        this.coletarDadosDoAdminPainel();
                        this.salvarNoLocalStorage();
                        this.aplicarDados(false);
                    }, 300);
                });
            }
        });
        
        // Monitorar eventos de formulários de administração
        const adminForms = document.querySelectorAll('form');
        adminForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                // Pequeno atraso para garantir que as alterações do DOM foram concluídas
                setTimeout(() => this.salvarNoLocalStorage(), 500);
            });
        });
        
        // Monitorar botões de adição e remoção
        const actionButtons = document.querySelectorAll('button[id$="Btn"]');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Pequeno atraso para garantir que as alterações do DOM foram concluídas
                setTimeout(() => this.salvarNoLocalStorage(), 500);
            });
        });
        
        // Monitorar eventos de localStorage para manter sincronizado entre abas
        window.addEventListener('storage', (e) => {
            if (e.key === 'excel_dashboard_data') {
                console.log('🔄 Dados atualizados em outra aba, recarregando...');
                this.data = JSON.parse(e.newValue);
                this.aplicarDados(false); // Não notificar para evitar loops
            }
        });
    }
    
    /**
     * Coleta todos os dados do DOM para salvar
     */
    coletarDados() {
        this.data.lastUpdated = new Date().toISOString();
        
        // Coletar aniversários pessoais
        this.data.aniversariosPessoais = [];
        document.querySelectorAll('.dashboard-col:nth-of-type(1) .anniversary-item').forEach(item => {
            // Limpar completamente o nome de qualquer badge, texto "Hoje!" ou datas
            let nome = item.querySelector('.anniversary-name')?.textContent || '';
            nome = nome.replace(/<span class="anniversary-badge">.*?<\/span>/g, '');
            nome = nome.replace(/🎂.*$/g, '').trim();
            nome = nome.replace(/Hoje!.*$/g, '').trim();
            nome = nome.replace(/\d{2}\/\d{2}/g, '').trim();
            
            const dataInfo = item.querySelector('.anniversary-date')?.textContent || '';
            
            // Extrair departamento
            const depto = dataInfo.split('•')[1]?.trim() || '';
            
            // Extrair data no formato DD/MM
            let data = '';
            const dataMatch = dataInfo.match(/(\d{1,2}) de ([^\s•]+)/);
            if (dataMatch) {
                const dia = dataMatch[1];
                const mesTexto = dataMatch[2];
                const meses = {
                    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
                    'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
                    'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
                };
                const mes = meses[mesTexto.toLowerCase()];
                if (mes) {
                    data = `${dia.padStart(2, '0')}/${mes}`;
                }
            }
            
            // Se não encontrou pelo padrão textual, tenta pelo badge
            if (!data) {
                const badge = item.querySelector('.anniversary-badge');
                if (badge) {
                    const badgeText = badge.textContent;
                    // Usar expressão regular para encontrar apenas os dígitos da data no formato DD/MM
                    const badgeMatch = badgeText.match(/(\d{2})\/(\d{2})/);
                    if (badgeMatch) {
                        data = `${badgeMatch[1]}/${badgeMatch[2]}`;
                    }
                }
            }
            
            this.data.aniversariosPessoais.push({ nome, depto, data });
        });
        
        // Coletar aniversários de empresa
        this.data.aniversariosEmpresa = [];
        document.querySelectorAll('.dashboard-col:nth-of-type(2) .anniversary-item').forEach(item => {
            // Limpar completamente o nome de qualquer badge, texto "Hoje!" ou datas
            let nome = item.querySelector('.anniversary-name')?.textContent || '';
            nome = nome.replace(/<span class="anniversary-badge">.*?<\/span>/g, '');
            nome = nome.replace(/🏆.*$/g, '').trim();
            nome = nome.replace(/Hoje!.*$/g, '').trim();
            nome = nome.replace(/\d{2}\/\d{2}/g, '').trim();
            
            const dataInfo = item.querySelector('.anniversary-date')?.textContent || '';
            
            // Extrair anos
            let anos = '';
            const anosMatch = dataInfo.match(/(\d+) anos?/);
            if (anosMatch) {
                anos = anosMatch[1];
            }
            
            // Extrair data
            let data = '';
            const dataMatch = dataInfo.match(/(\d{1,2}) de ([^\s•]+)/);
            if (dataMatch) {
                const dia = dataMatch[1];
                const mesTexto = dataMatch[2];
                const meses = {
                    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
                    'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
                    'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
                };
                const mes = meses[mesTexto.toLowerCase()];
                if (mes) {
                    data = `${dia.padStart(2, '0')}/${mes}`;
                }
            }
            
            // Se não encontrou pelo padrão textual, tenta pelo badge
            if (!data) {
                const badge = item.querySelector('.anniversary-badge');
                if (badge) {
                    const badgeText = badge.textContent;
                    // Usar expressão regular para encontrar apenas os dígitos da data no formato DD/MM
                    const badgeMatch = badgeText.match(/(\d{2})\/(\d{2})/);
                    if (badgeMatch) {
                        data = `${badgeMatch[1]}/${badgeMatch[2]}`;
                    }
                }
            }
            
            this.data.aniversariosEmpresa.push({ nome, anos, data });
        });
        
        // Coletar notícias
        this.data.noticias = [];
        document.querySelectorAll('.news-item').forEach(item => {
            const titulo = item.querySelector('.news-title')?.textContent || '';
            const conteudo = item.querySelector('.news-excerpt')?.textContent || '';
            const autor = item.querySelector('.news-author')?.textContent.replace(/^.*?\s/, '') || '';
            const data = item.querySelector('.news-date')?.textContent.replace(/^.*?\s/, '') || '';
            const prioridade = item.classList.contains('high-priority') ? 'alta' : 'normal';
            
            this.data.noticias.push({ titulo, conteudo, autor, data, prioridade });
        });
        
        // Coletar eventos (se disponível no localStorage)
        const eventosArmazenados = localStorage.getItem('excelEventos');
        if (eventosArmazenados) {
            try {
                this.data.eventos = JSON.parse(eventosArmazenados);
            } catch (e) {
                console.error('Erro ao analisar eventos do localStorage:', e);
                this.data.eventos = [];
            }
        }
    }

    /**
     * Limpa dados armazenados para remover qualquer "Hoje!" duplicado
     * @private
     */
    _limparDadosArmazenados() {
        // Limpar aniversários pessoais
        if (this.data.aniversariosPessoais) {
            this.data.aniversariosPessoais.forEach(pessoa => {
                if (pessoa.nome) {
                    pessoa.nome = this._limparTextoAniversario(pessoa.nome);
                }
                if (pessoa.data) {
                    // Preservar apenas o formato DD/MM
                    const match = pessoa.data.match(/(\d{2})\/(\d{2})/);
                    if (match) {
                        pessoa.data = `${match[1]}/${match[2]}`;
                    } else {
                        pessoa.data = pessoa.data.replace(/Hoje!.*$/g, '').trim();
                    }
                }
            });
        }
        
        // Limpar aniversários de empresa
        if (this.data.aniversariosEmpresa) {
            this.data.aniversariosEmpresa.forEach(pessoa => {
                if (pessoa.nome) {
                    pessoa.nome = this._limparTextoAniversario(pessoa.nome);
                }
                if (pessoa.data) {
                    // Preservar apenas o formato DD/MM
                    const match = pessoa.data.match(/(\d{2})\/(\d{2})/);
                    if (match) {
                        pessoa.data = `${match[1]}/${match[2]}`;
                    } else {
                        pessoa.data = pessoa.data.replace(/Hoje!.*$/g, '').trim();
                    }
                }
            });
        }
    }
    
    /**
     * Aplica os dados carregados ao DOM
     * @param {boolean} notificar Se deve exibir notificação de sucesso
     */
    aplicarDados(notificar = true) {
        // Primeiro, limpar quaisquer dados com "Hoje!" duplicado
        this._limparDadosArmazenados();
        
        // Atualizar os dados no painel de administração também
        this._atualizarPainelAdministracao();
        
        try {
            // Verificar se os elementos necessários existem
            const listaBdayEl = document.querySelector('.dashboard-col:nth-of-type(1) .anniversary-list');
            const listaAnnivEl = document.querySelector('.dashboard-col:nth-of-type(2) .anniversary-list');
            const containerNoticiasEl = document.querySelector('.news-container');
            
            if (!listaBdayEl || !listaAnnivEl || !containerNoticiasEl) {
                console.error('Elementos necessários não encontrados no DOM');
                return false;
            }
            
            // Limpar dados existentes
            listaBdayEl.innerHTML = '';
            listaAnnivEl.innerHTML = '';
            containerNoticiasEl.innerHTML = '';
            
            // Aplicar aniversários pessoais
            this.data.aniversariosPessoais.forEach(pessoa => {
                const itemId = 'bday-' + Date.now() + Math.random().toString(36).substring(2, 8);
                
                // Limpar completamente a pessoa.data de qualquer texto "Hoje!"
                if (pessoa.data) {
                    pessoa.data = pessoa.data.replace(/Hoje!.*$/g, '').trim();
                }
                
                // Extrair dia e mês de dados limpos
                let dia = '', mes = '';
                if (pessoa.data) {
                    const partes = pessoa.data.split('/');
                    if (partes.length === 2) {
                        dia = partes[0];
                        mes = partes[1];
                    }
                }
                
                // Verificar se é hoje
                const hoje = new Date();
                const ehHoje = (dia === String(hoje.getDate()).padStart(2, '0')) && 
                              (mes === String(hoje.getMonth() + 1).padStart(2, '0'));
                
                // Nomes dos meses
                const mesesNomes = [
                    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
                ];
                
                // Formatação da data
                const mesTexto = mesesNomes[parseInt(mes) - 1] || '';
                const dataFormatada = dia && mesTexto ? `${dia} de ${mesTexto}` : '';
                
                // Limpar completamente o nome usando nosso método auxiliar
                const nomeLimpo = this._limparTextoAniversario(pessoa.nome);
                
                let aniversarioHTML = `
                    <li class="anniversary-item" data-id="${itemId}">
                        <div class="anniversary-avatar">
                            <span class="avatar-text">${this._obterIniciais(nomeLimpo)}</span>
                        </div>
                        <div class="anniversary-info">
                            <div class="anniversary-name">${nomeLimpo}`;
                
                if (ehHoje) {
                    aniversarioHTML += `<span class="anniversary-badge"><i class="fas fa-star"></i> Hoje! <i class="fas fa-calendar-day"></i> ${dia}/${mes}</span>`;
                }
                
                aniversarioHTML += `</div>
                            <div class="anniversary-date">${dataFormatada} • ${pessoa.depto}</div>
                        </div>
                    </li>
                `;
                
                listaBdayEl.insertAdjacentHTML('beforeend', aniversarioHTML);
            });
            
            // Aplicar aniversários de empresa
            this.data.aniversariosEmpresa.forEach(pessoa => {
                const itemId = 'anniv-' + Date.now() + Math.random().toString(36).substring(2, 8);
                
                // Limpar completamente a pessoa.data de qualquer texto "Hoje!"
                if (pessoa.data) {
                    pessoa.data = pessoa.data.replace(/Hoje!.*$/g, '').trim();
                }
                
                // Extrair dia e mês de dados limpos
                let dia = '', mes = '';
                if (pessoa.data) {
                    const partes = pessoa.data.split('/');
                    if (partes.length === 2) {
                        dia = partes[0];
                        mes = partes[1];
                    }
                }
                
                // Verificar se é hoje
                const hoje = new Date();
                const ehHoje = (dia === String(hoje.getDate()).padStart(2, '0')) && 
                              (mes === String(hoje.getMonth() + 1).padStart(2, '0'));
                
                // Nomes dos meses
                const mesesNomes = [
                    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
                ];
                
                // Formatação da data
                const mesTexto = mesesNomes[parseInt(mes) - 1] || '';
                const dataFormatada = dia && mesTexto ? `${dia} de ${mesTexto}` : '';
                const anosFormatado = pessoa.anos == 1 ? '1 ano' : `${pessoa.anos} anos`;
                
                // Limpar completamente o nome usando nosso método auxiliar
                const nomeLimpo = this._limparTextoAniversario(pessoa.nome);
                
                let aniversarioHTML = `
                    <li class="anniversary-item" data-id="${itemId}">
                        <div class="anniversary-avatar">
                            <span class="avatar-text">${this._obterIniciais(nomeLimpo)}</span>
                        </div>
                        <div class="anniversary-info">
                            <div class="anniversary-name">${nomeLimpo}`;
                
                if (ehHoje) {
                    aniversarioHTML += `<span class="anniversary-badge"><i class="fas fa-star"></i> Hoje! <i class="fas fa-calendar-day"></i> ${dia}/${mes}</span>`;
                }
                
                aniversarioHTML += `</div>
                            <div class="anniversary-date">${anosFormatado} • ${dataFormatada}</div>
                        </div>
                    </li>
                `;
                
                listaAnnivEl.insertAdjacentHTML('beforeend', aniversarioHTML);
            });
            
            // Aplicar notícias
            this.data.noticias.forEach(noticia => {
                const itemId = 'news-' + Date.now() + Math.random().toString(36).substring(2, 8);
                
                // Verificar se é uma notícia de alta prioridade
                const ehPrioridade = noticia.prioridade === 'alta';
                
                const noticiaHTML = `
                    <div class="news-item${ehPrioridade ? ' high-priority' : ''}" data-id="${itemId}">
                        <div class="news-content">
                            <h3 class="news-title">${noticia.titulo}</h3>
                            <p class="news-excerpt">${noticia.conteudo}</p>
                            <div class="news-meta">
                                <div class="news-date">
                                    <i class="fas fa-calendar-alt"></i> ${noticia.data}
                                </div>
                                <div class="news-author">
                                    <i class="fas fa-user-edit"></i> ${noticia.autor}
                                </div>
                                ${ehPrioridade ? '<div class="news-priority"><i class="fas fa-exclamation-circle"></i> Prioridade Alta</div>' : ''}
                            </div>
                        </div>
                    </div>
                `;
                
                containerNoticiasEl.insertAdjacentHTML('afterbegin', noticiaHTML);
            });
            
            // Aplicar eventos
            if (this.data.eventos && this.data.eventos.length > 0) {
                // Salvar no localStorage
                localStorage.setItem('excelEventos', JSON.stringify(this.data.eventos));
                
                // Se houver uma função global para atualizar eventos
                if (typeof window.inicializarEventos === 'function') {
                    window.inicializarEventos();
                }
            }
            
            // Ordenar aniversários após aplicar os dados
            if (typeof window.ordenarAniversarios === 'function') {
                window.ordenarAniversarios('bday');
                window.ordenarAniversarios('anniv');
            }
            
            // Atualizar contagens
            if (typeof window.atualizarContagens === 'function') {
                window.atualizarContagens();
            }
            
            if (notificar) {
                alert('Dados carregados com sucesso!');
            } else {
                console.log('✅ Dados aplicados sem notificação');
            }
            return true;
        } catch (error) {
            console.error('❌ Erro ao aplicar dados:', error);
            if (notificar) {
                alert('Erro ao aplicar dados: ' + error.message);
            }
            return false;
        }
    }
    
    /**
     * Atualiza os dados no painel de administração
     * @private
     */
    _atualizarPainelAdministracao() {
        try {
            // Atualizar aniversários pessoais no painel admin
            const adminBdayList = document.getElementById('adminBdayList');
            if (adminBdayList) {
                adminBdayList.innerHTML = '';
                
                this.data.aniversariosPessoais.forEach(pessoa => {
                    const itemHTML = `
                        <div class="admin-list-item" data-name="${pessoa.nome}" data-dept="${pessoa.depto}" data-date="${pessoa.data}">
                            <div class="admin-list-item-content">
                                <div><strong>${pessoa.nome}</strong></div>
                                <div>${pessoa.depto} • ${pessoa.data}</div>
                            </div>
                            <div class="admin-list-item-actions">
                                <input type="checkbox" title="Selecionar para remoção">
                            </div>
                        </div>
                    `;
                    adminBdayList.insertAdjacentHTML('beforeend', itemHTML);
                });
            }
            
            // Atualizar aniversários de empresa no painel admin
            const adminAnnivList = document.getElementById('adminAnnivList');
            if (adminAnnivList) {
                adminAnnivList.innerHTML = '';
                
                this.data.aniversariosEmpresa.forEach(pessoa => {
                    const itemHTML = `
                        <div class="admin-list-item" data-name="${pessoa.nome}" data-years="${pessoa.anos}" data-date="${pessoa.data}">
                            <div class="admin-list-item-content">
                                <div><strong>${pessoa.nome}</strong></div>
                                <div>${pessoa.anos} anos • ${pessoa.data}</div>
                            </div>
                            <div class="admin-list-item-actions">
                                <input type="checkbox" title="Selecionar para remoção">
                            </div>
                        </div>
                    `;
                    adminAnnivList.insertAdjacentHTML('beforeend', itemHTML);
                });
            }
            
            // Atualizar notícias no painel admin
            const adminNewsList = document.getElementById('adminNewsList');
            if (adminNewsList) {
                adminNewsList.innerHTML = '';
                
                this.data.noticias.forEach(noticia => {
                    const itemHTML = `
                        <div class="admin-list-item" data-title="${noticia.titulo}" data-content="${noticia.conteudo}" data-author="${noticia.autor}" data-date="${noticia.data}" data-priority="${noticia.prioridade}">
                            <div class="admin-list-item-content">
                                <div><strong>${noticia.titulo}</strong></div>
                                <div>Por: ${noticia.autor} • ${noticia.data} • Prioridade: ${noticia.prioridade}</div>
                            </div>
                            <div class="admin-list-item-actions">
                                <input type="checkbox" title="Selecionar para remoção">
                            </div>
                        </div>
                    `;
                    adminNewsList.insertAdjacentHTML('beforeend', itemHTML);
                });
            }
            
            // Atualizar eventos no painel admin
            const adminEventList = document.getElementById('adminEventList');
            if (adminEventList) {
                adminEventList.innerHTML = '';
                
                this.data.eventos.forEach(evento => {
                    const dataEvento = new Date(evento.data);
                    const dataFormatada = dataEvento.toLocaleDateString('pt-BR') + ' ' + dataEvento.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
                    
                    const itemHTML = `
                        <div class="admin-list-item" data-name="${evento.nome}" data-description="${evento.descricao}" data-location="${evento.local}" data-date="${evento.data}">
                            <div class="admin-list-item-content">
                                <div><strong>${evento.nome}</strong></div>
                                <div>${dataFormatada} • ${evento.local}</div>
                            </div>
                            <div class="admin-list-item-actions">
                                <input type="checkbox" title="Selecionar para remoção">
                            </div>
                        </div>
                    `;
                    adminEventList.insertAdjacentHTML('beforeend', itemHTML);
                });
            }
            
            // Atualizar timestamp no painel admin
            const ultimaAtualizacao = document.getElementById('ultimaAtualizacao');
            if (ultimaAtualizacao && this.data.lastUpdated) {
                ultimaAtualizacao.textContent = this.formatarData(new Date(this.data.lastUpdated));
            }
            
            console.log('✅ Painel de administração atualizado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao atualizar painel de administração:', error);
        }
    }

    /**
     * Obtém as iniciais de um nome
     */
    _obterIniciais(nome) {
        if (!nome) return '';
        return nome.split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
    }
    
    /**
     * Mostra um feedback visual temporário de salvamento automático
     * @private
     */
    _mostrarFeedbackSalvamento() {
        // Verificar se já existe o elemento de feedback
        let feedbackEl = document.getElementById('autoSaveFeedback');
        
        if (!feedbackEl) {
            // Criar o elemento de feedback
            feedbackEl = document.createElement('div');
            feedbackEl.id = 'autoSaveFeedback';
            feedbackEl.style.position = 'fixed';
            feedbackEl.style.bottom = '20px';
            feedbackEl.style.right = '20px';
            feedbackEl.style.backgroundColor = 'rgba(1, 98, 126, 0.9)';
            feedbackEl.style.color = 'white';
            feedbackEl.style.padding = '8px 15px';
            feedbackEl.style.borderRadius = '4px';
            feedbackEl.style.fontSize = '14px';
            feedbackEl.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
            feedbackEl.style.zIndex = '9999';
            feedbackEl.style.display = 'flex';
            feedbackEl.style.alignItems = 'center';
            feedbackEl.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
            feedbackEl.style.opacity = '0';
            feedbackEl.style.transform = 'translateY(20px)';
            
            // Adicionar ícone
            feedbackEl.innerHTML = '<i class="fas fa-save" style="margin-right: 8px;"></i> Salvando alterações...';
            
            // Adicionar ao corpo do documento
            document.body.appendChild(feedbackEl);
        } else {
            // Atualizar o texto
            feedbackEl.innerHTML = '<i class="fas fa-save" style="margin-right: 8px;"></i> Salvando alterações...';
        }
        
        // Mostrar o feedback
        setTimeout(() => {
            feedbackEl.style.opacity = '1';
            feedbackEl.style.transform = 'translateY(0)';
        }, 10);
        
        // Ocultar após alguns segundos
        setTimeout(() => {
            feedbackEl.style.opacity = '0';
            feedbackEl.style.transform = 'translateY(20px)';
            
            // Atualizar texto quando terminar
            setTimeout(() => {
                if (feedbackEl) {
                    feedbackEl.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 8px;"></i> Alterações salvas!';
                    feedbackEl.style.opacity = '1';
                    feedbackEl.style.transform = 'translateY(0)';
                    
                    setTimeout(() => {
                        feedbackEl.style.opacity = '0';
                        feedbackEl.style.transform = 'translateY(20px)';
                    }, 1500);
                }
            }, 300);
        }, 2000);
    }
    
    /**
     * Método específico para atualizar a interface a partir do painel de administração
     * Coleta dados do painel, salva e atualiza a interface
     * @returns {boolean} Sucesso da operação
     */
    atualizarDoAdminPainel() {
        try {
            console.log('📊 Iniciando atualização da interface a partir do painel de administração');
            
            // Coletar dados do painel de administração
            this.coletarDadosDoAdminPainel();
            
            // Salvar no localStorage
            this.salvarNoLocalStorage();
            
            // Aplicar os dados atualizados na interface
            this.aplicarDados(false);
            
            // Mostrar feedback visual
            const feedbackEl = document.createElement('div');
            feedbackEl.style.position = 'fixed';
            feedbackEl.style.top = '50%';
            feedbackEl.style.left = '50%';
            feedbackEl.style.transform = 'translate(-50%, -50%)';
            feedbackEl.style.backgroundColor = '#4CAF50';
            feedbackEl.style.color = 'white';
            feedbackEl.style.padding = '20px 30px';
            feedbackEl.style.borderRadius = '8px';
            feedbackEl.style.fontSize = '18px';
            feedbackEl.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            feedbackEl.style.zIndex = '10000';
            feedbackEl.style.textAlign = 'center';
            feedbackEl.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 10px; font-size: 24px;"></i>Interface atualizada com sucesso!';
            
            document.body.appendChild(feedbackEl);
            
            setTimeout(() => {
                feedbackEl.style.opacity = '0';
                feedbackEl.style.transition = 'opacity 0.5s ease';
                setTimeout(() => document.body.removeChild(feedbackEl), 500);
            }, 2000);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar da interface admin:', error);
            alert('Erro ao atualizar interface: ' + error.message);
            return false;
        }
    }
    
    /**
     * Coleta dados diretamente dos campos de entrada do painel de administração
     * Esta função pega os dados de todos os campos de administração e atualiza o objeto data
     */
    coletarDadosDoAdminPainel() {
        // Aniversários Pessoais
        const adminBdayList = document.getElementById('adminBdayList');
        if (adminBdayList) {
            this.data.aniversariosPessoais = [];
            
            // Coletar de cada item na lista admin que NÃO está marcado para remoção
            adminBdayList.querySelectorAll('.admin-list-item').forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (!checkbox || !checkbox.checked) {
                    const nome = item.getAttribute('data-name');
                    const depto = item.getAttribute('data-dept');
                    const data = item.getAttribute('data-date');
                    
                    this.data.aniversariosPessoais.push({ nome, depto, data });
                }
            });
            
            // Verificar se há um novo item para adicionar
            const adminBdayName = document.getElementById('adminBdayName');
            const adminBdayDept = document.getElementById('adminBdayDept');
            const adminBdayDate = document.getElementById('adminBdayDate');
            
            if (adminBdayName && adminBdayName.value && adminBdayDate && adminBdayDate.value) {
                const nome = adminBdayName.value;
                const depto = adminBdayDept ? adminBdayDept.value : '';
                
                // Converter data do formato YYYY-MM-DD para DD/MM
                const dataObj = new Date(adminBdayDate.value);
                const dia = String(dataObj.getDate()).padStart(2, '0');
                const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
                const data = `${dia}/${mes}`;
                
                this.data.aniversariosPessoais.push({ nome, depto, data });
                
                // Limpar campos
                adminBdayName.value = '';
                if (adminBdayDept) adminBdayDept.value = '';
                adminBdayDate.value = '';
            }
        }
        
            // Aniversários de Empresa
        const adminAnnivList = document.getElementById('adminAnnivList');
        if (adminAnnivList) {
            this.data.aniversariosEmpresa = [];
            
            // Coletar de cada item na lista admin que NÃO está marcado para remoção
            adminAnnivList.querySelectorAll('.admin-list-item').forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (!checkbox || !checkbox.checked) {
                    const nome = item.getAttribute('data-name');
                    const anos = item.getAttribute('data-years');
                    const data = item.getAttribute('data-date');
                    
                    this.data.aniversariosEmpresa.push({ nome, anos: parseInt(anos), data });
                }
            });            // Verificar se há um novo item para adicionar
            const adminAnnivName = document.getElementById('adminAnnivName');
            const adminAnnivYears = document.getElementById('adminAnnivYears');
            const adminAnnivDate = document.getElementById('adminAnnivDate');
            
            if (adminAnnivName && adminAnnivName.value && adminAnnivDate && adminAnnivDate.value) {
                const nome = adminAnnivName.value;
                const anos = adminAnnivYears && adminAnnivYears.value ? parseInt(adminAnnivYears.value) : 1;
                
                // Converter data do formato YYYY-MM-DD para DD/MM
                const dataObj = new Date(adminAnnivDate.value);
                const dia = String(dataObj.getDate()).padStart(2, '0');
                const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
                const data = `${dia}/${mes}`;
                
                this.data.aniversariosEmpresa.push({ nome, anos, data });
                
                // Limpar campos
                adminAnnivName.value = '';
                if (adminAnnivYears) adminAnnivYears.value = '';
                adminAnnivDate.value = '';
            }
        }
        
        // Notícias
        const adminNewsList = document.getElementById('adminNewsList');
        if (adminNewsList) {
            this.data.noticias = [];
            
            // Coletar de cada item na lista admin que NÃO está marcado para remoção
            adminNewsList.querySelectorAll('.admin-list-item').forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (!checkbox || !checkbox.checked) {
                    const titulo = item.getAttribute('data-title');
                    const conteudo = item.getAttribute('data-content');
                    const autor = item.getAttribute('data-author');
                    const data = item.getAttribute('data-date');
                    const prioridade = item.getAttribute('data-priority');
                    
                    this.data.noticias.push({ titulo, conteudo, autor, data, prioridade });
                }
            });
            
            // Verificar se há um novo item para adicionar
            const adminNewsTitle = document.getElementById('adminNewsTitle');
            const adminNewsContent = document.getElementById('adminNewsContent');
            const adminNewsAuthor = document.getElementById('adminNewsAuthor');
            const adminNewsPriority = document.getElementById('adminNewsPriority');
            
            if (adminNewsTitle && adminNewsTitle.value && adminNewsContent && adminNewsContent.value) {
                const titulo = adminNewsTitle.value;
                const conteudo = adminNewsContent.value;
                const autor = adminNewsAuthor ? adminNewsAuthor.value : '';
                const dataAtual = new Date();
                const dia = String(dataAtual.getDate()).padStart(2, '0');
                const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
                const ano = dataAtual.getFullYear();
                const data = `${dia}/${mes}/${ano}`;
                const prioridade = adminNewsPriority && adminNewsPriority.value ? adminNewsPriority.value : 'normal';
                
                this.data.noticias.push({ titulo, conteudo, autor, data, prioridade });
                
                // Limpar campos
                adminNewsTitle.value = '';
                adminNewsContent.value = '';
                if (adminNewsAuthor) adminNewsAuthor.value = '';
                if (adminNewsPriority) adminNewsPriority.value = 'normal';
            }
        }
        
        // Eventos
        const adminEventList = document.getElementById('adminEventList');
        if (adminEventList) {
            this.data.eventos = [];
            
            // Coletar de cada item na lista admin que NÃO está marcado para remoção
            adminEventList.querySelectorAll('.admin-list-item').forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (!checkbox || !checkbox.checked) {
                    const nome = item.getAttribute('data-name');
                    const descricao = item.getAttribute('data-description');
                    const local = item.getAttribute('data-location');
                    const data = item.getAttribute('data-date');
                    
                    this.data.eventos.push({ nome, descricao, local, data });
                }
            });
            
            // Verificar se há um novo item para adicionar
            const adminEventName = document.getElementById('adminEventName');
            const adminEventDateTime = document.getElementById('adminEventDateTime');
            const adminEventDescription = document.getElementById('adminEventDescription');
            const adminEventLocation = document.getElementById('adminEventLocation');
            
            if (adminEventName && adminEventName.value && adminEventDateTime && adminEventDateTime.value) {
                const nome = adminEventName.value;
                const data = adminEventDateTime.value; // Já está no formato ISO
                const descricao = adminEventDescription ? adminEventDescription.value : '';
                const local = adminEventLocation ? adminEventLocation.value : '';
                
                this.data.eventos.push({ nome, descricao, local, data });
                
                // Limpar campos
                adminEventName.value = '';
                adminEventDateTime.value = '';
                if (adminEventDescription) adminEventDescription.value = '';
                if (adminEventLocation) adminEventLocation.value = '';
            }
        }
        
        // Atualizar timestamp
        this.data.lastUpdated = new Date().toISOString();
    }
}

// Criar instância global
window.dataManager = new DataManager();
