// Função de envio do formulário (chamada pelo onsubmit)
async function enviarParticipacao(event) {
  event.preventDefault();
  
  // Validar área selecionada
  const areaSelecionada = selectArea.value;
  if (!areaSelecionada || areaSelecionada === "") {
    mostrarToast('⚠️ Selecione uma área de interesse antes de enviar.', 'error');
    selectArea.focus();
    return;
  }
  
  // Validar nome obrigatório
  const nomeInput = document.getElementById('p-nome');
  const nome = nomeInput?.value?.trim() || '';
  if (!nome) {
    mostrarToast('⚠️ Por favor, informe seu nome.', 'error');
    nomeInput?.focus();
    return;
  }
  
  // Validar campo obrigatório: problema
  const problemaInput = document.getElementById('p-problema');
  const problema = problemaInput?.value?.trim() || '';
  if (!problema) {
    mostrarToast('⚠️ Por favor, informe o maior problema que você vê em Medianeira.', 'error');
    problemaInput?.focus();
    return;
  }
  
  // Validar LGPD
  const lgpdCheck = document.getElementById('p-lgpd');
  if (!lgpdCheck?.checked) {
    mostrarToast('⚠️ Você precisa concordar com a Política de Privacidade e LGPD.', 'error');
    return;
  }
  
  // Validar email se foi preenchido (opcional, mas se preenchido deve ser válido)
  const emailInput = document.getElementById('p-email');
  const email = emailInput?.value?.trim() || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (email && !emailRegex.test(email)) {
    mostrarToast('⚠️ Por favor, informe um email válido ou deixe o campo em branco.', 'error');
    emailInput?.focus();
    return;
  }
  
  // Capturar telefone CORRETAMENTE
  const telefoneInput = document.getElementById('p-telefone');
  const telefone = telefoneInput?.value?.trim() || '';
  console.log('Telefone capturado:', telefone); // Para debug
  
  // Coletar todos os dados do formulário
  const dados = {
    area: areaSelecionada,
    nome: nome,
    email: email,
    telefone: telefone,  // ← Garantindo que o telefone seja enviado
    bairro: document.getElementById('p-bairro')?.value?.trim() || '',
    problema: problema,
    melhoria: document.getElementById('p-melhoria')?.value?.trim() || '',
    idade: document.getElementById('p-idade')?.value || '',
    timestamp: new Date().toISOString()
  };
  
  console.log('Dados completos sendo enviados:', dados); // Para debug
  
  // Desabilitar botão enquanto envia
  const btnSubmit = document.querySelector('#formParticipacao button[type="submit"]');
  const textoOriginal = btnSubmit?.innerHTML;
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Enviando...';
  }
  
  // Enviar para o Google Sheets
  const resultado = await enviarParaGoogleSheets(dados);
  
  // Reabilitar botão
  if (btnSubmit) {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = textoOriginal;
  }
  
  if (resultado.success) {
    mostrarToast('✅ Participação enviada com sucesso! Obrigado por contribuir.', 'success');
    
    // Limpar campos do formulário
    if (selectArea) selectArea.value = '';
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
    
  } else {
    mostrarToast('❌ Erro ao enviar. Verifique sua conexão e tente novamente.', 'error');
  }
}
