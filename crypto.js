
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1';
const SPREADSHEET_ID = '1xTsYPSynHLTM2TeUs8BJ6J0yxnibFTM1Vl_DngGThu0'; // Replace with your actual Sheet ID


const CURRENT_PRICES_SHEET = 'Current Prices';
const PRICE_HISTORY_SHEET = 'Price History';

function updateCryptoData() {
  try {
    console.log('🔄 Starting crypto data update...');
    
    const cryptoData = fetchCoinGeckoDataWithRetries();
    
    if (!cryptoData || cryptoData.length === 0) {
      console.error('❌ No data received from CoinGecko API');
      return;
    }

    updateCurrentPricesSheet(cryptoData);
    updatePriceHistorySheet(cryptoData);

    console.log('✅ Crypto data update completed successfully');

  } catch (error) {
    console.error('🚨 Error in updateCryptoData:', error);
  }
}


function fetchCoinGeckoDataWithRetries() {
  const MAX_RETRIES = 3;
  const DELAY_MS = 5000; // 5 seconds
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      console.log(`📡 Fetching data from CoinGecko (Attempt ${attempt})`);
      
      const response = UrlFetchApp.fetch(API_URL);
      
      if (response.getResponseCode() !== 200) {
        throw new Error(`API responded with status code ${response.getResponseCode()}`);
      }

      const data = JSON.parse(response.getContentText());
      console.log(`✅ Successfully fetched ${data.length} coins`);
      return data;

    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);

      if (attempt < MAX_RETRIES && error.message.includes('429')) {
        console.log(`⏳ Rate limit hit. Waiting ${DELAY_MS / 1000}s before retrying...`);
        Utilities.sleep(DELAY_MS);
      } else if (attempt < MAX_RETRIES) {
        console.log(`🔁 Retrying in ${DELAY_MS / 1000}s...`);
        Utilities.sleep(DELAY_MS);
      } else {
        console.error('❌ Max retries reached. Could not fetch data.');
        throw error;
      }
    }
  }
}


function updateCurrentPricesSheet(cryptoData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(CURRENT_PRICES_SHEET);
    if (!sheet) throw new Error(`Sheet "${CURRENT_PRICES_SHEET}" not found`);

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 8).clear(); // Clear old data but keep headers
    }

    const currentTime = new Date();
    const rows = cryptoData.map(coin => [
      coin.id,
      coin.symbol?.toUpperCase(),
      coin.name,
      coin.current_price,
      coin.market_cap,
      coin.price_change_percentage_24h,
      coin.last_updated,
      currentTime
    ]);

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 8).setValues(rows);
      console.log(`✅ Updated Current Prices sheet with ${rows.length} records`);
    }

  } catch (error) {
    console.error('❌ Error updating Current Prices sheet:', error);
    throw error;
  }
}


function updatePriceHistorySheet(cryptoData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PRICE_HISTORY_SHEET);
    if (!sheet) throw new Error(`Sheet "${PRICE_HISTORY_SHEET}" not found`);

    const currentTime = new Date();
    const rows = cryptoData.map(coin => [
      currentTime,
      coin.id,
      coin.symbol?.toUpperCase(),
      coin.name,
      '',
      coin.current_price,
      coin.market_cap,
      coin.price_change_percentage_24h
    ]);

    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, 8).setValues(rows);

    console.log(`📈 Added ${rows.length} records to Price History sheet`);

  } catch (error) {
    console.error('❌ Error updating Price History sheet:', error);
    throw error;
  }
}


function testScript() {
  updateCryptoData();
}


function setupTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger)); // Clear old triggers

  ScriptApp.newTrigger('updateCryptoData')
    .timeBased()
    .everyMinutes(30)
    .create();

  console.log('⏰ Trigger set: Script will run every 30 minutes');
}


function cleanupOldData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(PRICE_HISTORY_SHEET);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const data = sheet.getDataRange().getValues();
    const rowsToDelete = [];

    for (let i = 1; i < data.length; i++) {
      const timestamp = new Date(data[i][0]);
      if (timestamp < sevenDaysAgo) {
        rowsToDelete.push(i + 1); // account for 1-indexed rows
      }
    }

    // Delete from bottom to top
    rowsToDelete.reverse().forEach(row => sheet.deleteRow(row));
    console.log(`🧹 Cleaned ${rowsToDelete.length} old rows`);

  } catch (error) {
    console.error('❌ Error cleaning up old data:', error);
  }
}
