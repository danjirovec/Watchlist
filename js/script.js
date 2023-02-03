// TMDB API klíč
const api_key = "6831d800276d497dbd5901121f6e0603";

// prefix pro získání plakátů filmů
const img_url_base = "https://image.tmdb.org/t/p/w500";

// element vyhledávacího pole
const movieSearchBox = document.getElementById('movie-search-box');

// element pro výsledky hledání
const searchList = document.getElementById('search-list');

// element pro watchlist
const watchlist = document.getElementById('watchlist');

// element pro prostor na zadávání poznámky k filmu
const noteTextAreaInput = document.getElementById('dialog-input');

// načítá filmy v reálném čase z API na základě hledaného výrazu
async function loadMovies(searchTerm) {

    let res = await fetch("https://api.themoviedb.org/3/search/movie?api_key=" + api_key + "&language=en-US&query=" + searchTerm +"&page=1&include_adult=false")
    let data = await res.json()
    if(data.results.length > 0) {
        displayMovieList(data.results)
    }
}

// zobrazuje nebo skrývá výsledný list výsledků hledání podle toho, jestli je ve vyhledávacím poli text
function findMovies(){
    let searchTerm = (movieSearchBox.value).trim();
    if(searchTerm.length > 0){
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
        searchList.classList.add('hide-search-list');
    }
}

// vkládá do DOMu samotný list vyhledaných filmů
function displayMovieList(movies){
    searchList.innerHTML = "";
    for(let i = 0; i < movies.length; i++){
        let movieListItem = document.createElement('div');
        movieListItem.dataset.id = movies[i].id; // setting movie id in  data-id
        movieListItem.classList.add('search-list-item');
        movieListItem.innerHTML = `
            <div class="search-item-thumbnail">
                <img src="${img_url_base}${movies[i].poster_path}">
            </div>
            <div class="search-item-info">
                <h2>${movies[i].title}</h2>
                <div class="dateAndRating">
                    <p class="releaseDate"><span class="infoTags">Release Date: </span>${parseInt(movies[i].release_date)}</p>
                    <p><span class="infoTags">Rating: </span>${movies[i].vote_average}</p>
                </div>
                <p class="overview-info">${movies[i].overview}</p>
            </div>
            <div class="btns">
                <button class="btn" id="${movieListItem.dataset.id}">Add to watchlist</button>
            </div>
        `;
        searchList.appendChild(movieListItem);
        
        const btn = document.getElementById(movieListItem.dataset.id);

        getWatchlist(btn, movieListItem.dataset.id)
        
        addOrRemoveMovieFromWatchlist(btn, movieListItem.dataset.id)

    }
}

// při vyhledávání slouží k zobrazení filmů, které jsou již ve watchlistu přidané
function getWatchlist(button, id) {
    const movieIDs = getLocalStorage() 
    for(let i = 0; i <= movieIDs.length; i++) {
        if (movieIDs[i] == id) {
            button.classList.add('change-color')
            button.innerHTML = "Remove"
        }
    }
}

// slouží pro zobrazení nebo skrytí textu o prázdném watchlistu na stránce watchlistu
function isWatchlistEmpty() {
    if(document.getElementById('empty-watchlist') !== null) {
        const movieIDs = getLocalStorage()
        if (movieIDs.length === 0) {
            document.getElementById('empty-watchlist').style.display = 'block';
        } else {
            document.getElementById('empty-watchlist').style.display = 'none';
        }
    }
}

// slouží pro přidání nebo odstranění filmu z watchlistu
function addOrRemoveMovieFromWatchlist(button, id) {
    button.addEventListener('click', () => {
    if(button.classList.contains('change-color')) {
        removeFromLocalStorage(id)
        button.classList.remove('change-color')
        button.innerHTML = "Add to watchlist"
    } else {
        addToLocalStorage(id)
        button.classList.add('change-color')
        button.innerHTML = "Remove"
    }
    loadWatchlist()
    })
}

// z localStorage vrací objekt s ID filmů, které jsou aktuálně ve watchlistu
function getLocalStorage () {
    const movieIDs = JSON.parse(localStorage.getItem('movieID'))
    return movieIDs === null ? [] : movieIDs
}

