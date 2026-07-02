/* script.js - Mr. Louiz - arquivo único para todo o site (CORRIGIDO) */

const CHAVE_CARRINHO  = "carrinhoMrLouiz";
const TAXA_ENTREGA    = 8.00;
const NUMERO_WHATSAPP = "5582996585635";
const CHAVE_PIX       = "82996585635";

function formatarMoeda(v) {
  return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* Remove itens inválidos/corrompidos (de bugs antigos: nome "undefined",
   preço NaN/null, quantidade 0 ou inválida) e já salva o carrinho limpo. */
function itemValido(i) {
  return i &&
    typeof i.id === "string" && i.id.trim() !== "" &&
    typeof i.nome === "string" && i.nome.trim() !== "" &&
    Number.isFinite(i.preco) && i.preco > 0 &&
    Number.isFinite(i.quantidade) && i.quantidade > 0;
}

function obterCarrinho() {
  let dados = [];
  try {
    const s = localStorage.getItem(CHAVE_CARRINHO);
    if (s) {
      const d = JSON.parse(s);
      if (Array.isArray(d)) dados = d;
    }
  } catch (e) {}

  const limpo = dados.filter(itemValido);

  // Se havia lixo (itens corrompidos de versões antigas), regrava o carrinho já limpo
  if (limpo.length !== dados.length) {
    try { localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(limpo)); } catch (e) {}
  }

  return limpo;
}

function salvarCarrinho(c) {
  try {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(c));
  } catch (e) {
    // Se isso disparar, o navegador está bloqueando o armazenamento local
    // (comum em aba anônima/privada, ou ao abrir o HTML direto do disco em vez de um servidor local)
    console.error("Erro ao salvar carrinho:", e);
    alert("Não foi possível salvar o carrinho neste navegador. Tente abrir o site em uma aba normal (não anônima) ou através de um servidor local, em vez de abrir o arquivo .html diretamente.");
    return;
  }
  // Mantém o contador do cabeçalho e o mini-carrinho sempre sincronizados, para não deixar o usuário confuso
  atualizarContador();
  renderizarMiniCarrinho();
}

function atualizarContador() {
  const el = document.getElementById("contador-carrinho");
  if (!el) return;
  const total = obterCarrinho().reduce((s, i) => s + i.quantidade, 0);
  el.textContent = total;
  el.style.display = total > 0 ? "inline-block" : "none";
}

function alterarQtd(id, delta) {
  const span = document.getElementById("qtd-" + id);
  if (!span) return;
  const novo = Math.max(0, (parseInt(span.innerText, 10) || 0) + delta);
  span.innerText = novo;
}

/* Avisa visualmente quando o usuário tenta adicionar com quantidade 0 */
function mostrarAvisoQtd(id) {
  const span = document.getElementById("qtd-" + id);
  if (!span) { alert("Selecione a quantidade antes de adicionar."); return; }
  span.classList.add("qtd-alerta");
  setTimeout(() => span.classList.remove("qtd-alerta"), 600);
}

function adicionarAoCarrinho(id, nome, preco, imagem) {
  const spanQtd = document.getElementById("qtd-" + id);
  const qtd = spanQtd ? (parseInt(spanQtd.innerText, 10) || 0) : 1;

  if (qtd <= 0) {
    mostrarAvisoQtd(id);
    return;
  }

  const precoNum = parseFloat(preco);
  if (!id || !nome || !Number.isFinite(precoNum) || precoNum <= 0) {
    console.error("Item inválido, não adicionado ao carrinho:", { id, nome, preco });
    return;
  }

  const carrinho = obterCarrinho();
  const existente = carrinho.find(i => i.id === id);

  if (existente) {
    existente.quantidade += qtd;
  } else {
    carrinho.push({ id, nome, preco: precoNum, imagem: imagem || "", quantidade: qtd });
  }

  salvarCarrinho(carrinho);
  if (spanQtd) spanQtd.innerText = "0";

  // Feedback visual no botão clicado
  const botoes = document.querySelectorAll(".btn-adicionar");
  botoes.forEach(b => {
    if (b.getAttribute("onclick") && b.getAttribute("onclick").includes("'" + id + "'")) {
      const txt = b.dataset.textoOriginal || b.textContent;
      b.dataset.textoOriginal = txt;
      b.textContent = "✓ Adicionado!";
      b.disabled = true;
      setTimeout(() => { b.textContent = txt; b.disabled = false; }, 1200);
    }
  });
}

