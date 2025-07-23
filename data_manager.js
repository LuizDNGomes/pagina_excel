/**
 * Sistema de gerenciamento de dados para o Dashboard Excel
 * Permite salvar e carregar dados em formato JSON para persistência entre sessões
 */

class DataManager {
    constructor() {
        this.dataFilePath = 'dashboard_data.json';
        this.data = {
            aniversariosPessoais: [],
            aniversariosEmpresa: [],
            noticias: [],
            eventos: [],
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Salva os dados no formato JSON
     * @param {Object} dados Os dados a serem salvos
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
            
            console.log('✅ Dados salvos com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            alert('Erro ao salvar dados: ' + error.message);
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
                            console.log('✅ Dados carregados com sucesso!');
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
                console.error('❌ Erro ao carregar dados:', error);
                alert('Erro ao carregar dados: ' + error.message);
                reject(error);
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
            const nome = item.querySelector('.anniversary-name')?.textContent || '';
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
            
            this.data.aniversariosPessoais.push({ nome, depto, data });
        });
        
        // Coletar aniversários de empresa
        this.data.aniversariosEmpresa = [];
        document.querySelectorAll('.dashboard-col:nth-of-type(2) .anniversary-item').forEach(item => {
            const nome = item.querySelector('.anniversary-name')?.textContent || '';
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
            
            this.data.aniversariosEmpresa.push({ nome, anos, data });
        });
        
        // Coletar notícias
        this.data.noticias = [];
        document.querySelectorAll('.news-item').forEach(item => {
            const titulo = item.querySelector('.news-title')?.textContent || '';
            const conteudo = item.querySelector('.news-content')?.textContent || '';
            const autor = item.querySelector('.news-author')?.textContent || '';
            const data = item.querySelector('.news-date')?.textContent || '';
            
            this.data.noticias.push({ titulo, conteudo, autor, data });
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
     * Aplica os dados carregados ao DOM
     */
    aplicarDados() {
        try {
            // Limpar dados existentes
            document.querySelector('.dashboard-col:nth-of-type(1) .anniversary-list').innerHTML = '';
            document.querySelector('.dashboard-col:nth-of-type(2) .anniversary-list').innerHTML = '';
            document.querySelector('.news-container').innerHTML = '';
            
            // Aplicar aniversários pessoais
            const listaBday = document.querySelector('.dashboard-col:nth-of-type(1) .anniversary-list');
            this.data.aniversariosPessoais.forEach(pessoa => {
                const itemId = 'bday-' + Date.now() + Math.random().toString(36).substring(2, 8);
                
                // Extrair dia e mês
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
                
                let aniversarioHTML = `
                    <li class="anniversary-item" data-id="${itemId}">
                        <div class="anniversary-avatar">
                            <span class="avatar-text">${this._obterIniciais(pessoa.nome)}</span>
                        </div>
                        <div class="anniversary-info">
                            <div class="anniversary-name">${pessoa.nome}`;
                
                if (ehHoje) {
                    aniversarioHTML += `<span class="anniversary-badge"><i class="fas fa-star"></i> Hoje! <i class="fas fa-calendar-day"></i> ${pessoa.data} <i class="fas fa-star"></i></span>`;
                }
                
                aniversarioHTML += `</div>
                            <div class="anniversary-date">${dataFormatada} • ${pessoa.depto}</div>
                        </div>
                    </li>
                `;
                
                listaBday.insertAdjacentHTML('beforeend', aniversarioHTML);
            });
            
            // Aplicar aniversários de empresa
            const listaAnniv = document.querySelector('.dashboard-col:nth-of-type(2) .anniversary-list');
            this.data.aniversariosEmpresa.forEach(pessoa => {
                const itemId = 'anniv-' + Date.now() + Math.random().toString(36).substring(2, 8);
                
                // Extrair dia e mês
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
                
                let aniversarioHTML = `
                    <li class="anniversary-item" data-id="${itemId}">
                        <div class="anniversary-avatar">
                            <span class="avatar-text">${this._obterIniciais(pessoa.nome)}</span>
                        </div>
                        <div class="anniversary-info">
                            <div class="anniversary-name">${pessoa.nome}`;
                
                if (ehHoje) {
                    aniversarioHTML += `<span class="anniversary-badge"><i class="fas fa-star"></i> Hoje! <i class="fas fa-calendar-day"></i> ${pessoa.data} <i class="fas fa-star"></i></span>`;
                }
                
                aniversarioHTML += `</div>
                            <div class="anniversary-date">${anosFormatado} • ${dataFormatada}</div>
                        </div>
                    </li>
                `;
                
                listaAnniv.insertAdjacentHTML('beforeend', aniversarioHTML);
            });
            
            // Aplicar notícias
            const containerNoticias = document.querySelector('.news-container');
            this.data.noticias.forEach(noticia => {
                const itemId = 'news-' + Date.now() + Math.random().toString(36).substring(2, 8);
                
                const noticiaHTML = `
                    <div class="news-item" data-id="${itemId}">
                        <h4 class="news-title">${noticia.titulo}</h4>
                        <p class="news-content">${noticia.conteudo}</p>
                        <div class="news-footer">
                            <span class="news-author">${noticia.autor}</span>
                            <span class="news-date">${noticia.data}</span>
                        </div>
                    </div>
                `;
                
                containerNoticias.insertAdjacentHTML('afterbegin', noticiaHTML);
            });
            
            // Aplicar eventos
            if (this.data.eventos && this.data.eventos.length > 0) {
                // Salvar no localStorage
                localStorage.setItem('excelEventos', JSON.stringify(this.data.eventos));
                
                // Se houver uma função global para atualizar eventos
                if (typeof inicializarEventos === 'function') {
                    inicializarEventos();
                }
            }
            
            // Ordenar aniversários após aplicar os dados
            if (typeof ordenarAniversarios === 'function') {
                ordenarAniversarios('bday');
                ordenarAniversarios('anniv');
            }
            
            // Atualizar contagens
            if (typeof atualizarContagens === 'function') {
                atualizarContagens();
            }
            
            alert('Dados carregados com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao aplicar dados:', error);
            alert('Erro ao aplicar dados: ' + error.message);
            return false;
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
}

// Criar instância global
window.dataManager = new DataManager();
