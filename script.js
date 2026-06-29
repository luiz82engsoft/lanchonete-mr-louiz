// carrossel de imagens
let index = 0;
const slides = document.querySelectorAll('.slides img');

function mostrarSlide() {
  slides.forEach((img, i) => {
    img.style.display = i === index ? 'block' : 'none';
  });
  index = (index + 1) % slides.length;
}

mostrarSlide(); // mostra a primeira imagem
setInterval(mostrarSlide, 3000); // troca a cada 3 segundos


//rastreamento de pedidos
const status = document.querySelectorAll("#status-pedido li");
let etapa = 0;

function atualizarStatus() {
  if (etapa < status.length) {
    status[etapa].style.color = "green";
    etapa++;
  }
}

setInterval(atualizarStatus, 3000); // muda o status a cada 3 segundos


//carrinho de compras
//configurações iniciais
const TAXA_ENTREGA = 8.00;
const CHAVE_CARRINHO = "carrinhoMrLouiz";

// Carrinho de exemplo, usado apenas se ainda não houver nada salvo
// (assim a página nunca fica vazia em uma primeira visita de teste)
const carrinhoExemploInicial = [
  { id: "hamburguer", nome: "Hambúrguer Artesanal", preco: 25.00, imagem: "img/hamburguer.jpg", quantidade: 1 },
  { id: "refri", nome: "Refrigerante Lata", preco: 6.00, imagem: "img/refri.jpg", quantidade: 2 },
  { id: "batata", nome: "Batata Frita", preco: 15.00, imagem: "img/batata.jpg", quantidade: 1 }
];

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// persistência do carrinho no localStorage
function obterCarrinho() {
  try {
    const salvo = localStorage.getItem(CHAVE_CARRINHO);
    if (salvo) {
      const dados = JSON.parse(salvo);
      if (Array.isArray(dados)) return dados;
    }
  } catch (e) {
    console.warn("Erro ao ler carrinho salvo:", e);
  }
  return [];
}

function salvarCarrinho(carrinho) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

// Garante que sempre haja algo na primeira visita (apenas para fins de demonstração)
function inicializarCarrinhoSeVazio() {
  const carrinho = obterCarrinho();
  if (carrinho.length === 0 && localStorage.getItem(CHAVE_CARRINHO) === null) {
    salvarCarrinho(carrinhoExemploInicial);
  }
}

// renderização do carrinho
function renderizarCarrinho() {
  const carrinho = obterCarrinho();
  const lista = document.getElementById("carrinho-lista");
  const btnFinalizar = document.getElementById("btn-finalizar");

  lista.innerHTML = "";

  if (carrinho.length === 0) {
    lista.innerHTML = `
      <div class="carrinho-vazio">
        <p>Seu carrinho está vazio.</p>
        <a href="cardapio.html" class="btn-continuar-grande">Ver Cardápio</a>
      </div>
    `;
    btnFinalizar.classList.add("btn-desabilitado");
    btnFinalizar.addEventListener("click", (e) => e.preventDefault());
  } else {
    btnFinalizar.classList.remove("btn-desabilitado");

    carrinho.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "carrinho-item";
      card.innerHTML = `
        <img src="${item.imagem}" alt="${item.nome}">
        <div class="carrinho-item-info">
          <h4>${item.nome}</h4>
          <span class="carrinho-item-preco">${formatarMoeda(item.preco)} cada</span>
        </div>
        <div class="carrinho-item-qtd">
          <button class="qtd-btn" data-acao="diminuir" data-index="${index}">−</button>
          <span>${item.quantidade}</span>
          <button class="qtd-btn" data-acao="aumentar" data-index="${index}">+</button>
        </div>
        <span class="carrinho-item-total">${formatarMoeda(item.preco * item.quantidade)}</span>
        <button class="carrinho-item-remover" data-index="${index}" aria-label="Remover item">🗑</button>
      `;
      lista.appendChild(card);
    });
  }

  atualizarResumo(carrinho);
}

function atualizarResumo(carrinho) {
  const subtotal = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const taxa = carrinho.length > 0 ? TAXA_ENTREGA : 0;
  const total = subtotal + taxa;

  document.getElementById("resumo-subtotal").textContent = formatarMoeda(subtotal);
  document.getElementById("resumo-taxa").textContent = formatarMoeda(taxa);
  document.getElementById("resumo-total").textContent = formatarMoeda(total);
}

