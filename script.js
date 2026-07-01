

/*  Configurações gerais*/
const CHAVE_CARRINHO = "carrinhoMrLouiz";
const TAXA_ENTREGA = 8.00;
const NUMERO_WHATSAPP = "5582996585635"; // DDI + DDD + número
const CHAVE_PIX = "82996585635";          // troque pela sua chave Pix real


/*  2. Funções de apoio (usadas em várias partes do site)*/
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function obterCarrinho() {
  try {
    const salvo = localStorage.getItem(CHAVE_CARRINHO);
    if (salvo) {
      const dados = JSON.parse(salvo);
      if (Array.isArray(dados)) return dados;
    }
  } catch (erro) {
    console.warn("Não foi possível ler o carrinho salvo:", erro);
  }
  return [];
}

function salvarCarrinho(carrinho) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}


/* 3. carrossel de imagens (página inicial / cardápio)*/
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

/* 4. Rastreamento de arquivos (página rastreamento.html) */
function iniciarRastreamento() {
  const statusPedido = document.querySelectorAll("#status-pedido li");
  if (statusPedido.length === 0) return;

  let etapaAtual = 0;

  function atualizarStatus() {
    if (etapaAtual < statusPedido.length) {
      statusPedido[etapaAtual].style.color = "green";
      etapaAtual++;
    }
  }

  setInterval(atualizarStatus, 3000);
}


/* 5. Contador de itens do menu (todas as páginas com carrinho)*/
function atualizarContadorCarrinho() {
  const contadorEl = document.getElementById("contador-carrinho");
  if (!contadorEl) return;

  const carrinho = obterCarrinho();
  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);

  contadorEl.textContent = totalItens;
  contadorEl.classList.toggle("contador-vazio", totalItens === 0);
}


function alterarQtd(id, delta) {
  const spanQtd = document.getElementById(`qtd-${id}`);
  let qtd = parseInt(spanQtd.innerText);
  
  qtd = Math.max(0, qtd + delta); // Garante que nunca seja menor que 1
  spanQtd.innerText = qtd;
}

function adicionarAoCarrinho(id, nome, preco) {
  const qtd = parseInt(document.getElementById(`qtd-${id}`).innerText);
  console.log(`Adicionando ${qtd}x ${nome} ao carrinho por R$ ${(preco * qtd).toFixed(2)}`);
  // Aqui você chama sua função de carrinho existente
}


function iniciarEventosItemCardapio() {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".item-cardapio").forEach(item => {
      const btnMais = item.querySelector(".mais");
      const btnMenos = item.querySelector(".menos");
      const qtdValor = item.querySelector(".qtd-valor");
      const btnAdicionar = item.querySelector(".btn-adicionar");

      btnMais.addEventListener("click", () => {
        qtdValor.textContent = parseInt(qtdValor.textContent) + 1;
      });

      btnMenos.addEventListener("click", () => {
        let qtd = parseInt(qtdValor.textContent);
        if (qtd > 1) qtdValor.textContent = qtd - 1;
      });

      btnAdicionar.addEventListener("click", () => {
        const itemData = {
          id: item.dataset.id,
          nome: item.dataset.nome,
          preco: parseFloat(item.dataset.preco),
          imagem: item.dataset.imagem,
          quantidade: parseInt(qtdValor.textContent)
        };
        adicionarAoCarrinho(itemData);
        qtdValor.textContent = 1;
      });
    });
  });
}

/* 6. Adicionar itens ao carrinho (cardápio, bebidas, combos)*/
function adicionarAoCarrinho(item) {
  const carrinho = obterCarrinho();
  const itemExistente = carrinho.find(i => i.id === item.id);

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      id: item.id,
      nome: item.nome,
      preco: item.preco,
      imagem: item.imagem || "",
      quantidade: 1
    });
  }

  salvarCarrinho(carrinho);
  atualizarContadorCarrinho();
}

function mostrarFeedbackBotao(botao) {
  const textoOriginal = botao.textContent;
  botao.textContent = "Adicionado! ✓";
  botao.classList.add("btn-adicionado");
  botao.disabled = true;

  setTimeout(() => {
    botao.textContent = textoOriginal;
    botao.classList.remove("btn-adicionado");
    botao.disabled = false;
  }, 1200);
}

function iniciarBotoesAdicionar() {
  const botoes = document.querySelectorAll(".btn-adicionar");
  if (botoes.length === 0) return;

  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      const item = {
        id: botao.dataset.id,
        nome: botao.dataset.nome,
        preco: parseFloat(botao.dataset.preco),
        imagem: botao.dataset.imagem
      };

      adicionarAoCarrinho(item);
      mostrarFeedbackBotao(botao);
    });
  });
}


