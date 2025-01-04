// plugins/risk-engine-plugin/views/main.js
document.addEventListener("DOMContentLoaded", () => {
    const checkBtn = document.getElementById("checkBtn");
    const userIdInput = document.getElementById("userIdInput");
    const resultsDiv = document.getElementById("results");
  
    checkBtn.addEventListener("click", async () => {
      const userId = userIdInput.value.trim();
      if (!userId) {
        alert("Please enter a user ID.");
        return;
      }
  
      try {
        // Call our risk engine endpoint
        const resp = await fetch(`/plugins/risk-engine-plugin/api/transactions/anomalies?userId=${userId}`);
        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(errText);
        }
  
        const data = await resp.json();
        resultsDiv.innerHTML = `
          <p><strong>User:</strong> ${data.userId}</p>
          <p><strong>Total Transactions:</strong> ${data.totalTransactions}</p>
          <p><strong>Anomalies Found:</strong> ${data.anomaliesCount}</p>
          <pre>${JSON.stringify(data.anomalies, null, 2)}</pre>
        `;
      } catch (error) {
        console.error("Error checking anomalies:", error);
        alert("Failed to check anomalies: " + error.message);
      }
    });
  });
  