/* MINI-CARRINHO: pequena prévia usada no Cardápio e no Menu,
   mostra o que já foi adicionado (ou está indo) para o carrinho, com os cálculos. */
function renderizarMiniCarrinho() {
  const lista = document.getElementById("mini-carrinho-lista");
  const totalEl = document.getElementById("mini-carrinho-total");
  const contagemEl = document.getElementById("mini-carrinho-contagem");
  if (!lista && !totalEl) return;

  const carrinho = obterCarrinho();

  if (lista) {
    if (carrinho.length === 0) {
      lista.innerHTML = `<p class="mini-carrinho-vazio">Nenhum item adicionado ainda.</p>`;
    } else {
      lista.innerHTML = carrinho.map(item => `
        <div class="mini-carrinho-item">
          <span class="mini-carrinho-item-nome">${item.quantidade}x ${item.nome}</span>
          <span class="mini-carrinho-item-valor">${formatarMoeda(item.preco * item.quantidade)}</span>
          <button type="button" class="mini-carrinho-remover" data-id="${item.id}" title="Remover item">✕</button>
        </div>
      `).join("");
    }
  }

  const total = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);
  if (totalEl) totalEl.textContent = formatarMoeda(total);
  if (contagemEl) contagemEl.textContent = carrinho.reduce((s, i) => s + i.quantidade, 0);
}

/* Permite remover um item direto no mini-carrinho (cardápio/menu) */
function iniciarEventosMiniCarrinho() {
  const lista = document.getElementById("mini-carrinho-lista");
  if (!lista) return;
  lista.addEventListener("click", (e) => {
    const btn = e.target.closest(".mini-carrinho-remover");
    if (!btn) return;
    const id = btn.dataset.id;
    const carrinho = obterCarrinho().filter(i => i.id !== id);
    salvarCarrinho(carrinho);
  });
}

/* CARRINHO (página carrinho.html) */
function renderizarCarrinho() {
  const lista = document.getElementById("carrinho-lista");
  if (!lista) return;
  const carrinho = obterCarrinho();
  const btnFin = document.getElementById("btn-finalizar");
  lista.innerHTML = "";

  if (carrinho.length === 0) {
    lista.innerHTML = `<div class="carrinho-vazio">
      <p>Seu carrinho está vazio.</p>
      <a href="cardapio.html" class="btn-continuar-grande">Ver Cardápio</a>
    </div>`;
    if (btnFin) { btnFin.classList.add("btn-desabilitado"); }
  } else {
    if (btnFin) { btnFin.classList.remove("btn-desabilitado"); }
    carrinho.forEach((item, idx) => {
      const d = document.createElement("div");
      d.className = "carrinho-item";
      d.innerHTML = `
        <img src="${item.imagem || 'img/mr.louiz.jpg'}" alt="${item.nome}">
        <div class="carrinho-item-info">
          <h4>${item.nome}</h4>
          <span class="carrinho-item-preco">${formatarMoeda(item.preco)} cada</span>
        </div>
        <div class="carrinho-item-qtd">
          <button class="qtd-btn" data-acao="diminuir" data-index="${idx}" type="button">−</button>
          <span>${item.quantidade}</span>
          <button class="qtd-btn" data-acao="aumentar" data-index="${idx}" type="button">+</button>
        </div>
        <span class="carrinho-item-total">${formatarMoeda(item.preco * item.quantidade)}</span>
        <button class="carrinho-item-remover" data-index="${idx}" type="button">🗑</button>`;
      lista.appendChild(d);
    });
  }

  const sub = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const taxa = carrinho.length > 0 ? TAXA_ENTREGA : 0;
  const tot  = sub + taxa;
  const el = (id) => document.getElementById(id);
  if (el("resumo-subtotal")) el("resumo-subtotal").textContent = formatarMoeda(sub);
  if (el("resumo-taxa"))     el("resumo-taxa").textContent     = formatarMoeda(taxa);
  if (el("resumo-total"))    el("resumo-total").textContent    = formatarMoeda(tot);
  atualizarContador();
}

function iniciarEventosCarrinho() {
  const lista = document.getElementById("carrinho-lista");
  if (!lista) return;
  lista.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const carrinho = obterCarrinho();
    const idx = parseInt(btn.dataset.index, 10);
    if (btn.classList.contains("qtd-btn")) {
      if (btn.dataset.acao === "aumentar") carrinho[idx].quantidade++;
      else { carrinho[idx].quantidade--; if (carrinho[idx].quantidade <= 0) carrinho.splice(idx, 1); }
      salvarCarrinho(carrinho); renderizarCarrinho();
    }
    if (btn.classList.contains("carrinho-item-remover")) {
      carrinho.splice(idx, 1); salvarCarrinho(carrinho); renderizarCarrinho();
    }
  });
}

