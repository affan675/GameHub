function renderGameCards(games, container) {
    container.innerHTML = '';
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        const thumbSrc = game.thumbnail || 'assets/images/placeholder-thumb.png';
        const btnClass = game.isReal ? 'play-btn' : 'play-btn coming-soon';
        const btnText = game.isReal ? 'Play Now →' : 'Coming Soon';
        const linkHref = game.isReal ? `games/${game.folder}/index.html` : '#';
        card.innerHTML = `
            <img src="${thumbSrc}" alt="${game.title}" class="game-thumb">
            <h3 class="game-title">${game.title}</h3>
            <a href="${linkHref}" class="${btnClass}" ${!game.isReal ? 'onclick="return false;"' : ''}>${btnText}</a>
        `;
        container.appendChild(card);
    });
}