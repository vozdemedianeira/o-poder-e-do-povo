/**
 * VOZ DE MEDIANEIRA – Google Apps Script
 * =========================================
 * Cole este código no Apps Script da sua planilha Google Sheets.
 *
 * COMO USAR:
 * 1. Abra sua planilha no Google Sheets
 * 2. Menu: Extensões → Apps Script
 * 3. Delete o código padrão e cole este arquivo completo
 * 4. Salve (Ctrl+S)
 * 5. Clique em "Implantar" → "Nova implantação"
 * 6. Tipo: App da Web
 * 7. Executar como: Eu
 * 8. Acesso: Qualquer pessoa
 * 9. Clique em "Implantar" e copie a URL gerada
 * 10. Cole a URL no arquivo assets/main.js (variável SHEETS_URL)
 */

// Nomes das abas da planilha
var ABA_PARTICIPACOES = 'Participações';
var ABA_EMAILS        = 'Emails';
var ABA_CONTATOS      = 'Contatos';

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var ss    = SpreadsheetApp.getActiveSpreadsheet();

    if (dados.origem === 'formulario_principal') {
      salvarParticipacao(ss, dados);
    } else if (dados.origem === 'popup_interesse') {
      salvarEmail(ss, dados);
    } else if (dados.origem === 'contato') {
      salvarContato(ss, dados);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'erro', msg: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function salvarParticipacao(ss, d) {
  var aba = obterOuCriarAba(ss, ABA_PARTICIPACOES, [
    'Data', 'Nome', 'Email', 'Bairro', 'Áreas de Interesse',
    'Maior Problema', 'Sugestões de Melhoria', 'Faixa Etária'
  ]);
  aba.appendRow([
    d.data    || '',
    d.nome    || 'Anônimo',
    d.email   || '',
    d.bairro  || '',
    d.areas   || '',
    d.problema|| '',
    d.melhoria|| '',
    d.idade   || ''
  ]);
}

function salvarEmail(ss, d) {
  var aba = obterOuCriarAba(ss, ABA_EMAILS, [
    'Data', 'Email', 'Origem'
  ]);
  aba.appendRow([
    d.data   || '',
    d.email  || '',
    d.origem || ''
  ]);
}

function salvarContato(ss, d) {
  var aba = obterOuCriarAba(ss, ABA_CONTATOS, [
    'Data', 'Nome', 'Email', 'Assunto', 'Mensagem'
  ]);
  aba.appendRow([
    d.data    || '',
    d.nome    || '',
    d.email   || '',
    d.assunto || '',
    d.mensagem|| ''
  ]);
}

function obterOuCriarAba(ss, nomeAba, cabecalhos) {
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) {
    aba = ss.insertSheet(nomeAba);
    // Formatar cabeçalhos
    var range = aba.getRange(1, 1, 1, cabecalhos.length);
    range.setValues([cabecalhos]);
    range.setFontWeight('bold');
    range.setBackground('#1a6b3c');
    range.setFontColor('#ffffff');
    aba.setFrozenRows(1);
  }
  return aba;
}

// Teste manual (rode no editor do Apps Script)
function testar() {
  var e = {
    postData: {
      contents: JSON.stringify({
        origem:   'formulario_principal',
        data:     new Date().toLocaleString('pt-BR'),
        nome:     'Teste',
        email:    'teste@email.com',
        bairro:   'Centro',
        areas:    'Saúde, Educação',
        problema: 'Falta de médicos especialistas',
        melhoria: 'Mais UBS no interior',
        idade:    '31 a 45 anos'
      })
    }
  };
  Logger.log(doPost(e).getContent());
}
