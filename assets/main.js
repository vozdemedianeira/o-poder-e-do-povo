/* ============================================
   VOZ DE MEDIANEIRA – main.js
   Nav mobile · Formulário com Google Forms
   Popups · Toast
   ============================================ */

// ─── ANO ATUAL ──────────────────────────────────────────────
document.querySelectorAll('#ano, .ano-footer').forEach(function(el){
  el.textContent = new Date().getFullYear();
});

// ─── NAV MOBILE ─────────────────────────────────────────────
var navToggle = document.querySelector('.nav-toggle');
var navMenu   = document.getElementById('nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', function(){
    var open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', function(e){
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ─── TOAST ──────────────────────────────────────────────────
function mostrarToast(msg, isError = false) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  if (isError) toast.style.background = '#dc2626';
  else toast.style.background = '#0f766e';
  setTimeout(function(){ 
    toast.classList.remove('show');
    toast.style.background = '#0f766e';
  }, 4000);
}

// ─── POPUPS ─────────────────────────────────────────────────
var popupInteresseMostrado = false;
var popupAbandonoMostrado  = false;

function fecharPopup(id) {
  var el = document.getElementById(id);
  if (el) el.hidden = true;
}

function abrirPopup(id) {
  var el = document.getElementById(id);
  if (el) el.hidden = false;
}

// Popup interesse: 10s
var popupInteresse = document.getElementById('popupInteresse');
if (popupInteresse) {
  setTimeout(function(){
    if (!popupInteresseMostrado && !localStorage.getItem('popupInteresseFechado')) {
      abrirPopup('popupInteresse');
      popupInteresseMostrado = true;
    }
  }, 10000);
}

// Popup abandono
var popupAbandono = document.getElementById('popupAbandono');
if (popupAbandono) {
  document.addEventListener('mouseleave', function(e){
    if (e.clientY <= 0 && !popupAbandonoMostrado && !localStorage.getItem('popupAbandonoFechado')) {
      abrirPopup('popupAbandono');
      popupAbandonoMostrado = true;
    }
  });
}

// Fechar popups com ESC
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') {
    document.querySelectorAll('.popup-overlay').forEach(function(el){
      el.hidden = true;
    });
  }
});

// ─── FORMULÁRIO: LIMITE DE 3 ÁREAS ──────────────────────────
var checkboxes = document.querySelectorAll('#areasPrioritarias input[type="checkbox"]');
var areasCounter = document.getElementById('areasCounter');
var areasHidden = document.getElementById('p-areas');

function atualizarAreasSelecionadas() {
  var selecionadas = [];
  checkboxes.forEach(function(cb){
    if (cb.checked) selecionadas.push(cb.value);
  });
  
  if (selecionadas.length > 3) {
    mostrarToast('⚠️ Você só pode selecionar até 3 áreas prioritárias.', true);
    return false;
  }
  
  if (areasHidden) areasHidden.value = selecionadas.join(', ');
  if (areasCounter) {
    areasCounter.innerHTML = `Selecionadas: ${selecionadas.length}/3`;
    if (selecionadas.length === 3) {
      areasCounter.style.color = '#dc2626';
    } else {
      areasCounter.style.color = '#666';
    }
  }
  return true;
}

if (checkboxes.length) {
  checkboxes.forEach(function(cb){
    cb.addEventListener('change', function(){
      var selecionadas = [];
      checkboxes.forEach(function(c){ if (c.checked) selecionadas.push(c); });
      if (selecionadas.length > 3) {
        this.checked = false;
        mostrarToast('⚠️ Máximo de 3 áreas prioritárias atingido.', true);
      }
      atualizarAreasSelecionadas();
    });
  });
  atualizarAreasSelecionadas();
}

// ─── ENVIO PARA GOOGLE FORMS ────────────────────────────────
// URL do seu Google Forms para envio (action)
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfzINuxHNHbDmjZ8JCC5z_p6DyfLzYW7pTVvKxQoQX6NLpgPA/formResponse';

