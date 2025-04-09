// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8fw3yHAOTIUqNws8S_579FFKSY4ZRZfU",
  authDomain: "projeto-salas.firebaseapp.com",
  databaseURL: "https://projeto-salas-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "projeto-salas",
  storageBucket: "projeto-salas.firebasestorage.app",
  messagingSenderId: "55494640837",
  appId: "1:55494640837:web:b00713624afc202bfb5cac"
};

// Inicializa Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Submissão do formulário
document.getElementById("salaForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const curso = document.getElementById("curso").value.trim();
  const inicio = document.getElementById("periodoInicio").value;
  const fim = document.getElementById("periodoFim").value;
  const professor = document.getElementById("professor").value.trim();
  const sala = document.getElementById("sala").value.trim();

  const resultado = `
    Curso: ${curso} <br>
    Período: ${inicio} até ${fim} <br>
    Professor: ${professor} <br>
    Sala: ${sala}
  `;
  document.getElementById("resultado").innerHTML = resultado;

  const dadosSala = {
    curso,
    periodoInicio: inicio,
    periodoFim: fim,
    professor,
    sala
  };

  // Verifica duplicidade
  database.ref("salas").once("value")
    .then(snapshot => {
      let duplicado = false;

      snapshot.forEach(child => {
        const salaExistente = child.val();
        if (
          salaExistente.curso === dadosSala.curso &&
          salaExistente.periodoInicio === dadosSala.periodoInicio &&
          salaExistente.periodoFim === dadosSala.periodoFim &&
          salaExistente.professor === dadosSala.professor &&
          salaExistente.sala === dadosSala.sala
        ) {
          duplicado = true;
        }
      });

      if (duplicado) {
        document.getElementById("resultado").textContent = "⚠️ Sala já registrada.";
      } else {
        dadosSala.dataRegistro = new Date().toISOString();
        database.ref("salas/").push(dadosSala)
          .then(() => {
            document.getElementById("resultado").textContent = "✅ Sala registrada com sucesso!";
            document.getElementById("salaForm").reset();
            carregarSalas(); // Atualiza tabela após salvar
          })
          .catch(error => {
            console.error("Erro ao salvar:", error);
            document.getElementById("resultado").textContent = "❌ Erro ao registrar sala.";
          });
      }
    });
});

// Função para carregar os dados do Firebase e mostrar na tabela
function carregarSalas() {
  const tabela = document.querySelector("#tabelaSalas tbody");
  tabela.innerHTML = ""; // Limpa tabela antes de preencher

  database.ref("salas").once("value").then(snapshot => {
    snapshot.forEach(child => {
      const dados = child.val();

      // Converte as datas para o formato DD/MM/AAAA
      const inicioFormatado = dados.periodoInicio
        ? new Date(dados.periodoInicio).toLocaleDateString("pt-BR")
        : "";
      const fimFormatado = dados.periodoFim
        ? new Date(dados.periodoFim).toLocaleDateString("pt-BR")
        : "";

      const linha = document.createElement("tr");

      linha.innerHTML = `
        <td>${dados.curso}</td>
        <td>${inicioFormatado}</td>
        <td>${fimFormatado}</td>
        <td>${dados.professor}</td>
        <td>${dados.sala}</td>
      `;

      tabela.appendChild(linha);
    });
  });
}

// Carrega os dados ao abrir a página
window.addEventListener("DOMContentLoaded", carregarSalas);
