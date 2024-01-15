const axios = require('axios');

async function geocodeAddress(address) {
  const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      console.log(`Adresse: ${address}`);
      console.log(`Coordonnées: Latitude ${lat}, Longitude ${lon}`);
    } else {
      console.log('Adresse non trouvée.');
    }
  } catch (error) {
    console.error('Erreur lors de la requête à l\'API Nominatim:', error.message);
  }
}

// Exemple d'utilisation
const address = 'Los Angeles';
geocodeAddress(address);
