document.addEventListener('DOMContentLoaded', () => {
    let offset = 0;
    const limit = 20;


    loadPokemon(offset, limit);


    document.querySelector('#load-more').addEventListener('click', () => {
        offset += limit;
        loadPokemon(offset, limit);
    });

    // Function to fetch Pokémon data and update gallery
    function loadPokemon(offset, limit) {
        fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
            .then(response => response.json())
            .then(data => {
                data.results.forEach(pokemon => addPokemonToGallery(pokemon));
            });
    }

    // Function to add Pokémon to gallery
    function addPokemonToGallery(pokemon) {
        const gallery = document.querySelector('.gallery');
        const pokemonId = parseUrl(pokemon.url);
        const pokemonItem = document.createElement('div');
        pokemonItem.classList.add('item');
        pokemonItem.dataset.id = pokemonId;
        pokemonItem.innerHTML = `
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" alt="${pokemon.name}">
            <p>${pokemon.name.toUpperCase()}</p>
            <div class="caught-text">Caught</div>
        `;
        pokemonItem.addEventListener('click', () => displayPokemonDetails(pokemon));
        gallery.appendChild(pokemonItem);
    }

    // Function to display Pokémon details in the right section
    function displayPokemonDetails(pokemon) {
        const pokemonId = parseUrl(pokemon.url);
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
            .then(response => response.json())
            .then(data => {
                document.querySelector('.pokemon-image').src = data.sprites.front_default;
                document.querySelector('.name').textContent = data.name.toUpperCase();
                document.querySelector('.tag').textContent = data.types.map(typeInfo => typeInfo.type.name.toUpperCase()).join(', ');

                const catchBtn = document.querySelector('.catch-btn');
                const releaseBtn = document.querySelector('.release-btn');

                catchBtn.onclick = () => {
                    catchPokemon(data);
                    highlightCaughtPokemon(pokemonId);
                };

                releaseBtn.onclick = () => {
                    releasePokemon(pokemonId);
                    removeHighlightCaughtPokemon(pokemonId);
                };
            });
    }

    // Function to catch Pokémon and store in localStorage
    function catchPokemon(pokemon) {
        let caughtList = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
        if (!isPokemonCaught(pokemon.id)) {
            caughtList.push({ id: pokemon.id, name: pokemon.name });
            localStorage.setItem('caughtPokemon', JSON.stringify(caughtList));
        }
    }

    // Function to release Pokémon and remove from localStorage
    function releasePokemon(pokemonId) {
        let caughtList = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
        caughtList = caughtList.filter(p => p.id !== pokemonId);
        localStorage.setItem('caughtPokemon', JSON.stringify(caughtList));
    }

    // Function to highlight caught Pokémon in the gallery
    function highlightCaughtPokemon(pokemonId) {
        const pokemonItem = document.querySelector(`.gallery .item[data-id="${pokemonId}"]`);
        if (pokemonItem) {
            pokemonItem.classList.add('highlight');
            pokemonItem.querySelector('.caught-text').style.display = 'block';
        }
    }

    // Function to remove highlight from released Pokémon
    function removeHighlightCaughtPokemon(pokemonId) {
        const pokemonItem = document.querySelector(`.gallery .item[data-id="${pokemonId}"]`);
        if (pokemonItem) {
            pokemonItem.classList.remove('highlight');
            pokemonItem.querySelector('.caught-text').style.display = 'none';
        }
    }

    function isPokemonCaught(pokemonId) {
        let caughtList = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
        return caughtList.some(p => p.id === pokemonId);
    }

    function parseUrl(url) {
        return url.substring(url.substring(0, url.length - 2).lastIndexOf('/') + 1, url.length - 1);
    }

    // Load caught Pokémon on page load
    function displayCaughtPokemon() {
        const caughtList = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
        caughtList.forEach(pokemon => highlightCaughtPokemon(pokemon.id));
    }

    displayCaughtPokemon();
});
