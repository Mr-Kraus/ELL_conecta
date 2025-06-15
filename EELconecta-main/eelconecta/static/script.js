let selecionadas = [];

async function selecionar(id) {
  const btn = document.getElementById(id);
  if (btn.classList.contains('selected')) {
    btn.classList.remove('selected');
    selecionadas = selecionadas.filter(x => x !== id);
  } else {
    btn.classList.add('selected');
    selecionadas.push(id);
  }
  await atualizarDisponiveis();
}







function carregarFase(fase) {
  const checkbox = event.target;
  const botoes = document.querySelectorAll(`.disciplina[data-fase="${fase}"]`);

  botoes.forEach(btn => {
    if (checkbox.checked) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
  console.log('AQUI ENTROU');
  gerarDisponiveis();
}





function selecionarEDisparar(id) {
  const btn = document.getElementById(id);

  if (!btn.classList.contains('selected')) {
    // Adiciona a seleção
    btn.classList.add('selected');
  } else {
    // Remove a seleção
    btn.classList.remove('selected');
  }
  console.log('AQUI ENTROU 2');
  // Em ambos os casos, atualiza as disciplinas disponíveis
  gerarDisponiveis();
}





async function gerarDisponiveis() {
  const selecionadas = Array.from(document.querySelectorAll('.disciplina.selected')).map(btn => btn.id);
  console.log('Disciplinas selecionadas:', selecionadas);

  try {
    const res = await fetch('/api/check_subjects', {  // mudou a URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected: selecionadas, course: 'eletrica' })  // chaves do backend
    });

    if (!res.ok) {
      console.error('Erro na resposta do servidor:', res.status);
      const text = await res.text();
      console.error('Resposta do servidor:', text);
      return;
    }

    const { available } = await res.json();  // chave 'available' conforme backend
    console.log('Disciplinas disponíveis recebidas do backend:', available);

    document.querySelectorAll('.disciplina').forEach(btn => {
      btn.classList.remove('available', 'recommended');
      if (!btn.classList.contains('selected') && available.includes(btn.id)) {
        btn.classList.add('available');
      }
    });

    document.getElementById('recomendacoes').innerHTML =
      `<strong>Disponíveis:</strong> ${available.join(', ')}`;
  } catch (error) {
    console.error('Erro ao buscar disciplinas disponíveis:', error);
  }
}




async function gerarRecomendacoes() {
  const overlay = document.getElementById('overlay-loading');
  overlay.style.display = 'flex';  // Mostra o overlay

  const selecionadas = Array.from(document.querySelectorAll('.disciplina.available')).map(btn => btn.id);
  console.log('Disciplinas selecionadas:', selecionadas);

  try {
    const res = await fetch('/recomendadas', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ selecionadas, curso: 'eletrica' })
    });

    if (!res.ok) {
      console.error('Erro na resposta do servidor:', res.status);
      return;
    }

    const { recomendadas } = await res.json();
    console.log('Disciplinas recomendadas:', recomendadas);

    document.querySelectorAll('.disciplina').forEach(btn => {
      btn.classList.remove('recommended');
      if (recomendadas.includes(btn.id) && !btn.classList.contains('selected')) {
        btn.classList.add('recommended');
      }
    });

    document.getElementById('recomendacoes').innerHTML =
      `<strong>Recomendadas:</strong> ${recomendadas.join(', ')}`;
  } catch (error) {
    console.error('Erro ao buscar recomendações:', error);
  } finally {
    overlay.style.display = 'none';  // Esconde o overlay ao terminar
  }
}

