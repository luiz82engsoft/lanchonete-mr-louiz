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
const TAXA_ENTREGA = 5.00;
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

// ===== PERSISTÊNCIA =====
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

// açoes de delegação de evento do carrinho
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