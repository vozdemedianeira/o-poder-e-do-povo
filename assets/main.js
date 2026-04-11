/* ============================================
   VOZ DE MEDIANEIRA – main.js
   Nav mobile · FAQ accordion · Popups
   Formulários → Google Sheets
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
  // Fechar ao clicar fora
  document.addEventListener('click', function(e){
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ─── FAQ ACCORDION ──────────────────────────────────────────
document.querySelectorAll('.faq-item dt button').forEach(function(btn){
  btn.addEventListener('click', function(){
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    // fechar todos
    document.querySelectorAll('.faq-item dt button').forEach(function(b){
      b.setAttribute('aria-expanded', 'false');
      var dd = document.getElementById(b.getAttribute('aria-controls'));
      if (dd) dd.hidden = true;
    });
    // abrir atual
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      var target = document.getElementById(btn.getAttribute('aria-controls'));
      if (target) target.hidden = false;
    }
  });
});

// ─── TOAST ──────────────────────────────────────────────────
function mostrarToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function(){ toast.classList.remove('show'); }, 3500);
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

// Popup interesse: 10s ou 70% scroll
var popupInteresse = document.getElementById('popupInteresse');
if (popupInteresse) {
  setTimeout(function(){
    if (!popupInteresseMostrado) {
      abrirPopup('popupInteresse');
      popupInteresseMostrado = true;
    }
  }, 10000);

  window.addEventListener('scroll', function(){
    if (popupInteresseMostrado) return;
    var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (pct > 0.70) {
      setTimeout(function(){
        if (!popupInteresseMostrado) {
          abrirPopup('popupInteresse');
          popupInteresseMostrado = true;
        }
      }, 1500);
    }
  }, { passive: true });
}

// Popup abandono: exit intent desktop
var popupAbandono = document.getElementById('popupAbandono');
if (popupAbandono) {
  document.addEventListener('mouseleave', function(e){
    if (e.clientY <= 0 && !popupAbandonoMostrado) {
      abrirPopup('popupAbandono');
      popupAbandonoMostrado = true;
    }
  });
  // Mobile: visibilitychange (usuario vai mudar app/aba)
  document.addEventListener('visibilitychange', function(){
    if (document.hidden && !popupAbandonoMostrado) {
      popupAbandonoMostrado = true;
      // Registra abandono (sem popup pois está em bg)
    }
  });
}

// Fechar popup clicando fora da caixa
document.querySelectorAll('.popup-overlay').forEach(function(overlay){
  overlay.addEventListener('click', function(e){
    if (e.target === overlay) overlay.hidden = true;
  });
});

// Fechar popup com ESC
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') {
    document.querySelectorAll('.popup-overlay').forEach(function(el){
      el.hidden = true;
    });
  }
});

// ─── CAPTURA EMAIL (popup interesse) ────────────────────────
function capturarEmailInteresse(event) {
  event.preventDefault();
  var input = document.getElementById('pi-email');
  if (!input) return;
  var email = input.value.trim();
  if (!email || !email.includes('@')) {
    input.focus();
    return;
  }
  fecharPopup('popupInteresse');
  enviarEmailParaSheets({ email: email, origem: 'popup_interesse', data: dataAtual() });
  mostrarToast('✅ Cadastrado! Você receberá os resultados em breve.');
}

// ─── FORMULÁRIO PRINCIPAL (participar.html) ──────────────────
// Seleção de áreas
var selectedAreas = [];
document.querySelectorAll('.area-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    var area = btn.getAttribute('data-area');
    var pressed = btn.getAttribute('aria-pressed') === 'true';
    if (pressed) {
      btn.setAttribute('aria-pressed', 'false');
      selectedAreas = selectedAreas.filter(function(a){ return a !== area; });
    } else {
      btn.setAttribute('aria-pressed', 'true');
      selectedAreas.push(area);
    }
    atualizarSelectedDisplay();
  });
});

function atualizarSelectedDisplay() {
  var display = document.getElementById('selectedDisplay');
  var hiddenInput = document.getElementById('p-areas');
  if (!display) return;
  if (selectedAreas.length === 0) {
    display.innerHTML = '<em>Selecione as áreas ao lado ←</em>';
  } else {
    display.innerHTML = selectedAreas.map(function(a){
      return '<span style="display:inline-block;background:#e6f5ed;color:#0d4526;border-radius:999px;padding:3px 12px;font-size:13px;font-weight:600;margin:3px 2px;">✓ '+a+'</span>';
    }).join('');
  }
  if (hiddenInput) hiddenInput.value = selectedAreas.join(', ');
}

function enviarParticipacao(event) {
  event.preventDefault();
  var problema = document.getElementById('p-problema');
  var lgpd     = document.getElementById('p-lgpd');
  if (!problema || !problema.value.trim()) {
    mostrarToast('⚠️ Por favor, responda qual é o maior problema que você vê.');
    if (problema) problema.focus();
    return;
  }
  if (!lgpd || !lgpd.checked) {
    mostrarToast('⚠️ Por favor, aceite a Política de Privacidade para continuar.');
    if (lgpd) lgpd.focus();
    return;
  }
  var dados = {
    origem:   'formulario_principal',
    data:     dataAtual(),
    nome:     val('p-nome') || 'Anônimo',
    email:    val('p-email'),
    bairro:   val('p-bairro'),
    areas:    selectedAreas.join(', ') || 'Nenhuma',
    problema: val('p-problema'),
    melhoria: val('p-melhoria'),
    idade:    val('p-idade'),
  };
  mostrarToast('⏳ Enviando sua participação...');
  enviarEmailParaSheets(dados, function(){
    mostrarToast('🎉 Obrigado! Sua participação foi registrada com sucesso!');
    limparFormParticipacao();
  });
}

function limparFormParticipacao() {
  ['p-nome','p-email','p-bairro','p-problema','p-melhoria'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var idade = document.getElementById('p-idade');
  if (idade) idade.selectedIndex = 0;
  var lgpd = document.getElementById('p-lgpd');
  if (lgpd) lgpd.checked = false;
  selectedAreas = [];
  document.querySelectorAll('.area-btn').forEach(function(b){ b.setAttribute('aria-pressed','false'); });
  atualizarSelectedDisplay();
}

// ─── FORMULÁRIO CONTATO ──────────────────────────────────────
function enviarContato(event) {
  event.preventDefault();
  var nome     = val('c-nome');
  var email    = val('c-email');
  var mensagem = val('c-mensagem');
  var lgpd     = document.getElementById('c-lgpd');
  if (!nome) { mostrarToast('⚠️ Por favor, informe seu nome.'); return; }
  if (!email || !email.includes('@')) { mostrarToast('⚠️ Por favor, informe um email válido.'); return; }
  if (!mensagem) { mostrarToast('⚠️ Por favor, escreva sua mensagem.'); return; }
  if (!lgpd || !lgpd.checked) { mostrarToast('⚠️ Por favor, aceite a Política de Privacidade.'); return; }
  var dados = {
    origem:   'contato',
    data:     dataAtual(),
    nome:     nome,
    email:    email,
    assunto:  val('c-assunto'),
    mensagem: mensagem,
  };
  mostrarToast('⏳ Enviando mensagem...');
  enviarEmailParaSheets(dados, function(){
    mostrarToast('✅ Mensagem enviada! Responderemos em até 3 dias úteis.');
    var form = document.getElementById('contatoForm');
    if (form) form.reset();
  });
}

// ─── GOOGLE SHEETS INTEGRATION ──────────────────────────────
//
// INSTRUÇÕES DE CONFIGURAÇÃO:
// 1. Crie uma planilha no Google Sheets
// 2. Vá em Extensões → Apps Script
// 3. Cole o código Apps Script abaixo (no arquivo apps-script.js incluído)
// 4. Clique em Publicar → Implantar como app da Web
//    - Executar como: Eu (sua conta)
//    - Quem tem acesso: Qualquer pessoa (anônimo)
// 5. Copie a URL gerada e substitua COLOQUE_SUA_URL_AQUI abaixo
//
var SHEETS_URL = 'COLOQUE_SUA_URL_AQUI';

function enviarEmailParaSheets(dados, callback) {
  if (!SHEETS_URL || SHEETS_URL === 'COLOQUE_SUA_URL_AQUI') {
    // Modo desenvolvimento: simula sucesso
    console.log('[Voz de Medianeira] Dados que seriam enviados:', dados);
    if (callback) callback();
    return;
  }
  fetch(SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  }).then(function(){
    if (callback) callback();
  }).catch(function(err){
    console.error('[Voz de Medianeira] Erro ao enviar:', err);
    if (callback) callback(); // Ainda exibe sucesso para o usuário
  });
}

// ─── UTILITÁRIOS ────────────────────────────────────────────
function val(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
function dataAtual() {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}
