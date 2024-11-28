document.addEventListener("DOMContentLoaded", () => {
    // Verifica se o token existe no localStorage
    const token = localStorage.getItem("authToken");

    if (!token) {
        // Se não houver token, redireciona para a página de login
        alert("Você precisa fazer login para acessar o dashboard.");
        window.location.href = "index.html";
        return;
    }

    // Token existe, continua a configuração da página
    const menuItems = document.querySelectorAll(".sidebar a");
    const sections = document.querySelectorAll("section");
    const logoutBtn = document.getElementById("logoutBtn");

    // Função para esconder todas as seções
    const hideAllSections = () => {
        sections.forEach((section) => {
            section.classList.add("hidden");
        });
    };

    // Função para exibir uma seção específica
    const showSection = (id) => {
        document.getElementById(id).classList.remove("hidden");
    };

    // Adiciona evento de clique nos itens do menu
    menuItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault(); // Evita comportamento padrão do link
            hideAllSections(); // Esconde todas as seções
            const target = item.getAttribute("data-target"); // Pega o ID da seção alvo
            showSection(target); // Mostra a seção correspondente
        });
    });

    // Evento de logout
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("authToken");
        window.location.href = "index.html";
    });
});

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
carregarCursos();

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

// Função para decodificar o token JWT
const decodificarToken = (token) => {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload); // Decodifica o payload Base64
    return JSON.parse(decodedPayload);
};

// Função para exibir o nome do usuário no header
const exibirNomeUsuario = () => {
    const token = localStorage.getItem("authToken");

    if (token) {
        const decodedToken = decodificarToken(token);
        const nomeUsuario = decodedToken.sub || "Usuário"; // Ajuste "sub" conforme o campo no payload do seu token
        document.getElementById("user-name").textContent = nomeUsuario;
    } else {
        alert("Usuário não autenticado!");
        window.location.href = "index.html"; // Redireciona para a página de login
    }
};

// Chama a função ao carregar a página
exibirNomeUsuario();



