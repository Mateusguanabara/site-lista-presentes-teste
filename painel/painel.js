import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================
   ELEMENTOS
========================= */

const reservasLista =
    document.querySelector("#reservas-lista");

const totalPresentes =
    document.querySelector("#total-presentes");

const totalReservados =
    document.querySelector("#total-reservados");

const totalDisponiveis =
    document.querySelector("#total-disponiveis");

const presentesAdminLista =
    document.querySelector("#presentes-admin-lista");

const quantidadeCadastrados =
    document.querySelector("#quantidade-cadastrados");

const formPresenteAdmin =
    document.querySelector("#form-presente-admin");

const presenteNome =
    document.querySelector("#presente-nome");

const presenteDescricao =
    document.querySelector("#presente-descricao");

const presenteImagem =
    document.querySelector("#presente-imagem");

const botaoCadastrar =
    document.querySelector(".btn-cadastrar-presente");

const botaoCancelarEdicao =
    document.querySelector("#cancelar-edicao");

const modalLiberar =
    document.querySelector("#modal-liberar");

const botaoCancelarLiberacao =
    document.querySelector("#cancelar-liberacao");

const botaoConfirmarLiberacao =
    document.querySelector("#confirmar-liberacao");


let presenteEmEdicao = null;


/* =========================
   CARREGAR PAINEL
========================= */

