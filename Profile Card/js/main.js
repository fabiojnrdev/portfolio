async function loadProfile() {
  const loader = document.getElementById("loader");
  const card = document.querySelector(".card");

  try {
    loader.classList.remove("hidden");

    const res = await fetch("./data/user.json");

    if (!res.ok) {
      throw new Error(`Erro ao carregar JSON: ${res.status}`);
    }

    const user = await res.json();

    // Avatar
    if (user.avatar) {
      document.getElementById("avatar").src = user.avatar;
    }

    // Nome
    document.getElementById("name").textContent = user.name || "Nome não disponível";

    // Bio
    document.getElementById("bio").textContent = user.bio || "";

    // Links sociais
    if (user.social) {
      if (user.social.github) {
        document.getElementById("github").href = user.social.github;
      }

      if (user.social.linkedin) {
        document.getElementById("linkedin").href = user.social.linkedin;
      }
    }

    // Animação da card
    requestAnimationFrame(() => card.classList.add("ready"));

  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    document.getElementById("bio").textContent = "Não foi possível carregar o perfil.";
  } finally {
    loader.classList.add("hidden");
  }
}

// Executa
loadProfile();
