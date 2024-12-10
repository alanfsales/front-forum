// Função para buscar e renderizar os perfis na tabela
const carregarPerfis = () => {
    const token = localStorage.getItem("authToken"); // Recupera o token

    fetch("http://localhost:8080/perfis", { // Ajuste a URL do endpoint de perfis
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`, // Inclui o token no cabeçalho
            "Content-Type": "application/json"
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao buscar perfis");
            }
            return response.json();
        })
        .then((perfis) => {
            const tabelaBody = document.getElementById("perfis-lista");
            tabelaBody.innerHTML = ""; // Limpa o conteúdo da tabela

            perfis.forEach((perfil) => {
                const row = document.createElement("tr");
            
                row.innerHTML = `
                    <td>${perfil.id}</td>
                    <td>${perfil.nome}</td>
                    <td>
                        <button class="btn-alterar" title="Alterar" onclick='prepararEdicaoPerfil(${JSON.stringify(perfil)})'>
                            ✏️
                        </button>
                    </td>
                    <td>
                        <button class="btn-excluir" title="Excluir" onclick="excluirPerfil(${perfil.id})">
                            🗑️
                        </button>
                    </td>
                `;
            
                tabelaBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar perfis:", error);
            alert("Não foi possível carregar a lista de perfis.");
        });
};

// Chama a função para carregar os perfis ao carregar a página
//carregarPerfis();

let perfilEditando = null; // Variável para armazenar o perfil que está sendo editado

// Função para preparar o formulário para edição
const prepararEdicaoPerfil = (perfil) => {
    perfilEditando = perfil.id; // Armazena o ID do perfil sendo editado

    // Preenche os campos do formulário com os dados do perfil
    document.getElementById("profile-name").value = perfil.nome;

    // Muda o texto do botão de salvar
    document.getElementById("btn-salvar-perfil").textContent = "Atualizar";
};

// Função para salvar ou atualizar um perfil
const salvarOuAtualizarPerfil = (event) => {
    event.preventDefault(); // Evita o recarregamento da página

    const token = localStorage.getItem("authToken"); // Recupera o token
    const nome = document.getElementById("profile-name").value; // Valor do campo Nome

    // Validação simples
    if (!nome) {
        alert("Por favor, preencha o campo de nome!");
        return;
    }

    // Objeto com os dados do perfil
    const perfil = {
        nome: nome,
    };

    // Define o método e a URL com base na operação (salvar ou atualizar)
    const metodo = perfilEditando ? "PUT" : "POST";
    const url = perfilEditando
        ? `http://localhost:8080/perfis/${perfilEditando}`
        : "http://localhost:8080/perfis";

    // Envia os dados para o servidor
    fetch(url, {
        method: metodo,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(perfil),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    perfilEditando
                        ? "Erro ao atualizar o perfil"
                        : "Erro ao salvar o perfil"
                );
            }
            return response.json();
        })
        .then(() => {
            alert(
                perfilEditando
                    ? "Perfil atualizado com sucesso!"
                    : "Perfil cadastrado com sucesso!"
            );
            document.getElementById("form-cadastro-perfil").reset(); // Limpa o formulário
            document.getElementById("btn-salvar-perfil").textContent = "Salvar"; // Restaura o texto do botão
            perfilEditando = null; // Reseta o perfil que está sendo editado
            carregarPerfis(); // Atualiza a lista de perfis
        })
        .catch((error) => {
            console.error("Erro ao salvar/atualizar perfil:", error);
            alert("Não foi possível salvar/atualizar o perfil. Tente novamente.");
        });
};

// Atualiza o evento do formulário para salvar ou atualizar
document
    .getElementById("form-cadastro-perfil")
    .addEventListener("submit", salvarOuAtualizarPerfil);

// Função para excluir um perfil
const excluirPerfil = (perfilId) => {
    const token = localStorage.getItem("authToken"); // Recupera o token

    if (!confirm("Tem certeza que deseja excluir este perfil?")) {
        return; // Interrompe a exclusão se o usuário cancelar
    }

    fetch(`http://localhost:8080/perfis/${perfilId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao excluir o perfil");
            }
            alert("Perfil excluído com sucesso!");
            carregarPerfis(); // Atualiza a lista de perfis
        })
        .catch((error) => {
            console.error("Erro ao excluir perfil:", error);
            alert("Não foi possível excluir o perfil. Tente novamente.");
        });
};

// Função para buscar perfis por nome
const buscarPerfis = () => {
    const searchInput = document.getElementById("search-profile-name").value.toLowerCase();
    const perfisTabela = document.querySelectorAll("#perfis-lista tr");

    // Iterar pelos perfis na tabela e aplicar o filtro
    perfisTabela.forEach((linha) => {
        const nomePerfil = linha.querySelector("td:nth-child(2)").textContent.toLowerCase(); // Nome está na 2ª coluna

        // Verifica se o nome corresponde ao filtro
        const nomeMatch = nomePerfil.includes(searchInput);

        if (nomeMatch) {
            linha.style.display = ""; // Mostrar a linha
        } else {
            linha.style.display = "none"; // Ocultar a linha
        }
    });
};

// Adicionar evento ao botão de busca
document.getElementById("btn-search-perfil").addEventListener("click", (e) => {
    e.preventDefault(); // Previne o comportamento padrão do botão
    buscarPerfis();
});



