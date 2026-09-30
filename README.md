# Lucão's Catch

Crie um site completo, moderno, profissional e responsivo para uma loja online chamada “Massa do Lucão”.



OBJETIVO DO SITE:

O site será utilizado para vender a Massa do Lucão, uma massa especial para pesca de tilápias. O objetivo principal é apresentar o produto de forma atrativa e facilitar ao máximo a compra pelo cliente.



IMPORTANTE:

O projeto deve ser preparado para produção, com estrutura organizada, segura e fácil de administrar posteriormente.



IDENTIDADE VISUAL:

- Nome da loja: Massa do Lucão

- Segmento: pesca esportiva / pesca de tilápia

- Produto principal: Massa do Lucão

- Criar uma identidade visual relacionada à pesca, tilápia, água, natureza e pescaria.

- Utilizar um visual profissional, moderno e chamativo.

- Evitar aparência genérica de loja virtual.

- Usar elementos visuais relacionados à pesca de forma elegante.

- Deixar um espaço específico no painel administrativo para eu enviar minha própria logo posteriormente.

- Quando uma logo for cadastrada, ela deve substituir automaticamente o nome/logo padrão do site.

- O site deve funcionar perfeitamente tanto no celular quanto no computador.



PÁGINA INICIAL:



Criar uma página inicial com:



1. HEADER

- Logo da loja.

- Menu:

  - Início

  - Produtos

  - Sobre a Massa

  - Como Usar

  - Contato

- Ícone do carrinho.

- Botão “Comprar agora”.



2. HERO PRINCIPAL

Criar uma seção de destaque extremamente atrativa.



Título:

“Massa do Lucão — A massa especial para sua pescaria de tilápias”



Subtítulo:

“Prepare sua pescaria com uma massa desenvolvida especialmente para a pesca de tilápias.”



Adicionar:

- Imagem grande do produto.

- Botão “COMPRAR AGORA”

- Botão secundário “CONHEÇA A MASSA”



Criar um visual relacionado a um ambiente de pesca, água e natureza.



3. DESTAQUE DO PRODUTO

Apresentar a Massa do Lucão como produto principal.



Exibir:

- Imagem do produto

- Nome

- Preço

- Informações principais

- Disponibilidade/estoque

- Quantidade

- Botão “Adicionar ao carrinho”

- Botão “Comprar agora”



4. BENEFÍCIOS

Criar uma seção com cards destacando características do produto, por exemplo:



🎣 Especial para tilápias

🌿 Produto pensado para pescaria

💧 Fácil de preparar e utilizar

📦 Envio para todo o Brasil



Não inventar informações técnicas que não tenham sido cadastradas no painel administrativo.



5. SOBRE A MASSA

Criar uma seção explicando o produto.



Título:

“Conheça a Massa do Lucão”



Texto editável pelo administrador.



O administrador deverá conseguir alterar:

- Título

- Descrição

- Imagem

- Benefícios

- Informações de uso



6. COMO USAR

Criar uma seção “Como usar a Massa do Lucão”.



Permitir que o administrador cadastre instruções passo a passo.



Exemplo de estrutura:



1. Prepare a massa

2. Ajuste a consistência

3. Faça a isca

4. Prenda no anzol

5. Prepare-se para a pescaria



IMPORTANTE:

Essas instruções devem ser totalmente editáveis pelo painel administrativo.



7. DEPOIMENTOS

Criar uma seção de avaliações/depoimentos de clientes.



O administrador poderá cadastrar:

- Nome

- Foto

- Depoimento

- Avaliação de 1 a 5 estrelas



8. GALERIA

Criar uma galeria de fotos relacionada ao produto e à pesca.



O administrador poderá adicionar, remover e alterar imagens.



9. FAQ

Criar perguntas frequentes, como:



- Para qual peixe a Massa do Lucão é indicada?

- Como utilizar?

- Como faço meu pedido?

- Quais formas de pagamento?

- Qual o prazo de envio?

- Vocês enviam para todo o Brasil?



Todas as perguntas e respostas devem ser editáveis pelo administrador.



10. RODAPÉ

Adicionar:

- Logo

- Nome da loja

- Links importantes

- Instagram

- WhatsApp

- Política de privacidade

- Termos de uso

- Informações de contato



Permitir editar essas informações pelo painel administrativo.



==================================================

SISTEMA DE PRODUTOS

==================================================



Criar um sistema completo de produtos.



O administrador deve conseguir:



- Adicionar produto

- Editar produto

- Excluir produto

- Ativar/desativar produto

- Alterar preço

- Alterar preço promocional

- Adicionar descrição

- Adicionar imagens

- Definir estoque

