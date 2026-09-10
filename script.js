import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const presentesGrid = document.querySelector("#presentes-grid");
const modalPresente = document.querySelector("#modal-presente");
const fecharModal = document.querySelector("#fechar-modal");
const presenteSelecionado = document.querySelector("#presente-selecionado");
const formPresente = document.querySelector("#form-presente");
const nomeConvidado = document.querySelector("#nome-convidado");
const telefoneConvidado = document.querySelector("#telefone-convidado");
const modalSucesso = document.querySelector("#modal-sucesso");
const fecharSucesso = document.querySelector("#fechar-sucesso");


let presenteAtual = null;

let confirmandoPresente = false;


/* =========================
   CARREGAR PRESENTES
========================= */

async function carregarPresentes() {

    presentesGrid.innerHTML = "";

    try {

        const snapshot = await getDocs(
            collection(db, "presentes")
        );

        let totalPresentes = 0;

        for (const documento of snapshot.docs) {

            const presente = documento.data();

            // Não mostra presentes desativados
            if (!presente.ativo) {
                continue;
            }


            const reservaRef = doc(
                db,
                "reservas",
                documento.id
            );

            const reservaSnapshot =
                await getDoc(reservaRef);


            // Agora NÃO escondemos mais o presente.
            // Apenas verificamos se ele está reservado.
            const reservado =
                reservaSnapshot.exists();


            criarCardPresente(
                documento.id,
                presente,
                reservado
            );

            totalPresentes++;

        }


        // Caso não exista nenhum presente ativo
        if (totalPresentes === 0) {

            presentesGrid.innerHTML = `
                <div class="lista-vazia">

                    <h3>
                        Lista de presentes em breve ❤️
                    </h3>

                    <p>
                        Estamos preparando tudo com muito carinho.
                    </p>

                </div>
            `;

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar presentes:",
            erro
        );

        presentesGrid.innerHTML = `
            <div class="lista-vazia">

                <h3>
                    Não foi possível carregar a lista.
                </h3>

                <p>
                    Tente atualizar a página novamente.
                </p>

            </div>
        `;

    }

}


/* =========================
   CRIAR CARD DO PRESENTE
========================= */

function criarCardPresente(id, presente, reservado) {

    const card = document.createElement("article");

    card.classList.add("presente-card");


    // Adiciona uma classe extra caso
    // o presente já esteja reservado
    if (reservado) {
        card.classList.add("presente-reservado");
    }


    card.innerHTML = `

        <div class="presente-imagem">

            <img
                src="assets/imagens/${presente.imagem}"
                alt="${presente.nome}"
                loading="lazy"
            >

        </div>


        <div class="presente-info">

            <h3>
                ${presente.nome}
            </h3>


            ${reservado
            ? `
                        <p class="status-reservado">
                            ❤️ Presente já reservado
                        </p>
                    `
            : `
                        <p>
                            Um presente especial para o novo lar.
                        </p>
                    `
        }


            <button
                type="button"
                class="btn-escolher"
                data-id="${id}"
                ${reservado ? "disabled" : ""}
            >

                ${reservado
            ? "Presente reservado"
            : "Escolher este presente"
        }

            </button>

        </div>

    `;


    presentesGrid.appendChild(card);

}


/* =========================
   ABRIR MODAL
========================= */

presentesGrid.addEventListener(
    "click",
    async (event) => {

        const botao =
            event.target.closest(".btn-escolher");


        if (!botao) {
            return;
        }


        // Segurança extra:
        // botão reservado não abre modal
        if (botao.disabled) {
            return;
        }


        const id = botao.dataset.id;


        try {

            /*
             * Conferimos novamente a reserva antes
             * de abrir o modal.
             */

            const reservaRef = doc(
                db,
                "reservas",
                id
            );


            const reservaSnapshot =
                await getDoc(reservaRef);


            if (reservaSnapshot.exists()) {

                alert(
                    "Este presente acabou de ser escolhido por outro convidado."
                );

                await carregarPresentes();

                return;
            }


            const presenteRef = doc(
                db,
                "presentes",
                id
            );


            const presenteSnapshot =
                await getDoc(presenteRef);


            if (!presenteSnapshot.exists()) {
                return;
            }


            presenteAtual = {

                id: presenteSnapshot.id,

                ...presenteSnapshot.data()

            };


            presenteSelecionado.textContent =
                presenteAtual.nome;


            modalPresente.classList.add("ativo");


            document.body.style.overflow =
                "hidden";


            nomeConvidado.focus();


        } catch (erro) {

            console.error(
                "Erro ao abrir presente:",
                erro
            );

        }

    }
);