/* CHECKOUT - resumo do pedido */
function montarResumoCheckout() {
  const container = document.getElementById("resumo-itens");
  if (!container) return null;
  const carrinho = obterCarrinho();
  container.innerHTML = "";
  if (carrinho.length === 0) {
    container.innerHTML = `<p class="resumo-vazio">Carrinho vazio. <a href="cardapio.html">Adicionar itens</a></p>`;
  }
  let sub = 0;
  carrinho.forEach(item => {
    const tot = item.quantidade * item.preco;
    sub += tot;
    const l = document.createElement("div");
    l.className = "resumo-item";
    l.innerHTML = `<span>${item.quantidade}x ${item.nome}</span><span>${formatarMoeda(tot)}</span>`;
    container.appendChild(l);
  });
  const taxa = carrinho.length > 0 ? TAXA_ENTREGA : 0;
  const tot  = sub + taxa;
  const el = (id) => document.getElementById(id);
  if (el("resumo-subtotal")) el("resumo-subtotal").textContent = formatarMoeda(sub);
  if (el("resumo-taxa"))     el("resumo-taxa").textContent     = formatarMoeda(taxa);
  if (el("resumo-total"))    el("resumo-total").textContent    = formatarMoeda(tot);
  return { carrinho, subtotal: sub, total: tot };
}

function iniciarAlternanciaPagamento() {
  const pix = document.getElementById("pagamento-pix");
  if (!pix) return;
  const din  = document.getElementById("pagamento-dinheiro");
  const bPix = document.getElementById("bloco-pix");
  const bDin = document.getElementById("bloco-dinheiro");
  function atualizar() {
    if (bPix) bPix.classList.toggle("show", pix.checked);
    if (bPix) bPix.style.display = pix.checked ? "block" : "none";
    if (bDin) bDin.style.display = (din && din.checked) ? "block" : "none";
  }
  [pix, din, document.getElementById("pagamento-cartao-debito")]
    .forEach(r => r && r.addEventListener("change", atualizar));
  atualizar();
}

function iniciarCopiarPix() {
  const btn = document.getElementById("btn-copiar-pix");
  const msg = document.getElementById("pix-copiado-msg");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CHAVE_PIX);
      if (msg) { msg.classList.add("visivel"); setTimeout(() => msg.classList.remove("visivel"), 2000); }
    } catch (e) { alert("Chave Pix: " + CHAVE_PIX); }
  });
}

/* CHECKOUT - navegação por etapas (cada parte precisa estar preenchida
   corretamente antes de liberar a próxima) */