- Definir SKU

- Definir peso

- Definir dimensões

- Definir informações de envio

- Definir quantidade mínima

- Criar produtos com diferentes tamanhos/pesos

- Criar variações de produto



Cada produto deverá possuir:



- Nome

- Imagem principal

- Galeria de imagens

- Descrição curta

- Descrição completa

- Preço

- Preço promocional

- Estoque

- SKU

- Peso

- Categoria

- Status ativo/inativo



==================================================

CARRINHO

==================================================



Criar carrinho de compras completo.



O cliente deverá conseguir:



- Adicionar produtos

- Alterar quantidade

- Remover produtos

- Ver subtotal

- Ver frete

- Ver total

- Continuar comprando

- Finalizar compra



O carrinho deve funcionar perfeitamente no celular.



==================================================

CHECKOUT

==================================================



Criar um checkout simples e profissional.



Solicitar:



- Nome completo

- CPF

- E-mail

- Telefone/WhatsApp

- CEP

- Endereço

- Número

- Complemento

- Bairro

- Cidade

- Estado



Mostrar resumo do pedido:



- Produtos

- Quantidades

- Subtotal

- Frete

- Total



==================================================

MERCADO PAGO

==================================================



Integrar o sistema de pagamentos com o Mercado Pago.



Utilizar a API oficial do Mercado Pago e deixar a estrutura preparada para configurar:



- Access Token

- Public Key

- Webhook



O cliente deverá poder pagar utilizando os métodos disponibilizados pelo Mercado Pago, incluindo cartão de crédito, Pix e outros métodos disponíveis para a conta.



IMPORTANTE:

- Nunca expor Access Token ou credenciais secretas no frontend.

- Utilizar backend/server functions para operações sensíveis.

- Criar webhook para receber atualizações de pagamento.

- Atualizar automaticamente o status do pedido conforme o pagamento.

- Criar estados:

  - Aguardando pagamento

  - Pagamento aprovado

  - Pagamento recusado

  - Pagamento cancelado

  - Em preparação

  - Enviado

  - Entregue



Após o pagamento aprovado, registrar o pedido automaticamente no sistema.



==================================================

PEDIDOS

==================================================



Criar sistema de pedidos.



O administrador deverá conseguir visualizar:



- Número do pedido

- Data

- Cliente

- Telefone

- Produtos

- Quantidades

- Valor

- Frete

- Total

- Forma de pagamento

- Status do pagamento

- Status do pedido

- Endereço de entrega



Permitir alterar o status do pedido manualmente.



Criar possibilidade de inserir código de rastreamento.



==================================================

PAINEL ADMINISTRATIVO

==================================================



Criar um painel administrativo protegido por login.



O painel deverá possuir menu:



📊 Dashboard

📦 Produtos

🛒 Pedidos

👥 Clientes

💰 Pagamentos

🖼️ Banners

⭐ Depoimentos

❓ FAQ

📸 Galeria

⚙️ Configurações



DASHBOARD:



Mostrar:



- Total de vendas

- Vendas do dia

- Vendas do mês

- Pedidos pendentes

- Pedidos pagos

- Produtos cadastrados

- Produtos com estoque baixo

- Faturamento



Criar gráficos simples para acompanhar vendas.



==================================================

GERENCIAMENTO DA LOGO

==================================================



Criar dentro de Configurações uma área:



“Identidade da Loja”



Permitir:



- Upload da logo

- Alterar logo

- Remover logo

- Upload de favicon

- Nome da loja

- Descrição da loja

- WhatsApp

- Instagram

- E-mail



A logo cadastrada deverá aparecer automaticamente no header e no rodapé.



==================================================

BANNERS

==================================================



Criar sistema para o administrador cadastrar banners.



Cada banner deverá permitir:



- Imagem

- Título

- Subtítulo

- Botão

- Link do botão

- Ativo/inativo

- Ordem de exibição



Criar banners responsivos para desktop e celular.



==================================================

FRETE

==================================================



Criar estrutura preparada para cálculo de frete.



O administrador poderá configurar:



- Frete grátis

- Frete fixo

- Regras de frete

- Valor mínimo para frete grátis



Deixar a arquitetura preparada para futura integração com serviços de cálculo de frete, caso seja necessário.



==================================================

WHATSAPP

==================================================



Adicionar botão flutuante do WhatsApp.



Permitir configurar o número pelo painel administrativo.



Ao clicar, abrir conversa com mensagem automática, por exemplo:



“Olá! Vim pelo site da Massa do Lucão e gostaria de saber mais sobre os produtos.”



==================================================

SEO

==================================================



O site deve ser otimizado para SEO.



Configurar:



- Title

