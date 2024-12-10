document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const responseDiv = document.getElementById("response");

    loginBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            responseDiv.textContent = "Por favor, preencha todos os campos.";
            responseDiv.style.color = "red";
            return;
        }

        const requestBody = {
            email: email,
            senha: password
        };

        try {
            const response = await fetch("http://localhost:8080/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            // Verifica o código de status da resposta
            if (response.ok) {
                const data = await response.json();
                const token = data.token;

                // Armazena o token no localStorage
                localStorage.setItem("authToken", token);

                // Redireciona para a página protegida
                window.location.href = "views/dashboard.html";
            } else if (response.status === 401) {
                // Tratar erro de autenticação (senha ou email incorretos)
                responseDiv.textContent = "Falha na autenticação. Verifique suas credenciais.";
                responseDiv.style.color = "red";
            } else {
                // Para outros erros, exibe a mensagem padrão
                const errorData = await response.json();
                responseDiv.textContent = `Erro: ${errorData.message || "Algo deu errado"}`;
                responseDiv.style.color = "red";
            }
        } catch (error) {
            // Erros de rede ou conexão
            responseDiv.textContent = "Erro: Não foi possível conectar ao servidor.";
            responseDiv.style.color = "red";
            console.error("Erro de conexão:", error);
        }
    });
});
