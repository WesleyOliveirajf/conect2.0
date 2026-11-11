# CONECT

**Sistema de Gestão de Funcionários e Comunicados**

CONECT é uma aplicação web moderna que centraliza informações de funcionários, comunicados internos e facilita a gestão empresarial.

## 🚀 Funcionalidades

- **🤖 Chatbot Inteligente**: Assistente IA com Groq para consultas sobre funcionários
- **🔍 RAG (Retrieval-Augmented Generation)**: Busca inteligente em dados internos
- **👥 Diretório de Funcionários**: Visualize informações de contato, departamentos e horários de almoço
- **📢 Comunicados**: Sistema de anúncios e comunicações internas
- **💬 Integração com Microsoft Teams**: Acesso direto às conversas do Teams
- **📱 Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **🔎 Busca Avançada**: Filtre funcionários por departamento, nome ou outras informações
- **📲 PWA (Progressive Web App)**: Instalável como aplicativo nativo
- **🔄 Funcionamento Offline**: Cache inteligente com Service Worker
- **🔔 Notificações Push**: Receba atualizações importantes (em desenvolvimento)

## 🛠️ Tecnologias Utilizadas

- **Vite** - Build tool e servidor de desenvolvimento
- **TypeScript** - Linguagem de programação
- **React** - Biblioteca para interface de usuário
- **shadcn/ui** - Componentes de UI
- **Tailwind CSS** - Framework de CSS
- **Lucide React** - Ícones
- **Service Worker** - Cache e funcionamento offline
- **Web App Manifest** - Configuração PWA

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## 🚀 Como executar o projeto

### ⚡ Setup Automático (Recomendado)

1. **Clone o repositório**
   ```bash
   git clone https://github.com/WesleyOliveirajf/connect1.1.git
   cd connect1.1
   ```

2. **Execute o setup automático**
   ```powershell
   # No Windows (PowerShell)
   .\setup.ps1
   ```
   
   O script irá:
   - ✅ Verificar dependências
   - ✅ Instalar pacotes npm
   - ✅ Configurar arquivo .env automaticamente
   - ✅ Verificar chave Groq (já configurada)

3. **Inicie o servidor**
   ```bash
   npm run dev
   ```

### 🔧 Setup Manual

1. **Clone o repositório**
   ```bash
   git clone https://github.com/WesleyOliveirajf/connect1.1.git
   cd connect1.1
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o ambiente**
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env
   ```
   
   > **Nota**: A chave da Groq já está configurada no .env.example

4. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação**
   - Abra seu navegador e acesse `http://localhost:8080`

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run build:dev` - Gera a build de desenvolvimento
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter

## 🚀 Deploy no GitHub Pages

Este projeto está configurado para deploy automático no GitHub Pages usando GitHub Actions.

### Configuração Automática

O deploy acontece automaticamente quando você faz push para a branch `main`. O workflow está configurado em `.github/workflows/deploy.yml`.

### Passos para Deploy Manual

1. **Faça o push do código para o GitHub**
   ```bash
   git add .
   git commit -m "Deploy inicial"
   git push origin main
   ```

2. **Ative o GitHub Pages**
   - Vá para as configurações do repositório no GitHub
   - Na seção "Pages", selecione "GitHub Actions" como source
   - O deploy será executado automaticamente

3. **Acesse a aplicação**
   - A aplicação estará disponível em: `https://wesleyoliveirajf.github.io/connect1.1/`

### Configurações Importantes