function enviarParticipacao(event) {
  event.preventDefault();
  
  var nome = document.getElementById('p-nome')?.value.trim() || '';
  var email = document.getElementById('p-email')?.value.trim();
  var bairro = document.getElementById('p-bairro')?.value.trim() || '';
  var idade = document.getElementById('p-idade')?.value || '';
  var areas = document.getElementById('p-areas')?.value || '';
  var menosPrioritaria = document.getElementById('p-menosPrioritaria')?.value || '';
  var problema = document.getElementById('p-problema')?.value.trim();
  var melhoria = document.getElementById('p-melhoria')?.value.trim() || '';
  var audiencia = document.getElementById('p-audiencia')?.value || '';
  var lgpd = document.getElementById('p-lgpd')?.checked;
  
  // Validações
  if (!email || !email.includes('@')) {
    mostrarToast('⚠️ Por favor, informe um e-mail válido.', true);
    document.getElementById('p-email')?.focus();
    return;
  }
  
  if (!problema) {
    mostrarToast('⚠️ Por favor, descreva o problema que você observa.', true);
    document.getElementById('p-problema')?.focus();
    return;
  }
  
  if (!lgpd) {
    mostrarToast('⚠️ Você precisa autorizar o uso dos dados conforme a LGPD.', true);
    return;
  }
  
  // Verificar se pelo menos uma área prioritária foi selecionada
  var areasSelecionadas = [];
  checkboxes.forEach(function(cb){
    if (cb.checked) areasSelecionadas.push(cb.value);
  });
  if (areasSelecionadas.length === 0) {
    mostrarToast('⚠️ Selecione pelo menos 1 área prioritária.', true);
    return;
  }
  
  mostrarToast('⏳ Enviando sua participação...');
  
  // Criar iframe oculto para submit (evita reload da página)
  var iframe = document.createElement('iframe');
  iframe.name = 'hiddenFrame';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  var tempForm = document.createElement('form');
  tempForm.method = 'POST';
  tempForm.action = GOOGLE_FORM_URL;
  tempForm.target = 'hiddenFrame';
  tempForm.style.display = 'none';
  
  // Mapeamento dos campos para os entry.xxxx do Google Forms
  var campos = {
    'entry.573861691': nome,      // Nome
    'entry.1437867021': email,    // E-mail
    'entry.1890320292': bairro,   // Bairro
    'entry.1668619384': idade,    // Faixa etária
    'entry.659213285': areas,     // Áreas prioritárias
    'entry.1572797503': menosPrioritaria, // Área menos prioritária
    'entry.1206017577': problema, // Problema
    'entry.861152238': melhoria,  // Sugestão de melhoria
    'entry.1234567890': audiencia, // Participação em audiências
    'entry.853641205': lgpd ? 'Autorizo' : '' // LGPD
  };
  
  for (var key in campos) {
    if (campos[key]) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = campos[key];
      tempForm.appendChild(input);
    }
  }
  
  document.body.appendChild(tempForm);
  tempForm.submit();
  
  // Limpar e mostrar sucesso após envio
  setTimeout(function(){
    document.body.removeChild(tempForm);
    document.body.removeChild(iframe);
    mostrarToast('✅ Participação registrada! Obrigado por contribuir com Medianeira.');
    
    // Limpar formulário
    var form = document.getElementById('formParticipacao');
    if (form) form.reset();
    
    // Resetar checkboxes visualmente
    checkboxes.forEach(function(cb){ cb.checked = false; });
    atualizarAreasSelecionadas();
    
    // Fechar popups se estiverem abertos
    fecharPopup('popupInteresse');
    fecharPopup('popupAbandono');
    
    // Marcar popups como fechados para não reabrir
    localStorage.setItem('popupInteresseFechado', 'true');
    localStorage.setItem('popupAbandonoFechado', 'true');
  }, 500);
}

// ─── CAPTURA EMAIL (popup interesse) ────────────────────────
function capturarEmailInteresse(event) {
  event.preventDefault();
  var input = document.getElementById('pi-email');
  if (!input) return;
  var email = input.value.trim();
  if (!email || !email.includes('@')) {
    input.focus();
    mostrarToast('⚠️ Informe um e-mail válido.', true);
    return;
  }
  
  // Enviar email para o Google Forms também (como lead)
  var iframe = document.createElement('iframe');
  iframe.name = 'hiddenFrameEmail';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  var tempForm = document.createElement('form');
  tempForm.method = 'POST';
  tempForm.action = GOOGLE_FORM_URL;
  tempForm.target = 'hiddenFrameEmail';
  tempForm.style.display = 'none';
  
  var campoEmail = document.createElement('input');
  campoEmail.type = 'hidden';
  campoEmail.name = 'entry.1437867021';
  campoEmail.value = email;
  tempForm.appendChild(campoEmail);
  
  document.body.appendChild(tempForm);
  tempForm.submit();
  
  setTimeout(function(){
    document.body.removeChild(tempForm);
    document.body.removeChild(iframe);
  }, 500);
  
  fecharPopup('popupInteresse');
  mostrarToast('✅ Cadastrado! Você receberá os resultados em breve.');
  localStorage.setItem('popupInteresseFechado', 'true');
}

// ─── FUNÇÕES GLOBAIS ────────────────────────────────────────
window.enviarParticipacao = enviarParticipacao;
window.capturarEmailInteresse = capturarEmailInteresse;
window.fecharPopup = fecharPopup;
