
# 📌 **README.md**

```md
# Profile Card

Um cartão de perfil simples e responsivo que carrega os dados dinamicamente a partir de um arquivo JSON.  
Inclui suporte a tema claro e escuro, animações suaves e adaptação automática ao tema do sistema.

## 🚀 Tecnologias

- HTML
- CSS
- JavaScript
- Fetch API
- Tema dark/light com `localStorage`

## 📁 Estrutura do projeto

```

/
├── assets/
│   ├── icons/
│   │   └── github.svg
│   └── img/
│       └── avatar.png
├── css/
│   └── style.css
├── data/
│   └── user.json
├── js/
│   ├── main.js
│   └── theme.js
├── index.html
└── README.md

````

## ✨ Funcionalidades

- Carregamento do perfil via **JSON externo**
- Tema claro/escuro com **detecção automática do sistema**
- Salvamento da preferência no **localStorage**
- Animações leves no carregamento e ao trocar o tema
- Layout responsivo com breakpoints para telas pequenas e tablets

## 📦 Como rodar

### 1. Clone o repositório

```bash
git clone https://github.com/seuusuario/seurepositorio.git
cd seurepositorio
````

### 2. Rode com um servidor local

(O `fetch()` não funciona abrindo o arquivo direto pelo navegador.)

Se estiver usando VS Code:

* Abra o projeto
* Clique em **Go Live** (Live Server)

Ou use Node:

```sh
npx http-server .
```

Ou Python:

```sh
python -m http.server
```

Depois acesse:

```
http://localhost:8000
```

(ou a porta que aparecer)

## 📝 JSON de exemplo

```json
{
  "name": "Seu nome",
  "bio": "******",
  "avatar": "./assets/img/avatar.png",
  "social": {
    "github": "https://github.com/seusername",
    "linkedin": "https://linkedin.com/in/seusername"
  }
}
```

## 🎨 Screenshot (opcional)

Adicione aqui quando quiser.

## 📄 Licença

Este projeto é open-source. Use como quiser.

```

---

Se quiser, posso personalizar com badges, GIF de preview, instruções mais avançadas ou uma seção de “melhorias futuras”.
```
