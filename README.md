# O Menino que Descobriu o Vento

Site do projeto da turma do **Curso Técnico em Desenvolvimento de Sistemas, 2º semestre**, do Colégio Estadual Cleoracy Aparecida Gil, baseado no livro *O Menino que Descobriu o Vento*, de William Kamkwamba e Bryan Mealer.

## Estrutura

```
index.html        página principal
qr.html           gera o QR Code do site para imprimir
css/style.css     visual e animações
js/main.js        interações (comparador, livro, carrossel, jogo do moinho)
assets/           logo da escola e ícone
fotos/            fotos da maquete
```

## Como colocar as fotos

Coloque as fotos na pasta `fotos/` com **exatamente** estes nomes (em `.jpg`):

| Arquivo | Onde aparece |
|---|---|
| `maquete-final.jpg` | foto de destaque da maquete |
| `etapa-1.jpg` … `etapa-5.jpg` | passo a passo "Fizemos dessa forma" |
| `turma.jpg` | "A turma em ação" |

Enquanto uma foto não existir, aparece "Foto em breve".
Para ver o nome do arquivo em cada espaço, abra o site com `?editar` no fim do endereço, por exemplo `.../index.html?editar`.

Dica: diminua as fotos para uns 1200 px de largura antes de enviar, para o site abrir rápido no celular.

## Como colocar os nomes

No `index.html`, procure por `EDITE AQUI`:

- **Alunos**: um `<li class="reveal">Nome Completo</li>` por aluno.
- **Professores**: `<li class="reveal">Nome do Professor<small>Disciplina</small></li>`.

As iniciais nos círculos são geradas sozinhas.

Os textos de "Fizemos dessa forma" (etapas 1 a 5) também ficam no `index.html` e podem ser ajustados.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie todos os arquivos desta pasta.
2. No repositório, abra **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
4. Em 1 ou 2 minutos o site estará em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## QR Code

Depois de publicar, abra `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/qr.html`.
O endereço já vem preenchido. Clique em **Imprimir** e cole o QR Code na maquete.