// slouží k přidání filmu z watchlistu do localStorage
function addToLocalStorage (id) {
    const movieIDs = getLocalStorage()
    localStorage.setItem('movieID', JSON.stringify([...movieIDs, id]))
}

// slouží k odstranění filmu z watchlistu a z localStorage
function removeFromLocalStorage (id) {
    const movieIDs = getLocalStorage()
    localStorage.setItem('movieID', JSON.stringify(movieIDs.filter(e => e !== id)))
}

// z localStorage vrací objekt s ID filmů, které jsou aktuálně ve watchlistu
// a mají status 'Watched', jsou tedy již shlédnuté
function getWatchedLocalStorage () {
    const movieIDs = JSON.parse(localStorage.getItem('movieWatchedID'))
    return movieIDs === null ? [] : movieIDs
}

// slouží k přidání filmu z watchlistu, kterému se změnil status na 'Watched' do localStorage shlédnutých filmů
function addWatchedToLocalStorage (id) {
    const movieIDs = getWatchedLocalStorage()
    localStorage.setItem('movieWatchedID', JSON.stringify([...movieIDs, id]))
}

// slouží k odstranění filmu z localStorage 'Watched' listu
function removeWatchedFromLocalStorage (id) {
    const movieIDs = getWatchedLocalStorage();
    localStorage.setItem('movieWatchedID', JSON.stringify(movieIDs.filter(e => e !== id)))
}

// načtení filmů, které jsou aktuálně ve watchlistu z TMDB API podle jejich ID
async function loadWatchlist() {
    const movieIDs = getLocalStorage();
    let watchlistMovies = []
    for(let i = 0; i < movieIDs.length; i++) {
        const res = await fetch("https://api.themoviedb.org/3/movie/" + movieIDs[i] + "?api_key=" + api_key)
        const data = await res.json()
        watchlistMovies.push(data)
    }
    if(watchlistMovies.length > 0) {
        displayWatchlist(watchlistMovies)
    }
}

// vkládá do DOMu watchlist uživatelem přidaných filmů
function displayWatchlist(movies) {
    watchlist.innerHTML = "";
    for(let i = 0; i < movies.length; i++){
        let watchlistItem = document.createElement('div');
        watchlistItem.classList.add('watchlist-item');
        watchlistItem.setAttribute('id', 'watchlist-item')
        watchlistItem.innerHTML = `
            <div class="watchlist-item-name">
                <h2>${movies[i].title}</h2>
            </div>    
            <div class="watchlist-item-thumbnail-btns">
                <div class="watchlist-item-thumbnail">
                    <img id="${movies[i].id}overlay" src="${img_url_base}${movies[i].poster_path}">
                </div>
                <div class="watchlist-btns">
                <button class="btn" id="${movies[i].id}watched">Tick Off</button>
                <button class="btn" id="${movies[i].id}note">Note</button>
                <button class="btn change-color" id="${movies[i].id}">Remove</button>
                </div>
            </div>
        `;
        watchlist.appendChild(watchlistItem);

        const btnRemove = document.getElementById(movies[i].id);

        removeFromWatchlist(btnRemove, movies[i].id, i)

        const btnWatched = document.getElementById(movies[i].id + "watched");

        getWatchedMovies()

        markAsWatched(btnWatched, movies[i].id)

        const btnNote = document.getElementById(movies[i].id + "note");

        showNote(btnNote, movies[i].id)

    }
}

// slouží k získání filmů z watchlistu, které mají status 'Watched'
// a přizpůsobuje tomu vzhled tlačítka pro tento status u jednotlivých filmů
function getWatchedMovies() {
    const movieWatchedIDs = getWatchedLocalStorage()
    for(let i = 0; i <= movieWatchedIDs.length; i++) {
        if (document.getElementById(movieWatchedIDs[i] + "watched") !== null) {
            document.getElementById(movieWatchedIDs[i] + "watched").classList.add('watched');
            document.getElementById(movieWatchedIDs[i] + "watched").innerHTML = "Watched";
        } 
        if (document.getElementById(movieWatchedIDs[i] + "overlay") !== null) {
            document.getElementById(movieWatchedIDs[i] + "overlay").style.borderColor = "green";
            document.getElementById(movieWatchedIDs[i] + "overlay").style.opacity = 0.65;
        }
    }
}