async function carregarPainel() {

    reservasLista.innerHTML = `
        <p class="carregando">
            Carregando reservas...
        </p>
    `;

    presentesAdminLista.innerHTML = `
        <p class="carregando">
            Carregando presentes...
        </p>
    `;

    try {

        /* =========================
           BUSCAR PRESENTES
        ========================= */

        const presentesSnapshot =
            await getDocs(
                collection(db, "presentes")
            );


        /* =========================
           BUSCAR RESERVAS
        ========================= */

        const reservasSnapshot =
            await getDocs(
                collection(db, "reservas")
            );


        /* =========================
           TODOS OS PRESENTES
        ========================= */

        const presentes =
            presentesSnapshot.docs;

        const idsReservados = new Set();

        reservasSnapshot.forEach((documentoReserva) => {
            idsReservados.add(documentoReserva.id);
        });

        /* =========================
           LISTA DE PRESENTES
        ========================= */

        presentesAdminLista.innerHTML = "";

        quantidadeCadastrados.textContent =
            `${presentes.length} presentes`;


        presentes.forEach((documento) => {

            const presente =
                documento.data();

            criarCardPresenteAdmin(
                documento.id,
                presente,
                idsReservados.has(documento.id)
            );

        });


        /* =========================
           CONTADORES
        ========================= */

        const quantidadePresentes =
            presentes.length;

        const quantidadeReservados =
            reservasSnapshot.size;

        const quantidadeDisponiveis =
            quantidadePresentes -
            quantidadeReservados;


        totalPresentes.textContent =
            quantidadePresentes;

        totalReservados.textContent =
            quantidadeReservados;

        totalDisponiveis.textContent =
            Math.max(
                quantidadeDisponiveis,
                0
            );


        /* =========================
           RESERVAS
        ========================= */

        if (reservasSnapshot.empty) {

            reservasLista.innerHTML = `
                <div class="lista-vazia">

                    <h3>
                        Nenhum presente reservado
                    </h3>

                    <p>
                        As reservas aparecerão aqui.
                    </p>

                </div>
            `;

            return;
        }


        reservasLista.innerHTML = "";


        reservasSnapshot.forEach(
            (documentoReserva) => {

                const reserva =
                    documentoReserva.data();

                criarCardReserva(
                    documentoReserva.id,
                    reserva
                );

            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar painel:",
            erro
        );


        reservasLista.innerHTML = `
            <div class="lista-vazia">

                <h3>
                    Erro ao carregar dados
                </h3>

                <p>
                    Verifique o console do navegador.
                </p>

            </div>
        `;


        presentesAdminLista.innerHTML = `
            <div class="lista-vazia">

                <p>
                    Não foi possível carregar os presentes.
                </p>

            </div>
        `;

    }

}


/* =========================
   CARD RESERVA
========================= */

function criarCardReserva(id, reserva) {

    const card =
        document.createElement("article");

    card.classList.add("reserva-card");


    let dataReserva =
        "Data não disponível";


    if (
        reserva.reservadoEm &&
        typeof reserva.reservadoEm.toDate === "function"
    ) {

        const data =
            reserva.reservadoEm.toDate();

        dataReserva =
            data.toLocaleString(
                "pt-BR",
                {
                    dateStyle: "short",
                    timeStyle: "short"
                }
            );

    }


    const nomeConvidado =
        reserva.convidado?.nome ||
        "Não informado";


    const telefoneConvidado =
        reserva.convidado?.telefone ||
        "Não informado";


    const nomePresente =
        reserva.presenteNome ||
        "Presente";


    card.innerHTML = `

        <div class="reserva-info">

            <h3>
                ${nomePresente}
            </h3>

            <p>
                <strong>Reservado por:</strong>
                ${nomeConvidado}
            </p>

            <p>
                <strong>Telefone:</strong>
                ${telefoneConvidado}
            </p>

            <p>
                <strong>Data da reserva:</strong>
                ${dataReserva}
            </p>

        </div>


        <button
            type="button"
            class="btn-liberar"
            data-id="${id}"
        >
            Liberar presente
        </button>

    `;


    reservasLista.appendChild(card);

}

/* =========================
   CARD PRESENTE ADMIN
========================= */

function criarCardPresenteAdmin(
    id,
    presente,
    estaReservado
) {

    const card =
        document.createElement("article");

    card.classList.add(
        "presente-admin-card"
    );

    const status =
        estaReservado
            ? "Reservado"
            : "Disponível";

    card.innerHTML = `
        <div class="presente-admin-info">

            <h4>
                ${presente.nome || "Presente"}
            </h4>

            <p>
                ${presente.descricao || ""}
            </p>

            <span class="presente-status">
                ${status}
            </span>

        </div>

        <div class="presente-admin-acoes">

            <button
                type="button"
                class="btn-editar"
                data-id="${id}"
            >
                Editar
            </button>

            <button
                type="button"
                class="btn-excluir"
                data-id="${id}"
            >
                Excluir
            </button>

        </div>
    `;

    /* dados usados na edição */

    card.dataset.id = id;

    card.dataset.nome =
        presente.nome || "";

    card.dataset.descricao =
        presente.descricao || "";

    card.dataset.imagem =
        presente.imagem || "";

    presentesAdminLista.appendChild(card);
}

/* =========================
   EDITAR PRESENTE
========================= */

presentesAdminLista.addEventListener(
    "click",
    (event) => {

        const botaoEditar =
            event.target.closest(
                ".btn-editar"
            );


        if (!botaoEditar) {
            return;
        }


        const card =
            botaoEditar.closest(
                ".presente-admin-card"
            );


        if (!card) {
            return;
        }


        presenteEmEdicao =
            card.dataset.id;


        presenteNome.value =
            card.dataset.nome || "";

        presenteDescricao.value =
            card.dataset.descricao || "";

        presenteImagem.value =
            card.dataset.imagem || "";


        botaoCadastrar.textContent =
            "Salvar alterações";


        if (botaoCancelarEdicao) {

            botaoCancelarEdicao.style.display =
                "block";

        }


        formPresenteAdmin.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        presenteNome.focus();

    }
);


/* =========================
   EXCLUIR PRESENTE
========================= */

presentesAdminLista.addEventListener(
    "click",
    async (event) => {

        const botaoExcluir =
            event.target.closest(
                ".btn-excluir"
            );


        if (!botaoExcluir) {
            return;
        }


        const id =
            botaoExcluir.dataset.id;


        const confirmar =
            confirm(
                "Deseja realmente excluir este presente?"
            );


        if (!confirmar) {
            return;
        }


        botaoExcluir.disabled =
            true;

        botaoExcluir.textContent =
            "Excluindo...";


        try {

            await deleteDoc(
                doc(
                    db,
                    "presentes",
                    id
                )
            );


            await carregarPainel();


        } catch (erro) {

            console.error(
                "Erro ao excluir presente:",
                erro
            );


            alert(
                "Não foi possível excluir o presente."
            );


            botaoExcluir.disabled =
                false;

            botaoExcluir.textContent =
                "Excluir";

        }

    }
);

/* =========================
   MODAL LIBERAR
========================= */

function confirmarLiberacao() {

    return new Promise((resolve) => {

        modalLiberar.classList.add("ativo");

        function fechar(resultado) {

            modalLiberar.classList.remove("ativo");

            botaoConfirmarLiberacao.removeEventListener(
                "click",
                confirmar
            );

            botaoCancelarLiberacao.removeEventListener(
                "click",
                cancelar
            );

            resolve(resultado);
        }

        function confirmar() {
            fechar(true);
        }

        function cancelar() {
            fechar(false);
        }

        botaoConfirmarLiberacao.addEventListener(
            "click",
            confirmar
        );

        botaoCancelarLiberacao.addEventListener(
            "click",
            cancelar
        );

    });
}


/* =========================
   LIBERAR PRESENTE
========================= */

reservasLista.addEventListener(
    "click",
    async (event) => {

        const botao =
            event.target.closest(
                ".btn-liberar"
            );


        if (!botao) {
            return;
        }


        const id =
            botao.dataset.id;


        const confirmar =
            await confirmarLiberacao();

        if (!confirmar) {
            return;
        }


        if (!confirmar) {
            return;
        }


        botao.disabled =
            true;

        botao.textContent =
            "Liberando...";


        try {

            await deleteDoc(
                doc(
                    db,
                    "reservas",
                    id
                )
            );


            await carregarPainel();


        } catch (erro) {

            console.error(
                "Erro ao liberar presente:",
                erro
            );


            alert(
                "Não foi possível liberar o presente."
            );


            botao.disabled =
                false;

            botao.textContent =
                "Liberar presente";

        }

    }
);


/* =========================
   CADASTRAR / SALVAR
========================= */

if (formPresenteAdmin) {

    formPresenteAdmin.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const nome =
                presenteNome.value.trim();

            const descricao =
                presenteDescricao.value.trim();

            const imagem =
                presenteImagem.value.trim();


            if (
                !nome ||
                !descricao ||
                !imagem
            ) {

                alert(
                    "Preencha todos os campos."
                );

                return;
            }


            botaoCadastrar.disabled =
                true;


            try {


                /* =========================
                   EDITANDO
                ========================= */

                if (presenteEmEdicao) {

                    botaoCadastrar.textContent =
                        "Salvando...";


                    await updateDoc(
                        doc(
                            db,
                            "presentes",
                            presenteEmEdicao
                        ),
                        {
                            nome: nome,
                            descricao: descricao,
                            imagem: imagem
                        }
                    );


                    alert(
                        "Presente atualizado com sucesso!"
                    );

                }


                /* =========================
                   NOVO PRESENTE
                ========================= */

                else {

                    botaoCadastrar.textContent =
                        "Cadastrando...";


                    /* BUSCAR O PRÓXIMO ID NUMÉRICO */

                    const snapshotPresentes =
                        await getDocs(
                            collection(db, "presentes")
                        );

                    let maiorId = 0;

                    snapshotPresentes.forEach((documento) => {

                        const idNumerico =
                            Number(documento.id);

                        if (
                            !isNaN(idNumerico) &&
                            idNumerico > maiorId
                        ) {
                            maiorId = idNumerico;
                        }

                    });

                    const proximoId =
                        String(maiorId + 1);


                    /* CADASTRAR COM ID 1, 2, 3, 4... */

                    await setDoc(
                        doc(
                            db,
                            "presentes",
                            proximoId
                        ),
                        {
                            nome: nome,
                            descricao: descricao,
                            imagem: imagem,
                            ativo: true,
                            disponivel: true,
                            reservado: false,
                            criadoEm: serverTimestamp()
                        }
                    );


                    alert(
                        "Presente cadastrado com sucesso!"
                    );

                }


                /* =========================
                   LIMPAR FORM
                ========================= */

                presenteEmEdicao =
                    null;


                formPresenteAdmin.reset();


                botaoCadastrar.textContent =
                    "Cadastrar presente";


                if (botaoCancelarEdicao) {

                    botaoCancelarEdicao.style.display =
                        "none";

                }


                await carregarPainel();


            } catch (erro) {

                console.error(
                    "Erro ao salvar presente:",
                    erro
                );


                alert(
                    "Não foi possível salvar o presente."
                );

            } finally {

                botaoCadastrar.disabled =
                    false;


                if (!presenteEmEdicao) {

                    botaoCadastrar.textContent =
                        "Cadastrar presente";

                }

            }

        }
    );

}


/* =========================
   CANCELAR EDIÇÃO
========================= */

if (botaoCancelarEdicao) {

    botaoCancelarEdicao.addEventListener(
        "click",
        () => {

            presenteEmEdicao =
                null;


            formPresenteAdmin.reset();


            botaoCadastrar.textContent =
                "Cadastrar presente";


            botaoCancelarEdicao.style.display =
                "none";

        }
    );

}


/* =========================
   INICIAR
========================= */

carregarPainel();