- O `vite.config.ts` está configurado para usar o base path correto (`/connect1.1/`)
- O workflow de deploy está em `.github/workflows/deploy.yml`
- As configurações de segurança estão no `vercel.json`

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── ui/             # Componentes de UI (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   ├── tooltip.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── sonner.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── use-toast.ts
│   ├── AdminPanel.tsx          # Painel administrativo
│   ├── AdvancedSearch.tsx      # Busca avançada de funcionários
│   ├── AnnouncementManager.tsx # Gerenciador de comunicados
│   ├── AnnouncementManagerSimple.tsx
│   ├── EmployeeDirectory.tsx   # Diretório de funcionários
│   ├── EmployeeForm.tsx        # Formulário de funcionários
│   ├── EmployeeManager.tsx     # Gerenciador de funcionários
│   ├── ErrorBoundary.tsx       # Tratamento de erros
│   ├── Header.tsx              # Cabeçalho da aplicação
│   ├── InstallPrompt.tsx       # Prompt de instalação PWA
│   ├── LunchHours.tsx          # Horários de almoço
│   ├── SupportCard.tsx         # Acesso ao suporte de TI
│   ├── ThemeProvider.tsx       # Provedor de tema
│   └── ThemeToggle.tsx         # Alternador de tema
├── hooks/
│   ├── useAnnouncements.ts     # Hook para comunicados
│   ├── useCurrentTime.ts       # Hook para tempo atual
│   ├── useDebounce.ts          # Hook para debounce
│   ├── useEmployeeManager.ts   # Hook para gerenciar funcionários
│   ├── useEmployeeSearch.ts    # Hook para busca de funcionários
│   ├── usePWA.ts               # Hook para funcionalidades PWA
│   ├── useStaggerAnimation.ts  # Hook para animações
│   └── use-toast.ts            # Hook para notificações
├── lib/
│   └── utils.ts                # Utilitários gerais (cn, etc.)
├── pages/
│   ├── Index.tsx               # Página principal
│   └── NotFound.tsx            # Página 404
├── utils/
│   ├── adminStorage.ts         # Armazenamento administrativo
│   ├── encryption.ts           # Funções de criptografia
│   ├── rateLimiter.ts          # Limitador de taxa
│   ├── sanitizer.ts            # Sanitização de dados
│   └── sessionStorage.ts       # Gerenciamento de sessão
├── App.tsx                     # Componente principal
├── main.tsx                    # Ponto de entrada
└── index.css                   # Estilos globais
```

## 📋 Componentes Principais

### 🏢 Diretório de Funcionários
- **EmployeeDirectory**: Componente principal que exibe a lista de funcionários
- **AdvancedSearch**: Busca avançada com múltiplos filtros
- **LunchHours**: Indicador visual de horários de almoço

### 👥 Gerenciamento de Funcionários
- **EmployeeManager**: Interface administrativa para CRUD de funcionários
- **EmployeeForm**: Formulário para adicionar/editar funcionários
- **useEmployeeManager**: Hook para gerenciar estado dos funcionários
- **useEmployeeSearch**: Hook para funcionalidades de busca

### 📢 Sistema de Comunicados
- **AnnouncementManager**: Exibição e gerenciamento de comunicados
- **AnnouncementManagerSimple**: Versão simplificada do gerenciador
- **useAnnouncements**: Hook para gerenciar estado dos comunicados
- Sistema focado na exibição e gerenciamento de comunicados sem funcionalidades de pesquisa

### 🔧 Utilitários e Segurança
- **AdminPanel**: Painel administrativo com autenticação
- **ErrorBoundary**: Tratamento de erros da aplicação
- **ThemeProvider/ThemeToggle**: Sistema de temas claro/escuro
- **InstallPrompt**: Prompt para instalação PWA

### 🔒 Segurança e Armazenamento
- **encryption.ts**: Funções de criptografia para dados sensíveis
- **sessionStorage.ts**: Gerenciamento seguro de sessões
- **adminStorage.ts**: Armazenamento administrativo criptografado
- **rateLimiter.ts**: Limitação de tentativas de login
- **sanitizer.ts**: Sanitização de inputs do usuário

### 🎨 Hooks Customizados
- **usePWA**: Funcionalidades de Progressive Web App
- **useDebounce**: Otimização de performance em buscas
- **useStaggerAnimation**: Animações escalonadas
- **useCurrentTime**: Gerenciamento de tempo em tempo real

## 🌐 Deploy no GitHub Pages

O projeto está configurado para deploy automático no GitHub Pages:

### Configuração Inicial
1. **Criar Repositório**: Crie um repositório público no GitHub
2. **Push do Código**: Faça push do código para a branch `main`
3. **Configurar Pages**: 
   - Vá em Settings > Pages
   - Source: GitHub Actions
   - O workflow será executado automaticamente

### Deploy Manual
```bash
# Build da aplicação
npm run build

# Os arquivos estarão na pasta dist/
```

## 📱 Funcionalidades PWA

### Como Instalar o App
1. **Desktop**: Clique no ícone de instalação na barra de endereços
2. **Mobile**: Use o menu "Adicionar à tela inicial"
3. **Prompt Automático**: Um banner aparecerá oferecendo a instalação

### Recursos PWA
- **Instalação Nativa**: Funciona como um app instalado
- **Ícone na Tela Inicial**: Acesso rápido ao aplicativo
- **Splash Screen**: Tela de carregamento personalizada
- **Funcionamento Offline**: Cache automático de recursos
- **Atualizações Automáticas**: Detecção de novas versões

### Cache e Offline
- **Cache Estático**: Recursos da aplicação (HTML, CSS, JS, ícones)
- **Cache Dinâmico**: Dados da API com estratégia "Network First"
- **Limpeza Automática**: Gerenciamento inteligente do cache

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da empresa TORP e destina-se exclusivamente ao uso interno.

---

**Desenvolvido com ❤️ para a equipe TORP**