// slouží k odstranění filmu z watchlistu na stránce watchlist
// a refreshuje <div> pro daný film po jeho odstranění z watchlistu
function removeFromWatchlist(button, id, i) {
    button.addEventListener('click', () => {
        const movieIDs = getLocalStorage()
        if (movieIDs[i] == id) {
            removeFromLocalStorage(movieIDs[i])
        }
        $(document).ready(function () {
            $("#watchlist-item").load(window.location.href + " #watchlist-item");
        });
        loadWatchlist()
        isWatchlistEmpty()      
    })
}

// slouží k označení filmu jako 'Watched' ve watchlistu,
// volá funcki pro zadání poznámky a mění vizuál shlédnutého/neshlédnutého filmu
function markAsWatched(button, id) {
    button.addEventListener('click', () => {
        const imgWatched = document.getElementById(id + "overlay");
        if(button.classList.contains('watched')) {
            removeWatchedFromLocalStorage(id.toString())
            removeNoteFromLocalStorage(id)
            button.innerHTML = "Tick Off";
            button.classList.remove('watched');
            imgWatched.style.borderColor = "white";
            imgWatched.style.opacity = 1;
        } else {
            addWatchedToLocalStorage(id.toString())
            showDialog(id)
            button.innerHTML = "Watched";
            button.classList.add('watched');
            imgWatched.style.borderColor = "green";
            imgWatched.style.opacity = 0.65;
        }
    })
}


// vrací objekt s aktuálními poznámkami k jednotlivým filmům z localStorage
function getNotesLocalStorage () {
    const userNotes = JSON.parse(localStorage.getItem('notes'))
    return userNotes === null ? [] : userNotes
}

// přidává novou poznámku k určitému filmu do localStorage
function addNoteToLocalStorage (id, output) {
    const userNotes = getNotesLocalStorage()
    localStorage.setItem('notes', JSON.stringify([...userNotes, {id: id, content: output}]))
}

// odstraňuje poznámku u filmu z localStorage při odoznačení filmu jako 'Watched'
function removeNoteFromLocalStorage (id) {
    const userNotes = getNotesLocalStorage()
    localStorage.setItem('notes', JSON.stringify(userNotes.filter((e) => e.id.toString() !== id.toString())))
}

// slouží k vyvolání dialogového okna pro zadání poznámky ke shlédnutému filmu ve watchlistu,
// je volána po označení filmu jako 'Watched'
function showDialog(id) {
    document.querySelector(".dialog-input").setAttribute('id', id)
    const modal = document.querySelector('.modal-write-note');
    modal.showModal();
}

// slouží k získání hodnoty textového vstupu z formuláře pro zadání poznámky
// a voláním funkce addNoteToLocalStorage ukládá obsah poznámky k příslušnému filmu ve watchlistu do localStorage
function addNote() {
    const idInput = document.querySelector(".dialog-input").id
    const dialogInput = document.querySelector('.dialog-input');
    let outputValue = dialogInput.value;
    if (outputValue == "") {
        outputValue = "You didn't add notes to this movie.";
    }
    addNoteToLocalStorage(idInput, outputValue)
}

// slouží k vyvolání dialogového okna se zadanou poznámkou u každého filmu ve watchlistu
function showNote(button, id) {
    const noteText = document.getElementById('note-text-p');
    const modal = document.getElementById('modal-show-note');
    const closeModal = document.getElementById('dialog-btn-show');

    button.addEventListener('click', () => {
        noteText.innerHTML = "You don't have any notes for this movie.";
        const notes = getNotesLocalStorage();
        for(let i = 0; i < notes.length; i++) {
            if(notes[i].id == id) {
                noteText.innerHTML = notes[i].content;
            }
        }
        modal.showModal()
    })

    closeModal.addEventListener('click', () => {
        modal.close();
    })
}

// resetuje obsah textového pole pro zadání poznámky k filmu
function clearNoteTextarea() {
    noteTextAreaInput.value = '';
}

loadWatchlist()
isWatchlistEmpty()