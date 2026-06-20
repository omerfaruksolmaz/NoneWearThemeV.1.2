# Üretim Aşamasında sistemi

Tema tarafı hazırlandıktan sonra Shopify Admin'de aşağıdaki kurulum bir kez yapılmalıdır.

## 1. Ürün metafield tanımları

`Ayarlar > Özel veriler > Ürünler` bölümünde:

- `custom.production_status`
  - Tür: Doğru veya yanlış
  - Üretim ürünü için: `true`
- `custom.production_stage`
  - Tür: Tam sayı
  - Değer: `1` ile `6` arasında
- `custom.production_delivery`
  - Tür: Tek satırlı metin
  - Örnek: `45-60 gün`
- `custom.production_note`
  - Tür: Çok satırlı metin
  - Ürüne özel açıklama gerekiyorsa kullanılır.

Metafield kullanılmadığında `pre-production` ürün etiketi de sistemi etkinleştirir.

## 2. Stoksuz satış ayarı

Her üretim ürünü varyantında:

1. Envanter takibini açık tutun.
2. Stok miktarını `0` yapın.
3. `Stokta olmasa bile satışa devam et` seçeneğini etkinleştirin.

Bu ayar yapılmazsa Shopify satın alma butonunu tükenmiş olarak devre dışı bırakır.

## 3. Otomatik koleksiyon

`Ürünler > Koleksiyonlar` bölümünde:

1. `Üretim Aşamasında` adlı otomatik koleksiyon oluşturun.
2. Koşul: Ürün etiketi `pre-production` değerine eşittir.
3. Tema şablonu olarak `collection.pre-production` seçin.

Metafield sistemi görünümü yönetir; `pre-production` etiketi koleksiyon otomasyonu için de kullanılmalıdır.

## 4. Menü bağlantısı

Tema düzenleyicide `Header` bölümünü açın:

1. `Pre-production collection` alanından oluşturulan koleksiyonu seçin.
2. Menü metnini `PRE-PRODUCTION` veya `ÜRETİM AŞAMASINDA` olarak belirleyin.

## 5. Aşama yönetimi

Ürün üzerindeki `custom.production_stage` değeri:

1. Tasarım Tamamlandı
2. Numune Hazırlandı
3. Üretim Planlandı
4. Üretim Sürecinde
5. Kalite Kontrol
6. Kargolama

Aşama adları Tema Düzenleyici içindeki ürün bölümü ayarlarından değiştirilebilir.
