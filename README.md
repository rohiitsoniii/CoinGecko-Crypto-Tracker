# CoinGecko Crypto Tracker

## Execution Methodology
- Uses Google Apps Script to fetch data from CoinGecko API every 30 minutes
- Updates Current Prices sheet with latest data (overwrites previous)
- Appends historical snapshots to Price History sheet
- Handles API errors and provides logging

## Trigger Configuration
- Time-driven trigger set for every 30 minutes
- Function: updateCryptoData
- Automatic execution without manual intervention

## Known Limitations
- Relies on CoinGecko API availability
- Free tier API rate limits may apply
- Historical data grows continuously (cleanup function available)
- Internal Ref Code field left empty as specified

## Files
- Code.gs: Main script with all functions
- Crypto Tracker: Google Sheet with Current Prices and Price History sheets