// ações de delegação de evento do carrinho
function configurarEventos() {
  document.getElementById("carrinho-lista").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const carrinho = obterCarrinho();
    const index = parseInt(btn.dataset.index, 10);

    if (btn.classList.contains("qtd-btn")) {
      const acao = btn.dataset.acao;
      if (acao === "aumentar") {
        carrinho[index].quantidade += 1;
      } else if (acao === "diminuir") {
        carrinho[index].quantidade -= 1;
        if (carrinho[index].quantidade <= 0) {
          carrinho.splice(index, 1);
        }
      }
      salvarCarrinho(carrinho);
      renderizarCarrinho();
    }

    if (btn.classList.contains("carrinho-item-remover")) {
      carrinho.splice(index, 1);
      salvarCarrinho(carrinho);
      renderizarCarrinho();
    }
  });
}

// inicialização
document.addEventListener("DOMContentLoaded", () => {
  inicializarCarrinhoSeVazio();
  renderizarCarrinho();
  configurarEventos();
});

// configurações do checkout
const NUMERO_WHATSAPP = "5582996585635"; // número da lanchonete, formato: DDI + DDD + número
const CHAVE_PIX = "82996585635"; // troque pela sua chave Pix real (CPF, telefone, e-mail ou chave aleatória)
const TAXA_ENTREGA = 8.00;

// carrinho (exemplo de fallback)
// Se você já tiver um carrinho salvo no localStorage (de carrinho.html),
// ele será usado automaticamente. Caso contrário, usa este exemplo.
const carrinhoExemplo = [
  { nome: "Hambúrguer Artesanal", quantidade: 1, preco: 25.00 },
  { nome: "Refrigerante Lata", quantidade: 2, preco: 6.00 },
  { nome: "Batata Frita", quantidade: 1, preco: 15.00 }
];