function iniciarEtapasCheckout() {
  const form = document.getElementById("form-checkout");
  if (!form) return;
  const etapas = Array.from(document.querySelectorAll(".checkout-etapa"));
  if (etapas.length === 0) return;

  let etapaAtual = 0;

  function mostrarEtapa(idx) {
    etapas.forEach((etapa, i) => {
      etapa.style.display = i === idx ? "" : "none";
      etapa.classList.toggle("etapa-ativa", i === idx);
    });
    etapas[idx].scrollIntoView({ behavior: "smooth", block: "start" });
    atualizarIndicadorEtapas(idx);
  }

  function atualizarIndicadorEtapas(idx) {
    document.querySelectorAll(".indicador-etapa").forEach((el, i) => {
      el.classList.toggle("indicador-ativo", i === idx);
      el.classList.toggle("indicador-concluido", i < idx);
    });
  }

  function validarCampos(etapa) {
    let valido = true;
    const campos = etapa.querySelectorAll("input[required], textarea[required]");
    campos.forEach(campo => {
      const erroEl = document.getElementById("erro-" + campo.id);
      const vazio = !campo.value.trim();
      const telInvalido = campo.id === "telefone" && campo.value.replace(/\D/g, "").length < 10;
      if (vazio || telInvalido) {
        campo.classList.add("input-erro");
        if (erroEl) erroEl.textContent = telInvalido ? "WhatsApp inválido." : "Campo obrigatório.";
        valido = false;
      } else {
        campo.classList.remove("input-erro");
        if (erroEl) erroEl.textContent = "";
      }
    });
    return valido;
  }

  document.querySelectorAll(".btn-continuar-etapa").forEach(btn => {
    btn.addEventListener("click", () => {
      const etapa = btn.closest(".checkout-etapa");
      if (!validarCampos(etapa)) {
        etapa.querySelector(".input-erro")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      etapaAtual = Math.min(etapaAtual + 1, etapas.length - 1);
      mostrarEtapa(etapaAtual);
    });
  });

  document.querySelectorAll(".btn-voltar-etapa").forEach(btn => {
    btn.addEventListener("click", () => {
      etapaAtual = Math.max(etapaAtual - 1, 0);
      mostrarEtapa(etapaAtual);
    });
  });

  mostrarEtapa(0);
}

function iniciarFormularioCheckout() {
  const form = document.getElementById("form-checkout");
  if (!form) return;
  const resumo = montarResumoCheckout();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!resumo || resumo.carrinho.length === 0) {
      alert("Carrinho vazio! Adicione itens antes de finalizar.");
      window.location.href = "cardapio.html";
      return;
    }
    document.querySelectorAll(".erro-msg").forEach(el => el.textContent = "");
    document.querySelectorAll(".input-erro").forEach(el => el.classList.remove("input-erro"));

    let valido = true;
    const get = (id) => document.getElementById(id)?.value || "";

    function erro(id, msg) {
      const elE = document.getElementById("erro-" + id);
      const elI = document.getElementById(id);
      if (elE) elE.textContent = msg;
      if (elI) elI.classList.add("input-erro");
      valido = false;
    }

    if (!get("nome").trim())                            erro("nome",     "Digite seu nome.");
    if (get("telefone").replace(/\D/g, "").length < 10) erro("telefone", "WhatsApp inválido.");
    if (!get("rua").trim())                             erro("rua",      "Digite a rua.");
    if (!get("numero").trim())                          erro("numero",   "Digite o número.");
    if (!get("bairro").trim())                          erro("bairro",   "Digite o bairro.");

    if (!valido) {
      document.querySelector(".input-erro")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const pagEl = form.querySelector('input[name="pagamento"]:checked');
    const dados = {
      nome: get("nome"), telefone: get("telefone"), rua: get("rua"),
      numero: get("numero"), bairro: get("bairro"),
      complemento: get("complemento"), obs: get("obs"),
      pagamento: pagEl ? pagEl.value : "Não informado",
      troco: get("troco")
    };

    let msg = ` *Novo Pedido - Mr. Louiz*\n\n`;
    msg += `*Cliente:* ${dados.nome}\n*WhatsApp:* ${dados.telefone}\n\n`;
    msg += `*Itens:*\n`;
    resumo.carrinho.forEach(i => msg += `• ${i.quantidade}x ${i.nome} — ${formatarMoeda(i.quantidade * i.preco)}\n`);
    msg += `\n*Subtotal:* ${formatarMoeda(resumo.subtotal)}\n`;
    msg += `*Taxa de entrega:* ${formatarMoeda(TAXA_ENTREGA)}\n`;
    msg += `*Total:* ${formatarMoeda(resumo.total)}\n\n`;
    msg += `*Endereço:* ${dados.rua}, ${dados.numero} — ${dados.bairro}\n`;
    if (dados.complemento.trim()) msg += `Complemento: ${dados.complemento}\n`;
    if (dados.obs.trim()) msg += `*Obs:* ${dados.obs}\n`;
    msg += `\n*Pagamento:* ${dados.pagamento}`;
    if (dados.pagamento === "Dinheiro" && dados.troco.trim()) msg += `\n*Troco para:* ${dados.troco}`;
    if (dados.pagamento === "Pix") msg += `\n*Chave Pix:* ${CHAVE_PIX}`;

    localStorage.removeItem(CHAVE_CARRINHO);
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  });
}

function iniciarRastreamento() {
  const itens = document.querySelectorAll("#status-pedido li");
  if (!itens.length) return;
  let etapa = 0;
  setInterval(() => { if (etapa < itens.length) { itens[etapa].style.color = "green"; etapa++; } }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarContador();
  renderizarMiniCarrinho();
  iniciarEventosMiniCarrinho();
  iniciarRastreamento();
  renderizarCarrinho();
  iniciarEventosCarrinho();
  iniciarAlternanciaPagamento();
  iniciarCopiarPix();
  iniciarEtapasCheckout();
  iniciarFormularioCheckout();
});