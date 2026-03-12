# 🛒 SuperList

Aplicativo mobile de lista de compras, feito para organizar suas compras do dia a dia de forma simples e prática.

## 📱 Funcionalidades

- **Criar listas de compras** — crie listas personalizadas como "Compras do mês", "Churrasco", "Feira", etc.
- **Adicionar itens** — adicione produtos com nome e quantidade.
- **Ver minhas listas** — acesse todas as listas salvas no dispositivo.
- **Ver valor total da lista** - veja o valor do que é comprado conforme é marcado na lista.
- **Armazenamento local** — seus dados ficam salvos no celular, sem precisar de internet.

## 🛠️ Tecnologias e por quê

| Tecnologia | Por que usar? |
|---|---|
| **React Native** | Permite criar apps nativos para Android e iOS com uma única base de código em JavaScript/TypeScript. |
| **Expo** | Facilita a configuração, build e testes do app sem precisar configurar Android Studio ou Xcode manualmente. |
| **TypeScript** | Adiciona tipagem ao JavaScript, ajudando a evitar erros e deixando o código mais seguro e legível. |
| **React Navigation** | Biblioteca padrão para navegação entre telas no React Native, com suporte a pilha de telas (stack). |
| **AsyncStorage** | Armazenamento local simples (chave-valor) para salvar as listas no dispositivo, sem necessidade de banco de dados externo. |
| **Expo Vector Icons (Ionicons)** | Fornece ícones prontos para uso no app, como setas de navegação e outros elementos visuais. |

## 📂 Estrutura do Projeto

```
SuperList/
├── app/
│   ├── App.tsx                  # Configuração de rotas e navegação
│   ├── screens/
│   │   ├── Home.tsx             # Tela inicial
│   │   ├── CreateListScreen.tsx # Tela de criação de lista
│   │   └── Mylists.tsx          # Tela de listas salvas
│   └── src/
│       ├── styles.tsx           # Estilos globais
│       └── services/
│           └── storage.tsx      # Funções de salvar/carregar listas (AsyncStorage)
├── assets/                      # Ícones e imagens do app
├── package.json
├── tsconfig.json
└── app.json                     # Configuração do Expo
```

## 🚀 Como rodar

```bash
# Instalar dependências
npm install

# Iniciar o projeto
npx expo start
```

Escaneie o QR Code com o app **Expo Go** no celular para testar.
