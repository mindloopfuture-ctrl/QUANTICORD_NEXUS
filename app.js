document.getElementById("connect").addEventListener("click", () => {
  document.getElementById("status").innerText =
    "🔗 Conectando a la red Solana… (Token $QCN)";
  setTimeout(() => {
    document.getElementById("status").innerText =
      "✅ Wallet conectada al ecosistema QUANTICORD NEXUS";
  }, 2000);
});
