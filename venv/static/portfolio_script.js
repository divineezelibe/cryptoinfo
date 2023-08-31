
document.addEventListener("DOMContentLoaded", () => {
  const topCryptosSection = document.querySelector('.top-cryptos');
  const detailedInfoSection = document.querySelector('.detailed-info');
  const realTimeUpdatesSection = document.querySelector('.real-time-updates');
  const cryptoInfoSection = document.querySelector('.crypto-info');
  const viewDetailsButtons = document.querySelectorAll('.view-details-button');

  const API_BASE_URL = "http://localhost:5000/api/cryptocurrencies";

 // WebSocket setup
 //const socket = new WebSocket("ws://localhost:5000");
const socket = io.connect('http://localhost:5000');

 socket.on('connect', () => {
  console.log('WebSocket connected');
});

socket.on('disconnect', () => {
  console.log('WebSocket disconnected');
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});
socket.on('real_price_update', (data) => {
  // Process the data and update your UI
  console.log('Real-time price update received:', data);

  const updatesList = realTimeUpdatesSection.querySelector('.updates-list');
  updatesList.innerHTML = '';

  data.forEach(crypto => {
    const arrowIcon = crypto.changePercent24Hr >= 0 ? 'fas fa-caret-up' : 'fas fa-caret-down';
    const changeColor = crypto.changePercent24Hr >= 0 ? '#27ae60' : '#e74c3c';
    updatesList.innerHTML += `
      <li><i class="${arrowIcon}" style="color: ${changeColor};"></i> <b>${crypto.name}</b>: $${crypto.priceUsd} (${crypto.changePercent24Hr}%)</li>
    `;
  });

  //showSection(realTimeUpdatesSection);
});


  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };

  function showSection(section) {
    topCryptosSection.style.display = 'none';
    detailedInfoSection.style.display = 'none';
    realTimeUpdatesSection.style.display = 'none';
    cryptoInfoSection.style.display = 'none';
    section.style.display = 'block';
  }

  function showDetailedInfo(cryptoSymbol) {
    fetch(`${API_BASE_URL}/${cryptoSymbol}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const infoContent = detailedInfoSection.querySelector('.info-content');
        infoContent.innerHTML = `
          <h3><i class="fas fa-coins"></i> ${data.name}</h3>
          <p><strong>Current Price:</strong> $${data.priceUsd !== undefined ? data.priceUsd : 'N/A'}</p>
          <p><strong>24h Change:</strong> ${data.changePercent24Hr !== undefined ? data.changePercent24Hr + '%' : 'N/A'}</p>
          <p>${data.description !== undefined ? data.description : 'Description not available'}</p>
          <a href="#home">Back to Top Cryptocurrencies</a>
        `;
        showSection(detailedInfoSection);
      })
      .catch(error => {
        console.error("Error fetching cryptocurrency details:", error);
      });
  }
  

  function showRealTimeUpdates() {
    // const updatesList = realTimeUpdatesSection.querySelector('.updates-list');
    // updatesList.innerHTML = '';
    // // Use your data from the API instead of sampleCryptoData
    // fetch(`${API_BASE_URL}`)
    //   .then(response => response.json())
    //   .then(data => {
    //     data.forEach(crypto => {
    //       const arrowIcon = crypto.change >= 0 ? 'fas fa-caret-up' : 'fas fa-caret-down';
    //       const changeColor = crypto.change >= 0 ? '#27ae60' : '#e74c3c';
    //       updatesList.innerHTML += `
    //         <li><i class="${arrowIcon}" style="color: ${changeColor};"></i> ${crypto.name}: $${crypto.priceUsd} (${crypto.changePercent24Hr}%)</li>
    //       `;
    //     });
    //   })
    //   .catch(error => {
    //     console.error("Error fetching real-time updates:", error);
    //   });
    showSection(realTimeUpdatesSection);
  }

  // ... (previous code) ...
  // Event listeners for navigation
document.querySelector('nav a[href="#home"]').addEventListener('click', () => showSection(topCryptosSection));
document.querySelector('nav a[href="#view-details"]').addEventListener('click', () => showSection(topCryptosSection));
document.querySelector('nav a[href="#real-time-updates"]').addEventListener('click', showRealTimeUpdates);
document.querySelector('nav a[href="#crypto-info"]').addEventListener('click', () => showSection(topCryptosSection));

  // Update HTML to include data-symbol attribute
  viewDetailsButtons.forEach((button, index) => {
    const cryptoSymbol = button.getAttribute("data-symbol");
    button.addEventListener('click', () => showDetailedInfo(cryptoSymbol));
  });

  // Call the function to show the default section
  showSection(topCryptosSection);
});

