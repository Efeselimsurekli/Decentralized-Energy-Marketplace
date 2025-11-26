import { useState } from 'react';
import { ethers } from 'ethers';

// Henüz içleri boş olsa da dosyaları çağırıyoruz, hata vermesin diye.
import TokenABI from './TokenABI.json';
import EnergyABI from './EnergyABI.json';

// --- BURASI SONRA DOLDURULACAK ---
// Remix işini çözdüğümüzde adresleri buraya tırnak içine yapıştıracağız.
const TOKEN_ADDRESS = "0xF1869Dd7Ab73DEB7405874A4B136f07F217F7fA0"; 
const ENERGY_ADDRESS = "0x0058A6C61eD2830c7110B2F277827cDC3D65fE16"; 
// ---------------------------------

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [producer, setProducer] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(""); // Ekrana mesaj yazmak için

  // 1. CÜZDAN BAĞLAMA FONKSİYONU
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Ethers v6 ile bağlantı
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        setStatus("Cüzdan bağlandı! 🟢");
        
        // Cüzdan bağlanınca bakiyeyi de soralım (Fonksiyon aşağıda)
        checkBalance(address, provider);

      } catch (error) {
        console.error(error);
        setStatus("Bağlantı reddedildi 🔴");
      }
    } else {
      alert("MetaMask yüklü değil!");
    }
  };

  // 2. BAKİYE SORGULAMA
  const checkBalance = async (address, provider) => {
    try {
      // Kontratla konuşmak için: Adres + ABI + Provider
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TokenABI, provider);
      const bal = await tokenContract.balanceOf(address);
      // 18 sıfırı silip okunur sayı yap
      setBalance(ethers.formatUnits(bal, 18));
    } catch (err) {
      console.log("Henüz kontrat adresi girilmediği için bakiye okunamaz.");
    }
  };

  // 3. ENERJİ SATIN ALMA (TransferEnergy)
  const handleBuyEnergy = async () => {
    if (!account) return alert("Önce cüzdanı bağla!");
    if (!amount || !producer) return alert("Alanları doldur!");

    setStatus("İşlem başlıyor... Lütfen bekleyin ⏳");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Kontratları tanımla
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TokenABI, signer);
      const energyContract = new ethers.Contract(ENERGY_ADDRESS, EnergyABI, signer);

      // Miktarı Wei formatına çevir (Örn: 50 -> 5000000...)
      const amountInWei = ethers.parseUnits(amount, 18);

      // ADIM A: Para harcama izni ver (Approve)
      setStatus("1/2: Token harcama onayı bekleniyor... 📝");
      const approveTx = await tokenContract.approve(ENERGY_ADDRESS, amountInWei);
      await approveTx.wait(); // Onaylanmasını bekle

      // ADIM B: Enerjiyi Transfer Et
      setStatus("2/2: Enerji transfer ediliyor... ⚡");
      const transferTx = await energyContract.transferEnergy(producer, amount);
      await transferTx.wait(); // İşlemin bitmesini bekle

      setStatus("İşlem Başarılı! Enerji alındı. 🎉");
      
      // Bakiyeyi güncelle
      checkBalance(account, provider);

    } catch (error) {
      console.error(error);
      // Hatayı ekrana yazdır (Kullanıcı reddettiyse vs.)
      setStatus("Hata: " + (error.reason || error.message || "İşlem iptal edildi."));
    }
  };

  // --- HTML GÖRÜNÜM KISMI ---
  return (
    <div style={{ backgroundColor: "#282c34", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Arial" }}>
      
      <h1>⚡ Enerji Borsası dApp ⚡</h1>

      {/* Cüzdan Bağlı Değilse Buton Göster */}
      {!account ? (
        <button 
          onClick={connectWallet} 
          style={{ padding: "15px 30px", fontSize: "18px", cursor: "pointer", backgroundColor: "#61dafb", border: "none", borderRadius: "5px" }}
        >
          Cüzdan Bağla (MetaMask) 🦊
        </button>
      ) : (
        // Cüzdan Bağlıysa Bilgileri Göster
        <div style={{ textAlign: "center" }}>
          <p style={{ backgroundColor: "#444", padding: "10px", borderRadius: "5px" }}>
            👤 <strong>Hesap:</strong> {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </p>
          <p style={{ fontSize: "20px", color: "#61dafb" }}>
            💰 <strong>Bakiye:</strong> {balance} ENG
          </p>
        </div>
      )}

      {/* İşlem Kutusu */}
      <div style={{ marginTop: "40px", padding: "30px", border: "2px solid #61dafb", borderRadius: "15px", width: "350px", backgroundColor: "#3a3f4b" }}>
        <h3 style={{ textAlign: "center" }}>Enerji Satın Al</h3>
        
        <label>Üretici Adresi (Kime gidecek?):</label>
        <input 
          type="text" 
          placeholder="0x..." 
          onChange={(e) => setProducer(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "none" }}
        />

        <label>Miktar (Kaç Enerji?):</label>
        <input 
          type="number" 
          placeholder="Örn: 50" 
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px", border: "none" }}
        />

        <button 
          onClick={handleBuyEnergy}
          style={{ width: "100%", padding: "12px", marginTop: "10px", backgroundColor: "orange", color: "black", fontWeight: "bold", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          SATIN AL ⚡
        </button>
        
        {/* Durum Mesajı */}
        <p style={{ marginTop: "20px", textAlign: "center", color: "yellow", minHeight: "20px" }}>
          {status}
        </p>
      </div>

    </div>
  );
}

export default App;