/* 7. Pagina do carrinho (carrinho.html)*/
function renderizarCarrinho() {
  const lista = document.getElementById("carrinho-lista");
  if (!lista) return; // só executa na página do carrinho

  const carrinho = obterCarrinho();
  const btnFinalizar = document.getElementById("btn-finalizar");

  atualizarContadorCarrinho();
  lista.innerHTML = "";

  if (carrinho.length === 0) {
    lista.innerHTML = `
      <div class="carrinho-vazio">
        <p>Seu carrinho está vazio.</p>
        <a href="cardapio.html" class="btn-continuar-grande">Ver Cardápio</a>
      </div>
    `;
    if (btnFinalizar) btnFinalizar.classList.add("btn-desabilitado");
  } else {
    if (btnFinalizar) btnFinalizar.classList.remove("btn-desabilitado");

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

  atualizarResumoCarrinho(carrinho);
}

function atualizarResumoCarrinho(carrinho) {
  const elSubtotal = document.getElementById("resumo-subtotal");
  if (!elSubtotal) return;

  const subtotal = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const taxa = carrinho.length > 0 ? TAXA_ENTREGA : 0;
  const total = subtotal + taxa;

  elSubtotal.textContent = formatarMoeda(subtotal);
  document.getElementById("resumo-taxa").textContent = formatarMoeda(taxa);
  document.getElementById("resumo-total").textContent = formatarMoeda(total);
}

function iniciarEventosCarrinho() {
  const lista = document.getElementById("carrinho-lista");
  if (!lista) return;

  lista.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const carrinho = obterCarrinho();
    const index = parseInt(btn.dataset.index, 10);

    if (btn.classList.contains("qtd-btn")) {
      if (btn.dataset.acao === "aumentar") {
        carrinho[index].quantidade += 1;
      } else {
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


/*8. Pagina de checkout (checkout.html)*/
function montarResumoCheckout() {
  const container = document.getElementById("resumo-itens");
  if (!container) return null; // só executa na página de checkout

  const carrinho = obterCarrinho();
  container.innerHTML = "";

  if (carrinho.length === 0) {
    container.innerHTML = `<p class="resumo-vazio">Seu carrinho está vazio.</p>`;
  }

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

  const taxa = carrinho.length > 0 ? TAXA_ENTREGA : 0;
  const total = subtotal + taxa;

  document.getElementById("resumo-subtotal").textContent = formatarMoeda(subtotal);
  document.getElementById("resumo-taxa").textContent = formatarMoeda(taxa);
  document.getElementById("resumo-total").textContent = formatarMoeda(total);

  return { carrinho, subtotal, total };
}

function limparErrosCheckout() {
  document.querySelectorAll(".erro-msg").forEach(el => el.textContent = "");
  document.querySelectorAll(".checkout-bloco input").forEach(el => el.classList.remove("input-erro"));
}

function mostrarErroCheckout(campoId, mensagem) {
  const erroEl = document.getElementById(`erro-${campoId}`);
  const inputEl = document.getElementById(campoId);
  if (erroEl) erroEl.textContent = mensagem;
  if (inputEl) inputEl.classList.add("input-erro");
}

function validarFormularioCheckout(dados) {
  limparErrosCheckout();
  let valido = true;

  if (!dados.nome.trim()) {
    mostrarErroCheckout("nome", "Por favor, digite seu nome.");
    valido = false;
  }

  const telefoneNumeros = dados.telefone.replace(/\D/g, "");
  if (telefoneNumeros.length < 10) {
    mostrarErroCheckout("telefone", "Digite um WhatsApp válido com DDD.");
    valido = false;
  }

  if (!dados.rua.trim()) {
    mostrarErroCheckout("rua", "Por favor, digite o nome da rua.");
    valido = false;
  }

  if (!dados.numero.trim()) {
    mostrarErroCheckout("numero", "Digite o número.");
    valido = false;
  }

  if (!dados.bairro.trim()) {
    mostrarErroCheckout("bairro", "Digite o bairro.");
    valido = false;
  }

  return valido;
}

function montarMensagemWhatsApp(dados, carrinho, subtotal, total) {
  let mensagem = `🍔 *Novo Pedido - Mr. Louiz*\n\n`;

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

function iniciarAlternanciaPagamento() {
  const radioPix = document.getElementById("pagamento-pix");
  const radioCartao = document.getElementById("pagamento-cartao");
  const blocoPix = document.getElementById("bloco-pix");
  const blocoCartao = document.getElementById("bloco-cartao");

  function atualizarBlocos() {
    if (radioPix.checked) {
      blocoPix.style.display = "block";
      blocoCartao.style.display = "none";
    } else if (radioCartao.checked) {
      blocoCartao.style.display = "block";
      blocoPix.style.display = "none";
    } else {
      blocoPix.style.display = "none";
      blocoCartao.style.display = "none";
    }
  }

  [radioPix, radioCartao].forEach(r => r.addEventListener("change", atualizarBlocos));
  atualizarBlocos();
}

function iniciarCopiarPix() {
  const btn = document.getElementById("btn-copiar-pix");
  const msg = document.getElementById("pix-copiado-msg");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const chave = document.getElementById("pix-chave-valor").textContent;
    navigator.clipboard.writeText(chave).then(() => {
      msg.classList.add("visivel");
      setTimeout(() => msg.classList.remove("visivel"), 2000);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarAlternanciaPagamento();
  iniciarCopiarPix();
});


function iniciarFormularioCheckout() {
  const form = document.getElementById("form-checkout");
  if (!form) return; // só executa na página de checkout

  const resumo = montarResumoCheckout();

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

    if (!validarFormularioCheckout(dados)) {
      const primeiroErro = document.querySelector(".input-erro");
      if (primeiroErro) {
        primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
        primeiroErro.focus();
      }
      return;
    }

    const mensagem = montarMensagemWhatsApp(dados, resumo.carrinho, resumo.subtotal, resumo.total);
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");
  });
}


/* 9. Inicialização geral
  Necessito de lembrar de chamar as funções para poder rodar o código*/

document.addEventListener("DOMContentLoaded", () => {
  iniciarCarrossel();
  iniciarRastreamento();
  atualizarContadorCarrinho();
  iniciarBotoesAdicionar();
  renderizarCarrinho();
  iniciarEventosCarrinho();
  iniciarAlternanciaPagamento();
  iniciarCopiarPix();
  iniciarFormularioCheckout();
});