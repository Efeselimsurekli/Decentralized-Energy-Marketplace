// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "./MyEnergyToken.sol";
contract EnergyShare {
    MyEnergyToken public token;
    uint256 public energyRate; // 1 birim Enerji kaç Token eder?

    // İşlem gerçekleştiğinde blockchain'e not düşmek için (Loglama)
    event EnergyTransferred(address indexed consumer, address indexed producer, uint256 energyAmount, uint256 cost);

    // Kontrat kurulurken Token adresini ve fiyatı belirler
    constructor(address _tokenAddress, uint256 _rate) {
        token = MyEnergyToken(_tokenAddress);
        energyRate = _rate;
    }
    // Enerji transferi fonksiyonu
    function transferEnergy(address producer, uint256 energyAmount) public {
        // 1. Toplam ücreti hesapla (Enerji Miktarı x Birim Fiyat)
        uint256 cost = energyAmount * energyRate;

        // 2. Kontrolleri yap
        require(token.balanceOf(msg.sender) >= cost, "Yetersiz Bakiye: Tokeniniz az.");
        require(token.allowance(msg.sender, address(this)) >= cost, "Onay Eksik: Lutfen token kontratindan 'approve' verin.");

        // 3. Token'ı Tüketiciden (msg.sender) alıp Üreticiye (producer) gönder
        bool success = token.transferFrom(msg.sender, producer, cost);
        require(success, "Transfer basarisiz oldu.");

        // 4. İşlemi kaydet
        emit EnergyTransferred(msg.sender, producer, energyAmount, cost);
    }
}
