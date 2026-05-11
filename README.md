# Portfólio — Fábio Júnior

Vitrine pessoal dark & gold. Todos os dados são carregados dinamicamente via `data/user.json` — nenhuma linha de HTML precisa ser editada para atualizar o conteúdo.

## Stacks

- HTML5 semântico
- CSS3 (variáveis, grid, animações)
- JavaScript vanilla (Fetch API, IntersectionObserver)

## Estrutura

```
/
├── assets/
│   └── img/
│       └── avatar.png        ← Substitua pela sua foto
├── css/
│   └── style.css
├── data/
│   └── user.json             ← Edite aqui para atualizar tudo
├── js/
│   └── main.js
├── index.html
└── README.md
```

## Como personalizar

Edite apenas o `data/user.json`:

```json
{
  "name": "Seu Nome",
  "label": "Sua profissão",
  "bio": "Sua bio curta.",
  "avatar": "./assets/img/avatar.png",
  "contact": {
    "tagline": "Aberto a oportunidades e colaborações",
    "sub": "Mensagem de convite ao contato.",
    "email": "seu@email.com"
  },
  "stats": [
    { "value": "3°",  "label": "Período"  },
    { "value": "10+", "label": "Projetos" }
  ],
  "social": {
    "github":   "https://github.com/seuuser",
    "linkedin": "https://linkedin.com/in/seuuser"
  },
  "projects": [
    {
      "featured": true,
      "title": "Nome do projeto",
      "description": "Descrição breve.",
      "tags": ["HTML", "CSS", "JS"],
      "url": "https://github.com/seuuser/projeto"
    }
  ],
  "skills": [
    {
      "group": "Frontend",
      "items": ["HTML5", "CSS3", "JavaScript"]
    }
  ],
  "experience": [
    {
      "period": "2024 — Atual",
      "title": "Título da experiência",
      "org": "Empresa ou instituição",
      "description": "Descrição da experiência."
    }
  ]
}
```
## Observação

Este projeto é uma vitrine pessoal para apresentar seu portfólio. Não se trata de um repositório open-source de uso genérico.
