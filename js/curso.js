// Função para buscar e renderizar os cursos na tabela
const carregarCursos = () => {
    const token = localStorage.getItem("authToken"); // Recupera o token

    fetch("http://localhost:8080/cursos", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`, // Inclui o token no cabeçalho
            "Content-Type": "application/json"
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao buscar cursos");
            }
            return response.json();
        })
        .then((cursos) => {
            const tabelaBody = document.getElementById("cursos-lista");
            tabelaBody.innerHTML = ""; // Limpa o conteúdo da tabela

            cursos.forEach((curso) => {
                const row = document.createElement("tr");
            
                row.innerHTML = `
                    <td>${curso.id}</td>
                    <td>${curso.nome}</td>
                    <td>${curso.categoria}</td>
                    <td>
                        <button class="btn-alterar" title="Alterar" onclick='prepararEdicao(${JSON.stringify(curso)})'>
                            ✏️
                        </button>
                    </td>
                    <td>
                        <button class="btn-excluir" title="Excluir" onclick="excluirCurso(${curso.id})">
                            🗑️
                        </button>
                    </td>
                `;
            
                tabelaBody.appendChild(row);
            });
            
        })
        .catch((error) => {
            console.error("Erro ao carregar cursos:", error);
            alert("Não foi possível carregar a lista de cursos.");
        });
};

// Chama a função para carregar os cursos ao carregar a página
//carregarCursos();

// Função para excluir um curso
const excluirCurso = (cursoId) => {
    const token = localStorage.getItem("authToken"); // Recupera o token

    if (!confirm("Tem certeza que deseja excluir este curso?")) {
        return; // Interrompe a exclusão se o usuário cancelar
    }

    fetch(`http://localhost:8080/cursos/${cursoId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao excluir o curso");
            }
            alert("Curso excluído com sucesso!");
            carregarCursos(); // Atualiza a lista de cursos
        })
        .catch((error) => {
            console.error("Erro ao excluir curso:", error);
            alert("Não foi possível excluir o curso. Tente novamente.");
        });
};

let cursoEditando = null; // Variável para armazenar o curso que está sendo editado

// Função para preparar o formulário para edição
const prepararEdicao = (curso) => {
    cursoEditando = curso.id; // Armazena o ID do curso sendo editado

    // Preenche os campos do formulário com os dados do curso
    document.getElementById("course-name").value = curso.nome;
    document.getElementById("course-category").value = curso.categoria;

    // Muda o texto do botão de salvar
    document.getElementById("btn-salvar-curso").textContent = "Atualizar";
};

// Função para salvar ou atualizar um curso
const salvarOuAtualizarCurso = (event) => {
    event.preventDefault(); // Evita o recarregamento da página

    const token = localStorage.getItem("authToken"); // Recupera o token
    const nome = document.getElementById("course-name").value; // Valor do campo Nome
    const categoria = document.getElementById("course-category").value; // Valor do campo Categoria

    // Validação simples
    if (!nome || !categoria) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    // Objeto com os dados do curso
    const curso = {
        nome: nome,
        categoria: categoria,
    };

    // Define o método e a URL com base na operação (salvar ou atualizar)
    const metodo = cursoEditando ? "PUT" : "POST";
    const url = cursoEditando
        ? `http://localhost:8080/cursos/${cursoEditando}`
        : "http://localhost:8080/cursos";

    // Envia os dados para o servidor
    fetch(url, {
        method: metodo,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(curso),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    cursoEditando ? "Erro ao atualizar o curso" : "Erro ao salvar o curso"
                );
            }
            return response.json();
        })
        .then(() => {
            alert(
                cursoEditando
                    ? "Curso atualizado com sucesso!"
                    : "Curso cadastrado com sucesso!"
            );
            document.getElementById("form-cadastro-curso").reset(); // Limpa o formulário
            document.getElementById("btn-salvar-curso").textContent = "Salvar"; // Restaura o texto do botão
            cursoEditando = null; // Reseta o curso que está sendo editado
            carregarCursos(); // Atualiza a lista de cursos
        })
        .catch((error) => {
            console.error("Erro ao salvar/atualizar curso:", error);
            alert("Não foi possível salvar/atualizar o curso. Tente novamente.");
        });
};

// Atualiza o evento do formulário para salvar ou atualizar
document
    .getElementById("form-cadastro-curso")
    .addEventListener("submit", salvarOuAtualizarCurso);

// Função para buscar cursos por nome e categoria
const buscarCursos = () => {
    const searchInput = document.getElementById("search-name").value.toLowerCase();
    const searchCategory = document.getElementById("search-category").value;
    const cursosTabela = document.querySelectorAll("#cursos-lista tr");

    // Iterar pelos cursos na tabela e aplicar os filtros
    cursosTabela.forEach((linha) => {
        const nomeCurso = linha.querySelector("td:nth-child(2)").textContent.toLowerCase(); // Nome está na 2ª coluna
        const categoriaCurso = linha.querySelector("td:nth-child(3)").textContent; // Categoria está na 3ª coluna

        // Verifica se o nome e categoria correspondem aos filtros
        const nomeMatch = nomeCurso.includes(searchInput);
        const categoriaMatch = searchCategory === "" || categoriaCurso === searchCategory;

        if (nomeMatch && categoriaMatch) {
            linha.style.display = ""; // Mostrar a linha
        } else {
            linha.style.display = "none"; // Ocultar a linha
        }
    });
};

// Adicionar evento ao botão de busca
document.getElementById("btn-search-curso").addEventListener("click", (e) => {
    e.preventDefault(); // Previne o comportamento padrão do botão
    buscarCursos();
});