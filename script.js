// carrossel de imagens
let index = 0;
const slides = document.querySelectorAll('.slides img');

function mostrarSlide() {
  slides.forEach((img, i) => {
    img.style.display = i === index ? 'block' : 'none';
  });
  index = (index + 1) % slides.length;
}

mostrarSlide();
setInterval(mostrarSlide, 4000); // troca a cada 4 segundos

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
