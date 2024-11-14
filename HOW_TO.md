npm init -y
npm install express simple-git

curl -X POST -H "Content-Type: application/json" -d '{"repoUrl":"https://github.com/ninjapayofficial/sample-plugin.git"}' http://localhost:3000/install-plugin

curl -X POST -H "Content-Type: application/json" -d '{"repoUrl":"https://github.com/ninjapayofficial/Ninjapay-Plugin-Backend/tree/firebase-integration"}' http://localhost:3000/install-plugin

curl -X 'POST' 'http://localhost:3000/install-plugin' -H 'accept: /' -H 'Content-Type: application/json' -d '{ "repoUrl": "https://github.com/ninjapayofficial/Ninjapay-Plugin-Backend/tree/firebase-integration" }'



curl http://localhost:3000/current-time
rm -rf plugins/sample-plugin



//////

Step 4: Reinstall and Test the Plugin
1. Remove Existing Plugin (If Necessary)
In the main-app directory:

bash
Copy code
rm -rf plugins/sample-plugin
2. Restart the Main Application
bash
Copy code
node app.js

3. Install the Plugin
Use curl to install the plugin:
bash
Copy code
curl -X POST -H "Content-Type: application/json" -d '{"repoUrl":"https://github.com/yourusername/sample-plugin.git"}' http://localhost:3000/install-plugin
Replace yourusername with your actual GitHub username.


4. Test Plugin Endpoints
Create Data
bash
Copy code
curl -X POST -H "Content-Type: application/json" -d '{"name":"NIN Item3", "value":470}' http://localhost:3000/sample-plugin/plugin-data

Expected Output:
yaml
Copy code
Data saved successfully! ID: 1

Retrieve Data
Copy code
curl http://localhost:3000/sample-plugin/plugin-data
Expected Output:
json
Copy code
[
  {
    "id": 1,
    "name": "Test Item",
    "value": 42,
    "createdAt": "2023-10-01T12:34:56.789Z",
    "updatedAt": "2023-10-01T12:34:56.789Z"
  }
]




curl http://localhost:3000/plugins
[
  "sample-plugin"
]

curl -X POST -H "Content-Type: application/json" -d '{"pluginName":"lightning-btc-plugin"}' http://localhost:3000/remove-plugin

Plugin 'sample-plugin' uninstalled successfully.

curl http://localhost:3000/plugins
[]



5. Remove the Plugin
curl -X POST -H "Content-Type: application/json" -d '{"pluginName":"sample-plugin"}' http://localhost:3000/remove-plugin





///////////

curl http://localhost:3000/lightning-btc-plugin/transactions

curl -X POST -H "Content-Type: application/json" -d '{"amount":4200, "memo":"NIN Test Invoice"}' http://localhost:3000/lightning-btc-plugin/create-invoice



curl -X POST -H "Content-Type: application/json" -d '{"bolt11":"lnbc10u1p..."}' http://localhost:3000/pay-invoice




curl -X 'POST'   'http://localhost:3000/install-plugin'   -H 'accept: */*'   -H 'Content-Type: application/json'   -d '{
  "repoUrl": "https://github.com/ninjapayofficial/lightning-btc-plugin"
}'


curl -X 'POST' \
  'http://localhost:3000/install-plugin' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "repoUrl": "https://github.com/ninjapayofficial/sample-plugin.git"
}'


curl -X 'POST' \
  'http://localhost:3000/remove-plugin' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "pluginName": "lightning-btc-plugin"
}'


curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-invoice-key: aa870b9765d643299430136ec9b2f6a5" \
  -d '{"amount":1200, "memo":"Purvi Advitha Naidu"}' \
  http://localhost:3000/plugins/lightning-btc-plugin/create-invoice




////// 
Funding Sources
curl -X POST http://localhost:3000/payments/createPayLink \
  -H "Content-Type: application/json" \
  -H "x-provider-invoice-key: p_ik_tre2qkb7l" \
  -d '{"amount": 1000, "description": "Test Payment"}'


curl -X GET http://localhost:3000/payments/transactions \
  -H "x-provider-invoice-key: p_ik_tre2qkb7l"


curl -X GET http://localhost:3000/api/checkPaymentStatus/7e7a2c4253d95fa1f9ea871460833e55655f94cbdd486f166b911638160bc752 \
  -H "Content-Type: application/json" \
  -H "x-provider-invoice-key: p_ik_tre2qkb7l"
  
curl -X GET http://localhost:3000/payments/checkPaymentStatus/7e7a2c4253d95fa1f9ea871460833e55655f94cbdd486f166b911638160bc752 \
  -H "x-provider-invoice-key: p_ik_tre2qkb7l" \
  -H "Content-Type: application/json"


curl -X POST http://localhost:3000/plugins/lightning-btc-plugin/create-invoice \
  -H "Content-Type: application/json" \
  -H "x-provider-invoice-key: p_ik_tre2qkb7l" \
  -d '{"amount": 1000, "memo": "Test Payment"}'



curl -X POST http://localhost:3000/plugins/lightning-btc-plugin/pay-invoice \
  -H "Content-Type: application/json" \
  -H "x-provider-admin-key: p_ak_kcq5mtsp4" \
  -d '{"bolt11": "lnbc1..."}'


curl -X GET http://localhost:3000/plugins/lightning-btc-plugin/balance \
  -H "x-provider-invoice-key: p_ik_tre2qkb7l"

  curl -X GET http://localhost:3000/plugins/lightning-btc-plugin/transactions \
  -H "x-provider-invoice-key: p_ik_tre2qkb7l"


// migrations call on db changes \ dont for get config.json \
npx sequelize-cli db:migrate  \