function obterCarrinho() {
  try {
    const salvo = localStorage.getItem("carrinhoMrLouiz");
    if (salvo) {
      const dados = JSON.parse(salvo);
      if (Array.isArray(dados) && dados.length > 0) return dados;
    }
  } catch (e) {
    console.warn("Não foi possível ler o carrinho salvo, usando exemplo.", e);
  }
  return carrinhoExemplo;
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

//resumo do pedido
function montarResumo() {
  const carrinho = obterCarrinho();
  const container = document.getElementById("resumo-itens");
  container.innerHTML = "";

  let subtotal = 0;

  carrinho.forEach(item => {
    const totalItem = item.quantidade * item.preco;
    subtotal += totalItem;

    const linha = document.createElement("div");
    linha.className = "resumo-item";
    linha.innerHTML = `
      <span>${item.quantidade}x ${item.nome}</span>
      <span>${formatarMoeda(totalItem)}</span>
    `;
    container.appendChild(linha);
  });

  const total = subtotal + TAXA_ENTREGA;

  document.getElementById("resumo-subtotal").textContent = formatarMoeda(subtotal);
  document.getElementById("resumo-taxa").textContent = formatarMoeda(TAXA_ENTREGA);
  document.getElementById("resumo-total").textContent = formatarMoeda(total);

  return { carrinho, subtotal, total };
}

// validação do formulário
function limparErros() {
  document.querySelectorAll(".erro-msg").forEach(el => el.textContent = "");
  document.querySelectorAll(".checkout-bloco input").forEach(el => el.classList.remove("input-erro"));
}

function mostrarErro(campoId, mensagem) {
  const erroEl = document.getElementById(`erro-${campoId}`);
  const inputEl = document.getElementById(campoId);
  if (erroEl) erroEl.textContent = mensagem;
  if (inputEl) inputEl.classList.add("input-erro");
}

function validarFormulario(dados) {
  limparErros();
  let valido = true;

  if (!dados.nome.trim()) {
    mostrarErro("nome", "Por favor, digite seu nome.");
    valido = false;
  }

  const telefoneNumeros = dados.telefone.replace(/\D/g, "");
  if (telefoneNumeros.length < 10) {
    mostrarErro("telefone", "Digite um WhatsApp válido com DDD.");
    valido = false;
  }

  if (!dados.rua.trim()) {
    mostrarErro("rua", "Por favor, digite o nome da rua.");
    valido = false;
  }

  if (!dados.numero.trim()) {
    mostrarErro("numero", "Digite o número.");
    valido = false;
  }

  if (!dados.bairro.trim()) {
    mostrarErro("bairro", "Digite o bairro.");
    valido = false;
  }

  return valido;
}

// montar mensagem para WhatsApp
function montarMensagemWhatsApp(dados, carrinho, subtotal, total) {
  let mensagem = ` *Novo Pedido - Mr. Louiz*\n\n`;

  mensagem += `*Cliente:* ${dados.nome}\n`;
  mensagem += `*WhatsApp:* ${dados.telefone}\n\n`;

  mensagem += `*Itens do pedido:*\n`;
  carrinho.forEach(item => {
    mensagem += `• ${item.quantidade}x ${item.nome} - ${formatarMoeda(item.quantidade * item.preco)}\n`;
  });

  mensagem += `\n*Subtotal:* ${formatarMoeda(subtotal)}\n`;
  mensagem += `*Taxa de entrega:* ${formatarMoeda(TAXA_ENTREGA)}\n`;
  mensagem += `*Total:* ${formatarMoeda(total)}\n\n`;

  mensagem += `*Endereço de entrega:*\n`;
  mensagem += `${dados.rua}, ${dados.numero} - ${dados.bairro}\n`;
  if (dados.complemento.trim()) {
    mensagem += `Complemento: ${dados.complemento}\n`;
  }

  if (dados.obs.trim()) {
    mensagem += `\n*Observações:* ${dados.obs}\n`;
  }

  mensagem += `\n*Forma de pagamento:* ${dados.pagamento}`;

  if (dados.pagamento === "Dinheiro" && dados.troco.trim()) {
    mensagem += `\n*Troco para:* ${dados.troco}`;
  }

  if (dados.pagamento === "Pix") {
    mensagem += `\n*Chave Pix usada:* ${CHAVE_PIX}`;
  }

  return mensagem;
}

//alternar formas de pagamento
function configurarAlternanciaPagamento() {
  const radioPix = document.getElementById("pagamento-pix");
  const radioDinheiro = document.getElementById("pagamento-dinheiro");
  const blocoPix = document.getElementById("bloco-pix");
  const blocoDinheiro = document.getElementById("bloco-dinheiro");

  function atualizarBlocos() {
    if (radioPix.checked) {
      blocoPix.style.display = "block";
      blocoDinheiro.style.display = "none";
    } else {
      blocoPix.style.display = "none";
      blocoDinheiro.style.display = "block";
    }
  }

  radioPix.addEventListener("change", atualizarBlocos);
  radioDinheiro.addEventListener("change", atualizarBlocos);
  atualizarBlocos(); // estado inicial
}

// copiar chave pix
function configurarCopiarPix() {
  const btnCopiar = document.getElementById("btn-copiar-pix");
  const valorPix = document.getElementById("pix-chave-valor");
  const msgCopiado = document.getElementById("pix-copiado-msg");

  valorPix.textContent = CHAVE_PIX;

  btnCopiar.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CHAVE_PIX);
      msgCopiado.classList.add("visivel");
      setTimeout(() => msgCopiado.classList.remove("visivel"), 2000);
    } catch (e) {
      console.warn("Não foi possível copiar automaticamente:", e);
      alert(`Sua chave Pix é: ${CHAVE_PIX}`);
    }
  });
}

//inicialização do checkout
document.addEventListener("DOMContentLoaded", () => {
  const { carrinho, subtotal, total } = montarResumo();
  configurarAlternanciaPagamento();
  configurarCopiarPix();

  const form = document.getElementById("form-checkout");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dados = {
      nome: document.getElementById("nome").value,
      telefone: document.getElementById("telefone").value,
      email: document.getElementById("email").value,
      rua: document.getElementById("rua").value,
      numero: document.getElementById("numero").value,
      bairro: document.getElementById("bairro").value,
      complemento: document.getElementById("complemento").value,
      obs: document.getElementById("obs").value,
      pagamento: form.querySelector('input[name="pagamento"]:checked').value,
      troco: document.getElementById("troco") ? document.getElementById("troco").value : ""
    };

    if (!validarFormulario(dados)) {
      // rola a tela até o primeiro erro visível
      const primeiroErro = document.querySelector(".input-erro");
      if (primeiroErro) {
        primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
        primeiroErro.focus();
      }
      return;
    }

    const mensagem = montarMensagemWhatsApp(dados, carrinho, subtotal, total);
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");
  });
});