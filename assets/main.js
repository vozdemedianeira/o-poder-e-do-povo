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
function mostrarToast(msg, tipo) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('success', 'error');
  if (tipo === 'success') toast.classList.add('success');
  if (tipo === 'error') toast.classList.add('error');
  toast.classList.add('show');
  setTimeout(function(){ 
    toast.classList.remove('show', 'success', 'error'); 
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

// ─── MÁSCARA DE TELEFONE ────────────────────────────────────
var telefoneInput = document.getElementById('p-telefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', function(e) {
    var value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 0) {
      if (value.length <= 2) {
        value = '(' + value;
      } else if (value.length <= 6) {
        value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
      } else if (value.length <= 10) {
        value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 6) + ' ' + value.slice(6);
      } else {
        value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + ' ' + value.slice(7, 11);
      }
    }
    e.target.value = value;
  });
}

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
  mostrarToast('✅ Cadastrado! Você receberá os resultados em breve.', 'success');
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
  
  // Validar área selecionada
  const selectArea = document.getElementById('p-areas-select');
  const areaSelecionada = selectArea ? selectArea.value : '';
  if (!areaSelecionada || areaSelecionada === "") {
    mostrarToast('⚠️ Selecione uma área de interesse antes de enviar.', 'error');
    if (selectArea) selectArea.focus();
    return;
  }
  
  // Validar nome obrigatório
  const nomeInput = document.getElementById('p-nome');
  const nome = nomeInput ? nomeInput.value.trim() : '';
  if (!nome) {
    mostrarToast('⚠️ Por favor, informe seu nome.', 'error');
    if (nomeInput) nomeInput.focus();
    return;
  }
  
  // Validar campo obrigatório: problema
  const problemaInput = document.getElementById('p-problema');
  const problema = problemaInput ? problemaInput.value.trim() : '';
  if (!problema) {
    mostrarToast('⚠️ Por favor, informe o maior problema que você vê em Medianeira.', 'error');
    if (problemaInput) problemaInput.focus();
    return;
  }
  
  // Validar LGPD
  const lgpdCheck = document.getElementById('p-lgpd');
  if (!lgpdCheck || !lgpdCheck.checked) {
    mostrarToast('⚠️ Você precisa concordar com a Política de Privacidade e LGPD.', 'error');
    return;
  }
  
  // Validar email se foi preenchido (opcional, mas se preenchido deve ser válido)
  const emailInput = document.getElementById('p-email');
  const email = emailInput ? emailInput.value.trim() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (email && !emailRegex.test(email)) {
    mostrarToast('⚠️ Por favor, informe um email válido ou deixe o campo em branco.', 'error');
    if (emailInput) emailInput.focus();
    return;
  }
  
  // Capturar telefone
  const telefoneInput = document.getElementById('p-telefone');
  const telefone = telefoneInput ? telefoneInput.value.trim() : '';
  
  // Coletar todos os dados do formulário
  const dados = {
    area: areaSelecionada,
    nome: nome,
    email: email,
    telefone: telefone,
    bairro: document.getElementById('p-bairro') ? document.getElementById('p-bairro').value.trim() : '',
    problema: problema,
    melhoria: document.getElementById('p-melhoria') ? document.getElementById('p-melhoria').value.trim() : '',
    idade: document.getElementById('p-idade') ? document.getElementById('p-idade').value : '',
    timestamp: new Date().toISOString()
  };
  
  // Desabilitar botão enquanto envia
  const btnSubmit = document.querySelector('#formParticipacao button[type="submit"]');
  const textoOriginal = btnSubmit ? btnSubmit.innerHTML : '';
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Enviando...';
  }
  
  // Enviar para o Google Sheets
  enviarEmailParaSheets(dados, function(sucesso) {
    // Reabilitar botão
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = textoOriginal;
    }
    
    if (sucesso !== false) {
      mostrarToast('✅ Participação enviada com sucesso! Obrigado por contribuir.', 'success');
      
      // Abrir popup de compartilhamento após 1.5 segundos
      setTimeout(function() {
        abrirPopupCompartilhar();
      }, 1500);
      
      // Limpar campos do formulário
      if (selectArea) selectArea.value = '';
      const selectedAreaDisplay = document.getElementById('selectedAreaDisplay');
      if (selectedAreaDisplay) selectedAreaDisplay.style.display = 'none';
      if (nomeInput) nomeInput.value = '';
      if (emailInput) emailInput.value = '';
      const telefoneInputReset = document.getElementById('p-telefone');
      if (telefoneInputReset) telefoneInputReset.value = '';
      const bairroInput = document.getElementById('p-bairro');
      if (bairroInput) bairroInput.value = '';
      if (problemaInput) problemaInput.value = '';
      const melhoriaInput = document.getElementById('p-melhoria');
      if (melhoriaInput) melhoriaInput.value = '';
      const idadeSelect = document.getElementById('p-idade');
      if (idadeSelect) idadeSelect.value = '';
      const lgpdCheckbox = document.getElementById('p-lgpd');
      if (lgpdCheckbox) lgpdCheckbox.checked = false;
      
      // Limpar áreas selecionadas se existir
      selectedAreas = [];
      document.querySelectorAll('.area-btn').forEach(function(b){ 
        b.setAttribute('aria-pressed', 'false'); 
      });
      atualizarSelectedDisplay();
      
    } else {
      mostrarToast('❌ Erro ao enviar. Verifique sua conexão e tente novamente.', 'error');
    }
  });
}

