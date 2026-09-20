const SUPABASE_URL = "https://qtyvwthaylwjdtuinbzk.supabase.co/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0eXZ3dGhheWx3amR0dWluYnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1ODYyOTcsImV4cCI6MjEwNTE2MjI5N30.XdPxrc8DmmJsmnatGk6l2D7dSqW2JS02QIJ4cMnq70A";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


async function testConnection() {

    const { data, error } = await supabaseClient
        .from("items")
        .select("*")
        .limit(1);

    if (error) {

        console.error(
            "Error conectando con Supabase:",
            error
        );

        return;
    }

    console.log(
        "Supabase conectado correctamente:",
        data
    );
}


testConnection();



// ========================================
// BUSCADOR
// ========================================

async function searchItems() {

    const input =
        document.getElementById("searchInput");

    const results =
        document.getElementById("searchResults");


    if (!input || !results) {
        return;
    }


    const searchTerm =
        input.value.trim();


    // Si está vacío
    if (searchTerm === "") {

        results.innerHTML = "";

        return;
    }


    // Mostrar mensaje de búsqueda
    results.innerHTML = `

        <div class="text-center my-4">

            <div class="spinner-border"
                 role="status">
            </div>

            <p class="mt-2">
                Buscando objetos...
            </p>

        </div>

    `;


    const term =
        `%${searchTerm}%`;


    const { data, error } =
        await supabaseClient
            .from("items")
            .select("*")
            .eq("status", "active")
            .or(
                `name.ilike.${term},description.ilike.${term}`
            )
            .order(
                "created_at",
                { ascending: false }
            );


    if (error) {

        console.error(
            "Error realizando búsqueda:",
            error
        );


        results.innerHTML = `

            <div class="alert alert-danger">

                ❌ Ocurrió un error al realizar
                la búsqueda.

            </div>

        `;

        return;
    }


    // No hay resultados
    if (!data || data.length === 0) {

        results.innerHTML = `

            <div class="alert alert-warning text-center">

                🔎 No encontramos objetos relacionados
                con <strong>${searchTerm}</strong>.

            </div>

        `;

        return;
    }


    // Título
    let html = `

        <div class="mb-4">

            <h2>
                Resultados de búsqueda
            </h2>

            <p class="text-muted">

                Se encontraron
                <strong>${data.length}</strong>
                resultado(s) para
                <strong>${searchTerm}</strong>.

            </p>

        </div>

        <div class="row g-4">

    `;


    // Tarjetas
    data.forEach(item => {

        const typeLabel =
            item.type === "lost"
                ? "🔴 Perdido"
                : "🟢 Encontrado";


        const badgeClass =
            item.type === "lost"
                ? "bg-danger"
                : "bg-success";


        const image =
            item.image_url

                ? `
                    <img
                        src="${item.image_url}"
                        alt="${item.name}">
                  `

                : `
                    <div
                        class="d-flex
                               align-items-center
                               justify-content-center
                               bg-light"
                        style="
                            height:220px;
                            font-size:60px;
                        ">

                        📦

                    </div>
                  `;


        html += `

            <div class="col-md-6 col-lg-4">

                <div class="item-card">

                    ${image}

                    <div class="item-content">

                        <span
                            class="badge ${badgeClass}
                                   mb-2">

                            ${typeLabel}

                        </span>


                        <h3>
                            ${item.name}
                        </h3>


                        <p>
                            ${item.description ||
                              "Sin descripción"}
                        </p>


                        <p class="mb-1">

                            📍
                            <strong>Lugar:</strong>

                            ${item.location ||
                              "No especificado"}

                        </p>


                        <p class="mb-0">

                            📅
                            <strong>Fecha:</strong>

                            ${item.date ||
                              "No especificada"}

                        </p>

                    </div>

                </div>

            </div>

        `;

    });


    html += `

        </div>

    `;


    results.innerHTML = html;

}