
# CoinGecko Crypto Tracker

## Execution Methodology

* Uses **Google Apps Script** to fetch data from the CoinGecko API every 30 minutes
* Updates **Current Prices** sheet with the latest data (overwrites previous data)
* Appends historical snapshots to the **Price History** sheet
* Handles API errors and provides logging

## Trigger Configuration

* **Time-driven trigger** set for every 30 minutes
* Function: `updateCryptoData`
* Automatic execution without manual intervention

## Known Limitations

* Relies on CoinGecko API availability
* Free tier API rate limits may apply
* Historical data grows continuously (**cleanup function available**)
* *Internal Ref Code* field left empty as specified

## Files

* `Code.gs`: Main script containing all functions
* `Crypto Tracker`: Google Sheet with **Current Prices** and **Price History** tabs
* [Filter View Sheet Link](https://docs.google.com/spreadsheets/d/1xTsYPSynHLTM2TeUs8BJ6J0yxnibFTM1Vl_DngGThu0/edit?usp=sharing)
* **Automation File**: `automation.png` 
---