/* =========================
   FECHAR MODAL
========================= */

function fecharModalPresente() {

    modalPresente.classList.remove("ativo");

    document.body.style.overflow = "";

    formPresente.reset();

    presenteAtual = null;

}


fecharModal.addEventListener(
    "click",
    fecharModalPresente
);


/* =========================
   FECHAR CLICANDO FORA
========================= */

modalPresente.addEventListener(
    "click",
    (event) => {

        if (event.target === modalPresente) {

            fecharModalPresente();

        }

    }
);


/* =========================
   FECHAR COM ESC
========================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            modalPresente.classList.contains("ativo")
        ) {

            fecharModalPresente();

        }

    }
);


/* =========================
   CONFIRMAR PRESENTE
========================= */

formPresente.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (
            !presenteAtual ||
            confirmandoPresente
        ) {

            return;

        }


        const nome =
            nomeConvidado.value.trim();


        const telefone =
            telefoneConvidado.value.trim();


        if (!nome) {

            alert(
                "Digite seu nome para confirmar o presente."
            );

            nomeConvidado.focus();

            return;

        }


        const botaoConfirmar =
            formPresente.querySelector(
                'button[type="submit"]'
            );


        confirmandoPresente = true;

        botaoConfirmar.disabled = true;

        botaoConfirmar.textContent =
            "Confirmando...";


        try {

            const referenciaReserva = doc(
                db,
                "reservas",
                presenteAtual.id
            );


            /*
             * Confere mais uma vez se alguém
             * reservou enquanto o modal estava aberto.
             */

            const reservaExistente =
                await getDoc(
                    referenciaReserva
                );


            if (reservaExistente.exists()) {

                alert(
                    "Ops! Outro convidado acabou de escolher este presente."
                );


                fecharModalPresente();


                await carregarPresentes();


                return;

            }


            await setDoc(
                referenciaReserva,
                {

                    presenteId:
                        presenteAtual.id,

                    presenteNome:
                        presenteAtual.nome,

                    convidado: {

                        nome: nome,

                        telefone: telefone

                    },

                    reservadoEm:
                        serverTimestamp()

                }
            );


            fecharModalPresente();

            await carregarPresentes();

            modalSucesso.classList.add("ativo");
            document.body.style.overflow = "hidden";


        } catch (erro) {

            console.error(
                "Erro ao confirmar presente:",
                erro
            );


            alert(
                "Não foi possível confirmar o presente. " +
                "Tente novamente."
            );


        } finally {

            confirmandoPresente = false;

            botaoConfirmar.disabled = false;

            botaoConfirmar.textContent =
                "Confirmar presente";

        }

    }
);

/* =========================
    MODAL DE SUCESSO
========================= */

function fecharModalSucesso() {
    modalSucesso.classList.remove("ativo");
    document.body.style.overflow = "";
}

fecharSucesso.addEventListener(
    "click",
    fecharModalSucesso
);

modalSucesso.addEventListener(
    "click",
    (event) => {

        if (event.target === modalSucesso) {
            fecharModalSucesso();
        }

    }
);

/* =========================
   COPIAR CHAVE PIX
========================= */

const botaoCopiarPix = document.querySelector("#copiar-pix");
const pixFeedback = document.querySelector("#pix-feedback");

if (botaoCopiarPix) {

    botaoCopiarPix.addEventListener("click", async () => {

        const chavePix = botaoCopiarPix.dataset.pix;

        try {

            await navigator.clipboard.writeText(chavePix);

            pixFeedback.textContent = "Chave PIX copiada com sucesso!";

            botaoCopiarPix.textContent = "Chave copiada ✓";

            setTimeout(() => {

                pixFeedback.textContent = "";
                botaoCopiarPix.textContent = "Copiar chave PIX";

            }, 3000);

        } catch (erro) {

            pixFeedback.textContent =
                "Não foi possível copiar automaticamente.";

            console.error("Erro ao copiar PIX:", erro);

        }

    });

}

/* =========================
   INICIAR SITE
========================= */

carregarPresentes();