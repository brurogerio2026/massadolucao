# Continuação do site Massa do Lucão

## Objetivo
Concluir a área administrativa e tornar a operação da loja gerenciável, mantendo o Mercado Pago preparado para receber as credenciais posteriormente.

## Etapas
1. **Acesso administrativo**
   - Criar tela de entrada por e-mail e senha.
   - Proteger toda a área administrativa e validar a permissão de administrador no servidor.
   - Preparar o e-mail informado para receber a função de administrador ao criar a conta.
   - Incluir saída segura da conta.

2. **Painel e indicadores**
   - Criar navegação responsiva para Dashboard, Produtos, Pedidos, Clientes, Pagamentos, Conteúdo, Cupons e Configurações.
   - Exibir vendas, faturamento, pedidos por status, produtos ativos e estoque baixo.
   - Adicionar gráficos de vendas e pedidos com os dados existentes.

3. **Produtos e estoque**
   - Criar listagem, cadastro, edição, ativação/desativação e exclusão.
   - Incluir preços, promoção, estoque, SKU, peso, dimensões, categoria, quantidade mínima, descrições e instruções.
   - Permitir imagem principal, galeria e variações.

4. **Pedidos, clientes e pagamentos**
   - Criar listagem e detalhes completos de pedidos.
   - Permitir mudança manual de status e cadastro de rastreio.
   - Exibir clientes e histórico de pagamentos sem expor dados publicamente.

5. **Conteúdo da loja**
   - Administrar banners, depoimentos, FAQ, galeria, benefícios e passos de uso.
   - Administrar cupons, incluindo regras de desconto, validade, limite e status.

6. **Identidade e configurações**
   - Editar nome, descrição, contato, WhatsApp, Instagram, políticas e regras de frete.
   - Permitir envio e remoção de logo, favicon e imagens; a identidade cadastrada substituirá automaticamente o padrão.
   - Servir imagens privadas por endereços temporários seguros.

7. **Pagamentos e validação final**
   - Tornar o webhook idempotente para impedir pagamento duplicado e baixa dupla de estoque.
   - Manter a criação de pagamentos indisponível até o token do Mercado Pago ser informado.
   - Verificar entrada, operações administrativas, carrinho, checkout e visual em celular e computador.

## Observações
- A confirmação por e-mail continuará ativa; nenhuma senha será criada ou armazenada manualmente.
- O painel utilizará as tabelas e regras de segurança já existentes.
- O Mercado Pago será finalizado quando Access Token, Public Key e segredo do webhook estiverem disponíveis.
