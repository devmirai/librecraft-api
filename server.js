const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  // Obtén el nombre de usuario de la consulta (?user=usuario)
  const username = req.query.user;

  // Verifica si se proporcionó un nombre de usuario
  if (!username) {
    return res.status(400).json({ error: 'Falta el parámetro de consulta "user"' });
  }

  const url = `https://librecraft.com/jugadores/${username}`;

  axios.get(url)
    .then(response => {
      const $ = cheerio.load(response.data);
      const playerData = {
        playerName: $('#profile_header h1').text().trim(),
        avatar: $('#profile_header img').attr('src'),
        games: []
      };

      // Itera a través de los juegos
      $('.card').each((gameIndex, gameElement) => {
        const gameData = {
          name: $(gameElement).find('.card-header a').text().trim(),
          thumbnail: $(gameElement).find('.card-img-top').attr('src'),
          stats: {}
        };

        // Itera a través de las estadísticas del juego
        $(gameElement).find('.list-group-item').each((statIndex, statElement) => {
          const statText = $(statElement).text().trim().split(' ');
          const statName = statText.slice(0, -1).join(' '); // Considera el último elemento como el valor
          const statValue = statText.slice(-1)[0];

          gameData.stats[statName] = statValue;
        });

        playerData.games.push(gameData);
      });

      // Envia los datos como JSON
      res.json(playerData);
    })
    .catch(error => res.status(500).json({ error: 'Error al hacer la solicitud' }));
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