function limparFormParticipacao() {
  ['p-nome', 'p-email', 'p-telefone', 'p-bairro', 'p-problema', 'p-melhoria'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var selectArea = document.getElementById('p-areas-select');
  if (selectArea) selectArea.value = '';
  var idade = document.getElementById('p-idade');
  if (idade) idade.selectedIndex = 0;
  var lgpd = document.getElementById('p-lgpd');
  if (lgpd) lgpd.checked = false;
  
  // Esconder display da área selecionada
  var selectedAreaDisplay = document.getElementById('selectedAreaDisplay');
  if (selectedAreaDisplay) selectedAreaDisplay.style.display = 'none';
  
  selectedAreas = [];
  document.querySelectorAll('.area-btn').forEach(function(b){ b.setAttribute('aria-pressed','false'); });
  atualizarSelectedDisplay();
}

// ─── POPUP DE COMPARTILHAMENTO SOCIAL ───────────────────────
function abrirPopupCompartilhar() {
  const popup = document.getElementById('popupCompartilhar');
  if (popup) {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Configurar links de compartilhamento
    const urlParaCompartilhar = encodeURIComponent(window.location.href.replace('participar.html', ''));
    const textoCompartilhar = encodeURIComponent('📢 Participe da pesquisa cidadã de Medianeira! Sua opinião faz a diferença na nossa cidade. 🇧🇷');
    
    // WhatsApp
    const whatsappBtn = document.getElementById('shareWhatsApp');
    if (whatsappBtn) {
      whatsappBtn.href = `https://wa.me/?text=${textoCompartilhar}%20${urlParaCompartilhar}`;
    }
    
    // Instagram (abre o app ou perfil)
    const instagramBtn = document.getElementById('shareInstagram');
    if (instagramBtn) {
      instagramBtn.href = `https://www.instagram.com/create/story/?text=${textoCompartilhar}&url=${urlParaCompartilhar}`;
    }
    
    // Messenger
    const messengerBtn = document.getElementById('shareMessenger');
    if (messengerBtn) {
      messengerBtn.href = `https://www.facebook.com/dialog/send?link=${urlParaCompartilhar}&app_id=0&redirect_uri=${urlParaCompartilhar}`;
    }
  }
}

function fecharPopupCompartilhar() {
  const popup = document.getElementById('popupCompartilhar');
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Fechar popup clicando no overlay
document.addEventListener('click', function(e) {
  const popup = document.getElementById('popupCompartilhar');
  if (popup && popup.style.display === 'flex') {
    if (e.target.classList && e.target.classList.contains('popup-social-overlay')) {
      fecharPopupCompartilhar();
    }
  }
});

// Fechar com ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    fecharPopupCompartilhar();
  }
});

// ─── FORMULÁRIO CONTATO ──────────────────────────────────────
function enviarContato(event) {
  event.preventDefault();
  var nome     = val('c-nome');
  var email    = val('c-email');
  var mensagem = val('c-mensagem');
  var lgpd     = document.getElementById('c-lgpd');
  if (!nome) { mostrarToast('⚠️ Por favor, informe seu nome.', 'error'); return; }
  if (!email || !email.includes('@')) { mostrarToast('⚠️ Por favor, informe um email válido.', 'error'); return; }
  if (!mensagem) { mostrarToast('⚠️ Por favor, escreva sua mensagem.', 'error'); return; }
  if (!lgpd || !lgpd.checked) { mostrarToast('⚠️ Por favor, aceite a Política de Privacidade.', 'error'); return; }
  var dados = {
    origem:   'contato',
    data:     dataAtual(),
    nome:     nome,
    email:    email,
    assunto:  val('c-assunto'),
    mensagem: mensagem,
  };
  mostrarToast('⏳ Enviando mensagem...', 'info');
  enviarEmailParaSheets(dados, function(){
    mostrarToast('✅ Mensagem enviada! Responderemos em até 3 dias úteis.', 'success');
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
var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyXOC2MkDOXTd48QC_zTEGSt-jvu7SXkgVn98x-O8YnFbPk8lONgmvQgcSuvV9uW2AMJQ/exec';

function enviarEmailParaSheets(dados, callback) {
  if (!SHEETS_URL || SHEETS_URL === 'COLOQUE_SUA_URL_AQUI') {
    // Modo desenvolvimento: simula sucesso
    console.log('[Voz de Medianeira] Dados que seriam enviados:', dados);
    if (callback) callback(true);
    return;
  }
  fetch(SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  }).then(function(){
    if (callback) callback(true);
  }).catch(function(err){
    console.error('[Voz de Medianeira] Erro ao enviar:', err);
    if (callback) callback(false);
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
