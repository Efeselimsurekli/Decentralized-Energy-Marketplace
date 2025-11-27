// SPDX-License-Identifier: MIT
pragma solidity 0.8.18; // Ganache ve Remix uyumluluğu için derleyici sürümünü sabitledik.

// OpenZeppelin kütüphanesinden güvenli ve standart ERC-20 ile Yetki (Ownable) kodlarını çekiyoruz.
import "@openzeppelin/contracts@4.9.3/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

// Kontratımız hem bir ERC-20 Token'dır hem de Sahiplik (Ownable) özelliklerine sahiptir.
contract MyEnergyToken is ERC20, Ownable {
    
    // Constructor: Kontrat blockchain'e ilk yüklendiğinde (Deploy) sadece bir kez çalışır.
    // 'initialSupply': Başlangıçta kaç tane token üretileceğini belirler.
    constructor(uint256 initialSupply) ERC20("EnergyToken", "ENG") {
        
        // _mint: Token basma fonksiyonudur.
        // msg.sender: Kontratı deploy eden kişi (yani biz).
        // initialSupply * 10 ** decimals(): Ethereum'da 1 token 18 ondalıklıdır (Wei). 
        // Bu yüzden girilen sayıyı 10^18 ile çarparak sisteme tanıtıyoruz.
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // BONUS GÖREV 1: Yeni token üretme (Mint) fonksiyonu.
    // onlyOwner: Bu fonksiyonu sadece kontratın sahibi (Deploy eden) çalıştırabilir.
    // Bu sayede herkes kafasına göre para basamaz.
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // BONUS GÖREV 1: Token yakma (Burn) fonksiyonu.
    // Her kullanıcı kendi cüzdanındaki tokenları yakarak (yok ederek) toplam arzı düşürebilir.
    // msg.sender: Yakan kişi.
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
