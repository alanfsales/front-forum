document.addEventListener("DOMContentLoaded", () => {
    // Verifica se o token existe no localStorage
    const validarToken = () => {
        const token = localStorage.getItem("authToken");
    
        if (!token) {
            alert("Acesso negado. Você precisa fazer login.");
            window.location.href = "../index.html"; // Redireciona para a página de login
            return false;
        }
    
        try {
            const payloadBase64 = token.split(".")[1];
            const payload = JSON.parse(atob(payloadBase64)); // Decodifica o payload do JWT
    
            // Verifica se o token expirou
            const agora = Math.floor(Date.now() / 1000); // Tempo atual em segundos
            if (payload.exp && payload.exp < agora) {
                alert("Sua sessão expirou. Faça login novamente.");
                localStorage.removeItem("authToken");
                window.location.href = "../index.html";
                return false;
            }
        } catch (error) {
            console.error("Erro ao validar o token:", error);
            alert("Token inválido. Faça login novamente.");
            localStorage.removeItem("authToken");
            window.location.href = "../index.html";
            return false;
        }
    
        return true;
    };
    
    // Chama a validação ao carregar a página
    validarToken();

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
        window.location.href = "../index.html";
    });
});

// Adiciona evento ao menu para carregar as tabelas 
document.querySelectorAll('a[data-target]').forEach((menuLink) => {
    menuLink.addEventListener('click', (event) => {
        event.preventDefault(); // Evita comportamento padrão do link

        const target = menuLink.getAttribute('data-target'); // Obtém o alvo

        if (target === "cadastro-curso") {
            carregarCursos();
        }else if (target === "cadastro-perfil") {
            carregarPerfis();
        }

    });
});

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
        window.location.href = "../index.html"; // Redireciona para a página de login
    }
};

// Chama a função ao carregar a página
exibirNomeUsuario();