- Meta description

- Open Graph

- URLs amigáveis

- Sitemap

- Robots.txt

- Dados estruturados para produtos

- Schema.org Product

- Schema.org Organization



Criar textos relacionados naturalmente a termos como:



“Massa para tilápia”

“Massa de pesca”

“Massa para pescar tilápia”

“Massa do Lucão”

“Pesca de tilápia”



Não fazer keyword stuffing.



==================================================

DESIGN E EXPERIÊNCIA

==================================================



O site deve transmitir:



- Pesca

- Confiança

- Qualidade

- Natureza

- Produto artesanal/especializado

- Facilidade de compra



Utilizar:

- Cards modernos

- Botões chamativos

- Animações suaves

- Efeitos hover

- Transições

- Ícones relacionados à pesca

- Layout limpo

- Excelente experiência mobile



Priorizar conversão.



O botão “COMPRAR AGORA” deve aparecer estrategicamente em diferentes pontos da página.



Criar uma barra fixa no mobile com:

- Ver carrinho

- Comprar agora



==================================================

BANCO DE DADOS

==================================================



Criar banco de dados estruturado para:



- usuários

- administradores

- produtos

- categorias

- variações

- estoque

- pedidos

- itens dos pedidos

- clientes

- pagamentos

- banners

- depoimentos

- FAQ

- galeria

- configurações da loja

- cupons



Criar relacionamentos adequados e regras de segurança.



==================================================

SEGURANÇA

==================================================



Implementar:



- Autenticação segura

- Controle de acesso administrativo

- Proteção das rotas administrativas

- Validação dos formulários

- Sanitização dos dados

- Proteção das credenciais do Mercado Pago

- Não expor informações sensíveis no frontend

- Proteção contra acesso não autorizado

- Webhooks seguros

- Controle de permissões



==================================================

CUPONS

==================================================



Criar sistema de cupons no painel administrativo.



Permitir:



- Criar cupom

- Código

- Desconto percentual

- Desconto em valor fixo

- Valor mínimo do pedido

- Data de início

- Data de validade

- Limite de utilização

- Ativar/desativar



==================================================

PÁGINA DE PRODUTO

==================================================



Criar página individual para cada produto.



Mostrar:



- Galeria de imagens

- Nome

- Avaliações

- Preço

- Preço promocional

- Descrição

- Benefícios

- Informações de uso

- Estoque

- Quantidade

- Botão “Comprar agora”

- Botão “Adicionar ao carrinho”

- Produtos relacionados



==================================================

RESPONSIVIDADE

==================================================



O site deve ser totalmente responsivo.



Testar e otimizar para:



- Celulares Android

- iPhone

- Tablets

- Notebooks

- Monitores grandes



Prioridade máxima para experiência mobile.



==================================================

TECNOLOGIA

==================================================



Utilizar uma arquitetura moderna e escalável.



Preferência por:



- React

- TypeScript

- Tailwind CSS

- Supabase para banco de dados/autenticação, caso seja adequado ao ambiente

- Backend/server functions para integrações sensíveis

- Mercado Pago para pagamentos



Utilizar componentes reutilizáveis e código organizado.



==================================================

IMPORTANTE SOBRE CONTEÚDO

==================================================



Não inventar informações técnicas sobre a Massa do Lucão.



Sempre que alguma informação específica não estiver definida, criar o campo no painel administrativo para que eu possa preencher posteriormente.



O administrador deve conseguir alterar praticamente todo o conteúdo do site sem precisar editar código.



Criar alguns conteúdos demonstrativos apenas para visualizar o funcionamento, deixando claro no painel que são conteúdos editáveis.



==================================================

RESULTADO FINAL

==================================================



Entregar uma loja virtual completa, profissional e pronta para ser configurada para venda da Massa do Lucão.



A experiência deve passar a sensação de uma marca especializada em pesca de tilápias, e não de um template genérico de e-commerce.



A prioridade deve ser:



1. Conversão de vendas

2. Facilidade de compra

3. Experiência mobile

4. Integração segura com Mercado Pago

5. Facilidade de administração

6. Visual profissional

7. Estrutura preparada para crescimento



Antes de finalizar, verificar se:

- Cadastro de produtos funciona.

- Carrinho funciona.

- Checkout funciona.

- Painel administrativo funciona.

- Autenticação funciona.

- Estoque funciona.

- Mercado Pago está preparado corretamente.

- Webhook está preparado.

- Site funciona em dispositivos móveis.

- Logo pode ser alterada pelo painel.

- Todas as informações importantes podem ser alteradas pelo administrador.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://massadolucao.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a219438c-fd94-4d7a-9791-9d7e9c46f691).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
