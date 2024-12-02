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

\
curl -X POST -H "Content-Type: application/json" -d '{"pluginName":"khata-plugin"}' http://localhost:3000/remove-plugin

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
\
curl -X 'POST'   'http://localhost:3000/install-plugin'   -H 'accept: */*'   -H 'Content-Type: application/json'   -d '{
  "repoUrl": "https://github.com/ninjapayofficial/khata-plugin"
}'
\

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


curl -X GET http://localhost:3000/api/checkPaymentStatus/ef30e22f3c754b23d7de6abaee62fa9426a204a2e7a989bac6ca53e3f87c5ef4 \
  -H "Content-Type: application/json" \
  -H "x-provider-invoice-key: p_ik_9v1mm6sqh"
  
curl -X GET http://localhost:3000/payments/checkPaymentStatus/7e7a2c4253d95fa1f9ea871460833e55655f94cbdd486f166b911638160bc752 \
  -H "x-provider-invoice-key: p_ik_tre2qkb7l" \
  -H "Content-Type: application/json"


curl -X GET http://localhost:3000/payments/checkPaymentStatus/3f00e9fcc5f734c942284bbffdf9a8d9cab51e681533e542da42414f75b2a357 \
  -H "x-provider-invoice-key: p_ik_9v1mm6sqh" \
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
npx sequelize-cli db:migrate:undo \

lnbc700n1pnnw56hsp5nnz6kzsqmhg8f9rsqxlhvrvmvf50dwupyu90w39h52zn469q5w8qpp5xmcje9emz26pzvkwmue2ln8vqc9vydk0v2uf8z7nlydt9enplajqdpqf38xy6t5wvszs3z9f48jq5692fty253fcqpjrzjqgj5av5qnh9lgrmz44lc9n3gp8srkpc5a5ss0hn2dpup9vfs5f5fcrrxvyqqnlcqqyqqqqlgqqqqqqqqvs9qxpqysgqu9sn5dewrenunxa2k9dusx0nx4sfunj3nvqse6ksthvw70fulpthh28fz3d8j3je46rd98zkgaahy23defzrtmvwzka2c3j2wcel09qpsa6mx5

curl -X POST http://localhost:3000/plugins/lightning-btc-plugin/pay-invoice \
  -H "Content-Type: application/json" \
  -H "x-provider-admin-key: p_ak_kcq5mtsp4" \
  -d '{"bolt11": "lnbc700n1pnnwel9sp5aqzccyet2yv35l06wjge9pkj4zkp9j099scx8qg5fr7klwe99hcqpp5e9sarwne0q6qgru00h7t8zlrs2g2kwtwe80k69sls2qwvez2h4kqdpqf38xy6t5wvszs3z9f48jq5692fty253fcqpjrzjqfsktpgyjffp7jkg40vmmqygzg6yd5fx7eyv5d0xp7ypwlwpf88tyrxn3qqq7mgqqqqqqqqqqqqqqqgq2q9qxpqysgq4j6rn64c4pqepx9ax98wef4jdrsjhh04mz8d4h82gp8dqmjjtkshg5lezed4l4z7ua0ef79pcck20jhgew8unyyas9ldzwp76szjtxgp8agpvz"}'



\\\

curl -X POST https://demo.lnbits.com/api/v1/payments -d '{"out": true, "bolt11": "lnbc700n1pnnw56hsp5nnz6kzsqmhg8f9rsqxlhvrvmvf50dwupyu90w39h52zn469q5w8qpp5xmcje9emz26pzvkwmue2ln8vqc9vydk0v2uf8z7nlydt9enplajqdpqf38xy6t5wvszs3z9f48jq5692fty253fcqpjrzjqgj5av5qnh9lgrmz44lc9n3gp8srkpc5a5ss0hn2dpup9vfs5f5fcrrxvyqqnlcqqyqqqqlgqqqqqqqqvs9qxpqysgqu9sn5dewrenunxa2k9dusx0nx4sfunj3nvqse6ksthvw70fulpthh28fz3d8j3je46rd98zkgaahy23defzrtmvwzka2c3j2wcel09qpsa6mx5"}' -H "X-Api-Key: aa870b9765d643299430136ec9b2f6a5" -H "Content-type: application/json"




\/ opennode calls /\
curl -X POST http://localhost:3000/payments/createPayLink \
  -H "Content-Type: application/json" \
  -H "x-provider-invoice-key: p_ik_6stcmkg4o" \
  -d '{"amount": 77, "description": "nin"}'

\
curl -X GET http://localhost:3000/payments/transactions \
  -H "x-provider-invoice-key: p_ik_6stcmkg4o"


  \\\ \
  DROP TABLE IF EXISTS "SequelizeMeta_khata-plugin" CASCADE; \
  DELETE FROM "SequelizeMeta_khata-plugin";  \
  \dT  \
  DROP TYPE IF EXISTS "enum_KhataParties_type" CASCADE;


\
docker build -t ninjapay-plugin-backend .  
\
docker run -p 3000:3000 ninjapay-plugin-backend \
docker run -d -p 3000:3000 ninjapay-plugin-backend \
\
docker ps \
docker stop <containerId> \